// Liste complète des ETF éligibles au PEA — contrôles et données dérivées.
//
// Les lignes sont dans donnees.ts (relevé du 14/10/2026). Ce module refuse de
// construire le site quand la liste se contredit, ou contredit le reste du
// site, avec un message qui dit quoi corriger :
//   · une date de mise en ligne dans le futur (MISE_EN_LIGNE_LISTE_PEA) ;
//   · un ISIN dont la clé de contrôle est fausse, un ISIN ou un mnémonique
//     présent deux fois ;
//   · un décompte (DECOMPTE_RELEVE) qui ne correspond plus aux lignes ;
//   · un des fonds de la table de vérité (etf-pea-verifies.ts) absent de la
//     liste, ou avec un autre ISIN, d'autres frais, un autre nom, un autre
//     groupe, une autre mention « C/D » : deux pages du site ne doivent pas
//     se contredire sur un ISIN ;
//   · un fonds de la liste « non éligibles » qui y figurerait ;
//   · une ligne à effet de levier hors du groupe « levier », ou l'inverse.

import { ETF_LIST } from "@/lib/etf-config";
import { ETF_NON_ELIGIBLES, ETF_PEA_VERIFIES } from "@/lib/etf-pea-verifies";
import {
  CATEGORIES,
  DATE_RELEVE_LISTE_PEA,
  DECOMPTE_RELEVE,
  LIGNES_PEA,
  type CategorieId,
  type LignePea,
} from "./donnees";
import { MISE_EN_LIGNE_LISTE_PEA } from "./mise-en-ligne";

export * from "./donnees";
export { MISE_EN_LIGNE_LISTE_PEA };

const erreur = (message: string): never => {
  throw new Error(`liste-pea : ${message}`);
};

// ─── Date de mise en ligne ───────────────────────────────────────────────────
// Une build de production avant MISE_EN_LIGNE_LISTE_PEA publierait la liste
// trop tôt, avec une date de mise à jour (byline, JSON-LD, sitemap, journal)
// dans le futur. Même mécanisme que les fiches ETF v2.
const AUJOURDHUI = new Date().toISOString().slice(0, 10);
if (MISE_EN_LIGNE_LISTE_PEA > AUJOURDHUI && process.env.LISTE_PEA_APERCU !== "1") {
  erreur(
    `mise en ligne prévue le ${MISE_EN_LIGNE_LISTE_PEA} (mise-en-ligne.ts), nous sommes le ${AUJOURDHUI}. ` +
      "Pour un aperçu local : LISTE_PEA_APERCU=1. Pour déployer : mettre MISE_EN_LIGNE_LISTE_PEA à la date du jour.",
  );
}
if (MISE_EN_LIGNE_LISTE_PEA < DATE_RELEVE_LISTE_PEA) {
  erreur(`la mise en ligne (${MISE_EN_LIGNE_LISTE_PEA}) précède le relevé (${DATE_RELEVE_LISTE_PEA}).`);
}

// ─── Intégrité des lignes ────────────────────────────────────────────────────

