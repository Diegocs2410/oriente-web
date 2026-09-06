"use client";

import { useState } from "react";
import { EMPRESA } from "@/lib/empresa";

/* El sitio es estático, así que no hay server action ni route handler: el
   formulario habla con la API de AWS (API Gateway → Lambda → SQS → worker).
   Mientras esa API no exista, `NEXT_PUBLIC_API_CONTACTO` va vacío y el
   formulario lo dice en vez de fingir que envió. */
const ENDPOINT = process.env.NEXT_PUBLIC_API_CONTACTO ?? "";

type Estado = "listo" | "enviando" | "enviado" | "error" | "sin-api";

export function Formulario() {
  const [estado, setEstado] = useState<Estado>("listo");
  const [mensajeError, setMensajeError] = useState("");

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);

    /* Trampa antibot: un campo que una persona no ve y no llena. Sale gratis,
       a diferencia del WAF de AWS, que cuesta más que todo el resto junto. */
    if (datos.get("sitio-web")) return;

    if (!ENDPOINT) {
      setEstado("sin-api");
      return;
    }

    setEstado("enviando");
    try {
      const respuesta = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          correo: datos.get("correo"),
          negocio: datos.get("negocio"),
          mensaje: datos.get("mensaje"),
        }),
      });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      setEstado("enviado");
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : "Error desconocido");
      setEstado("error");
    }
  }

  if (estado === "enviado") {
    return (
      <div className="rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)] p-8">
        <p className="font-display text-2xl text-[var(--ink)]">Listo, llegó.</p>
        <p className="mt-3 text-[var(--body-ink)]">
          Te respondemos al correo que dejaste.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="flex flex-col gap-5">
        <Campo id="nombre" etiqueta="Tu nombre" autoComplete="name" />
        <Campo id="correo" etiqueta="Tu correo" tipo="email" autoComplete="email" />
        <Campo
          id="negocio"
          etiqueta="Qué negocio tenés"
          ayuda="Barbería, consultorio, hotel, lo que sea."
          requerido={false}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="mensaje" className="text-sm font-semibold text-[var(--ink)]">
            Cómo agendás hoy
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            required
            rows={5}
            maxLength={2000}
            className="rounded-xl border border-[var(--line-strong)] bg-[var(--raise)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Fuera de pantalla, no `display:none`: algunos bots detectan el
            segundo y no el primero. */}
        <div className="absolute left-[-9999px]" aria-hidden>
          <label htmlFor="sitio-web">No llenar este campo</label>
          <input id="sitio-web" name="sitio-web" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={estado === "enviando"}
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-6 font-semibold text-[var(--on-accent)] shadow-[var(--shadow-soft)] hover:bg-[var(--accent-deep)] disabled:opacity-60"
        >
          {estado === "enviando" ? "Enviando…" : "Enviar"}
        </button>

        {estado === "sin-api" && (
          <p role="status" className="text-sm text-[var(--body-ink)]">
            El envío automático todavía no está conectado. Escribinos directo a{" "}
            <span className="font-semibold text-[var(--ink)]">{EMPRESA.correo}</span>.
          </p>
        )}
        {estado === "error" && (
          <p role="alert" className="text-sm text-[var(--body-ink)]">
            No se pudo enviar ({mensajeError}). Escribinos a{" "}
            <span className="font-semibold text-[var(--ink)]">{EMPRESA.correo}</span>.
          </p>
        )}
      </div>
    </form>
  );
}

function Campo({
  id,
  etiqueta,
  tipo = "text",
  ayuda,
  requerido = true,
  autoComplete,
}: {
  id: string;
  etiqueta: string;
  tipo?: string;
  ayuda?: string;
  requerido?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--ink)]">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        required={requerido}
        autoComplete={autoComplete}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className="min-h-11 rounded-xl border border-[var(--line-strong)] bg-[var(--raise)] px-4 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-sm text-[var(--faint)]">
          {ayuda}
        </p>
      )}
    </div>
  );
}
