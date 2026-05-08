import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.alphavantage.co",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dcatracker.fr" }],
        destination: "https://dcatracker.fr/:path*",
        permanent: true,
      },
      // ── Rebrand Lyxor → Amundi (2026-04-22) ─────────────────────────────
      // Les anciens tickers ont été remplacés par les nouveaux tickers
      // officiels chez Amundi. On redirige les URLs historiques pour
      // préserver bookmarks + backlinks + SEO.
      { source: "/etf/EWLD",  destination: "/etf/IWDA", permanent: true },
      { source: "/etf/SP5",   destination: "/etf/500",  permanent: true },
      { source: "/etf/PAEEM", destination: "/etf/AEEM", permanent: true },
      { source: "/etf/LYYA",  destination: "/etf/JPNK", permanent: true },
      { source: "/etf/OBLI",  destination: "/etf/C3M",  permanent: true },
      // SMAE supprimé (ISIN pointait sur un doublon Russell 2000). On
      // redirige vers la liste complète des ETF — pas d'équivalent direct.
      { source: "/etf/SMAE", destination: "/comparer-etf", permanent: true },

      // ── SEO thin content cleanup (2026-05-08) ──────────────────────────
      // /investir-1000-euros-mois-etf : page thin (317 lignes vs 619/653
      // pour les pages 100/300 €), niche faible volume FR (au-delà de
      // 500 €/mois les requêtes deviennent "investir mon épargne" plutôt
      // que "investir 1000 €/mois"). Redirige vers la page mère.
      {
        source: "/investir-1000-euros-mois-etf",
        destination: "/investir-en-etf",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Only set index/follow on the canonical domain.
        // Requests to *.vercel.app are redirected by middleware before reaching here.
        source: "/(.*)",
        has: [{ type: "host", value: "dcatracker.fr" }],
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
    ];
  },
};

export default nextConfig;
