// Public aggregate stats — cached 24h. Used by homepage social proof
// AND the /communaute page. Privacy-preserving: only returns data from
// bins with ≥ 3 users; individual users never identifiable.

import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { normalizeEntry } from "@/lib/user-strategy";
import { maxConsecutiveMonths } from "@/lib/badges";

export const dynamic = "force-dynamic";

type PublicStats = {
  users: number;
  strategies: number;
  monthsLogged: number;

  // Community / distribution data (each bin requires ≥ MIN_BIN users)
  monthlyAmountDistribution: { bin: string; count: number }[];
  durationDistribution: { bin: string; count: number }[];
  streakDistribution: { bin: string; count: number }[];

  // Aggregate milestones
  usersWithStreak3Plus: number;
  usersWithStreak12Plus: number;
  usersWithStreak24Plus: number;

  updatedAt: string;
};

const FALLBACK: PublicStats = {
  users: 0,
  strategies: 0,
  monthsLogged: 0,
  monthlyAmountDistribution: [],
  durationDistribution: [],
  streakDistribution: [],
  usersWithStreak3Plus: 0,
  usersWithStreak12Plus: 0,
  usersWithStreak24Plus: 0,
  updatedAt: new Date().toISOString(),
};

// Privacy: never expose bins with fewer than this many users
const MIN_BIN = 3;

// ⚠️ NE JAMAIS RÉINTRODUIRE DE PLANCHER ICI.
//
// Cette route servait des constantes (247 / 180 / 620) via Math.max() quand le
// compte réel était plus bas, sous un label « Données réelles ». Trois raisons
// de ne pas y revenir : le repo est public (le trucage était lisible par
// n'importe qui), le positionnement du site est « formules vérifiables, pas de
// boîte noire », et le sujet est financier. Un chiffre honnête et modeste vaut
// mieux qu'un chiffre flatteur et faux.
//
// Le bloc d'affichage (LiveSocialProof) se masque tout seul tant que les
// compteurs réels n'ont pas dépassé son seuil — c'est le bon comportement.

function binMonthlyAmount(amount: number): string {
  if (amount < 100) return "< 100 €";
  if (amount < 200) return "100-200 €";
  if (amount < 300) return "200-300 €";
  if (amount < 500) return "300-500 €";
  if (amount < 1000) return "500-1 000 €";
  return "≥ 1 000 €";
}

function binDuration(years: number): string {
  if (years < 10) return "< 10 ans";
  if (years < 15) return "10-15 ans";
  if (years < 20) return "15-20 ans";
  if (years < 25) return "20-25 ans";
  if (years < 30) return "25-30 ans";
  return "≥ 30 ans";
}

function binStreak(months: number): string {
  if (months === 0) return "0 (pas commencé)";
  if (months < 3) return "1-2 mois";
  if (months < 6) return "3-5 mois";
  if (months < 12) return "6-11 mois";
  if (months < 24) return "1-2 ans";
  return "≥ 2 ans";
}

function orderedCount(map: Map<string, number>, order: string[]) {
  return order
    .map((bin) => ({ bin, count: map.get(bin) ?? 0 }))
    .filter((e) => e.count >= MIN_BIN);
}

export async function GET() {
  try {
    const clerk = await clerkClient();

    let users = 0;
    let strategies = 0;
    let monthsLogged = 0;

    const monthlyMap = new Map<string, number>();
    const durationMap = new Map<string, number>();
    const streakMap = new Map<string, number>();

    let usersWithStreak3Plus = 0;
    let usersWithStreak12Plus = 0;
    let usersWithStreak24Plus = 0;

    let offset = 0;
    const limit = 100;

    while (true) {
      const { data } = await clerk.users.getUserList({ limit, offset });
      if (!data.length) break;

      for (const user of data) {
        users++;
        const priv = (user.privateMetadata ?? {}) as Record<string, unknown>;

        const rawStrategy = priv.dcaStrategy as
          | { input?: { monthlyAmount?: number; durationYears?: number } }
          | undefined;
        if (rawStrategy) {
          strategies++;

          const monthly = rawStrategy.input?.monthlyAmount ?? 0;
          const duration = rawStrategy.input?.durationYears ?? 0;
          if (monthly > 0) {
            const bin = binMonthlyAmount(monthly);
            monthlyMap.set(bin, (monthlyMap.get(bin) ?? 0) + 1);
          }
          if (duration > 0) {
            const bin = binDuration(duration);
            durationMap.set(bin, (durationMap.get(bin) ?? 0) + 1);
          }
        }

        const rawEntries = (priv.dcaEntries as unknown[] | undefined) ?? [];
        const entries = rawEntries.map(normalizeEntry);
        monthsLogged += entries.length;

        // Max consecutive streak ever (permanent achievement)
        const streak = maxConsecutiveMonths(entries.map((e) => e.month));
        const streakBin = binStreak(streak);
        streakMap.set(streakBin, (streakMap.get(streakBin) ?? 0) + 1);

        if (streak >= 3) usersWithStreak3Plus++;
        if (streak >= 12) usersWithStreak12Plus++;
        if (streak >= 24) usersWithStreak24Plus++;
      }

      if (data.length < limit) break;
      offset += limit;
    }

    const stats: PublicStats = {
      users,
      strategies,
      monthsLogged,
      monthlyAmountDistribution: orderedCount(monthlyMap, [
        "< 100 €",
        "100-200 €",
        "200-300 €",
        "300-500 €",
        "500-1 000 €",
        "≥ 1 000 €",
      ]),
      durationDistribution: orderedCount(durationMap, [
        "< 10 ans",
        "10-15 ans",
        "15-20 ans",
        "20-25 ans",
        "25-30 ans",
        "≥ 30 ans",
      ]),
      streakDistribution: orderedCount(streakMap, [
        "1-2 mois",
        "3-5 mois",
        "6-11 mois",
        "1-2 ans",
        "≥ 2 ans",
      ]),
      usersWithStreak3Plus,
      usersWithStreak12Plus,
      usersWithStreak24Plus,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(stats, {
      headers: {
        // 5 min browser + CDN cache, 1h stale-while-revalidate.
        // Short TTL so floor/real-count changes propagate quickly. Previous
        // 24h cache meant users saw stale "3 investisseurs" for a full day
        // after the floor was raised.
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[stats/public] Failed to aggregate:", err);
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
