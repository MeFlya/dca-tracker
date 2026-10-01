// /llms.txt — plan du site en texte brut, au format proposé sur llmstxt.org :
// un titre, une phrase de résumé, puis des sections de liens, chacun suivi
// d'une ligne de description.
//
// ─── Ce qu'on sait, et ce qu'on ne sait pas (30/09/2026) ────────────────────
//
// Ajouté après un relevé du 29/09/2026 (30 questions posées à ChatGPT, au mode
// IA de Google et à Copilot) : les assistants trouvent nos pages mais en citent
// d'autres. Soyons honnêtes sur la portée de ce fichier : llms.txt est une
// PROPOSITION de format, pas un standard, et rien n'établit qu'un de ces
// assistants le lise, ni qu'il pèse sur ce qu'ils citent. Aucun robot ne l'a
// réclamé dans nos journaux à cette date. On le publie parce qu'il ne coûte
// qu'un fichier généré, pas parce qu'on en attend un effet — ne pas compter
// dessus pour mesurer quoi que ce soit.
//
// ─── D'où vient chaque ligne ─────────────────────────────────────────────────
//
// Rien n'est recopié à la main, pour que ce fichier ne puisse pas diverger du
// site :
//   · la liste des URL est celle du sitemap servi (on appelle sa route) : une
//     page absente du sitemap n'apparaît pas ici, et toute page du sitemap
//     apparaît, au pire dans « Optional » ;
//   · titres et descriptions viennent des catalogues (histoires de backtest,
//     guides d'indice, comparatifs, courtiers, glossaire, produits, fiches
//     ETF) ;
//   · pour les pages écrites en TSX, on lit les littéraux `const TITLE = "…"`
//     et `const DESCRIPTION = "…"` de leur page.tsx, comme le fait déjà
//     l'index de recherche pour /simulateur et /backtest
//     (scripts/build-search-index.mjs, lireSource()). Importer ces modules
//     embarquerait leurs composants React dans une route qui n'en a pas
//     besoin. La route est statique : cette lecture a lieu au build, où les
//     sources sont présentes ;
//   · les deux outils portent en plus un résultat calculé par leur moteur ;
//   · les pages dont la description est un gabarit la reçoivent recomposée
//     avec leurs propres données (« Descriptions recomposées », 30/09/2026).
// Seuls le classement des pages en sections et un titre neutre
// (TITRES_NEUTRES) sont éditoriaux.
//
// Format : la syntaxe « - [titre](url): description » est celle de la
// proposition, deux-points collé au lien compris ; la typographie française
// vaut à l'intérieur des textes.

import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { GET as sitemap } from "@/app/sitemap.xml/route";
import { ETF_LIST, TER_REFERENCE_SIMULATEUR, type ETFConfig } from "@/lib/etf-config";
import { BROKER_LIST } from "@/lib/brokers";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";
import { GLOSSARY_TERM_LIST } from "@/lib/glossary-terms";
import { PRODUCT_LIST } from "@/lib/products";
import { INDEX_GUIDE_LIST } from "@/lib/etf-index-guides";
import { BACKTEST_STORY_LIST, getBacktestStory } from "@/lib/backtest-stories";
import { getAvailableRange, getDatasetMeta, formatEurBacktest, formatMonthFr } from "@/lib/backtest";
import { runSimulation, formatEur } from "@/lib/simulator";
import { paramsFromSearch } from "@/lib/simulation-params";
import {
  dateEnToutesLettres,
  DATE_VERIFICATION_PEA,
  estDansLaTable,
  ETF_PEA_VERIFIES,
  ETF_NON_ELIGIBLES,
  URL_LISTE_PEA,
} from "@/lib/etf-pea-verifies";

export const dynamic = "force-static";

const ORIGINE = "https://dcatracker.fr";
const NBSP = "\u00a0";
/** « 7 % », « 0,38 % » : virgule décimale, espace insécable avant le signe. */
const pc = (v: number) => `${v.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}${NBSP}%`;

