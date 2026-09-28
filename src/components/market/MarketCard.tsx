import { AssetQuote } from "@/lib/market-data/types";
import { ETF_LIST } from "@/lib/etf-config";
import { formatCurrency, formatPercentSansSigne, formatDate } from "@/lib/utils";
import { DelayedBadge } from "@/components/ui/Disclaimer";
import { IssuerLogoMark, issuerLabelFromName } from "@/components/ui/IssuerLogoMark";
import { RegionMark } from "@/components/ui/RegionMark";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  quote: AssetQuote;
  error?: string | null;
}

// ─── Recherche interne (28/09/2026) ─────────────────────────────────────────
// Cours, variation, devise, horodatage et carte d'erreur portent data-nosearch :
// ce sont les valeurs du moment du build. L'index ne change qu'au déploiement
// suivant, la page se revalide toutes les 5 minutes — un extrait afficherait
// « 438,72 € ▲ 0,49 % … Mis à jour : 28 sept. » des semaines plus tard.
// Le ticker, l'indice et l'émetteur restent indexés : ils servent la recherche.
export function MarketCard({ quote, error }: MarketCardProps) {
  if (error) {
    return (
      <div data-nosearch="" className="card border-red-100 bg-red-50 flex flex-col gap-2">
        <p className="text-sm font-semibold text-red-700">{quote.symbol}</p>
        <p className="text-xs text-red-500">Données indisponibles : {error}</p>
      </div>
    );
  }

  const positive = quote.changePercent >= 0;
  // Mappe le ticker API (ex. "CW8.PA") vers les métadonnées connues pour
  // afficher "CW8 · MSCI World" + logo émetteur plutôt que le symbole brut.
  const etf = ETF_LIST.find((e) => e.symbol === quote.symbol);

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200">
      {/* Identité — symbole connu + émetteur + région */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {etf && <IssuerLogoMark name={etf.name} height={34} className="shrink-0" />}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                {etf?.displaySymbol ?? quote.symbol}
              </span>
              {quote.isDelayed && <DelayedBadge />}
            </div>
            <span className="text-[11px] text-gray-400 tabular-nums">{quote.symbol}</span>
          </div>
        </div>
        {etf ? (
          <RegionMark region={etf.region} size={18} className="shrink-0 mt-0.5" />
        ) : (
          <span className="text-xs text-gray-500 shrink-0">{quote.exchange}</span>
        )}
      </div>

      {/* Indice suivi · émetteur */}
      <p className="text-sm text-gray-500 mb-4 leading-snug">
        {etf
          ? `${etf.indexLabel}${issuerLabelFromName(etf.name) ? ` · ${issuerLabelFromName(etf.name)}` : ""}`
          : quote.name}
      </p>

      {/* Price + change */}
      <div data-nosearch="" className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">
          {formatCurrency(quote.price, quote.currency)}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-sm font-semibold tabular-nums",
            positive ? "text-gain-dark" : "text-loss-dark"
          )}
        >
          <span>{positive ? "▲" : "▼"}</span>
          {formatPercentSansSigne(quote.changePercent)}
        </span>
      </div>

      {/* Change absolute */}
      <div data-nosearch="" className="flex justify-between text-xs text-gray-500">
        <span>
          Variation :{" "}
          <span
            className={cn(
              "font-medium",
              positive ? "text-gain-dark" : "text-loss-dark"
            )}
          >
            {positive ? "+" : ""}
            {formatCurrency(quote.change, quote.currency)}
          </span>
        </span>
        <span>Devise : {quote.currency}</span>
      </div>

      {/* Timestamp */}
      <p data-nosearch="" className="mt-3 text-xs text-gray-500 border-t border-gray-50 pt-3">
        Mis à jour : {formatDate(quote.lastUpdated)}
      </p>
    </div>
  );
}
