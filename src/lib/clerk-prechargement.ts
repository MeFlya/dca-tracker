// Script en ligne du <head> (app/layout.tsx) : précharge les scripts de Clerk
// dès l'analyse du HTML, mais seulement quand ils serviront — session annoncée
// par le cookie, ou page de connexion / d'inscription.
//
// Pourquoi : depuis que Clerk n'enveloppe plus le site (voir
// components/compte/etat-compte.ts), clerk.browser.js ne partait qu'après le
// JavaScript de la page et son hydratation, au lieu de partir avec le HTML.
// Mesuré le 04/10/2026 en mobile bridé (150 ms de latence, 1,6 Mbit/s, CPU
// ×4) : l'avatar d'un connecté arrivait 0,7 s plus tard, le formulaire de
// /sign-in 0,4 s plus tard.
//
// Un <link rel="preload">, pas un <script> : si l'URL calculée ici différait
// un jour de celle que Clerk charge (nouvelle variable NEXT_PUBLIC_CLERK_*),
// on perdrait un préchargement, jamais une seconde exécution de clerk-js.
// Les options reprennent celles que @clerk/nextjs lit dans le navigateur
// (mergeNextClerkPropsWithEnv), et les URL sont construites par les fonctions
// de Clerk lui-même.
//
// ⚠️ Script en ligne : une future Content-Security-Policy devra l'autoriser
// (nonce ou empreinte).

// @clerk/shared n'est pas déclaré dans package.json, exprès : c'est la copie
// installée par @clerk/nextjs, donc celle qui calcule les URL que Clerk
// chargera. Le déclarer à part pourrait la désaligner (npm a proposé 4.38.0
// alors que @clerk/nextjs tourne avec 4.25.8).
import { clerkJSScriptUrl, clerkUIScriptUrl } from "@clerk/shared/loadClerkJsScript";
import { COOKIE_SESSION_CLERK, ROUTES_CLERK } from "@/components/compte/session-clerk";

export function scriptPrechargementClerk(): string | null {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return null;
  const options = {
    publishableKey,
    proxyUrl: process.env.NEXT_PUBLIC_CLERK_PROXY_URL ?? "",
    domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN ?? "",
    __internal_clerkJSUrl: process.env.NEXT_PUBLIC_CLERK_JS_URL,
    __internal_clerkJSVersion: process.env.NEXT_PUBLIC_CLERK_JS_VERSION,
    __internal_clerkUIUrl: process.env.NEXT_PUBLIC_CLERK_UI_URL,
    __internal_clerkUIVersion: process.env.NEXT_PUBLIC_CLERK_UI_VERSION,
  };
  const urls = [clerkJSScriptUrl(options)];
  // Clerk ne précharge pas son interface quand NEXT_PUBLIC_CLERK_PREFETCH_UI vaut « false ».
  if (process.env.NEXT_PUBLIC_CLERK_PREFETCH_UI !== "false") urls.push(clerkUIScriptUrl(options));

  return (
    `(function(){try{if(${COOKIE_SESSION_CLERK}.test(document.cookie)||${ROUTES_CLERK}.test(location.pathname)){` +
    `${JSON.stringify(urls)}.forEach(function(h){var l=document.createElement("link");` +
    `l.rel="preload";l.as="script";l.crossOrigin="anonymous";l.href=h;document.head.appendChild(l)})}}catch(e){}})()`
  );
}
