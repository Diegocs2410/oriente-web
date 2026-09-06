import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Export estático: el sitio sale como HTML plano a S3 y lo sirve CloudFront.
     Consecuencia deliberada — no hay server actions, ni route handlers, ni
     proxy.ts. Lo dinámico (los dos formularios) vive en la API de AWS, que es
     donde está el aprendizaje. */
  output: "export",

  /* El optimizador de imágenes de Next necesita un servidor. En export
     estático no existe, así que las imágenes se sirven tal cual. Este sitio
     no lleva fotografía por diseño, así que no se pierde nada. */
  images: { unoptimized: true },

  /* Cada ruta se emite como `<ruta>/index.html`. Sin esto, S3 sirve
     `/nosotros` como un archivo sin extensión y CloudFront devuelve 403 o
     descarga el archivo en vez de renderizarlo. Es el detalle que rompe el
     despliegue estático y no se ve hasta que está en producción. */
  trailingSlash: true,
};

export default nextConfig;
