// Moteur de la recherche interne : un index plein texte (MiniSearch, BM25)
// sur chaque passage du site, regroupé par page au moment de répondre.
//
// Un passage = une section de page (titre h2/h3 ou question de FAQ + son
// texte). Chercher par passage plutôt que par page, c'est ce qui permet de
// renvoyer le lecteur sur « Quel est le plafond du PEA ? » plutôt qu'en haut
// d'une page de 2 000 mots où il devrait le retrouver lui-même.

import MiniSearch, { type Query, type SearchResult } from "minisearch";
import {
  analyserRequete,
  decouper,
  normaliserAligne,
  replier,
  traiterTerme,
  type TermeRequete,
} from "./normaliser";
import { LONGUEUR_MAX_REQUETE } from "./limites";
import type { IndexPage, IndexRecherche, Morceau, Passage, Resultat } from "./types";

type Doc = {
  id: string;
  /** Identifiants exacts de la page (ticker, ISIN, marque du courtier). */
  k: string;
  /** Mots-clés de notion de la page (« frais », « TER »…) — premier passage seulement. */
  m?: string;
  /** Titre de la page et mots de son adresse — répété sur chaque passage,
   *  pour qu'une requête « frais cw8 » trouve le passage « frais » des pages CW8. */
  t: string;
  /** Titre du passage. */
  h: string;
  /** Description de la page — sur le premier passage seulement. */
  d: string;
  x: string;
};

// Poids des champs. Un ticker, un ISIN ou la notion dont la page est la
// référence l'emporte sur tout ; le titre de page sur le titre de section ;
// le titre de section sur le texte.
const POIDS = { k: 6, m: 6, t: 3, h: 2.2, d: 1.4, x: 1 };

/** Largeur d'un extrait, en caractères. */
const LARGEUR_EXTRAIT = 180;

// Mots qui, à côté d'un ticker, demandent la fiche du fonds : « etf cw8 »,
// « cw8 isin », « frais cw8 ». Forme indexée (« avis » → « avi »).
const MOTS_DE_FICHE = new Set(
  ["etf", "fiche", "avis", "frais", "ter", "isin", "cours", "prix", "performance"].map(
    (m) => traiterTerme(m) ?? m,
  ),
);

const ISIN = /^[a-z]{2}[a-z0-9]{9}\d$/;

export type OptionsRecherche = {
  /** Passages calculés par résultat (3 par défaut). La boîte de dialogue n'en affiche qu'un. */
  passages?: number;
};

export type Moteur = {
  pages: IndexPage[];
  rechercher: (q: string, limite?: number, options?: OptionsRecherche) => Resultat[];
};

/**
 * Comment un terme de la requête peut correspondre à un mot de l'index. La
 * même règle sert à MiniSearch, à couvre() et au surlignage : sinon le titre
 * est jugé « couvert » par un mot que la recherche n'a pas trouvé (constat 22).
 */
type RegleTerme = {
  /** Rang dans la requête. */
  rang: number;
  /** Forme indexée (pluriel retiré). */
  terme: string;
  /** Début de mot à compléter, ou null. */
  prefixe: string | null;
  /** Distance d'édition tolérée (fautes de frappe), 0 si aucune. */
  flou: number;
};

