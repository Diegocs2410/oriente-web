/* El state vive en S3, no en la máquina. Dos razones: sobrevive a un portátil
   formateado, y es lo que permite que el pipeline de GitHub aplique el mismo
   stack sin pisarse con lo que se aplique desde acá.

   `use_lockfile` es el bloqueo nativo de S3 (condicional writes). La tabla de
   DynamoDB era el método viejo — sigue apareciendo en todos los tutoriales,
   pero ya no hace falta. */
terraform {
  backend "s3" {
    bucket       = "empresa-web-tfstate-051826701427"
    key          = "sitio/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
