// Désinscription — GET (clic dans l'email) et POST (bouton natif Gmail/Outlook).
//
// Le POST implémente la RFC 8058 : quand un email porte les en-têtes
// `List-Unsubscribe` + `List-Unsubscribe-Post`, Gmail affiche son propre bouton
// « Se désinscrire » à côté de l'expéditeur et appelle cette route directement,
// sans que l'utilisateur ouvre quoi que ce soit. C'est ce bouton qui est cliqué
// à la place de « signaler comme spam » — donc c'est lui qui protège la
// réputation du domaine.
//
// Aucune authentification : la signature du token EST l'autorisation. Un lien de
// désinscription qui exige de se connecter n'est pas une échappatoire.

import { NextResponse } from "next/server";
import {
  optOutByEmail,
  verifyUnsubscribeToken,
} from "@/lib/email-preferences";

export const dynamic = "force-dynamic";

async function handle(token: string | null): Promise<"ok" | "invalid"> {
  if (!token) return "invalid";
  const email = verifyUnsubscribeToken(token);
  if (!email) return "invalid";
  await optOutByEmail(email);
  return "ok";
}

/** Clic sur le lien du pied de page → traitement puis page de confirmation. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const result = await handle(token);
  return NextResponse.redirect(
    new URL(`/desinscription?etat=${result}`, req.url),
    { status: 303 }
  );
}

/**
 * Bouton natif du client mail (RFC 8058). Gmail attend une réponse 2xx et
 * n'affiche aucune page : on renvoie donc du texte, pas une redirection.
 */
export async function POST(req: Request) {
  // Le token peut arriver dans l'URL ou dans le corps selon le client.
  let token = new URL(req.url).searchParams.get("token");
  if (!token) {
    try {
      const body = await req.text();
      token = new URLSearchParams(body).get("token");
    } catch {
      /* corps illisible : on retombe sur le cas invalide */
    }
  }

  const result = await handle(token);
  // Même en cas de token invalide on répond 200 : un client mail qui reçoit une
  // erreur peut réessayer en boucle, et rien d'utile ne peut être fait du côté
  // de l'utilisateur à ce stade.
  return new NextResponse(
    result === "ok" ? "Désinscription enregistrée." : "Lien invalide.",
    { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
