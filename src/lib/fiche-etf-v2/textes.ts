// Fiches ETF v2 — mise en forme et textes calculés (14/10/2026).
//
// Tout chiffre affiché par une fiche v2 passe par ici : il est formaté au
// rendu à partir d'un fait, jamais écrit à la main dans le JSX (aucune hausse
// de la dette de scripts/check-montants-calcules.mjs). N'importe que des
// types : le title et la meta se recalculent dans le validateur.

import type { DateISO, FicheEtfV2, PerfCalendaire } from "./types";

const NBSP = " ";

/** 6.39 → « 6,39 % » ; -12.87 → « −12,87 % ». */
export function pct(v: number, decimales = 2): string {
  const s = Math.abs(v).toLocaleString("fr-FR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
  return `${v < 0 ? "−" : ""}${s}${NBSP}%`;
}

/** Écart en points : -0.37 → « −0,37 point » ; 0 → « 0,00 point ». */
export function points(v: number): string {
  const s = Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 ? "−" : v > 0 ? "+" : ""}${s}${NBSP}point${Math.abs(v) >= 2 ? "s" : ""}`;
}

/** 0.38 → « 0,38 % » (frais : deux décimales au moins). */
export function frais(v: number): string {
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}${NBSP}%`;
}

/** 697.44 → « 697,44 € ». */
export function euros(v: number, decimales = 2): string {
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}${NBSP}€`;
}

/** 7199.85 (M EUR) → « 7 199,85 M€ ». */
export function millions(v: number): string {
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${NBSP}M€`;
}

/** 7199.85 → « 7,2 milliards d'euros » ; 909.68 → « 910 millions d'euros ». */
export function encoursArrondi(mEur: number): string {
  if (mEur >= 1000) {
    const md = Math.round(mEur / 100) / 10;
    return `${md.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}${NBSP}${md < 2 ? "milliard" : "milliards"} d'euros`;
  }
  return `${Math.round(mEur).toLocaleString("fr-FR")}${NBSP}millions d'euros`;
}

/** « 2026-09-30 » → « 30/09/2026 ». */
export function dateCourte(iso: DateISO): string {
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
}

/** « 2026-09-30 » → « 30 septembre 2026 » ; le 1er du mois → « 1er ». */
export function dateLongue(iso: DateISO): string {
  return new Date(`${iso}T00:00:00Z`)
    .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .replace(/^1(?=\s)/, "1er");
}

/** Nombre de jours entre deux dates ISO. */
export function joursEntre(a: DateISO, b: DateISO): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Plan §1.7, règle 6 : au-delà de 45 jours sans relecture, « à revérifier ». */
export const FRAICHEUR_JOURS = 45;

/**
 * Date de mise en ligne des fiches v2 (lot B), AAAA-MM-JJ. À fixer au jour
 * réel du déploiement : elle sert de dateModified (JSON-LD) et de lastmod
 * (sitemap), avec la relecture (dateModifieeV2). Le registre refuse de
 * construire tant qu'elle est dans le futur, sauf aperçu local explicite
 * (FICHES_V2_APERCU=1) : une fiche v2 ne peut pas partir avant sa date, ni
 * annoncer une modification qui n'a pas encore eu lieu.
 */
export const MISE_EN_LIGNE_V2 = "2026-10-23";

/** dateModified et lastmod d'une fiche v2 : la plus récente de sa relecture et de sa mise en ligne. */
export function dateModifieeV2(f: FicheEtfV2): DateISO {
  return f.relueLe > MISE_EN_LIGNE_V2 ? f.relueLe : MISE_EN_LIGNE_V2;
}

/**
 * Title v2 (plan §2.2, revu le 14/10/2026) : « ETF CW8 : Amundi MSCI World
 * Swap, frais, performances, PEA ». « ETF » en tête, comme les requêtes
 * (« etf cw8 », « paeem etf ») ; « PEA » omis quand le nom court le contient
 * déjà (« Amundi PEA Monde ») : pas de mot répété.
 */
export function titreV2(f: FicheEtfV2): string {
  const statut = f.pea.statut.valeur ? (/\bPEA\b/.test(f.nomCourt) ? "" : ", PEA") : ", hors PEA";
  return `ETF ${f.mnemo} : ${f.nomCourt}, frais, performances${statut}`;
}

/** Meta v2 : ISIN, frais, statut PEA, émetteur et date des chiffres. */
export function descriptionV2(f: FicheEtfV2): string {
  const contenu = f.chiffres.nbValeursIndice ? "Performances, encours et contenu" : "Performances et encours";
  return (
    `${f.mnemo} (${f.isin.valeur}) : ${frais(f.ter.valeur)} de frais, ${f.pea.statut.valeur ? "éligible au PEA" : "hors PEA"}. ` +
    `${contenu} publiés par ${f.emetteur.nom} au ${dateCourte(f.chiffres.au)}, vérifiés à la source.`
  );
}

