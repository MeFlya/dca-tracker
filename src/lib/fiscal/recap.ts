/**
 * Annual fiscal recap — compiles a year of DCA activity into a structured
 * summary for the user's tax declaration.
 *
 * Data sources (all already exist in user-strategy.ts):
 * - Strategy : initial parameters + start month
 * - MonthlyEntry[] : per-month tracked contributions and portfolio values
 *
 * What this computes (per fiscal year):
 * - Total versé cette année (sum of contributions across the year)
 * - Total versé cumulé (depuis startMonth jusqu'à fin de l'année)
 * - Valeur portefeuille en fin d'année
 * - Plus-value LATENTE (= valeur fin année − total versé cumulé). Non taxable
 *   tant que pas vendu. Indicative.
 * - Si une vente a été enregistrée par l'utilisateur via le formulaire :
 *   plus-value réalisée + impôt + cases 2042/2074 (calcul via pea-cto.ts)
 *
 * IMPORTANT — limitations conscientes :
 * - On ne modélise pas les dividendes (ETF accumulants majoritaires en DCA FR)
 * - Les ventes ne sont PAS persistées — l'utilisateur remplit le formulaire à
 *   chaque visite. C'est intentionnel pour MVP : éviter d'introduire un
 *   nouveau schéma de données. Si les utilisateurs demandent la persistence
 *   on l'ajoutera dans une v2.
 * - On ne distingue pas PEA classique vs PEA-PME (plafonds différents). Le
 *   calculateur s'appuie sur la règle PEA classique (150K).
 */

import type { Strategy, MonthlyEntry } from "@/lib/user-strategy";
import {
  computeFiscalComparison,
  type AccountResult,
  PFU_RATE,
  SOCIAL_CHARGES_RATE,
} from "./pea-cto";

export type AccountType = "PEA" | "CTO";

export interface RecapInput {
  strategy: Strategy;
  entries: MonthlyEntry[];
  /** Year to summarize (e.g. 2026). */
  year: number;
  /** Account type — needed to compute tax correctly. */
  accountType: AccountType;
  /** Optional sale recorded by the user (manual entry, not persisted). */
  sale?: {
    /** Cash withdrawn at sale (= post-tax for PEA closure ≥ 5 yrs, pre-tax for CTO). */
    grossAmountSold: number;
    /** Capital invested portion of the sale (= cost basis for the lot sold). */
    investedPortionSold: number;
    /** Optional date string "YYYY-MM-DD" for display only. */
    date?: string;
  };
}

export interface RecapData {
  year: number;
  accountType: AccountType;

  /** Sum of contributions in `year`. */
  contributedThisYear: number;
  /** Cumulative contributions from strategy start to end of `year`. */
  cumulativeContributedToYearEnd: number;
  /** Last-known portfolio value within `year` (last monthly entry). null if no entry that year. */
  yearEndPortfolioValue: number | null;
  /** yearEndPortfolioValue − cumulativeContributedToYearEnd. null if no entry that year. */
  latentGain: number | null;

  /** Strategy start info (for context in the report header). */
  strategyStartMonth: string;
  strategyStartYear: number;
  yearsHeldAtYearEnd: number;

  /** Computed sale impact, if a sale was provided in the input. */
  saleResult?: SaleResult;

  /** Did the user reach the PEA cap of 150 000 € by end of `year` (PEA only)? */
  peaCapReachedThisYear: boolean;
}

export interface SaleResult {
  capitalGain: number;
  taxRate: number;
  taxRuleLabel: string;
  taxDue: number;
  netReceived: number;
  /** Amounts to report in declaration (the "value" each case expects). */
  declarationGuide: DeclarationGuide;
}

