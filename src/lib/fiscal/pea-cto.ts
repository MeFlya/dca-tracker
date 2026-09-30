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
 * - The PFU for CTO (rate from BAREMES_CAPITAL). The IR + social-charges
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

import { currentYear } from "@/lib/strategy-math";

export interface FiscalInput {
  /** Total invested over the lifetime (cumulative deposits). */
  totalInvested: number;
  /** Final portfolio value at withdrawal. */
  finalValue: number;
  /** Years between first deposit and withdrawal. Decimals OK. */
  holdingYears: number;
  /**
   * Année du retrait ou de la vente : elle fixe le barème appliqué (voir
   * `baremeCapital`). Par défaut, l'année en cours — ce qui convient à une
   * simulation, pas à un récap d'une année passée.
   */
  annee?: number;
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
 * Barème des prélèvements sur les revenus du capital, PAR CATÉGORIE DE REVENU
 * ET PAR MILLÉSIME.
 *
 * ─── Pourquoi un barème et non deux constantes ──────────────────────────────
 *
 * Deux constantes de module ne peuvent pas répondre à « quel taux s'appliquait
 * en 2025 ? », question que pose n'importe quel récap fiscal établi l'année
 * suivante. Elles obligent aussi à réécrire le code à chaque loi de finances,
 * et c'est ainsi que le site s'est retrouvé à publier 17,2 % après la hausse.
 *
 * ─── Pourquoi la catégorie : la hausse n'a pas la même date d'effet ────────
 *
 * Un barème indexé sur la seule année répondait 17,2 % pour 2025. C'était faux
 * pour la moitié des cas : la date d'effet dépend de la nature du revenu
 * (LFSS 2026, art. 12, II).
 *   - Plus-values de cession de valeurs mobilières (vente sur un CTO) : ce sont
 *     des revenus du patrimoine (art. L. 136-6 CSS), imposés par voie de rôle.
 *     Le taux de 18,6 % s'applique dès les plus-values RÉALISÉES EN 2025.
 *   - Produits de placement (dividendes, intérêts, gain net d'un retrait de
 *     PEA) : prélevés à la source (art. L. 136-7 CSS). Le taux de 18,6 % ne
 *     s'applique qu'à ceux perçus À PARTIR DU 1er JANVIER 2026 ; ceux de 2025
 *     restaient à 17,2 %.
 * Conséquence concrète : un retrait de PEA de 2025 supporte 17,2 %, une
 * plus-value de CTO de 2025 supporte 18,6 %. À partir de 2026, les deux
 * catégories ont le même barème.
 *
 * ─── Sources, lues sur le texte et non sur un commentaire ───────────────────
 *
 * Loi n° 2025-1403 du 30 décembre 2025 (LFSS 2026), article 12 : au 2° du I de
 * l'article L. 136-8 du code de la sécurité sociale, le taux de CSG sur les
 * revenus du capital passe de 9,2 % à 10,6 %.
 *   → prélèvements sociaux = CSG 10,6 % + CRDS 0,5 % (art. 19 ord. n° 96-50)
 *     + prélèvement de solidarité 7,5 % (art. 235 ter CGI) = 18,6 %.
 *   → PFU = 12,8 % d'IR (art. 200 A CGI, inchangé) + 18,6 % = 31,4 %.
 * Dates d'effet : LFSS 2026, art. 12, II ; brochure pratique IR 2026, p. 137
 * (impots.gouv.fr, consultée le 28/09/2026) ; service-public.gouv.fr F2329
 * (consultée le 28/09/2026).
 *
 * ⚠️ LA HAUSSE N'EST PAS GÉNÉRALE, et c'est le piège de ce dossier. Le même
 * article 12 rétablit un IV à L. 136-8 qui MAINTIENT 9,2 % de CSG — donc
 * 17,2 % au total — pour cinq catégories : revenus fonciers, plus-values
 * immobilières, PEL/CEL, assurance-vie et bons de capitalisation, PEP.
 * Un remplacement global de « 17,2 » par « 18,6 » dans le contenu du site
 * rendrait fausses toutes les pages qui comparent le PEA à l'assurance-vie.
 *
 * LE CAS DU PEA, qui est le cadre majoritaire de l'audience : le gain net de
 * PEA relève du 5° du II de l'article L. 136-7. La liste dérogatoire du IV
 * couvre les 1°, 2°, 2° bis, 3° et 4° de ce même II — elle s'arrête au 4°.
 * Le PEA n'y figure pas : il suit donc la hausse, à 18,6 %, pour les retraits
 * faits depuis le 1er janvier 2026. Vérifié en lisant les deux articles, pas
 * en le déduisant.
 *
 * ─── Ce que ce barème NE modélise PAS ───────────────────────────────────────
 *
 * - Les années antérieures à 2018 (pas de PFU) : `PREMIERE_ANNEE_BAREME`.
 * - La clause de sauvegarde des PEA ouverts AVANT le 01/01/2018 (LFSS 2018,
 *   art. 8, V), qui conserve les taux historiques sur la seule fraction de
 *   gain acquise avant cette date. Le calcul est juste pour un plan ouvert à
 *   partir de 2018 — le cas majoritaire — et SURESTIME légèrement l'impôt d'un
 *   plan plus ancien. Le récap fiscal, qui connaît la date du premier
 *   versement, le signale à l'utilisateur.
 */
export type CategorieRevenuCapital =
  /** Vente de titres sur un CTO (revenus du patrimoine, art. L. 136-6 CSS). */
  | "plus-value-cession"
  /** Dividendes, intérêts, gain d'un retrait de PEA (art. L. 136-7 CSS). */
  | "produit-placement";

export const BAREMES_CAPITAL: Record<
  CategorieRevenuCapital,
  Record<number, { sociaux: number; pfu: number }>
> = {
  "plus-value-cession": {
    2018: { sociaux: 0.172, pfu: 0.3 },
    // Plus-values réalisées en 2025, déclarées en 2026 : déjà 18,6 %.
    2025: { sociaux: 0.186, pfu: 0.314 },
  },
  "produit-placement": {
    2018: { sociaux: 0.172, pfu: 0.3 },
    // Dividendes et retraits de PEA perçus à partir du 1er janvier 2026.
    2026: { sociaux: 0.186, pfu: 0.314 },
  },
};

/**
 * Date à laquelle les taux de BAREMES_CAPITAL ont été relus sur les textes et
 * les fiches officielles (LFSS 2026 art. 12, CGI art. 200 A, service-public
 * F2329 et F21618, impots.gouv.fr), YYYY-MM-DD.
 *
 * Ajoutée le 30/09/2026 : /calculateur-fiscal-pea-cto affiche « taux vérifiés
 * le … » à côté des taux. À changer avec le barème, et seulement quand on l'a
 * réellement relu — une date de vérification qu'on avance sans relire est un
 * chiffre inventé.
 */
export const TAUX_VERIFIES_LE = "2026-09-28";

/** Premier millésime connu du barème. Avant, le PFU n'existait pas : un calcul
 *  sur une année antérieure serait faux, l'appelant doit le refuser. */
export const PREMIERE_ANNEE_BAREME = 2018;

/**
 * Barème applicable à une année et à une catégorie de revenu : le millésime le
 * plus récent qui lui soit antérieur ou égal. Une année postérieure au dernier
 * millésime prolonge le dernier barème connu — le contraire ferait planter un
 * récap sur une année non encore inscrite. Une année antérieure à 2018 reçoit
 * le premier millésime : c'est à l'appelant de ne pas l'afficher comme exact
 * (voir `PREMIERE_ANNEE_BAREME`).
 *
 * La catégorie est obligatoire, à dessein : pour 2025, la réponse change selon
 * qu'il s'agit d'une vente sur CTO ou d'un retrait de PEA.
 */
export function baremeCapital(
  annee: number,
  categorie: CategorieRevenuCapital
): { sociaux: number; pfu: number } {
  const bareme = BAREMES_CAPITAL[categorie];
  const millesimes = Object.keys(bareme)
    .map(Number)
    .sort((a, b) => a - b);
  const retenu = millesimes.filter((m) => m <= annee).pop() ?? millesimes[0];
  return bareme[retenu];
}

/**
 * Alias sur le millésime en cours, pour les appelants qui n'ont pas d'année à
 * fournir (pages de contenu, simulateur). `currentYear()` répond dans le fuseau
 * de l'audience, pas dans celui du serveur : au 1er janvier, un serveur en UTC
 * aurait basculé une heure trop tard pour un lecteur français.
 *
 * Depuis le 1er janvier 2026, les deux catégories ont le même barème : les
 * alias n'ont donc pas besoin de catégorie. On lit celle dont la hausse est la
 * plus tardive (produits de placement), pour qu'un alias ne devance jamais la
 * loi. Pour une année passée, appeler `baremeCapital(annee, categorie)`.
 */
const BAREME_EN_COURS = baremeCapital(currentYear(), "produit-placement");

/** Prélèvements sociaux — PEA de 5 ans ou plus (seul prélèvement dû). */
export const SOCIAL_CHARGES_RATE = BAREME_EN_COURS.sociaux;

/** PFU (Prélèvement Forfaitaire Unique) — CTO, et PEA clôturé avant 5 ans. */
export const PFU_RATE = BAREME_EN_COURS.pfu;

/** Un taux (0.186) en pourcentage affichable (« 18,6 »). Garde la décimale
 *  quand elle existe, la supprime quand le taux est entier. */
export function tauxAffiche(taux: number): string {
  const pct = Math.round(taux * 1000) / 10;
  return (Number.isInteger(pct) ? String(pct) : pct.toFixed(1)).replace(".", ",");
}

// ─── Per-account calculations ────────────────────────────────────────────────

/**
 * PEA tax computation. Le gain d'un retrait de PEA est un produit de placement :
 * barème « produit-placement » de l'année du retrait (17,2 % en 2025, 18,6 %
 * depuis le 1er janvier 2026).
 * - Closure < 5 years: gain × PFU du millésime
 * - Closure ≥ 5 years: gain × prélèvements sociaux du millésime (only — PEA is income-tax exempt)
 * - Loss: 0 tax (loss can be carried forward but we don't model that)
 */
function computePeaResult(input: FiscalInput): AccountResult {
  const { totalInvested, finalValue, holdingYears } = input;
  const capitalGain = finalValue - totalInvested;
  const { pfu, sociaux } = baremeCapital(
    input.annee ?? currentYear(),
    "produit-placement"
  );

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
    const taxDue = capitalGain * pfu;
    return {
      totalInvested,
      grossFinalValue: finalValue,
      capitalGain,
      taxRate: pfu,
      taxDue,
      netFinalValue: finalValue - taxDue,
      netGain: finalValue - taxDue - totalInvested,
      taxRuleLabel: `PFU ${tauxAffiche(pfu)} % (clôture avant 5 ans)`,
    };
  }