// ─── 100 € par mois : approximation annuelle ────────────────────────────────
//
// Décision par défaut du 14/10/2026 (spécification §3, bloc 11) : tant que la
// lecture de l'historique des valeurs liquidatives d'Amundi n'est pas
// autorisée, le calcul se fait UNIQUEMENT sur les performances par année
// civile publiées par l'émetteur, reproductibles par le lecteur : les douze
// versements de 100 € d'une année close sont regroupés en un seul, placé le
// 1er janvier, depuis la première année civile complète de la part actuelle ;
// pour l'année en cours, seulement les mois écoulés à la date des chiffres
// (9 × 100 € au 30/09), avec la performance « depuis le 31/12 » publiée.
// Relecture du 14/10/2026 : l'année en cours comptait 1 200 €, soit trois
// versements qui n'avaient pas encore eu lieu. Le « pire moment » est le plus
// grand écart entre la valeur et le total versé, lu seulement en fin d'année :
// c'est une approximation, et le texte le dit.

export interface DcaAnnuel {
  depuis: number;
  /** Années closes, chacune versée en une fois (12 × 100 €). */
  anneesCloses: number;
  /** Année en cours : mois écoulés à la date des chiffres, et somme versée. */
  anneeEnCours: { annee: number; mois: number; verse: number };
  totalVerse: number;
  valeurFinale: number;
  /** Plus grand écart sous le total versé, en % (négatif), à une fin d'année ; null si jamais sous. */
  pire: { annee: number; pct: number } | null;
  /** Années utilisées, dans l'ordre. */
  annees: number[];
}

/** Il faut au moins trois années civiles complètes (garde-fou « période courte »). */
export const DCA_ANNEES_MINIMUM = 3;
export const DCA_VERSEMENT_MENSUEL = 100;
export const DCA_VERSEMENT_ANNUEL = 12 * DCA_VERSEMENT_MENSUEL;

/** Mois civils entièrement écoulés au jour `au` dans son année (30/09 → 9 ; 15/10 → 9). */
export function moisEcoules(au: DateISO): number {
  const [a, m, j] = au.split("-").map(Number);
  const dernierJour = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return j === dernierJour ? m : m - 1;
}

/** Mois entre le 1er janvier de `depuis` et `au` (borne du contrôle des versements). */
export function moisDepuis(depuis: number, au: DateISO): number {
  return (Number(au.slice(0, 4)) - depuis) * 12 + moisEcoules(au);
}

export function dcaAnnuel(f: FicheEtfV2): DcaAnnuel | null {
  const creation = f.dates.creationPart.valeur;
  const premiere = Number(creation.slice(0, 4)) + (creation.endsWith("-01-01") ? 0 : 1);
  const parAnnee = new Map<number, PerfCalendaire>(f.chiffres.perfCalendaires.valeur.map((p) => [p.annee, p]));
  const derniere = Number(f.chiffres.au.slice(0, 4)) - 1;
  // Années consécutives, de la première année complète de la part à la dernière close.
  const debut = Math.max(premiere, Math.min(...parAnnee.keys()));
  const annees: number[] = [];
  for (let a = debut; a <= derniere; a++) {
    if (!parAnnee.has(a)) return null; // trou dans les données publiées : pas de calcul
    annees.push(a);
  }
  const ytd = f.chiffres.perfCumulees.valeur.find((p) => p.periode === "ytd");
  if (annees.length < DCA_ANNEES_MINIMUM || !ytd) return null;

  let valeur = 0;
  let verse = 0;
  let pire: DcaAnnuel["pire"] = null;
  for (const a of annees) {
    verse += DCA_VERSEMENT_ANNUEL;
    valeur = (valeur + DCA_VERSEMENT_ANNUEL) * (1 + parAnnee.get(a)!.fonds / 100);
    const ecart = ((valeur - verse) / verse) * 100;
    if (ecart < 0 && (pire === null || ecart < pire.pct)) pire = { annee: a, pct: ecart };
  }
  const mois = moisEcoules(f.chiffres.au);
  const verseEnCours = mois * DCA_VERSEMENT_MENSUEL;
  verse += verseEnCours;
  valeur = (valeur + verseEnCours) * (1 + ytd.fonds / 100);
  return {
    depuis: annees[0],
    anneesCloses: annees.length,
    anneeEnCours: { annee: Number(f.chiffres.au.slice(0, 4)), mois, verse: verseEnCours },
    totalVerse: verse,
    valeurFinale: valeur,
    pire,
    annees,
  };
}

// ─── Rendement sur 1, 3 et 5 ans ────────────────────────────────────────────
//
// Backlog SEO (14/10/2026) : « Quel est le rendement de CW8 ? » est une
// question réelle. La réponse reprend les performances cumulées publiées par
// l'émetteur ; l'équivalent annuel est un calcul de DCA Tracker, dit tel.

export interface RendementPeriode {
  periode: "1a" | "3a" | "5a";
  ans: number;
  cumule: number;
  /** Équivalent annuel, en % (calcul du site) ; null sur 1 an. */
  annualise: number | null;
}

export function rendements(f: FicheEtfV2): RendementPeriode[] {
  const ans = { "1a": 1, "3a": 3, "5a": 5 } as const;
  return (["1a", "3a", "5a"] as const).flatMap((periode) => {
    const p = f.chiffres.perfCumulees.valeur.find((x) => x.periode === periode);
    if (!p) return [];
    const n = ans[periode];
    return [{ periode, ans: n, cumule: p.fonds, annualise: n > 1 ? (Math.pow(1 + p.fonds / 100, 1 / n) - 1) * 100 : null }];
  });
}
