// Fiches ETF v2 — types des faits (14/10/2026).
//
// Spécification : private-assets/raw/geo/fiche-etf-v2-spec.md (§4). Chaque
// chiffre publié sur une fiche v2 est un FAIT : une valeur, le document qui la
// donne (id d'un DocumentSource de la même fiche), la date à laquelle elle est
// vraie, la date à laquelle nous l'avons lue, et ses recoupements par une
// seconde famille de sources. Le validateur (valider.ts) fait échouer le build
// si l'un de ces éléments manque.
//
// Ce fichier n'importe rien : valider.ts et lui se testent avec `node` seul,
// sans dépendance.
//
// Dépôt public : seuls des faits isolés, cités et datés. Jamais de série de
// valeurs liquidatives, de composition complète ni d'export Euronext.

/** « AAAA-MM-JJ ». */
export type DateISO = string;

/** emetteur = famille 1 ; les autres = seconde famille (recoupement). */
export type FamilleSource = "emetteur" | "regulateur" | "secondaire";

export type TypeDocument =
  | "reporting-pro"
  | "reporting"
  | "dic"
  | "prospectus"
  | "page-emetteur"
  | "fiche-mensuelle"
  | "avis-porteurs"
  | "grille-courtier"
  | "registre"
  /** Données publiées par l'émetteur hors document consultable (API de son site). */
  | "donnees-emetteur";

/** Un document cité par la fiche : on y renvoie, avec sa date. */
export interface DocumentSource {
  /** « cw8-reporting-pro-20260930 » : référencé par Fait.source. */
  id: string;
  /**
   * emetteur : le fonds ; regulateur : le registre ESMA (dates de cotation) ;
   * courtier : une grille tarifaire (bloc « Ce qui a changé »).
   */
  famille: "emetteur" | "regulateur" | "courtier";
  type: TypeDocument;
  /** « reporting mensuel d'Amundi au 30 septembre 2026, version pour professionnels » */
  libelle: string;
  /** https uniquement. */
  url: string;
  /**
   * false : l'adresse n'est pas une page lisible par un lecteur (interface de
   * données de l'émetteur). Le document est cité sans lien, et la fiche donne
   * le recoupement que le lecteur peut ouvrir.
   */
  consultable?: false;
  /** Date d'arrêté du document. */
  dateDocument: DateISO;
  /** Date à laquelle nous l'avons lu. */
  releveLe: DateISO;
}

/** Une seconde famille de sources, lue pour confirmer un fait. */
export interface Recoupement {
  famille: Exclude<FamilleSource, "emetteur">;
  /** « justETF », « registre ESMA FIRDS du 10/10/2026 » */
  libelle: string;
  url: string;
  /** Ce qu'on y a lu, tel quel. */
  valeurLue: string;
  releveLe: DateISO;
  concorde: boolean;
  note?: string;
}

export interface Fait<T> {
  valeur: T;
  /** id d'un DocumentSource de la fiche. */
  source: string;
  /** Où dans le document : « p. 2, ligne « Enveloppe fiscale » ». */
  ou?: string;
  /** Texte exact lu, court. */
  citation?: string;
  /** Date à laquelle la valeur est vraie. */
  dateValeur: DateISO;
  releveLe: DateISO;
  recoupements: Recoupement[];
  /** Obligatoire pour l'encours et la composition. */
  portee?: "part" | "fonds" | "indice" | "panier";
}

export type Periode = "ytd" | "1m" | "3m" | "6m" | "1a" | "3a" | "5a" | "origine";

/** Performance publiée par l'émetteur, en % ; `ecart` seulement s'il l'imprime. */
export interface LignePerf {
  fonds: number;
  indice: number;
  ecart?: number;
}
export interface PerfCalendaire extends LignePerf {
  annee: number;
}
export interface PerfCumulee extends LignePerf {
  periode: Periode;
  /** Date de départ de la période, telle que publiée. */
  depuis: DateISO;
}

export interface MesureRisque {
  periode: "1a" | "3a" | "origine";
  /** En %. */
  valeur: number;
}

export interface AutrePart {
  mnemo: string;
  isin: string;
  /** Frais courants, en % par an. */
  ter: number;
  creation: DateISO;
  /** « distribuante », « capitalisante, prix de part plus bas » */
  difference: string;
}

