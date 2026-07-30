import type { MetadataRoute } from "next";

/**
 * Manifest do PWA. Next.js serve isto em /manifest.webmanifest e injeta o
 * <link rel="manifest"> automaticamente. Os ícones e a background_color definem
 * a splash screen ao abrir o app instalado. O preto é o mesmo do arquivo da
 * marca (#010308), então o ícone não mostra emenda contra o fundo da splash.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movra — Treino personalizado",
    short_name: "Movra",
    description:
      "Seu treino personalizado, sem complicação. Fichas montadas para o seu objetivo, nível e equipamentos.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#010308",
    theme_color: "#0a0a0a",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // maskable: Android/TWA recorta em círculo/squircle — conteúdo na safe zone (80%)
      { src: "/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
