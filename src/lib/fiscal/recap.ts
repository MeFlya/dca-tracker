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
 * - Si une vente (CTO) ou un retrait (PEA) a été saisi par l'utilisateur :
 *   gain réalisé + impôt + lignes de déclaration (calcul via pea-cto.ts, au
 *   barème de l'ANNÉE RÉCAPITULÉE, pas de l'année en cours).
 *
 * Règles de déclaration appliquées (brochure pratique IR 2026, plus-values,
 * p. 137 et 143, impots.gouv.fr, consultée le 28/09/2026) :
 * - PEA de 5 ans ou plus : gain exonéré d'impôt sur le revenu, RIEN À
 *   DÉCLARER. Les prélèvements sociaux sont retenus par l'établissement.
 * - PEA de moins de 5 ans : gain à la ligne 3VT de la 2042 C (12,8 % ou barème
 *   sur option). 2074 inutile si c'est la seule opération de l'année et que
 *   l'établissement a calculé le gain.
 * - PEA en perte : ligne 3VH (moins-values) pour un retrait avant 5 ans, ou
 *   pour la CLÔTURE d'un plan de plus de 5 ans (brochure p. 142, rubrique
 *   « Moins-values »). Un retrait partiel après 5 ans ne permet de déclarer
 *   aucune perte.
 * - CTO : plus-value ligne 3VG (moins-value 3VH) de la 2042 C. 2074
 *   facultative si les seules opérations sont des cessions de titres dont
 *   l'établissement a calculé toutes les plus ou moins-values.
 * Cases valables pour la déclaration 2026 (revenus 2025) : à revérifier sur
 * chaque nouvelle brochure.
 *
 * Règle des 5 ans : le délai court à partir de la DATE du premier versement
 * sur le PEA (service-public F2385, BOFiP BOI-RPPM-RCM-40-50-40, consultés le
 * 28/09/2026), pas de l'année civile de démarrage de la stratégie. Voir
 * `evaluerAnciennetePea`. Pour un PEA, la date du retrait est obligatoire :
 * sans elle, un retrait de l'année N−1 saisi sur le récap N (celui qui
 * s'ouvrait par défaut en avril-mai) recevait le barème et l'ancienneté de la
 * mauvaise année.
 *
 * Capital déjà investi (`strategy.input.startingCapital`) : versé AVANT le
 * début du suivi, il ne figure dans aucune `MonthlyEntry`. Il compte dans le
 * cumul versé, la plus-value latente et le plafond PEA (comme dans
 * strategy-insights.ts), et il rend inconnue la date du premier versement.
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
  baremeCapital,
  computeFiscalComparison,
  formatFiscalEur,
  PEA_DEPOSIT_CAP_EUR,
  PREMIERE_ANNEE_BAREME,
  tauxAffiche,
  type AccountResult,
} from "./pea-cto";

export type AccountType = "PEA" | "CTO";

export interface RecapInput {
  strategy: Strategy;
  entries: MonthlyEntry[];
  /** Year to summarize (e.g. 2026). Fixe aussi le barème appliqué. */
  year: number;
  /** Account type — needed to compute tax correctly. */
  accountType: AccountType;
  /**
   * PEA : date du premier versement sur le plan ("YYYY-MM-DD"), saisie par
   * l'utilisateur. C'est elle qui fait partir le délai de 5 ans. À défaut, on
   * retient le premier versement enregistré dans le suivi — sauf si la
   * stratégie déclare un capital déjà investi : la date est alors inconnue.
   */
  peaFirstDepositDate?: string;
  /** Optional sale recorded by the user (manual entry, not persisted). */
  sale?: {
    /**
     * Montant brut, avant impôt et prélèvements : prix de vente (CTO) ou
     * montant retiré du plan (PEA).
     */
    grossAmountSold: number;
    /**
     * CTO : prix d'achat des titres vendus. PEA : part des versements qui
     * correspond au retrait (au prorata en cas de retrait partiel).
     */
    investedPortionSold: number;
    /**
     * "YYYY-MM-DD". Obligatoire pour un PEA : elle fixe l'ancienneté du plan
     * (règle des 5 ans) et doit tomber dans l'année récapitulée.
     */
    date?: string;
    /**
     * PEA : le retrait a clôturé le plan (retrait total). Ne change rien à un
     * gain ; pour une perte après 5 ans, seule une clôture est déclarable.
     */
    cloture?: boolean;
  };
}

