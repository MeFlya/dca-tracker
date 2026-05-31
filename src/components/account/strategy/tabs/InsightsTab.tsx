"use client";

import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Flame,
  Activity,
  Sparkles,
} from "lucide-react";
import { formatEur } from "@/lib/simulator";
import {
  BADGES,
  computeEarnedBadges,
  nextBadge,
  getInvestorLevel,
  type InvestorLevel,
} from "@/lib/badges";
import { computeStreak, currentMonth } from "@/lib/strategy-math";
import { rhythmLabel, rhythmDescription } from "@/lib/strategy-insights";
import { useStrategy } from "../StrategyContext";
import { MetricCard } from "../components/MetricCard";
import { formatMonthLabel } from "../components/utils";

export function InsightsTab() {
  const { entries, insights } = useStrategy();

  if (!entries.length || !insights) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Enregistrez au moins un mois pour voir vos insights.
        </p>
      </div>
    );
  }

  const i = insights;
  const needMoreData = entries.length < 3;

  return (
    <div className="space-y-5">
      {/* ── Top metrics grid ──────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Métriques clés</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {i.monthsLogged < 3 ? (
            <MetricCard
              label="Score de discipline"
              value="En cours"
              subvalue="Disponible après 3 mois de suivi"
              tone="muted"
            />
          ) : (
            <MetricCard
              label="Score de discipline"
              value={`${i.disciplineScore}/100`}
              subvalue={`${i.monthsLogged}/${i.monthsSinceStart} mois loggés`}
              tone={i.disciplineScore >= 80 ? "positive" : i.disciplineScore >= 50 ? "default" : "muted"}
            />
          )}
          <MetricCard
            label="Série actuelle"
            value={`${i.currentStreak} mois`}
            subvalue={`record : ${i.maxStreakEver} mois`}
            icon={<Flame size={12} />}
            tone={i.currentStreak > 0 ? "default" : "muted"}
          />
          <MetricCard
            label="Gains générés"
            value={
              i.cumulativeInterest >= 0
                ? `+${formatEur(i.cumulativeInterest)}`
                : `−${formatEur(Math.abs(i.cumulativeInterest))}`
            }
            subvalue={`${i.gainSharePct.toFixed(1)} % du portefeuille`}
            tone={i.cumulativeInterest >= 0 ? "positive" : "negative"}
          />
          <MetricCard
            label="Contributions"
            value={String(i.totalContributionCount)}
            subvalue={`${i.avgContribsPerMonth.toFixed(1)} / mois en moyenne`}
          />
          <MetricCard
            label="Mois en avance"
            value={String(i.monthsAhead)}
            subvalue={`sur ${i.monthsLogged} mois loggés`}
            tone={i.monthsAhead > i.monthsBehind ? "positive" : "muted"}
          />
          <MetricCard
            label="Mois en retard"
            value={String(i.monthsBehind)}
            subvalue={
              i.avgMonthlyDelta >= 0
                ? `drift moyen +${formatEur(i.avgMonthlyDelta)}`
                : `drift moyen ${formatEur(i.avgMonthlyDelta)}`
            }
            tone={i.monthsBehind > i.monthsAhead ? "negative" : "muted"}
          />
        </div>
      </section>

      {/* ── Rhythm card ───────────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Rythme de versement</SectionLabel>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
              <Activity size={18} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <p className="text-base font-bold text-gray-900">
                  {rhythmLabel(i.rhythm)}
                </p>
                <span className="text-xs text-gray-500 tabular-nums">
                  {i.avgContribsPerMonth.toFixed(1)} contribution
                  {i.avgContribsPerMonth >= 2 ? "s" : ""} / mois
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {rhythmDescription(i.rhythm)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Best / worst month ───────────────────────────────────────────── */}
      {!needMoreData && (i.bestMonth || i.worstMonth) && (
        <section>
          <SectionLabel>Points remarquables</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {i.bestMonth && (
              <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Meilleur mois
                  </p>
                </div>
                <p className="text-sm text-emerald-900 mb-1 capitalize font-semibold">
                  {formatMonthLabel(i.bestMonth.month)}
                </p>
                <p className="text-2xl font-bold text-emerald-800 tabular-nums leading-none mb-1.5">
                  +{formatEur(i.bestMonth.delta)}
                </p>
                <p className="text-xs text-emerald-700">
                  au-dessus de la projection théorique
                </p>
              </div>
            )}

            {i.worstMonth && i.worstMonth.month !== i.bestMonth?.month && (
              <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={14} className="text-orange-600" />
                  <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                    Mois le plus difficile
                  </p>
                </div>
                <p className="text-sm text-orange-900 mb-1 capitalize font-semibold">
                  {formatMonthLabel(i.worstMonth.month)}
                </p>
                <p className="text-2xl font-bold text-orange-800 tabular-nums leading-none mb-1.5">
                  {i.worstMonth.delta >= 0 ? "+" : "−"}
                  {formatEur(Math.abs(i.worstMonth.delta))}
                </p>
                <p className="text-xs text-orange-700">
                  {i.worstMonth.delta >= 0
                    ? "au-dessus de la projection"
                    : "sous la projection théorique"}
                </p>
              </div>
            )}

            {i.largestContributionMonth && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-amber-600" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Mois le plus investi
                  </p>
                </div>
                <p className="text-sm text-gray-900 mb-1 capitalize font-semibold">
                  {formatMonthLabel(i.largestContributionMonth.month)}
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none mb-1.5">
                  {formatEur(i.largestContributionMonth.invested)}
                </p>
                <p className="text-xs text-gray-500">
                  {i.largestContributionMonth.contributionCount} contribution
                  {i.largestContributionMonth.contributionCount > 1 ? "s" : ""}{" "}
                  ce mois
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-primary-600" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Drift moyen vs projection
                </p>
              </div>
              <p
                className={`text-2xl font-bold tabular-nums leading-none mb-1.5 ${
                  i.avgMonthlyDelta >= 0 ? "text-emerald-700" : "text-orange-600"
                }`}
              >
                {i.avgMonthlyDelta >= 0 ? "+" : "−"}
                {formatEur(Math.abs(i.avgMonthlyDelta))}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Écart moyen entre votre portefeuille réel et la projection théorique,
                chaque mois.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Badges ───────────────────────────────────────────────────────── */}
      <BadgeSection />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

// ─── Badges section ───────────────────────────────────────────────────────────

// Thèmes de couleur par niveau (classes Tailwind complètes — pas de
// concaténation dynamique, sinon le purge les supprimerait).
const LEVEL_STYLES: Record<
  InvestorLevel["accent"],
  { ring: string; bg: string; text: string; bar: string }
> = {
  slate:  { ring: "border-slate-200",  bg: "bg-slate-50",  text: "text-slate-700",  bar: "bg-slate-400"  },
  amber:  { ring: "border-amber-200",  bg: "bg-amber-50",  text: "text-amber-800",  bar: "bg-amber-500"  },
  zinc:   { ring: "border-zinc-200",   bg: "bg-zinc-50",   text: "text-zinc-700",   bar: "bg-zinc-400"   },
  yellow: { ring: "border-yellow-200", bg: "bg-yellow-50", text: "text-yellow-800", bar: "bg-yellow-500" },
  sky:    { ring: "border-sky-200",    bg: "bg-sky-50",    text: "text-sky-800",    bar: "bg-sky-500"    },
  violet: { ring: "border-violet-200", bg: "bg-violet-50", text: "text-violet-800", bar: "bg-violet-500" },
};

function BadgeSection() {
  const { entries } = useStrategy();
  const earned = computeEarnedBadges(entries);
  const next = nextBadge(entries);
  const level = getInvestorLevel(entries);
  const ls = LEVEL_STYLES[level.accent];

  const months = entries.map((e) => e.month);
  const streak = computeStreak(months);
  const loggedThisMonth = months.includes(currentMonth());
  const streakAtRisk = streak > 0 && !loggedThisMonth;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} />
          Niveau & achievements
        </p>
        <span className="text-xs text-gray-500 tabular-nums">
          {earned.size}/{BADGES.length} débloqués
        </span>
      </div>

      {/* ── Carte niveau — récompense l'ancienneté (le moat) ─────────────── */}
      <div className={`rounded-2xl border ${ls.ring} ${ls.bg} p-5 mb-3`}>
        <div className="flex items-center gap-4">
          <div className="text-3xl leading-none shrink-0" aria-hidden>
            {level.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <p className={`text-sm font-bold ${ls.text}`}>
                Niveau {level.name}
              </p>
              <span className="text-xs text-gray-500 tabular-nums shrink-0">
                {level.monthsLogged} mois suivis
              </span>
            </div>
            {level.nextName ? (
              <>
                <div className="h-1.5 rounded-full bg-white/70 overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${ls.bar} rounded-full transition-all`}
                    style={{ width: `${level.progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Plus que{" "}
                  <strong className="text-gray-700">
                    {level.monthsToNext} mois
                  </strong>{" "}
                  avant le niveau {level.nextName}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">
                Niveau maximum atteint — discipline exemplaire 🎩
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Série en danger — incite à logger ce mois ───────────────────── */}
      {streakAtRisk && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 mb-3 flex items-center gap-2.5">
          <Flame size={16} className="text-orange-500 shrink-0" />
          <p className="text-xs text-orange-800 leading-snug">
            <strong>Série de {streak} mois en cours</strong> — enregistrez ce
            mois-ci pour ne pas la perdre.
          </p>
        </div>
      )}

      {/* ── Grille de badges ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
          {BADGES.map((badge) => {
            const isEarned = earned.has(badge.id);
            return (
              <div
                key={badge.id}
                title={`${badge.label} — ${badge.desc}`}
                className={`aspect-square flex flex-col items-center justify-center gap-0.5 rounded-xl border text-center px-1 py-2 ${
                  isEarned
                    ? "bg-amber-50 border-amber-200 animate-badge-pop"
                    : "bg-gray-50 border-gray-100 opacity-40 grayscale"
                }`}
              >
                <span className="text-xl leading-none">{badge.icon}</span>
                <span
                  className={`text-[9px] leading-tight font-semibold ${
                    isEarned ? "text-amber-900" : "text-gray-500"
                  }`}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>

        {next && (
          <p className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 leading-snug">
            Prochain :{" "}
            <strong className="text-gray-900">
              {next.badge.icon} {next.badge.label}
            </strong>
            {" · "}
            <span className="text-gray-500">{next.progressText}</span>
          </p>
        )}
      </div>
    </section>
  );
}