export interface DeclarationGuide {
  /** Form 2074 — détail des plus-values mobilières (CTO + PEA closure) */
  form2074: {
    applicable: boolean;
    /** What to write in the form's "plus-value de cession" line, in EUR (rounded). */
    plusValueAmount: number;
    note: string;
  };
  /**
   * Form 2042 — déclaration de revenus principale.
   * Returns the case ID (e.g. "3VG") + the amount to put in it.
   */
  form2042: Array<{
    caseId: string;
    label: string;
    amount: number;
    note: string;
  }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Un taux (0.314) en pourcentage affichable (« 31,4 »).
 *
 * Existe parce que la ligne 3VG utilisait `toFixed(0)` : elle n’affichait
 * « PFU 30 % » que parce que 30 est un nombre rond. Avec un taux à
 * 31,4 %, elle aurait rendu « PFU 31 % » — un taux faux sur une fonctionnalité
 * payante, et un défaut qui ne se déclenche QUE le jour où l’on corrige les
 * taux, c’est-à-dire au pire moment. Un seul formateur pour tout le fichier.
 */
function tauxAffiche(taux: number): string {
  const pct = taux * 100;
  return (Number.isInteger(pct) ? String(pct) : pct.toFixed(1)).replace(".", ",");
}

function entriesInYear(entries: MonthlyEntry[], year: number): MonthlyEntry[] {
  return entries
    .filter((e) => e.month.startsWith(`${year}-`))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function cumulativeUntilEndOfYear(entries: MonthlyEntry[], year: number): number {
  return entries
    .filter((e) => {
      const [y] = e.month.split("-").map(Number);
      return y <= year;
    })
    .reduce((sum, e) => sum + e.invested, 0);
}

// ─── Declaration guide builders (per scenario) ──────────────────────────────

/**
 * Build the case-by-case guide for the user's declaration.
 * The cases below correspond to the 2026 declaration form (revenues 2025,
 * declared in spring 2026). Update if the cases change.
 */
function buildDeclarationGuide(
  accountType: AccountType,
  yearsHeld: number,
  capitalGain: number
): DeclarationGuide {
  // No gain → nothing to declare.
  if (capitalGain <= 0) {
    return {
      form2074: {
        applicable: false,
        plusValueAmount: 0,
        note: "Aucune plus-value à déclarer (cession en moins-value ou sans gain).",
      },
      form2042: [],
    };
  }

  const roundedGain = Math.round(capitalGain);

  if (accountType === "CTO") {
    // CTO : 2074 toujours requis pour détail, 2042 pour le total.
    return {
      form2074: {
        applicable: true,
        plusValueAmount: roundedGain,
        note: "Reportez le détail de chaque cession (date, prix d'achat, prix de vente, plus-value) sur le formulaire 2074. Votre courtier fournit l'IFU avec les chiffres officiels — utilisez-le pour la déclaration finale.",
      },
      form2042: [
        {
          caseId: "3VG",
          label: `Plus-values de cession de valeurs mobilières (PFU ${tauxAffiche(PFU_RATE)} %)`,
          amount: roundedGain,
          note: `PFU ${tauxAffiche(PFU_RATE)} % appliqué par défaut. Vous pouvez opter pour le barème IR + ${tauxAffiche(SOCIAL_CHARGES_RATE)} % social via la case 2OP si votre TMI < 12,8 %.`,
        },
      ],
    };
  }

  // PEA
  if (yearsHeld < 5) {
    // PEA clôture < 5 ans : PFU 30 % comme un CTO.
    return {
      form2074: {
        applicable: true,
        plusValueAmount: roundedGain,
        note: `Clôture PEA avant 5 ans = imposition au PFU ${tauxAffiche(PFU_RATE)} % comme un CTO. Détaillez la cession sur le 2074. Votre IFU PEA contient les chiffres à reporter.`,
      },
      form2042: [
        {
          caseId: "3VG",
          label: `Plus-value PEA clôturé avant 5 ans (PFU ${tauxAffiche(PFU_RATE)} %)`,
          amount: roundedGain,
          note: `Clôture PEA avant 5 ans → traité fiscalement comme un CTO. PFU ${tauxAffiche(PFU_RATE)} % par défaut.`,
        },
      ],
    };
  }

  // PEA ≥ 5 ans : prélèvements sociaux uniquement, déclaré dans 3SG.
  return {
    form2074: {
      applicable: false,
      plusValueAmount: 0,
      note: "PEA détenu ≥ 5 ans : pas de 2074 nécessaire. L'IFU fourni par votre courtier contient déjà le chiffre à reporter sur le 2042.",
    },
    form2042: [
      {
        caseId: "3SG",
        label: `Plus-value PEA ≥ 5 ans (prélèvements sociaux ${tauxAffiche(SOCIAL_CHARGES_RATE)} % uniquement)`,
        amount: roundedGain,
        note: `PEA détenu plus de 5 ans : seuls les prélèvements sociaux ${tauxAffiche(SOCIAL_CHARGES_RATE)} % s'appliquent. Pas d'impôt sur le revenu.`,
      },
    ],
  };
}

// ─── Main compilation function ──────────────────────────────────────────────

export function compileRecap(input: RecapInput): RecapData {
  const { strategy, entries, year, accountType, sale } = input;

  const yearEntries = entriesInYear(entries, year);
  const contributedThisYear = yearEntries.reduce((s, e) => s + e.invested, 0);
  const cumulativeContributedToYearEnd = cumulativeUntilEndOfYear(entries, year);

  const lastEntryOfYear = yearEntries.at(-1);
  const yearEndPortfolioValue = lastEntryOfYear?.portfolioValue ?? null;

  const latentGain =
    yearEndPortfolioValue !== null
      ? yearEndPortfolioValue - cumulativeContributedToYearEnd
      : null;

  const strategyStartYear = parseInt(strategy.startMonth.split("-")[0], 10);
  const yearsHeldAtYearEnd = year - strategyStartYear + 1;

  // Sale impact computation (if recorded)
  let saleResult: SaleResult | undefined;
  if (sale && sale.grossAmountSold > 0 && sale.investedPortionSold > 0) {
    const capitalGain = sale.grossAmountSold - sale.investedPortionSold;
    const comparison = computeFiscalComparison({
      totalInvested: sale.investedPortionSold,
      finalValue: sale.grossAmountSold,
      holdingYears: yearsHeldAtYearEnd,
    });
    const account: AccountResult =
      accountType === "PEA" ? comparison.pea : comparison.cto;

    saleResult = {
      capitalGain: account.capitalGain,
      taxRate: account.taxRate,
      taxRuleLabel: account.taxRuleLabel,
      taxDue: account.taxDue,
      netReceived: account.netFinalValue,
      declarationGuide: buildDeclarationGuide(accountType, yearsHeldAtYearEnd, capitalGain),
    };
  }

  const peaCapReachedThisYear =
    accountType === "PEA" && cumulativeContributedToYearEnd >= 150_000;

  return {
    year,
    accountType,
    contributedThisYear,
    cumulativeContributedToYearEnd,
    yearEndPortfolioValue,
    latentGain,
    strategyStartMonth: strategy.startMonth,
    strategyStartYear,
    yearsHeldAtYearEnd,
    saleResult,
    peaCapReachedThisYear,
  };
}
