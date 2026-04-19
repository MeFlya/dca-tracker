// Badge system — pure math on logged entries, no storage needed.
// Badges are earned permanently once achieved (even if streak breaks or
// portfolio value drops below threshold later).
// Client-safe: no server imports.

import { previousMonth } from "./strategy-math";

export type BadgeId =
  | "first-log"
  | "quarter"
  | "year-one"
  | "milestone-10k"
  | "milestone-50k";

export type Badge = {
  id: BadgeId;
  icon: string;
  label: string;
  desc: string;
};

// Display order = badge earning order (first-log earned first, milestone-50k last).
export const BADGES: Badge[] = [
  {
    id: "first-log",
    icon: "🌱",
    label: "Premier log",
    desc: "Premier mois enregistré",
  },
  {
    id: "quarter",
    icon: "⚡",
    label: "Premier trimestre",
    desc: "3 mois consécutifs de suivi",
  },
  {
    id: "year-one",
    icon: "🏆",
    label: "1 an complet",
    desc: "12 mois consécutifs — top 10 % des investisseurs",
  },
  {
    id: "milestone-10k",
    icon: "💰",
    label: "10 000 € franchis",
    desc: "Portefeuille au-dessus de 10 000 €",
  },
  {
    id: "milestone-50k",
    icon: "💎",
    label: "50 000 € franchis",
    desc: "Portefeuille au-dessus de 50 000 €",
  },
];

export const BADGE_BY_ID = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
) as Record<BadgeId, Badge>;

// ─── Math ─────────────────────────────────────────────────────────────────────

export type EntryLike = { month: string; portfolioValue: number };

/** Longest run of consecutive months in the history (not just trailing). */
export function maxConsecutiveMonths(months: string[]): number {
  if (!months.length) return 0;
  const sorted = [...new Set(months)].sort();
  let max = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === previousMonth(sorted[i - 1] /* inverted */)) {
      // shouldn't happen — sorted ascending
    }
    // expected next = previousMonth(sorted[i]) should equal sorted[i-1]
    const expectedPrev = previousMonth(sorted[i]);
    if (expectedPrev === sorted[i - 1]) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return max;
}

/** Peak portfolio value ever logged. */
export function maxPortfolioValueEver(entries: EntryLike[]): number {
  if (!entries.length) return 0;
  return Math.max(...entries.map((e) => e.portfolioValue));
}

/** Compute earned badges from entries — permanent once earned. */
export function computeEarnedBadges(entries: EntryLike[]): Set<BadgeId> {
  const earned = new Set<BadgeId>();
  if (!entries.length) return earned;

  earned.add("first-log");

  const maxStreak = maxConsecutiveMonths(entries.map((e) => e.month));
  if (maxStreak >= 3) earned.add("quarter");
  if (maxStreak >= 12) earned.add("year-one");

  const maxValue = maxPortfolioValueEver(entries);
  if (maxValue >= 10_000) earned.add("milestone-10k");
  if (maxValue >= 50_000) earned.add("milestone-50k");

  return earned;
}

/** Next unearned badge (in display order) + progress toward it, if computable. */
export function nextBadge(
  entries: EntryLike[],
): { badge: Badge; progressText: string } | null {
  const earned = computeEarnedBadges(entries);

  for (const badge of BADGES) {
    if (earned.has(badge.id)) continue;

    const progressText = badgeProgressText(badge.id, entries);
    return { badge, progressText };
  }
  return null;
}

function badgeProgressText(id: BadgeId, entries: EntryLike[]): string {
  switch (id) {
    case "first-log":
      return "Enregistrez votre premier mois";
    case "quarter": {
      const streak = maxConsecutiveMonths(entries.map((e) => e.month));
      const remaining = 3 - streak;
      return remaining <= 1
        ? "Plus que 1 mois"
        : `Plus que ${remaining} mois`;
    }
    case "year-one": {
      const streak = maxConsecutiveMonths(entries.map((e) => e.month));
      const remaining = 12 - streak;
      return `Plus que ${remaining} mois consécutifs`;
    }
    case "milestone-10k": {
      const max = maxPortfolioValueEver(entries);
      const remaining = Math.max(0, 10_000 - max);
      return `Plus que ${remaining.toLocaleString("fr-FR")} € avant 10 000 €`;
    }
    case "milestone-50k": {
      const max = maxPortfolioValueEver(entries);
      const remaining = Math.max(0, 50_000 - max);
      return `Plus que ${remaining.toLocaleString("fr-FR")} € avant 50 000 €`;
    }
  }
}
