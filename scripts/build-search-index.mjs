#!/usr/bin/env node
// Construit l'index de la recherche interne — public/search-index.json.
//
// ─── Pourquoi un index construit depuis le HTML du build ─────────────────────
//
// La recherche doit trouver « un point précis » : une question de FAQ, une
// section, un ISIN, un courtier. Ce contenu vit dans une soixantaine de pages
// écrites à la main (TSX) autant que dans les modules de données. Indexer les
// modules de données seulement aurait laissé de côté la moitié du site ; tenir
// à la main une liste des sections aurait divergé du site au premier texte
// modifié. Le HTML pré-rendu par `next build` est la seule source qui contient
// tout, exactement tel que le lecteur le voit — et elle est à jour par
// construction : l'index est reconstruit à chaque build (npm postbuild).
//
// Le fichier est écrit dans public/ APRÈS `next build` : c'est le même
// mécanisme que les générateurs de sitemap en postbuild, que Vercel publie
// avec le reste des fichiers statiques. Il est gitignoré — un index commité se
// périmerait au premier contenu modifié.
//
// ─── Ce qui est indexé ────────────────────────────────────────────────────────
//
// Les URL du sitemap servi (la liste de ce que le site veut voir trouvé), pas
// les pages de compte ni les pages en noindex. Chaque page est découpée en
// sections, à chaque titre h2/h3 et à chaque question de FAQ (<summary>) :
// un résultat pointe vers le passage, pas seulement vers la page. Le lien
// utilise l'id du titre quand il en a un ; sinon une ancre calculée depuis son
// texte (ancre() ci-dessous), que <AncresTitres /> résout sur la page — il
// ouvre la question de FAQ, fait défiler et surligne le passage. La même
// fonction existe côté client (src/lib/search/ancre.ts) : les deux doivent
// rester identiques.
//
// Une section longue est découpée en passages consécutifs de 1 600 caractères
// au plus, qui gardent le titre et l'ancre de la section (voir
// decouperTexte()). Une question de FAQ s'arrête à la fin de son <details> :
// ce qui suit reprend le titre de la section qui l'entoure.
//
// Sont exclus : les éléments marqués data-nosearch (signature d'auteur,
// encarts d'appel à l'action, avertissements, sources, cours de démo) et les
// sections de liens (« Pour aller plus loin »…), qui matchaient toutes les
// requêtes sans y répondre.
//
// Deux pages ne sont pas pré-rendues (elles lisent la requête ou la session) :
// /simulateur et /backtest. Elles sont décrites dans PAGES_DYNAMIQUES
// ci-dessous. Toute AUTRE page du sitemap absente du build fait échouer le
// build : une page introuvable par la recherche doit être une décision, pas un
// oubli.

import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { parse } from "node-html-parser";

// ─── Dossier du build ────────────────────────────────────────────────────────
// next.config.ts écrit dans .next.nosync en local (iCloud) et dans .next dès
// que VERCEL est défini. Prendre « le premier qui existe » lisait un vieux
// .next.nosync après un `vercel build` local (constat du 28/09/2026) — et
// tester process.env.VERCEL ne suffit pas : un VERCEL=1 écrit dans .env.local
// est lu par Next, pas par ce script. On prend donc le build le plus récent,
// d'après la date de son BUILD_ID.
const DIST = [".next.nosync", ".next"]
  .filter((d) => existsSync(path.join(d, "server", "app", "sitemap.xml.body")))
  .map((d) => {
    const temoin = path.join(d, "BUILD_ID");
    const fichier = existsSync(temoin) ? temoin : path.join(d, "server", "app", "sitemap.xml.body");
    return { d, date: statSync(fichier).mtimeMs };
  })
  .sort((a, b) => b.date - a.date)[0]?.d;
if (!DIST) {
  console.error("✗ Index de recherche : aucun build trouvé (.next.nosync ni .next).");
  process.exit(1);
}
const APP = path.join(DIST, "server", "app");
const SORTIE = path.join("public", "search-index.json");

/**
 * Au-delà, une section est découpée en plusieurs passages. Pas tronquée :
 * au 28/09/2026, la troncature faisait perdre 8 % du texte du site (tout
 * « Points d'attention » de /etf/CW8, 37 % de /etf/RS2K, 84 % de
 * /comparer-etf). La limite sert l'extrait et le classement : un passage de
 * cette taille reste un « point précis » de la page.
 */