function regleDe(
  { terme, brut }: TermeRequete,
  rang: number,
  dernier: boolean,
  vocabulaire: Map<string, number>,
): RegleTerme {
  // Un mot qui existe tel quel dans l'index est un mot complet : ni
  // complété ni approché. Sinon « dca » trouvait d'abord « dcam » (terme rare,
  // donc mieux noté), « mois » surlignait « moins », « coeur » ramenait
  // « cours » en tête (constats 7 et 18). À partir de 3 lettres seulement :
  // « fr » existe (dcatracker.fr) mais se complète en cours de frappe.
  const connu = terme.length >= 3 && vocabulaire.has(terme);
  // Pas de faute de frappe sur un nombre ou un code : « 150000 » ramenait
  // 450000, 750000, 15000… (constat 3).
  const flou =
    connu || /\d/.test(terme) || terme.length < 5 ? 0 : Math.min(6, Math.round(terme.length * 0.2));
  // Complétion : le dernier mot, souvent en cours de frappe, dès deux lettres ;
  // les autres s'ils sont longs. Jamais pour un nombre : « 200 » ramenait 2008.
  // On complète la forme TAPÉE : « cours » → « cour » se complétait en
  // « courtier » (constat 2).
  let prefixe: string | null = null;
  if (!connu && !/^\d+$/.test(terme) && (dernier ? brut.length >= 2 : terme.length >= 5)) prefixe = brut;
  // Exception : les noms d'indice que la normalisation soude à leur nombre
  // (« Nasdaq-100 » → « nasdaq100 »). « nasdaq » est un mot connu, mais les
  // pages qui n'écrivent que « Nasdaq-100 » ne le contiennent pas : sans
  // complétion, « nasdaq » passait de 32 pages à 8 (mesuré le 28/09/2026).
  if (connu && INDICES_SOUDES.test(terme)) prefixe = terme;
  return { rang, terme, prefixe, flou };
}

/** Noms d'indice que normaliser() soude au nombre qui suit (voir REGLES). */
const INDICES_SOUDES = /^(sp|nasdaq|stoxx|russell|nikkei|cac|ftse|dax)$/;

/** Sous-requête MiniSearch d'un terme, déjà traité (processTerm identité). */
function sousRequete(r: RegleTerme): Query {
  const flou = r.flou || false;
  if (r.prefixe === r.terme) return { queries: [r.terme], prefix: true, fuzzy: flou };
  const exact: Query = { queries: [r.terme], prefix: false, fuzzy: flou };
  if (r.prefixe === null) return exact;
  // « bours » : « bour » exact OU un mot qui commence par « bours ».
  return { combineWith: "OR", queries: [exact, { queries: [r.prefixe], prefix: true, fuzzy: false }] };
}

const identite = (t: string) => t;
const seul = (t: string) => [t];

function requeteMiniSearch(regles: RegleTerme[], combinaison: "AND" | "OR"): Query {
  return {
    combineWith: combinaison,
    tokenize: seul,
    processTerm: identite,
    queries: regles.map(sousRequete),
  };
}

function correspond(r: RegleTerme, mot: string): boolean {
  if (mot === r.terme) return true;
  if (r.prefixe !== null && mot.startsWith(r.prefixe)) return true;
  if (r.flou === 0 || Math.abs(mot.length - r.terme.length) > r.flou) return false;
  return distance(mot, r.terme, r.flou) <= r.flou;
}

/** Distance de Levenshtein, arrêtée dès qu'elle dépasse `max` (comme MiniSearch). */
function distance(a: string, b: string, max: number): number {
  let prec: number[] = [];
  for (let j = 0; j <= b.length; j++) prec.push(j);
  for (let i = 1; i <= a.length; i++) {
    const cour = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prec[j] + 1, cour[j - 1] + 1, prec[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cour.push(v);
      if (v < min) min = v;
    }
    if (min > max) return max + 1;
    prec = cour;
  }
  return prec[b.length];
}

/**
 * Texte indexé comme titre : le <title> et les mots du dernier segment de
 * l'adresse. /meilleurs-etf-debutants s'intitule « Quel ETF choisir pour
 * débuter », sans « meilleur » ; /glossaire/replication-synthetique
 * « ETF synthétique (swap) », sans « réplication » (constat 9). Pas pour les
 * pages courtier : « boursorama-bourse » ferait de « bourse » un mot du titre.
 */
function titreIndexe(p: IndexPage): string {
  if (p.u.startsWith("/comparatif/")) return p.t;
  const segment = p.u.slice(p.u.lastIndexOf("/") + 1);
  return segment ? `${p.t} ${segment.replace(/-/g, " ")}` : p.t;
}

function termesDe(texte: string): string[] {
  return decouper(texte)
    .map(traiterTerme)
    .filter((t): t is string => !!t);
}

