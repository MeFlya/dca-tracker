import type { Metadata } from "next";
import { Suspense } from "react";
import { SimulatorPageClient } from "./SimulatorPageClient";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE = "Simulateur DCA ETF — Projetez votre investissement à long terme";
const DESCRIPTION =
  "Entrez un versement mensuel, une durée et un rendement. DCA Tracker calcule votre projection avec les intérêts composés : 3 scénarios comparés, graphique interactif, export PDF. Gratuit, sans inscription.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/simulateur" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/simulateur",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Simulateur DCA ETF — DCA Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Simulez vos versements mensuels en ETF avec les intérêts composés. 3 scénarios, graphique interactif, export PDF. Gratuit.",
  },
};

export default function SimulateurPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <a href="/" className="hover:text-gray-600 transition-colors">Accueil</a>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Simulateur DCA</span>
      </nav>

      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Projetez votre futur financier
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Ajustez les curseurs — votre projection se met à jour en temps réel.
          Basé sur la mécanique des intérêts composés et les données historiques ETF.
        </p>
      </div>

      {/* Suspense required by Next.js App Router when useSearchParams is used */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px] gap-3 text-gray-400">
            <LoadingSpinner />
            <span className="text-sm">Chargement de la simulation…</span>
          </div>
        }
      >
        <SimulatorPageClient />
      </Suspense>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulateur DCA ETF",
          url: `${siteUrl}/simulateur`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web browser",
          browserRequirements: "Requires JavaScript",
          inLanguage: "fr-FR",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
          description:
            "Simulateur DCA ETF : projetez votre portefeuille avec intérêts composés, frais annuels et inflation. Calcul transparent, hypothèses vérifiables, sans inscription.",
        }}
      />
    </div>
  );
}
