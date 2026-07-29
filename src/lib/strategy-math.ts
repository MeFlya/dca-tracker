// Pure math helpers for strategy tracking — safe to import in both client and server code.

import type { SimulatorInput } from "./simulator";

function monthlyRate(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

/** Theoretical portfolio value after exactly N months of DCA.
 *  Starts from the capital already invested (input.startingCapital, 0 by default),
 *  which compounds alongside the monthly contributions. */
export function theoreticalValueAtMonth(input: SimulatorInput, months: number): number {
  const startingCapital = Math.max(input.startingCapital ?? 0, 0);
  if (months <= 0) return Math.round(startingCapital);
  const netAnnual = input.annualReturnPct - input.annualFeesPct;
  const r = monthlyRate(Math.max(netAnnual, 0));
  let value = startingCapital;
  for (let m = 0; m < months; m++) {
    value = (value + input.monthlyAmount) * (1 + r);
  }
  return Math.round(value);
}

// ─── Le mois courant se calcule dans le fuseau de l'AUDIENCE ────────────────
//
// `new Date().getMonth()` répond dans le fuseau du RUNTIME. Sur Vercel c'est
// UTC ; dans le navigateur d'un lecteur français c'est Europe/Paris. Les deux
// divergeaient donc pendant une à deux heures au passage de chaque mois :
// le 1er août à 1 h 30 à Paris, le serveur répondait « 2026-07 » quand
// l'utilisateur vivait « 2026-08 ».
//
// Ce n'est pas cosmétique — `currentMonth()` décide du mois sous lequel une
// saisie est ENREGISTRÉE (LogMonthModal), du mois de départ proposé par
// l'assistant, et de la détection d'un mois manqué par le cron. Une saisie
// faite dans cette fenêtre partait sur le mois précédent, et le cron pouvait
// réclamer un mois déjà saisi.
//
// Le site s'adresse à des résidents fiscaux français : Europe/Paris est la
// référence, et elle donne le même résultat côté serveur et côté navigateur.
const FUSEAU_AUDIENCE = "Europe/Paris";

function moisDansFuseau(d: Date): { y: number; m: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU_AUDIENCE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(d);
  return {
    y: Number(parts.find((p) => p.type === "year")!.value),
    m: Number(parts.find((p) => p.type === "month")!.value),
  };
}

/** Months elapsed from "YYYY-MM" to today. */
export function monthsElapsed(startMonth: string): number {
  const [y, m] = startMonth.split("-").map(Number);
  const now = moisDansFuseau(new Date());
  return (now.y - y) * 12 + (now.m - m);
}

/** Current month as "YYYY-MM", dans le fuseau de l'audience. */
export function currentMonth(): string {
  const { y, m } = moisDansFuseau(new Date());
  return `${y}-${String(m).padStart(2, "0")}`;
}

/**
 * Année courante dans le fuseau de l'audience.
 *
 * Même piège que le mois, en plus rare et plus coûteux : le 1er janvier avant
 * 1 h à Paris, un runtime en UTC répond encore l'année précédente. Sur le récap
 * fiscal — une fonctionnalité payante dont l'objet même est l'année civile —
 * ce serait le pire moment pour se tromper.
 */
export function currentYear(): number {
  return moisDansFuseau(new Date()).y;
}

/** Previous month as "YYYY-MM". */
export function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

/** Shift "YYYY-MM" by delta months (positive or negative). */
export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const newY = Math.floor(total / 12);
  const newM = (total % 12) + 1;
  return `${newY}-${String(newM).padStart(2, "0")}`;
}

/**
 * Year-over-year comparison — latest entry vs entry from 12 months ago.
 * Returns null if no entry exists exactly 12 months before the latest.
 */
export function computeYearOverYear(
  entries: { month: string; portfolioValue: number }[],
): {
  currentMonth: string;
  previousYearMonth: string;
  currentValue: number;
  previousValue: number;
  delta: number;
  growthPct: number;
} | null {
  if (entries.length < 12) return null;

  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const targetMonth = addMonths(latest.month, -12);

  const prevYear = sorted.find((e) => e.month === targetMonth);
  if (!prevYear) return null;

  const delta = latest.portfolioValue - prevYear.portfolioValue;
  const growthPct =
    prevYear.portfolioValue > 0 ? (delta / prevYear.portfolioValue) * 100 : 0;

  return {
    currentMonth: latest.month,
    previousYearMonth: prevYear.month,
    currentValue: latest.portfolioValue,
    previousValue: prevYear.portfolioValue,
    delta,
    growthPct,
  };
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
