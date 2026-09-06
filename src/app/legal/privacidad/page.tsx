import type { Metadata } from "next";
import { AvisoBorrador, Legal } from "@/components/legal";
import { EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo tratamos los datos personales que nos dejás, bajo la Ley 1581 de 2012.",
};

export default function Privacidad() {
  return (
    <Legal titulo="Política de tratamiento de datos personales">
      <AvisoBorrador />

      <h2>Responsable</h2>
      <p>
        Diego Carreño, persona natural, con domicilio en {EMPRESA.ciudad}.
        Correo de contacto: {EMPRESA.correo}. {EMPRESA.nombre} es el nombre
        bajo el que se publican estos productos; todavía no corresponde a una
        sociedad constituida. Cuando lo sea, este documento se actualiza con la
        razón social y el NIT.
      </p>

      <h2>Qué datos recogemos</h2>
      <p>
        Sólo los que nos dejás en el formulario de contacto: nombre, correo
        electrónico, el tipo de negocio que tenés y el mensaje que escribís. No
        usamos cookies de seguimiento ni perfilamiento publicitario en este
        sitio.
      </p>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Responder tu mensaje.</li>
        <li>
          Avisarte cuando un producto que marcaste como de tu interés esté
          disponible.
        </li>
        <li>Entender qué necesitan los negocios para decidir qué construir.</li>
      </ul>
      <p>
        No vendemos ni compartimos tus datos con terceros para fines
        comerciales.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Bajo la Ley 1581 de 2012 podés conocer, actualizar y rectificar tus
        datos; pedir prueba de la autorización que diste; ser informado sobre el
        uso que les damos; presentar quejas ante la Superintendencia de
        Industria y Comercio; y revocar la autorización o pedir que borremos tus
        datos cuando no exista un deber legal de conservarlos.
      </p>
      <p>
        Para ejercer cualquiera de esos derechos, escribí a {EMPRESA.correo}.
        Respondemos dentro de los términos que fija la ley.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>
        Mientras la conversación siga siendo útil para lo que la iniciaste, o
        hasta que pidas que los borremos — lo que ocurra primero. Un pedido de
        borrado no necesita justificarse.
      </p>

      <h2>Vigencia</h2>
      <p>Esta política rige desde [FECHA DE ENTRADA EN VIGENCIA].</p>
    </Legal>
  );
}
