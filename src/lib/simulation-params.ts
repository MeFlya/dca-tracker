// Serialization helpers for shareable simulator URLs.
// Intentionally framework-free — no React, no Next.js imports.

import { SimulatorInput } from "./simulator";

// URL param keys — kept short for readable URLs
const KEYS = {
  monthly: "monthly",
  years: "years",
  annualReturn: "return", // "return" is valid as a URL param key
  fees: "fees",
  inflation: "inflation",
  inflationOn: "inflationOn",
} as const;

// Must match the slider ranges in SimulatorForm
const BOUNDS = {
  monthlyAmount:    { min: 25,  max: 5000, default: 200  },
  durationYears:    { min: 1,   max: 40,   default: 20   },
  annualReturnPct:  { min: 1,   max: 15,   default: 7    },
  annualFeesPct:    { min: 0,   max: 2,    default: 0.3  },
  annualInflationPct: { min: 0, max: 10,   default: 2    },
} as const;

function parseNum(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (raw === null) return fallback;
  const v = parseFloat(raw);
  if (!isFinite(v) || isNaN(v)) return fallback;
  return Math.min(Math.max(v, min), max);
}

export interface SimulationShareParams {
  input: SimulatorInput;
  /** Whether the inflation row is toggled on */
  inflationEnabled: boolean;
}

/**
 * Deserialize URLSearchParams → SimulationShareParams.
 * Every field is validated; invalid values silently fall back to defaults.
 */
export function paramsFromSearch(
  search: URLSearchParams
): SimulationShareParams {
  const b = BOUNDS;
  const inflationEnabled = search.get(KEYS.inflationOn) === "1";

  return {
    inflationEnabled,
    input: {
      monthlyAmount: parseNum(
        search.get(KEYS.monthly),
        b.monthlyAmount.default,
        b.monthlyAmount.min,
        b.monthlyAmount.max
      ),
      durationYears: parseNum(
        search.get(KEYS.years),
        b.durationYears.default,
        b.durationYears.min,
        b.durationYears.max
      ),
      annualReturnPct: parseNum(
        search.get(KEYS.annualReturn),
        b.annualReturnPct.default,
        b.annualReturnPct.min,
        b.annualReturnPct.max
      ),
      annualFeesPct: parseNum(
        search.get(KEYS.fees),
        b.annualFeesPct.default,
        b.annualFeesPct.min,
        b.annualFeesPct.max
      ),
      // Inflation value is always stored (even when disabled) so the slider
      // position is preserved when the user toggles it back on.
      annualInflationPct: parseNum(
        search.get(KEYS.inflation),
        b.annualInflationPct.default,
        b.annualInflationPct.min,
        b.annualInflationPct.max
      ),
    },
  };
}

/**
 * Serialize SimulationShareParams → URLSearchParams.
 * Always encodes all numeric fields. Omits inflationOn when false.
 */
export function paramsToSearch(p: SimulationShareParams): URLSearchParams {
  const s = new URLSearchParams();
  s.set(KEYS.monthly, String(p.input.monthlyAmount));
  s.set(KEYS.years, String(p.input.durationYears));
  s.set(KEYS.annualReturn, String(p.input.annualReturnPct));
  s.set(KEYS.fees, String(p.input.annualFeesPct));
  // Always persist the inflation value so toggling on/off round-trips cleanly
  s.set(
    KEYS.inflation,
    String(p.input.annualInflationPct ?? BOUNDS.annualInflationPct.default)
  );
  if (p.inflationEnabled) s.set(KEYS.inflationOn, "1");
  return s;
}

/** Returns true when at least one recognized param is present in the URL */
export function hasSimulationParams(search: URLSearchParams): boolean {
  return [
    KEYS.monthly,
    KEYS.years,
    KEYS.annualReturn,
    KEYS.fees,
  ].some((k) => search.has(k));
}

// ─── Portfolio mode (Option C — passe une allocation depuis /allocation-portefeuille) ──

/** Allocation item as serialized in URL : displaySymbol + weight (0-100). */
export interface PortfolioAllocation {
  displaySymbol: string;
  weight: number;
}

/**
 * Parse `etfs=CW8:80,AEEM:20` → array of allocations.
 * Returns null if param missing or invalid.
 * Caller is responsible for verifying the displaySymbols exist in
 * the ETF catalog before using them.
 */
export function parsePortfolioFromSearch(
  search: URLSearchParams
): PortfolioAllocation[] | null {
  const raw = search.get("etfs");
  if (!raw) return null;
  const items = raw
    .split(",")
    .map((pair) => {
      const [sym, w] = pair.split(":");
      const weight = parseFloat(w);
      if (!sym || !isFinite(weight) || weight < 0 || weight > 100) return null;
      return { displaySymbol: sym.trim().toUpperCase(), weight };
    })
    .filter((x): x is PortfolioAllocation => x !== null);
  return items.length > 0 ? items : null;
}

/** Serialize an allocation into URL fragment `CW8:80.0,AEEM:20.0`. */
export function portfolioToSearchFragment(items: PortfolioAllocation[]): string {
  return items
    .map((i) => `${i.displaySymbol}:${i.weight.toFixed(1)}`)
    .join(",");
}
