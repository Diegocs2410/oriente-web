/* =============================================================================
   LA API DE FORMULARIOS

     POST /contacto -> API Gateway -> Lambda ingreso -> SQS -> Lambda worker
                                                         |         |
                                                        DLQ    SES + DynamoDB

   Va en el MISMO stack que el sitio a propósito: la CSP del sitio necesita
   autorizar el origen de la API, y la API necesita autorizar el origen del
   sitio en CORS. En stacks separados eso sería una dependencia circular
   resuelta a mano; acá Terraform lo ordena solo.
   ============================================================================= */

/* Rompe un ciclo real: la CSP del sitio autoriza el origen de la API, y el
   CORS de la API autoriza el origen del sitio. Si las dos se referencian entre
   sí, Terraform detecta una dependencia circular y no aplica nada.

   Se corta acá porque el sitio ya existe y su dominio es estable, mientras que
   la API se está creando ahora. Cuando haya dominio propio, se cambia este
   valor y se vuelve a aplicar. */
variable "origen_sitio" {
  type        = string
  default     = "https://d254xrvsonts48.cloudfront.net"
  description = "Origen que puede llamar a la API desde un navegador."
}

variable "correo_contacto" {
  type        = string
  default     = "devdiego2024@gmail.com"
  description = "A dónde llegan los mensajes del formulario. SES exige verificarlo."
}

# ─── La cola y su red de seguridad ───────────────────────────────────────────
# La DLQ va primero: la cola principal la referencia, y una cola sin DLQ pierde
# los mensajes que fallan en silencio.
resource "aws_sqs_queue" "leads_dlq" {
  name                      = "oriente-leads-dlq"
  message_retention_seconds = 1209600 # 14 días, el máximo. Es tiempo para mirar.
}

resource "aws_sqs_queue" "leads" {
  name = "oriente-leads"

  # Cuánto tiempo el mensaje queda invisible mientras el worker lo procesa.
  # Regla: al menos 6 veces el timeout de la Lambda, o el mismo mensaje se
  # entrega dos veces mientras el primer intento sigue corriendo.
  visibility_timeout_seconds = 180

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.leads_dlq.arn
    # Tres intentos. Si un mensaje falla tres veces no es un problema pasajero:
    # reintentar para siempre solo esconde el error y quema invocaciones.
    maxReceiveCount = 3
  })
}

# ─── Dónde queda el lead ─────────────────────────────────────────────────────
resource "aws_dynamodb_table" "leads" {
  name      = "oriente-leads"
  hash_key  = "pk"
  range_key = "sk"

  # PROVISIONED con 1/1 y no bajo demanda: el free tier perpetuo cubre 25
  # unidades de lectura y escritura, así que esto no cuesta nada. Bajo demanda
  # es más moderno y más simple, pero cobra por petición desde la primera.
  # A este volumen la diferencia son centavos; la razón de elegirlo es que
  # obliga a entender qué es una unidad de capacidad.
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# ─── SES ─────────────────────────────────────────────────────────────────────
# Arranca en sandbox: sólo envía a direcciones verificadas, y verificar exige
# hacer clic en un correo que AWS manda. Salir del sandbox es una solicitud
# aparte que tarda ~24 h — hace falta el día que el formulario le escriba a
# alguien que no seas vos.
resource "aws_sesv2_email_identity" "contacto" {
  email_identity = var.correo_contacto
}

# ─── Permisos ────────────────────────────────────────────────────────────────
data "aws_iam_policy_document" "confianza_lambda" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ingreso" {
  name               = "oriente-ingreso"
  assume_role_policy = data.aws_iam_policy_document.confianza_lambda.json
}

resource "aws_iam_role" "worker" {
  name               = "oriente-worker"
  assume_role_policy = data.aws_iam_policy_document.confianza_lambda.json
}

# Cada rol recibe SÓLO lo suyo y sobre SU recurso, no sobre `*`. El de ingreso
# puede encolar y nada más: si alguien encontrara cómo ejecutar código ahí, no
# podría leer la base ni mandar correos.
resource "aws_iam_role_policy" "ingreso" {
  name = "encolar"
  role = aws_iam_role.ingreso.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sqs:SendMessage"]
      Resource = aws_sqs_queue.leads.arn
    }]
  })
}

resource "aws_iam_role_policy" "worker" {
  name = "consumir-guardar-enviar"
  role = aws_iam_role.worker.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.leads.arn
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem"]
        Resource = aws_dynamodb_table.leads.arn
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail"]
        Resource = "*"
      },
    ]
  })
}

