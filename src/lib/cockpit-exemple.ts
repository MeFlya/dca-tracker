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
// Données extraites le 01/10/2026 de private-assets/raw/template-suivi-dca.xlsx
// (Cockpit v2.0, sha1 487c1319…, celui que télécharge un acheteur). Valeurs
// recoupées avec celles qu'Excel a enregistrées dans le fichier : valeur
// 8 119,91 €, PE500 PRU 38,23 €, versement de 300 € → 6 ETZ et 7 PAEEM,
// TRI 5,49 % au 1er octobre 2026.
//
// ⚠️ Si le jeu d'exemple du classeur change, régénérer ces données ET les
// captures : les deux doivent montrer la même chose.

/** [date ISO, ticker, parts, prix unitaire €, frais €] — onglet Transactions. */
type Achat = readonly [string, string, number, number, number];

export const ACHATS_EXEMPLE: readonly Achat[] = [
  ["2024-01-15", "PE500", 4, 33.2, 1.99],
  ["2024-01-15", "ETZ", 4, 18.61, 1.99],
  ["2024-01-15", "PAEEM", 2, 21.05, 1.99],
  ["2024-02-15", "PE500", 4, 33.9, 1.99],
  ["2024-02-15", "ETZ", 4, 18.73, 1.99],
  ["2024-02-15", "PAEEM", 2, 20.77, 1.99],
  ["2024-03-15", "PE500", 4, 34.52, 1.99],
  ["2024-03-15", "ETZ", 4, 18.73, 1.99],
  ["2024-03-15", "PAEEM", 2, 20.35, 1.99],
  ["2024-04-15", "PE500", 4, 35, 1.99],
  ["2024-04-15", "ETZ", 4, 18.62, 1.99],
  ["2024-04-15", "PAEEM", 3, 19.99, 1.99],
  ["2024-05-15", "PE500", 4, 35.29, 1.99],
  ["2024-05-15", "ETZ", 4, 18.47, 1.99],
  ["2024-05-15", "PAEEM", 3, 19.86, 1.99],
  ["2024-06-15", "PE500", 4, 35.41, 1.99],
  ["2024-06-15", "ETZ", 4, 18.35, 1.99],
  ["2024-06-15", "PAEEM", 2, 20.04, 1.99],
  ["2024-07-15", "PE500", 4, 35.38, 1.99],
  ["2024-07-15", "ETZ", 4, 18.31, 1.99],
  ["2024-07-15", "PAEEM", 2, 20.47, 1.99],
  ["2024-08-15", "PE500", 4, 35.3, 1.99],
  ["2024-08-15", "ETZ", 4, 18.4, 1.99],
  ["2024-08-15", "PAEEM", 2, 20.99, 1.99],
  ["2024-09-15", "PE500", 4, 35.25, 1.99],
  ["2024-09-15", "ETZ", 4, 18.6, 1.99],
  ["2024-09-15", "PAEEM", 2, 21.39, 1.99],
  ["2024-10-15", "PE500", 4, 35.33, 1.99],
  ["2024-10-15", "ETZ", 4, 18.87, 1.99],
  ["2024-10-15", "PAEEM", 2, 21.53, 1.99],
  ["2024-11-15", "PE500", 4, 35.58, 1.99],
  ["2024-11-15", "ETZ", 4, 19.15, 1.99],
  ["2024-11-15", "PAEEM", 2, 21.36, 1.99],
  ["2024-12-15", "PE500", 4, 36.04, 1.99],
  ["2024-12-15", "ETZ", 4, 19.35, 1.99],
  ["2024-12-15", "PAEEM", 2, 20.97, 1.99],
  ["2025-01-15", "PE500", 4, 36.69, 1.99],
  ["2025-01-15", "ETZ", 4, 19.43, 1.99],
  ["2025-01-15", "PAEEM", 2, 20.55, 1.99],
  ["2025-02-15", "PE500", 4, 37.46, 1.99],
  ["2025-02-15", "ETZ", 4, 19.39, 1.99],
  ["2025-02-15", "PAEEM", 2, 20.3, 1.99],
  ["2025-03-15", "PE500", 3, 38.25, 1.99],
  ["2025-03-15", "ETZ", 4, 19.26, 1.99],
  ["2025-03-15", "PAEEM", 2, 20.34, 1.99],
  ["2025-04-15", "PE500", 3, 38.98, 1.99],
  ["2025-04-15", "ETZ", 4, 19.11, 1.99],
  ["2025-04-15", "PAEEM", 2, 20.69, 1.99],
  ["2025-05-15", "PE500", 3, 39.56, 1.99],
  ["2025-05-15", "ETZ", 4, 19, 1.99],
  ["2025-05-15", "PAEEM", 2, 21.2, 1.99],
  ["2025-06-15", "PE500", 3, 39.94, 1.99],
  ["2025-06-15", "ETZ", 4, 19, 1.99],
  ["2025-06-15", "PAEEM", 2, 21.69, 1.99],
  ["2025-07-15", "PE500", 3, 40.1, 1.99],
  ["2025-07-15", "ETZ", 4, 19.13, 1.99],
  ["2025-07-15", "PAEEM", 2, 21.96, 1.99],
  ["2025-08-15", "PE500", 3, 40.1, 1.99],
  ["2025-08-15", "ETZ", 4, 19.37, 1.99],
  ["2025-08-15", "PAEEM", 2, 21.91, 1.99],
  ["2025-09-15", "PE500", 3, 40.01, 1.99],
  ["2025-09-15", "ETZ", 4, 19.66, 1.99],
  ["2025-09-15", "PAEEM", 2, 21.59, 1.99],
  ["2025-10-15", "PE500", 3, 39.94, 1.99],
  ["2025-10-15", "ETZ", 4, 19.93, 1.99],
  ["2025-10-15", "PAEEM", 2, 21.15, 1.99],
  ["2025-11-15", "PE500", 3, 39.99, 1.99],
  ["2025-11-15", "ETZ", 4, 20.11, 1.99],
  ["2025-11-15", "PAEEM", 2, 20.8, 1.99],
  ["2025-12-15", "PE500", 3, 40.23, 1.99],
  ["2025-12-15", "ETZ", 4, 20.15, 1.99],
  ["2025-12-15", "PAEEM", 2, 20.71, 1.99],
  ["2026-01-15", "PE500", 3, 40.71, 1.99],
  ["2026-01-15", "ETZ", 4, 20.07, 1.99],
  ["2026-01-15", "PAEEM", 2, 20.94, 1.99],
  ["2026-02-15", "PE500", 3, 41.41, 1.99],
  ["2026-02-15", "ETZ", 4, 19.92, 1.99],
  ["2026-02-15", "PAEEM", 2, 21.41, 1.99],
  ["2026-03-15", "PE500", 3, 42.26, 1.99],
  ["2026-03-15", "ETZ", 4, 19.77, 1.99],
  ["2026-03-15", "PAEEM", 2, 21.95, 1.99],
  ["2026-04-15", "PE500", 3, 43.16, 1.99],
  ["2026-04-15", "ETZ", 4, 19.69, 1.99],
  ["2026-04-15", "PAEEM", 2, 22.34, 1.99],
  ["2026-05-15", "PE500", 3, 44.01, 1.99],
  ["2026-05-15", "ETZ", 4, 19.73, 1.99],
  ["2026-05-15", "PAEEM", 2, 22.43, 1.99],
];

/** Onglet Par ETF : allocation cible et cours retenu (cours manuel, col. F). */
export const ETF_EXEMPLE = [
  { ticker: "PE500", nom: "Amundi PEA S&P 500 Screened", cible: 0.5, cours: 44.23 },
  { ticker: "ETZ", nom: "BNP Paribas Easy STOXX Europe 600", cible: 0.3, cours: 19.83 },
  { ticker: "PAEEM", nom: "Amundi PEA Emergent ESG Transition", cible: 0.2, cours: 22.54 },
] as const;

/** Onglet PEA : date d'ouverture saisie dans l'exemple. */
export const OUVERTURE_PEA_EXEMPLE = "2024-01-15";
/** Plafond légal des versements d'un PEA (CMF L. 221-30). */
export const PLAFOND_PEA = 150_000;
/** Date à laquelle les captures ont été prises (TRI et compteurs en dépendent). */
export const DATE_CAPTURES = "2026-10-01";

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
