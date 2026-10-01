// Liste vérifiée des ETF éligibles au PEA — données de /etf-eligibles-pea.
//
// ─── Une seule source de vérité ─────────────────────────────────────────────
//
// Tout vient de la table de vérité ETF du 28/09/2026 : chaque fonds vérifié
// sur les documents de son émetteur (page produit, DIC, reporting mensuel),
// puis recoupé sur justETF, Boursorama et Euronext.
//
// Les fonds du catalogue sont LUS dans ETF_LIST (etf-config.ts), jamais
// recopiés : le jour où un TER y est corrigé, la liste suit. Seuls les fonds
// vérifiés ABSENTS du catalogue sont décrits ici (HORS_CATALOGUE). Ils ne sont
// pas ajoutés à ETF_LIST : chaque entrée du catalogue crée une fiche
// /etf/<mnémonique>, une URL de sitemap et un appel de cours chez le
// fournisseur de données — pour des fonds dont on n'a rédigé aucune fiche.
//
// ─── Ce que ce module refuse ────────────────────────────────────────────────
//
// Une liste qui oublie un fonds, ou qui en affiche un deux fois, est fausse
// sans que rien ne le montre. Quatre cas font donc échouer le build, avec un
// message qui dit quoi corriger :
//   · un fonds de la page absent de la table de vérité (TABLE_DE_VERITE) :
//     la page dit « contrôlés un par un le 28 septembre 2026 », et c'est
//     faux pour un fonds qui n'y est pas ;
//   · un fonds éligible du catalogue sans groupe d'indice (FAMILLE) ;
//   · un fonds de HORS_CATALOGUE entré depuis dans ETF_LIST (doublon) ;
//   · un fonds de la liste « non éligibles » devenu éligible dans ETF_LIST,
//     ou une correspondance PEA qui désigne un fonds absent de la liste.

import { ETF_LIST, type ETFConfig } from "@/lib/etf-config";

/** Date de la vérification (table de vérité ETF), YYYY-MM-DD. */
export const DATE_VERIFICATION_PEA = "2026-09-28";

/**
 * Dernière révision du contenu de /etf-eligibles-pea, YYYY-MM-DD. Lue par la
 * byline ET par le sitemap : une seule date, pas deux qui divergent.
 */
export const MAJ_LISTE_PEA = "2026-09-30";

export const URL_LISTE_PEA = "/etf-eligibles-pea";

/**
 * « 2026-09-28 » → « 28 septembre 2026 » ; « 2026-10-01 » → « 1er octobre 2026 ».
 *
 * 01/10/2026 : toLocaleDateString("fr-FR") écrit « 1 octobre 2026 », alors
 * qu'en français le premier jour du mois s'écrit « 1er » (constat sur
 * /suivi-pea-excel : « au 1 octobre 2026 », « Capture du 1 octobre 2026 »,
 * quand products.ts écrit « Capture du 1er octobre 2026 » pour les mêmes
 * images). Corrigé ici plutôt que page par page : aucun des appels du site
 * n'ajoute lui-même « er » derrière la date (vérifié le 01/10/2026), et
 * typoRiche() met l'ordinal en exposant là où le texte passe par lui.
 * ⚠️ Un seul appel retouche le résultat : MOIS_VERIF d'etf-eligibles-pea
 * (title de la page) retire le jour avec /^\d+\s/, qui ne reconnaît pas
 * « 1er ». Sans effet tant que DATE_VERIFICATION_PEA n'est pas un 1er du mois
 * (28/09 au 01/10/2026) ; sinon, passer cette regex à /^\d+(?:er)?\s/.
 */
export function dateEnToutesLettres(iso: string): string {
  return new Date(`${iso}T00:00:00Z`)
    .toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    .replace(/^1(?=\s)/, "1er");
}

// ─── Périmètre ───────────────────────────────────────────────────────────────

// Les 24 lignes de la table de vérité du 28/09/2026 : les seuls fonds dont
// l'ISIN, les frais et l'éligibilité ont été recoupés sur les deux familles de
// sources. Aucun fonds n'entre dans la liste sans y figurer.
// SPY en a été retiré le 30/09/2026 : il n'est pas dans la table (commentaire
// de son entrée dans etf-config.ts, fait non-pea-us-sans-dic), et la page le
// comptait pourtant parmi les fonds « contrôlés un par un ». C3M y est, mais
// n'est pas un fonds d'actions : la liste ne le reprend pas.
const TABLE_DE_VERITE = new Set([
  "CW8", "WPEA", "DCAM", "EWLD", "GPEA", "PSP5", "PE500", "SPEA", "ESE", "PUST",
  "PAEEM", "PCEU", "RS2K", "500", "ANX", "AEEM", "JPNK", "IWDA", "VWCE", "CSPX",
  "VUSA", "CNDX", "QQQ", "C3M",
]);

