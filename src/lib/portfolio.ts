/**
 * Multi-ETF portfolio blending.
 *
 * Lets the user combine multiple ETFs with weights to compute :
 * - Weighted-average expected return
 * - Weighted-average TER
 * - Per-ETF breakdown (monthly amount, position size, contribution to return)
 *
 * Then this can be fed into runSimulation() for a DCA projection.
 *
 * IMPORTANT — what we model and what we don't :
 * - We assume a CONSTANT allocation : monthly contributions are split
 *   pro-rata across all ETFs at each step. We do NOT model rebalancing
 *   over time (winning ETFs become overweight, the user manually
 *   rebalances or doesn't).
 * - We use a STATIC expected-return-by-region map. Real ETF returns are
 *   path-dependent and vary year to year. The map represents long-term
 *   historical averages — conservative for forecasting.
 * - We do NOT account for currency hedging cost or correlation effects
 *   between ETFs.
 *
 * Sources for the expected-return map :
 * - MSCI World index 30-yr CAGR ≈ 7-8 %/an (1995-2025).
 * - S&P 500 historical real returns ≈ 9-10 %/an, more volatile.
 * - MSCI Emerging Markets long-term ≈ 7-9 %/an, much higher volatility.
 * - Eurostoxx 50 long-term ≈ 5-7 %/an, lower than US.
 * - Topix Japan ≈ 4-6 %/an (post-1990 lost decades, recovering).
 * - MSCI Small Cap World ≈ 8-9 %/an, premium small-cap historique.
 * - Bloomberg Aggregate Bond ≈ 2-4 %/an, low volatility.
 *
 * These numbers are CONSERVATIVE versions of the historical averages.
 * Update if the source benchmarks shift materially.
 */

import type { ETFConfig, ETFRegion } from "./etf-config";

/** Long-term expected returns per region, in % per year (gross of fees). */
export const EXPECTED_RETURN_BY_REGION: Record<ETFRegion, number> = {
  monde: 7.5,
  usa: 9.0,
  europe: 6.0,
  emergents: 8.0,
  japon: 5.0,
  "small-cap": 8.5,
  obligations: 3.0,
};

export interface PortfolioItem {
  etf: ETFConfig;
  /** Weight as a percentage (0-100). Should sum to 100 across the portfolio. */
  weight: number;
}

export interface PortfolioBreakdownRow {
  etf: ETFConfig;
  weight: number;
  /** Monthly amount allocated to this ETF (€). */
  monthlyAmount: number;
  /** Expected gross return for this ETF based on its region. */
  expectedReturn: number;
  /** TER of this ETF (% per year). */
  ter: number;
  /** Contribution to the blended return (= weight × expectedReturn / 100). */
  returnContribution: number;
  /** Contribution to the blended TER (= weight × ter / 100). */
  terContribution: number;
}

export interface BlendedPortfolio {
  /** Sum of weights — should equal 100 if portfolio is well-formed. */
  totalWeight: number;
  /** True if totalWeight is within 0.01 of 100. */
  isBalanced: boolean;
  /** Weighted gross expected return (% per year). */
  blendedReturn: number;
  /** Weighted TER (% per year). */
  blendedTer: number;
  /** Net expected return after fees (= blendedReturn − blendedTer). */
  blendedNetReturn: number;
  /** Per-ETF breakdown, ordered same as input. */
  breakdown: PortfolioBreakdownRow[];
  /** True if any ETF in the portfolio is NOT PEA-eligible. */
  hasNonPeaEtf: boolean;
}

/**
 * Compute the blended portfolio from items + monthly amount.
 *
 * If the weights don't sum to 100 (e.g. user sliding mid-edit), we use
 * the weights as-is for breakdown, but flag isBalanced = false. The
 * UI should guide the user back to 100.
 */
