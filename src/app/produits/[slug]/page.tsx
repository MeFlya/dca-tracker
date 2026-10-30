// Route dynamique des pages produit — rend ProductPage depuis lib/products.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/products/ProductPage";
import { getProduct, PRODUCT_LIST } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

// 30/10/2026 (pause Vercel Hobby pour dépassement de CPU) : seules les pages
// de generateStaticParams existent. Une adresse inconnue répondait 404 après
// un rendu à la demande ; elle répond désormais 404 sans rien exécuter.
// getProduct accepte aussi l'identifiant interne : /produits/bundle-dca, qui
// répondait 200, redirige vers /produits/pack-demarrage-dca (next.config.ts).
export const dynamicParams = false;

export async function generateStaticParams() {
  return PRODUCT_LIST.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Produit introuvable — DCA Tracker" };

  const canonical = `/produits/${product.slug}`;
  return {
    title: product.metaTitle,
    description: product.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      url: canonical,
      type: "website",
      siteName: "DCA Tracker",
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle,
      description: product.metaDescription,
    },
  };
}

export default async function ProduitRoutePage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