export function creerMoteur(index: IndexRecherche): Moteur {
  const pages = index.pages;
  // Vocabulaire de l'index (forme indexée → nombre d'occurrences). MiniSearch
  // n'appelle processTerm avec un nom de champ qu'à l'indexation : la
  // recherche ne l'alimente pas.
  const vocabulaire = new Map<string, number>();
  const ms = new MiniSearch<Doc>({
    fields: ["k", "m", "t", "h", "d", "x"],
    storeFields: [],
    tokenize: (texte) => decouper(texte),
    processTerm: (terme, champ) => {
      const t = traiterTerme(terme);
      if (champ && t) vocabulaire.set(t, (vocabulaire.get(t) ?? 0) + 1);
      return t;
    },
    // Les requêtes arrivent déjà découpées et traitées (requeteMiniSearch).
    searchOptions: { boost: POIDS, tokenize: seul, processTerm: identite },
  });

  const motsTitres: string[][] = [];
  // Titre seul (sans les mots de l'URL), dans l'ordre : pour le bonus « le
  // titre commence par la requête ».
  const debutsTitres: string[][] = [];
  // Fiche ETF : son ticker et ses ISIN, sous forme indexée.
  const identifiantsFiche: (Set<string> | null)[] = [];
  const docs: Doc[] = [];
  pages.forEach((p, pi) => {
    const t = titreIndexe(p);
    motsTitres.push(termesDe(t));
    debutsTitres.push(termesDe(p.t));
    identifiantsFiche.push(
      p.c === "Fiche ETF"
        ? new Set([...termesDe(p.u.slice(5)), ...p.k.map(replier).filter((k) => ISIN.test(k))])
        : null,
    );
    const k = p.k.join(" ");
    const m = p.m?.length ? p.m.join(" ") : undefined;
    p.s.forEach((s, si) => {
      const premier = si === 0;
      docs.push({ id: `${pi}:${si}`, k, m: premier ? m : undefined, t, h: s.h, d: premier ? p.d : "", x: s.x });
    });
    if (p.s.length === 0) docs.push({ id: `${pi}:-1`, k, m, t, h: "", d: p.d, x: "" });
  });
  // Les passages qui portent des mots-clés de notion sont indexés en premier,
  // et m est absent (undefined) des autres. MiniSearch 7 tient la longueur
  // moyenne d'un champ au fil des ajouts et ne la met pas à jour pour un
  // document où le champ est absent : la moyenne de m ne porte donc que sur
  // les passages qui en ont, comme pour un champ présent partout. Moyennée
  // sur les 685 passages alors que m n'en concerne que 34, elle divisait le
  // score de m par 2 à 2,5, sous celui de k à poids égal : « frais » et
  // « frais etf » laissaient /glossaire/ter derrière la page Fortuneo,
  // « backtest » laissait /backtest derrière /backtest-depuis-2010 (mesuré le
  // 28/09/2026 sur l'index du nouveau script). Contrepartie : un mot de m pèse
  // lourd, il ne doit désigner qu'une page. Si MiniSearch changeait ce
  // calcul, m redeviendrait seulement plus faible.
  docs.sort((a, b) => Number(b.m !== undefined) - Number(a.m !== undefined));
  ms.addAll(docs);

  /** Rareté d'un terme : sert à placer l'extrait sur le mot le plus parlant. */
  const rarete = (terme: string) => 1 / Math.log(2 + (vocabulaire.get(terme) ?? 0));

  function rechercher(q: string, limite = 8, options: OptionsRecherche = {}): Resultat[] {
    // Requête bornée : 1 200 mots collés dans /recherche?q= figeaient l'onglet 2 s (constat 46).
    const requete = q.trim().slice(0, LONGUEUR_MAX_REQUETE);
    const analyse = analyserRequete(requete);
    if (analyse.length === 0) return [];
    const regles = analyse.map((t, i) => regleDe(t, i, i === analyse.length - 1, vocabulaire));

    // Chaque forme cherchée (exacte ou à compléter) → rang du terme. MiniSearch
    // multiplie le score par le nombre de formes trouvées ; « bour » et
    // « bours* » sont un seul mot de la requête, on recompte par rang.
    const rangs = new Map<string, number>();
    for (const r of regles) {
      if (!rangs.has(r.terme)) rangs.set(r.terme, r.rang);
      if (r.prefixe !== null && !rangs.has(r.prefixe)) rangs.set(r.prefixe, r.rang);
    }
    const chercher = (combinaison: "AND" | "OR") =>
      ms.search(requeteMiniSearch(regles, combinaison)).map((r) => {
        const formes = r.queryTerms.length || 1;
        const couverts = new Set(r.queryTerms.map((t) => rangs.get(t) ?? t)).size || 1;
        return formes === couverts ? r : { ...r, score: (r.score / formes) * couverts };
      });

    // Tous les mots d'abord ; si trop peu de pages les contiennent tous, on
    // complète avec les pages qui en contiennent une partie, classées après.
    const tous = chercher("AND");
    let bruts: SearchResult[] = tous;
    if (regles.length > 1 && pagesDistinctes(tous) < 5) {
      const vus = new Set(tous.map((r) => r.id));
      const plafond = tous.length ? Math.min(...tous.map((r) => r.score)) : Infinity;
      const partiels = chercher("OR")
        .filter((r) => !vus.has(r.id))
        // Un passage partiel ne dépasse pas le moins bon passage complet. Au
        // niveau de la page, le bonus de passages multiples peut encore faire
        // passer une page partielle très pertinente devant une page complète
        // peu pertinente (« trade republic plan » : la page Trade Republic,
        // qui n'écrit pas « plan », devant la page Boursorama qui la cite).
        // Voulu : aucun cas mesuré où l'inversion nuit au lecteur (constat 20).
        .map((r) => ({ ...r, score: Math.min(r.score * 0.5, plafond * 0.99) }));
      bruts = [...tous, ...partiels];
    }

    const parPage = new Map<number, SectionTrouvee[]>();
    for (const r of bruts) {
      const [pis, sis] = String(r.id).split(":");
      const pi = Number(pis);
      const sections = parPage.get(pi) ?? [];
      sections.push({ si: Number(sis), score: r.score, termes: r.terms });
      parPage.set(pi, sections);
    }

    // Classement d'abord, extraits ensuite et seulement pour les pages
    // gardées : calculer les extraits des 70 pages que trouve « etf » pour en
    // afficher 8 coûtait 30 à 170 ms par frappe (constat 1).
    const idsRequete = regles.filter((r) => !MOTS_DE_FICHE.has(r.terme));
    const candidats: Candidat[] = [];
    for (const [pi, sections] of parPage) {
      const page = pages[pi];
      sections.sort((a, b) => b.score - a.score);
      // Plusieurs passages pertinents : la page traite vraiment le sujet. Les
      // morceaux d'une même section longue (même titre, même ancre) comptent
      // pour un.
      const cle = (si: number) => (si < 0 ? "" : `${page.s[si].h}\n${page.s[si].a}`);
      const distinctes = new Set(sections.map((s) => cle(s.si))).size;
      let score = sections[0].score * (1 + 0.06 * Math.min(distinctes - 1, 5));
      // « cw8 », « etf cw8 », « IE0002XZSHO1 » : la fiche du fonds avant les
      // comparatifs et les guides qui le citent. Pas pour « cw8 vs wpea »
      // (deux tickers) ni « investir 500 » (un autre mot que ceux d'une fiche).
      if (idsRequete.length === 1 && identifiantsFiche[pi]?.has(idsRequete[0].terme)) score *= 3;
      // Tous les mots de la requête sont dans le titre : c'est la page du
      // sujet, on y renvoie en haut plutôt que vers un passage.
      const titreCouvre = regles.every((r) => motsTitres[pi].some((m) => correspond(r, m)));
      if (titreCouvre) score *= 1.5;
      // Le titre COMMENCE par la requête, dans l'ordre : « pea ou cto » →
      // « PEA ou CTO en 2026 : … » plutôt que /glossaire/cto, qui ne couvre
      // qu'un des deux mots dans ses mots-clés (189 contre 180 sans ce bonus,
      // mesuré le 28/09/2026).
      if (regles.every((r, i) => debutsTitres[pi][i] !== undefined && correspond(r, debutsTitres[pi][i]))) {
        score *= 1.4;
      }
      candidats.push({ pi, score, sections, titreCouvre });
    }
    candidats.sort((a, b) => b.score - a.score);

    const maxPassages = Math.max(1, options.passages ?? 3);
    return candidats.slice(0, limite).map((c) => {
      const page = pages[c.pi];
      const surligner = termesSurlignes(regles, c.sections, rarete);
      const passages: Passage[] = [];
      const vus = new Set<string>();
      if (c.titreCouvre) {
        passages.push({ titre: "", href: page.u, extrait: extraitPage(page, surligner) });
        vus.add(page.u);
      }
      // Passage montré : celui dont le TEXTE couvre le plus de mots de la
      // requête, puis le mieux noté. Le score d'un passage compte aussi les
      // champs de page (titre, mots-clés) : « pfu pea » menait en haut de
      // /glossaire/pfu, trouvé par ses mots-clés, au lieu de sa question « Le
      // PFU s'applique-t-il dans un PEA ? » (contre-vérification du 28/09/2026).
      const aMontrer = c.sections
        .filter((s) => s.si >= 0)
        .slice(0, 12)
        .map((s) => ({ ...s, couverture: couverture(page.s[s.si], regles) }))
        .sort((a, b) => b.couverture - a.couverture || b.score - a.score);
      for (const s of aMontrer) {
        if (passages.length >= maxPassages) break;
        // Une section longue est découpée en passages de même ancre : un seul
        // lien par ancre, le mieux noté.
        const href = lienPassage(page, s.si);
        if (vus.has(href)) continue;
        vus.add(href);
        passages.push(passage(page, s.si, href, surligner));
      }
      if (passages.length === 0) {
        passages.push({ titre: "", href: page.u, extrait: extraitPage(page, surligner) });
      }
      return { page, score: c.score, href: passages[0].href, passages };
    });
  }

  return { pages, rechercher };
}

