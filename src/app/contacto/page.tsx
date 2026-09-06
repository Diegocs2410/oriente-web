import type { Metadata } from "next";
import { Formulario } from "@/components/formulario";
import { EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contanos qué negocio tenés y cómo agendás hoy.",
};

export default function Contacto() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:pt-24">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_1.1fr] lg:gap-20">
        <div>
          <h1 className="type-peak max-w-[14ch] font-display text-[var(--ink)]">
            Hablemos
          </h1>
          <p className="mt-7 max-w-[48ch] text-lg text-[var(--body-ink)]">
            Lo que más nos sirve saber es cómo agendás hoy y qué se te cae por
            el camino. De ahí sale lo que construimos.
          </p>

          <dl className="mt-10 border-t border-[var(--line)]">
            <div className="grid gap-1 border-b border-[var(--line)] py-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <dt className="text-sm text-[var(--faint)]">Correo</dt>
              <dd className="text-[var(--body-ink)]">{EMPRESA.correo}</dd>
            </div>
            <div className="grid gap-1 border-b border-[var(--line)] py-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <dt className="text-sm text-[var(--faint)]">Dónde</dt>
              <dd className="text-[var(--body-ink)]">{EMPRESA.ciudad}</dd>
            </div>
          </dl>
        </div>

        <Formulario />
      </div>
    </section>
  );
}
