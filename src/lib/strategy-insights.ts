// Advanced derived insights for the strategy dashboard.
// Pure math — client-safe.

import type { SimulatorInput } from "./simulator";
import type { MonthlyEntry } from "./user-strategy";
import {
  theoreticalValueAtMonth,
  addMonths,
  currentMonth,
} from "./strategy-math";
import { maxConsecutiveMonths } from "./badges";

export type RhythmKind = "monthly" | "bi-monthly" | "weekly" | "irregular" | "missed";

export type MonthBreakdown = {
  month: string;
  invested: number;
  portfolioValue: number;
  theoretical: number;
  delta: number;
  contributionCount: number;
};

export type Insights = {
  // Totals
  totalInvested: number;
  totalContributionCount: number;
  currentPortfolioValue: number;
  totalGain: number;
  performancePct: number;
  gainSharePct: number;              // gains / portfolio * 100
  cumulativeInterest: number;        // portfolio - totalInvested (gains, aggregate)

  // Time
  monthsSinceStart: number;
  monthsLogged: number;
  disciplineScore: number;           // 0-100, % of months since start that are logged

  // Rhythm
  avgContribsPerMonth: number;
  rhythm: RhythmKind;

  // Best/worst
  bestMonth: MonthBreakdown | null;  // highest delta vs theoretical
  worstMonth: MonthBreakdown | null; // lowest delta vs theoretical
  largestContributionMonth: MonthBreakdown | null;

  // Ahead / behind
  monthsAhead: number;
  monthsBehind: number;
  avgMonthlyDelta: number;

  // Streaks
  currentStreak: number;
  maxStreakEver: number;

  // Per-month breakdowns (sorted by month ascending)
  breakdowns: MonthBreakdown[];
};

function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}

function activeStreak(months: string[]): number {
  if (!months.length) return 0;
  const sorted = [...new Set(months)].sort().reverse();
  const last = sorted[0];
  const cur = currentMonth();
  const prev = addMonths(cur, -1);
  if (last !== cur && last !== prev) return 0;

  let streak = 1;
  let expected = addMonths(last, -1);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === expected) {
      streak++;
      expected = addMonths(expected, -1);
    } else {
      break;
    }
  }
  return streak;
}

function detectRhythm(breakdowns: MonthBreakdown[]): {
  rhythm: RhythmKind;
  avg: number;
} {
  if (!breakdowns.length) return { rhythm: "irregular", avg: 0 };

  const counts = breakdowns.map((b) => b.contributionCount);
  const avg = counts.reduce((s, c) => s + c, 0) / counts.length;

  // Variance
  const variance = counts.reduce((s, c) => s + Math.pow(c - avg, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);

  // Classification
  if (breakdowns.length < 2) {
    if (avg >= 3) return { rhythm: "weekly", avg };
    if (avg >= 1.5) return { rhythm: "bi-monthly", avg };
    return { rhythm: "monthly", avg };
  }

  // High variance → irregular
  if (stdDev > 1.2) return { rhythm: "irregular", avg };

  if (avg >= 3) return { rhythm: "weekly", avg };
  if (avg >= 1.5) return { rhythm: "bi-monthly", avg };
  return { rhythm: "monthly", avg };
}

export function rhythmLabel(r: RhythmKind): string {
  switch (r) {
    case "monthly": return "Mensuelle";
    case "bi-monthly": return "Bi-mensuelle";
    case "weekly": return "Hebdomadaire";
    case "irregular": return "Irrégulière";
    case "missed": return "Interrompue";
  }
}

export function rhythmDescription(r: RhythmKind): string {
  switch (r) {
    case "monthly": return "Un versement par mois — le rythme DCA classique.";
    case "bi-monthly": return "Deux versements par mois en moyenne.";
    case "weekly": return "Versements réguliers, cadence hebdomadaire ou plus.";
    case "irregular": return "Cadence variable — utile de regarder si ça colle à vos revenus.";
    case "missed": return "Des mois sans versement. C'est fréquent, pas grave — la constance compte plus que la perfection.";
  }
}

export function computeInsights(
  input: SimulatorInput,
  startMonth: string,
  entries: MonthlyEntry[],
): Insights | null {
  if (!entries.length) return null;

  // Build per-month breakdowns
  const breakdowns: MonthBreakdown[] = entries.map((e) => {
    const monthIndex = monthsBetween(startMonth, e.month);
    const theoretical = theoreticalValueAtMonth(input, monthIndex);
    return {
      month: e.month,
      invested: e.invested,
      portfolioValue: e.portfolioValue,
      theoretical,
      delta: e.portfolioValue - theoretical,
      contributionCount: e.contributions.length,
    };
  });

  // Totals
  const totalInvested = entries.reduce((s, e) => s + e.invested, 0);
  const totalContributionCount = entries.reduce((s, e) => s + e.contributions.length, 0);
  const latest = entries[entries.length - 1];
  const currentPortfolioValue = latest.portfolioValue;
  const totalGain = currentPortfolioValue - totalInvested;
  const performancePct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const gainSharePct = currentPortfolioValue > 0 ? (totalGain / currentPortfolioValue) * 100 : 0;

  // Time
  const monthsSinceStart = Math.max(1, monthsBetween(startMonth, currentMonth()));
  const monthsLogged = entries.length;
  const disciplineScore = Math.min(100, Math.round((monthsLogged / monthsSinceStart) * 100));

  // Rhythm
  const { rhythm: rhythmKind, avg: avgContribsPerMonth } = detectRhythm(breakdowns);

  // Best / worst
  const sortedByDelta = [...breakdowns].sort((a, b) => b.delta - a.delta);
  const bestMonth = sortedByDelta[0] ?? null;
  const worstMonth = sortedByDelta[sortedByDelta.length - 1] ?? null;
  const sortedByInvested = [...breakdowns].sort((a, b) => b.invested - a.invested);
  const largestContributionMonth = sortedByInvested[0] ?? null;

  // Ahead / behind
  const monthsAhead = breakdowns.filter((b) => b.delta > 0).length;
  const monthsBehind = breakdowns.filter((b) => b.delta < 0).length;
  const avgMonthlyDelta =
    breakdowns.reduce((s, b) => s + b.delta, 0) / breakdowns.length;

  // Streaks
  const monthList = entries.map((e) => e.month);
  const currentStreak = activeStreak(monthList);
  const maxStreakEver = maxConsecutiveMonths(monthList);

  return {
    totalInvested,
    totalContributionCount,
    currentPortfolioValue,
    totalGain,
    performancePct,
    gainSharePct,
    cumulativeInterest: totalGain,

    monthsSinceStart,
    monthsLogged,
    disciplineScore,

    avgContribsPerMonth,
    rhythm: rhythmKind,

    bestMonth,
    worstMonth,
    largestContributionMonth,

    monthsAhead,
    monthsBehind,
    avgMonthlyDelta,

    currentStreak,
    maxStreakEver,

    breakdowns,
  };
}
