// Fiches à citer et taille des ETF, fonds par fonds — ajouté le 30/09/2026.
//
// ─── Pourquoi ce module ─────────────────────────────────────────────────────
//
// Relevé du 29/09/2026 (30 questions posées à ChatGPT, au mode IA de Google
// et à Copilot) : les pages que les assistants citent donnent des chiffres
// datés et sourcés, avec un lien vers l'émetteur. Les nôtres écrivaient
// « vérifié » sans jamais montrer où. Ce module réunit les adresses qu'on peut
// citer pour chaque fonds, et seulement celles-là.
//
// ─── D'où viennent les adresses (règle : aucune adresse devinée) ───────────
//
// Seulement des adresses écrites en toutes lettres dans les fichiers de faits
// (faits.json, faits-etf.jsonl) :
// · Fiche de l'émetteur : PUST seulement (fait etf-pea-pust). Les pages
//   produit d'Amundi et d'iShares se rendent en JavaScript : on ne fabrique
//   pas une adresse sur un modèle.
// · Fiche justETF : l'adresse exacte que citent les faits etf-pea-*,
//   non-pea-monde et encours-a-trancher, source de recoupement de la table de
//   vérité du 28/09/2026. Écrite en toutes lettres, pas construite sur
//   l'ISIN : un fonds absent des faits (IWDA, CSPX, VUSA…) n'a pas de lien
//   plutôt qu'un lien supposé.
// 30/09/2026 : WPEA, SPEA (fiches BlackRock) et VWCE (DIC Vanguard) pointaient
// vers des adresses reprises d'autres pages du site, absentes des fichiers de
// faits. Elles pointent désormais vers leur fiche justETF, qui y figure.

export interface FicheCitee {
  /** Ce que le lien ouvre, tel qu'on l'affiche : « fiche iShares (BlackRock) ». */
  libelle: string;
  url: string;
}

const justEtf = (url: string): FicheCitee => ({ libelle: "fiche justETF", url });

/**
 * La meilleure fiche à citer pour un fonds : celle de l'émetteur si son
 * adresse est connue, sinon celle de justETF. Clé : le mnémonique affiché.
 */
export const FICHE_ETF: Record<string, FicheCitee> = {
  // 30/09/2026 : l'adresse du fait etf-pea-pust (…/particuliers/products/…)
  // répond 404 ; la bonne est …/particuliers/produits/… (200, <title> et
  // description au nom de PUST, FR0011871110). À corriger aussi dans le fait.
  PUST: {
    libelle: "fiche Amundi ETF",
    url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-pea-nasdaq100-ucits-etf-acc/fr0011871110",
  },
  WPEA: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=IE0002XZSHO1"),
  SPEA: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=IE000DQLYVB9"),
  VWCE: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=IE00BK5BQT80"),
  CW8: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=LU1681043599"),
  DCAM: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=FR001400U5Q4"),
  EWLD: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=LU2655993207"),
  GPEA: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=FR0014017NX3"),
  PSP5: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=FR0011871128"),
  ESE: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=FR0011550185"),
  PE500: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=FR0013412285"),
  PAEEM: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=FR0013412020"),
  PCEU: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=FR0013412038"),
  RS2K: justEtf("https://www.justetf.com/fr/etf-profile.html?isin=LU1681038672"),
};

/**
 * Fiche MSCI World — faits msci-world-composition et msci-world-poids-pays.
 * 30/09/2026 : l'adresse est un lien permanent que MSCI remplace chaque mois
 * (fiche au 31/08/2026 le 30/09). Le libellé ne date donc pas le document ;
 * ce sont les chiffres cités qui portent leur date (« au 31 août 2026 »).
 */
export const FICHE_MSCI_WORLD: FicheCitee = {
  libelle: "fiche de l'indice MSCI World (MSCI, mise à jour chaque mois)",
  url: "https://www.msci.com/documents/10199/255599/msci-world-index.pdf",
};

// ─── Encours et prix de part ────────────────────────────────────────────────
//
// Seulement pour WPEA et DCAM. Pour les autres fonds, rien — une case vide
// vaut mieux qu'un chiffre repris d'on ne sait où (CW8 est donné à 3,5, 5,8 ou
// 6,4 Md€ selon les sites cités par les assistants).
//
// Encours : UNE source publique, citée, datée et liée — justETF, relevé le
// 28/09/2026 (fait encours-a-trancher : 2 214 M€ pour WPEA, 1 516 M€ pour
// DCAM), arrondi. Revu le 30/09/2026 : la fourchette « 2,1 à 2,2 Md€ » du
// matin mêlait ce chiffre à celui de la table de vérité (≈ 2,1 et ≈ 1,4 Md€),
// dont l'origine n'est pas documentée et que le lecteur ne peut pas consulter
// (fait en confiance « a-verifier »). Relu le 30/09/2026 sur justETF : 2 219
// et 1 532 M€, l'arrondi tient. Part ou fonds entier : l'écart entre les
// sources n'est pas tranché, la page ne prétend donc pas le savoir.
//
// Prix de part : jamais au centime, il se périme (règle 2 de la table). Un
// ordre de grandeur daté : ≈ 7 € et ≈ 6 € au 28/09/2026 (table de vérité).

export interface TailleEtf {
  /** « environ 2,2 milliards d'euros » */
  encours: string;
  /** « au 28 septembre 2026 selon justETF » : la date ET la source. */
  encoursAu: string;
  /** « environ 7 € » */
  prixPart: string;
  /** « 28 septembre 2026 » */
  prixAu: string;
}

export const TAILLE_ETF: Record<string, TailleEtf> = {
  WPEA: {
    encours: "environ 2,2\u00a0milliards d'euros",
    encoursAu: "au 28 septembre 2026 selon justETF",
    prixPart: "environ 7\u00a0€",
    prixAu: "28 septembre 2026",
  },
  DCAM: {
    encours: "environ 1,5\u00a0milliard d'euros",
    encoursAu: "au 28 septembre 2026 selon justETF",
    prixPart: "environ 6\u00a0€",
    prixAu: "28 septembre 2026",
  },
};

/**
 * Dernière révision du contenu des fiches /etf/[symbole] (réponse d'ouverture,
 * FAQ, Article JSON-LD — 30/09/2026). Lue par la byline des fiches ET par le
 * sitemap : une seule date, pas deux qui divergent.
 */
export const FICHES_ETF_MAJ_LE = "2026-09-30";

/**
 * D'où vient l'encours, en une phrase, pour les notes sous tableau.
 * 30/09/2026 : ne cite plus « notre table de vérité », document interne que
 * le lecteur ne peut ni ouvrir ni vérifier.
 */
export const SOURCE_ENCOURS =
  "Encours\u00a0: montants publiés par justETF, relevés le 28 septembre 2026 et arrondis\u00a0; " +
  "d'autres sources donnent des montants un peu différents.";
