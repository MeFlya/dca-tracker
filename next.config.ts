import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Le projet vit sur ~/Desktop, synchronisé par iCloud Drive : le daemon
  // de sync (bird) tient des handles sur les fichiers de .next pendant les
  // écritures massives du build → ENOENT aléatoires en "Collecting page
  // data" (pages-manifest.json). Le suffixe ".nosync" exclut le dossier de
  // la synchronisation iCloud. UNIQUEMENT en local : sur Vercel, l'étape de
  // packaging cherche le manifest dans .next/ et un distDir custom fait
  // échouer le déploiement ("routes-manifest.json couldn't be found").
  ...(process.env.VERCEL ? {} : { distDir: ".next.nosync" }),

  // Épingle le root du projet pour le file tracing. Sans ça, Next détecte
  // un package-lock.json parasite dans le home (~/package-lock.json) et
  // infère /Users/<user> comme workspace root → manifests écrits/lus au
  // mauvais endroit → builds qui échouent aléatoirement en "Collecting
  // page data" (ENOENT pages-manifest.json).
  outputFileTracingRoot: __dirname,

  // Inclut les fichiers produits CHIFFRÉS (hors /public) dans le bundle
  // serverless de la route de téléchargement — sans ça, Vercel ne trace pas
  // les fs.readFile à chemin dynamique et la route 404 en prod.
  // ⚠️ Glob volontairement restreint aux .enc : un glob large embarquerait
  // private-assets/raw/ (originaux en CLAIR, gitignorés) dans l'artefact
  // d'un build local déployé (vercel build --prebuilt).
  outputFileTracingIncludes: {
    "/api/products/download": ["./private-assets/*.enc"],
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
      //
      // Corrigé le 28/09/2026 d'après la table de vérité ETF :
      //  · /etf/PAEEM → /etf/AEEM SUPPRIMÉE. PAEEM (FR0013412020) est l'ETF
      //    émergents ÉLIGIBLE PEA d'Amundi ; AEEM (LU1681045370) est un autre
      //    fonds, NON éligible. La redirection envoyait le lecteur qui cherchait
      //    l'émergents PEA vers un fonds que son PEA refuse. /etf/PAEEM est
      //    désormais une vraie fiche.
      //  · /etf/EWLD pointait vers IWDA (iShares, physique, non éligible PEA).
      //    EWLD est un fonds AMUNDI : la part distribuante du fonds de CW8,
      //    éligible PEA. Redirigé vers /etf/CW8, la même stratégie en part
      //    capitalisante.
      //  · /etf/SP5 → /etf/500 conservée : la fiche 500 dit désormais qu'il
      //    n'est pas éligible PEA et renvoie vers PSP5, SPEA et ESE.
      //  · /etf/LYYA et /etf/OBLI conservées : la table ne dit rien de ces
      //    anciens tickers, les fiches cibles (JPNK, C3M) sont corrigées.
      { source: "/etf/EWLD",  destination: "/etf/CW8",  permanent: true },
      { source: "/etf/SP5",   destination: "/etf/500",  permanent: true },
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

      // ── Captures produits v1 remplacées (2026-10-01) ───────────────────
      // Cockpit v2.0 et guide v1.1 : les anciennes captures ont été publiques
      // (Google Images, partages). Chacune pointe vers son équivalent v2.
      { source: "/produits/cockpit-dashboard.png",         destination: "/produits/cockpit-v2-dashboard.png",   permanent: true },
      { source: "/produits/cockpit-versement-du-mois.png", destination: "/produits/cockpit-v2-versement.png",   permanent: true },
      { source: "/produits/guide-couverture.png",          destination: "/produits/guide-v1-1-couverture.png",  permanent: true },
      { source: "/produits/guide-charte.png",              destination: "/produits/guide-v1-1-charte.png",      permanent: true },
      { source: "/produits/guide-courtiers.png",           destination: "/produits/guide-v1-1-sommaire.png",    permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Only set index/follow on the canonical domain.
        // Requests to *.vercel.app are redirected by middleware before reaching here.
        // Sauf la page de résultats de recherche et l'index qu'elle charge :
        // des pages de résultats indexées seraient du contenu dupliqué.
        source: "/((?!recherche|search-index\\.json).*)",
        has: [{ type: "host", value: "dcatracker.fr" }],
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
      {
        source: "/(recherche|search-index\\.json)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        // Vidéos du bandeau d'accueil : leurs noms portent l'empreinte du
        // fichier (src/lib/video-accueil.ts), un nouveau rendu change de nom.
        // On peut donc les garder un an sans jamais revalider ; par défaut,
        // Vercel sert public/ en « max-age=0, must-revalidate ».
        source: "/video/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
