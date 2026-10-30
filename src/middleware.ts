import { NextResponse, type NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

// Built once at module load — safe, just creates a function, doesn't call Clerk API
// signInUrl explicite : sans NEXT_PUBLIC_CLERK_SIGN_IN_URL dans l'environnement
// de production, auth.protect() renvoyait les visiteurs non connectés vers la
// page hébergée par Clerk (accounts.dcatracker.fr), pas vers /sign-in, qui est
// à nos couleurs et en français.
const _clerkMw = clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  // Guard: if Clerk env vars are missing, pass through without auth.
  // Prevents MIDDLEWARE_INVOCATION_FAILED when keys aren't set in Vercel yet.
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  ) {
    return NextResponse.next();
  }
  return _clerkMw(req, evt);
}

// ─── Où le middleware tourne (30/10/2026) ───────────────────────────────────
//
// Le 25/10/2026, Vercel a mis le projet en pause : plafond Hobby de CPU
// dépassé (4 h par mois glissant), dont 41 % pour le middleware. Son matcher
// prenait tout sauf /_next et les fichiers statiques : Clerk s'exécutait avant
// le cache du CDN sur chaque page publique, chaque préchargement de lien,
// sitemap, robots.txt, images OG, crons et webhook, surtout pour des robots.
//
// Il ne tourne plus que là où le serveur lit la session. RÈGLE : toute route
// qui appelle auth(), currentUser() ou getUserSubscription() (lib/subscription)
// DOIT figurer ici. Sinon Clerk lève « can't detect usage of clerkMiddleware() »
// (erreur 500), ou, là où l'appel est rattrapé, le visiteur est vu déconnecté
// sans bruit — /api/products/checkout ferait alors un achat invité, sans
// rattacher le client Stripe. Vérifier avec :
//   grep -rnE "auth\(|currentUser\(|getUserSubscription\(" src/app
//
// Volontairement HORS du matcher, parce qu'ils n'utilisent que clerkClient(),
// qui lit CLERK_SECRET_KEY sans middleware : /api/webhooks/stripe (signature
// vérifiée sur le corps brut), /api/cron/* (lib/cron-auth.ts), /api/stats/public,
// /api/subscribe, /api/email/unsubscribe, /desinscription. Ne pas élargir à
// "/api/:path*" : le webhook et les crons repasseraient par Clerk pour rien.
//
// Les pages publiques n'en ont pas besoin : ClerkProvider (sans `dynamic`),
// useUser, UserButton, SignIn et SignUp sont des composants clients ; clerk-js
// parle à l'API Frontend de Clerk et rafraîchit la session lui-même. Le statut
// Premium d'une page publique passe par /api/abonnement (lib/use-premium.ts).
//
// La redirection *.vercel.app → dcatracker.fr est dans next.config.ts.
//
// Next exige des chaînes littérales ici. « /x/:path* » couvre aussi /x.
export const config = {
  matcher: [
    "/account/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/api/abonnement",
    "/api/account/:path*",
    "/api/strategy/:path*",
    "/api/notifications",
    "/api/onboarding/:path*",
    "/api/stripe/:path*",
    "/api/products/checkout",
    "/api/simulator/:path*",
  ],
};
