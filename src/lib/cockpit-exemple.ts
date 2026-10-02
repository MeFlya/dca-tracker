// Jeu de démonstration du Cockpit DCA v2.0, et les calculs du classeur.
//
// ─── Pourquoi ce fichier ────────────────────────────────────────────────────
//
// /suivi-pea-excel montre les captures du classeur (public/produits/
// cockpit-v2-*.png) et explique ses formules sur ces mêmes chiffres : PRU,
// poids, versement du mois, TRI. Écrits à la main, ces nombres pourraient
// diverger des captures au premier changement du jeu d'exemple. Ici, la page
// les CALCULE à partir des 87 achats et des 3 cours du classeur livré, avec
// les mêmes règles que ses formules (onglets Par ETF, Versement du mois, PEA,
// Dashboard!B9).
//
// 02/10/2026 : l'exemple passe aux COURS RÉELS. Les achats restent fictifs
// (mêmes parts, mêmes frais de 1,99 €), mais chaque prix est la clôture
// réelle sur Euronext Paris du 15 du mois, ou du jour de bourse suivant
// (9 mois décalés au lundi), et les cours de Par ETF sont les clôtures du
// 02/10/2026 (PE500 56,73 €, ETZ 20,84 €, PAEEM 37,22 €). Sources : Euronext
// (clôture officielle, fait foi depuis le 03/10/2024 : son téléchargement ne
// remonte que 2 ans), Yahoo Finance avant, Boursorama en recoupement ; aucun
// écart de plus de 0,5 % entre sources (private-assets/raw/
// cockpit-v2-cours-reels/, hors dépôt). Prix publiés au millième (20,226 €) :
// le classeur les affiche au centime mais calcule sur le prix exact.
//
// Données extraites le 02/10/2026 de private-assets/raw/template-suivi-dca.xlsx
// (Cockpit v2.0 aux cours réels, sha1 638dab57…, celui que télécharge un
// acheteur). Valeurs recoupées avec celles qu'Excel a enregistrées dans le
// fichier le 02/10/2026 : versé 8 107,21 €, valeur 10 380,37 €, plus-value
// +2 273,16 € (+28,0 %), PRU PE500 44,40 €, ETZ 17,73 €, PAEEM 26,11 €,
// versement de 300 € → 14 ETZ (291,76 €, reliquat 8,24 €), TRI 16,98 % au
// 2 octobre 2026.
// Avant (classeur sha1 a82643e6…, archivé dans private-assets/raw/archives/) :
// achats ET cours fictifs, valeur 8 119,91 €, TRI 5,49 % au 1er octobre 2026.
//
// ⚠️ Si le jeu d'exemple du classeur change, régénérer ces données ET les
// captures : les deux doivent montrer la même chose.

/** [date ISO, ticker, parts, prix unitaire €, frais €] — onglet Transactions. */
type Achat = readonly [string, string, number, number, number];

