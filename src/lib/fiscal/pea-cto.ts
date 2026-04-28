/**
 * PEA vs CTO fiscal calculator.
 *
 * Tax rates and rules are based on French legislation in effect for 2026.
 * If the law changes, update the constants below + the comments in the
 * detail sections.
 *
 * IMPORTANT — what this models:
 * - Capital gains tax only (plus-values), not dividends. The MSCI World
 *   ETFs targeted by this app are mostly accumulating (CW8, VWCE, IWDA),
 *   so dividends are reinvested inside the fund and do not trigger an
 *   immediate taxable event in CTO. PEA is exempt during the holding
 *   period anyway. → modeling capital-gains-only is conservative-correct
 *   for the MVP.
 * - The PFU (flat tax 30 %) for CTO. The IR + 17.2 % social charges
 *   option is more advantageous for low TMI brackets but is too complex
 *   for the MVP. To add later.
 * - The PEA cap of €150,000 in deposits (not portfolio value).
 *
 * What this does NOT model:
 * - Withholding-tax on US dividends inside the fund (~15 %, irrelevant
 *   for accumulating ETFs since investors don't see it).
 * - Withdrawal optimization (partial sale tax order, abattement before
 *   2018 etc).
 * - PEA-PME, PER, AV, IFI — out of scope.
 */

export interface FiscalInput {
  /** Total invested over the lifetime (cumulative deposits). */
  totalInvested: number;
  /** Final portfolio value at withdrawal. */
  finalValue: number;
  /** Years between first deposit and withdrawal. Decimals OK. */
  holdingYears: number;
}

export interface AccountResult {
  /** Total invested (= cumulative deposits, same as input). */
  totalInvested: number;
  /** Final portfolio value before tax. */
  grossFinalValue: number;
  /** finalValue − totalInvested (positive = profit, negative = loss). */
  capitalGain: number;
  /** Effective tax rate applied to the gain (e.g. 0.172 or 0.30). */
  taxRate: number;
  /** Tax due in EUR. Always ≥ 0. Loss = 0 tax. */
  taxDue: number;
  /** Final value after tax (= grossFinalValue − taxDue). */
  netFinalValue: number;
  /** netFinalValue − totalInvested (your real take-home gain). */
  netGain: number;
  /** Human-readable label of the tax rule applied. */
  taxRuleLabel: string;
}

export interface FiscalComparison {
  pea: AccountResult;
  cto: AccountResult;
  /** Net advantage of PEA over CTO (peaNet − ctoNet). Positive = PEA wins. */
  peaAdvantageEur: number;
  /** Same as advantageEur but as % of CTO's net final value. */
  peaAdvantagePct: number;
  /** True if user has hit the PEA cap and overflow logic should be displayed. */
  peaCapExceeded: boolean;
  /**
   * If peaCapExceeded, this is the optimal mixed result:
   * - Fill PEA up to cap (€150K),
   * - Put the overflow in CTO,
   * - Each grows pro-rata at the same return rate (same gain ratio applied to each portion).
   * Only set when overflow exists.
   */
  optimalMix?: OptimalMix;
}

export interface OptimalMix {
  peaPortion: AccountResult;
  ctoPortion: AccountResult;
  /** Sum of the two net final values. */
  totalNetFinalValue: number;
  /** totalNetFinalValue − totalInvested. */
  totalNetGain: number;
}

// ─── Constants (French tax rules 2026) ────────────────────────────────────────

/** PEA deposit cap. Pure capital limit, doesn't apply to portfolio appreciation. */
export const PEA_DEPOSIT_CAP_EUR = 150_000;

/**
 * Social charges (CSG/CRDS/Prélèvement de solidarité) — applies to PEA gains
 * after 5 years of holding, AND is the social part of the PFU 30 %.
 */
export const SOCIAL_CHARGES_RATE = 0.172;

/** PFU (Prélèvement Forfaitaire Unique) — flat tax CTO + PEA closure < 5 years. */
export const PFU_RATE = 0.30;

// ─── Per-account calculations ────────────────────────────────────────────────

/**
 * PEA tax computation.
 * - Closure < 5 years: gain × 30 % (PFU)
 * - Closure ≥ 5 years: gain × 17.2 % (social charges only — PEA is income-tax exempt)
 * - Loss: 0 tax (loss can be carried forward but we don't model that)
 */
