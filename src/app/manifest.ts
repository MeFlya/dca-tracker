import type { MetadataRoute } from "next";

// Web app manifest — identité d'app cohérente (nom court, couleur de thème
// de marque sur la barre mobile, icônes) au lieu des défauts Next.js.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DCA Tracker — Simulateur & suivi DCA en ETF",
    short_name: "DCA Tracker",
    description:
      "Simulez, suivez et pilotez votre investissement progressif (DCA) en ETF.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "any", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
