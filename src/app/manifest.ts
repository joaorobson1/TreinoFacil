import type { MetadataRoute } from "next";

/**
 * Manifest do PWA. Next.js serve isto em /manifest.webmanifest e injeta o
 * <link rel="manifest"> automaticamente. Os ícones e a background_color branca
 * definem a splash screen ao abrir o app instalado (logo sobre fundo branco).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TreinoFácil — Treino personalizado",
    short_name: "TreinoFácil",
    description:
      "Seu treino personalizado, sem complicação. Fichas montadas para o seu objetivo, nível e equipamentos.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
