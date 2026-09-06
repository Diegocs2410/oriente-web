/* =============================================================================
   EL SITIO — S3 privado + CloudFront.

   El bucket NO es un sitio web público de S3. Es privado, y sólo CloudFront
   puede leerlo, a través de un Origin Access Control. El anti-patrón —bucket
   público con «static website hosting»— funciona igual y está mal: expone el
   origen, se salta la caché y no permite HTTPS propio.

   Sin dominio propio todavía: el sitio sale en la URL de CloudFront
   (dxxxx.cloudfront.net). Cuando haya dominio, se llena `var.dominio` y se
   agrega el certificado — el resto no cambia.
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
  region = "us-east-1"
  default_tags {
    tags = {
      Proyecto = "empresa-web"
      Ambiente = "prod"
      Gestion  = "terraform"
    }
  }
}

data "aws_caller_identity" "actual" {}

# ─── El origen ───────────────────────────────────────────────────────────────
resource "aws_s3_bucket" "sitio" {
  bucket = "empresa-web-sitio-${data.aws_caller_identity.actual.account_id}"
}

resource "aws_s3_bucket_public_access_block" "sitio" {
  bucket                  = aws_s3_bucket.sitio.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sitio" {
  bucket = aws_s3_bucket.sitio.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ─── OAC: cómo CloudFront lee un bucket privado ──────────────────────────────
resource "aws_cloudfront_origin_access_control" "sitio" {
  name                              = "empresa-web-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# La política le abre el bucket a CloudFront y a nadie más. El `SourceArn`
# acota a ESTA distribución: sin esa condición, cualquier distribución de
# cualquier cuenta de AWS podría leer el bucket.
data "aws_iam_policy_document" "sitio" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.sitio.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.sitio.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "sitio" {
  bucket = aws_s3_bucket.sitio.id
  policy = data.aws_iam_policy_document.sitio.json
}

/* ─── La función que hace funcionar el export estático ───────────────────────
   `trailingSlash: true` emite `nosotros/index.html`. El navegador pide
   `/nosotros/`, que en S3 es una clave que NO EXISTE — `default_root_object`
   sólo resuelve la raíz, no los subdirectorios. Sin esto el sitio da 403 en
   todas las páginas menos la portada, y sólo se descubre en producción.

   Una CloudFront Function corre en el borde, cuesta una fracción de lo que
   cuesta Lambda@Edge y sobra para reescribir una URL. */
resource "aws_cloudfront_function" "reescribir" {
  name    = "empresa-web-reescribir-indices"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-JS
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
      } else if (!uri.includes('.')) {
        request.uri = uri + '/index.html';
      }
      return request;
    }
  JS
}

# ─── Cabeceras de seguridad ──────────────────────────────────────────────────
resource "aws_cloudfront_response_headers_policy" "seguridad" {
  name = "empresa-web-seguridad"

  security_headers_config {
    content_type_options { override = true }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = true
    }
    content_security_policy {
      # Google Fonts es el único host externo que el sitio necesita.
      # `connect-src` incluye la API de formularios cuando exista.
      content_security_policy = join("; ", [
        "default-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        "script-src 'self'",
        "connect-src 'self'${var.origen_api == "" ? "" : " ${var.origen_api}"}",
        "frame-ancestors 'none'",
      ])
      override = true
    }
  }
}

# ─── La distribución ─────────────────────────────────────────────────────────
resource "aws_cloudfront_distribution" "sitio" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "empresa-web"
  price_class         = "PriceClass_100" # Norteamérica y Europa: lo barato alcanza.

  aliases = var.dominio == "" ? [] : [var.dominio]

  origin {
    domain_name              = aws_s3_bucket.sitio.bucket_regional_domain_name
    origin_id                = "s3-sitio"
    origin_access_control_id = aws_cloudfront_origin_access_control.sitio.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-sitio"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Políticas gestionadas por AWS: CachingOptimized.
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.seguridad.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.reescribir.arn
    }
  }

  # Los archivos con hash en el nombre son inmutables: se cachean un año.
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "s3-sitio"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/404.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    # Sin dominio propio se usa el certificado de *.cloudfront.net.
    cloudfront_default_certificate = var.dominio == ""
    acm_certificate_arn            = var.dominio == "" ? null : var.certificado_arn
    ssl_support_method             = var.dominio == "" ? null : "sni-only"
    minimum_protocol_version       = var.dominio == "" ? null : "TLSv1.2_2021"
  }
}
