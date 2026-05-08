import { renderOgTemplate } from "@/lib/og-template";
import { ETF_COMPARISON_LIST, getETFComparison } from "@/lib/etf-comparisons";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Comparatif ETF — DCA Tracker";

// Pre-generate one OG per known comparison at build time.
export function generateImageMetadata() {
  return ETF_COMPARISON_LIST.map((c) => ({
    id: c.slug,
    alt: `${c.left.heading} vs ${c.right.heading}`,
    contentType,
    size,
  }));
}

interface Props {
  params: { slug: string };
}

export default async function Image({ params }: Props) {
  const comp = getETFComparison(params.slug);

  // Defensive fallback — should not happen because Next routes unknown
  // slugs to notFound() before reaching this generator.
  if (!comp) {
    return renderOgTemplate({
      variant: "light",
      eyebrow: "Comparatif ETF",
      title: "Comparez les ETF",
      subtitle: "TER, PEA, réplication, profil d'investisseur.",
      footerLeft: "Outil pédagogique · Hypothèses transparentes",
    });
  }

  return renderOgTemplate({
    variant: "light",
    eyebrow: "Comparatif ETF",
    title: `${comp.left.heading} vs ${comp.right.heading}`,
    subtitle: "TER, éligibilité PEA, profil d'investisseur, verdict net.",
    footerLeft: comp.tags.length > 0 ? comp.tags.join(" · ") : "Outil pédagogique · Hypothèses transparentes",
  });
}
