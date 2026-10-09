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
// · Reporting de l'émetteur : 500, ANX et AEEM (fait swap-non-eligible,
//   30/09/2026), la version pour professionnels, datée : c'est la seule qui
//   porte la ligne « Enveloppe fiscale » que la fiche cite comme preuve.
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
  // 30/09/2026 : le document que cite la phrase de statut de ces trois fiches
  // (« Enveloppe fiscale : - »). La version pour particuliers
  // (…/RETAIL/…) n'a pas cette ligne : un lecteur qui l'ouvrait ne trouvait
  // pas la preuve. Adresses datées : le document ne change pas le mois suivant.
  "500": {
    libelle: "reporting Amundi du 31 août 2026 (version pour professionnels)",
    url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681048804/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
  },
  ANX: {
    libelle: "reporting Amundi du 31 août 2026 (version pour professionnels)",
    url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681038243/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
  },
  AEEM: {
    libelle: "reporting Amundi du 31 août 2026 (version pour professionnels)",
    url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681045370/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
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

// ─── Comparatifs cw8-vs-dcam et gpea-vs-dcam (09/10/2026) ───────────────────
//
// Fichier de faits : private-assets/raw/geo/faits-cw8-dcam-gpea-2026-10-09.json
// (relevé le 09/10/2026 ; famille 1 = Amundi, famille 2 = justETF et
// Boursorama). Rien ci-dessous ne modifie TAILLE_ETF ni FICHE_ETF : les huit
// comparatifs existants (dont wpea-vs-dcam, sous surveillance) gardent leurs
// sources et leurs chiffres du 28/09/2026.
//
// Pourquoi une source différente de TAILLE_ETF : dans un duel, les deux
// fonds prennent la MÊME source (Amundi) à la MÊME date (08/10/2026), plutôt
// que deux sources dans la même phrase. Encours = celui de la PART : pour
// CW8, Amundi publie aussi l'encours du compartiment entier (« encours sous
// gestion du fonds », 7 342,61 M€ au 08/10/2026), qui inclut sa part
// distribuante EWLD ; la part CW8 seule pèse 6 808,90 M€ (champ AUM de l'API
// amundietf.fr), ce que recoupe justETF (« 6 850 M d'EUR », encours de la
// part). DCAM et GPEA n'ont qu'une part : encours du fonds = encours de la part.

/** Encours et prix de part publiés par l'émetteur, à une date donnée. */
export interface TailleEmetteur {
  /** Encours de la part, en millions d'euros, tel que publié. */
  encoursMEur: number;
  /** Valeur liquidative d'une part, en euros, à la même date. */
  vlEur: number;
  /** Date ISO de la donnée. */
  au: string;
  /** « Amundi » */
  source: string;
}

/**
 * Amundi, données au 08/10/2026 (pages amundietf.fr et leur API, relevées le
 * 09/10/2026). GPEA n'a encore aucun reporting mensuel (404 le 09/10/2026) :
 * sa page est la seule source d'encours de l'émetteur. Même date pour les
 * trois fonds, pour que chaque duel compare la même journée.
 * CW8 (part LU1681043599 seule) 6 808,90 M€ et VL 710,97 € ; DCAM
 * 1 620,85 M€ et VL 6,34 € ; GPEA 70,79 M€ et VL 5,16 €.
 */
export const TAILLE_AMUNDI_8_OCTOBRE = {
  CW8: { encoursMEur: 6808.9, vlEur: 710.97, au: "2026-10-08", source: "Amundi" },
  GPEA: { encoursMEur: 70.79, vlEur: 5.16, au: "2026-10-08", source: "Amundi" },
  DCAM: { encoursMEur: 1620.85, vlEur: 6.34, au: "2026-10-08", source: "Amundi" },
} as const satisfies Record<string, TailleEmetteur>;

/**
 * 6 808,9 → « environ 6,8 milliards d'euros » ; 70,79 → « environ 71 millions
 * d'euros ». Arrondi : un encours bouge chaque jour, la date fait foi.
 */
export function encoursEnviron(t: TailleEmetteur): string {
  if (t.encoursMEur >= 1000) {
    const md = Math.round(t.encoursMEur / 100) / 10;
    const texte = md.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
    return `environ ${texte} ${md < 2 ? "milliard" : "milliards"} d'euros`;
  }
  return `environ ${Math.round(t.encoursMEur)} millions d'euros`;
}

/**
 * Prix d'une part en ordre de grandeur (règle 2 de la table de vérité : jamais
 * au centime). 710,97 → « environ 710 € » ; 6,22 → « environ 6 € ».
 */
export function prixPartEnviron(t: TailleEmetteur): string {
  const v = t.vlEur >= 100 ? Math.round(t.vlEur / 10) * 10 : Math.round(t.vlEur);
  return `environ ${v.toLocaleString("fr-FR")} €`;
}

/**
 * Documents de l'émetteur cités par les deux nouveaux comparatifs. Adresses
 * du fichier de faits, toutes vérifiées en 200 le 09/10/2026, avec ou sans
 * en-tête de navigateur, et avec un Referer dcatracker.fr (DIC compris). Pour CW8 et DCAM, on cite le reporting pour
 * professionnels : c'est lui qui porte la ligne « Enveloppe fiscale ». GPEA
 * n'a pas encore de reporting : son DIC et sa page en tiennent lieu.
 */
export const DOCUMENTS_AMUNDI_2026_10 = {
  CW8_DIC: {
    libelle: "document d'informations clés du 28 avril 2026",
    url: "https://www.amundietf.fr/pdfDocuments/kid-priips/LU1681043599/FRA/FRA/20260428",
  },
  DCAM_DIC: {
    libelle: "document d'informations clés du 28 avril 2026",
    url: "https://www.amundietf.fr/pdfDocuments/kid-priips/FR001400U5Q4/FRA/FRA/20260428",
  },
  CW8_REPORTING: {
    libelle: "reporting Amundi du 30 septembre 2026 (version pour professionnels)",
    url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681043599/FRA/FRA/INSTITUTIONNEL/ETF/20260930",
  },
  CW8_PAGE: {
    libelle: "page Amundi ETF",
    url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-msci-world-swap-ucits-etf-eur-acc/lu1681043599",
  },
  DCAM_REPORTING: {
    libelle: "reporting Amundi du 30 septembre 2026 (version pour professionnels)",
    url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/FR001400U5Q4/FRA/FRA/INSTITUTIONNEL/ETF/20260930",
  },
  DCAM_PAGE: {
    libelle: "page Amundi ETF",
    url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-pea-monde-msci-world-ucits-etf/fr001400u5q4",
  },
  GPEA_DIC: {
    libelle: "document d'informations clés du 6 juillet 2026",
    url: "https://www.amundietf.fr/pdfDocuments/kid-priips/FR0014017NX3/FRA/FRA/20260706",
  },
  GPEA_PAGE: {
    libelle: "page Amundi ETF",
    url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-pea-global-msci-acwi-ucits-etf-acc/fr0014017nx3",
  },
} as const satisfies Record<string, FicheCitee>;
