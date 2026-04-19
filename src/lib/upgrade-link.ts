import type { SimulatorInput } from "./simulator";

/**
 * Build a URL to /upgrade that preserves the user's current simulator params.
 * This lets the upgrade page show per-user projection (their Monte Carlo,
 * their theoretical value at month 12) instead of generic examples.
 */
export function buildUpgradeUrl(feature: string, input?: SimulatorInput): string {
  const params = new URLSearchParams({ feature });
  if (input) {
    params.set("monthly", String(input.monthlyAmount));
    params.set("years", String(input.durationYears));
    params.set("return", String(input.annualReturnPct));
    params.set("fees", String(input.annualFeesPct));
  }
  return `/upgrade?${params.toString()}`;
}
