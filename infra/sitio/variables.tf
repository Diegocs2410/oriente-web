variable "dominio" {
  type        = string
  default     = ""
  description = <<-TXT
    El dominio propio, cuando exista. Vacío = el sitio sale en la URL de
    CloudFront (dxxxx.cloudfront.net), que es lo que corresponde mientras el
    nombre de la empresa no esté verificado ante la SIC ni comprado.
  TXT
}

variable "certificado_arn" {
  type        = string
  default     = ""
  description = <<-TXT
    ARN del certificado de ACM. TIENE que estar en us-east-1 sin importar
    dónde viva el resto: es un requisito de CloudFront, y es la trampa que más
    tiempo hace perder la primera vez.
  TXT
}
