import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Simulateur DCA — DCA Tracker";

export default async function Image() {
  return renderOgTemplate({
    variant: "dark",
    eyebrow: "Simulateur DCA",
    title: "Simulez votre investissement",
    subtitle: "DCA mensuel sur 10, 20 ou 30 ans avec intérêts composés.",
    accent: { label: "Exemple", value: "200 €/mois" },
    footerLeft: "Sans inscription · Hypothèses transparentes",
  });
}
