// Pure math helpers for strategy tracking — safe to import in both client and server code.

import type { SimulatorInput } from "./simulator";

function monthlyRate(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

/** Theoretical portfolio value after exactly N months of DCA. */
export function theoreticalValueAtMonth(input: SimulatorInput, months: number): number {
  if (months <= 0) return 0;
  const netAnnual = input.annualReturnPct - input.annualFeesPct;
  const r = monthlyRate(Math.max(netAnnual, 0));
  let value = 0;
  for (let m = 0; m < months; m++) {
    value = (value + input.monthlyAmount) * (1 + r);
  }
  return Math.round(value);
}

/** Months elapsed from "YYYY-MM" to today. */
export function monthsElapsed(startMonth: string): number {
  const [y, m] = startMonth.split("-").map(Number);
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
}

/** Current month as "YYYY-MM". */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Previous month as "YYYY-MM". */
export function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

/**
 * Interest earned this month = portfolio delta − what the user invested.
 * Requires 2 consecutive-month entries. Returns null otherwise.
 */
export function computeInterestSnapshot(
  entries: { month: string; invested: number; portfolioValue: number }[],
): { interest: number; invested: number; delta: number; month: string } | null {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];

  if (prev.month !== previousMonth(latest.month)) return null;

  const delta = latest.portfolioValue - prev.portfolioValue;
  const interest = delta - latest.invested;

  return { interest, invested: latest.invested, delta, month: latest.month };
}

/**
 * Active streak — number of consecutive trailing months with a logged entry.
 * Grace period: last entry can be current OR previous month (user hasn't
 * logged this month yet, but is still on track).
 * If last entry is 2+ months old → streak = 0 (broken).
 */
export function computeStreak(entryMonths: string[]): number {
  if (!entryMonths.length) return 0;

  const months = [...new Set(entryMonths)].sort().reverse(); // newest first
  const last = months[0];
  const cur = currentMonth();
  const prev = previousMonth(cur);

  if (last !== cur && last !== prev) return 0;

  let streak = 1;
  let expected = previousMonth(last);
  for (let i = 1; i < months.length; i++) {
    if (months[i] === expected) {
      streak++;
      expected = previousMonth(expected);
    } else {
      break;
    }
  }
  return streak;
}

/** Next streak milestone in months (3, 6, 12, 24) or null if past all. */
export function nextStreakMilestone(streak: number): number | null {
  const milestones = [3, 6, 12, 24];
  return milestones.find((m) => streak < m) ?? null;
}
