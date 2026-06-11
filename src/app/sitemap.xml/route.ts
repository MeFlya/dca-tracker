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
const REV = {
  ymyl: "2026-06-10",       // pages YMYL (maillage courtiers + byline/sources juin)
  newFeature: "2026-06-02", // /backtest, pages indice, comparatifs ETF récents
  tools: "2026-05-25",      // simulateur, tarifs, a-propos (évoluent régulièrement)
  longtail: "2026-06-10",   // pages "investir X €/mois" (byline + sources ajoutées)
  legal: "2026-05-18",      // mentions légales, CGV, confidentialité (SIRET finalisé)
  evergreen: "2026-06-10",  // fiches courtiers (byline juin), glossaire, pages stables
  market: "2026-05-25",     // pages avec données de marché (template, pas la donnée live)
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
    { url: `${base}/a-propos`,                 changeFreq: "monthly", priority: 0.6,  lastmod: REV.tools },
    { url: `${base}/methodologie`,             changeFreq: "monthly", priority: 0.5,  lastmod: REV.ymyl },
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
