import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { LiveSocialProof } from "@/components/home/LiveSocialProof";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Features } from "@/components/home/Features";
import { TrackingPitch } from "@/components/home/TrackingPitch";
import { TrustSection } from "@/components/home/TrustSection";
import { FAQ } from "@/components/home/FAQ";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { FAQ_ITEMS } from "@/lib/faq-data";

const TITLE = "DCA Tracker — Simulez et pilotez votre DCA ETF long-terme";
const DESCRIPTION =
  "Simulez votre stratégie DCA en ETF, sauvegardez-la et suivez votre progression mois après mois. 3 scénarios, intérêts composés, hypothèses transparentes. Gratuit.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DCA Tracker — Simulateur d'investissement progressif en ETF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Combien peut valoir votre argent dans 20 ans ? Simulez vos versements en ETF avec les intérêts composés. Gratuit, sans inscription.",
  },
};

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <VisitTracker event={{ name: "visit_home" }} />
      <Hero />
      <LiveSocialProof />
      <HowItWorks />
      <Features />
      <TrackingPitch />
      <TrustSection />

      {/* Discreet link to About page — below engagements, above FAQ */}
      <div className="bg-slate-50 border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <a
            href="/a-propos"
            className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600 transition-colors"
          >
            → Qui est derrière DCA Tracker ?
          </a>
        </div>
      </div>

      <FAQ />

      <EmailCapture source="homepage" />

      {/* CTA band */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Prêt à voir ce que votre argent peut devenir ?
          </h2>
          <p className="text-primary-200 mb-8 text-lg leading-relaxed">
            La simulation prend 30 secondes. Résultats visibles sans inscription,
            hypothèses toujours transparentes.
          </p>
          <a href="/simulateur" className="btn-secondary text-base px-6 py-3">
            Tester ma simulation →
          </a>

          {/* Internal nav links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-300">
            <a href="/meilleurs-etf-debutants" className="hover:text-white transition-colors">
              Meilleurs ETF débutants
            </a>
            <span aria-hidden className="opacity-30">·</span>
            <a href="/strategie-dca" className="hover:text-white transition-colors">
              Stratégie DCA
            </a>
            <span aria-hidden className="opacity-30">·</span>
            <a href="/interets-composes" className="hover:text-white transition-colors">
              Intérêts composés
            </a>
            <span aria-hidden className="opacity-30">·</span>
            <a href="/investir-en-etf" className="hover:text-white transition-colors">
              Investir en ETF
            </a>
            <span aria-hidden className="opacity-30">·</span>
            <a href="/pea-ou-cto" className="hover:text-white transition-colors">
              PEA ou CTO ?
            </a>
            <span aria-hidden className="opacity-30">·</span>
            <a href="/comparer-etf" className="hover:text-white transition-colors">
              Comparer les ETF
            </a>
          </div>
        </div>
      </section>

      <JsonLd data={faqSchema} />
    </>
  );
}