/**
 * Le fonds figure-t-il dans la table de vérité ? Exporté le 30/09/2026 pour
 * les fiches /etf/[symbole] : elles n'écrivent « vérifié le 28 septembre
 * 2026 » que pour un fonds réellement contrôlé ce jour-là (pas SPY).
 */
export function estDansLaTable(symbole: string): boolean {
  return TABLE_DE_VERITE.has(symbole);
}

function dansLaTable(symbole: string): void {
  if (!TABLE_DE_VERITE.has(symbole)) {
    throw new Error(
      `etf-pea-verifies.ts : ${symbole} n'est pas dans la table de vérité du ${DATE_VERIFICATION_PEA}. ` +
        "La page le donnerait pour « contrôlé un par un » : vérifiez-le d'abord, ou retirez-le de la liste.",
    );
  }
}

// ─── Fonds ───────────────────────────────────────────────────────────────────

/** Ce que la page affiche d'un fonds, qu'il vienne du catalogue ou non. */
export interface FondsVerifie {
  displaySymbol: string;
  name: string;
  /** null seulement pour une entrée du catalogue sans ISIN : elle n'entre pas dans la liste. */
  isin: string | null;
  ter: number;
  replicationMethod: string;
  distributionPolicy: ETFConfig["distributionPolicy"];
  peaEligible: boolean;
  sansDicUE?: true;
  /** Vrai quand le fonds a une fiche /etf/<mnémonique>, donc qu'il est dans ETF_LIST. */
  aUneFiche: boolean;
}

/** Un fonds de la liste : dans la table de vérité, donc avec son ISIN. */
interface FondsDeLaListe extends FondsVerifie {
  isin: string;
}

/** Contrôle d'entrée dans la liste : table de vérité, ISIN présent. */
function deLaListe(f: FondsVerifie): FondsDeLaListe {
  dansLaTable(f.displaySymbol);
  if (!f.isin) {
    throw new Error(`etf-pea-verifies.ts : ${f.displaySymbol} n'a pas d'ISIN. C'est lui qui fait foi : ajoutez-le.`);
  }
  return { ...f, isin: f.isin };
}

type FondsHorsCatalogue = Omit<FondsVerifie, "aUneFiche" | "isin"> & { isin: string };

// Vérifiés le 28/09/2026, absents du catalogue. Nom, ISIN, TER, éligibilité
// et distribution d'après la table de vérité ; la réplication, que la table
// ne donne pas toujours, d'après le nom officiel (« Swap ») ou justETF
// (faits etf-pea-ewld, -gpea, -pe500, -spea, -ese, non-pea-nasdaq).
// CNDX n'est pas éligible : il est ici pour la liste des « faux amis ».
const HORS_CATALOGUE: FondsHorsCatalogue[] = [
  {
    displaySymbol: "EWLD",
    name: "Amundi MSCI World Swap UCITS ETF EUR Dist",
    isin: "LU2655993207",
    ter: 0.38,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Distribuant",
    peaEligible: true,
  },
  {
    displaySymbol: "GPEA",
    name: "Amundi PEA Global (MSCI ACWI) UCITS ETF Acc",
    isin: "FR0014017NX3",
    ter: 0.3,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    peaEligible: true,
  },
  {
    displaySymbol: "PE500",
    name: "Amundi PEA S&P 500 Screened UCITS ETF Acc",
    isin: "FR0013412285",
    ter: 0.25,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    peaEligible: true,
  },
  {
    displaySymbol: "SPEA",
    name: "iShares S&P 500 Swap PEA UCITS ETF EUR (Acc)",
    isin: "IE000DQLYVB9",
    ter: 0.1,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    peaEligible: true,
  },
  {
    displaySymbol: "ESE",
    name: "BNP Paribas Easy S&P 500 UCITS ETF EUR C",
    isin: "FR0011550185",
    ter: 0.14,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    peaEligible: true,
  },
  {
    displaySymbol: "CNDX",
    name: "iShares NASDAQ 100 UCITS ETF USD (Acc)",
    isin: "IE00B53SZB19",
    ter: 0.3,
    replicationMethod: "Physique",
    distributionPolicy: "Capitalisant",
    peaEligible: false,
  },
];