  const taxDue = capitalGain * sociaux;
  return {
    totalInvested,
    grossFinalValue: finalValue,
    capitalGain,
    taxRate: sociaux,
    taxDue,
    netFinalValue: finalValue - taxDue,
    netGain: finalValue - taxDue - totalInvested,
    taxRuleLabel: `Prélèvements sociaux ${tauxAffiche(sociaux)} % uniquement (≥ 5 ans)`,
  };
}

/**
 * CTO tax computation. PFU on all gains, regardless of holding duration —
 * barème « plus-value-cession » de l'année de la vente (31,4 % dès les
 * plus-values réalisées en 2025).
 * IR-progressive option exists but is more advanced — not modeled here.
 */
function computeCtoResult(input: FiscalInput): AccountResult {
  const { totalInvested, finalValue } = input;
  const capitalGain = finalValue - totalInvested;
  const { pfu, sociaux } = baremeCapital(
    input.annee ?? currentYear(),
    "plus-value-cession"
  );

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

  const taxDue = capitalGain * pfu;
  return {
    totalInvested,
    grossFinalValue: finalValue,
    capitalGain,
    taxRate: pfu,
    taxDue,
    netFinalValue: finalValue - taxDue,
    netGain: finalValue - taxDue - totalInvested,
    taxRuleLabel: `PFU ${tauxAffiche(pfu)} % (${tauxAffiche(pfu - sociaux)} % IR + ${tauxAffiche(sociaux)} % sociaux)`,
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
  const { totalInvested, finalValue, holdingYears, annee } = input;

  if (totalInvested <= PEA_DEPOSIT_CAP_EUR) return undefined;

  // Gain ratio applied uniformly: each EUR invested becomes ratio × EUR.
  const ratio = finalValue / totalInvested;

  const peaInvested = PEA_DEPOSIT_CAP_EUR;
  const peaFinal = peaInvested * ratio;
  const peaPortion = computePeaResult({
    totalInvested: peaInvested,
    finalValue: peaFinal,
    holdingYears,
    annee,
  });

  const ctoInvested = totalInvested - PEA_DEPOSIT_CAP_EUR;
  const ctoFinal = ctoInvested * ratio;
  const ctoPortion = computeCtoResult({
    totalInvested: ctoInvested,
    finalValue: ctoFinal,
    holdingYears,
    annee,
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
