import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";

const TITLE = "Comparatifs ETF 2026 : CW8, IWDA, VWCE, WPEA face à face";
const DESCRIPTION =
  "Comparatifs ETF actualisés 2026 : CW8 vs ESE, CW8 vs WPEA, VWCE vs CW8, IWDA vs CW8. TER, encours, éligibilité PEA et notre recommandation pour chaque face-à-face.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/comparatif-etf" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/comparatif-etf",
    type: "website",
  },
};

export default function ComparatifETFHubPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${siteUrl}/comparatif-etf`,
        }}
      />

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Comparatifs ETF</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
        Quel ETF choisir ? Les grandes questions
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-4">
        Chaque comparatif répond à une vraie décision que prennent les investisseurs
        DCA français : indice mondial ou US pur, ETF physique ou synthétique, PEA
        ou CTO. Analyses complètes avec TER, éligibilité et profils recommandés.
      </p>
      <p className="text-base text-gray-600 leading-relaxed mb-4">
        Le face-à-face le plus regardé en 2026 reste celui des deux MSCI World
        éligibles PEA — voyez notre comparatif{" "}
        <Link href="/comparatif-etf/cw8-vs-wpea" className="text-primary-700 font-medium hover:underline">
          CW8 vs WPEA
        </Link>
        {" "}qui chiffre l&apos;impact des 0,18 % de TER d&apos;écart sur 20 ans
        de capitalisation. Si vous voulez aller directement à une short-list
        d&apos;ETF concrets plutôt qu&apos;à un face-à-face, le guide{" "}
        <Link href="/guide-5-etf-pea-premium" className="text-primary-700 font-medium hover:underline">
          5 ETF Premium éligibles PEA
        </Link>
        {" "}propose une sélection courte et commentée.
      </p>
      <p className="text-base text-gray-600 leading-relaxed mb-10">
        Avant tout choix, gardez en tête que l&apos;essentiel se joue dans la
        durée : sur 20-30 ans, c&apos;est l&apos;impact des frais via les{" "}
        <Link href="/interets-composes" className="text-primary-700 font-medium hover:underline">
          intérêts composés
        </Link>
        {" "}qui creuse les écarts de performance — d&apos;où l&apos;importance
        de regarder le TER en priorité dans chaque comparatif ci-dessous.
      </p>

      {/* Comparison list */}
      <div className="space-y-4 mb-10">
        {ETF_COMPARISON_LIST.map((c) => (
          <Link
            key={c.slug}
            href={`/comparatif-etf/${c.slug}`}
            className="group block rounded-2xl border border-gray-100 bg-white p-5 card-hover"
          >
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-sm font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded-full">
                {c.left.heading}
              </span>
              <ArrowLeftRight size={14} className="text-gray-500" />
              <span className="text-sm font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
                {c.right.heading}
              </span>
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-primary-700 transition-colors">
              {c.title}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-2 line-clamp-2">
              {c.verdict}
            </p>
            <p className="text-xs font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
              Lire le comparatif complet →
            </p>
          </Link>
        ))}
      </div>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100 mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Explorer plus loin
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/comparer-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Outil de comparaison</p>
            <p className="text-xs text-gray-500">Comparer tous les ETF de la base avec frais, performances et éligibilité.</p>
          </Link>
          <Link href="/meilleurs-etf-debutants" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Meilleurs ETF débutants</p>
            <p className="text-xs text-gray-500">Sélection curatée des ETF recommandés pour un DCA long-terme.</p>
          </Link>
          <Link href="/glossaire/etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Qu&apos;est-ce qu&apos;un ETF ?</p>
            <p className="text-xs text-gray-500">Définition complète avec exemples et caractéristiques.</p>
          </Link>
          <Link href="/pea-ou-cto" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">PEA ou CTO ?</p>
            <p className="text-xs text-gray-500">Où loger votre ETF selon votre objectif fiscal.</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez l&apos;impact concret du TER
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Avant de choisir, voyez combien les frais annuels coûtent réellement
          sur 20-30 ans. 0,2 % peut représenter des milliers d&apos;euros.
        </p>
        <Link
          href="/simulateur"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>
    </div>
  );
}