export function blendPortfolio(
  items: PortfolioItem[],
  monthlyAmount: number
): BlendedPortfolio {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const isBalanced = Math.abs(totalWeight - 100) < 0.01;

  let blendedReturn = 0;
  let blendedTer = 0;
  let hasNonPeaEtf = false;

  const breakdown: PortfolioBreakdownRow[] = items.map((item) => {
    const expectedReturn = EXPECTED_RETURN_BY_REGION[item.etf.region];
    const ter = item.etf.ter;
    const monthlyAllocated = (item.weight / 100) * monthlyAmount;

    const returnContribution = (item.weight / 100) * expectedReturn;
    const terContribution = (item.weight / 100) * ter;

    blendedReturn += returnContribution;
    blendedTer += terContribution;
    if (!item.etf.peaEligible) hasNonPeaEtf = true;

    return {
      etf: item.etf,
      weight: item.weight,
      monthlyAmount: monthlyAllocated,
      expectedReturn,
      ter,
      returnContribution,
      terContribution,
    };
  });

  // Round to 2-3 decimals at the source — prevents float drift from leaking
  // into every display site (e.g. "7.149999999 %" instead of "7.15 %").
  // The DCA simulation engine uses these as inputs so rounding here avoids
  // the noise everywhere downstream.
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  return {
    totalWeight,
    isBalanced,
    blendedReturn: round2(blendedReturn),
    blendedTer: round3(blendedTer),
    blendedNetReturn: round2(blendedReturn - blendedTer),
    breakdown,
    hasNonPeaEtf,
  };
}

/**
 * Auto-rebalance weights so they sum to exactly 100.
 * Strategy : scale each weight pro-rata to the current total.
 * If totalWeight is 0, evenly distribute.
 */
export function rebalanceToHundred(items: PortfolioItem[]): PortfolioItem[] {
  if (items.length === 0) return [];
  const total = items.reduce((s, i) => s + i.weight, 0);
  if (total === 0) {
    // Even split
    const even = 100 / items.length;
    return items.map((i) => ({ ...i, weight: even }));
  }
  const scaled = items.map((i) => ({
    ...i,
    weight: (i.weight / total) * 100,
  }));
  // Round each to 1 decimal, then fix the residual on the last item to ensure
  // the sum is exactly 100 (rounding can otherwise leave 99.9 or 100.1).
  const rounded = scaled.map((i, idx) =>
    idx < scaled.length - 1
      ? { ...i, weight: Math.round(i.weight * 10) / 10 }
      : i
  );
  const sumAllButLast = rounded
    .slice(0, -1)
    .reduce((s, i) => s + i.weight, 0);
  rounded[rounded.length - 1] = {
    ...rounded[rounded.length - 1],
    weight: Math.round((100 - sumAllButLast) * 10) / 10,
  };
  return rounded;
}

// ─── Preset portfolios — common allocations for educational pre-fill ────────

export interface PortfolioPreset {
  id: string;
  name: string;
  description: string;
  /** Slugs (= displaySymbol or symbol prefix) and their weights. */
  allocation: Array<{ displaySymbol: string; weight: number }>;
}

export const PORTFOLIO_PRESETS: PortfolioPreset[] = [
  {
    id: "world-100",
    name: "MSCI World seul (100 %)",
    description:
      "Le portefeuille le plus simple : un seul ETF mondial. Diversifié sur ~1 500 entreprises, 23 pays développés. Le point d'entrée recommandé pour la majorité des DCA débutants.",
    allocation: [{ displaySymbol: "CW8", weight: 100 }],
  },
  {
    id: "world-em-80-20",
    name: "Monde + émergents (80/20)",
    description:
      "Allocation classique pour ajouter de la croissance émergente sans trop de volatilité. 80 % MSCI World, 20 % marchés émergents.",
    allocation: [
      { displaySymbol: "CW8", weight: 80 },
      { displaySymbol: "AEEM", weight: 20 },
    ],
  },
  {
    id: "world-em-bond-70-20-10",
    name: "Diversifié 70/20/10",
    description:
      "Trois piliers : 70 % monde développé, 20 % émergents, 10 % obligations. La répartition la plus équilibrée pour les profils prudents en DCA long-terme.",
    allocation: [
      { displaySymbol: "CW8", weight: 70 },
      { displaySymbol: "AEEM", weight: 20 },
      { displaySymbol: "C3M", weight: 10 },
    ],
  },
  {
    id: "world-smallcap-90-10",
    name: "Monde + small caps (90/10)",
    description:
      "Le tilt small-cap historique : 90 % MSCI World pour la base, 10 % small caps mondiales pour capter le premium small-cap (excès de rendement long-terme observé empiriquement).",
    allocation: [
      { displaySymbol: "CW8", weight: 90 },
      { displaySymbol: "IUSN", weight: 10 },
    ],
  },
];
