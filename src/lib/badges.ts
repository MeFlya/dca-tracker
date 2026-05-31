// Badge system — pure math on logged entries, no storage needed.
// Badges are earned permanently once achieved (even if streak breaks or
// portfolio value drops below threshold later).
// Client-safe: no server imports.

import { previousMonth } from "./strategy-math";

export type BadgeId =
  | "first-log"
  | "quarter"
  | "half-year"
  | "year-one"
  | "two-years"
  | "milestone-10k"
  | "milestone-50k"
  | "milestone-100k"
  | "milestone-250k"
  | "milestone-500k"
  | "diamond-hands"
  | "dedication";

export type Badge = {
  id: BadgeId;
  icon: string;
  label: string;
  desc: string;
};

// Display order = badge earning order (régularité d'abord, paliers ensuite,
// comportement à la fin).
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
    id: "half-year",
    icon: "🔥",
    label: "6 mois de série",
    desc: "6 mois consécutifs — la régularité paie",
  },
  {
    id: "year-one",
    icon: "🏆",
    label: "1 an complet",
    desc: "12 mois consécutifs — top 10 % des investisseurs",
  },
  {
    id: "two-years",
    icon: "👑",
    label: "2 ans de série",
    desc: "24 mois consécutifs — discipline exemplaire",
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
  {
    id: "milestone-100k",
    icon: "🚀",
    label: "100 000 € franchis",
    desc: "Six chiffres — portefeuille au-dessus de 100 000 €",
  },
  {
    id: "milestone-250k",
    icon: "🏔️",
    label: "250 000 € franchis",
    desc: "Portefeuille au-dessus de 250 000 €",
  },
  {
    id: "milestone-500k",
    icon: "🌍",
    label: "500 000 € franchis",
    desc: "Portefeuille au-dessus de 500 000 €",
  },
  {
    id: "diamond-hands",
    icon: "💪",
    label: "Mains de diamant",
    desc: "Resté investi alors que le portefeuille était sous le capital investi",
  },
  {
    id: "dedication",
    icon: "📅",
    label: "36 mois loggés",
    desc: "36 mois de suivi au total — un vrai marathonien du DCA",
  },
];

export const BADGE_BY_ID = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
) as Record<BadgeId, Badge>;

// ─── Math ─────────────────────────────────────────────────────────────────────

export type EntryLike = {
  month: string;
  portfolioValue: number;
  /** Somme des contributions du mois — optionnel (pour le badge "mains de diamant"). */
  invested?: number;
};

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

/**
 * "Mains de diamant" : l'user a continué à logger alors que son portefeuille
 * était passé SOUS le capital cumulé investi (en moins-value latente) — preuve
 * qu'il n'a pas paniqué/vendu pendant une baisse. On exige un mois ultérieur
 * loggé après le mois sous l'eau (sinon ce n'est pas de la résilience, juste
 * une perte au dernier point). Nécessite `invested` sur les entries.
 */
function hasHeldThroughLoss(entries: EntryLike[]): boolean {
  const sorted = [...entries]
    .filter((e) => e.invested != null)
    .sort((a, b) => a.month.localeCompare(b.month));
  if (sorted.length < 2) return false;

  let cumInvested = 0;
  for (let idx = 0; idx < sorted.length; idx++) {
    cumInvested += sorted[idx].invested ?? 0;
    const underwater = sorted[idx].portfolioValue < cumInvested;
    // Sous l'eau ET il existe un mois loggé plus tard → il a tenu.
    if (underwater && idx < sorted.length - 1) return true;
  }
  return false;
}

/** Nombre de mois distincts loggés (pas forcément consécutifs). */
export function totalMonthsLogged(entries: EntryLike[]): number {
  return new Set(entries.map((e) => e.month)).size;
}

/** Compute earned badges from entries — permanent once earned. */
export function computeEarnedBadges(entries: EntryLike[]): Set<BadgeId> {
  const earned = new Set<BadgeId>();
  if (!entries.length) return earned;

  earned.add("first-log");

  const maxStreak = maxConsecutiveMonths(entries.map((e) => e.month));
  if (maxStreak >= 3) earned.add("quarter");
  if (maxStreak >= 6) earned.add("half-year");
  if (maxStreak >= 12) earned.add("year-one");
  if (maxStreak >= 24) earned.add("two-years");

  const maxValue = maxPortfolioValueEver(entries);
  if (maxValue >= 10_000) earned.add("milestone-10k");
  if (maxValue >= 50_000) earned.add("milestone-50k");
  if (maxValue >= 100_000) earned.add("milestone-100k");
  if (maxValue >= 250_000) earned.add("milestone-250k");
  if (maxValue >= 500_000) earned.add("milestone-500k");

  if (hasHeldThroughLoss(entries)) earned.add("diamond-hands");
  if (totalMonthsLogged(entries) >= 36) earned.add("dedication");

  return earned;
}