/** Ancienneté d'un PEA au regard de la règle des 5 ans. */
export interface AnciennetePea {
  /**
   * Premier versement retenu : "YYYY-MM-DD", ou "YYYY-MM" quand le suivi ne
   * donne que le mois (anciennes saisies). null si inconnu.
   */
  premierVersement: string | null;
  /**
   * D'où vient cette date. "capital-anterieur" : la stratégie déclare un
   * capital déjà investi avant le suivi, donc le premier versement est plus
   * ancien que tout ce que le suivi connaît — date inconnue.
   */
  source: "saisie" | "suivi" | "suivi-mois" | "capital-anterieur" | null;
  /** Date des 5 ans ("YYYY-MM-DD"), quand elle est connue au jour près. */
  cinqAnsLe: string | null;
  /**
   * Statut à la date du retrait si elle est connue, sinon sur toute l'année
   * récapitulée. "indetermine" : on ne sait pas trancher — aucun calcul n'est
   * alors produit, plutôt qu'un calcul faux.
   */
  statut: "moins-de-5-ans" | "5-ans-ou-plus" | "indetermine";
}

export interface RecapData {
  year: number;
  accountType: AccountType;

  /** Sum of contributions in `year`. */
  contributedThisYear: number;
  /**
   * Cumul versé à la fin de `year` : capital déjà investi avant le suivi
   * (startingCapital) + versements suivis jusqu'à fin `year`.
   */
  cumulativeContributedToYearEnd: number;
  /** Last-known portfolio value within `year` (last monthly entry). null if no entry that year. */
  yearEndPortfolioValue: number | null;
  /** yearEndPortfolioValue − cumulativeContributedToYearEnd. null if no entry that year. */
  latentGain: number | null;

  /** Strategy start info (for context in the report header). */
  strategyStartMonth: string;
  strategyStartYear: number;
  /** Capital déjà investi avant le début du suivi (0 si aucun). */
  capitalAnterieur: number;

  /**
   * Barème de l'année récapitulée, par cadre : le gain d'un retrait de PEA
   * est un produit de placement, la plus-value d'un CTO un revenu du
   * patrimoine — en 2025, ils n'ont pas le même taux.
   */
  bareme: {
    pea: { sociaux: number; pfu: number };
    cto: { sociaux: number; pfu: number };
  };
  /** false si l'année est antérieure au premier barème modélisé (2018). */
  baremeConnu: boolean;

  /** PEA uniquement : ancienneté du plan (règle des 5 ans). null pour un CTO. */
  anciennetePea: AnciennetePea | null;

  /** Computed sale impact, if a sale was provided in the input. */
  saleResult?: SaleResult;
  /**
   * Vente saisie mais NON calculée : pourquoi, en clair. Affiché à la place du
   * résultat, pour ne jamais présenter un calcul qu'on sait peut-être faux.
   */
  saleNonCalculee?: string;

  /** Hypothèses et limites à afficher à l'utilisateur. */
  avertissements: string[];

  /** Did the user reach the PEA cap of 150 000 € by end of `year` (PEA only)? */
  peaCapReachedThisYear: boolean;
}

export interface SaleResult {
  capitalGain: number;
  taxRate: number;
  /** Libellé court de la ligne d'impôt (« Prélèvements sociaux (17,2 %) »). */
  taxLabel: string;
  taxRuleLabel: string;
  taxDue: number;
  netReceived: number;
  /** Qui prélève quoi, et quand. Vide quand il n'y a pas de gain. */
  paiementNote: string;
  /** Amounts to report in declaration (the "value" each case expects). */
  declarationGuide: DeclarationGuide;
}