type SectionTrouvee = { si: number; score: number; termes: string[] };
type Candidat = { pi: number; score: number; sections: SectionTrouvee[]; titreCouvre: boolean };

function pagesDistinctes(rs: SearchResult[]): number {
  return new Set(rs.map((r) => String(r.id).split(":")[0])).size;
}

// ─── Liens ───────────────────────────────────────────────────────────────────

/**
 * Lien vers un passage : la page + l'ancre du titre. L'ancre est l'id du titre
 * quand il en a un, sinon une ancre calculée depuis son texte que
 * <AncresTitres /> résout sur la page (et qui ouvre la question de FAQ).
 */
export function lienPassage(page: IndexPage, si: number): string {
  const s = page.s[si];
  if (!s || !s.h || !s.a) return page.u;
  return `${page.u}#${s.a}`;
}

/** Nombre de mots de la requête présents dans le titre et le texte d'un passage. */
function couverture(s: IndexPage["s"][number], regles: RegleTerme[]): number {
  const mots = termesDe(`${s.h} ${s.x}`);
  return regles.filter((r) => mots.some((m) => correspond(r, m))).length;
}

/**
 * Extrait d'un résultat qui renvoie en haut de page : la description si elle
 * contient un mot cherché, sinon l'introduction de la page si elle en
 * contient un. La description seule laissait des extraits sans aucun mot
 * surligné (« PFU », « TRI », « msci world » : 9 premiers résultats sur 145).
 */
