import { renderOgTemplate } from "@/lib/og-template";
import { ETF_LIST, getETFBySymbol } from "@/lib/etf-config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fiche ETF — DCA Tracker";

// Pre-generate one OG per known ETF at build time. Unknown symbols (404
// pages) won't trigger this — Next routes them to notFound() before.
export function generateImageMetadata() {
  return ETF_LIST.map((etf) => ({
    id: etf.displaySymbol,
    alt: `ETF ${etf.displaySymbol} — ${etf.name}`,
    contentType,
    size,
  }));
}

interface Props {
  params: { symbol: string };
}

export default async function Image({ params }: Props) {
  const etf = getETFBySymbol(params.symbol);

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
