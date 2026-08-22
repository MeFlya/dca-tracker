import { NextResponse } from "next/server";
import { ETF_LIST } from "@/lib/etf-config";
import { BROKER_LIST } from "@/lib/brokers";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";
import { GLOSSARY_TERM_LIST } from "@/lib/glossary-terms";
import { PRODUCT_LIST } from "@/lib/products";

export const dynamic = "force-static";

// ─── Dates de dernière révision de contenu (YYYY-MM-DD) ───────────────────────
//
// IMPORTANT : ces dates reflètent la dernière modification RÉELLE du contenu
// d'une page — pas la date de déploiement. À bumper manuellement quand on
// modifie vraiment le contenu d'une catégorie. C'est ce qui rend le <lastmod>
// fiable pour Google : avant, on mettait `new Date()` partout → toutes les
// URLs apparaissaient "modifiées" à chaque build, ce qui pousse Google à
// ignorer le signal lastmod (jugé non fiable).
// ⚠️ Recalées le 22/08/2026 : elles annonçaient mai et juin alors qu'une
// douzaine de pages avaient été modifiées début août. Le sitemap disait donc à
// Google que rien n'avait bougé, au moment précis où on avait besoin qu'il
// repasse. Une date de révision est une affirmation factuelle : ne bumper que
// ce qui a réellement changé, et le vérifier avec
// `git log -1 --format=%ad --date=short -- <fichiers de la catégorie>`.
const REV = {
  // taux fiscaux 2026 appliqués par produit (18,6 % titres, 17,2 % maintenu ailleurs)
  ymyl: "2026-08-03",
  // série backtest étendue à janvier 2008, verdicts retirés des pages qui ne les démontrent pas
  newFeature: "2026-08-05",
  // titre du simulateur raccourci, « Ressources » en navigation, prix unifiés
  tools: "2026-08-22",
  // bloc de fin menant à la sauvegarde de plan sur les pages « investir X €/mois »
  longtail: "2026-08-03",
  // inchangées depuis juin — recalées sur leur dernière modification réelle
  legal: "2026-06-11",
  // dates réelles par courtier, FAQ ouvertes et ancrées
  evergreen: "2026-08-03",
  // inchangées depuis juillet — recalées sur leur dernière modification réelle
  market: "2026-07-29",
  // entrée de changelog sur la régression de série du 2 août
  affiliation: "2026-08-04",
} as const;

type PageEntry = {
  url: string;
  changeFreq: string;
  priority: number;
  lastmod: string;
};