function extraitPage(page: IndexPage, surligner: Surlignage): Morceau[] {
  if (plagesDe(page.d, surligner.formes).length) return extraitDe(page.d, surligner);
  const intro = page.s[0];
  if (intro && !intro.h && intro.x && plagesDe(intro.x, surligner.formes).length) {
    return extraitDe(intro.x, surligner);
  }
  return extraitDe(page.d, surligner);
}

function passage(page: IndexPage, si: number, href: string, surligner: Surlignage): Passage {
  const s = page.s[si];
  // Le texte du passage s'il contient un mot cherché ; sinon, pour le premier
  // passage, la description (le passage a été trouvé par elle).
  let texte = s.x;
  let plages = texte ? plagesDe(texte, surligner.formes) : [];
  if (plages.length === 0 && ((si === 0 && page.d) || !s.x)) {
    texte = page.d;
    plages = plagesDe(texte, surligner.formes);
  }
  return { titre: s.h, href, extrait: fenetre(texte, plages, LARGEUR_EXTRAIT, surligner.poids) };
}

// ─── Extraits surlignés ──────────────────────────────────────────────────────

/** Formes à surligner (forme indexée → rang du terme de requête) et poids de chaque rang. */
type Surlignage = { formes: Map<string, number>; poids: (rang: number) => number };

