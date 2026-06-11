import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Le projet vit sur ~/Desktop, synchronisé par iCloud Drive : le daemon
  // de sync (bird) tient des handles sur les fichiers de .next pendant les
  // écritures massives du build → ENOENT aléatoires en "Collecting page
  // data" (pages-manifest.json). Le suffixe ".nosync" exclut le dossier de
  // la synchronisation iCloud — fix standard, sans incidence sur Vercel.
  distDir: ".next.nosync",

  // Épingle le root du projet pour le file tracing. Sans ça, Next détecte
  // un package-lock.json parasite dans le home (~/package-lock.json) et
  // infère /Users/<user> comme workspace root → manifests écrits/lus au
  // mauvais endroit → builds qui échouent aléatoirement en "Collecting
  // page data" (ENOENT pages-manifest.json).
  outputFileTracingRoot: __dirname,

  // Inclut les fichiers produits (PDF/XLSX, hors /public) dans le bundle
  // serverless de la route de téléchargement — sans ça, Vercel ne trace pas
  // les fs.readFile à chemin dynamique et la route 404 en prod.
  outputFileTracingIncludes: {
    "/api/products/download": ["./private-assets/**/*"],
  },

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