/** Une entrée datée de « Ce qui a changé pour ce fonds ». */
export interface Changement {
  date: DateISO;
  type: "lancement" | "part" | "indice" | "nom" | "frais" | "courtier" | "document";
  texte: string;
  /** id d'un DocumentSource de la fiche. */
  source: string;
  /** Seconde source, si l'entrée en a une. */
  recoupement?: string;
}

export interface FicheEtfV2 {
  /** Identique à ETFConfig.displaySymbol. */
  mnemo: string;
  /** Pour le title : « Amundi MSCI World Swap ». Sans chiffre. */
  nomCourt: string;
  emetteur: { nom: string; site: string };
  isin: Fait<string>;
  nomOfficiel: Fait<string>;
  societeDeGestion: Fait<string>;
  /**
   * nom : « MSCI World » ; detail : ce que dit le document cité de l'indice
   * (dividendes, devise) ; enClair : ce que contient l'indice, en mots simples,
   * d'après le même document (« des actions de grandes et moyennes entreprises
   * des pays développés »). Sans chiffre.
   */
  indice: Fait<{ nom: string; detail: string; enClair: string }>;
  /** detail : ce que dit le document cité de la réplication. */
  replication: Fait<{ mode: "synthetique" | "physique"; detail: string }>;
  /**
   * Banques contreparties du swap. Amundi ne les publie que dans les données
   * produit de son site (document `donnees-emetteur`, non consultable) :
   * le recoupement justETF est le lien que le lecteur peut ouvrir.
   */
  contreparties?: Fait<string[]>;
  distribution: Fait<"capitalisation" | "capitalisation-et-ou-distribution">;
  domicile: Fait<{ pays: string; forme: string }>;
  dates: {
    creationPart: Fait<DateISO>;
    /** Quand l'historique publié commence avant la part (CW8). */
    premiereVl?: Fait<DateISO>;
    premiereCotationParis: Fait<DateISO>;
  };
  autresParts: Fait<AutrePart>[];
  pea: {
    statut: Fait<boolean>;
    /** La ligne qui tranche, citée mot pour mot (Fait.citation). */
    preuve: Fait<string>;
    /** Une 2e preuve chez l'émetteur, lisible par un particulier (DIC, prospectus, page). */
    preuveSecondaire?: Fait<string>;
  };
  /** Frais courants, en % par an : source = DIC. */
  ter: Fait<number>;
  /** Valeur liquidative en euros, datée (peut différer de chiffres.au : WPEA). */
  vl: Fait<number> | null;
  encours: {
    /** M EUR, portee "fonds". */
    fonds: Fait<number>;
    /** M EUR, portee "part", quand l'émetteur la publie dans un document consultable. */
    part?: Fait<number>;
    /** « dont EWLD, sa part distribuante » ; null si le fonds n'a qu'une part. */
    autresPartsLibelle: string | null;
  };
  /** Tout ce qui vient du document de fin de mois : même source, même date. */
  chiffres: {
    au: DateISO;
    source: string;
    /** Amundi imprime la ligne « Ecart » ; iShares non (écart calculé et dit tel). */
    ecartImprime: boolean;
    perfCalendaires: Fait<PerfCalendaire[]>;
    perfCumulees: Fait<PerfCumulee[]>;
    volatilite?: Fait<MesureRisque[]>;
    trackingError?: Fait<MesureRisque[]>;
    nbValeursIndice?: Fait<number>;
    /** 3 premiers au plus (licence MSCI : pas de tableau complet). */
    paysIndice?: Fait<{ nom: string; poids: number }[]>;
    secteursIndice?: Fait<{ nom: string; poids: number }[]>;
  };
  /** Titres du panier de substitution détenu (pas l'indice), si l'émetteur le publie. */
  panier?: Fait<number>;
  /** Phrases sans chiffre, collées sous les performances (changement d'indice, fusion…). */
  notesPerformances: string[];
  /** Points propres au fonds, sans chiffre : les chiffres sont dans leurs blocs. */
  pointsAConnaitre: string[];
  /** Fonds non éligibles au PEA qui ont une fiche, même indice ou indice voisin. */
  equivalentsHorsPea: { mnemo: string; note: string }[];
  changements: Changement[];
  /** « Nos corrections sur cette fiche » : ce que le site a affiché de faux. */
  corrections: { date: DateISO; texte: string }[];
  documents: DocumentSource[];
  /** Fiche de recoupement principale (justETF). */
  recoupementPrincipal: { libelle: string; url: string; releveLe: DateISO };
  /** Dernière relecture complète → dateModified, lastmod, « relus le ». */
  relueLe: DateISO;
}
