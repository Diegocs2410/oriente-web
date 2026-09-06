import type { ReactNode } from "react";

/** Marca lo que todavía no es un documento legal de verdad. Se quita cuando un
 *  abogado revise el texto y se llenen los corchetes — no antes. */
export function AvisoBorrador() {
  return (
    <div className="not-prose mb-10 rounded-xl border border-[var(--line-strong)] bg-[var(--secondary)] p-5">
      <p className="text-sm text-[var(--body-ink)]">
        <strong className="text-[var(--ink)]">Borrador sin revisión legal.</strong>{" "}
        Este texto es una base de trabajo: los datos entre corchetes están sin
        llenar y el documento no ha pasado por un abogado. No publicar el sitio
        con este aviso puesto.
      </p>
    </div>
  );
}

export function Legal({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-16 pb-24 sm:pt-24">
      <h1 className="type-section font-display text-[var(--ink)]">{titulo}</h1>
      <div
        className="mt-10 flex flex-col gap-5 text-[var(--body-ink)]
          [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--ink)]
          [&_li]:ml-5 [&_li]:list-disc
          [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2"
      >
        {children}
      </div>
    </section>
  );
}
