import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { LiveSocialProof } from "@/components/home/LiveSocialProof";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Features } from "@/components/home/Features";
import { TrackingPitch } from "@/components/home/TrackingPitch";
import { TrustSection } from "@/components/home/TrustSection";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { FAQ_ITEMS } from "@/lib/faq-data";

const TITLE = "DCA Tracker — Simulateur DCA ETF gratuit + suivi mensuel";
// ≤ 150 caractères (Google tronque à ~150-160, les previews sociales à ~125 —
// l'essentiel du message doit tenir dans les ~125 premiers).
const DESCRIPTION =
  "Simulez votre DCA en ETF (3 scénarios, intérêts composés), backtestez le MSCI World depuis 2009 et suivez votre plan mois après mois. Gratuit, sans inscription.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    type: "website",
    // siteName répété ici car ce bloc openGraph ÉCRASE celui du layout
    // (fusion shallow Next.js) — sans lui, Discord affiche une carte anonyme.
    siteName: "DCA Tracker",
    // OG image injectée par convention via app/opengraph-image.jpg
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
      {/* Hero + social proof : au-dessus de la ligne de flottaison → visibles
          d'emblée. Les sections suivantes se révèlent au scroll (data-reveal). */}
      <Hero />
      <LiveSocialProof />
      <div data-reveal><HowItWorks /></div>
      <div data-reveal><Features /></div>
      <div data-reveal><TrackingPitch /></div>
      <div data-reveal><TrustSection /></div>

      <div data-reveal><FAQ /></div>

      {/* Testimonials — auto-hidden until founder fills in real quotes */}
      <div data-reveal><Testimonials /></div>

      <div data-reveal><EmailCapture source="homepage" /></div>

      {/* CTA band — gradient + subtle grid + aurora sweep for visual depth. */}
      <section data-reveal className="relative overflow-hidden py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-700">
        {/* Ambient grid (matches Hero for visual rhyme) */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
          aria-hidden
        />
        {/* Single ambient orb — kept cost minimal */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-3xl animate-float-a" />
        </div>
        {/* Aurora sweep — diagonal light bar that passes left to right */}
        <div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent animate-aurora pointer-events-none"
          aria-hidden
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Prêt à voir ce que votre argent peut devenir ?
          </h2>
          <p className="text-primary-100 mb-8 text-lg leading-relaxed">
            La simulation prend 30 secondes. Résultats visibles sans inscription,
            hypothèses toujours transparentes.
          </p>
          <a href="/simulateur" className="btn-secondary group text-base px-6 py-3">
            Tester ma simulation <span className="arrow-nudge" aria-hidden>→</span>
          </a>

          {/* Internal nav links — primary-100 (AA on primary-700) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-100">
            <a href="/meilleurs-etf-debutants" className="hover:text-white transition-colors">
              Meilleurs ETF débutants
            </a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="/strategie-dca" className="hover:text-white transition-colors">
              Stratégie DCA
            </a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="/interets-composes" className="hover:text-white transition-colors">
              Intérêts composés
            </a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="/investir-en-etf" className="hover:text-white transition-colors">
              Investir en ETF
            </a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="/pea-ou-cto" className="hover:text-white transition-colors">
              PEA ou CTO ?
            </a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="/comparer-etf" className="hover:text-white transition-colors">
              Comparer les ETF
            </a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="/comparatif-etf/cw8-vs-wpea" className="hover:text-white transition-colors">
              CW8 vs WPEA
            </a>
            <span aria-hidden className="opacity-40">·</span>
            <a href="/etf-msci-world" className="hover:text-white transition-colors">
              Guide MSCI World
            </a>
          </div>
        </div>
      </section>

      <JsonLd data={faqSchema} />
    </>
  );
}
