import { renderOgTemplate } from "@/lib/og-template";
import { getETFComparison } from "@/lib/etf-comparisons";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Comparatif ETF — DCA Tracker";

// UNE image par page, et c'est tout.
//
// `generateImageMetadata` produit plusieurs images pour UNE MÊME page (des
// variantes). Il renvoyait ici la liste de TOUS les comparatifs : chaque page
// déclarait donc 8 balises og:image identiques, dont la première portait le
// texte alternatif « MSCI World vs S&P 500 » — y compris sur cw8-vs-wpea et
// wpea-vs-dcam, les deux pages les plus vues du site. Et Google a trouvé 64
// URL d'image (8 × 8) là où il en fallait 8, qu'il a explorées pour rien sur
// un site dont il refuse déjà d'explorer une quinzaine de pages faute de budget.
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await params;
  const c = getETFComparison(slug);
  return [
    {
      id: "og",
      alt: c ? `${c.left.heading} vs ${c.right.heading}` : alt,
      contentType,
      size,
    },
  ];
}

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const comp = getETFComparison(slug);

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
