import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";

/* =============================================================================
   El otro lado de la cola: guarda el lead y avisa por correo.

   ORDEN DELIBERADO: primero DynamoDB, después SES. Si el correo falla, el lead
   ya está guardado y el reintento solo repite el envío. Al revés se podría
   mandar el correo y perder el registro, que es la mitad peor.

   ERRORES PARCIALES: se devuelve `batchItemFailures` con los mensajes que
   fallaron. Sin eso, un solo mensaje malo en un lote de diez hace que Lambda
   reintente los diez, y los nueve buenos se procesan dos veces.
   ============================================================================= */

const ses = new SESv2Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLA = process.env.TABLA;
const DESTINO = process.env.CORREO_DESTINO;
const REMITENTE = process.env.CORREO_REMITENTE;

const escapar = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

function cuerpoCorreo(lead) {
  const filas = [
    ["Nombre", lead.nombre],
    ["Correo", lead.correo],
    ["Negocio", lead.negocio || "(no dijo)"],
    ["Recibido", lead.recibido],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#726a65;font-size:13px">${escapar(k)}</td>` +
        `<td style="padding:6px 0;color:#332218;font-size:14px">${escapar(v)}</td></tr>`,
    )
    .join("");

  return `<div style="font-family:system-ui,sans-serif;background:#fdf3ed;padding:28px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid rgba(62,40,27,.1);border-radius:14px;padding:26px">
    <p style="margin:0 0 18px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#904400">Oriente · formulario</p>
    <table style="border-collapse:collapse;margin-bottom:18px">${filas}</table>
    <p style="margin:0 0 6px;color:#726a65;font-size:13px">Mensaje</p>
    <p style="margin:0;color:#332218;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapar(lead.mensaje)}</p>
  </div>
</div>`;
}

async function procesar(lead) {
  const id = randomUUID();

  await ddb.send(
    new PutCommand({
      TableName: TABLA,
      Item: {
        pk: `LEAD#${id}`,
        sk: lead.recibido,
        // Para poder listar por producto o por fecha más adelante sin recorrer
        // toda la tabla.
        tipo: "contacto",
        ...lead,
      },
    }),
  );

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: REMITENTE,
      Destination: { ToAddresses: [DESTINO] },
      // Responder al correo va directo a quien escribió, no a la casilla.
      ReplyToAddresses: [lead.correo],
      Content: {
        Simple: {
          Subject: { Data: `Oriente · ${lead.nombre}${lead.negocio ? ` (${lead.negocio})` : ""}` },
          Body: {
            Html: { Data: cuerpoCorreo(lead) },
            Text: {
              Data: `${lead.nombre} <${lead.correo}>\nNegocio: ${lead.negocio || "(no dijo)"}\n\n${lead.mensaje}`,
            },
          },
        },
      },
    }),
  );
}

export const handler = async (event) => {
  const fallidos = [];

  for (const registro of event.Records) {
    try {
      await procesar(JSON.parse(registro.body));
    } catch (error) {
      // Se registra el id del mensaje, nunca su contenido: el cuerpo lleva el
      // correo y el mensaje de una persona, y los registros de CloudWatch los
      // puede leer cualquiera con acceso a la cuenta.
      console.error(`fallo el mensaje ${registro.messageId}: ${error.name} ${error.message}`);
      fallidos.push({ itemIdentifier: registro.messageId });
    }
  }

  return { batchItemFailures: fallidos };
};
