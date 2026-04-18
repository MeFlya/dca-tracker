import type { Metadata } from "next";
import { ETF_LIST } from "@/lib/etf-config";
import { getMarketDataProvider, isDemo } from "@/lib/market-data";
import { ETFCard } from "@/components/etf/ETFCard";
import { DemoBadge } from "@/components/ui/Disclaimer";

const TITLE = "Comparer les ETF — CW8, VWCE, EWLD, SPY, QQQ";
const DESCRIPTION =
  "Comparez les principaux ETF pour investisseurs long terme : Amundi CW8, Vanguard VWCE, iShares EWLD, SPDR SPY, Invesco QQQ. Frais réels (TER), méthode de réplication, cours indicatifs et simulation DCA intégrée.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/comparer-etf" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/comparer-etf",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Comparaison ETF — DCA Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "CW8, VWCE, EWLD, SPY, QQQ côte à côte : TER, réplication, cours. Simulez le DCA sur chaque ETF en un clic.",
  },
};

// Revalidate market data every 5 minutes
export const revalidate = 300;

export default async function ComparerETFPage() {
  const provider = getMarketDataProvider();
  const symbols = ETF_LIST.map((e) => e.symbol);
  const batch = await provider.getQuotes(symbols);
  const demo = isDemo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <a href="/" className="hover:text-gray-600 transition-colors">Accueil</a>
          <span aria-hidden>/</span>
          <span className="text-gray-600" aria-current="page">Comparer les ETF</span>
        </nav>

        <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Comparer les ETF
          </h1>
          {demo && <DemoBadge />}
        </div>

        <p className="text-gray-500 text-lg max-w-2xl">
          Analyse des principaux ETF utilisés par les investisseurs particuliers
          en France. Cours indicatifs, frais et caractéristiques clés.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ETF_LIST.map((etf) => {
          const result = batch.results[etf.symbol];
          return (
            <ETFCard
              key={etf.symbol}
              etf={etf}
              quote={result?.quote}
              error={result?.error}
            />
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-10 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Information :</strong> Les cours affichés sont{" "}
          {demo ? "illustratifs (mode démo)" : "différés (fin de journée)"} et
          ne constituent pas un conseil d&apos;achat ou de vente. Les frais TER
          indiqués proviennent des prospectus publics et peuvent évoluer.
          Dernière mise à jour des cours : {new Date(batch.fetchedAt).toLocaleString("fr-FR")}.
        </p>
      </div>
    </div>
  );
}