export async function GET(): Promise<NextResponse> {
  const base = "https://dcatracker.fr";

  const pages: PageEntry[] = [
    { url: base,                               changeFreq: "weekly",  priority: 1.0,  lastmod: REV.tools },
    { url: `${base}/simulateur`,               changeFreq: "weekly",  priority: 0.9,  lastmod: REV.tools },
    { url: `${base}/backtest`,                 changeFreq: "monthly", priority: 0.85, lastmod: REV.newFeature },
    { url: `${base}/backtest-covid-2020`,      changeFreq: "monthly", priority: 0.8,  lastmod: REV.ymyl },
    { url: `${base}/backtest-2022-inflation`,  changeFreq: "monthly", priority: 0.8,  lastmod: REV.ymyl },
    { url: `${base}/backtest-depuis-2010`,     changeFreq: "monthly", priority: 0.8,  lastmod: REV.ymyl },
    { url: `${base}/investir-100-euros-mois-etf`, changeFreq: "monthly", priority: 0.9, lastmod: REV.longtail },
    { url: `${base}/investir-200-euros-mois-etf`, changeFreq: "monthly", priority: 0.9, lastmod: REV.longtail },
    { url: `${base}/investir-300-euros-mois-etf`, changeFreq: "monthly", priority: 0.9, lastmod: REV.longtail },
    { url: `${base}/investir-500-euros-mois-etf`, changeFreq: "monthly", priority: 0.9, lastmod: REV.longtail },
    { url: `${base}/meilleurs-etf-debutants`,  changeFreq: "monthly", priority: 0.9,  lastmod: REV.ymyl },
    { url: `${base}/etf-msci-world`,           changeFreq: "monthly", priority: 0.9,  lastmod: REV.newFeature },
    { url: `${base}/etf-sp500`,                changeFreq: "monthly", priority: 0.9,  lastmod: REV.newFeature },
    { url: `${base}/etf-nasdaq`,               changeFreq: "monthly", priority: 0.85, lastmod: REV.newFeature },
    { url: `${base}/strategie-dca`,            changeFreq: "monthly", priority: 0.9,  lastmod: REV.ymyl },
    { url: `${base}/interets-composes`,        changeFreq: "monthly", priority: 0.85, lastmod: REV.ymyl },
    { url: `${base}/pea-ou-cto`,               changeFreq: "monthly", priority: 0.85, lastmod: REV.ymyl },
    { url: `${base}/guide-5-etf-pea-premium`,  changeFreq: "monthly", priority: 0.9,  lastmod: REV.ymyl },
    { url: `${base}/calculateur-fiscal-pea-cto`, changeFreq: "monthly", priority: 0.9, lastmod: REV.longtail },
    { url: `${base}/allocation-portefeuille`,  changeFreq: "monthly", priority: 0.85, lastmod: REV.longtail },
    { url: `${base}/investir-en-etf`,          changeFreq: "monthly", priority: 0.85, lastmod: REV.longtail },
    { url: `${base}/comparer-etf`,             changeFreq: "weekly",  priority: 0.8,  lastmod: REV.market },
    { url: `${base}/donnees-marche`,           changeFreq: "daily",   priority: 0.6,  lastmod: REV.market },
    { url: `${base}/tarifs`,                   changeFreq: "monthly", priority: 0.8,  lastmod: REV.tools },
    { url: `${base}/produits`,                 changeFreq: "monthly", priority: 0.8,  lastmod: REV.ymyl },
    ...PRODUCT_LIST.map((p) => ({
      url: `${base}/produits/${p.slug}`,
      changeFreq: "monthly",
      priority: 0.8,
      lastmod: REV.ymyl,
    })),
    { url: `${base}/a-propos`,                 changeFreq: "monthly", priority: 0.6,  lastmod: REV.affiliation },
    { url: `${base}/methodologie`,             changeFreq: "monthly", priority: 0.5,  lastmod: REV.ymyl },
    { url: `${base}/transparence`,             changeFreq: "monthly", priority: 0.5,  lastmod: REV.affiliation },
    { url: `${base}/changelog`,                changeFreq: "monthly", priority: 0.4,  lastmod: REV.affiliation },
    { url: `${base}/mentions-legales`,         changeFreq: "yearly",  priority: 0.3,  lastmod: REV.legal },
    { url: `${base}/cgv`,                      changeFreq: "yearly",  priority: 0.3,  lastmod: REV.legal },
    { url: `${base}/confidentialite`,          changeFreq: "yearly",  priority: 0.3,  lastmod: REV.legal },
    { url: `${base}/simulateur-retraite`,      changeFreq: "monthly", priority: 0.9,  lastmod: REV.longtail },
    { url: `${base}/communaute`,               changeFreq: "weekly",  priority: 0.6,  lastmod: REV.evergreen },
    { url: `${base}/glossaire`,                changeFreq: "monthly", priority: 0.7,  lastmod: REV.evergreen },
    { url: `${base}/glossaire/dca`,            changeFreq: "monthly", priority: 0.8,  lastmod: REV.evergreen },
    { url: `${base}/glossaire/etf`,            changeFreq: "monthly", priority: 0.8,  lastmod: REV.evergreen },
    { url: `${base}/glossaire/interets-composes`, changeFreq: "monthly", priority: 0.8, lastmod: REV.evergreen },
    ...GLOSSARY_TERM_LIST.map((t) => ({
      url: `${base}/glossaire/${t.slug}`,
      changeFreq: "monthly",
      priority: 0.7,
      lastmod: REV.evergreen,
    })),
    { url: `${base}/comparatif`,               changeFreq: "monthly", priority: 0.8,  lastmod: REV.evergreen },
    ...BROKER_LIST.map((b) => ({
      url: `${base}/comparatif/${b.slug}`,
      changeFreq: "monthly",
      priority: 0.8,
      lastmod: REV.evergreen,
    })),
    { url: `${base}/comparatif-etf`,           changeFreq: "monthly", priority: 0.8,  lastmod: REV.newFeature },
    ...ETF_COMPARISON_LIST.map((c) => ({
      url: `${base}/comparatif-etf/${c.slug}`,
      changeFreq: "monthly",
      priority: 0.8,
      lastmod: REV.newFeature,
    })),
    ...ETF_LIST.map((etf) => ({
      url: `${base}/etf/${etf.displaySymbol}`,
      changeFreq: "weekly",
      priority: 0.7,
      lastmod: REV.market,
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
