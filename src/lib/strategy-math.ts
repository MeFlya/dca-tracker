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
