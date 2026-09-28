// Format de public/search-index.json — produit par scripts/build-search-index.mjs.
// Clés d'une lettre : le fichier est téléchargé par le navigateur à
// l'ouverture de la recherche, chaque octet compte.

export type IndexSection = {
  /** Titre de la section (h2, h3 ou question de FAQ). Vide pour l'introduction. */
  h: string;
  /** Ancre du titre (id), vide s'il n'en a pas. */
  a: string;
  /**
   * Texte du passage. Une section longue n'est pas tronquée : elle est
   * découpée en passages consécutifs de 1 600 caractères au plus, qui
   * partagent le même h et le même a (le moteur n'en garde qu'un par lien).
   */
  x: string;
};

export type IndexPage = {
  /** Chemin, ex. « /comparatif-etf/cw8-vs-wpea ». */
  u: string;
  /** Titre de la page (balise <title>). */
  t: string;
  /** Meta description. */
  d: string;
  /** Catégorie affichée : Guide, Fiche ETF, Comparatif ETF, Courtier… */
  c: string;
  /**
   * Identifiants exacts, indexés sur chaque passage : ticker de la fiche ETF,
   * ISIN cités, tickers d'un comparatif, marque du courtier (« Boursorama »).
   */
  k: string[];
  /**
   * Mots-clés de notion : la page est LA référence de ces sujets (ex.
   * /glossaire/ter → « frais », « frais de gestion », « TER »). Indexés sur le
   * premier passage seulement, avec le poids de k. Absent si la page n'en a pas.
   */
  m?: string[];
  s: IndexSection[];
};

export type IndexRecherche = { v: 1; pages: IndexPage[] };

/** Un morceau d'extrait, surligné ou non — rendu sans HTML brut. */
export type Morceau = { texte: string; surligne: boolean };

export type Passage = {
  /** Titre de la section, vide pour l'introduction de la page. */
  titre: string;
  href: string;
  extrait: Morceau[];
};

export type Resultat = {
  page: IndexPage;
  score: number;
  /** Lien vers le meilleur passage (ou la page). */
  href: string;
  /** Meilleur passage d'abord. */
  passages: Passage[];
};
