import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

/* =============================================================================
   La puerta de entrada del formulario.

   Valida, encola y responde. NO manda el correo ni escribe en la base: eso lo
   hace el worker del otro lado de la cola. Así la respuesta al visitante no
   depende de que SES esté rápido —ni siquiera de que esté vivo—, y si algo
   falla el mensaje se reintenta en vez de perderse.

   Es sobre-ingeniería para un formulario de contacto, y a propósito: es el
   patrón que después se aplica donde sí importa.

   Sin dependencias: el SDK de AWS v3 ya viene en el runtime de Node de Lambda,
   así que no hay `npm install` ni paso de compilación — el .zip es este archivo.
   ============================================================================= */

const sqs = new SQSClient({});
const COLA = process.env.COLA_URL;

const LIMITES = { nombre: 100, correo: 200, negocio: 200, mensaje: 2000 };
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validar(cuerpo) {
  const errores = [];
  const limpio = {};

  for (const [campo, tope] of Object.entries(LIMITES)) {
    const valor = cuerpo?.[campo];
    const opcional = campo === "negocio";

    if (valor == null || valor === "") {
      if (!opcional) errores.push(`falta ${campo}`);
      limpio[campo] = "";
      continue;
    }
    if (typeof valor !== "string") {
      errores.push(`${campo} debe ser texto`);
      continue;
    }
    const v = valor.trim();
    if (v.length > tope) {
      errores.push(`${campo} supera ${tope} caracteres`);
      continue;
    }
    limpio[campo] = v;
  }

  if (limpio.correo && !CORREO.test(limpio.correo)) errores.push("correo inválido");

  return { errores, limpio };
}

const responder = (codigo, cuerpo) => ({
  statusCode: codigo,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(cuerpo),
});

export const handler = async (event) => {
  let cuerpo;
  try {
    cuerpo = JSON.parse(event.body ?? "{}");
  } catch {
    return responder(400, { error: "el cuerpo no es JSON" });
  }

  /* La trampa antibot vive en el formulario: un campo escondido que una persona
     no ve y no llena. Si viene con algo, se responde 202 igual — un bot que
     recibe un error aprende a evitarlo; uno que recibe éxito no vuelve. */
  if (cuerpo["sitio-web"]) return responder(202, { ok: true });

  const { errores, limpio } = validar(cuerpo);
  if (errores.length > 0) return responder(400, { error: errores.join("; ") });

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: COLA,
      MessageBody: JSON.stringify({
        ...limpio,
        recibido: new Date().toISOString(),
        /* Se guarda para poder rastrear un mensaje concreto en los registros
           cuando alguien diga «escribí y no llegó». */
        peticion: event.requestContext?.requestId ?? null,
      }),
    }),
  );

  return responder(202, { ok: true });
};