export const ACHATS_EXEMPLE: readonly Achat[] = [
  ["2024-01-15", "PE500", 4, 35.7, 1.99],
  ["2024-01-15", "ETZ", 4, 14.53, 1.99],
  ["2024-01-15", "PAEEM", 2, 20.226, 1.99],
  ["2024-02-15", "PE500", 4, 37.92, 1.99],
  ["2024-02-15", "ETZ", 4, 14.982, 1.99],
  ["2024-02-15", "PAEEM", 2, 20.807, 1.99],
  ["2024-03-15", "PE500", 4, 38.271, 1.99],
  ["2024-03-15", "ETZ", 4, 15.528, 1.99],
  ["2024-03-15", "PAEEM", 2, 21.14, 1.99],
  ["2024-04-15", "PE500", 4, 39.441, 1.99],
  ["2024-04-15", "ETZ", 4, 15.61, 1.99],
  ["2024-04-15", "PAEEM", 3, 21.047, 1.99],
  ["2024-05-15", "PE500", 4, 39.893, 1.99],
  ["2024-05-15", "ETZ", 4, 16.322, 1.99],
  ["2024-05-15", "PAEEM", 3, 22.402, 1.99],
  ["2024-06-17", "PE500", 4, 41.959, 1.99],
  ["2024-06-17", "ETZ", 4, 15.972, 1.99],
  ["2024-06-17", "PAEEM", 2, 21.85, 1.99],
  ["2024-07-15", "PE500", 4, 42.974, 1.99],
  ["2024-07-15", "ETZ", 4, 16.214, 1.99],
  ["2024-07-15", "PAEEM", 2, 22.38, 1.99],
  ["2024-08-15", "PE500", 4, 41.472, 1.99],
  ["2024-08-15", "ETZ", 4, 16, 1.99],
  ["2024-08-15", "PAEEM", 2, 21.964, 1.99],
  ["2024-09-16", "PE500", 4, 41.548, 1.99],
  ["2024-09-16", "ETZ", 4, 16.146, 1.99],
  ["2024-09-16", "PAEEM", 2, 21.968, 1.99],
  ["2024-10-15", "PE500", 4, 44.139, 1.99],
  ["2024-10-15", "ETZ", 4, 16.326, 1.99],
  ["2024-10-15", "PAEEM", 2, 23.7, 1.99],
  ["2024-11-15", "PE500", 4, 45.822, 1.99],
  ["2024-11-15", "ETZ", 4, 15.8, 1.99],
  ["2024-11-15", "PAEEM", 2, 23.047, 1.99],
  ["2024-12-16", "PE500", 4, 47.166, 1.99],
  ["2024-12-16", "ETZ", 4, 16.224, 1.99],
  ["2024-12-16", "PAEEM", 2, 23.86, 1.99],
  ["2025-01-15", "PE500", 4, 47.023, 1.99],
  ["2025-01-15", "ETZ", 4, 16.202, 1.99],
  ["2025-01-15", "PAEEM", 2, 23.462, 1.99],
  ["2025-02-17", "PE500", 4, 47.252, 1.99],
  ["2025-02-17", "ETZ", 4, 17.49, 1.99],
  ["2025-02-17", "PAEEM", 2, 25.16, 1.99],
  ["2025-03-17", "PE500", 3, 41.731, 1.99],
  ["2025-03-17", "ETZ", 4, 17.388, 1.99],
  ["2025-03-17", "PAEEM", 2, 24.498, 1.99],
  ["2025-04-15", "PE500", 3, 38.972, 1.99],
  ["2025-04-15", "ETZ", 4, 16.1, 1.99],
  ["2025-04-15", "PAEEM", 2, 22.5, 1.99],
  ["2025-05-15", "PE500", 3, 42.402, 1.99],
  ["2025-05-15", "ETZ", 4, 17.454, 1.99],
  ["2025-05-15", "PAEEM", 2, 24.831, 1.99],
  ["2025-06-16", "PE500", 3, 41.898, 1.99],
  ["2025-06-16", "ETZ", 4, 17.524, 1.99],
  ["2025-06-16", "PAEEM", 2, 24.85, 1.99],
  ["2025-07-15", "PE500", 3, 43.621, 1.99],
  ["2025-07-15", "ETZ", 4, 17.482, 1.99],
  ["2025-07-15", "PAEEM", 2, 25.519, 1.99],
  ["2025-08-15", "PE500", 3, 44.702, 1.99],
  ["2025-08-15", "ETZ", 4, 17.814, 1.99],
  ["2025-08-15", "PAEEM", 2, 25.933, 1.99],
  ["2025-09-15", "PE500", 3, 45.416, 1.99],
  ["2025-09-15", "ETZ", 4, 17.93, 1.99],
  ["2025-09-15", "PAEEM", 2, 27.17, 1.99],
  ["2025-10-15", "PE500", 3, 46.755, 1.99],
  ["2025-10-15", "ETZ", 4, 18.29, 1.99],
  ["2025-10-15", "PAEEM", 2, 28.224, 1.99],
  ["2025-11-17", "PE500", 3, 47.632, 1.99],
  ["2025-11-17", "ETZ", 4, 18.434, 1.99],
  ["2025-11-17", "PAEEM", 2, 28.397, 1.99],
  ["2025-12-15", "PE500", 3, 47.841, 1.99],
  ["2025-12-15", "ETZ", 4, 18.808, 1.99],
  ["2025-12-15", "PAEEM", 2, 27.955, 1.99],
  ["2026-01-15", "PE500", 3, 49.543, 1.99],
  ["2026-01-15", "ETZ", 4, 19.856, 1.99],
  ["2026-01-15", "PAEEM", 2, 30.667, 1.99],
  ["2026-02-16", "PE500", 3, 47.787, 1.99],
  ["2026-02-16", "ETZ", 4, 19.992, 1.99],
  ["2026-02-16", "PAEEM", 2, 31.671, 1.99],
  ["2026-03-16", "PE500", 3, 48.07, 1.99],
  ["2026-03-16", "ETZ", 4, 19.392, 1.99],
  ["2026-03-16", "PAEEM", 2, 30.939, 1.99],
  ["2026-04-15", "PE500", 3, 48.849, 1.99],
  ["2026-04-15", "ETZ", 4, 20.08, 1.99],
  ["2026-04-15", "PAEEM", 2, 32.147, 1.99],
  ["2026-05-15", "PE500", 3, 52.828, 1.99],
  ["2026-05-15", "ETZ", 4, 19.858, 1.99],
  ["2026-05-15", "PAEEM", 2, 34.275, 1.99],
];

