import type { Producto } from "./tipos";

/* =============================================================================
   El catálogo. Agregar un producto es agregar una entrada acá — nunca un `if`
   en una maqueta. Es la misma regla que gobierna los packs por industria de
   Citaria: sólo datos.

   MARCADORES. Lo que va entre corchetes —[ASÍ]— es un dato que todavía no
   existe y hay que llenar antes de publicar. Está a la vista a propósito: un
   marcador visible se corrige, un dato inventado se queda.

   LOS NOMBRES DE LOS TRES PENDIENTES son descriptivos —«Hotelería»,
   «Gimnasios», «Oficios»— y eso es deliberado: son nombres de trabajo, no
   marcas. Inventarle un nombre propio a un producto que no existe es fabricar
   catálogo, que es justo lo que este sitio no hace.
   ============================================================================= */

/* Verificado: responde 200 y sirve el producto. Ojo — `PRODUCT.md` de Citaria
   todavía dice «citaria.co por verificar»; el dominio real es este. */
const ENLACE_CITARIA = "https://citaria.tech";

export const PRODUCTOS: Producto[] = [
  {
    slug: "citaria",
    nombre: "Citaria",
    matiz: "citaria",
    estado: "en-operacion",
    resumen: "Reservas en línea para negocios de servicios.",
    problema:
      "El dueño cuadra las citas por WhatsApp entre cliente y cliente, con las manos ocupadas. Pierde tiempo en cada mensaje y pierde clientes cuando no alcanza a responder.",
    paraQuien:
      "Barberías, consultorios odontológicos, veterinarias, spas y salones de estética.",
    enlace: ENLACE_CITARIA,
    demo: `${ENLACE_CITARIA}/demo`,
    capacidades: [
      {
        titulo: "El cliente reserva sin cuenta",
        detalle:
          "Llega por un enlace, elige servicio, profesional y hora, y termina en menos de un minuto. No se registra, porque no quiere registrarse.",
      },
      {
        titulo: "Seis oficios, un solo motor",
        detalle:
          "Barbería, odontología, veterinaria, spa, estética y otros negocios. Cada uno con sus servicios, sus tiempos y su vocabulario: el consultorio dice paciente, la barbería dice cliente.",
      },
      {
        titulo: "Agenda por profesional y por recurso",
        detalle:
          "Un consultorio agenda contra consultorios además de odontólogos. Un spa reserva la cabina aunque no importe la terapeuta.",
      },
      {
        titulo: "Las reglas del negocio, no las nuestras",
        detalle:
          "Horarios partidos, tiempo entre citas, cierres del negocio, y «cualquier profesional disponible» cuando al cliente le da igual quién lo atienda.",
      },
      {
        titulo: "Recordatorios que salen solos",
        detalle:
          "El día antes sale el correo sin que nadie lo mande. Y el enlace de WhatsApp queda listo para el contacto que sí es humano.",
      },
      {
        titulo: "Las cuentas claras a fin de mes",
        detalle:
          "Ingresos y comisiones por profesional, ficha de cliente con su historial, y reseñas después de la cita.",
      },
    ],
    planes: [
      {
        nombre: "Gratis",
        precio: "$0",
        incluye: "1 profesional · 5 servicios · reservas ilimitadas",
      },
      {
        nombre: "Starter",
        precio: "$39.900 COP/mes",
        incluye: "3 profesionales · 30 servicios · recordatorios y reportes",
      },
      {
        nombre: "Pro",
        precio: "$89.900 COP/mes",
        incluye: "Sin límite · clientes, reseñas y analítica",
      },
    ],
    escena: [
      { hora: "9:00", servicio: "Corte de cabello", duracion: "30 min", quien: "Andrés" },
      { hora: "9:30", servicio: "Corte y barba", duracion: "45 min", quien: "Andrés" },
      { hora: "10:15", servicio: "Barba", duracion: "20 min", quien: "Camila" },
      { hora: "11:00", servicio: "Corte de cabello", duracion: "30 min", quien: "Camila" },
    ],
  },

  {
    slug: "hoteleria",
    nombre: "Hotelería",
    matiz: "hoteleria",
    estado: "en-construccion",
    resumen: "Reservas directas para hoteles pequeños.",
    problema:
      "Un hotel pequeño vive de las plataformas de reserva, y cada noche que entra por ahí llega con una comisión ya descontada. Su único canal propio es un número de WhatsApp que alguien tiene que estar contestando, y la ocupación vive en una hoja de cálculo que nadie mira a tiempo.",
    paraQuien:
      "Hoteles de pocas habitaciones, hostales, fincas y glampings.",
    construyendo: [
      "El motor de disponibilidad que ya corre en Citaria, apuntando a otra cosa: en vez del tiempo de un profesional, la noche de una habitación. Esa parte no se escribe desde cero.",
      "Tarifas por temporada, que es donde una hoja de cálculo deja de alcanzar.",
      "La página de reservas propia del hotel — con su nombre y sus fotos, no con las de otro.",
      "Un calendario que sea la única fuente de verdad, para que aceptar una reserva por WhatsApp no signifique arriesgarse a un sobrecupo.",
    ],
  },

  {
    slug: "gimnasios",
    nombre: "Gimnasios",
    matiz: "gimnasios",
    estado: "en-exploracion",
    resumen: "Mensualidades y cupos de clase.",
    problema:
      "El dueño lleva en la cabeza quién pagó este mes. Cobra por transferencia, anota en un cuaderno y persigue por WhatsApp a los que se atrasaron — que es la parte del trabajo que nadie quiere hacer y la que más plata deja sobre la mesa.",
    paraQuien:
      "Gimnasios de barrio, estudios de yoga, pilates y crossfit.",
    pregunta:
      "Vemos dos problemas y no sabemos cuál duele más: la plata que hay que perseguir todos los meses, o el cupo de la clase que se llena por orden de llegada. Son dos productos distintos, y sólo vale la pena construir el que de verdad estorba.",
  },

  {
    slug: "oficios",
    nombre: "Oficios",
    matiz: "oficios",
    estado: "en-exploracion",
    resumen: "Entre quien necesita un oficio y quien lo ejerce.",
    problema:
      "Buscar un plomero un martes a las siete de la noche termina en el grupo de WhatsApp del edificio. Del otro lado hay alguien que sabe su oficio y cuya semana entera depende de que a un vecino se le ocurra recomendarlo.",
    paraQuien:
      "Electricistas, plomeros, técnicos y cerrajeros — y cualquiera que los haya necesitado con afán.",
    pregunta:
      "La duda no es técnica, es de fondo. Puede que la gente no necesite otro directorio, sino una manera de confiar en el que ya le recomendaron. Antes de construir un mercado queremos entender si el problema es encontrar o es confiar — y son respuestas muy distintas.",
  },
];

export function obtenerProducto(slug: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.slug === slug);
}

export function listarProductos(): Producto[] {
  return PRODUCTOS;
}
