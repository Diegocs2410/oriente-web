import Link from "next/link";
import { EMPRESA, NAVEGACION } from "@/lib/empresa";

export function Barra() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--canvas)]/85 backdrop-blur-md">
      {/* El backdrop-blur acá es funcional, no decorativo: hay contenido
          pasando por debajo. */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="font-display text-2xl leading-none tracking-tight text-[var(--ink)] no-underline"
        >
          {EMPRESA.nombre}
        </Link>

        <nav aria-label="Principal">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAVEGACION.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm text-[var(--body-ink)] no-underline hover:bg-[var(--secondary)] hover:text-[var(--ink)]"
                >
                  {item.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