/** Onglet Par ETF : allocation cible et cours retenu (cours manuel, col. F) : clôtures du 02/10/2026. */
export const ETF_EXEMPLE = [
  { ticker: "PE500", nom: "Amundi PEA S&P 500 Screened", cible: 0.5, cours: 56.73 },
  { ticker: "ETZ", nom: "BNP Paribas Easy STOXX Europe 600", cible: 0.3, cours: 20.84 },
  { ticker: "PAEEM", nom: "Amundi PEA Emergent ESG Transition", cible: 0.2, cours: 37.22 },
] as const;

/** Onglet PEA : date d'ouverture saisie dans l'exemple. */
export const OUVERTURE_PEA_EXEMPLE = "2024-01-15";
/** Plafond légal des versements d'un PEA (CMF L. 221-30). */
export const PLAFOND_PEA = 150_000;
/**
 * Date à laquelle les captures ont été prises (TRI et compteurs en dépendent).
 * 02/10/2026 : c'est aussi la date des cours de Par ETF (clôtures du jour),
 * pour que le TRI calculé ici et celui de la capture portent sur le même jour.
 */
export const DATE_CAPTURES = "2026-10-02";

/** Montant total d'un achat, frais inclus — Transactions!F. */
export const montantAchat = ([, , parts, prix, frais]: Achat) => parts * prix + frais;

export type LigneEtf = {
  ticker: string;
  nom: string;
  cible: number;
  cours: number;
  parts: number;
  investi: number;
  /** Prix de revient unitaire, frais inclus — Par ETF!J. */
  pru: number;
  valeur: number;
  plusValue: number;
  perf: number;
  poids: number;
  ecart: number;
};

/** Onglet Par ETF, ligne par ligne (SOMME.SI.ENS sur le journal). */
export function lignesExemple(): LigneEtf[] {
  const base = ETF_EXEMPLE.map((e) => {
    const achats = ACHATS_EXEMPLE.filter((a) => a[1] === e.ticker);
    const parts = achats.reduce((s, a) => s + a[2], 0);
    const investi = achats.reduce((s, a) => s + montantAchat(a), 0);
    const valeur = parts * e.cours;
    return { ...e, parts, investi, pru: investi / parts, valeur, plusValue: valeur - investi, perf: (valeur - investi) / investi };
  });
  const total = base.reduce((s, l) => s + l.valeur, 0);
  return base.map((l) => ({ ...l, poids: l.valeur / total, ecart: l.valeur / total - l.cible }));
}

