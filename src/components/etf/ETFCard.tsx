import Link from "next/link";
import { ETFConfig } from "@/lib/etf-config";
import { formatTer } from "@/lib/utils";
import { IssuerLogoMark, issuerLabelFromName } from "@/components/ui/IssuerLogoMark";
import { RegionMark } from "@/components/ui/RegionMark";
import { PAGE_EMETTEUR } from "@/lib/sources-etf";
import { cn } from "@/lib/utils";

// 14/10/2026 : la carte n'affiche plus de cours ni de variation. Ils venaient
// de Yahoo Finance, dont les conditions interdisent l'usage commercial et la
// collecte automatique (décision du 14/10/2026). À la place : où lire la
// valeur liquidative, publiée par l'émetteur — un lien quand l'adresse de la
// page du fonds a été vérifiée (PAGE_EMETTEUR), sinon le nom de l'émetteur.
// La ligne « Bourse », tirée du cours, est retirée avec lui.

interface ETFCardProps {
  etf: ETFConfig;
}

export function ETFCard({ etf }: ETFCardProps) {
  const page = PAGE_EMETTEUR[etf.displaySymbol];
  const emetteur = issuerLabelFromName(etf.name);

  return (
    <div className="card card-hover flex flex-col gap-4">
      {/* Header — symbol + name link to detail page */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/etf/${etf.displaySymbol}`}
          className="group flex items-start gap-2.5 min-w-0"
        >
          <IssuerLogoMark name={etf.name} height={38} className="mt-0.5" />
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {etf.displaySymbol}
              </span>
            </span>
            <span className="block text-sm text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
              {etf.name}
            </span>
            <span className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium text-gray-500">
              <RegionMark region={etf.region} size={14} />
              {etf.indexLabel}
            </span>
          </span>
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

      {/* Valeur liquidative — data-nosearch : ligne répétée sur chaque
          carte, pas un contenu à trouver. */}
      <div
        data-nosearch=""
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs bg-slate-50 border border-slate-200/70 rounded-lg px-3 py-2"
      >
        <span className="text-gray-600">Valeur liquidative</span>
        {page ? (
          <a
            href={page.url}
            target="_blank"
            rel="noopener"
            className="font-medium text-primary-700 hover:underline"
          >
            Voir la {page.libelle}
            <span aria-hidden> ↗</span>
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        ) : emetteur ? (
          <span className="font-medium text-gray-700">publiée par {emetteur}</span>
        ) : null}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <MetaRow label="TER" value={formatTer(etf.ter)} />
        <MetaRow label="Réplication" value={etf.replicationMethod} />
        <MetaRow label="Distribution" value={etf.distributionPolicy} />
        {etf.isin && <MetaRow label="ISIN" value={etf.isin} mono />}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
        {etf.description}
      </p>

      {/* CTAs — data-nosearch : « Simuler → Voir le détail », répété sur
          chaque carte, n'est pas un contenu à trouver. */}
      <div data-nosearch="" className="flex gap-2 mt-auto">
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
      <span className="text-gray-500">{label} : </span>
      <span className={cn("text-gray-700 font-medium", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