/** Clé de contrôle ISIN (ISO 6166) : lettres → 10..35, puis algorithme de Luhn. */
export function isinValide(isin: string): boolean {
  if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) return false;
  const chiffres = isin
    .split("")
    .map((c) => (/\d/.test(c) ? c : String(c.charCodeAt(0) - 55)))
    .join("");
  let somme = 0;
  for (let i = 0; i < chiffres.length; i++) {
    let n = Number(chiffres[chiffres.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    somme += n;
  }
  return somme % 10 === 0;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const idsCategories = new Set(CATEGORIES.map((c) => c.id));
const tickers = new Set<string>();
const isins = new Set<string>();
for (const l of LIGNES_PEA) {
  if (!isinValide(l.isin)) erreur(`${l.ticker} : clé de contrôle de l'ISIN ${l.isin} fausse.`);
  if (tickers.has(l.ticker)) erreur(`${l.ticker} figure deux fois.`);
  if (isins.has(l.isin)) erreur(`l'ISIN ${l.isin} figure deux fois.`);
  tickers.add(l.ticker);
  isins.add(l.isin);
  if (!idsCategories.has(l.categorie)) erreur(`${l.ticker} : catégorie « ${l.categorie} » inconnue.`);
  if (!(l.frais > 0 && l.frais < 2)) erreur(`${l.ticker} : frais ${l.frais} hors de toute plage plausible.`);
  for (const [nom, d] of [["coteeDepuis", l.coteeDepuis], ["premiereVl", l.premiereVl]] as const) {
    if (d !== null && (!DATE.test(d) || d > DATE_RELEVE_LISTE_PEA)) erreur(`${l.ticker} : ${nom} « ${d} » invalide.`);
  }
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(l.preuve.date) || l.preuve.date > DATE_RELEVE_LISTE_PEA) {
    erreur(`${l.ticker} : date de preuve « ${l.preuve.date} » invalide.`);
  }
  if (!/^https:\/\//.test(l.preuve.url)) erreur(`${l.ticker} : la preuve n'a pas d'adresse.`);
  if (l.recoupe.length === 0) erreur(`${l.ticker} : aucun recoupement indépendant de l'émetteur.`);
  if ((l.categorie === "levier") !== Boolean(l.levier)) {
    erreur(`${l.ticker} : effet de levier et groupe « levier » doivent aller ensemble.`);
  }
  if (l.devise === "USD" && !l.equivalentEuros) erreur(`${l.ticker} : ligne en dollars sans sa ligne en euros.`);
}
for (const l of LIGNES_PEA) {
  if (l.equivalentEuros) {
    const eur = LIGNES_PEA.find((x) => x.ticker === l.equivalentEuros);
    if (!eur || eur.devise !== "EUR") erreur(`${l.ticker} : ligne en euros ${l.equivalentEuros} introuvable.`);
  }
}

/** « Avec réserve » : une réserve écrite, ou un effet de levier (sa mention de risque). */
export const avecReserve = (l: LignePea) => Boolean(l.reserve || l.levier);

if (LIGNES_PEA.length !== DECOMPTE_RELEVE.publiees) {
  erreur(`${LIGNES_PEA.length} lignes, le décompte du relevé en annonce ${DECOMPTE_RELEVE.publiees}.`);
}
const nAvecReserve = LIGNES_PEA.filter(avecReserve).length;
if (nAvecReserve !== DECOMPTE_RELEVE.avecReserve) {
  erreur(`${nAvecReserve} lignes avec réserve, le décompte du relevé en annonce ${DECOMPTE_RELEVE.avecReserve}.`);
}

// ─── Cohérence avec le reste du site ─────────────────────────────────────────
// Les 14 fonds de la table de vérité (etf-pea-verifies.ts) sont lus par les
// fiches, les comparatifs et le guide débutants : la liste complète doit dire
// la même chose qu'eux, et les ranger dans le même groupe (lienListePea()
// renvoie vers /etf-eligibles-pea#<groupe>).
for (const f of ETF_PEA_VERIFIES) {
  const l = LIGNES_PEA.find((x) => x.ticker === f.displaySymbol);
  if (!l) erreur(`${f.displaySymbol}, fonds vérifié éligible, manque à la liste complète.`);
  else {
    if (l.isin !== f.isin) erreur(`${f.displaySymbol} : ISIN ${l.isin} dans la liste, ${f.isin} ailleurs sur le site.`);
    if (l.frais !== f.ter) erreur(`${f.displaySymbol} : frais ${l.frais} dans la liste, ${f.ter} ailleurs sur le site.`);
    if (l.nom !== f.name) erreur(`${f.displaySymbol} : nom « ${l.nom} » dans la liste, « ${f.name} » ailleurs sur le site.`);
    if (Boolean(l.partCD) !== Boolean(f.partCD)) {
      erreur(`${f.displaySymbol} : part « C/D » ${l.partCD ? "dans la liste seulement" : "ailleurs sur le site seulement"} (PARTS_C_D).`);
    }
    if (l.categorie !== f.famille) {
      erreur(`${f.displaySymbol} : groupe « ${l.categorie} » dans la liste, « ${f.famille} » pour lienListePea().`);
    }
  }
}
for (const f of ETF_NON_ELIGIBLES) {
  if (isins.has(f.isin)) erreur(`${f.displaySymbol} est listé non éligible et figure pourtant dans la liste complète.`);
}

// ─── Données dérivées ────────────────────────────────────────────────────────

/** Mnémoniques qui ont une fiche /etf/<mnémonique>. */
export const A_UNE_FICHE: ReadonlySet<string> = new Set(ETF_LIST.map((e) => e.displaySymbol));

/** Ordre alphabétique des mnémoniques : un classement par frais se lirait comme une recommandation. */
const parTicker = (a: LignePea, b: LignePea) => a.ticker.localeCompare(b.ticker, "fr");

export interface GroupeListe {
  id: CategorieId;
  titre: string;
  description: string;
  lignes: LignePea[];
}

export const GROUPES_LISTE: GroupeListe[] = CATEGORIES.map((c) => ({
  ...c,
  lignes: LIGNES_PEA.filter((l) => l.categorie === c.id).sort(parTicker),
}));
for (const g of GROUPES_LISTE) if (g.lignes.length === 0) erreur(`le groupe « ${g.id} » est vide.`);

/** Émetteurs, du plus représenté au moins représenté (filtre de la page). */
export const EMETTEURS_LISTE: { nom: string; n: number }[] = Object.entries(
  LIGNES_PEA.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.emetteur]: (acc[l.emetteur] ?? 0) + 1 }), {}),
)
  .map(([nom, n]) => ({ nom, n }))
  .sort((a, b) => b.n - a.n || a.nom.localeCompare(b.nom, "fr"));

/** Ancre de la ligne d'un fonds (#fonds-psp5) : la même que celle de la liste du 28/09/2026. */
export const ancreLigne = (ticker: string) => `fonds-${ticker.toLowerCase()}`;