export function totauxExemple() {
  const lignes = lignesExemple();
  const investi = lignes.reduce((s, l) => s + l.investi, 0);
  const valeur = lignes.reduce((s, l) => s + l.valeur, 0);
  return { investi, valeur, plusValue: valeur - investi, perf: (valeur - investi) / investi };
}

export type LigneVersement = {
  ticker: string;
  cible: number;
  valeur: number;
  cibleApres: number;
  manque: number;
  suggere: number;
  parts: number;
  arrondi: number;
  reliquat: number;
  cours: number;
};

/**
 * Onglet Versement du mois (rééquilibrage par les flux), formules E à J :
 * cible après versement, manque, répartition au prorata des manques (ou selon
 * les cibles si tout est au-dessus), parts arrondies à l'entier inférieur.
 */
export function versementExemple(montant: number) {
  const lignes = lignesExemple();
  const totalApres = lignes.reduce((s, l) => s + l.valeur, 0) + montant;
  const avecManque = lignes.map((l) => {
    const cibleApres = l.cible * totalApres;
    return { l, cibleApres, manque: Math.max(0, cibleApres - l.valeur) };
  });
  const totalManque = avecManque.reduce((s, x) => s + x.manque, 0);
  const res: LigneVersement[] = avecManque.map(({ l, cibleApres, manque }) => {
    const suggere =
      totalManque === 0
        ? montant * l.cible
        : totalManque >= montant
          ? (montant * manque) / totalManque
          : manque + (montant - totalManque) * l.cible;
    const parts = Math.floor(suggere / l.cours);
    const arrondi = parts * l.cours;
    return { ticker: l.ticker, cible: l.cible, valeur: l.valeur, cibleApres, manque, suggere, parts, arrondi, reliquat: suggere - arrondi, cours: l.cours };
  });
  const investi = res.reduce((s, l) => s + l.arrondi, 0);
  return { lignes: res, totalApres, investi, reliquat: montant - investi };
}

const JOUR_MS = 86_400_000;

/**
 * TRI annualisé (XIRR, base 365 jours comme Excel et Google Sheets) : achats
 * en flux négatifs, valeur du portefeuille en flux positif à `dateFin`.
 * Dashboard!B9 du Cockpit fait le même calcul en partant du premier flux non
 * nul (le piège corrigé en v2.0).
 */
export function triExemple(dateFin = DATE_CAPTURES): number {
  const t0 = Date.parse(ACHATS_EXEMPLE[0][0]);
  const flux = ACHATS_EXEMPLE.map((a) => ({ t: (Date.parse(a[0]) - t0) / JOUR_MS / 365, v: -montantAchat(a) }));
  flux.push({ t: (Date.parse(dateFin) - t0) / JOUR_MS / 365, v: totauxExemple().valeur });
  const van = (r: number) => flux.reduce((s, f) => s + f.v / Math.pow(1 + r, f.t), 0);
  // Bissection : la VAN décroît avec le taux pour ce profil de flux.
  let bas = -0.99;
  let haut = 1;
  for (let i = 0; i < 200; i++) {
    const milieu = (bas + haut) / 2;
    if (van(milieu) > 0) bas = milieu;
    else haut = milieu;
  }
  return (bas + haut) / 2;
}

/** Date des 5 ans du PEA : 5 ans après le premier versement. */
export function cinqAnsExemple(): string {
  const d = new Date(`${OUVERTURE_PEA_EXEMPLE}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 5);
  return d.toISOString().slice(0, 10);
}