const MAX_TEXTE_SECTION = 1600;
/** Budget du fichier compressé — au-delà, le build échoue. */
const BUDGET_GZIP_KO = 450;

// ─── Mots-clés de notion ─────────────────────────────────────────────────────
// La page qui « possède » une notion. Au 28/09/2026, « frais » sortait
// /glossaire/ter au 29e rang, « PEA » /glossaire/pea au 13e, « monde »
// /etf-msci-world au 16e : les 21 titres « ETF X : frais et avis » et les
// pages longues l'emportaient en BM25, faute de lien entre la notion et sa
// page de référence. Ces mots vont dans le champ m, que le moteur indexe sur
// le PREMIER passage de la page seulement : les mettre dans k (recopié sur
// chaque passage) faisait sortir /glossaire/ter sur toute requête
// « frais + X » dès que X figurait quelque part dans la page.
//
// Le moteur découpe ces expressions en MOTS, chacun au poids 6 : « ETF
// S&P 500 » donnait le mot « etf » à /etf-sp500, et « etf » tout court
// sortait six pages de cette table devant le guide /investir-en-etf ;
// « PEA ou CTO » mettait /pea-ou-cto devant /glossaire/pea sur « PEA » ;
// « taux de rendement interne » donnait « rendement » et « taux » à
// /glossaire/tri (mesuré le 28/09/2026). Un mot générique ne va donc qu'à une
// page, et une expression déjà dans le titre de la page n'est pas répétée
// ici. De même, « covid » n'est pas donné à /backtest (la page
// /backtest-covid-2020 existe), ni « intérêts composés » à /simulateur
// (l'outil /interets-composes existe).
//
// Le build échoue si une clé n'est plus une page de l'index : une entrée
// orpheline serait une page de référence disparue sans que personne le voie.
const MOTS_CLES_PAGES = {
  "/glossaire/ter": ["frais", "frais de gestion", "frais courants", "TER"],
  "/comparatif": ["frais de courtage", "frais d'ordre", "courtier", "courtage"],
  "/glossaire/pea": ["PEA", "plan d'épargne en actions", "plafond PEA"],
  "/glossaire/cto": ["CTO", "compte-titres"],
  "/glossaire/pfu": ["PFU", "flat tax", "prélèvement forfaitaire unique"],
  "/etf-msci-world": ["monde", "MSCI World"],
  "/etf-sp500": ["S&P 500"],
  "/etf-nasdaq": ["Nasdaq", "Nasdaq 100"],
  "/glossaire/dca": ["DCA", "dollar cost averaging"],
  "/strategie-dca": ["DCA", "stratégie DCA"],
  "/meilleurs-etf-debutants": ["meilleur", "débutant", "premier"],
  "/pea-ou-cto": ["enveloppe"],
  "/calculateur-fiscal-pea-cto": ["impôt", "fiscalité", "calculateur fiscal"],
  "/simulateur-retraite": ["retraite", "rente"],
  "/interets-composes": ["intérêts composés"],
  "/allocation-portefeuille": ["allocation", "répartition", "diversification"],
  "/investir-en-etf": ["investir en ETF", "investir en bourse"],
  "/comparer-etf": ["comparateur", "liste"],
  "/glossaire/volatilite": ["volatilité"],
  "/glossaire/drawdown": ["drawdown", "perte maximale"],
  "/glossaire/replication-synthetique": ["swap", "réplication synthétique"],
  "/glossaire/replication-physique": ["réplication physique"],
  "/glossaire/capitalisant-distribuant": ["capitalisant", "distribuant", "dividendes"],
  "/glossaire/lump-sum": ["lump sum", "versement unique"],
  "/glossaire/rebalancing": ["rééquilibrage", "rebalancing"],
  "/glossaire/tri": ["TRI"],
  "/tarifs": ["tarif", "prix", "abonnement", "Premium"],
  "/produits/template-suivi-dca": ["Cockpit", "Excel", "Google Sheets", "tableur"],
  "/a-propos": ["à propos", "auteur"],
  "/methodologie": ["méthodologie", "formule"],
  "/transparence": ["affiliation", "partenaires"],
  "/glossaire": ["glossaire", "définitions", "lexique"],
  // Pages non pré-rendues : ces mots étaient dans k jusqu'au 28/09/2026 ; ce
  // sont des notions, pas des identifiants.
  "/simulateur": ["simulateur", "simulation", "calculer", "calculette", "projection"],
  "/backtest": ["backtest", "historique", "vrais cours", "données réelles", "performance passée", "krach", "2008"],
};

