import type { Metadata } from "next";
import { ETF_LIST } from "@/lib/etf-config";
import { ETFGrid } from "./ETFGrid";
import { ComparisonDisclosure } from "@/components/ui/ComparisonDisclosure";

const ETF_COUNT = ETF_LIST.length;
// 28/09/2026 : le titre mettait en avant ANX et AEEM, deux ETF NON éligibles
// PEA (table de vérité ETF), sur un site centré sur le PEA.
const TITLE = "Comparer les ETF — CW8, WPEA, DCAM, VWCE, PSP5 et plus";
// 14/10/2026 : « Cours indicatifs » retiré — la page n'affiche plus de cours
// (fin de Yahoo Finance). Raccourcie sous 155 caractères au passage.
const DESCRIPTION = `Comparez ${ETF_COUNT} ETF : monde, S&P 500, Nasdaq, émergents, Europe, small cap, obligations. Filtres PEA, région, TER. Frais réels et simulation DCA en un clic.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/comparer-etf" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/comparer-etf",
    type: "website",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: `${ETF_COUNT} ETF côte à côte : TER, réplication, PEA, émetteur. Filtres région et PEA. Simulez le DCA en un clic.`,
  },
};

// 14/10/2026 : plus de cours ni de variations (ils venaient de Yahoo Finance,
// dont les conditions interdisent l'usage commercial et la collecte
// automatique). La page ne dépend plus d'aucun appel externe : entièrement
// statique, plus de revalidate.

export default function ComparerETFPage() {

  return (
    // Wrapper bg-slate-50 opaque : page de consultation (fonctionnel/analytique)
    // → fond calme, stop le leak AmbientBackground mesh.
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <a href="/" className="hover:text-gray-600 transition-colors">Accueil</a>
            <span aria-hidden>/</span>
            <span className="text-gray-600" aria-current="page">Comparer les ETF</span>
          </nav>

          <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Comparer les ETF
            </h1>
          </div>

          <p className="text-gray-600 text-lg max-w-2xl">
            {ETF_LIST.length} ETF analysés — monde, USA, Europe, émergents, small cap, obligations.
            Filtrez par région, éligibilité PEA ou niveau de frais.
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mt-2">
            Pas de cours en direct ici&nbsp;: le prix d&apos;une part se lit dans
            la valeur liquidative que publie l&apos;émetteur du fonds, sur son site.
          </p>
        </div>

        {/* Obligation D.111-7 II — avant la grille comparée. */}
        <ComparisonDisclosure kind="etf-list" className="mb-6" />

        {/* Filterable grid */}
        <ETFGrid etfs={ETF_LIST} />

        {/* Disclaimer — amber-50 conservé (disclaimer fintech officiel).
            data-nosearch (recherche interne, 28/09/2026) : mention légale. */}
        <div data-nosearch="" className="mt-10 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Information :</strong> Cette page n&apos;affiche aucun cours.
            Pour le prix d&apos;une part, consultez la valeur liquidative publiée
            par l&apos;émetteur&nbsp;: un lien mène à la page du fonds quand nous
            en avons vérifié l&apos;adresse. Les frais TER indiqués proviennent
            des prospectus publics et peuvent évoluer. Rien ici ne constitue un
            conseil d&apos;achat ou de vente.
          </p>
        </div>
      </div>
    </div>
  );
}
