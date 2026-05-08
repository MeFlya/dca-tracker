import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DCA Tracker — Le tracker DCA ETF pour investisseurs FR";

export default async function Image() {
  return renderOgTemplate({
    variant: "dark",
    eyebrow: "Le cockpit DCA long-terme",
    title: "Suivez votre stratégie DCA ETF",
    subtitle:
      "Simulez, sauvegardez, suivez votre portefeuille mois après mois.",
    accent: { label: "200 €/mois sur 20 ans", value: "102 000 €" },
    footerLeft: "Simulateur · Tracker mensuel · Récap fiscal",
  });
}