/**
 * Les termes de la requête, plus les mots que MiniSearch a trouvés pour eux
 * dans les passages de la page (complétion, faute de frappe), rattachés au
 * terme d'origine : « boursorma » surligne « Boursorama ».
 */
function termesSurlignes(
  regles: RegleTerme[],
  sections: SectionTrouvee[],
  rarete: (t: string) => number,
): Surlignage {
  const formes = new Map<string, number>();
  for (const r of regles) if (!formes.has(r.terme)) formes.set(r.terme, r.rang);
  for (const s of sections) {
    for (const t of s.termes) {
      if (formes.has(t)) continue;
      formes.set(t, regles.find((r) => correspond(r, t))?.rang ?? -1);
    }
  }
  const poids = regles.map((r) => rarete(r.terme));
  return { formes, poids: (rang) => poids[rang] ?? 0 };
}

/** Une occurrence à surligner, en indices du texte d'origine. */
type Plage = { debut: number; fin: number; rang: number };

/**
 * Plages des mots à surligner. Le texte passe par les règles de normaliser()
 * (S&P 500 → sp500, 150 000 → 150000, € → euros, œ → oe) en gardant la trace
 * de chaque caractère : un terme trouvé par la recherche est aussi surligné,
 * et la plage couvre le texte tel qu'affiché (« S&P 500 », « 150 000 »).
 * Correspondance par forme entière, pas par début de mot : « euro »
 * surlignait « européenne », « 200 » surlignait « 2008 ».
 */
function plagesDe(texte: string, formes: Map<string, number>): Plage[] {
  const { norm, orig } = normaliserAligne(texte);
  const plages: Plage[] = [];
  for (const m of norm.matchAll(/[a-z0-9]+/g)) {
    const mot = m[0];
    const forme = traiterTerme(mot);
    if (forme === null) continue;
    const rang = formes.get(forme) ?? formes.get(mot);
    if (rang === undefined) continue;
    const i = m.index ?? 0;
    plages.push({ debut: orig[i], fin: orig[i + mot.length - 1] + 1, rang });
  }
  return plages;
}

/**
 * ~180 caractères, mots entiers, placés sur le passage qui réunit le plus de
 * termes différents de la requête (à égalité, les plus rares) : « clôture
 * PEA » montrait la première occurrence de « PEA », pas la réponse sur la
 * clôture (constat 25).
 */
