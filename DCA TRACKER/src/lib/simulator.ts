// DCA simulation logic — mathematically correct monthly compounding.
// All monetary values are in the same currency as the input (EUR by default).

export interface SimulatorInput {
  monthlyAmount: number;    // EUR per month
  durationYears: number;    // investment horizon
  annualReturnPct: number;  // gross annual return (%)
  annualFeesPct: number;    // TER / annual fees (%)
  annualInflationPct?: number; // optional inflation for real-value output
}

export interface MonthlyDataPoint {
  month: number;            // 1-based
  year: number;             // e.g. 1, 2, 3...
  invested: number;
  portfolioValue: number;
  gain: number;
}

export interface ScenarioResult {
  label: "Conservateur" | "Base" | "Optimiste";
  annualReturnPct: number;
  totalInvested: number;
  finalValue: number;
  totalGain: number;
  gainPercent: number;
  inflationAdjustedValue?: number;
  monthlyData: MonthlyDataPoint[];
}

export interface SimulatorOutput {
  input: SimulatorInput;
  base: ScenarioResult;
  conservative: ScenarioResult;
  optimistic: ScenarioResult;
}

// Scenario spread around the user's base return assumption
const SCENARIO_DELTA = 2; // ±2 percentage points

function monthlyRate(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

function runScenario(
  input: SimulatorInput,
  grossAnnualReturn: number,
  label: ScenarioResult["label"]
): ScenarioResult {
  const { monthlyAmount, durationYears, annualFeesPct, annualInflationPct } =
    input;

  // Net return after fees (annual, then converted to monthly)
  const netAnnualReturn = grossAnnualReturn - annualFeesPct;
  const r = monthlyRate(Math.max(netAnnualReturn, 0));
  const n = durationYears * 12;

  const monthlyData: MonthlyDataPoint[] = [];
  let portfolioValue = 0;
  let totalInvested = 0;

  for (let m = 1; m <= n; m++) {
    // Contribute at beginning of month, then compound
    portfolioValue = (portfolioValue + monthlyAmount) * (1 + r);
    totalInvested += monthlyAmount;

    if (m % 12 === 0 || m === n) {
      monthlyData.push({
        month: m,
        year: Math.ceil(m / 12),
        invested: Math.round(totalInvested),
        portfolioValue: Math.round(portfolioValue),
        gain: Math.round(portfolioValue - totalInvested),
      });
    }
  }

  const finalValue = portfolioValue;
  const totalGain = finalValue - totalInvested;
  const gainPercent =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  let inflationAdjustedValue: number | undefined;
  if (annualInflationPct !== undefined && annualInflationPct > 0) {
    inflationAdjustedValue =
      finalValue / Math.pow(1 + annualInflationPct / 100, durationYears);
  }

  return {
    label,
    annualReturnPct: grossAnnualReturn,
    totalInvested: Math.round(totalInvested),
    finalValue: Math.round(finalValue),
    totalGain: Math.round(totalGain),
    gainPercent: Math.round(gainPercent * 10) / 10,
    inflationAdjustedValue: inflationAdjustedValue
      ? Math.round(inflationAdjustedValue)
      : undefined,
    monthlyData,
  };
}

export function runSimulation(input: SimulatorInput): SimulatorOutput {
  const base = runScenario(input, input.annualReturnPct, "Base");
  const conservative = runScenario(
    input,
    Math.max(input.annualReturnPct - SCENARIO_DELTA, 0.1),
    "Conservateur"
  );
  const optimistic = runScenario(
    input,
    input.annualReturnPct + SCENARIO_DELTA,
    "Optimiste"
  );

  return { input, base, conservative, optimistic };
}

// Format helpers
export function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} %`;
}
