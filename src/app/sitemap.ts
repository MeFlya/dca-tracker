import { MetadataRoute } from "next";
import { ETF_LIST } from "@/lib/etf-config";

// NOTE: /sitemap.xml requests are served by app/sitemap.xml/route.ts which
// generates explicit XML with the correct Content-Type. This file satisfies
// the Next.js metadata-convention requirement for a default export but its
// output is overridden by the Route Handler.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                               lastModified: now, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${base}/simulateur`,               lastModified: now, changeFrequency: "weekly",  priority: 0.9  },
    { url: `${base}/meilleurs-etf-debutants`,  lastModified: now, changeFrequency: "monthly", priority: 0.9  },
    { url: `${base}/strategie-dca`,            lastModified: now, changeFrequency: "monthly", priority: 0.9  },
    { url: `${base}/interets-composes`,        lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/pea-ou-cto`,               lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/investir-en-etf`,          lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/comparer-etf`,             lastModified: now, changeFrequency: "weekly",  priority: 0.8  },
    { url: `${base}/donnees-marche`,           lastModified: now, changeFrequency: "daily",   priority: 0.6  },
    { url: `${base}/tarifs`,                   lastModified: now, changeFrequency: "monthly", priority: 0.8  },
    { url: `${base}/methodologie`,             lastModified: now, changeFrequency: "monthly", priority: 0.5  },
  ];

  const etfPages: MetadataRoute.Sitemap = ETF_LIST.map((etf) => ({
    url: `${base}/etf/${etf.displaySymbol}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...etfPages];
}
