import Link from "next/link";
import { EscenaAgenda } from "@/components/escena-agenda";
import { IndiceProductos } from "@/components/indice-productos";
import { EMPRESA } from "@/lib/empresa";
import { obtenerProducto, listarProductos } from "@/lib/productos/datos";

/* Los seis oficios que Citaria sirve hoy con un solo motor. Es la prueba de la
   tesis de la empresa, y es verificable: cada uno tiene su pack en el código
   del producto. */
const OFICIOS_DE_CITARIA = [
  { oficio: "Barbería", quien: "barbero", cliente: "cliente", servicio: "Corte de cabello", minutos: 30 },
  { oficio: "Odontología", quien: "odontóloga", cliente: "paciente", servicio: "Endodoncia", minutos: 90 },
  { oficio: "Veterinaria", quien: "veterinario", cliente: "paciente", servicio: "Consulta general", minutos: 30 },
  { oficio: "Spa", quien: "terapeuta", cliente: "cliente", servicio: "Ritual completo", minutos: 120 },
  { oficio: "Estética", quien: "esteticista", cliente: "cliente", servicio: "Limpieza facial", minutos: 60 },
  { oficio: "Otros negocios", quien: "profesional", cliente: "cliente", servicio: "Servicio", minutos: 30 },
];

export default function Portada() {
  const citaria = obtenerProducto("citaria");
  const pendientes = listarProductos().filter((p) => p.estado !== "en-operacion");

  return (
    <>
      {/* ── Primer viewport ────────────────────────────────────────────────
          Titular y acción a la izquierda; el índice de productos a la derecha,
          donde el estado de cada uno se lee de una. */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:gap-20">
          <div>
            <h1 className="type-hero font-display text-[var(--ink)]">
              Un motor,
              <br />
              muchos oficios.
            </h1>
            <p className="mt-7 max-w-[52ch] text-lg text-[var(--body-ink)]">
              {EMPRESA.descripcion}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/productos/citaria/"
                className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-5 font-semibold text-[var(--on-accent)] no-underline shadow-[var(--shadow-soft)] hover:bg-[var(--accent-deep)] hover:text-[var(--on-accent)]"
              >
                Ver Citaria
              </Link>
              <Link
                href="/nosotros/"
                className="inline-flex min-h-11 items-center text-[var(--body-ink)] no-underline hover:text-[var(--accent)]"
              >
                Cómo trabajamos
              </Link>
            </div>
          </div>

          <div className="lg:pt-3">
            <h2 className="mb-4 text-xs font-semibold tracking-wide text-[var(--faint)] uppercase">
              Lo que construimos
            </h2>
            <IndiceProductos />
          </div>
        </div>
      </section>

      {/* ── El argumento del motor ─────────────────────────────────────────
          La versatilidad se demuestra, no se anuncia: en vez de un texto que
          diga «multi-industria», el mismo producto hablando seis idiomas. */}
      <section className="border-y border-[var(--line)] bg-[var(--raise)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <h2 className="type-section max-w-[30ch] font-display text-[var(--ink)]">
            La diferencia entre una barbería y un consultorio es configuración,
            no un producto distinto.
          </h2>
          <p className="mt-5 max-w-[62ch] text-[var(--body-ink)]">
            Es la apuesta de la casa, y Citaria ya la sostiene: seis oficios
            corriendo sobre el mismo motor de agenda. Cambia el vocabulario,
            cambian los servicios, cambian los tiempos. El motor no.
          </p>

          <dl className="mt-12 border-t border-[var(--line)]">
            {OFICIOS_DE_CITARIA.map((o) => (
              <div
                key={o.oficio}
                className="grid gap-1 border-b border-[var(--line)] py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="font-semibold text-[var(--ink)]">{o.oficio}</dt>
                <dd className="text-[var(--body-ink)]">
                  {o.servicio} · {o.minutos} min · lo atiende {o.quien === "odontóloga" ? "una" : "un"}{" "}
                  {o.quien}, y quien reserva es {o.cliente === "paciente" ? "un paciente" : "un cliente"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── El producto que sí existe ──────────────────────────────────── */}
      {citaria?.estado === "en-operacion" && (
        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[var(--accent)] uppercase">
                En operación
              </p>
              <h2 className="type-peak mt-3 font-display text-[var(--ink)]">
                {citaria.nombre}
              </h2>
              <p className="mt-5 max-w-[58ch] text-lg text-[var(--body-ink)]">
                {citaria.problema}
              </p>
              <p className="mt-4 max-w-[58ch] text-[var(--body-ink)]">
                {citaria.paraQuien}
              </p>
              <div className="mt-8">
                <Link
                  href="/productos/citaria/"
                  className="inline-flex min-h-11 items-center rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] px-5 font-semibold text-[var(--accent)] no-underline hover:bg-[var(--accent)] hover:text-[var(--on-accent)]"
                >
                  Conocer Citaria
                </Link>
              </div>
            </div>

            <EscenaAgenda producto={citaria} />
          </div>
        </section>
      )}

      {/* ── Lo que viene ───────────────────────────────────────────────────
          Deliberadamente subordinado: sin escena, sin precio, sin botón de
          compra. Tres productos que todavía no existen no pueden verse igual
          que el que sí. */}
      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <h2 className="type-section font-display text-[var(--ink)]">
            Lo que viene
          </h2>
          <p className="mt-4 max-w-[62ch] text-[var(--body-ink)]">
            Todavía no existen. Los listamos porque preferimos decir en qué
            estamos que aparentar un catálogo más grande del que tenemos.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
            {pendientes.map((p) => (
              <article key={p.slug} className="bg-[var(--canvas)] p-6">
                <h3 className="font-display text-xl leading-tight text-[var(--soft-ink)]">
                  {p.nombre}
                </h3>
                <p className="mt-3 text-sm text-[var(--body-ink)]">{p.problema}</p>
                <Link
                  href={`/productos/${p.slug}/`}
                  className="mt-5 inline-flex min-h-11 items-center text-sm text-[var(--accent)] no-underline hover:text-[var(--accent-deep)]"
                >
                  {p.estado === "en-construccion" ? "Avísame cuando esté" : "Cuéntame tu caso"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cierre ─────────────────────────────────────────────────────────
          La superficie de tinta: el único pico de la página, y va acá porque
          es donde está la única acción que importa. */}
      <section className="ink-field">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <h2 className="type-peak max-w-[18ch] font-display">
            ¿Tu oficio no está en la lista?
          </h2>
          <p className="mt-6 max-w-[58ch] text-lg text-[var(--on-ink-soft)]">
            Es la conversación que más nos sirve. Contanos cómo agendás hoy y
            qué se te cae por el camino.
          </p>
          <Link
            href="/contacto/"
            className="mt-9 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-6 font-semibold text-[var(--on-accent)] no-underline hover:opacity-90 hover:text-[var(--on-accent)]"
          >
            Escribinos
          </Link>
        </div>
      </section>
    </>
  );
}
