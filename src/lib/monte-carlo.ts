// Geometric Brownian Motion Monte Carlo for DCA simulations.
// Runs N_SCENARIOS independent paths and returns annual percentile bands.

import type { SimulatorInput } from "./simulator";

export interface MonteCarloDataPoint {
  year: number;
  p10: number;   // 10th percentile — pire cas réaliste
  p50: number;   // médiane
  p90: number;   // 90th percentile — meilleur cas réaliste
  invested: number;
}

export interface MonteCarloResult {
  data: MonteCarloDataPoint[];
  finalP10: number;
  finalP50: number;
  finalP90: number;
  probabilityPositive: number; // % des scénarios où portefeuille > capital investi
}

const N_SCENARIOS = 1000;

// Box-Muller: produces standard normal samples from two uniform draws
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function percentile(sorted: number[], p: number): number {
  return sorted[Math.floor(p * sorted.length)];
}

export function runMonteCarlo(
  input: SimulatorInput,
  volatilityPct = 15 // historical ETF annual volatility — ~15% for MSCI World
): MonteCarloResult {
  const { monthlyAmount, durationYears, annualReturnPct, annualFeesPct } = input;
  const netAnnualReturn = (annualReturnPct - annualFeesPct) / 100;
  const totalMonths = durationYears * 12;

  // GBM monthly parameters
  const annualSigma = volatilityPct / 100;
  const monthlySigma = annualSigma / Math.sqrt(12);
  // Drift: log(1+R)/12 - σ²/2 ensures the expected annual compound = R
  const drift = Math.log(1 + netAnnualReturn) / 12 - (monthlySigma * monthlySigma) / 2;

  // yearlyValues[yearIdx][scenarioIdx]
  const yearlyValues: Float64Array[] = Array.from(
    { length: durationYears },
    () => new Float64Array(N_SCENARIOS)
  );

  for (let s = 0; s < N_SCENARIOS; s++) {
    let portfolio = 0;
    for (let m = 1; m <= totalMonths; m++) {
      const monthlyReturn = Math.exp(drift + monthlySigma * randn()) - 1;
      portfolio = (portfolio + monthlyAmount) * (1 + monthlyReturn);
      if (m % 12 === 0) {
        yearlyValues[m / 12 - 1][s] = portfolio;
      }
    }
  }

  const data: MonteCarloDataPoint[] = yearlyValues.map((vals, i) => {
    const sorted = Array.from(vals).sort((a, b) => a - b);
    return {
      year: i + 1,
      p10: Math.round(percentile(sorted, 0.1)),
      p50: Math.round(percentile(sorted, 0.5)),
      p90: Math.round(percentile(sorted, 0.9)),
      invested: Math.round(monthlyAmount * (i + 1) * 12),
    };
  });

  const finalSorted = Array.from(yearlyValues[durationYears - 1]).sort((a, b) => a - b);
  const totalInvested = monthlyAmount * totalMonths;

  return {
    data,
    finalP10: Math.round(percentile(finalSorted, 0.1)),
    finalP50: Math.round(percentile(finalSorted, 0.5)),
    finalP90: Math.round(percentile(finalSorted, 0.9)),
    probabilityPositive: Math.round(
      (Array.from(yearlyValues[durationYears - 1]).filter((v) => v > totalInvested).length /
        N_SCENARIOS) *
        100
    ),
  };
}