for (const f of HORS_CATALOGUE) {
  if (ETF_LIST.some((e) => e.displaySymbol === f.displaySymbol)) {
    throw new Error(
      `etf-pea-verifies.ts : ${f.displaySymbol} est désormais dans ETF_LIST. ` +
        "Retirez-le de HORS_CATALOGUE : la liste doit le lire dans le catalogue, pas en garder une copie.",
    );
  }
}

function depuisCatalogue(e: ETFConfig): FondsVerifie {
  return {
    displaySymbol: e.displaySymbol,
    name: e.name,
    isin: e.isin ?? null,
    ter: e.ter,
    replicationMethod: e.replicationMethod,
    distributionPolicy: e.distributionPolicy,
    peaEligible: e.peaEligible,
    sansDicUE: e.sansDicUE,
    aUneFiche: true,
  };
}

const TOUS: FondsVerifie[] = [
  ...ETF_LIST.map(depuisCatalogue),
  ...HORS_CATALOGUE.map((f) => ({ ...f, aUneFiche: false })),
];

function trouver(symbole: string): FondsVerifie {
  const f = TOUS.find((x) => x.displaySymbol === symbole);
  if (!f) {
    throw new Error(
      `etf-pea-verifies.ts : ${symbole} n'est ni dans ETF_LIST ni dans HORS_CATALOGUE.`,
    );
  }
  return f;
}

// ─── Éligibles, groupés par indice ───────────────────────────────────────────

export type FamilleIndice =
  | "msci-world"
  | "msci-acwi"
  | "sp500"
  | "nasdaq-100"
  | "emergents"
  | "europe"
  | "russell-2000";

/**
 * Groupes du tableau, dans l'ordre d'affichage. `id` sert d'ancre
 * (/etf-eligibles-pea#sp500). Descriptions : faits msci-world-composition,
 * etf-pea-gpea, etf-pea-pceu, etf-pea-rs2k, et définitions déjà vérifiées
 * d'etf-config.ts.
 */
export const FAMILLES: { id: FamilleIndice; titre: string; description: string }[] = [
  {
    id: "msci-world",
    titre: "MSCI World",
    description:
      "Environ 1\u00a0300 grandes et moyennes entreprises de 23 pays développés. Aucun pays émergent.",
  },
  {
    id: "msci-acwi",
    titre: "MSCI ACWI",
    description: "Le monde entier\u00a0: pays développés et pays émergents dans le même indice.",
  },
  {
    id: "sp500",
    titre: "S&P 500",
    description: "500 grandes entreprises américaines.",
  },
  {
    id: "nasdaq-100",
    titre: "Nasdaq-100",
    description:
      "Les 100 plus grandes sociétés non financières cotées au Nasdaq, très orientées technologie.",
  },
  {
    id: "emergents",
    titre: "Marchés émergents",
    description: "Chine, Inde, Taïwan, Corée du Sud, Brésil…",
  },
  {
    id: "europe",
    titre: "Europe",
    description: "Grandes et moyennes entreprises des pays développés européens (indice MSCI Europe).",
  },
  {
    id: "russell-2000",
    titre: "Russell 2000",
    description: "Environ 2\u00a0000 petites entreprises américaines.",
  },
];

// Groupe de chaque fonds éligible. Choix éditorial explicite plutôt que
// déduit de `indexLabel` : PE500 suit une version filtrée du S&P 500 et reste
// rangé avec lui, précision à l'appui ; un libellé retouché dans le catalogue
// ne doit pas faire changer un fonds de groupe en silence.
const FAMILLE: Record<string, FamilleIndice> = {
  CW8: "msci-world",
  WPEA: "msci-world",
  DCAM: "msci-world",
  EWLD: "msci-world",
  GPEA: "msci-acwi",
  PSP5: "sp500",
  SPEA: "sp500",
  ESE: "sp500",
  PE500: "sp500",
  PUST: "nasdaq-100",
  PAEEM: "emergents",
  PCEU: "europe",
  RS2K: "russell-2000",
};

// Ce que la ligne du tableau doit dire en plus des colonnes (remarques de la
// table de vérité, faits etf-pea-*). Pas de prix de part, pas d'encours : la
// table et justETF ne donnent pas les mêmes montants (fait encours-a-trancher).
const PRECISIONS: Record<string, string> = {
  WPEA: "Lancé le 26 mars 2024.",
  DCAM: "Lancé le 4 mars 2025.",
  EWLD: "Part distribuante du même fonds que CW8.",
  GPEA: "Fonds créé le 6 juillet 2026\u00a0: presque aucun historique.",
  SPEA: "Lancé le 29 mai 2025.",
  ESE: "Émetteur\u00a0: BNP Paribas Asset Management (gamme BNP Paribas Easy), pas Amundi.",
  PE500:
    "Suit une version du S&P 500 filtrée sur des critères ESG (environnementaux, sociaux et de gouvernance), pas l'indice classique. Ancien nom\u00a0: Amundi PEA S&P 500 ESG.",
  PUST: "D'autres lignes Nasdaq-100 éligibles au PEA existent, PNAS par exemple\u00a0: nous ne les avons pas vérifiées.",
  PAEEM:
    "Suit une variante «\u00a0ESG Transition\u00a0» de l'indice MSCI Emerging Markets, pas l'indice standard.",
};

