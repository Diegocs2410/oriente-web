/* =============================================================================
   BOOTSTRAP — se aplica UNA VEZ, a mano, con state local.

   Crea lo que todo lo demás necesita para existir: el bucket donde vive el
   state de Terraform, el presupuesto que evita la factura sorpresa, y el rol
   que GitHub Actions asume por OIDC.

   Va aparte y con state local por el problema del huevo y la gallina: el
   backend remoto no puede guardarse en un bucket que todavía no existe.

   Cómo se aplica:
     cd infra/bootstrap
     terraform init
     terraform apply -var="github_repo=TU_USUARIO/empresa-web"
   ============================================================================= */

terraform {
  required_version = ">= 1.9"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region

  # Etiquetas en todo recurso, sin repetirlas una por una. Sin esto, Cost
  # Explorer no puede responder «¿qué me está costando?».
  default_tags {
    tags = {
      Proyecto = "empresa-web"
      Gestion  = "terraform"
    }
  }
}

variable "region" {
  type        = string
  default     = "us-east-1"
  description = "Región. us-east-1 no es capricho: el certificado de ACM para CloudFront TIENE que vivir ahí."
}

variable "github_repo" {
  type        = string
  default     = ""
  description = <<-TXT
    El repo que puede desplegar, como 'usuario/repo'. Vacío = no se crea el rol
    de despliegue todavía. Un rol OIDC atado a un repo que no existe es un
    permiso colgando sin dueño, así que se crea cuando el repo exista.
  TXT
}

variable "correo_alertas" {
  type        = string
  default     = "devdiego2024@gmail.com"
  description = "A dónde llegan los avisos de presupuesto."
}

variable "tope_mensual_usd" {
  type        = number
  default     = 5
  description = "El techo. Si se pasa, algo se configuró mal."
}

# ─── El state de Terraform ───────────────────────────────────────────────────
# Versionado, porque un state corrupto sin historial es un día perdido.
resource "aws_s3_bucket" "state" {
  bucket = "empresa-web-tfstate-${data.aws_caller_identity.actual.account_id}"
}

data "aws_caller_identity" "actual" {}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── El presupuesto: la red que evita la factura sorpresa ────────────────────
# Se crea ANTES que cualquier otro recurso, a propósito.
resource "aws_budgets_budget" "tope" {
  name         = "empresa-web-tope-mensual"
  budget_type  = "COST"
  limit_amount = tostring(var.tope_mensual_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # Tres avisos: al 50% hay tiempo de mirar, al 80% de actuar, y el 100%
  # PREVISTO avisa antes de que ocurra, no después.
  dynamic "notification" {
    for_each = [
      { umbral = 50, tipo = "ACTUAL" },
      { umbral = 80, tipo = "ACTUAL" },
      { umbral = 100, tipo = "FORECASTED" },
    ]
    content {
      comparison_operator        = "GREATER_THAN"
      threshold                  = notification.value.umbral
      threshold_type             = "PERCENTAGE"
      notification_type          = notification.value.tipo
      subscriber_email_addresses = [var.correo_alertas]
    }
  }
}

# ─── OIDC para GitHub Actions ────────────────────────────────────────────────
# Cero `AWS_ACCESS_KEY_ID` en los secretos del repo: GitHub presenta un token
# firmado y AWS entrega credenciales temporales. Una llave larga filtrada sirve
# hasta que alguien la rote; este token dura minutos.
resource "aws_iam_openid_connect_provider" "github" {
  count = var.github_repo == "" ? 0 : 1

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  # AWS verifica el certificado del emisor por su cuenta desde 2023, pero el
  # campo sigue siendo obligatorio.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "confianza_github" {
  count = var.github_repo == "" ? 0 : 1

  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github[0].arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    # La condición que hace el trabajo. Sin acotarla, CUALQUIER repo de GitHub
    # podría asumir este rol. Acá se limita a este repo y a su rama principal:
    # un PR de un fork no despliega.
    #
    # POR QUÉ NO SE COMPARA CONTRA `sub`, que es lo que enseña todo tutorial.
    # GitHub ya no emite el `sub` documentado. Medido en este repo, manda:
    #
    #   repo:Diegocs2410@89321032/oriente-web@1359161488:ref:refs/heads/main
    #
    # Le pega identificadores inmutables al dueño y al repo para que el permiso
    # sobreviva a un renombrado. La consecuencia es que la comparación clásica
    # `repo:usuario/repo:ref:refs/heads/main` NO coincide, y AWS responde
    # «Not authorized to perform sts:AssumeRoleWithWebIdentity» sin decir por
    # qué. Se diagnostica imprimiendo las reclamaciones del token, no leyendo
    # la documentación.
    #
    # Y no se puede simplemente dejar de mirarlo: AWS RECHAZA una política de
    # confianza hacia GitHub que no evalúe `sub` o `job_workflow_ref` de forma
    # acotada. Es un guardarraíl propio contra las confianzas demasiado anchas,
    # y es correcto — sin él sería fácil dejar entrar a todo GitHub.
    #
    # Entonces se hacen las dos cosas. El comodín va sólo donde están los
    # identificadores; el nombre del dueño queda fijo antes de la arroba, para
    # que `Diegocs2410@*` no pueda coincidir con otro usuario parecido.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${split("/", var.github_repo)[0]}@*/${split("/", var.github_repo)[1]}@*:ref:refs/heads/main"]
    }

    # Y estas dos son las que de verdad acotan, en texto legible.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:repository"
      values   = [var.github_repo]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:ref"
      values   = ["refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "despliegue" {
  count = var.github_repo == "" ? 0 : 1

  name               = "empresa-web-despliegue"
  assume_role_policy = data.aws_iam_policy_document.confianza_github[0].json
}

# Permisos amplios a propósito EN ESTA FASE: el pipeline corre `terraform
# apply`, así que necesita crear lo que el stack declare. Acotarlo a los
# servicios que se usan es trabajo de la fase siguiente, cuando se sepa cuáles
# son. Está anotado para que no se olvide.
resource "aws_iam_role_policy_attachment" "despliegue" {
  count = var.github_repo == "" ? 0 : 1

  role       = aws_iam_role.despliegue[0].name
  policy_arn = "arn:aws:iam::aws:policy/PowerUserAccess"
}

resource "aws_iam_role_policy" "despliegue_iam" {
  count = var.github_repo == "" ? 0 : 1

  name = "gestionar-roles-del-stack"
  role = aws_iam_role.despliegue[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["iam:*Role*", "iam:*Policy*", "iam:PassRole", "iam:TagRole"]
      Resource = "*"
    }]
  })
}

output "bucket_state" {
  value       = aws_s3_bucket.state.id
  description = "Ponelo en infra/sitio/backend.tf"
}

output "rol_despliegue" {
  value       = var.github_repo == "" ? "(sin crear: falta el repo de GitHub)" : aws_iam_role.despliegue[0].arn
  description = "Ponelo como variable AWS_ROLE_ARN en el repo de GitHub."
}
