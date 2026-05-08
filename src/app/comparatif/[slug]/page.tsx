import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrokerPage } from "@/components/comparatif/BrokerPage";
import { BROKER_LIST, getBroker } from "@/lib/brokers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BROKER_LIST.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const broker = getBroker(slug);
  if (!broker) return { title: "Courtier introuvable — DCA Tracker" };

  const canonical = `/comparatif/${broker.slug}`;
  return {
    title: broker.metaTitle,
    description: broker.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: broker.metaTitle,
      description: broker.metaDescription,
      url: canonical,
      type: "article",
      images: [{ url: "https://dcatracker.fr/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: broker.metaTitle,
      description: broker.metaDescription,
    },
  };
}

export default async function BrokerRoutePage({ params }: Props) {
  const { slug } = await params;
  const broker = getBroker(slug);
  if (!broker) notFound();
  return <BrokerPage broker={broker} />;
}