export interface EtfEligiblePea extends FondsDeLaListe {
  famille: FamilleIndice;
  precision?: string;
}

/** Les ETF éligibles au PEA vérifiés le 28/09/2026 : catalogue d'abord, puis hors catalogue. */
export const ETF_PEA_VERIFIES: EtfEligiblePea[] = TOUS.filter((f) => f.peaEligible).map((f) => {
  const famille = FAMILLE[f.displaySymbol];
  if (!famille) {
    throw new Error(
      `etf-pea-verifies.ts : ${f.displaySymbol} est éligible au PEA mais n'a pas de groupe d'indice. ` +
        "Ajoutez-le à FAMILLE : sans groupe, il disparaîtrait de /etf-eligibles-pea.",
    );
  }
  return { ...deLaListe(f), famille, precision: PRECISIONS[f.displaySymbol] };
});

// ─── Non éligibles : les « faux amis » ───────────────────────────────────────

export type CorrespondanceId = "sp500" | "nasdaq-100" | "emergents" | "monde" | "japon";

/**
 * Règle 4 de la table de vérité du 28/09/2026 : quand un ETF n'est pas
 * éligible, nommer l'équivalent PEA vérifié s'il existe. C'est une
 * correspondance d'INDICE, pas une recommandation. L'ordre est celui de la
 * règle. Europe → PCEU n'y figure pas : aucun fonds Europe dans la liste des
 * non éligibles. Japon : aucun équivalent vérifié — ne pas en inventer.
 */
export const CORRESPONDANCES_PEA: Record<
  CorrespondanceId,
  { /** Avec son article : « Pour le S&P 500 dans un PEA ». */ libelle: string; symboles: string[]; nuance?: string }
> = {
  sp500: { libelle: "le S&P 500", symboles: ["PSP5", "SPEA", "ESE"] },
  "nasdaq-100": { libelle: "le Nasdaq-100", symboles: ["PUST"] },
  emergents: {
    libelle: "les marchés émergents",
    symboles: ["PAEEM"],
    nuance:
      "PAEEM suit une variante «\u00a0ESG Transition\u00a0» de l'indice émergents, pas l'indice standard\u00a0: la correspondance est approchée.",
  },
  monde: { libelle: "le MSCI World", symboles: ["WPEA", "DCAM", "CW8"] },
  japon: { libelle: "le Japon", symboles: [] },
};

/**
 * Pourquoi le fonds n'est pas éligible. Donné fonds par fonds, pas déduit de
 * `replicationMethod` : la table ne confirme pas la réplication de JPNK, et
 * « swap mais non éligible » n'est établi que pour 500, ANX et AEEM (reporting
 * Amundi du 31/08/2026, fait swap-non-eligible).
 */
export type RaisonHorsPea = "swap-hors-pea" | "physique" | "sans-dic" | "non-eligible";

export interface EtfNonEligible extends FondsDeLaListe {
  raison: RaisonHorsPea;
  correspondance: CorrespondanceId;
  precision?: string;
  /**
   * Présenté comme éligible au PEA sur ce site jusqu'au 28/09/2026 : 500,
   * ANX, AEEM et JPNK dans le catalogue (commentaires d'etf-config.ts), IWDA
   * dans la liste « ETF éligibles PEA » de /pea-ou-cto (commentaire de la
   * page). L'écrire sur la page est la moindre des choses.
   */
  presenteEligibleParLeSite?: true;
}

