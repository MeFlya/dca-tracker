import { NextResponse } from "next/server";
import { ETF_LIST } from "@/lib/etf-config";

export const dynamic = "force-static";

type PageEntry = {
  url: string;
  changeFreq: string;
  priority: number;
};

export async function GET(): Promise<NextResponse> {
  const base = "https://dcatracker.fr";
  const now = new Date().toISOString();

  const pages: PageEntry[] = [
    { url: base,                               changeFreq: "weekly",  priority: 1.0  },
    { url: `${base}/simulateur`,               changeFreq: "weekly",  priority: 0.9  },
    { url: `${base}/investir-100-euros-mois-etf`, changeFreq: "monthly", priority: 0.9 },
    { url: `${base}/investir-200-euros-mois-etf`, changeFreq: "monthly", priority: 0.9 },
    { url: `${base}/investir-300-euros-mois-etf`, changeFreq: "monthly", priority: 0.9 },
    { url: `${base}/meilleurs-etf-debutants`,  changeFreq: "monthly", priority: 0.9  },
    { url: `${base}/strategie-dca`,            changeFreq: "monthly", priority: 0.9  },
    { url: `${base}/interets-composes`,        changeFreq: "monthly", priority: 0.85 },
    { url: `${base}/pea-ou-cto`,               changeFreq: "monthly", priority: 0.85 },
    { url: `${base}/investir-en-etf`,          changeFreq: "monthly", priority: 0.85 },
    { url: `${base}/comparer-etf`,             changeFreq: "weekly",  priority: 0.8  },
    { url: `${base}/donnees-marche`,           changeFreq: "daily",   priority: 0.6  },
    { url: `${base}/tarifs`,                   changeFreq: "monthly", priority: 0.8  },
    { url: `${base}/methodologie`,             changeFreq: "monthly", priority: 0.5  },
    { url: `${base}/glossaire`,                changeFreq: "monthly", priority: 0.7  },
    { url: `${base}/glossaire/dca`,            changeFreq: "monthly", priority: 0.8  },
    { url: `${base}/glossaire/etf`,            changeFreq: "monthly", priority: 0.8  },
    { url: `${base}/glossaire/interets-composes`, changeFreq: "monthly", priority: 0.8 },
    ...ETF_LIST.map((etf) => ({
      url: `${base}/etf/${etf.displaySymbol}`,
      changeFreq: "weekly",
      priority: 0.7,
    })),
  ];

  const urlEntries = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p.changeFreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
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
