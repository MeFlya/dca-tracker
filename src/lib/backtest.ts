// Backtest historique : reconstitue ce qu'aurait donné un DCA mensuel
// sur l'indice MSCI World (proxy IWDA.AS EUR) entre deux dates.
//
// Pourquoi cette feature :
//   - Le simulateur classique projette à partir d'un rendement annuel
//     constant (7 %/an). Le backtest utilise des données HISTORIQUES
//     RÉELLES, donc on voit les vrais creux (COVID, 2022, etc.).
//   - C'est la seule feature Premium intrinsèquement RÉCURRENTE :
//     l'user revient backtester à chaque doute, chaque ajustement, chaque
//     krach. Ça transforme Premium en outil de référence vs gadget
//     one-shot.
//
// Limites assumées (à afficher dans l'UI) :
//   - Pas de frais de courtage par ordre
//   - Pas de fiscalité (PFU/PS) à la sortie
//   - La série démarre en janvier 2008 : la crise de 2008 est couverte, le
//     sommet mondial d'octobre 2007 et la bulle internet ne le sont pas.
//
// ⚠️ CE QUI N'EST PAS UNE LIMITE, contrairement à ce qui était écrit ici :
// « pas de TER déduit ». C'était faux dans les deux sens. Le moteur achète des
// parts au COURS DE MARCHÉ (ligne ~230, monthlyAmount / price), et la valeur
// liquidative d'un ETF est déjà nette de ses frais de gestion, prélevés en
// continu sur l'actif. Les 0,45 %/an du fonds sont donc DANS ces chiffres ;
// les retrancher les compterait deux fois. Le taux cité était en outre celui
// d'IWDA (0,20 %), série remplacée le 04/08/2026.
//
// Ce commentaire disait « à afficher dans l'UI », et il l'a été : trois pages
// publiaient cette fausse limite. Un commentaire de code qui décrit une
// intention finit par être recopié dans du contenu — il vaut mieux qu'il soit
// juste.

import dataset from "@/data/msci-world-eur.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PricePoint {
  /** YYYY-MM (ex: "2020-03"). */
  month: string;
  /** Cours de clôture de fin de mois en EUR. */
  value: number;
}

export interface BacktestInput {
  /** Versement mensuel en EUR (ex: 200). */
  monthlyAmount: number;
  /** Mois de début inclus, format "YYYY-MM" (ex: "2010-01"). */
  startMonth: string;
  /** Mois de fin inclus, format "YYYY-MM" (ex: "2024-12"). */
  endMonth: string;
}

export interface BacktestSeriesPoint {
  /** YYYY-MM */
  month: string;
  /** Capital investi cumulé en fin de ce mois. */
  invested: number;
  /** Valeur du portefeuille (parts × cours de ce mois) en fin de ce mois. */
  value: number;
}

export interface BacktestResult {
  /** Nb de mois investis (= nb de versements). */
  monthsInvested: number;
  /** Capital total investi (= monthlyAmount × monthsInvested). */
  totalInvested: number;
  /** Valeur du portefeuille au mois de fin (parts × dernier cours). */
  finalValue: number;
  /** Gain absolu (finalValue − totalInvested). Peut être négatif. */
  gainAbs: number;
  /** Gain relatif au capital investi, en pourcentage (ex: 45.2). */
  gainPct: number;
  /** Taux de rendement interne annualisé (%). null si non convergent. */
  irrAnnualPct: number | null;
  /**
   * Drawdown maximum traversé en route :
   *   { pct, peakMonth, troughMonth }
   * Le drawdown est calculé sur la valeur du portefeuille (pas sur le
   * cours de l'ETF) — c'est la "vraie" perte de papier qu'a vécue l'user.
   */
  maxDrawdown: {
    pct: number;
    peakMonth: string;
    troughMonth: string;
  } | null;
  /** Série mois-par-mois (pour le graphique). */
  series: BacktestSeriesPoint[];
}

// ─── Dataset access ──────────────────────────────────────────────────────────