const LISTE_NON_ELIGIBLES: {
  symbole: string;
  raison: RaisonHorsPea;
  correspondance: CorrespondanceId;
  precision?: string;
  presenteEligibleParLeSite?: true;
}[] = [
  { symbole: "500", raison: "swap-hors-pea", correspondance: "sp500", presenteEligibleParLeSite: true },
  { symbole: "ANX", raison: "swap-hors-pea", correspondance: "nasdaq-100", presenteEligibleParLeSite: true },
  {
    symbole: "AEEM",
    raison: "swap-hors-pea",
    correspondance: "emergents",
    // Fait non-pea-emergents : jusqu'au 28/09/2026, /etf/PAEEM redirigeait
    // vers la fiche AEEM (next.config.ts).
    precision: "Ce n'est pas l'ancien PAEEM\u00a0: ce sont deux fonds différents.",
    presenteEligibleParLeSite: true,
  },
  {
    symbole: "JPNK",
    raison: "non-eligible",
    correspondance: "japon",
    precision: "Il suit le JPX-Nikkei 400, pas le TOPIX.",
    presenteEligibleParLeSite: true,
  },
  {
    symbole: "IWDA",
    raison: "physique",
    correspondance: "monde",
    // Jusqu'au 28/09/2026, /etf/EWLD redirigeait vers la fiche IWDA
    // (next.config.ts) : le site traitait les deux comme un même fonds.
    precision: "Ce n'est pas le même fonds qu'EWLD, un fonds Amundi éligible au PEA.",
    presenteEligibleParLeSite: true,
  },
  {
    symbole: "VWCE",
    raison: "physique",
    correspondance: "monde",
    // Fait non-pea-monde : FTSE All-World ≠ MSCI ACWI, GPEA n'est qu'un
    // équivalent approché.
    precision:
      "Il suit le FTSE All-World, qui couvre aussi les pays émergents\u00a0: le MSCI World, limité aux pays développés, n'en est qu'une correspondance partielle. En PEA, GPEA (MSCI ACWI, développés et émergents) s'en approche sans suivre le même indice, et n'existe que depuis le 6 juillet 2026.",
  },
  { symbole: "CSPX", raison: "physique", correspondance: "sp500" },
  { symbole: "VUSA", raison: "physique", correspondance: "sp500" },
  { symbole: "CNDX", raison: "physique", correspondance: "nasdaq-100" },
  { symbole: "QQQ", raison: "sans-dic", correspondance: "nasdaq-100" },
];

export const ETF_NON_ELIGIBLES: EtfNonEligible[] = LISTE_NON_ELIGIBLES.map((n) => {
  const f = trouver(n.symbole);
  if (f.peaEligible) {
    throw new Error(
      `etf-pea-verifies.ts : ${n.symbole} est éligible au PEA dans le catalogue mais listé parmi les non éligibles. ` +
        "L'un des deux est faux : vérifiez avant de publier.",
    );
  }
  if (n.raison === "sans-dic" && !f.sansDicUE) {
    throw new Error(`etf-pea-verifies.ts : ${n.symbole} est classé « sans DIC » mais n'a pas sansDicUE.`);
  }
  if (n.raison === "physique" && !f.replicationMethod.startsWith("Physique")) {
    throw new Error(`etf-pea-verifies.ts : ${n.symbole} est classé « physique » mais sa réplication est « ${f.replicationMethod} ».`);
  }
  return {
    ...deLaListe(f),
    raison: n.raison,
    correspondance: n.correspondance,
    precision: n.precision,
    presenteEligibleParLeSite: n.presenteEligibleParLeSite,
  };
});

for (const { symboles } of Object.values(CORRESPONDANCES_PEA)) {
  for (const s of symboles) {
    if (!ETF_PEA_VERIFIES.some((f) => f.displaySymbol === s)) {
      throw new Error(
        `etf-pea-verifies.ts : la correspondance PEA ${s} n'est pas dans la liste des éligibles vérifiés.`,
      );
    }
  }
}

// ─── Ancres ──────────────────────────────────────────────────────────────────

/** Ancre de la ligne d'un fonds éligible dans le tableau (#fonds-psp5). */
export const ancreFonds = (symbole: string) => `fonds-${symbole.toLowerCase()}`;

/** Ancre de la carte d'un fonds non éligible (#hors-pea-500). */
export const ancreHorsPea = (symbole: string) => `hors-pea-${symbole.toLowerCase()}`;

/**
 * Lien vers l'endroit de la liste qui parle d'un fonds : son groupe d'indice
 * s'il est éligible, sa carte s'il est parmi les non éligibles. null s'il n'y
 * figure pas (C3M, quasi monétaire ; SPY, hors de la table de vérité) : un
 * lien vers une page qui ne parle pas du fonds ne répond à rien.
 */
export function lienListePea(symbole: string): string | null {
  const eligible = ETF_PEA_VERIFIES.find((f) => f.displaySymbol === symbole);
  if (eligible) return `${URL_LISTE_PEA}#${eligible.famille}`;
  if (ETF_NON_ELIGIBLES.some((f) => f.displaySymbol === symbole)) {
    return `${URL_LISTE_PEA}#${ancreHorsPea(symbole)}`;
  }
  return null;
}
