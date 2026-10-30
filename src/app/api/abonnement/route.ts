// GET /api/abonnement — le statut Premium du visiteur, lu côté serveur.
//
// ─── Pourquoi cette route existe (30/10/2026) ───────────────────────────────
//
// /simulateur et /backtest lisaient l'abonnement pendant leur rendu
// (getUserSubscription) : les deux pages s'exécutaient donc à chaque visite,
// robots compris, et le middleware Clerk devait tourner sur elles. Cela a
// contribué à la pause du projet sur l'offre Hobby de Vercel (25/10/2026).
// Elles sont désormais statiques, servies par le CDN ; le navigateur d'un
// visiteur CONNECTÉ appelle cette route une fois par page vue, via
// lib/use-premium.ts. Un visiteur déconnecté ne l'appelle jamais.
//
// Le plan vient toujours de getUserSubscription(), côté serveur, jamais de
// useUser().publicMetadata. Seul le booléen traverse, aucune donnée
// personnelle. Ce booléen ne débloque que de l'affichage : ce qui se vend
// reste vérifié côté serveur (/api/simulator/monte-carlo ne renvoie qu'une
// valeur à un visiteur non payant).
//
// ⚠️ Cette route DOIT rester dans le matcher de src/middleware.ts : sans lui,
// currentUser() échoue, le .catch répond « gratuit », et un abonné verrait
// le paywall sans aucun message d'erreur.

import { NextResponse } from "next/server";
import { getUserSubscription, isPremium } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  // Repli en « gratuit » si la lecture échoue, comme avant sur les deux
  // pages : un incident d'authentification n'ouvre jamais une fonctionnalité
  // payante, et il ne casse pas la page.
  const premium = await getUserSubscription()
    .then((sub) => isPremium(sub.plan))
    .catch((err) => {
      console.error("[abonnement] lecture du plan impossible, repli en gratuit :", err);
      return false;
    });

  // `private, no-store` obligatoire : la réponse dépend du cookie de session.
  return NextResponse.json(
    { premium },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
