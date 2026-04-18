import Link from "next/link";
import { ETFConfig } from "@/lib/etf-config";
import { AssetQuote } from "@/lib/market-data/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { DelayedBadge } from "@/components/ui/Disclaimer";
import { cn } from "@/lib/utils";

interface ETFCardProps {
  etf: ETFConfig;
  quote?: AssetQuote | null;
  error?: string | null;
}

export function ETFCard({ etf, quote, error }: ETFCardProps) {
  const positive = (quote?.changePercent ?? 0) >= 0;

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200 flex flex-col gap-4">
      {/* Header — symbol + name link to detail page */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/etf/${etf.displaySymbol}`}
          className="group flex flex-col gap-0.5 min-w-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {etf.displaySymbol}
            </span>
            {quote?.isDelayed && <DelayedBadge />}
          </div>
          <p className="text-sm text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
            {etf.name}
          </p>
        </Link>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="px-2 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-500">
            {etf.category}
          </span>
          {etf.peaEligible && (
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold tracking-wide">
              PEA
            </span>
          )}
        </div>
      </div>

      {/* Price block */}
      {error ? (
        <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
          Cours indisponible
        </div>
      ) : quote ? (
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            {formatCurrency(quote.price, quote.currency)}
          </span>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              positive ? "text-gain" : "text-loss"
            )}
          >
            {formatPercent(quote.changePercent)}
          </span>
        </div>
      ) : (
        <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-32" />
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <MetaRow label="TER" value={`${etf.ter} %`} />
        <MetaRow label="Réplication" value={etf.replicationMethod} />
        <MetaRow label="Distribution" value={etf.distributionPolicy} />
        {quote?.exchange && (
          <MetaRow label="Bourse" value={quote.exchange} />
        )}
        {etf.isin && <MetaRow label="ISIN" value={etf.isin} mono />}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
        {etf.description}
      </p>

      {/* CTAs */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/simulateur?monthly=200&years=20&return=7&fees=${etf.ter}`}
          className="btn-primary text-xs px-3 py-2 flex-1 justify-center"
        >
          Simuler →
        </Link>
        <Link
          href={`/etf/${etf.displaySymbol}`}
          className="btn-secondary text-xs px-3 py-2 flex-1 justify-center"
        >
          Voir le détail
        </Link>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-gray-400">{label} : </span>
      <span className={cn("text-gray-700 font-medium", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
