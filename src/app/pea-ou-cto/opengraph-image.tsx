import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PEA ou CTO ? Le guide complet — DCA Tracker";

export default async function Image() {
  return renderOgTemplate({
    variant: "light",
    eyebrow: "Fiscalité 2026",
    title: "PEA ou CTO ?",
    subtitle:
      "Plafond, fiscalité, ETF éligibles : le guide complet pour choisir.",
    footerLeft: "Calculateur fiscal · Comparaison net après impôt",
  });
}
