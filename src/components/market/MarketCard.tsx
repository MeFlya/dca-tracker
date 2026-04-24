import { AssetQuote } from "@/lib/market-data/types";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { DelayedBadge } from "@/components/ui/Disclaimer";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  quote: AssetQuote;
  error?: string | null;
}

export function MarketCard({ quote, error }: MarketCardProps) {
  if (error) {
    return (
      <div className="card border-red-100 bg-red-50 flex flex-col gap-2">
        <p className="text-sm font-semibold text-red-700">{quote.symbol}</p>
        <p className="text-xs text-red-500">Données indisponibles : {error}</p>
      </div>
    );
  }

  const positive = quote.changePercent >= 0;

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200">
      {/* Symbol + exchange */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{quote.symbol}</span>
          {quote.isDelayed && <DelayedBadge />}
        </div>
        <span className="text-xs text-gray-500">{quote.exchange}</span>
      </div>

      {/* Name */}
      <p className="text-sm text-gray-500 mb-4 leading-snug">{quote.name}</p>

      {/* Price + change */}
      <div className="flex items-baseline gap-3 mb-4">
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
          {formatPercent(Math.abs(quote.changePercent))}
        </span>
      </div>

      {/* Change absolute */}
      <div className="flex justify-between text-xs text-gray-500">
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
      <p className="mt-3 text-xs text-gray-500 border-t border-gray-50 pt-3">
        Mis à jour : {formatDate(quote.lastUpdated)}
      </p>
    </div>
  );
}
