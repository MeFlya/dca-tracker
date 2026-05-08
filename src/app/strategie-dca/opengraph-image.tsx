import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Stratégie DCA — Le guide complet — DCA Tracker";

export default async function Image() {
  return renderOgTemplate({
    variant: "light",
    eyebrow: "Investissement passif",
    title: "Maîtrisez le DCA",
    subtitle:
      "La stratégie d'investissement progressif, pas à pas — pour les ETF long-terme.",
    footerLeft: "Stratégie · Erreurs à éviter · Backtests",
  });
}