// ─── Niveaux d'investisseur ───────────────────────────────────────────────────
//
// Le niveau récompense l'ANCIENNETÉ (nb de mois loggés au total) — c'est le
// vrai moat : plus on a suivi longtemps, plus on a investi de soi dans l'outil,
// plus partir fait mal. On progresse en continuant à logger, mois après mois.

export type InvestorLevel = {
  /** Index du palier (0 = Nouveau … 5 = Diamant). */
  tier: number;
  name: string;
  icon: string;
  /** Classe de couleur Tailwind pour le thème (texte/bordure). */
  accent: "slate" | "amber" | "zinc" | "yellow" | "sky" | "violet";
  monthsLogged: number;
  /** Seuil du niveau actuel (mois). */
  currentThreshold: number;
  /** Seuil du prochain niveau, ou null si déjà au max. */
  nextThreshold: number | null;
  nextName: string | null;
  /** Progression vers le prochain niveau (0–100). 100 si au max. */
  progressPct: number;
  monthsToNext: number | null;
};

const LEVEL_TIERS: { min: number; name: string; icon: string; accent: InvestorLevel["accent"] }[] = [
  { min: 0,  name: "Nouveau",  icon: "🌱", accent: "slate"  },
  { min: 1,  name: "Bronze",   icon: "🥉", accent: "amber"  },
  { min: 6,  name: "Argent",   icon: "🥈", accent: "zinc"   },
  { min: 12, name: "Or",       icon: "🥇", accent: "yellow" },
  { min: 24, name: "Platine",  icon: "💠", accent: "sky"    },
  { min: 36, name: "Diamant",  icon: "💎", accent: "violet" },
];

export function getInvestorLevel(entries: EntryLike[]): InvestorLevel {
  const months = totalMonthsLogged(entries);

  // Palier courant = dernier seuil <= months.
  let idx = 0;
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (months >= LEVEL_TIERS[i].min) idx = i;
  }
  const cur = LEVEL_TIERS[idx];
  const next = LEVEL_TIERS[idx + 1] ?? null;

  const progressPct = next
    ? Math.round(((months - cur.min) / (next.min - cur.min)) * 100)
    : 100;

  return {
    tier: idx,
    name: cur.name,
    icon: cur.icon,
    accent: cur.accent,
    monthsLogged: months,
    currentThreshold: cur.min,
    nextThreshold: next ? next.min : null,
    nextName: next ? next.name : null,
    progressPct: Math.max(0, Math.min(100, progressPct)),
    monthsToNext: next ? next.min - months : null,
  };
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

function streakRemainingText(entries: EntryLike[], target: number): string {
  const streak = maxConsecutiveMonths(entries.map((e) => e.month));
  const remaining = Math.max(1, target - streak);
  return remaining <= 1 ? "Plus que 1 mois" : `Plus que ${remaining} mois consécutifs`;
}

function valueRemainingText(entries: EntryLike[], target: number): string {
  const max = maxPortfolioValueEver(entries);
  const remaining = Math.max(0, target - max);
  return `Plus que ${remaining.toLocaleString("fr-FR")} € avant ${target.toLocaleString("fr-FR")} €`;
}

function badgeProgressText(id: BadgeId, entries: EntryLike[]): string {
  switch (id) {
    case "first-log":
      return "Enregistrez votre premier mois";
    case "quarter":
      return streakRemainingText(entries, 3);
    case "half-year":
      return streakRemainingText(entries, 6);
    case "year-one":
      return streakRemainingText(entries, 12);
    case "two-years":
      return streakRemainingText(entries, 24);
    case "milestone-10k":
      return valueRemainingText(entries, 10_000);
    case "milestone-50k":
      return valueRemainingText(entries, 50_000);
    case "milestone-100k":
      return valueRemainingText(entries, 100_000);
    case "milestone-250k":
      return valueRemainingText(entries, 250_000);
    case "milestone-500k":
      return valueRemainingText(entries, 500_000);
    case "diamond-hands":
      return "Continuez à logger, même quand le marché baisse";
    case "dedication": {
      const total = totalMonthsLogged(entries);
      const remaining = Math.max(1, 36 - total);
      return `Plus que ${remaining} mois au total`;
    }
  }
}
