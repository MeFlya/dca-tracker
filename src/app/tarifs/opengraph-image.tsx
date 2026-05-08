import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tarifs Premium — DCA Tracker";

export default async function Image() {
  return renderOgTemplate({
    variant: "dark",
    eyebrow: "Tarifs",
    title: "Premium — 4,90 €/mois",
    subtitle:
      "Suivi mensuel, récap fiscal annuel, Monte Carlo, comparaison A/B.",
    accent: { label: "Essai", value: "7 jours" },
    footerLeft: "Sans engagement · Annulable en 1 clic",
  });
}