function fenetre(
  texte: string,
  plages: Plage[],
  largeur: number,
  poids: (rang: number) => number,
): Morceau[] {
  if (!texte) return [];
  let debut = 0;
  let fin = texte.length;
  if (texte.length > largeur) {
    // Grappe de plages tenant dans la fenêtre (avec un peu de contexte).
    let meilleure: { a: number; b: number; n: number; p: number } | null = null;
    for (let i = 0; i < plages.length; i++) {
      const rangs = new Set<number>();
      let p = 0;
      let b = plages[i].fin;
      for (let j = i; j < plages.length; j++) {
        if (j > i && plages[j].fin - plages[i].debut > largeur - 20) break;
        if (!rangs.has(plages[j].rang)) {
          rangs.add(plages[j].rang);
          p += poids(plages[j].rang);
        }
        b = Math.max(b, plages[j].fin);
      }
      const n = rangs.size;
      if (!meilleure || n > meilleure.n || (n === meilleure.n && p > meilleure.p + 1e-9)) {
        meilleure = { a: plages[i].debut, b, n, p };
      }
    }
    if (meilleure) {
      const libre = largeur - (meilleure.b - meilleure.a);
      debut = Math.max(0, meilleure.a - Math.min(60, Math.max(0, Math.floor(libre / 2))));
      if (debut > 0) {
        const espace = texte.lastIndexOf(" ", debut);
        debut = espace > 0 && meilleure.a - espace < 90 ? espace + 1 : debut;
      }
    }
    fin = Math.min(texte.length, Math.max(debut + largeur, meilleure?.b ?? 0));
    // Fenêtre qui bute sur la fin du texte : on la complète par l'avant.
    if (fin === texte.length && debut > 0 && fin - debut < largeur) {
      let d = Math.max(0, fin - largeur);
      if (d > 0) {
        const espace = texte.indexOf(" ", d);
        d = espace >= 0 && espace - d < 25 ? espace + 1 : d;
      }
      debut = Math.min(debut, d);
    }
    if (fin < texte.length) {
      const espace = texte.indexOf(" ", fin);
      fin = espace > 0 && espace - fin < 25 ? espace : fin;
    }
  }

  // Deux mots surlignés séparés d'une espace : une seule plage.
  const fusion: [number, number][] = [];
  for (const { debut: a, fin: b } of plages) {
    const der = fusion[fusion.length - 1];
    if (der && a - der[1] <= 1 && /^\s?$/.test(texte.slice(der[1], a))) der[1] = Math.max(der[1], b);
    else fusion.push([a, b]);
  }

  const morceaux: Morceau[] = [];
  if (debut > 0) morceaux.push({ texte: "… ", surligne: false });
  let curseur = debut;
  for (const [a, b] of fusion) {
    if (b <= curseur || a >= fin) continue;
    const aa = Math.max(a, curseur);
    const bb = Math.min(b, fin);
    if (aa > curseur) morceaux.push({ texte: texte.slice(curseur, aa), surligne: false });
    morceaux.push({ texte: texte.slice(aa, bb), surligne: true });
    curseur = bb;
  }
  if (curseur < fin) morceaux.push({ texte: texte.slice(curseur, fin), surligne: false });
  if (fin < texte.length) morceaux.push({ texte: " …", surligne: false });
  return morceaux;
}

function extraitDe(texte: string, surligner: Surlignage): Morceau[] {
  return fenetre(texte, texte ? plagesDe(texte, surligner.formes) : [], LARGEUR_EXTRAIT, surligner.poids);
}

/**
 * Extrait surligné d'un texte quelconque. `termes` : mots cherchés, sous
 * n'importe quelle forme (« S&P 500 », « sp500 », « frais »).
 */
export function extrait(texte: string, termes: string[], largeur = LARGEUR_EXTRAIT): Morceau[] {
  const formes = new Map<string, number>();
  termes.forEach((t, rang) => {
    for (const mot of decouper(t)) {
      const forme = traiterTerme(mot);
      if (forme && !formes.has(forme)) formes.set(forme, rang);
    }
  });
  return fenetre(texte, texte ? plagesDe(texte, formes) : [], largeur, () => 1);
}

// ─── Chargement ──────────────────────────────────────────────────────────────

let chargement: Promise<Moteur> | null = null;

/**
 * Télécharge l'index et construit le moteur, une seule fois par onglet.
 * L'index n'est demandé qu'à l'ouverture de la recherche (ou à son survol) :
 * les pages n'en paient pas le poids.
 */
export function chargerMoteur(): Promise<Moteur> {
  if (!chargement) {
    chargement = fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`index ${r.status}`);
        return r.json() as Promise<IndexRecherche>;
      })
      .then(creerMoteur)
      .catch((e) => {
        chargement = null; // nouvel essai à la prochaine ouverture
        throw e;
      });
  }
  return chargement;
}

/** Précharge l'index et le moteur au survol du bouton : l'ouverture est alors instantanée. */
export function prechargerIndex(): void {
  void chargerMoteur().catch(() => {});
}
