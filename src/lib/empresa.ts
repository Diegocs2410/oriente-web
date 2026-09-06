/* La marca en un solo lugar. Nada de la maqueta escribe el nombre a mano, así
   que cambiarlo cuesta editar este archivo. Ya se cobró una vez: la marca pasó
   de «Fragua» a «Oriente» sin tocar una sola página. */
export const EMPRESA = {
  nombre: "Oriente",
  dominio: "oriente.tech",
  /** Falta la búsqueda en SIPI (clases 42, 9 y 35) y el registro.
   *
   *  ADVERTENCIA CONOCIDA: «oriente» es palabra común del español, y una marca
   *  denominativa genérica es débil ante la SIC — objetable, y difícil de
   *  defender contra un parecido. La mitigación es registrarla como marca
   *  MIXTA (palabra + logotipo): el logo aporta el elemento distintivo que a
   *  la palabra sola le falta. Decisión tomada a sabiendas. */
  nombreConfirmado: false,
  tesis: "Un motor, muchos oficios",
  descripcion:
    "Construimos y operamos software para negocios de servicios en Colombia. Cada oficio con su vocabulario, sus tiempos y sus reglas — no una plantilla con otro logo.",
  correo: "devdiego2024@gmail.com",
  ciudad: "Rionegro, Antioquia · Colombia",
} as const;

export const NAVEGACION = [
  { href: "/productos/citaria/", texto: "Citaria" },
  { href: "/nosotros/", texto: "Nosotros" },
  { href: "/contacto/", texto: "Contacto" },
] as const;