# Los registros: sin esto la Lambda corre pero no deja rastro de nada.
resource "aws_iam_role_policy_attachment" "ingreso_logs" {
  role       = aws_iam_role.ingreso.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "worker_logs" {
  role       = aws_iam_role.worker.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ─── Las funciones ───────────────────────────────────────────────────────────
data "archive_file" "ingreso" {
  type        = "zip"
  source_file = "${path.module}/../../services/ingreso/index.mjs"
  output_path = "${path.module}/.build/ingreso.zip"
}

data "archive_file" "worker" {
  type        = "zip"
  source_file = "${path.module}/../../services/worker/index.mjs"
  output_path = "${path.module}/.build/worker.zip"
}

resource "aws_lambda_function" "ingreso" {
  function_name = "oriente-ingreso"
  role          = aws_iam_role.ingreso.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 10
  memory_size   = 256

  filename         = data.archive_file.ingreso.output_path
  source_code_hash = data.archive_file.ingreso.output_base64sha256

  environment {
    variables = { COLA_URL = aws_sqs_queue.leads.url }
  }
}

resource "aws_lambda_function" "worker" {
  function_name = "oriente-worker"
  role          = aws_iam_role.worker.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.worker.output_path
  source_code_hash = data.archive_file.worker.output_base64sha256

  environment {
    variables = {
      TABLA            = aws_dynamodb_table.leads.name
      CORREO_DESTINO   = var.correo_contacto
      CORREO_REMITENTE = var.correo_contacto
    }
  }
}

# Retención explícita en los dos grupos. El valor por defecto es «para siempre»,
# y CloudWatch Logs sin retención es la segunda factura sorpresa más común.
resource "aws_cloudwatch_log_group" "ingreso" {
  name              = "/aws/lambda/${aws_lambda_function.ingreso.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/aws/lambda/${aws_lambda_function.worker.function_name}"
  retention_in_days = 14
}

# La cola alimenta al worker. `function_response_types` es lo que habilita el
# reporte de fallos parciales que devuelve el handler.
resource "aws_lambda_event_source_mapping" "cola_worker" {
  event_source_arn                   = aws_sqs_queue.leads.arn
  function_name                      = aws_lambda_function.worker.arn
  batch_size                         = 10
  maximum_batching_window_in_seconds = 5
  function_response_types            = ["ReportBatchItemFailures"]
}

# ─── La puerta ───────────────────────────────────────────────────────────────
resource "aws_apigatewayv2_api" "formularios" {
  name          = "oriente-formularios"
  protocol_type = "HTTP"

  # Sólo el sitio puede llamar a esta API desde un navegador.
  cors_configuration {
    allow_origins = [var.origen_sitio]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "ingreso" {
  api_id                 = aws_apigatewayv2_api.formularios.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.ingreso.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "contacto" {
  api_id    = aws_apigatewayv2_api.formularios.id
  route_key = "POST /contacto"
  target    = "integrations/${aws_apigatewayv2_integration.ingreso.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.formularios.id
  name        = "$default"
  auto_deploy = true

  # El antibot barato. WAF cuesta $5/mes sólo por existir — más que todo el
  # resto junto. Esto no para a un atacante decidido, pero sí evita que un
  # script tonto queme el free tier.
  default_route_settings {
    throttling_rate_limit  = 5
    throttling_burst_limit = 10
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId = "$context.requestId"
      ruta      = "$context.routeKey"
      estado    = "$context.status"
      latencia  = "$context.responseLatency"
      error     = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/oriente-formularios"
  retention_in_days = 14
}

resource "aws_lambda_permission" "api_invoca" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingreso.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.formularios.execution_arn}/*/*"
}

# ─── Que alguien se entere cuando algo falle ─────────────────────────────────
resource "aws_sns_topic" "alertas" {
  name = "oriente-alertas"
}

resource "aws_sns_topic_subscription" "alertas_correo" {
  topic_arn = aws_sns_topic.alertas.arn
  protocol  = "email"
  endpoint  = var.correo_contacto
}

# Un mensaje en la DLQ significa que un lead falló tres veces. Eso es alguien
# que escribió y a quien nadie va a responder: la alarma que más importa.
resource "aws_cloudwatch_metric_alarm" "dlq_con_mensajes" {
  alarm_name          = "oriente-dlq-con-mensajes"
  alarm_description   = "Un lead falló 3 veces y quedó en la cola de descartes."
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  dimensions          = { QueueName = aws_sqs_queue.leads_dlq.name }
  statistic           = "Maximum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alertas.arn]
}

resource "aws_cloudwatch_metric_alarm" "worker_con_errores" {
  alarm_name          = "oriente-worker-con-errores"
  alarm_description   = "El worker está fallando."
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  dimensions          = { FunctionName = aws_lambda_function.worker.function_name }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alertas.arn]
}

output "api_contacto" {
  value       = "${aws_apigatewayv2_api.formularios.api_endpoint}/contacto"
  description = "Va en NEXT_PUBLIC_API_CONTACTO al compilar el sitio."
}