// Marque du courtier seule, dans k. Le slug découpé (« boursorama bourse »)
// mettait « bourse » au poids 6 sur toute la page Boursorama : « investir en
// bourse » la sortait devant /investir-en-etf.
// 28/09/2026 : la fiche affiche le nom actuel, BoursoBank ; l'ancien nom reste
// en mot-clé, parce que c'est encore celui que beaucoup de lecteurs tapent.
const MARQUES_COURTIERS = {
  "/comparatif/trade-republic": ["Trade Republic"],
  "/comparatif/boursorama-bourse": ["BoursoBank", "Boursorama"],
  "/comparatif/fortuneo": ["Fortuneo"],
};

// ─── Pages non pré-rendues ───────────────────────────────────────────────────
// Leur titre, leur description et leurs questions de FAQ (avec la réponse,
// quand elle est écrite en toutes lettres) sont LUS dans leur code source :
// écrits ici à la main, ils divergeraient au premier changement de texte. Le
// build échoue si la lecture ne trouve plus TITLE ou DESCRIPTION.
//
// Les sections décrivent ce que l'outil affiche une fois chargé, que le HTML
// ne contient pas. Leur titre `h` est le titre réellement affiché (vérifié le
// 28/09/2026) : c'est lui que le dialogue montre et qu'<AncresTitres />
// retrouve. `a` explicite quand l'ancre n'est pas ancre(h) : l'id du titre
// s'il en a un, ou "" quand le passage n'a pas de titre sur la page — le lien
// mène alors à la page seule. Au 28/09/2026, « Trois scénarios de marché »,
// « Période libre » et « Pire moment traversé » pointaient vers des ancres que
// rien ne portait : le lecteur arrivait en haut de page.
const PAGES_DYNAMIQUES = {
  "/simulateur": {
    source: "src/app/simulateur/page.tsx",
    s: [
      // h3 de SimulatorResults.tsx, rendu avec les résultats par défaut.
      { h: "3 scénarios comparés", x: "Scénario prudent, central et favorable autour du rendement choisi. Frais annuels de l'ETF retranchés du rendement. Inflation en option, montants en euros d'aujourd'hui." },
      // h2 id="tableau-annuel-titre" de TableauAnnuel.tsx.
      { h: "Votre simulation année par année", a: "tableau-annuel-titre", x: "Tableau du capital versé, de la valeur estimée et de la plus-value, année après année, pour la simulation en cours." },
    ],
  },
  "/backtest": {
    source: "src/app/backtest/page.tsx",
    s: [
      // h2 id="exemples-deja-calcules" de la page (30/09/2026). Ses chiffres
      // sont calculés au rendu : le passage les décrit sans les recopier.
      // Relecture du 30/09/2026 : le sigle TRI est expliqué ici comme sur la
      // page, et le repère de 2022 est le même que celui de la page.
      { h: "Exemples déjà calculés", x: "Trois DCA mensuels rejoués sur les cours réels du MSCI World en euros, jusqu'au dernier mois publié : départ en janvier 2010, en janvier 2020 juste avant le krach du COVID, et en janvier 2022 juste avant une année de baisse. Total versé, valeur finale, gain, rendement annuel (taux de rendement interne, ou TRI) et pire écart sous le total versé, en texte et en tableau, avec la date des cours et leur source." },
      // h2 de BacktestClient.tsx.
      { h: "Scénarios populaires", x: "DCA depuis 2010, DCA depuis le COVID, DCA depuis 2022, dix ans glissants." },
      // Ni l'un ni l'autre n'est un titre sur la page (« Période libre » est un
      // <strong> de l'encart Premium) : pas d'ancre.
      { h: "Période libre", a: "", x: "Choisissez votre montant mensuel et votre période, mois par mois, sur les vrais cours d'un ETF MSCI World en euros." },
      { h: "Pire moment traversé", a: "", x: "L'écart le plus défavorable entre la valeur du portefeuille et le total versé, et le recul de la valeur d'un sommet à un creux." },
    ],
  },
};

/**
 * Chaîne JS littérale ("…" ou `…`) → texte. Les \uXXXX d'abord (30/09/2026) :
 * les questions de /backtest écrivent l'espace insécable « \u00a0? », que la
 * règle générale changeait en « u00a0? » dans l'index et dans l'ancre.
 */
function litteral(s) {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\n/g, " ")
    .replace(/\\(.)/g, "$1");
}

