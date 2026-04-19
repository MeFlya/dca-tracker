import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ETFComparisonPage } from "@/components/comparatif-etf/ETFComparisonPage";
import { ETF_COMPARISON_LIST, getETFComparison } from "@/lib/etf-comparisons";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return ETF_COMPARISON_LIST.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = getETFComparison(slug);
  if (!comp) return { title: "Comparatif introuvable — DCA Tracker" };

  const canonical = `/comparatif-etf/${comp.slug}`;
  return {
    title: comp.metaTitle,
    description: comp.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: comp.metaTitle,
      description: comp.metaDescription,
      url: canonical,
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${comp.left.heading} vs ${comp.right.heading}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: comp.metaTitle,
      description: comp.metaDescription,
    },
  };
}

export default async function ComparisonRoutePage({ params }: Props) {
  const { slug } = await params;
  const comp = getETFComparison(slug);
  if (!comp) notFound();
  return <ETFComparisonPage comparison={comp} />;
}