type Entree = { titre: string; note?: string };

/**
 * Une entrée tient sur une ligne ; espace insécable avant « : ; ? ! % € » et
 * à l'intérieur des guillemets, comme sur les pages (certaines descriptions
 * lues dans les sources ont des espaces ordinaires).
 */
const uneLigne = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/ ([:;?!%€»])/g, `${NBSP}$1`)
    .replace(/« /g, `«${NBSP}`);

/** Littéral de chaîne TS entre guillemets doubles → texte (échappements \" \\ \uXXXX). */
function litteral(brut: string): string {
  try {
    return JSON.parse(`"${brut}"`) as string;
  } catch {
    return brut;
  }
}

/** Source de la page.tsx d'un chemin, ou undefined si elle n'existe pas. */
function sourcePage(chemin: string): string | undefined {
  try {
    const dossier = chemin === "/" ? "" : chemin.slice(1);
    return readFileSync(path.join(process.cwd(), "src", "app", dossier, "page.tsx"), "utf8");
  } catch {
    return undefined;
  }
}

/**
 * TITLE et DESCRIPTION écrits en clair dans une page.tsx. Une page qui les
 * assemble (gabarit `…${x}…`) n'est pas lue : on n'affiche pas un texte à
 * trous. Elle garde alors un titre tiré de son adresse.
 */