/**
 * Lit TITLE, DESCRIPTION et les questions de FAQ ({ q: "…", a: "…" }) dans le
 * source d'une page. Une réponse qui interpole une valeur (${…}) n'est pas
 * reprise : la retirer laisserait « part par défaut de  % par an » dans
 * l'extrait, et la calculer ici dupliquerait le moteur du simulateur.
 */
function lireSource(fichier) {
  const src = readFileSync(fichier, "utf8");
  const chaine = (nom) => src.match(new RegExp(`const ${nom}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
  const t = chaine("TITLE");
  const d = chaine("DESCRIPTION");
  if (!t || !d) {
    console.error(
      `✗ Index de recherche : TITLE ou DESCRIPTION introuvable dans ${fichier}.\n` +
        "  La page n'est pas pré-rendue : son titre est lu dans le source. Adaptez lireSource().",
    );
    process.exit(1);
  }
  const faq = [...src.matchAll(/\bq:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => {
    const suite = src.slice(m.index + m[0].length);
    const r = suite.match(/^\s*,\s*a:\s*(?:`((?:[^`\\]|\\.)*)`|"((?:[^"\\]|\\.)*)")/);
    const reponse = r ? (r[1] ?? r[2]) : "";
    return {
      q: litteral(m[1]),
      a: reponse && !reponse.includes("${") ? espaces(litteral(reponse)) : "",
    };
  });
  return { t: litteral(t), d: litteral(d), faq };
}

// ─── Catégories ──────────────────────────────────────────────────────────────
function categorie(u) {
  if (u === "/") return "Accueil";
  if (u.startsWith("/etf/")) return "Fiche ETF";
  if (u.startsWith("/comparatif-etf/")) return "Comparatif ETF";
  if (u.startsWith("/comparatif/")) return "Courtier";
  if (u.startsWith("/glossaire/")) return "Glossaire";
  if (u.startsWith("/backtest")) return "Backtest";
  if (u.startsWith("/produits")) return "Ressource";
  if (
    [
      "/simulateur",
      "/simulateur-retraite",
      "/calculateur-fiscal-pea-cto",
      "/allocation-portefeuille",
      "/comparer-etf",
      "/donnees-marche",
      "/interets-composes",
    ].includes(u)
  )
    return "Outil";
  if (
    [
      "/a-propos",
      "/methodologie",
      "/transparence",
      "/changelog",
      "/mentions-legales",
      "/cgv",
      "/confidentialite",
      "/tarifs",
      "/communaute",
    ].includes(u)
  )
    return "Le site";
  return "Guide";
}

// Pages dont le texte n'aide pas à répondre à une question d'investissement :
// on n'indexe que leurs titres de section, pour qu'une recherche « frais » ne
// remonte pas les CGV avant les comparatifs.
const TITRES_SEULEMENT = new Set(["/cgv", "/mentions-legales", "/confidentialite", "/changelog"]);

// ─── Extraction ──────────────────────────────────────────────────────────────
const BLOCS = new Set([
  "p", "div", "section", "article", "li", "ul", "ol", "table", "tr",
  "dl", "dt", "dd", "blockquote", "figure", "figcaption", "header", "footer",
  "aside", "details", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
]);
// Fin de cellule de tableau. Une simple espace collait les nombres de deux
// cellules voisines, que la règle des milliers de normaliser() fusionnait :
// « krach de 2008 | 112 000 € » devenait 2008112000, et « 112 000 » ne
// trouvait plus la seule page qui l'affiche (28/09/2026). Un « · » n'est ni
// une espace ni un point : la fusion ne franchit plus la frontière, et
// l'extrait d'un tableau se lit mieux.
const CELLULES = new Set(["td", "th"]);
const SEP_CELLULE = "\u241E"; // provisoire, remplacé par « · » dans nettoyerTexte()
const IGNORES = new Set([
  "script", "style", "noscript", "svg", "nav", "button", "select", "option",
  "input", "textarea", "form", "template", "iframe",
]);

const espaces = (s) => s.replace(/\s+/g, " ").trim();

const COMMENTAIRE = 8;
const TEXTE = 3;
const ELEMENT = 1;

/**
 * Texte d'un élément, nœuds texte seulement (sans les commentaires, que
 * node-html-parser compte dans textContent) — comme le textContent du DOM.
 * `affiche` : le texte que le lecteur lit, sans les descendants
 * aria-hidden="true", et un <br> y sépare deux mots.
 */
