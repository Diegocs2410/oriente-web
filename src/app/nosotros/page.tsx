import type { Metadata } from "next";
import Link from "next/link";
import { EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Cómo construimos: un motor compartido, el vocabulario de cada oficio, y nada que no podamos probar.",
};

const PRINCIPIOS = [
  {
    titulo: "La versatilidad se demuestra, no se anuncia",
    detalle:
      "Que una herramienta sirva a cinco oficios se ve en que cada uno habla su idioma —barbero o terapeuta, cliente o paciente, servicio o tratamiento—, no en un texto que diga «multi-industria».",
  },
  {
    titulo: "El enlace público es la cara del negocio, no la nuestra",
    detalle:
      "La página que un dueño comparte por WhatsApp lleva su nombre y sus colores. Nuestra marca se hace a un lado: si se ve barata, no la comparte, y si no la comparte no sirve de nada.",
  },
  {
    titulo: "No prometemos lo que no podemos probar",
    detalle:
      "Sin testimonios inventados, sin logos de clientes que no existen, sin contadores de uso. Estamos en prelanzamiento en casi todo, y preferimos decirlo a maquillarlo.",
  },
  {
    titulo: "El celular no es la versión reducida",
    detalle:
      "Es donde ocurre el trabajo real. El dueño abre la agenda entre cliente y cliente, de pie y con las manos ocupadas; quien reserva lo hace desde la calle.",
  },
];

export default function Nosotros() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-16 sm:pt-24">
        <h1 className="type-peak max-w-[16ch] font-display text-[var(--ink)]">
          Un motor, muchos oficios
        </h1>
        <p className="mt-7 max-w-[62ch] text-lg text-[var(--body-ink)]">
          {EMPRESA.nombre} construye y opera software para negocios de servicios
          en Colombia. No vendemos horas de desarrollo: hacemos productos, los
          mantenemos, y cobramos suscripción por usarlos.
        </p>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--raise)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="type-section max-w-[24ch] font-display text-[var(--ink)]">
            Por qué la misma casa puede resolver cuatro dominios distintos
          </h2>
          <div className="mt-6 max-w-[65ch] space-y-5 text-[var(--body-ink)]">
            <p>
              Porque debajo son el mismo problema. Una barbería reserva el
              tiempo de un barbero; un consultorio, el de un odontólogo y el de
              un consultorio a la vez; un hotel, el de una habitación; un
              gimnasio, un cupo dentro de una clase. Cambian los sustantivos y
              cambian las reglas, pero el motor que dice «esto está libre y
              esto no» es uno solo.
            </p>
            <p>
              Eso no es una teoría: es lo que Citaria ya hace. Seis oficios
              corriendo sobre el mismo código, donde agregar una industria
              cuesta un archivo de datos y no una rama nueva del producto.
              Cada dominio que sumamos empieza con ese motor ya escrito y
              probado.
            </p>
            <p>
              La competencia obliga a elegir entre una herramienta
              especializada que sólo entiende un oficio, o una genérica que no
              entiende ninguno. Nuestra apuesta es que la diferencia entre
              industrias sea configuración — y que esa versatilidad no haga
              que el producto se vea genérico.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="type-section font-display text-[var(--ink)]">
          Cómo trabajamos
        </h2>
        <dl className="mt-10 border-t border-[var(--line)]">
          {PRINCIPIOS.map((p) => (
            <div
              key={p.titulo}
              className="grid gap-2 border-b border-[var(--line)] py-6 sm:grid-cols-[18rem_minmax(0,1fr)] sm:gap-8"
            >
              <dt className="font-semibold text-[var(--ink)]">{p.titulo}</dt>
              <dd className="max-w-[62ch] text-[var(--body-ink)]">{p.detalle}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ink-field">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="type-peak max-w-[20ch] font-display">
            Estamos empezando, y se nota
          </h2>
          <p className="mt-6 max-w-[58ch] text-lg text-[var(--on-ink-soft)]">
            De cuatro productos, uno funciona. Los otros tres están en el
            tablero. Si tu negocio es de los que todavía no atendemos, esa
            conversación vale más que cualquier cosa que podamos escribir acá.
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
