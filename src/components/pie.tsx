import Link from "next/link";
import { EMPRESA } from "@/lib/empresa";
import { listarProductos } from "@/lib/productos/datos";

export function Pie() {
  const productos = listarProductos();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--raise)]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-2xl leading-none text-[var(--ink)]">
              {EMPRESA.nombre}
            </p>
            <p className="mt-3 text-sm text-[var(--body-ink)]">
              {EMPRESA.tesis}. {EMPRESA.ciudad}.
            </p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <nav aria-label="Productos">
              <h2 className="text-xs font-semibold tracking-wide text-[var(--faint)] uppercase">
                Productos
              </h2>
              <ul className="mt-4 flex flex-col gap-1">
                {productos.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/productos/${p.slug}/`}
                      className="flex min-h-11 items-center text-sm text-[var(--body-ink)] no-underline hover:text-[var(--accent)]"
                    >
                      {p.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal">
              <h2 className="text-xs font-semibold tracking-wide text-[var(--faint)] uppercase">
                Legal
              </h2>
              <ul className="mt-4 flex flex-col gap-1">
                <li>
                  <Link
                    href="/legal/privacidad/"
                    className="flex min-h-11 items-center text-sm text-[var(--body-ink)] no-underline hover:text-[var(--accent)]"
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/terminos/"
                    className="flex min-h-11 items-center text-sm text-[var(--body-ink)] no-underline hover:text-[var(--accent)]"
                  >
                    Términos
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <p className="mt-12 border-t border-[var(--line)] pt-6 text-xs text-[var(--faint)]">
          © {new Date().getFullYear()} {EMPRESA.nombre}. Hecho en Colombia.
        </p>
      </div>
    </footer>
  );
}
