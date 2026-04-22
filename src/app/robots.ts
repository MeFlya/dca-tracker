import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://dcatracker.fr";
  return {
    rules: [
      {
        userAgent: "*",
        // Allow public marketing + content pages
        allow: "/",
        // Block non-content surfaces that shouldn't appear in Google
        // - /api/*      : JSON endpoints, never content
        // - /account/*  : user dashboard (requires auth, personal data)
        // - /dashboard/*: reserved for future dashboard routes
        // - /sign-in, /sign-up : auth flows, low-value duplicates
        // - /payment/*  : Stripe callback pages (thank-you / cancel)
        disallow: [
          "/api/",
          "/account/",
          "/dashboard/",
          "/sign-in",
          "/sign-up",
          "/payment/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
