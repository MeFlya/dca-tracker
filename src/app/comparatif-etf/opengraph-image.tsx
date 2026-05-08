import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Comparatifs ETF — DCA Tracker";

export default async function Image() {
  return renderOgTemplate({
    variant: "light",
    eyebrow: "Comparatifs ETF",
    title: "Comparez les ETF",
    subtitle:
      "VWCE, CW8, IWDA, S&P 500, Nasdaq… Comparaisons claires côté DCA.",
    footerLeft: "TER · PEA · Réplication · Profil",
  });
}