function texteBrut(el, affiche) {
  let s = "";
  for (const n of el.childNodes) {
    if (n.nodeType === TEXTE) s += decode(n.rawText ?? "");
    else if (n.nodeType === ELEMENT) {
      if (affiche && n.getAttribute?.("aria-hidden") === "true") continue;
      if (affiche && n.tagName === "BR") s += " ";
      s += texteBrut(n, affiche);
    }
  }
  return s;
}

// Les flèches seulement (30/09/2026). La classe retirait aussi « » » et « › »,
// qui sont des guillemets fermants, pas des flèches : le H2 de
// /etf-eligibles-pea « Pourquoi un ETF « monde » ou « S&P 500 » peut entrer
// dans un PEA » sortait « Pourquoi un ETF « monde ou « S&P 500 peut… », et
// sept titres de l'index avaient un guillemet ouvrant orphelin. Le site
// n'emploie « » » ni « › » comme flèche nulle part. Les ancres n'en changent
// pas : ancre() remplace déjà toute ponctuation par un tiret (vérifié sur le
// build du 30/09/2026 : 7 titres corrigés, 0 ancre modifiée). Même classe que
// texteTitre() dans src/lib/search/ancre.ts.
const sansFleche = (s) => espaces(s.replace(/[▾▸▴►▼▲]/g, " "));

/**
 * Titre tel qu'affiché, sans la flèche des questions de FAQ ni les icônes
 * aria-hidden : au 28/09/2026, 17 fiches ETF affichaient « 📈Ce qu'il suit »
 * comme titre de passage.
 */
function titreAffiche(el) {
  return sansFleche(texteBrut(el, true));
}

/**
 * Texte d'où l'on calcule l'ancre : tout le textContent, icônes comprises,
 * exactement comme texteTitre() côté client (src/lib/search/ancre.ts), qui la
 * recalcule sur la page. Si l'un lisait les icônes et l'autre non, un
 * aria-hidden contenant des lettres ou des chiffres casserait le lien.
 */
function texteAncre(el) {
  return sansFleche(texteBrut(el, false));
}