function computePeaResult(input: FiscalInput): AccountResult {
  const { totalInvested, finalValue, holdingYears } = input;
  const capitalGain = finalValue - totalInvested;

  if (capitalGain <= 0) {
    return {
      totalInvested,
      grossFinalValue: finalValue,
      capitalGain,
      taxRate: 0,
      taxDue: 0,
      netFinalValue: finalValue,
      netGain: capitalGain,
      taxRuleLabel: "Aucune plus-value (pas d'impôt)",
    };
  }

  if (holdingYears < 5) {
    const taxDue = capitalGain * PFU_RATE;
    return {
      totalInvested,
      grossFinalValue: finalValue,
      capitalGain,
      taxRate: PFU_RATE,
      taxDue,
      netFinalValue: finalValue - taxDue,
      netGain: finalValue - taxDue - totalInvested,
      taxRuleLabel: "PFU 30 % (clôture avant 5 ans)",
    };
  }

  const taxDue = capitalGain * SOCIAL_CHARGES_RATE;
  return {
    totalInvested,
    grossFinalValue: finalValue,
    capitalGain,
    taxRate: SOCIAL_CHARGES_RATE,
    taxDue,
    netFinalValue: finalValue - taxDue,
    netGain: finalValue - taxDue - totalInvested,
    taxRuleLabel: "Prélèvements sociaux 17,2 % uniquement (≥ 5 ans)",
  };
}

/**
 * CTO tax computation. PFU 30 % on all gains, regardless of holding duration.
 * IR-progressive option exists but is more advanced — not modeled here.
 */
function computeCtoResult(input: FiscalInput): AccountResult {
  const { totalInvested, finalValue } = input;
  const capitalGain = finalValue - totalInvested;

  if (capitalGain <= 0) {
    return {
      totalInvested,
      grossFinalValue: finalValue,
      capitalGain,
      taxRate: 0,
      taxDue: 0,
      netFinalValue: finalValue,
      netGain: capitalGain,
      taxRuleLabel: "Aucune plus-value (pas d'impôt)",
    };
  }

  const taxDue = capitalGain * PFU_RATE;
  return {
    totalInvested,
    grossFinalValue: finalValue,
    capitalGain,
    taxRate: PFU_RATE,
    taxDue,
    netFinalValue: finalValue - taxDue,
    netGain: finalValue - taxDue - totalInvested,
    taxRuleLabel: "PFU 30 % (12,8 % IR + 17,2 % CSG)",
  };
}

// ─── Mixed PEA + CTO (overflow above cap) ───────────────────────────────────

/**
 * If totalInvested exceeds the PEA cap, model the optimal mix:
 * - €150K filled into PEA
 * - The rest into CTO
 *
 * Both portions have grown at the same effective rate (we infer it from
 * the input's gain ratio: finalValue / totalInvested).
 */
function computeOptimalMix(input: FiscalInput): OptimalMix | undefined {
  const { totalInvested, finalValue, holdingYears } = input;

  if (totalInvested <= PEA_DEPOSIT_CAP_EUR) return undefined;

  // Gain ratio applied uniformly: each EUR invested becomes ratio × EUR.
  const ratio = finalValue / totalInvested;

  const peaInvested = PEA_DEPOSIT_CAP_EUR;
  const peaFinal = peaInvested * ratio;
  const peaPortion = computePeaResult({
    totalInvested: peaInvested,
    finalValue: peaFinal,
    holdingYears,
  });

  const ctoInvested = totalInvested - PEA_DEPOSIT_CAP_EUR;
  const ctoFinal = ctoInvested * ratio;
  const ctoPortion = computeCtoResult({
    totalInvested: ctoInvested,
    finalValue: ctoFinal,
    holdingYears,
  });

  const totalNetFinalValue = peaPortion.netFinalValue + ctoPortion.netFinalValue;
  return {
    peaPortion,
    ctoPortion,
    totalNetFinalValue,
    totalNetGain: totalNetFinalValue - totalInvested,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeFiscalComparison(input: FiscalInput): FiscalComparison {
  const pea = computePeaResult(input);
  const cto = computeCtoResult(input);

  const peaAdvantageEur = pea.netFinalValue - cto.netFinalValue;
  const peaAdvantagePct =
    cto.netFinalValue > 0 ? (peaAdvantageEur / cto.netFinalValue) * 100 : 0;

  return {
    pea,
    cto,
    peaAdvantageEur,
    peaAdvantagePct,
    peaCapExceeded: input.totalInvested > PEA_DEPOSIT_CAP_EUR,
    optimalMix: computeOptimalMix(input),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Format an EUR amount with French locale + 0 decimals + thin space thousands. */
export function formatFiscalEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
