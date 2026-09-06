import type { ProductoEnOperacion } from "@/lib/productos/tipos";

/* =============================================================================
   La prueba es el producto.

   Esto no es una captura de pantalla ni un mockup de portátil flotando: es la
   agenda compuesta en DOM con los tokens del sistema. Pesa kilobytes, se lee
   nítida en cualquier densidad, un lector de pantalla la recorre, y se repinta
   sola cuando cambia el matiz del producto.

   Y la altura de cada bloque ES su duración: un servicio de 45 minutos ocupa
   una vez y media lo que uno de 30. No es decoración — es el argumento.
   ============================================================================= */

const PX_POR_MINUTO = 1.6;

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function duracionEnMinutos(duracion: string): number {
  return Number.parseInt(duracion, 10);
}

export function EscenaAgenda({ producto }: { producto: ProductoEnOperacion }) {
  const citas = producto.escena;
  if (citas.length === 0) return null;

  const inicio = Math.min(...citas.map((c) => aMinutos(c.hora)));
  const fin = Math.max(
    ...citas.map((c) => aMinutos(c.hora) + duracionEnMinutos(c.duracion)),
  );
  const alto = (fin - inicio) * PX_POR_MINUTO;

  const columnas = [...new Set(citas.map((c) => c.quien))];

  // Marcas de hora en punto, para que el riel se lea como un reloj.
  const marcas: number[] = [];
  for (let m = Math.ceil(inicio / 60) * 60; m <= fin; m += 60) marcas.push(m);

  return (
    <figure
      className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]"
      data-producto={producto.matiz}
    >
      <figcaption className="mb-5 flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-[var(--ink)]">
          Un martes cualquiera
        </span>
        <span className="text-xs text-[var(--faint)]">
          {citas.length} citas · la altura es la duración
        </span>
      </figcaption>

      <div className="flex gap-3">
        {/* Riel de horas */}
        <div className="relative w-12 shrink-0" style={{ height: alto }}>
          {marcas.map((m) => (
            <span
              key={m}
              className="absolute right-0 -translate-y-1/2 text-xs tabular-nums text-[var(--faint)]"
              style={{ top: (m - inicio) * PX_POR_MINUTO }}
            >
              {String(Math.floor(m / 60)).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {/* Una columna por profesional */}
        <div className="grid flex-1 gap-3" style={{ gridTemplateColumns: `repeat(${columnas.length}, minmax(0, 1fr))` }}>
          {columnas.map((quien) => (
            <div key={quien}>
              <p className="mb-2 truncate text-xs font-semibold text-[var(--soft-ink)]">
                {quien}
              </p>
              <div
                className="relative rounded-lg border border-[var(--line)] bg-[var(--secondary)]"
                style={{ height: alto }}
              >
                {marcas.map((m) => (
                  <span
                    key={m}
                    aria-hidden
                    className="absolute inset-x-0 border-t border-[var(--line)]"
                    style={{ top: (m - inicio) * PX_POR_MINUTO }}
                  />
                ))}

                {citas
                  .filter((c) => c.quien === quien)
                  .map((c) => (
                    <div
                      key={`${c.quien}-${c.hora}`}
                      className="absolute inset-x-1 overflow-hidden rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] px-2 py-1"
                      style={{
                        top: (aMinutos(c.hora) - inicio) * PX_POR_MINUTO,
                        height: duracionEnMinutos(c.duracion) * PX_POR_MINUTO - 2,
                      }}
                    >
                      <p className="truncate text-xs font-semibold text-[var(--ink)]">
                        {c.servicio}
                      </p>
                      <p className="truncate text-xs text-[var(--soft-ink)]">
                        {c.hora} · {c.duracion}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
