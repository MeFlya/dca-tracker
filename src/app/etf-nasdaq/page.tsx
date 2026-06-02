import type { Metadata } from "next";
import { INDEX_GUIDES } from "@/lib/etf-index-guides";
import { IndexGuidePage } from "@/components/etf-guide/IndexGuidePage";

const guide = INDEX_GUIDES["etf-nasdaq"];

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.metaDescription,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: {
    title: guide.metaTitle,
    description: guide.metaDescription,
    url: `/${guide.slug}`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: guide.metaTitle,
    description: guide.metaDescription,
  },
};

export default function Page() {
  return <IndexGuidePage guide={guide} />;
}