/** Même calcul que ancre() dans src/lib/search/ancre.ts. */
function ancre(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

// Sections de navigation : des listes de liens vers d'autres pages. Titres
// COMPLETS, sous la forme normalisée par ancre() (l'apostrophe devient une
// espace). Au 28/09/2026, la regex n'était ancrée qu'au début : « Source des
// données affichée », une vraie section de l'accueil, disparaissait avec les
// « Sources ». Tout titre de liste de liens ajouté au site doit l'être ici —
// ou le bloc marqué data-nosearch.
//
// « Comparer avec d'autres ETF » (19 fiches ETF) : la liste des autres fonds
// sortait devant les pages pertinentes pour tout nom de fonds (« iShares Core
// MSCI World » : 5 bruits sur 8 résultats). L'exclure par son titre écarte
// aussi l'avertissement légal qui la suit jusqu'au titre suivant.
const SECTIONS_DE_LIENS = new RegExp(
  "^(?:" +
    [
      "pour aller plus loin",
      "continuez votre exploration",
      "voir aussi",
      "a lire aussi",
      "lire aussi",
      "sources?",
      "sources et references",
      "sources references", // « Sources & références »
      "references",
      "articles? lies",
      "guides? associes",
      "pages? associees",
      "comparer avec d autres etf",
      "tous les etf disponibles sur dca tracker",
    ].join("|") +
    ")$",
);

/**
 * Texte d'une section, prêt pour l'index : espaces normalisées, séparateurs
 * de cellules, et sans les espaces qu'ajoute la frontière d'un élément en
 * ligne devant la ponctuation (« depuis 2008</a>, krach » → « 2008 , krach »).
 * Les espaces devant « : ; ? ! % » sont gardées : elles sont correctes en
 * français.
 */
function nettoyerTexte(s) {
  const sep = SEP_CELLULE;
  return espaces(s)
    .replace(new RegExp(`${sep}(?:\\s*${sep})+`, "g"), sep) // cellules vides
    .replace(new RegExp(`^\\s*${sep}\\s*|\\s*${sep}\\s*$`, "g"), "")
    .replace(new RegExp(`\\s*${sep}\\s*`, "g"), " · ")
    .replace(/ ([.,)])/g, "$1")
    .replace(/\( /g, "(");
}

/**
 * Découpe un texte en passages de `max` caractères au plus, de tailles
 * voisines (1 617 caractères donnent deux passages d'environ 800, pas 1 600
 * et 17), coupés à une fin de phrase proche du milieu ; à défaut, à une
 * frontière de cellule ou à une espace.
 */
function decouperTexte(s, max) {
  const parts = [];
  let reste = s;
  while (reste.length > max) {
    const cible = reste.length / Math.ceil(reste.length / max);
    const i = pointDeCoupe(reste, cible, max);
    parts.push(bords(reste.slice(0, i)));
    reste = bords(reste.slice(i));
  }
  parts.push(reste);
  return parts;
}

/** Sans espace ni séparateur « · » aux bords d'un passage découpé. */
const bords = (s) => s.replace(/^[\s·]+|[\s·]+$/g, "");

function pointDeCoupe(s, cible, max) {
  const min = Math.floor(cible / 2);
  // Chaque motif donne l'index de fin du premier passage : juste après la
  // ponctuation, avant l'espace qui suit.
  const motifs = [/[.!?…][»"”)\]]*(?=\s)/g, /\s·(?=\s)/g, /\S(?=\s)/g];
  for (const motif of motifs) {
    let meilleur = -1;
    for (const m of s.matchAll(motif)) {
      const i = m.index + m[0].length;
      if (i > max) break;
      if (i >= min && (meilleur < 0 || Math.abs(i - cible) < Math.abs(meilleur - cible))) meilleur = i;
    }
    if (meilleur > 0) return meilleur;
  }
  return max;
}

/**
 * Parcourt <main> dans l'ordre du document et découpe en sections.
 * Un h1 ouvre la section d'introduction ; h2, h3 et <summary> (question de
 * FAQ) ouvrent chacun une nouvelle section.
 */
function sections(main) {
  const out = [];
  let courante = { h: "", a: "", morceaux: [] };
  // Nature du dernier nœud rencontré : "texte", "jointure" (le commentaire
  // <!-- --> qui suit un texte) ou "element".
  let dernier = "element";

  const fermer = () => {
    const x = nettoyerTexte(courante.morceaux.join(" "));
    if (SECTIONS_DE_LIENS.test(ancre(courante.h).replace(/-/g, " "))) return;
    // La suite d'une section après une question de FAQ n'a pas de titre à
    // elle : sans texte, elle ne serait qu'un doublon du titre.
    if (courante.suite ? x : courante.h || x) out.push({ h: courante.h, a: courante.a, x, suite: courante.suite });
  };

  // Au 28/09/2026, tout h3 d'une <section id> prenait l'id de la section : les
  // 4 h3 de /strategie-dca menaient au h2 en haut d'une section de 4 000
  // caractères. Seul le premier titre de la section, un h2, la représente ;
  // les autres reçoivent l'ancre calculée depuis leur texte.
  const ancreDe = (el) => {
    if (el.id) return el.id;
    if (el.tagName !== "H2") return "";
    // <section aria-labelledby="x"> … <h2 id="x"> : déjà couvert par el.id.
    let p = el.parentNode;
    for (let i = 0; p && i < 2; i++, p = p.parentNode) {
      if (p.tagName === "SECTION" && p.id) return p.querySelector("h2, h3") === el ? p.id : "";
    }
    return "";
  };

  const visiter = (noeud) => {
    if (noeud.nodeType === COMMENTAIRE) {
      // React sépare deux expressions JSX voisines par <!-- --> :
      // « 3<!-- --> an<!-- -->s ». Joindre ces textes par une espace donnait
      // « 3 an s » et « ( 25 100 € ) » dans les extraits (28/09/2026). Les
      // autres commentaires (<!--$-->, marqueurs de Suspense) séparent.
      dernier = noeud.rawText === " " && dernier === "texte" ? "jointure" : "element";
      return;
    }
    if (noeud.nodeType === TEXTE) {
      const t = noeud.rawText ? decode(noeud.rawText) : "";
      if (dernier === "jointure" && courante.morceaux.length) {
        courante.morceaux[courante.morceaux.length - 1] += t;
        dernier = "texte";
      } else if (t.trim()) {
        courante.morceaux.push(t);
        dernier = "texte";
      }
      return;
    }
    if (noeud.nodeType !== ELEMENT) return;
    dernier = "element";
    const tag = noeud.tagName?.toLowerCase();
    if (!tag || IGNORES.has(tag)) return;
    if (noeud.getAttribute?.("aria-hidden") === "true") return;
    if (noeud.hasAttribute?.("hidden")) return;
    if (noeud.hasAttribute?.("data-nosearch")) return;

    if (tag === "h1") {
      // Le h1 est le titre de la page : il reste dans l'introduction.
      courante.morceaux.push(titreAffiche(noeud), " ");
      return;
    }
    if (tag === "h2" || tag === "h3" || tag === "summary") {
      fermer();
      const h = titreAffiche(noeud);
      const a = (tag === "summary" ? "" : ancreDe(noeud)) || ancre(texteAncre(noeud));
      courante = { h, a, morceaux: [], question: tag === "summary" };
      return;
    }
    if (tag === "details") {
      // La réponse d'une question de FAQ s'arrête à </details>. Au 28/09/2026,
      // la dernière question de 19 pages récupérait tout ce qui suivait
      // jusqu'au titre suivant : appel à l'action, liste « Autres
      // comparatifs », mentions légales. La suite reprend le titre et
      // l'ancre de la section qui entoure la question.
      const avant = courante;
      for (const enfant of noeud.childNodes) visiter(enfant);
      if (courante !== avant && courante.question) {
        fermer();
        courante = { h: avant.h, a: avant.a, morceaux: [], suite: true };
      }
      courante.morceaux.push(" ");
      dernier = "element";
      return;
    }
    for (const enfant of noeud.childNodes) visiter(enfant);
    if (CELLULES.has(tag)) courante.morceaux.push(SEP_CELLULE);
    else if (BLOCS.has(tag)) courante.morceaux.push(" ");
    dernier = "element";
  };

  visiter(main);
  fermer();
  return out;
}

// node-html-parser laisse les entités dans rawText.
const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITES[n.toLowerCase()] ?? m);
}

const ISIN = /\b[A-Z]{2}[A-Z0-9]{9}\d\b/g;

/**
 * Identifiants exacts de la page (champ k, recopié sur chaque passage) :
 * ticker de la fiche, ISIN cités, tickers d'un comparatif, marque du
 * courtier. Rien d'autre : au 28/09/2026, les slugs découpés donnaient
 * « bourse », « msci », « world » et « sp500 » au poids 6 à toute une page,
 * et « s&p 500 » sortait /comparatif-etf/msci-world-vs-sp500 devant
 * /etf-sp500. Les notions vont dans MOTS_CLES_PAGES.
 */
function motsCles(u, texte, fiches) {
  const k = new Set();
  if (u.startsWith("/etf/")) k.add(u.slice(5));
  if (u.startsWith("/comparatif-etf/")) {
    // Seuls les tickers qui ont une fiche, plus ESE et GPEA (comparés sans
    // fiche ; GPEA depuis le 09/10/2026, /comparatif-etf/gpea-vs-dcam).
    for (const t of u.slice(16).split("-vs-").map((t) => t.toUpperCase())) {
      if (fiches.has(t) || t === "ESE" || t === "GPEA") k.add(t);
    }
  }
  if (u.startsWith("/comparatif/")) {
    if (MARQUES_COURTIERS[u]) for (const marque of MARQUES_COURTIERS[u]) k.add(marque);
    else
      console.warn(
        `⚠ Index de recherche : ${u} n'a pas de marque dans MARQUES_COURTIERS ` +
          "(scripts/build-search-index.mjs) — le courtier ne sera cherché que par son titre.",
      );
  }
  // Les ISIN cités par la page : chercher un ISIN doit mener à sa fiche, à
  // ses comparatifs et aux guides qui le donnent.
  for (const m of texte.match(ISIN) ?? []) k.add(m);
  return [...k];
}

function nettoyerTitre(t) {
  return espaces(t).replace(/\s*[—|-]\s*DCA ?Tracker\s*$/i, "");
}

/** Page de l'index, avec ses mots-clés de notion s'il y en a. */
function page(u, t, d, k, s) {
  const p = { u, t, d, c: categorie(u), k };
  if (MOTS_CLES_PAGES[u]) p.m = MOTS_CLES_PAGES[u];
  p.s = s;
  return p;
}

// ─── Programme ───────────────────────────────────────────────────────────────
const sitemap = readFileSync(path.join(APP, "sitemap.xml.body"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
  const p = new URL(m[1]).pathname.replace(/\/$/, "");
  return p || "/";
});
const fiches = new Set(urls.filter((u) => u.startsWith("/etf/")).map((u) => u.slice(5)));

const pages = [];
const manquantes = [];
let nbPassages = 0;

for (const u of urls) {
  if (PAGES_DYNAMIQUES[u]) {
    const p = PAGES_DYNAMIQUES[u];
    const { t, d, faq } = lireSource(p.source);
    const secs = [
      // Introduction : le haut de la page, où est l'outil. Au 28/09/2026, le
      // premier passage de /simulateur était « Votre simulation année par
      // année », sous le formulaire et les résultats : « simulation » y menait.
      { h: "", a: "", x: d },
      ...p.s.map((s) => ({ h: s.h, a: s.a ?? ancre(s.h), x: s.x })),
      ...faq.map(({ q, a }) => ({ h: q, a: ancre(q), x: a })),
    ];
    pages.push(page(u, t, d, [], secs));
    nbPassages += secs.length;
    continue;
  }
  const fichier = path.join(APP, u === "/" ? "index.html" : `${u.slice(1)}.html`);
  if (!existsSync(fichier)) {
    manquantes.push(u);
    continue;
  }
  // Commentaires gardés : ils disent où React a collé deux textes (voir
  // visiter()).
  const racine = parse(readFileSync(fichier, "utf8"), { comment: true });
  const robots = racine.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
  if (/noindex/i.test(robots)) continue;

  const titre = nettoyerTitre(racine.querySelector("title")?.textContent ?? u);
  const description = espaces(
    decode(racine.querySelector('meta[name="description"]')?.getAttribute("content") ?? ""),
  );
  const main = racine.querySelector("main");
  if (!main) {
    manquantes.push(`${u} (pas de <main>)`);
    continue;
  }
  const secs = [];
  for (const s of sections(main)) {
    if (TITRES_SEULEMENT.has(u)) {
      // Une suite n'apporte que du texte : son titre est déjà indexé.
      if (s.h && !s.suite) secs.push({ h: s.h, a: s.a, x: "" });
      continue;
    }
    // Section d'introduction sans titre ni texte : rien à chercher.
    if (!s.h && !s.x) continue;
    for (const x of decouperTexte(s.x, MAX_TEXTE_SECTION)) secs.push({ h: s.h, a: s.a, x });
  }
  nbPassages += secs.length;
  const texteComplet = secs.map((s) => `${s.h} ${s.x}`).join(" ");
  pages.push(page(u, titre, description, motsCles(u, texteComplet, fiches), secs));
}

if (manquantes.length) {
  console.error(
    `✗ Index de recherche : ${manquantes.length} page(s) du sitemap absentes du build :\n` +
      manquantes.map((m) => `   · ${m}`).join("\n") +
      "\n  Si la page est devenue dynamique, décrivez-la dans PAGES_DYNAMIQUES" +
      " (scripts/build-search-index.mjs).",
  );
  process.exit(1);
}

// Une entrée de table qui ne désigne plus une page de l'index est une page
// de référence disparue (renommée, retirée du sitemap, passée en noindex).
const indexees = new Set(pages.map((p) => p.u));
const orphelines = [
  ...Object.keys(MOTS_CLES_PAGES).map((u) => [u, "MOTS_CLES_PAGES"]),
  ...Object.keys(PAGES_DYNAMIQUES).map((u) => [u, "PAGES_DYNAMIQUES"]),
  ...Object.keys(MARQUES_COURTIERS).map((u) => [u, "MARQUES_COURTIERS"]),
].filter(([u]) => !indexees.has(u));
if (orphelines.length) {
  console.error(
    `✗ Index de recherche : ${orphelines.length} entrée(s) ne désignent aucune page de l'index :\n` +
      orphelines.map(([u, table]) => `   · ${u} (${table})`).join("\n") +
      "\n  Corrigez l'URL ou retirez l'entrée (scripts/build-search-index.mjs).",
  );
  process.exit(1);
}

const json = JSON.stringify({ v: 1, pages });
mkdirSync("public", { recursive: true });
writeFileSync(SORTIE, json);
const ko = (n) => Math.round(n / 1024);
const gz = gzipSync(json).length;
console.log(
  `✓ Index de recherche : ${pages.length} pages, ${nbPassages} passages — ` +
    `${ko(Buffer.byteLength(json))} Ko (${ko(gz)} Ko compressé) → ${SORTIE} (build ${DIST})`,
);
if (ko(gz) > BUDGET_GZIP_KO) {
  console.error(
    `✗ L'index compressé dépasse ${BUDGET_GZIP_KO} Ko : il est chargé par le navigateur à ` +
      "l'ouverture de la recherche. Passez des pages en TITRES_SEULEMENT ou marquez " +
      "data-nosearch les blocs qui ne répondent à aucune question.",
  );
  process.exit(1);
}
