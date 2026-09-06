/* =============================================================================
   El estado de un producto es un DATO, no una decisión de maqueta.

   De los cuatro productos de la casa, hoy sólo Citaria existe. Si los cuatro se
   pintaran iguales, alguien entraría a «Gimnasios», encontraría un producto
   vacío y el sitio perdería justo la confianza que viene a construir. Peor:
   anunciar precios o capacidades de algo que no existe es publicidad engañosa
   ante la SIC.

   Por eso el tipo es una unión discriminada y no un objeto con campos
   opcionales. Un producto `en-construccion` NO PUEDE declarar planes ni enlace:
   el compilador lo rechaza. La regla deja de depender de que alguien se
   acuerde.
   ============================================================================= */

export type EstadoProducto = "en-operacion" | "en-construccion" | "en-exploracion";

/** El matiz con el que se repinta la página. Ver `[data-producto]` en globals.css. */
export type MatizProducto = "empresa" | "citaria" | "hoteleria" | "gimnasios" | "oficios";

type Base = {
  slug: string;
  nombre: string;
  matiz: MatizProducto;
  /** Una línea. Es lo que se lee en el índice de la portada. */
  resumen: string;
  /** El problema del negocio, en su idioma. Nunca en el nuestro. */
  problema: string;
  paraQuien: string;
};

export type ProductoEnOperacion = Base & {
  estado: "en-operacion";
  /** Sólo un producto que existe puede tener a dónde mandar a alguien. */
  enlace: string;
  demo?: string;
  capacidades: Array<{ titulo: string; detalle: string }>;
  planes: Array<{ nombre: string; precio: string; incluye: string }>;
  /** Lo que se muestra en la escena de producto: datos reales del producto. */
  escena: Array<{ hora: string; servicio: string; duracion: string; quien: string }>;
};

export type ProductoEnConstruccion = Base & {
  estado: "en-construccion";
  /** Lo que se está construyendo. Verbos en presente, sin fechas inventadas. */
  construyendo: string[];
};

export type ProductoEnExploracion = Base & {
  estado: "en-exploracion";
  /** La pregunta que todavía no tiene respuesta. Decirla abre conversación. */
  pregunta: string;
};

export type Producto =
  | ProductoEnOperacion
  | ProductoEnConstruccion
  | ProductoEnExploracion;

/** Lo que la interfaz muestra por estado. Un solo lugar, sin `if` sueltos. */
export const ETIQUETA_ESTADO: Record<EstadoProducto, string> = {
  "en-operacion": "En operación",
  "en-construccion": "En construcción",
  "en-exploracion": "En exploración",
};

export const ACCION_ESTADO: Record<EstadoProducto, string> = {
  "en-operacion": "Ver el producto",
  "en-construccion": "Avísame cuando esté",
  "en-exploracion": "Cuéntame tu caso",
};

/** Un dato que todavía no existe se escribe entre corchetes. La maqueta
 *  pregunta por esto para no emitir un enlace roto ni un precio inventado. */
export function esMarcador(valor: string): boolean {
  return valor.trimStart().startsWith("[");
}
