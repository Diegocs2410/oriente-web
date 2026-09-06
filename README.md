# Oriente

Sitio de **Oriente**, una casa de software colombiana que construye y opera
productos para negocios de servicios. Next.js exportado como HTML estático,
servido desde S3 detrás de CloudFront, con toda la infraestructura en Terraform.

En vivo: https://d254xrvsonts48.cloudfront.net

---

## Por qué está construido así

**El sitio no necesita un servidor encendido.** Son cinco páginas iguales para
todo el que entre: sin login, sin datos por visitante, nada que consultar en el
momento. Si el resultado son archivos, lo que hace falta es dónde guardarlos y
una red que los reparta — no una máquina que los genere una y otra vez.

De ahí salen las tres decisiones que definen el repo:

**S3 + CloudFront en vez de una máquina virtual.** Una `t3.micro` cuesta unos
$8–9 al mes encendida, con visitas o sin ellas, y te vuelve el administrador del
sistema: parches, SSH, TLS, reinicios. Esto cuesta prácticamente cero, se sirve
desde el punto más cercano al visitante, y no hay una sola máquina que pueda
tumbarlo. Lo que se pierde es código de servidor — por eso los formularios van
a una API aparte.

**El bucket es privado.** CloudFront lo lee por *Origin Access Control*, y la
política del bucket acota el permiso a esa única distribución. El atajo común
—bucket público con «static website hosting»— funciona igual y expone el origen.

```
Route 53 → CloudFront (OAC) → S3 privado
              ↑
         ACM en us-east-1
```

**Dos variables de color, no una.** `src/app/globals.css` deriva toda la paleta
de `--hue` y `--chroma`. El croma es una segunda variable porque, medido, el
mismo valor no entra en gama sRGB en todos los matices: el techo del ocre es
0.123 y el del azul clínico 0.082. Fijar uno solo hace que el navegador recorte
el color y los matices dejen de ser la misma familia. Los valores no se ajustan
a ojo — se recalculan.

---

## Estructura

```
src/
  app/                    las cinco páginas
  components/             maqueta
  lib/productos/          el catálogo, como datos tipados
infra/
  bootstrap/              state, presupuesto y rol de despliegue (state local)
  sitio/                  S3 + CloudFront (state remoto)
diseno/                   maquetas .dc.html del rediseño
```

**El estado de cada producto es un tipo, no una convención.**
`src/lib/productos/tipos.ts` es una unión discriminada: un producto
`en-construccion` **no puede** declarar planes ni enlace — el compilador lo
rechaza. De cuatro productos hoy solo uno existe, y la regla de no anunciar lo
que no hay deja de depender de que alguien se acuerde.

## Correr el proyecto

```bash
npm install
npm run dev          # http://localhost:3200
npm run build        # exporta a out/
```

## La infraestructura

```bash
cd infra/sitio
terraform init
terraform plan       # qué cambiaría, sin cambiar nada
```

El `bootstrap/` se aplicó una vez a mano y crea el bucket del state, el
presupuesto con alertas y el rol que GitHub Actions asume por OIDC. Ese rol es
la razón de que este repo **no tenga ninguna llave de AWS**: GitHub presenta un
token firmado y AWS devuelve credenciales temporales, acotadas a este
repositorio y a la rama `main`.

### Lo que deliberadamente no se usa

NAT Gateway (~$32/mes solo por existir), balanceadores y RDS encendido son las
tres causas habituales de la factura sorpresa: cobran por hora, no por uso. Las
Lambdas van fuera de VPC; cuando haga falta red, se usan *Gateway endpoints* de
S3 y DynamoDB, que son gratis.

## Estado

En construcción, y el sitio lo dice: de los cuatro productos del catálogo solo
**Citaria** está en operación. Las páginas legales son borradores sin revisión
de abogado y lo advierten en pantalla.
