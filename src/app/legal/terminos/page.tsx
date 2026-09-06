import type { Metadata } from "next";
import { AvisoBorrador, Legal } from "@/components/legal";
import { EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Las condiciones de uso de este sitio.",
};

export default function Terminos() {
  return (
    <Legal titulo="Términos de uso del sitio">
      <AvisoBorrador />

      <p>
        Estos términos cubren <strong>este sitio</strong> y nada más. Cada
        producto de {EMPRESA.nombre} tiene sus propios términos y su propia
        política de datos, que se aceptan al crear una cuenta en él.
      </p>

      <h2>Qué es este sitio</h2>
      <p>
        Un sitio informativo. Acá no se contrata ningún servicio ni se procesa
        ningún pago: sólo describimos lo que construimos y ofrecemos una forma
        de escribirnos.
      </p>

      <h2>Sobre lo que decimos de los productos</h2>
      <p>
        Los productos marcados como <em>en construcción</em> o{" "}
        <em>en exploración</em> no existen todavía. Lo que decimos de ellos es
        una intención, no una oferta comercial, y puede cambiar o no llegar a
        construirse. Los precios de los productos en operación son los vigentes
        al momento de publicarse y pueden cambiar; el precio que rige es el que
        aparece dentro del producto al momento de contratar.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        El contenido de este sitio pertenece a Diego Carreño. Las marcas de
        terceros que se mencionen pertenecen a sus titulares.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Hacemos lo razonable para que la información esté correcta y al día,
        pero el sitio se ofrece «tal cual». [CLÁUSULA DE LIMITACIÓN DE
        RESPONSABILIDAD — REDACTAR CON ABOGADO].
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por la ley colombiana. Cualquier controversia se
        resolverá ante los jueces competentes de Rionegro, Antioquia.
      </p>

      <h2>Contacto</h2>
      <p>Para cualquier duda sobre estos términos: {EMPRESA.correo}.</p>

      <h2>Vigencia</h2>
      <p>Estos términos rigen desde [FECHA DE ENTRADA EN VIGENCIA].</p>
    </Legal>
  );
}
