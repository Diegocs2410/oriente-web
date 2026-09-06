import Link from "next/link";
import { listarProductos } from "@/lib/productos/datos";
import { ETIQUETA_ESTADO } from "@/lib/productos/tipos";

/* El índice va en lista con filete, no en rejilla de tarjetas: una tarjeta por
   producto pondría a los cuatro al mismo peso visual, y tres de los cuatro
   todavía no existen. Acá la jerarquía la carga el estado, no el tamaño de la
   caja. */
export function IndiceProductos() {
  const productos = listarProductos();

  return (
    <ul className="border-t border-[var(--line)]">
      {productos.map((p) => {
        const enOperacion = p.estado === "en-operacion";
        return (
          <li key={p.slug} className="border-b border-[var(--line)]">
            <Link
              href={`/productos/${p.slug}/`}
              className="group flex min-h-11 items-baseline justify-between gap-4 py-4 no-underline"
            >
              <span className="min-w-0">
                <span
                  className={`block font-display text-xl leading-tight text-balance sm:text-2xl ${
                    enOperacion ? "text-[var(--ink)]" : "text-[var(--soft-ink)]"
                  } group-hover:text-[var(--accent)]`}
                >
                  {p.nombre}
                </span>
                <span className="mt-0.5 block text-sm text-[var(--body-ink)]">
                  {p.resumen}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-2 text-xs whitespace-nowrap">
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${
                    enOperacion ? "bg-[var(--accent)]" : "bg-[var(--line-strong)]"
                  }`}
                />
                <span className={enOperacion ? "text-[var(--accent)]" : "text-[var(--faint)]"}>
                  {ETIQUETA_ESTADO[p.estado]}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
