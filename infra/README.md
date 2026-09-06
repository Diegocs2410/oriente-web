# Infraestructura

AWS con Terraform, dentro del free tier. Dos stacks con state separado, a
propósito: un `destroy` distraído en los laboratorios no puede llevarse el
sitio.

```
bootstrap/   state local — se aplica UNA vez, a mano
sitio/       state remoto — S3 + CloudFront, lo despliega CI
```

## Orden de arranque

**1. La cuenta, antes de Terraform.** MFA en la cuenta raíz, guardarla y no
volver a usarla. Usuario de trabajo por IAM Identity Center, nunca un usuario
IAM con llaves largas.

**2. Bootstrap.** Crea el bucket del state, el presupuesto y el rol de OIDC.

```bash
cd infra/bootstrap
terraform init
terraform apply -var="github_repo=USUARIO/empresa-web" -var="correo_alertas=TU@CORREO"
```

Anotá las dos salidas: `bucket_state` y `rol_despliegue`.

**3. Conectar el backend.** Creá `infra/sitio/backend.tf` con el bucket que
salió arriba:

```hcl
terraform {
  backend "s3" {
    bucket       = "empresa-web-tfstate-XXXXXXXXXXXX"
    key          = "sitio/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

`use_lockfile` es el bloqueo nativo de S3. La tabla de DynamoDB era el método
viejo — conviene conocerlo porque aparece en todos los tutoriales, pero ya no
hace falta.

**4. El sitio.**

```bash
cd infra/sitio
terraform init
terraform apply
```

La salida `url` es la dirección de CloudFront. Ahí vive el sitio hasta que
haya dominio propio.

**5. GitHub.** En el repo, `Settings → Secrets and variables → Actions →
Variables`, creá `AWS_ROLE_ARN` con el `rol_despliegue`. No es un secreto: es
un ARN, y sin el token OIDC de ese repo no sirve de nada.

## Lo que NO se crea, y por qué

Estas tres cosas cobran **por hora encendidas**, no por uso, y son la causa
número uno de la factura sorpresa del que está aprendiendo:

| | Costo | |
|---|---|---|
| NAT Gateway | ~$32/mes | Cobra por existir aunque no pase un byte |
| ALB / NLB | ~$16/mes | Igual |
| RDS 24/7 | ~$12–15/mes | Y su free tier dura 12 meses, no siempre |

Por eso las Lambdas van **fuera de VPC**. Cuando haga falta VPC, se usan
*Gateway endpoints* de S3 y DynamoDB, que son gratis — los *Interface*
endpoints cuestan ~$7/mes cada uno, y confundirlos sale caro.

VPC, RDS y ALB se aprenden en `labs/`: se levantan en la mañana y se destruyen
en la noche. La VPC en sí es gratis (subredes, tablas de ruteo, IGW, security
groups); un ALB tres horas cuesta unos siete centavos.

## Antes de dimensionar nada

Mirá en **Billing → Free tier** en qué modelo está tu cuenta. AWS cambió el
esquema a mediados de 2025 para cuentas nuevas: las viejas tienen asignaciones
perpetuas por servicio más doce meses de extras, las nuevas funcionan con
créditos y ventana de tiempo. Cambia toda la aritmética.

## Costo esperado

Sin dominio propio, prácticamente **$0**: CloudFront, Lambda, SQS y DynamoDB
caben en el free tier, y S3 más CloudWatch son centavos. Con dominio, la zona
alojada de Route 53 cuesta **$0.50/mes**.
