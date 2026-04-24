// Shown when a user has canceled Premium/Pro but still has saved strategy data.
// Teases what's preserved (month count, badges, strategy params) without
// revealing portfolio values. Strong re-activation CTA.
// Server component — renders from props passed by the account page.

import Link from "next/link";
import { formatEur } from "@/lib/simulator";
import { computeEarnedBadges, BADGES } from "@/lib/badges";
import { maxConsecutiveMonths } from "@/lib/badges";
import type { Strategy, MonthlyEntry } from "@/lib/user-strategy";

export function ReLockedStrategy({
  strategy,
  entries,
}: {
  strategy: Strategy;
  entries: MonthlyEntry[];
}) {
  const earnedBadges = computeEarnedBadges(entries);
  const maxStreak = maxConsecutiveMonths(entries.map((e) => e.month));
  const monthsLogged = entries.length;

  return (
    <div className="rounded-2xl border-2 border-primary-200 bg-white overflow-hidden shadow-sm">
      {/* Banner */}
      <div className="bg-gradient-to-br from-primary-600 to-blue-700 px-6 py-7 text-white">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <LockIcon />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight mb-1">
              Votre dashboard vous attend
            </p>
            <p className="text-primary-200 text-sm leading-relaxed">
              Toutes vos données sont préservées — réactivez Premium pour
              retrouver votre suivi intact.
            </p>
          </div>
        </div>
      </div>

      {/* Teaser stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
          <Stat value={`${monthsLogged}`} label={monthsLogged > 1 ? "mois loggués" : "mois loggué"} />
          <Stat value={`${earnedBadges.size}/${BADGES.length}`} label="badges gagnés" />
          <Stat value={formatEur(strategy.input.monthlyAmount)} label="/mois · stratégie" />
        </div>

        {/* Locked content list */}
        <div className="space-y-2 mb-5">
          <LockedRow label="Votre stratégie DCA sauvegardée" />
          <LockedRow label={`Historique complet · ${monthsLogged} mois`} />
          <LockedRow label="Insights (avance/retard sur projection)" />
          <LockedRow label={`Série maximale : ${maxStreak} mois consécutifs`} />
          {monthsLogged >= 12 && (
            <LockedRow label="Comparaison 12 mois · débloquée" highlight />
          )}
        </div>

        {/* Warning */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-5">
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Vos données sont conservées</strong> tant que vous ne
            supprimez pas votre compte. Vous pouvez réactiver à tout moment et
            retrouver tout en un clic — streak, badges, historique et
            projections inclus.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/tarifs"
            className="btn-primary flex-1 text-center text-sm py-3"
          >
            Réactiver Premium — 4,90 €/mois →
          </Link>
          <Link
            href="/tarifs#annual"
            className="btn-secondary text-center text-sm py-3 px-4"
          >
            Voir annuel
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center py-3 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums leading-none mb-1">
        {value}
      </p>
      <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
    </div>
  );
}

function LockedRow({ label, highlight = false }: { label: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${highlight ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
      <LockIconSmall className={highlight ? "text-blue-500" : "text-gray-500"} />
      <span className={`text-sm ${highlight ? "text-blue-900 font-semibold" : "text-gray-600"}`}>
        {label}
      </span>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function LockIconSmall({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