export interface DeclarationGuide {
  /** Form 2074 — détail des plus-values mobilières. */
  form2074: {
    applicable: boolean;
    /** false : la 2074 peut être omise si les conditions de `note` sont remplies. */
    obligatoire: boolean;
    /** What to write in the form's "plus-value de cession" line, in EUR (rounded). */
    plusValueAmount: number;
    note: string;
  };
  /**
   * Lignes de la déclaration de revenus : formulaire (« 2042 C »), case
   * (« 3VT ») et montant à y reporter.
   */
  form2042: Array<{
    form: string;
    caseId: string;
    label: string;
    amount: number;
    note: string;
  }>;
  /** Quand il n'y a rien à reporter : pourquoi. null sinon. */
  rienADeclarer: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function estBissextile(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function dernierJourDuMois(y: number, m: number): number {
  return [31, estBissextile(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/**
 * Même jour, n ans plus tard. Un 29 février sans 29 février l'année cible
 * passe au 1er mars : on retient la date la plus tardive, pour ne jamais
 * déclarer un plan « de 5 ans » un jour trop tôt.
 */
function ajouterAns(dateIso: string, n: number): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const cible = y + n;
  if (m === 2 && d === 29 && !estBissextile(cible)) return `${cible}-03-01`;
  return `${cible}-${pad2(m)}-${pad2(d)}`;
}

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** "2021-12-15" → « 15/12/2021 » ; "2021-12" → « décembre 2021 ». */
export function dateFr(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (d === undefined) return `${MOIS_FR[Number(m) - 1]} ${y}`;
  return `${d}/${m}/${y}`;
}

function entriesInYear(entries: MonthlyEntry[], year: number): MonthlyEntry[] {
  return entries
    .filter((e) => e.month.startsWith(`${year}-`))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Capital déjà investi au démarrage de la stratégie, avant le premier mois
 * suivi — celui que strategy-insights.ts compte dans le total investi.
 */
function capitalAnterieur(strategy: Strategy): number {
  const c = strategy.input?.startingCapital ?? 0;
  return Number.isFinite(c) && c > 0 ? c : 0;
}

function cumulativeUntilEndOfYear(entries: MonthlyEntry[], year: number): number {
  return entries
    .filter((e) => {
      const [y] = e.month.split("-").map(Number);
      return y <= year;
    })
    .reduce((sum, e) => sum + e.invested, 0);
}

// ─── Règle des 5 ans ────────────────────────────────────────────────────────

/**
 * Premier versement connu, sous forme d'intervalle [plusTot, plusTard] :
 * un seul jour quand la date est exacte, un mois entier quand le suivi ne
 * connaît que le mois (anciennes saisies, dont la date « YYYY-MM-15 » a été
 * synthétisée par `normalizeEntry` et ne doit pas être prise pour vraie).
 */
function premierVersementConnu(
  input: RecapInput
): { plusTot: string; plusTard: string; source: AnciennetePea["source"]; affiche: string } | null {
  const saisie = input.peaFirstDepositDate;
  if (saisie && DATE_ISO.test(saisie)) {
    return { plusTot: saisie, plusTard: saisie, source: "saisie", affiche: saisie };
  }
  // Un capital déjà investi avant le suivi a été versé avant tout ce que le
  // suivi connaît : le plus ancien versement suivi n'est PAS le premier.
  // Le retenir tranchait la règle des 5 ans sur une date trop récente.
  if (capitalAnterieur(input.strategy) > 0) return null;

  let plusTot: string | null = null;
  let plusTard: string | null = null;
  let moisSeul: string | null = null;
  for (const e of input.entries) {
    for (const c of e.contributions) {
      if (!(c.amount > 0)) continue;
      const synthetisee = c.id.startsWith("legacy-") || !DATE_ISO.test(c.date);
      let debut: string;
      let fin: string;
      if (synthetisee) {
        const [y, m] = e.month.split("-").map(Number);
        if (!y || !m) continue;
        debut = `${y}-${pad2(m)}-01`;
        fin = `${y}-${pad2(m)}-${pad2(dernierJourDuMois(y, m))}`;
      } else {
        debut = c.date;
        fin = c.date;
      }
      if (plusTot === null || debut < plusTot) {
        plusTot = debut;
        moisSeul = synthetisee ? e.month : null;
      }
      if (plusTard === null || fin < plusTard) plusTard = fin;
    }
  }
  if (plusTot === null || plusTard === null) return null;
  const exacte = plusTot === plusTard;
  return {
    plusTot,
    plusTard,
    source: exacte ? "suivi" : "suivi-mois",
    affiche: exacte ? plusTot : (moisSeul ?? plusTot.slice(0, 7)),
  };
}

/**
 * Le plan a-t-il 5 ans à la date du retrait ? Le délai court « à compter de la
 * date du premier versement » (BOFiP BOI-RPPM-RCM-40-50-40, § 1) : un plan
 * ouvert le 15/12/2021 n'a que 4 ans en 2025, alors que l'ancien calcul en
 * années civiles (2025 − 2021 + 1) lui en donnait 5 — et affichait « rien que
 * les prélèvements sociaux » pour un retrait qui supportait aussi l'impôt.
 */
function evaluerAnciennetePea(
  input: RecapInput,
  dateRetrait: string | null
): AnciennetePea {
  const premier = premierVersementConnu(input);
  if (!premier) {
    return {
      premierVersement: null,
      source: capitalAnterieur(input.strategy) > 0 ? "capital-anterieur" : null,
      cinqAnsLe: null,
      statut: "indetermine",
    };
  }
  const cinqAnsTot = ajouterAns(premier.plusTot, 5);
  const cinqAnsTard = ajouterAns(premier.plusTard, 5);
  // Fenêtre évaluée : le jour du retrait s'il est connu, sinon toute l'année.
  const debut = dateRetrait ?? `${input.year}-01-01`;
  const fin = dateRetrait ?? `${input.year}-12-31`;

  let statut: AnciennetePea["statut"] = "indetermine";
  if (debut >= cinqAnsTard) statut = "5-ans-ou-plus";
  else if (fin < cinqAnsTot) statut = "moins-de-5-ans";

  return {
    premierVersement: premier.affiche,
    source: premier.source,
    cinqAnsLe: cinqAnsTot === cinqAnsTard ? cinqAnsTot : null,
    statut,
  };
}

// ─── Declaration guide builders (per scenario) ──────────────────────────────

/**
 * Build the case-by-case guide for the user's declaration.
 * Cases de la déclaration 2026 (revenus 2025), brochure IR 2026 p. 137 et 143.
 */
function buildDeclarationGuide(
  accountType: AccountType,
  statutPea: AnciennetePea["statut"] | null,
  capitalGain: number,
  bareme: RecapData["bareme"],
  year: number,
  cloture: boolean
): DeclarationGuide {
  const roundedGain = Math.round(capitalGain);

  if (accountType === "CTO") {
    const { pfu, sociaux } = bareme.cto;
    const note2074 =
      "Facultative si vos seules opérations de l'année sont des ventes de titres dont votre établissement a calculé toutes les plus et moins-values (elles figurent sur votre IFU) : reportez alors le montant directement sur la 2042 C. Sinon (plusieurs types d'opérations, par exemple une vente sur CTO et un retrait de PEA de moins de 5 ans, ou des plus-values non calculées par l'établissement), la 2074 est obligatoire.";

    if (roundedGain === 0) {
      return {
        form2074: { applicable: false, obligatoire: false, plusValueAmount: 0, note: "" },
        form2042: [],
        rienADeclarer: "Ni plus-value ni moins-value sur cette vente : rien à reporter.",
      };
    }

    if (capitalGain < 0) {
      return {
        form2074: { applicable: true, obligatoire: false, plusValueAmount: roundedGain, note: note2074 },
        form2042: [
          {
            form: "2042 C",
            caseId: "3VH",
            label: "Moins-values de cession de valeurs mobilières",
            amount: Math.abs(roundedGain),
            note: `Une moins-value s'impute sur les plus-values de même nature de l'année, et l'excédent se reporte sur les 10 années suivantes ; elle ne se déduit jamais du revenu global. Si vous avez aussi vendu d'autres titres avec plus-value en ${year}, c'est le solde net de votre IFU qui se déclare.`,
          },
        ],
        rienADeclarer: null,
      };
    }

    return {
      form2074: { applicable: true, obligatoire: false, plusValueAmount: roundedGain, note: note2074 },
      form2042: [
        {
          form: "2042 C",
          caseId: "3VG",
          label: `Plus-values de cession de valeurs mobilières (PFU ${tauxAffiche(pfu)} %)`,
          amount: roundedGain,
          note: `PFU ${tauxAffiche(pfu)} % par défaut : ${tauxAffiche(pfu - sociaux)} % d'impôt et ${tauxAffiche(sociaux)} % de prélèvements sociaux. Sur option, le barème progressif remplace le taux de ${tauxAffiche(pfu - sociaux)} % (case 2OP). Cette option est globale : elle vaut pour tous vos revenus de capitaux et plus-values de l'année. Selon service-public.gouv.fr, elle est plus favorable si vous n'êtes pas imposable ou si vous êtes dans la tranche à 11 %, et défavorable à partir de la tranche à 30 %.`,
        },
      ],
      rienADeclarer: null,
    };
  }

  // PEA
  const { pfu, sociaux } = bareme.pea;

  if (roundedGain === 0) {
    return {
      form2074: { applicable: false, obligatoire: false, plusValueAmount: 0, note: "" },
      form2042: [],
      rienADeclarer:
        "Ni gain ni perte sur ce retrait : ni impôt ni prélèvements sociaux, rien à déclarer.",
    };
  }

  // PEA en perte. Brochure IR 2026, p. 142 (« Moins-values ») : se déclare
  // ligne 3VH « la perte constatée lors de la clôture d'un PEA de plus de 5 ans
  // ou lors du retrait ou du rachat d'un PEA de moins de 5 ans ». Jusqu'au
  // 29/09/2026, le récap disait seulement qu'elle « peut s'imputer », dans le
  // bloc « rien à déclarer » : suivi à la lettre, on perdait l'imputation et
  // le report sur 10 ans.
  if (capitalGain < 0) {
    const perte = Math.abs(roundedGain);
    const avant5Ans = statutPea === "moins-de-5-ans";
    if (!avant5Ans && !cloture) {
      return {
        form2074: { applicable: false, obligatoire: false, plusValueAmount: 0, note: "" },
        form2042: [],
        rienADeclarer:
          "Pas de gain sur ce retrait : ni impôt ni prélèvements sociaux. Après 5 ans, un retrait partiel ne permet de déclarer aucune perte : seule la clôture du plan le permet (ligne 3VH). Si ce retrait a clôturé votre PEA, cochez « Retrait total » ci-dessus.",
      };
    }
    return {
      form2074: {
        applicable: true,
        obligatoire: false,
        plusValueAmount: roundedGain,
        note: "Facultative si la clôture de ce PEA est votre seule opération de l'année et que votre établissement a calculé la perte : reportez-la alors directement ligne 3VH. Sinon (une vente sur un compte-titres la même année, par exemple), la 2074 est obligatoire.",
      },
      form2042: [
        {
          form: "2042 C",
          caseId: "3VH",
          label: avant5Ans
            ? "Perte sur retrait d'un PEA de moins de 5 ans (moins-values)"
            : "Perte à la clôture d'un PEA de plus de 5 ans (moins-values)",
          amount: perte,
          note: `Ni impôt ni prélèvements sociaux sur ce retrait. La perte se déclare comme une moins-value : elle s'impute sur les plus-values de même nature de l'année (ventes sur un compte-titres, gains de PEA de moins de 5 ans), et l'excédent se reporte sur les 10 années suivantes ; elle ne se déduit jamais du revenu global. Si vous avez aussi réalisé des plus ou moins-values en ${year}, c'est le solde net qui se déclare.`,
        },
      ],
      rienADeclarer: null,
    };
  }

  if (statutPea === "moins-de-5-ans") {
    return {
      form2074: {
        applicable: true,
        obligatoire: false,
        plusValueAmount: roundedGain,
        note: "Inutile si ce retrait est votre seule opération de l'année (pas de vente sur un compte-titres, par exemple) et que votre établissement a calculé le gain : il figure alors sur votre IFU. Sinon, la 2074 est obligatoire.",
      },
      form2042: [
        {
          form: "2042 C",
          caseId: "3VT",
          label: "Gain sur retrait ou rachat d'un PEA avant 5 ans",
          amount: roundedGain,
          note: `Imposé à ${tauxAffiche(pfu - sociaux)} %, ou au barème progressif si vous cochez l'option globale (case 2OP). Les prélèvements sociaux (${tauxAffiche(sociaux)} %) sont retenus par votre établissement au moment du retrait. Hors exceptions prévues par la loi (licenciement, invalidité, mise à la retraite anticipée, création ou reprise d'entreprise…), un retrait avant 5 ans clôture le plan.`,
        },
      ],
      rienADeclarer: null,
    };
  }

  // PEA de 5 ans ou plus : rien à déclarer.
  return {
    form2074: { applicable: false, obligatoire: false, plusValueAmount: 0, note: "" },
    form2042: [],
    rienADeclarer: `Rien à déclarer. Après 5 ans, le gain d'un PEA est exonéré d'impôt sur le revenu et n'a pas à être déclaré. Les prélèvements sociaux (${tauxAffiche(sociaux)} % pour un retrait fait en ${year}) sont retenus par votre établissement au moment du retrait.`,
  };
}

// ─── Main compilation function ──────────────────────────────────────────────

export function compileRecap(input: RecapInput): RecapData {
  const { strategy, entries, year, accountType, sale } = input;

  const strategyStartYear = parseInt(strategy.startMonth.split("-")[0], 10);
  const capital = capitalAnterieur(strategy);
  // Versé avant le premier mois suivi : acquis pour toute année de suivi. Pour
  // une année antérieure au démarrage, on ne sait pas quand : pas compté.
  const capitalCompte = year >= strategyStartYear ? capital : 0;

  const yearEntries = entriesInYear(entries, year);
  const contributedThisYear = yearEntries.reduce((s, e) => s + e.invested, 0);
  const cumulativeContributedToYearEnd =
    capitalCompte + cumulativeUntilEndOfYear(entries, year);

  const lastEntryOfYear = yearEntries.at(-1);
  const yearEndPortfolioValue = lastEntryOfYear?.portfolioValue ?? null;

  const latentGain =
    yearEndPortfolioValue !== null
      ? yearEndPortfolioValue - cumulativeContributedToYearEnd
      : null;

  // Barème de l'année récapitulée, pas de l'année en cours : un récap 2025
  // établi en 2026 doit appliquer 17,2 % à un retrait de PEA de 2025.
  const bareme = {
    pea: baremeCapital(year, "produit-placement"),
    cto: baremeCapital(year, "plus-value-cession"),
  };
  const baremeConnu = year >= PREMIERE_ANNEE_BAREME;

  const avertissements: string[] = [];
  if (capitalCompte > 0) {
    avertissements.push(
      `Votre stratégie inclut ${formatFiscalEur(capitalCompte)} de capital déjà investi avant le début du suivi (${dateFr(strategy.startMonth)}) : il est compté dans le cumul versé, la plus-value latente${accountType === "PEA" ? " et le contrôle du plafond PEA" : ""}, mais pas dans le total versé de l'année.`
    );
  }

  const saleDate = sale?.date && DATE_ISO.test(sale.date) ? sale.date : null;
  const saleSaisie = !!sale && sale.grossAmountSold > 0 && sale.investedPortionSold > 0;

  // ── Ancienneté du PEA (règle des 5 ans, au jour près) ──
  let anciennetePea: AnciennetePea | null = null;
  if (accountType === "PEA") {
    anciennetePea = evaluerAnciennetePea(input, saleDate);
    // Comparaison au mois : `premierVersement` peut n'être connu qu'au mois.
    if (anciennetePea.premierVersement && anciennetePea.premierVersement.slice(0, 7) < "2018-01") {
      avertissements.push(
        `PEA ouvert avant 2018 (premier versement : ${dateFr(anciennetePea.premierVersement)}) : une partie du gain, notamment celle acquise avant le 1er janvier 2018, garde les taux de prélèvements sociaux de l'époque (« taux historiques »). Le calcul ci-dessous applique le taux de ${year} à tout le gain et peut donc surestimer un peu les prélèvements. L'IFU de votre établissement fait foi.`
      );
    }
  }

  // ── Impact de la vente ou du retrait ──
  let saleResult: SaleResult | undefined;
  let saleNonCalculee: string | undefined;

  if (sale && saleSaisie) {
    if (!baremeConnu) {
      saleNonCalculee = `Les règles d'avant ${PREMIERE_ANNEE_BAREME} (avant le prélèvement forfaitaire unique) ne sont pas modélisées : aucun calcul n'est affiché pour ${year}. Reportez-vous à l'IFU de votre établissement.`;
    } else if (accountType === "PEA" && !saleDate) {
      // Obligatoire pour un PEA. Sans date, un retrait de mars 2025 saisi sur
      // le récap 2026 (ouvert par défaut en avril) était jugé à fin 2026 :
      // « 5 ans ou plus », 18,6 %, « rien à déclarer » — au lieu de « moins de
      // 5 ans », 30 % et la ligne 3VT.
      saleNonCalculee = `Indiquez la date du retrait. Pour un PEA, c'est elle qui fixe l'ancienneté du plan (la règle des 5 ans se juge au jour près) et l'année fiscale du retrait : un retrait fait en ${year - 1}, par exemple, se calcule sur le récap ${year - 1}, avec le barème de ${year - 1}.`;
    } else if (saleDate && !saleDate.startsWith(`${year}-`)) {
      saleNonCalculee = `La date saisie (${dateFr(saleDate)}) n'est pas en ${year}. Choisissez l'année ${saleDate.slice(0, 4)} en haut de page : le barème et les cases dépendent de l'année de l'opération.`;
    } else if (anciennetePea && anciennetePea.statut === "indetermine") {
      saleNonCalculee = messageAncienneteIndeterminee(anciennetePea, capital, strategy.startMonth);
    } else {
      // computeFiscalComparison ne regarde que le seuil des 5 ans : on lui
      // passe le statut établi ci-dessus au jour près, jamais une durée en
      // années civiles.
      const comparison = computeFiscalComparison({
        totalInvested: sale.investedPortionSold,
        finalValue: sale.grossAmountSold,
        holdingYears: anciennetePea?.statut === "5-ans-ou-plus" ? 5 : 0,
        annee: year,
      });
      const account: AccountResult =
        accountType === "PEA" ? comparison.pea : comparison.cto;
      const statut = anciennetePea?.statut ?? null;

      saleResult = {
        capitalGain: account.capitalGain,
        taxRate: account.taxRate,
        taxLabel: libelleImpot(accountType, statut, account.taxRate),
        taxRuleLabel: account.taxRuleLabel,
        taxDue: account.taxDue,
        netReceived: account.netFinalValue,
        paiementNote:
          account.capitalGain > 0 ? notePaiement(accountType, statut, bareme) : "",
        declarationGuide: buildDeclarationGuide(
          accountType,
          statut,
          account.capitalGain,
          bareme,
          year,
          sale.cloture === true
        ),
      };
    }
  }

  const peaCapReachedThisYear =
    accountType === "PEA" && cumulativeContributedToYearEnd >= PEA_DEPOSIT_CAP_EUR;

  return {
    year,
    accountType,
    contributedThisYear,
    cumulativeContributedToYearEnd,
    yearEndPortfolioValue,
    latentGain,
    strategyStartMonth: strategy.startMonth,
    strategyStartYear,
    capitalAnterieur: capital,
    bareme,
    baremeConnu,
    anciennetePea,
    saleResult,
    saleNonCalculee,
    avertissements,
    peaCapReachedThisYear,
  };
}

// ─── Libellés ───────────────────────────────────────────────────────────────

function messageAncienneteIndeterminee(
  a: AnciennetePea,
  capital: number,
  startMonth: string
): string {
  // La date du retrait est connue ici (obligatoire pour un PEA) : seul le
  // premier versement peut manquer.
  if (a.source === "capital-anterieur") {
    return `Votre stratégie compte ${formatFiscalEur(capital)} de capital déjà investi avant le début de votre suivi (${dateFr(startMonth)}) : votre premier versement sur le PEA est donc plus ancien que tout ce que le suivi connaît, et c'est sa date qui fait partir le délai de 5 ans. Indiquez la date du premier versement sur ce PEA pour obtenir le calcul.`;
  }
  if (a.premierVersement === null) {
    return "Date du premier versement sur votre PEA inconnue : impossible de savoir si le plan avait 5 ans au moment du retrait, et la fiscalité en dépend. Indiquez cette date pour obtenir le calcul.";
  }
  if (a.cinqAnsLe === null) {
    const [y, m] = a.premierVersement.split("-").map(Number);
    const moisCinqAns = dateFr(`${y + 5}-${pad2(m)}`);
    return `Votre suivi ne donne que le mois du premier versement (${dateFr(a.premierVersement)}) et le retrait tombe en ${moisCinqAns}, le mois des 5 ans du plan. Indiquez la date exacte du premier versement pour obtenir le calcul.`;
  }
  return "Ancienneté du plan indéterminée : indiquez la date exacte du premier versement.";
}

function libelleImpot(
  accountType: AccountType,
  statut: AnciennetePea["statut"] | null,
  taux: number
): string {
  // Pas de gain, pas de taux : « (0 %) » se lisait comme un taux réduit.
  if (taux === 0) return "Impôt et prélèvements sociaux";
  if (accountType === "PEA" && statut === "5-ans-ou-plus") {
    return `Prélèvements sociaux (${tauxAffiche(taux)} %)`;
  }
  return `Impôt et prélèvements sociaux (${tauxAffiche(taux)} %)`;
}

function notePaiement(
  accountType: AccountType,
  statut: AnciennetePea["statut"] | null,
  bareme: RecapData["bareme"]
): string {
  if (accountType === "CTO") {
    return "Rien n'est prélevé au moment de la vente : l'impôt et les prélèvements sociaux sont calculés à partir de votre déclaration et payés sur l'avis d'imposition.";
  }
  const { pfu, sociaux } = bareme.pea;
  if (statut === "5-ans-ou-plus") {
    return `Les prélèvements sociaux (${tauxAffiche(sociaux)} %) sont retenus par votre établissement au moment du retrait.`;
  }
  return `Les prélèvements sociaux (${tauxAffiche(sociaux)} %) sont retenus par votre établissement au moment du retrait ; l'impôt de ${tauxAffiche(pfu - sociaux)} % est calculé à partir de votre déclaration (ligne 3VT).`;
}
