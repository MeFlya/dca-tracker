import { NextResponse } from "next/server";
import { ETF_LIST } from "@/lib/etf-config";
import { BROKER_LIST } from "@/lib/brokers";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";
import { GLOSSARY_TERM_LIST } from "@/lib/glossary-terms";
import { PRODUCT_LIST } from "@/lib/products";
import { INDEX_GUIDES } from "@/lib/etf-index-guides";
import { BACKTEST_STORY_LIST, storyUpdatedAt, backtestUpdatedAt } from "@/lib/backtest-stories";
import { getDatasetMeta } from "@/lib/backtest";
import { MAJ_LISTE_PEA, URL_LISTE_PEA } from "@/lib/etf-pea-verifies";
import { FICHES_ETF_MAJ_LE } from "@/lib/sources-etf";

export const dynamic = "force-static";

// ─── Dates de dernière révision de contenu (YYYY-MM-DD) ───────────────────────
//
// IMPORTANT : ces dates reflètent la dernière modification RÉELLE du contenu
// d'une page — pas la date de déploiement. C'est ce qui rend le <lastmod>
// fiable pour Google : avant, on mettait `new Date()` partout → toutes les
// URLs apparaissaient "modifiées" à chaque build, ce qui pousse Google à
// ignorer le signal lastmod (jugé non fiable).
//
// ⚠️ Recalées le 28/09/2026, pour la deuxième fois. Le 28/09, une soixantaine
// de pages ont été corrigées (fonds non éligibles présentés comme éligibles
// au PEA, ISIN et frais faux) ; le sitemap annonçait encore le 3 ou le 5 août
// pour chacune d'elles. Google recrawle d'abord ce qu'on lui dit avoir changé :
// c'est quand une correction est urgente que la date compte le plus.
//
// Le recalage a été fait page par page, à partir du dernier commit touchant la
// page OU un module qu'elle importe (hors navigation, analytics, utilitaires
// de mise en forme). Il a aussi RECULÉ des dates : la catégorie « evergreen »
// déclarait le 3 août pour le glossaire, /communaute ou /glossaire/dca, qui
// n'avaient pas bougé depuis avril-juin.
//
// Pour ne plus dépendre d'un bump manuel, les collections qui portent leur
// propre date (courtiers, comparatifs, guides d'indice, termes du glossaire)
// la fournissent directement — c'est la même que celle affichée dans la
// byline et déclarée en dateModified. Les pages dont les chiffres sont
// recalculés sur la série de cours réelle prennent aussi la date de
// rafraîchissement de la série (cron mensuel) : leurs montants changent.
//
// Pour vérifier une date :
// `git log -1 --format=%ad --date=short -- <page> <modules qu'elle importe>`.
const REV = {
  // table de vérité ETF (24 fonds vérifiés par deux familles de sources),
  // cheat sheet corrigée, frais par défaut du simulateur alignés sur le moteur,
  // « ce qu'auraient donné » sur les vrais cours, tableau année par année
  etf: "2026-09-28",
  // /meilleurs-etf-debutants, /calculateur-fiscal-pea-cto, /pea-ou-cto :
  // révisées le 30/09/2026 après le relevé des citations IA du 29/09. Même
  // date que leur byline. Les fiches ETF et les comparatifs portent leur
  // propre date. Relecture du 30/09/2026 : le commentaire disait « la réponse
  // d'abord » pour les trois, ce que le sous-titre de /pea-ou-cto ne faisait
  // pas ; la date, elle, reste juste (la page a bien été modifiée ce jour-là).
  reponseDabord: "2026-09-30",
  // /fiscalite-pea-cto-2026 : publiée le 30/09/2026 (hausse des prélèvements
  // sociaux, PFU à 31,4 %, ce qui reste à 17,2 %). Même date que sa byline.
  fiscalite2026: "2026-09-30",
  // /suivi-pea-excel : publiée le 01/10/2026 (méthode, formules, modèle
  // gratuit). Même date que sa byline.
  suiviPeaExcel: "2026-10-01",
  // taux fiscaux 2026
  methodologie: "2026-08-03",
  // pages Ressources refaites, Cockpit v2.0 et guide v1.1 (01/10/2026)
  produits: "2026-10-01",
  // Vercel Web Analytics remplace Plausible (mention dans la page)
  analytics: "2026-08-23",
  // /confidentialite : page d'origine jointe aux achats (3.3 et 4), puis le
  // modèle de suivi gratuit (3.5 et 4), puis la liste d'opposition après
  // désinscription (5). Même date que « Dernière mise à jour » affichée dans
  // la page (02/10/2026).
  confidentialite: "2026-10-02",
  // entrée de changelog sur la régression de série du 2 août ; partenariats
  affiliation: "2026-08-04",
  cgv: "2026-10-01",
  // /changelog : corrections du TRI du Cockpit et de la mention de TVA
  changelog: "2026-10-01",
  glossaireHub: "2026-06-10",
  glossaireDca: "2026-05-09",
  // /glossaire/interets-composes et /communaute
  inchangeesDepuisAvril: "2026-04-24",
  // /simulateur : introduction avec un exemple calculé par le moteur, rendue
  // dans <main> sans JavaScript (30/09/2026). Même date que sa byline
  // (SIMULATEUR_REVISE_LE dans la page).
  simulateur: "2026-09-30",
} as const;

