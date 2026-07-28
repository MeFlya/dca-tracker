// Authentification des routes cron — FAIL-CLOSED.
//
// Historique : la garde était `if (secret) { …vérifier… }`, donc si
// CRON_SECRET était absent de l'environnement, tout le contrôle était sauté et
// la route devenait publiquement déclenchable (envoi d'emails de masse,
// facturation Resend, réputation d'expéditeur). C'était le cas en production.
//
// Règle désormais : pas de secret configuré = on refuse. Un cron qui ne part
// pas est un incident visible ; un cron ouvert à tous est une faille
// silencieuse.

import { NextResponse } from "next/server";

/** Retourne une réponse d'erreur si la requête n'est pas un appel cron
 *  authentifié, ou `null` si l'appel est légitime. */
export function denyUnlessCron(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error(
      "[cron] CRON_SECRET absent de l'environnement — requête refusée. " +
        "Définir la variable dans les réglages Vercel du projet.",
    );
    return NextResponse.json(
      { error: "Cron non configuré" },
      { status: 503 },
    );
  }

  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