const PRICES: PricePoint[] = dataset.data;
const PRICE_BY_MONTH = new Map(PRICES.map((p) => [p.month, p.value]));

/**
 * Bornes disponibles dans le dataset.
 * Exposé pour que l'UI clamp les inputs de date dans la fenêtre dispo.
 */
export function getAvailableRange(): { min: string; max: string } {
  return {
    min: PRICES[0].month,
    max: PRICES[PRICES.length - 1].month,
  };
}

/** Métadonnées du dataset — exposées pour affichage UI. */
export function getDatasetMeta() {
  return {
    source: dataset.source,
    currency: dataset.currency,
    sourceUrl: dataset.source_url,
    fetchedAt: dataset.fetched_at,
    pointsCount: PRICES.length,
    notes: dataset.notes,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** "2020-03" → 2020*12 + 2 = 24242 (mois absolu, pour comparer / itérer). */
function monthIndex(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return y * 12 + (m - 1);
}

/** Inverse de monthIndex. */
function indexToMonth(idx: number): string {
  const y = Math.floor(idx / 12);
  const m = (idx % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Liste tous les mois (YYYY-MM) entre start et end inclus. */
function monthRange(start: string, end: string): string[] {
  const a = monthIndex(start);
  const b = monthIndex(end);
  const out: string[] = [];
  for (let i = a; i <= b; i++) out.push(indexToMonth(i));
  return out;
}

// ─── IRR (Newton-Raphson) ────────────────────────────────────────────────────
//
// Cashflows DCA :
//   - À t = 0, 1, 2, …, N-1 mois : cf = -monthlyAmount (versement)
//   - À t = N-1 mois : cf += finalValue (vente fictive à la fin)
//
// On résout pour r_mensuel tel que sum(cf_i / (1 + r_m)^i) = 0
// Puis IRR_annuel = (1 + r_m)^12 - 1.
//
// Newton-Raphson converge bien tant que les cashflows sont "DCA classiques"
// (signe négatif uniforme puis bascule positive à la fin). Sinon → null.

function npv(cashflows: number[], r: number): number {
  let total = 0;
  for (let i = 0; i < cashflows.length; i++) {
    total += cashflows[i] / Math.pow(1 + r, i);
  }
  return total;
}

function npvDerivative(cashflows: number[], r: number): number {
  let total = 0;
  for (let i = 1; i < cashflows.length; i++) {
    total -= (i * cashflows[i]) / Math.pow(1 + r, i + 1);
  }
  return total;
}

/**
 * Retourne le taux mensuel qui annule la NPV (= IRR mensuel).
 * `null` si pas de convergence ou cashflows invalides.
 */
function solveIrrMonthly(cashflows: number[]): number | null {
  // Sanity : il faut au moins un cashflow négatif et un positif.
  const hasNeg = cashflows.some((c) => c < 0);
  const hasPos = cashflows.some((c) => c > 0);
  if (!hasNeg || !hasPos) return null;

  let r = 0.01; // 1 %/mois ≈ 12,7 %/an comme point de départ
  const maxIter = 100;
  const tolerance = 1e-7;

  for (let iter = 0; iter < maxIter; iter++) {
    const f = npv(cashflows, r);
    if (Math.abs(f) < tolerance) return r;
    const fp = npvDerivative(cashflows, r);
    if (Math.abs(fp) < 1e-15) return null; // dérivée nulle → on stoppe
    const rNext = r - f / fp;
    // Garde-fou : on évite r < -1 (taux mensuel < -100 % n'a aucun sens)
    if (rNext <= -0.99) {
      r = -0.5;
      continue;
    }
    if (Math.abs(rNext - r) < tolerance) return rNext;
    r = rNext;
  }
  return null; // pas de convergence
}

// ─── Core: runBacktest ───────────────────────────────────────────────────────

/**
 * Lance un backtest DCA mensuel sur l'indice MSCI World (EUR).
 * Throws si les inputs sont invalides ou hors dataset.
 */
export function runBacktest(input: BacktestInput): BacktestResult {
  if (input.monthlyAmount <= 0 || !Number.isFinite(input.monthlyAmount)) {
    throw new Error("Le versement mensuel doit être strictement positif.");
  }

  const range = getAvailableRange();
  if (monthIndex(input.startMonth) < monthIndex(range.min)) {
    throw new Error(
      `Date de début (${input.startMonth}) antérieure au dataset (min: ${range.min}).`,
    );
  }
  if (monthIndex(input.endMonth) > monthIndex(range.max)) {
    throw new Error(
      `Date de fin (${input.endMonth}) postérieure au dataset (max: ${range.max}).`,
    );
  }
  if (monthIndex(input.endMonth) <= monthIndex(input.startMonth)) {
    throw new Error("La date de fin doit être postérieure à la date de début.");
  }

  const months = monthRange(input.startMonth, input.endMonth);

  // Construit la série mois-par-mois :
  //   - Chaque mois, on achète pour `monthlyAmount` au cours de ce mois.
  //   - Le cumul de parts ne paie pas en arrière — c'est ce que l'user
  //     verrait dans son portefeuille en fin de mois.
  let totalShares = 0;
  let totalInvested = 0;
  const series: BacktestSeriesPoint[] = [];

  for (const month of months) {
    const price = PRICE_BY_MONTH.get(month);
    if (price === undefined) {
      // Mois manquant dans le dataset (très rare — Yahoo donne tout sur la
      // période). On skippe le versement de ce mois pour ne pas planter.
      continue;
    }
    const sharesAcquired = input.monthlyAmount / price;
    totalShares += sharesAcquired;
    totalInvested += input.monthlyAmount;

    const portfolioValue = totalShares * price;
    series.push({ month, invested: totalInvested, value: portfolioValue });
  }

  if (series.length === 0) {
    throw new Error("Aucun prix disponible sur la période demandée.");
  }

  const last = series[series.length - 1];
  const finalValue = last.value;
  const gainAbs = finalValue - totalInvested;
  const gainPct = (gainAbs / totalInvested) * 100;

  // ── IRR ────────────────────────────────────────────────────────────────
  // Cashflows : -monthlyAmount à chaque achat. Au tout dernier point,
  // on ajoute +finalValue (vente fictive).
  const cashflows: number[] = Array(series.length).fill(-input.monthlyAmount);
  cashflows[cashflows.length - 1] += finalValue;
  const irrMonthly = solveIrrMonthly(cashflows);
  const irrAnnualPct =
    irrMonthly !== null ? (Math.pow(1 + irrMonthly, 12) - 1) * 100 : null;

  // ── Max drawdown sur la valeur du portefeuille ────────────────────────
  let peak = series[0].value;
  let peakMonth = series[0].month;
  let maxDdPct = 0;
  let maxDdPeakMonth = series[0].month;
  let maxDdTroughMonth = series[0].month;

  for (const point of series) {
    if (point.value > peak) {
      peak = point.value;
      peakMonth = point.month;
    } else {
      const dd = ((peak - point.value) / peak) * 100;
      if (dd > maxDdPct) {
        maxDdPct = dd;
        maxDdPeakMonth = peakMonth;
        maxDdTroughMonth = point.month;
      }
    }
  }

  const maxDrawdown =
    maxDdPct > 0
      ? { pct: maxDdPct, peakMonth: maxDdPeakMonth, troughMonth: maxDdTroughMonth }
      : null;

  return {
    monthsInvested: series.length,
    totalInvested,
    finalValue,
    gainAbs,
    gainPct,
    irrAnnualPct,
    maxDrawdown,
    series,
  };
}

// ─── Formatters utilitaires (réutilisables dans l'UI) ────────────────────────

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEurBacktest(n: number): string {
  return EUR.format(n);
}

/** "2020-03" → "mars 2020" */
export function formatMonthFr(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  const formatted = d.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return formatted;
}
