import { renderOgTemplate } from "@/lib/og-template";
import { getETFBySymbol } from "@/lib/etf-config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fiche ETF — DCA Tracker";

// UNE image par fiche. Même défaut que les comparatifs : la liste de TOUS les
// ETF était renvoyée, donc chaque fiche déclarait 14 og:image dont la première
// annonçait « ETF CW8 » — y compris sur /etf/JPNK — et le site exposait 196
// URL d'image (14 × 14) au lieu de 14. Voir comparatif-etf/[slug].
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ symbol: string }> | { symbol: string };
}) {
  const { symbol } = await params;
  const etf = getETFBySymbol(symbol);
  return [
    {
      id: "og",
      alt: etf ? `ETF ${etf.displaySymbol} — ${etf.name}` : alt,
      contentType,
      size,
    },
  ];
}

interface Props {
  params: Promise<{ symbol: string }> | { symbol: string };
}

export default async function Image({ params }: Props) {
  const { symbol } = await params;
  const etf = getETFBySymbol(symbol);

  // Defensive fallback — should not happen since Next.js routes unknown
  // symbols to notFound() before, but keeps the OG generation safe.
  if (!etf) {
    return renderOgTemplate({
      variant: "light",
      eyebrow: "ETF",
      title: "Fiche ETF",
      subtitle: "Analyse, frais, réplication et simulation DCA.",
      footerLeft: "Outil pédagogique · Hypothèses transparentes",
    });
  }

  return renderOgTemplate({
    variant: "light",
    eyebrow: `ETF · ${etf.indexLabel}`,
    title: etf.displaySymbol,
    subtitle: etf.name,
    accent: { label: "TER", value: `${etf.ter} %` },
    footerLeft: etf.isin
      ? `${etf.replicationMethod} · ${etf.distributionPolicy} · ${etf.isin}`
      : `${etf.replicationMethod} · ${etf.distributionPolicy}`,
  });
}
