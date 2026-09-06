import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EscenaAgenda } from "@/components/escena-agenda";
import { listarProductos, obtenerProducto } from "@/lib/productos/datos";
import { esMarcador, ETIQUETA_ESTADO } from "@/lib/productos/tipos";

/* Export estático: Next necesita saber de antemano qué páginas emitir. */
export function generateStaticParams() {
  return listarProductos().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = obtenerProducto(slug);
  if (!producto) return {};
  return { title: producto.nombre, description: producto.resumen };
}

export default async function FichaProducto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = obtenerProducto(slug);
  if (!producto) notFound();

  const enOperacion = producto.estado === "en-operacion";

  return (
    /* El matiz del producto gobierna la página entera: una variable y se
       recompone lienzo, tinta, líneas, sombras y acento.

       El `bg-[var(--canvas)]` no es decorativo: el fondo de la página lo pinta
       el `body`, que resuelve `--canvas` con el matiz de `:root` (el ocre de la
       casa). Sin declararlo acá, los acentos se repintaban con el matiz del
       producto y el lienzo se quedaba ocre — el cambio de matiz a medias, que
       se lee como un error de color y no como una decisión. */
    <div
      data-producto={producto.matiz}
      className="hue-shift bg-[var(--canvas)] text-[var(--ink)]"
    >
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:pt-20">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm text-[var(--body-ink)] no-underline hover:text-[var(--accent)]"
        >
          ← Todos los productos
        </Link>

        <p
          className={`mt-6 text-xs font-semibold tracking-wide uppercase ${
            enOperacion ? "text-[var(--accent)]" : "text-[var(--faint)]"
          }`}
        >
          {ETIQUETA_ESTADO[producto.estado]}
        </p>

        <h1 className="type-peak mt-3 font-display text-[var(--ink)]">
          {producto.nombre}
        </h1>
        <p className="mt-6 max-w-[58ch] text-lg text-[var(--body-ink)]">
          {producto.problema}
        </p>
        <p className="mt-4 max-w-[58ch] text-[var(--body-ink)]">
          <span className="text-[var(--faint)]">Para quién: </span>
          {producto.paraQuien}
        </p>

        {producto.estado === "en-operacion" && (
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {/* Un marcador sin llenar no puede salir como enlace: el `href`
                quedaría en «[DOMINIO DE CITARIA]» y el botón llevaría a un 404.
                Se dibuja apagado y con el marcador a la vista, que es lo que
                hace que alguien lo llene. */}
            {esMarcador(producto.enlace) ? (
              <span className="inline-flex min-h-11 items-center rounded-xl border border-dashed border-[var(--line-strong)] px-5 font-semibold text-[var(--faint)]">
                {producto.enlace}
              </span>
            ) : (
              <a
                href={producto.enlace}
                className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-5 font-semibold text-[var(--on-accent)] no-underline shadow-[var(--shadow-soft)] hover:bg-[var(--accent-deep)] hover:text-[var(--on-accent)]"
              >
                Ir a {producto.nombre}
              </a>
            )}
            {producto.demo && !esMarcador(producto.demo) && (
              <a
                href={producto.demo}
                className="inline-flex min-h-11 items-center text-[var(--body-ink)] no-underline hover:text-[var(--accent)]"
              >
                Ver la demo
              </a>
            )}
          </div>
        )}
      </section>

      {/* ── En operación: la prueba es el producto ─────────────────────── */}
      {producto.estado === "en-operacion" && (
        <>
          <section className="border-t border-[var(--line)] bg-[var(--raise)]">
            <div className="mx-auto max-w-6xl px-5 py-20">
              <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_1.1fr] lg:gap-16">
                <div>
                  <h2 className="type-section font-display text-[var(--ink)]">
                    Cómo se ve un día
                  </h2>
                  <p className="mt-5 max-w-[52ch] text-[var(--body-ink)]">
                    La agenda del negocio, con la altura de cada bloque igual a
                    su duración. Un servicio de 45 minutos ocupa una vez y media
                    lo que uno de 30, y los huecos se ven.
                  </p>
                </div>
                <EscenaAgenda producto={producto} />
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="type-section font-display text-[var(--ink)]">
              Qué hace hoy
            </h2>
            {/* Lista de definición con filete, no rejilla de tarjetas de
                ícono + título + texto. */}
            <dl className="mt-10 border-t border-[var(--line)]">
              {producto.capacidades.map((c) => (
                <div
                  key={c.titulo}
                  className="grid gap-2 border-b border-[var(--line)] py-6 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-8"
                >
                  <dt className="font-semibold text-[var(--ink)]">{c.titulo}</dt>
                  <dd className="max-w-[62ch] text-[var(--body-ink)]">{c.detalle}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border-t border-[var(--line)] bg-[var(--raise)]">
            <div className="mx-auto max-w-6xl px-5 py-20">
              <h2 className="type-section font-display text-[var(--ink)]">Planes</h2>
              <p className="mt-4 max-w-[62ch] text-[var(--body-ink)]">
                Sin comisión por reserva. Los precios están en pesos
                colombianos.
              </p>
              {/* Tabla de comparación, nunca tres tarjetas con pastilla de
                  «el más elegido»: lo que alguien viene a averiguar es la
                  diferencia, y en tres listas hay que restarla de memoria. */}
              <div className="mt-10 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--line-strong)]">
                      <th scope="col" className="py-3 pr-6 text-sm font-semibold text-[var(--ink)]">
                        Plan
                      </th>
                      <th scope="col" className="py-3 pr-6 text-sm font-semibold text-[var(--ink)]">
                        Precio
                      </th>
                      <th scope="col" className="py-3 text-sm font-semibold text-[var(--ink)]">
                        Incluye
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {producto.planes.map((plan) => (
                      <tr key={plan.nombre} className="border-b border-[var(--line)]">
                        <th scope="row" className="py-4 pr-6 font-semibold text-[var(--ink)]">
                          {plan.nombre}
                        </th>
                        <td className="py-4 pr-6 whitespace-nowrap text-[var(--body-ink)]">
                          {plan.precio}
                        </td>
                        <td className="py-4 text-[var(--body-ink)]">{plan.incluye}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── En construcción: qué se está haciendo, y nada más ──────────── */}
      {producto.estado === "en-construccion" && (
        <section className="border-t border-[var(--line)] bg-[var(--raise)]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="type-section font-display text-[var(--ink)]">
              Qué estamos construyendo
            </h2>
            <ul className="mt-10 max-w-[62ch] border-t border-[var(--line)]">
              {producto.construyendo.map((linea) => (
                <li
                  key={linea}
                  className="border-b border-[var(--line)] py-5 text-[var(--body-ink)]"
                >
                  {linea}
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-[62ch] text-[var(--faint)]">
              No hay fecha de salida ni precio todavía, así que no los
              inventamos. Si te dejamos el correo, te avisamos cuando haya algo
              que probar.
            </p>
          </div>
        </section>
      )}

      {/* ── En exploración: la pregunta abierta ────────────────────────── */}
      {producto.estado === "en-exploracion" && (
        <section className="border-t border-[var(--line)] bg-[var(--raise)]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="type-section font-display text-[var(--ink)]">
              Lo que todavía no sabemos
            </h2>
            <p className="mt-6 max-w-[58ch] text-lg text-[var(--body-ink)]">
              {producto.pregunta}
            </p>
            <p className="mt-6 max-w-[62ch] text-[var(--faint)]">
              Si vivís de este oficio, sos justo la persona con la que queremos
              hablar antes de escribir una línea de código.
            </p>
          </div>
        </section>
      )}

      {/* ── El cierre cambia según lo que el producto puede ofrecer ────── */}
      <section className="ink-field">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="type-peak max-w-[20ch] font-display">
            {enOperacion
              ? "Tu enlace de reservas, andando hoy"
              : "¿Este es tu problema?"}
          </h2>
          <p className="mt-6 max-w-[58ch] text-lg text-[var(--on-ink-soft)]">
            {enOperacion
              ? "Se crea la cuenta, se cargan los servicios y el enlace queda listo para compartir."
              : "Contanos cómo lo resolvés hoy. Eso decide qué construimos y en qué orden."}
          </p>
          <Link
            href="/contacto/"
            className="mt-9 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-6 font-semibold text-[var(--on-accent)] no-underline hover:opacity-90 hover:text-[var(--on-accent)]"
          >
            {enOperacion ? "Hablar con nosotros" : "Escribinos"}
          </Link>
        </div>
      </section>
    </div>
  );
}
