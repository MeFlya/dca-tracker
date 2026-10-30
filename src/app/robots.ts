import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://dcatracker.fr";
  return {
    rules: [
      {
        userAgent: "*",
        // Allow public marketing + content pages
        // /api/logo (30/10/2026) : c'est le logo que déclare le JSON-LD
        // Organization (layout.tsx). Sous « Disallow: /api/ », Google ne
        // pouvait pas le lire. La règle la plus longue l'emporte : ce seul
        // fichier est autorisé, le reste de /api/ reste interdit.
        allow: ["/", "/api/logo"],
        // Block non-content surfaces that shouldn't appear in Google
        // - /api/*      : JSON endpoints, never content
        // - /account    : user dashboard (requires auth, personal data).
        //                 Sans barre finale (30/10/2026) : « /account/ » laissait
        //                 /account lui-même ouvert, alors que /cgv le lie ; un
        //                 robot qui le suivait faisait tourner le middleware.
        //                 Aucune page publique ne commence par /account.
        // - /dashboard/*: reserved for future dashboard routes
        // - /sign-in, /sign-up : auth flows, low-value duplicates
        // - /payment/*  : Stripe callback pages (thank-you / cancel)
        // Ajoutés le 30/10/2026 (pause Vercel Hobby pour dépassement de CPU) :
        // trois pages déjà en noindex, rendues à chaque requête, sans contenu
        // à indexer.
        // - /upgrade    : calcule 1 000 trajectoires Monte Carlo par requête,
        //                 et les liens du simulateur y passent ses réglages
        //                 (une adresse par combinaison de curseurs)
        // - /desinscription, /produits/merci : lien d'email et retour de
        //                 paiement, qui ne servent qu'avec leur jeton
        // Les pages publiques, les images OG, /icon et /_next restent
        // ouverts : statiques, ils ne coûtent plus rien, et les bloquer
        // gênerait le rendu par Google et les aperçus de partage.
        disallow: [
          "/api/",
          "/account",
          "/dashboard/",
          "/sign-in",
          "/sign-up",
          "/payment/",
          "/upgrade",
          "/desinscription",
          "/produits/merci",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