function lirePage(chemin: string): Partial<Entree> {
  const src = sourcePage(chemin);
  if (!src) return {};
  // Entre « = » et la chaîne, des blancs et des commentaires « // … » :
  // /meilleurs-etf-debutants explique sa description juste au-dessus d'elle.
  const chaine = (nom: string) =>
    src.match(new RegExp(`const ${nom}\\s*=(?:\\s|//[^\\n]*)*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
  const titre = chaine("TITLE");
  const description = chaine("DESCRIPTION");
  return {
    titre: titre ? litteral(titre) : undefined,
    note: description ? litteral(description) : undefined,
  };
}

// ─── Descriptions recomposées (30/09/2026) ──────────────────────────────────
//
// Cinq pages sortaient sans description (relecture du 30/09/2026) : leur
// DESCRIPTION est un gabarit, que lirePage() ne lit pas. On la recompose avec
// les mêmes données qu'elles, comme pour la liste PEA plus bas : aucun
// chiffre n'est recopié.

/**
 * /investir-100-euros-mois-etf et ses sœurs : le chiffre de leur description
 * (capital à 20 ans, arrondi à la centaine), recalculé par le moteur avec LEURS
 * paramètres, lus dans leur source (`const MENSUEL = 100;`,
 * `const RENDEMENT = 7;`, `const TER = TER_REFERENCE_SIMULATEUR;`). Si la page
 * change de forme, pas de chiffre plutôt qu'un chiffre qui diverge.
 */
function noteMontantMensuel(chemin: string): string | undefined {
  if (!/^\/investir-\d+-euros-mois-etf$/.test(chemin)) return undefined;
  const src = sourcePage(chemin);
  if (!src) return undefined;
  const nombre = (nom: string) => {
    const m = src.match(new RegExp(`const ${nom}\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*;`));
    return m ? Number(m[1]) : undefined;
  };
  const mensuel = nombre("MENSUEL");
  const rendement = nombre("RENDEMENT");
  if (!mensuel || !rendement || !/const TER\s*=\s*TER_REFERENCE_SIMULATEUR\s*;/.test(src)) return undefined;
  const ans = 20;
  const { base } = runSimulation({
    monthlyAmount: mensuel,
    durationYears: ans,
    annualReturnPct: rendement,
    annualFeesPct: TER_REFERENCE_SIMULATEUR,
  });
  const { min } = getAvailableRange();
  return (
    `Projection de ${formatEur(mensuel)} investis chaque mois en ETF : environ ${formatEur(Math.round(base.finalValue / 100) * 100)} après ${ans} ans ` +
    `pour ${formatEur(base.totalInvested)} versés, à ${pc(rendement)} par an avant frais et ${pc(TER_REFERENCE_SIMULATEUR)} de frais annuels. ` +
    "Une hypothèse, pas une prévision. La page donne aussi d'autres horizons, jusqu'à 30 ans, et ce qu'aurait donné le même versement " +
    `sur les cours réels d'un ETF MSCI World, pour plusieurs mois de départ depuis ${formatMonthFr(min)}.`
  );
}

/** /comparer-etf : sa DESCRIPTION interpole le nombre d'ETF (ETF_LIST.length). */
function noteComparerEtf(): string {
  return (
    `Les ${ETF_LIST.length} ETF suivis par le site côte à côte (monde, S&P 500, Nasdaq-100, émergents, Europe, Japon, petites capitalisations américaines, obligations d'État à court terme) : ` +
    "frais annuels (TER), éligibilité au PEA et cours indicatifs, avec des filtres par région, par éligibilité au PEA et par niveau de frais."
  );
}

/**
 * Titres de page qui ne passent pas tels quels dans ce fichier. Le <title> de
 * /comparatif (« Comparatif des meilleurs courtiers… ») est gelé côté SEO,
 * mais ce fichier est un texte neuf : il ne reprend pas le superlatif
 * (relecture du 30/09/2026).
 */
const TITRES_NEUTRES: Record<string, string> = {
  "/comparatif": "Comparatif des courtiers pour un DCA en ETF",
};

/** Rappel joint à toute ligne qui porte un résultat de backtest. */
const PERFORMANCES_PASSEES = "Les performances passées ne préjugent pas des performances futures.";

// ─── Les deux outils : un résultat calculé, pas une promesse ────────────────

function noteSimulateur(): string {
  const d = paramsFromSearch(new URLSearchParams()).input;
  const r = runSimulation({ ...d, annualInflationPct: undefined });
  return (
    "Projection d'un versement mensuel en ETF, intérêts composés et frais annuels de l'ETF déduits ; gratuit, sans inscription, sans calcul de l'impôt. " +
    `Réglages par défaut : ${formatEur(d.monthlyAmount)} par mois pendant ${d.durationYears} ans (${formatEur(r.base.totalInvested)} versés), ` +
    `${pc(d.annualReturnPct)} par an avant frais, ${pc(d.annualFeesPct)} de frais annuels : ${formatEur(r.base.finalValue)} estimés. Une hypothèse, pas une prévision.`
  );
}

function noteBacktest(): string {
  const { min, max } = getAvailableRange();
  const meta = getDatasetMeta();
  const { def, result } = getBacktestStory("backtest-depuis-2010");
  return (
    `DCA mensuel rejoué sur les cours de clôture réels d'un ETF MSCI World en euros, de ${formatMonthFr(min)} à ${formatMonthFr(max)} (relevés le ${dateEnToutesLettres(meta.fetchedAt)}). ` +
    `Exemple publié : ${formatEurBacktest(def.monthlyAmount)} par mois depuis ${formatMonthFr(def.startMonth)}, ${formatEurBacktest(result.totalInvested)} versés, ${formatEurBacktest(result.finalValue)} en ${formatMonthFr(max)}. ` +
    "Exemples en accès libre ; l'outil qui rejoue votre montant et votre période est réservé à l'abonnement Premium. " +
    PERFORMANCES_PASSEES
  );
}

/**
 * Relecture du 30/09/2026 : l'ISIN n'est imprimé que pour un fonds de la table
 * de vérité. Celui de SPY n'a pas été recoupé (fait non-pea-us-sans-dic : « ne
 * pas l'imprimer sans vérification ») et sa fiche le dit. Le même fait parle
 * des particuliers de l'Espace économique européen, pas de l'Union
 * européenne ; « en principe », comme la description du fonds dans
 * etf-config.ts : l'absence de DIC n'a pas été recontrôlée chez l'émetteur.
 */
function noteFiche(e: ETFConfig): string {
  const pea = e.peaEligible
    ? "éligible au PEA"
    : e.sansDicUE
      ? "fonds domicilié aux États-Unis, sans document d'informations clés (DIC) : en principe non commercialisé auprès des particuliers de l'Espace économique européen"
      : "non éligible au PEA";
  const isin = e.isin && estDansLaTable(e.displaySymbol) ? ` ; ISIN ${e.isin}` : "";
  return `${e.name}. Indice : ${e.indexLabel}${isin} ; ${pea}.`;
}

// ─── Sections ────────────────────────────────────────────────────────────────

type Section = { titre: string; chemins: string[] };

const SECTIONS: Section[] = [
  {
    titre: "Outils",
    chemins: [
      "/simulateur",
      "/backtest",
      "/calculateur-fiscal-pea-cto",
      "/simulateur-retraite",
      "/interets-composes",
      "/allocation-portefeuille",
      "/comparer-etf",
    ],
  },
  { titre: "Backtests publiés", chemins: BACKTEST_STORY_LIST.map((s) => `/${s.slug}`) },
  {
    titre: "Choisir un ETF",
    chemins: [
      URL_LISTE_PEA,
      "/meilleurs-etf-debutants",
      ...INDEX_GUIDE_LIST.map((g) => `/${g.slug}`),
      "/comparatif-etf",
      ...ETF_COMPARISON_LIST.map((c) => `/comparatif-etf/${c.slug}`),
    ],
  },
  { titre: "Fiches ETF", chemins: ETF_LIST.map((e) => `/etf/${e.displaySymbol}`) },
  { titre: "Courtiers", chemins: ["/comparatif", ...BROKER_LIST.map((b) => `/comparatif/${b.slug}`)] },
  {
    titre: "Comprendre le DCA et la fiscalité",
    chemins: [
      "/strategie-dca",
      "/investir-en-etf",
      "/pea-ou-cto",
      "/fiscalite-pea-cto-2026",
      "/suivi-pea-excel",
      ...[100, 200, 300, 500].map((m) => `/investir-${m}-euros-mois-etf`),
    ],
  },
  {
    titre: "Glossaire",
    chemins: [
      "/glossaire",
      "/glossaire/dca",
      "/glossaire/etf",
      "/glossaire/interets-composes",
      ...GLOSSARY_TERM_LIST.map((t) => `/glossaire/${t.slug}`),
    ],
  },
  {
    titre: "Ressources payantes",
    chemins: ["/produits", ...PRODUCT_LIST.map((p) => `/produits/${p.slug}`), "/guide-5-etf-pea-premium", "/tarifs"],
  },
  { titre: "Le site", chemins: ["/a-propos", "/methodologie", "/transparence", "/changelog"] },
];

/** Titre et description d'une page : catalogue d'abord, puis sa page.tsx. */
function entree(chemin: string): Entree {
  const story = BACKTEST_STORY_LIST.find((s) => `/${s.slug}` === chemin);
  if (story) {
    const { def, result } = getBacktestStory(story.slug);
    return { titre: def.h1, note: `${def.metaDescription(result)} ${PERFORMANCES_PASSEES}` };
  }
  const guide = INDEX_GUIDE_LIST.find((g) => `/${g.slug}` === chemin);
  if (guide) return { titre: guide.h1, note: guide.metaDescription };
  const duel = ETF_COMPARISON_LIST.find((c) => `/comparatif-etf/${c.slug}` === chemin);
  if (duel) return { titre: duel.title, note: duel.metaDescription };
  const courtier = BROKER_LIST.find((b) => `/comparatif/${b.slug}` === chemin);
  if (courtier) return { titre: courtier.name, note: courtier.metaDescription };
  const terme = GLOSSARY_TERM_LIST.find((t) => `/glossaire/${t.slug}` === chemin);
  if (terme) return { titre: terme.term, note: terme.shortDef };
  const produit = PRODUCT_LIST.find((p) => `/produits/${p.slug}` === chemin);
  if (produit) return { titre: produit.name, note: produit.metaDescription };
  if (chemin === URL_LISTE_PEA) {
    // Titre et description de la page sont des gabarits (lirePage ne les lit
    // pas) : on les recompose avec les mêmes données qu'elle.
    const verifie = dateEnToutesLettres(DATE_VERIFICATION_PEA);
    return {
      titre: "ETF éligibles au PEA : la liste vérifiée",
      note: `${ETF_PEA_VERIFIES.length} ETF éligibles au PEA vérifiés un par un le ${verifie} (ISIN, frais), et ${ETF_NON_ELIGIBLES.length} fonds qui ne le sont pas.`,
    };
  }
  const fiche = ETF_LIST.find((e) => `/etf/${e.displaySymbol}` === chemin);
  if (fiche) return { titre: `${fiche.displaySymbol} — ${fiche.indexLabel}`, note: noteFiche(fiche) };

  const page = lirePage(chemin);
  const titre = TITRES_NEUTRES[chemin] ?? page.titre ?? (chemin === "/" ? "Accueil" : chemin.slice(1));
  if (chemin === "/simulateur") return { titre, note: noteSimulateur() };
  if (chemin === "/backtest") return { titre, note: noteBacktest() };
  if (chemin === "/comparer-etf") return { titre, note: page.note ?? noteComparerEtf() };
  return { titre, note: page.note ?? noteMontantMensuel(chemin) };
}

function ligne(chemin: string): string {
  const { titre, note } = entree(chemin);
  const url = `${ORIGINE}${chemin === "/" ? "" : chemin}`;
  return `- [${uneLigne(titre)}](${url})${note ? `: ${uneLigne(note)}` : ""}`;
}

export async function GET(): Promise<NextResponse> {
  // Les URL du sitemap servi, en chemins (« https://dcatracker.fr/x » → « /x »).
  const xml = await (await sitemap()).text();
  const duSitemap = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
      const p = new URL(m[1]).pathname.replace(/\/$/, "");
      return p || "/";
    }),
  );

  const places = new Set<string>();
  const blocs: string[] = [];
  for (const s of SECTIONS) {
    const chemins = s.chemins.filter((c) => duSitemap.has(c) && !places.has(c));
    if (chemins.length === 0) continue;
    chemins.forEach((c) => places.add(c));
    blocs.push(`## ${s.titre}\n\n${chemins.map(ligne).join("\n")}`);
  }
  // Tout ce que le sitemap publie et qu'aucune section ne range : rien ne
  // disparaît en silence.
  const reste = [...duSitemap].filter((c) => !places.has(c)).sort();
  if (reste.length > 0) blocs.push(`## Optional\n\n${reste.map(ligne).join("\n")}`);

  const { max } = getAvailableRange();
  const texte = [
    "# DCA Tracker",
    "",
    // Sigles expliqués à leur première apparition (relecture du 30/09/2026).
    `> ${uneLigne("Site français d'outils et de guides sur l'investissement programmé (DCA) en ETF, des fonds indiciels cotés en bourse : simulateur, backtest (un DCA rejoué sur les cours réels du MSCI World), fiscalité du PEA (plan d'épargne en actions) et du compte-titres, fiches ETF et courtiers. Outil pédagogique : il décrit et compare, il ne donne pas de conseil en investissement.")}`,
    "",
    uneLigne(`Auteur : Maël Faleyras (${ORIGINE}/a-propos). Les backtests s'arrêtent au dernier mois de cours publié, ${formatMonthFr(max)}.`),
    "",
    blocs.join("\n\n"),
    "",
  ].join("\n");

  return new NextResponse(texte, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
