// Désinscription.
//
// Deux chemins, volontairement différents :
//
//  • POST — bouton natif Gmail/Outlook (RFC 8058). Le client mail appelle cette
//    route directement, sans que l'utilisateur ouvre quoi que ce soit. C'est ce
//    bouton qui est cliqué à la place de « signaler comme spam », donc c'est lui
//    qui protège la réputation du domaine. Désinscription immédiate.
//
//  • GET — clic humain sur le lien du pied de page. Ne désinscrit PAS
//    directement : renvoie vers /desinscription, qui vérifie le token et demande
//    une confirmation.
//    Pourquoi ne pas agir sur le GET : les scanners de liens des messageries
//    d'entreprise et les préchargeurs suivent tous les liens d'un email. Un GET
//    qui mute désinscrirait des gens qui n'ont jamais cliqué. La RFC 8058 couvre
//    déjà le cas « zéro friction » via le POST ; le lien du corps peut donc se
//    permettre un clic de confirmation.
//
// Aucune authentification : la signature du token EST l'autorisation.

import { NextResponse } from "next/server";
import {
  optOutByEmail,
  verifyUnsubscribeToken,
} from "@/lib/email-preferences";

export const dynamic = "force-dynamic";

/** Renvoie vers la page, qui décide quoi afficher. Ne mute rien. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const dest = new URL("/desinscription", req.url);
  if (token) dest.searchParams.set("token", token);
  return NextResponse.redirect(dest, { status: 303 });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get("token");
  let fromForm = false;

  // Le token peut arriver dans l'URL (RFC 8058) ou dans le corps (formulaire
  // de la page de confirmation).
  try {
    const body = await req.text();
    if (body) {
      const params = new URLSearchParams(body);
      token = params.get("token") ?? token;
      fromForm = params.get("via") === "form";
    }
  } catch {
    /* corps illisible : on retombe sur le token de l'URL */
  }

  // Trois issues distinctes, pas deux. Confondre « lien invalide » et
  // « l'écriture a échoué » masquerait une panne derrière un message qui
  // accuse l'utilisateur — et empêcherait de la voir dans les journaux.
  const email = token ? verifyUnsubscribeToken(token) : null;
  const issue: "invalid" | "ok" | "error" = !email
    ? "invalid"
    : (await optOutByEmail(email))
      ? "ok"
      : "error";

  if (issue === "error") {
    // Le token était bon : c'est nous qui n'avons pas réussi à enregistrer.
    // Doit rester bruyant, sinon une désinscription perdue passe inaperçue et
    // la plainte pour spam arrive à la place.
    console.error(
      `[unsubscribe] token valide mais écriture échouée pour ${email} — à traiter à la main`
    );
  }

  if (fromForm) {
    const dest = new URL("/desinscription", req.url);
    dest.searchParams.set("fait", issue === "ok" ? "1" : "0");
    // Token conservé sur échec pour permettre un nouvel essai sans repasser
    // par l'email.
    if (issue !== "ok" && token) dest.searchParams.set("token", token);
    return NextResponse.redirect(dest, { status: 303 });
  }

  // Chemin RFC 8058. Toujours 200 : un client mail qui reçoit une erreur peut
  // réessayer en boucle, et l'utilisateur ne verra jamais cette réponse.
  const body = {
    ok: "Désinscription enregistrée.",
    invalid: "Lien invalide.",
    error: "Erreur temporaire — la demande a été enregistrée dans nos journaux.",
  }[issue];

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
