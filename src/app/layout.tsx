import type { Metadata } from "next";
import { Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import { Barra } from "@/components/barra";
import { Pie } from "@/components/pie";
import { EMPRESA } from "@/lib/empresa";
import "./globals.css";

/* Cuerpo: el mismo de Citaria. Es el parecido de familia — la empresa y el
   producto se leen con la misma voz. Alto de x generoso, se lee en un Android
   de gama media bajo luz de local. */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

/* Display: una serif editorial. Bricolage Grotesque es la voz de Citaria;
   repetirla haría que la empresa pareciera otra landing del producto. Una
   serif dice «casa que construye y publica», que es lo que una matriz es. */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${EMPRESA.nombre} — ${EMPRESA.tesis}`,
    template: `%s | ${EMPRESA.nombre}`,
  },
  description: EMPRESA.descripcion,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-producto="empresa">
      <body
        className={`${hanken.variable} ${instrument.variable} font-sans min-h-dvh flex flex-col`}
      >
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[var(--card)] focus:px-4 focus:py-3 focus:shadow-[var(--shadow-card)]"
        >
          Saltar al contenido
        </a>
        <Barra />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Pie />
      </body>
    </html>
  );
}
