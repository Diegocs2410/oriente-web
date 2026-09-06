output "url" {
  value       = var.dominio == "" ? "https://${aws_cloudfront_distribution.sitio.domain_name}" : "https://${var.dominio}"
  description = "Dónde queda el sitio."
}

output "bucket" {
  value       = aws_s3_bucket.sitio.id
  description = "A dónde sincroniza el pipeline."
}

output "distribucion_id" {
  value       = aws_cloudfront_distribution.sitio.id
  description = "Para invalidar la caché en cada despliegue."
}