/** La plus récente de plusieurs dates YYYY-MM-DD (l'ordre lexical suffit). */
const plusRecente = (...dates: string[]) => dates.reduce((a, b) => (b > a ? b : a));

// Les chiffres de ces pages sont recalculés sur la série publiée : chaque
// rafraîchissement mensuel change leurs montants.
const SERIE = getDatasetMeta().fetchedAt;

type PageEntry = {
  url: string;
  changeFreq: string;
  priority: number;
  lastmod: string;
};

export async function GET(): Promise<NextResponse> {
  const base = "https://dcatracker.fr";

  const pages: PageEntry[] = [
    { url: base,                               changeFreq: "weekly",  priority: 1.0,  lastmod: REV.etf },
    { url: `${base}/simulateur`,               changeFreq: "weekly",  priority: 0.9,  lastmod: REV.simulateur },
    // Exemples publiés et FAQ ajoutés le 30/09/2026 : la date est celle de la
    // byline de la page, qui suit aussi le rafraîchissement de la série.
    { url: `${base}/backtest`,                 changeFreq: "monthly", priority: 0.85, lastmod: backtestUpdatedAt() },
    ...BACKTEST_STORY_LIST.map((s) => ({
      url: `${base}/${s.slug}`,
      changeFreq: "monthly",
      priority: 0.8,
      lastmod: storyUpdatedAt(),
    })),
    ...[100, 200, 300, 500].map((m) => ({
      url: `${base}/investir-${m}-euros-mois-etf`,
      changeFreq: "monthly",
      priority: 0.9,
      // bloc « ce qu'auraient donné N €/mois » calculé sur la série publiée
      lastmod: plusRecente(REV.etf, SERIE),
    })),
    { url: `${base}/meilleurs-etf-debutants`,  changeFreq: "monthly", priority: 0.9,  lastmod: REV.reponseDabord },
    ...Object.values(INDEX_GUIDES).map((g) => ({
      url: `${base}/${g.slug}`,
      changeFreq: "monthly",
      priority: g.slug === "etf-nasdaq" ? 0.85 : 0.9,
      lastmod: g.updatedAt,
    })),
    { url: `${base}/strategie-dca`,            changeFreq: "monthly", priority: 0.9,  lastmod: REV.etf },
    { url: `${base}/interets-composes`,        changeFreq: "monthly", priority: 0.85, lastmod: REV.etf },
    { url: `${base}/pea-ou-cto`,               changeFreq: "monthly", priority: 0.85, lastmod: REV.reponseDabord },
    { url: `${base}/fiscalite-pea-cto-2026`,   changeFreq: "monthly", priority: 0.85, lastmod: REV.fiscalite2026 },
    { url: `${base}/suivi-pea-excel`,          changeFreq: "monthly", priority: 0.85, lastmod: REV.suiviPeaExcel },
    // Liste vérifiée des ETF éligibles au PEA (29/09/2026) : sa date vient de
    // son module de données, la même que celle de la byline.
    { url: `${base}${URL_LISTE_PEA}`,          changeFreq: "monthly", priority: 0.9,  lastmod: MAJ_LISTE_PEA },
    { url: `${base}/guide-5-etf-pea-premium`,  changeFreq: "monthly", priority: 0.9,  lastmod: REV.etf },
    { url: `${base}/calculateur-fiscal-pea-cto`, changeFreq: "monthly", priority: 0.9, lastmod: REV.reponseDabord },
    { url: `${base}/allocation-portefeuille`,  changeFreq: "monthly", priority: 0.85, lastmod: REV.etf },
    { url: `${base}/investir-en-etf`,          changeFreq: "monthly", priority: 0.85, lastmod: REV.etf },
    { url: `${base}/comparer-etf`,             changeFreq: "weekly",  priority: 0.8,  lastmod: REV.etf },
    { url: `${base}/donnees-marche`,           changeFreq: "daily",   priority: 0.6,  lastmod: REV.etf },
    { url: `${base}/tarifs`,                   changeFreq: "monthly", priority: 0.8,  lastmod: REV.etf },
    { url: `${base}/produits`,                 changeFreq: "monthly", priority: 0.8,  lastmod: REV.produits },
    ...PRODUCT_LIST.map((p) => ({
      url: `${base}/produits/${p.slug}`,
      changeFreq: "monthly",
      priority: 0.8,
      lastmod: REV.produits,
    })),
    { url: `${base}/a-propos`,                 changeFreq: "monthly", priority: 0.6,  lastmod: REV.analytics },
    { url: `${base}/methodologie`,             changeFreq: "monthly", priority: 0.5,  lastmod: REV.methodologie },
    { url: `${base}/transparence`,             changeFreq: "monthly", priority: 0.5,  lastmod: REV.affiliation },
    { url: `${base}/changelog`,                changeFreq: "monthly", priority: 0.4,  lastmod: REV.changelog },
    { url: `${base}/mentions-legales`,         changeFreq: "yearly",  priority: 0.3,  lastmod: REV.analytics },
    { url: `${base}/cgv`,                      changeFreq: "yearly",  priority: 0.3,  lastmod: REV.cgv },
    { url: `${base}/confidentialite`,          changeFreq: "yearly",  priority: 0.3,  lastmod: REV.confidentialite },
    { url: `${base}/simulateur-retraite`,      changeFreq: "monthly", priority: 0.9,  lastmod: REV.etf },
    { url: `${base}/communaute`,               changeFreq: "weekly",  priority: 0.6,  lastmod: REV.inchangeesDepuisAvril },
    { url: `${base}/glossaire`,                changeFreq: "monthly", priority: 0.7,  lastmod: REV.glossaireHub },
    { url: `${base}/glossaire/dca`,            changeFreq: "monthly", priority: 0.8,  lastmod: REV.glossaireDca },
    { url: `${base}/glossaire/etf`,            changeFreq: "monthly", priority: 0.8,  lastmod: REV.etf },
    { url: `${base}/glossaire/interets-composes`, changeFreq: "monthly", priority: 0.8, lastmod: REV.inchangeesDepuisAvril },
    ...GLOSSARY_TERM_LIST.map((t) => ({
      url: `${base}/glossaire/${t.slug}`,
      changeFreq: "monthly",
      priority: 0.7,
      lastmod: t.updatedAt,
    })),
    { url: `${base}/comparatif`,               changeFreq: "monthly", priority: 0.8,  lastmod: plusRecente(...BROKER_LIST.map((b) => b.updatedAt)) },
    ...BROKER_LIST.map((b) => ({
      url: `${base}/comparatif/${b.slug}`,
      changeFreq: "monthly",
      priority: 0.8,
      lastmod: b.updatedAt,
    })),
    { url: `${base}/comparatif-etf`,           changeFreq: "monthly", priority: 0.8,  lastmod: REV.etf },
    ...ETF_COMPARISON_LIST.map((c) => ({
      url: `${base}/comparatif-etf/${c.slug}`,
      changeFreq: "monthly",
      priority: 0.8,
      lastmod: c.updatedAt,
    })),
    ...ETF_LIST.map((etf) => ({
      url: `${base}/etf/${etf.displaySymbol}`,
      changeFreq: "weekly",
      priority: 0.7,
      // Même date que la byline des fiches (sources-etf.ts).
      lastmod: FICHES_ETF_MAJ_LE,
    })),
  ];

  const urlEntries = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n    <changefreq>${p.changeFreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
