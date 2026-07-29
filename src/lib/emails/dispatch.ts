// Point de passage unique de tous les envois d'emails.
//
// Avant, chacune des 15 fonctions de send.ts appelait `resend.emails.send`
// directement. Conséquence : aucun endroit où faire respecter une désinscription,
// et aucun endroit où garantir la présence d'un lien pour se désinscrire.
// Ajouter les deux à 15 endroits, c'était garantir qu'on en oublierait un — et
// un seul oubli suffit à recevoir une plainte pour spam.
//
// ⚠️ Ne plus jamais appeler `resend.emails.send` ailleurs. Tout passe par ici.

// Client partagé : il gère le cas RESEND_API_KEY absent, que le constructeur
// de Resend refuse — sinon le build échoue à la collecte des routes.
import { resend } from "@/lib/resend-client";
import {
  createUnsubscribeToken,
  isOptedOutByEmail,
  type EmailKind,
} from "@/lib/email-preferences";

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "DCA Tracker <hello@dcatracker.fr>";

const SITE_URL = "https://dcatracker.fr";
const CONTACT = "hello@dcatracker.fr";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  /** Variante texte brut, quand l'appelant en fournit une. */
  text?: string;
  /**
   * Envoi différé côté Resend (format ISO).
   *
   * ⚠️ ANGLE MORT CONNU : la désinscription est vérifiée au moment de la
   * PLANIFICATION, pas au moment de l'envoi. Quelqu'un qui se désinscrit entre
   * les deux recevra quand même ce message. Resend ne rappelle pas notre code
   * avant d'envoyer, donc il n'y a pas de correctif possible ici.
   * Le jour où ça devient gênant, la sortie est de planifier côté nous (un cron
   * qui envoie à l'heure dite) plutôt que côté Resend.
   * Aujourd'hui la seule utilisation est l'email J+1 de la séquence d'accueil :
   * 24 heures de fenêtre, sur des inscrits du jour. Risque assumé.
   */
  scheduled_at?: string;
  /** `transactional` ignore la désinscription. Défaut : `lifecycle`, plus prudent. */
  kind?: EmailKind;
  /**
   * Préférence déjà connue de l'appelant (typiquement une boucle de cron qui a
   * déjà l'objet utilisateur en main). Évite un appel Clerk par destinataire.
   * Omettre force la vérification.
   */
  optedOut?: boolean;
  replyTo?: string;
}

/** Renvoie l'URL de désinscription, ou un `mailto:` si le secret manque. */
function unsubscribeUrl(email: string): string {
  const token = createUnsubscribeToken(email);
  if (!token) {
    // Secret absent de l'environnement : on ne part PAS sans échappatoire.
    // Le mailto est une méthode de désinscription reconnue, y compris par
    // l'en-tête List-Unsubscribe.
    return `mailto:${CONTACT}?subject=${encodeURIComponent("Désinscription")}`;
  }
  return `${SITE_URL}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** Pied de page ajouté à TOUS les emails, y compris transactionnels. */
function unsubscribeFooter(email: string, kind: EmailKind): string {
  const url = unsubscribeUrl(email);
  const isMailto = url.startsWith("mailto:");

  // Un email transactionnel continue de partir après désinscription : le dire
  // franchement vaut mieux qu'un lien qui donne l'impression de ne pas marcher.
  const wording =
    kind === "transactional"
      ? `Ce message concerne votre compte ou votre commande, il vous est envoyé même si vous vous êtes désinscrit des autres emails.`
      : isMailto
        ? `Pour ne plus recevoir ces emails, écrivez à ${CONTACT}.`
        : `<a href="${url}" style="color:#6b7280;text-decoration:underline">Se désinscrire de ces emails</a> — en un clic, sans avoir à se connecter.`;

  return `
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb">
    <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.7">
      DCA Tracker · outil éducatif, pas de conseil en investissement.<br/>
      Maël Faleyras · 266 rue Nationale, 59800 Lille · SIRET 105 002 703 00012<br/>
      ${wording}
    </p>
  </div>`;
}

/** Insère le pied de page avant </body> quand il existe, sinon à la fin. */
function withFooter(html: string, email: string, kind: EmailKind): string {
  const footer = unsubscribeFooter(email, kind);
  const idx = html.lastIndexOf("</body>");
  return idx === -1 ? html + footer : html.slice(0, idx) + footer + html.slice(idx);
}

/**
 * Envoie un email.
 *
 * - respecte la désinscription pour tout ce qui n'est pas `transactional` ;
 * - ajoute systématiquement un pied de page avec l'échappatoire ;
 * - pose les en-têtes `List-Unsubscribe` et `List-Unsubscribe-Post` (RFC 8058),
 *   qui affichent le bouton « Se désinscrire » natif de Gmail et d'Outlook.
 *   C'est ce bouton que les gens utilisent au lieu de « spam » — donc c'est lui
 *   qui protège la réputation du domaine.
 *
 * Renvoie `false` si l'envoi a été supprimé pour cause de désinscription.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  scheduled_at,
  kind = "lifecycle",
  optedOut,
  replyTo,
}: SendOptions): Promise<boolean> {
  if (kind !== "transactional") {
    const skip = optedOut ?? (await isOptedOutByEmail(to));
    if (skip) {
      console.log(`[email] supprimé (désinscrit) : ${subject}`);
      return false;
    }
  }

  const url = unsubscribeUrl(to);
  const isMailto = url.startsWith("mailto:");

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: withFooter(html, to, kind),
    // La variante texte doit porter la même échappatoire que le HTML : certains
    // clients n'affichent que celle-là.
    ...(text
      ? {
          text:
            kind === "transactional"
              ? `${text}\n\n—\nMessage lié à votre compte ou à votre commande.`
              : `${text}\n\n—\nPour ne plus recevoir ces emails : ${url}`,
        }
      : {}),
    ...(scheduled_at ? { scheduledAt: scheduled_at } : {}),
    ...(replyTo ? { replyTo } : {}),
    headers: {
      "List-Unsubscribe": isMailto ? `<${url}>` : `<${url}>`,
      // Ne s'annonce que pour une vraie URL : Gmail attend un POST derrière,
      // ce qu'un mailto ne sait pas faire.
      ...(isMailto
        ? {}
        : { "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }),
    },
  });

  return true;
}
