import type { Metadata } from "next";
import { getMarketDataProvider, isDemo } from "@/lib/market-data";
import { ETF_LIST } from "@/lib/etf-config";
import { MarketCard } from "@/components/market/MarketCard";
import { DemoBadge } from "@/components/ui/Disclaimer";
import { AssetQuote } from "@/lib/market-data/types";

const TITLE = "Cours des ETF — Données de marché CW8, VWCE, EWLD, SPY, QQQ";
const DESCRIPTION =
  "Consultez les derniers cours disponibles des principaux ETF : CW8, VWCE, EWLD, SPY, QQQ. Données différées (fin de journée). Source et horodatage affichés sur chaque carte.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/donnees-marche" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/donnees-marche",
    type: "website",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Cours indicatifs des principaux ETF (CW8, VWCE, EWLD, SPY, QQQ). Données différées, source toujours affichée.",
  },
};

export const revalidate = 300;

export default async function DonneesArchePage() {
  const provider = getMarketDataProvider();
  const symbols = ETF_LIST.map((e) => e.symbol);
  const batch = await provider.getQuotes(symbols);
  const demo = isDemo();

  // Build display list with fallback quote shape for errors
  const items = symbols.map((symbol) => {
    const result = batch.results[symbol];
    const etfMeta = ETF_LIST.find((e) => e.symbol === symbol);

    const fallbackQuote: AssetQuote = {
      symbol,
      name: etfMeta?.name ?? symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      currency: "EUR",
      exchange: "—",
      lastUpdated: new Date().toISOString(),
      isDelayed: true,
    };

    return {
      quote: result?.quote ?? fallbackQuote,
      error: result?.error ?? null,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <a href="/" className="hover:text-gray-600 transition-colors">Accueil</a>
          <span aria-hidden>/</span>
          <span className="text-gray-600" aria-current="page">Données de marché</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Données de marché
          </h1>
          <div className="flex items-center gap-3">
            {demo && <DemoBadge />}
            <span className="text-xs text-gray-500">
              Via {provider.name}
            </span>
          </div>
        </div>

        <p className="text-gray-500 text-lg max-w-2xl">
          Derniers cours disponibles pour les ETF suivis. Les données sont
          différées (fin de journée sur le plan gratuit). Source et horodatage
          affichés sur chaque carte.
        </p>
      </div>

      {/* Market grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map(({ quote, error }) => (
          <MarketCard key={quote.symbol} quote={quote} error={error} />
        ))}
      </div>

      {/* Provider info */}
      <div className="mt-10 card bg-gray-50 border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          À propos des données
        </h2>
        <ul className="text-xs text-gray-500 space-y-1.5 leading-relaxed">
          <li>
            • <strong>Fournisseur :</strong>{" "}
            {provider.name === "YahooFinance" ? "Yahoo Finance" : provider.name}
            {demo && " (mode démo — données illustratives, pas des cours réels)"}
          </li>
          <li>
            • <strong>Délai :</strong> Données de fin de journée sur le plan
            gratuit. Aucune donnée temps réel n&apos;est proposée.
          </li>
          <li>
            • <strong>Rafraîchissement :</strong> les cours sont actualisés
            automatiquement, plusieurs fois par jour.
          </li>
        </ul>
      </div>

      {/* Legal */}
      <p className="mt-6 text-xs text-gray-500 text-center">
        Données indicatives uniquement. Pas de conseil en investissement. Les
        cours réels peuvent différer.
      </p>
    </div>
  );
}
