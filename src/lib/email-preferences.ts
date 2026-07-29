// Préférences email et désinscription.
//
// ─── Pourquoi un token signé plutôt qu'un lien authentifié ──────────────────
//
// Un lien de désinscription doit fonctionner depuis la boîte mail, sans session,
// des mois après l'envoi, et sans que le destinataire ait à se connecter — sinon
// ce n'est pas une échappatoire, c'est un parcours. Le token porte donc l'email
// et sa signature HMAC : la signature EST l'autorisation, exactement comme pour
// les liens de téléchargement produits (cf. download-token.ts).
//
// Volontairement SANS expiration. Un lien de désinscription périmé renvoie
// l'utilisateur vers le bouton « spam », ce qui est précisément le résultat
// qu'on cherche à éviter.
//
// ─── Pourquoi ça compte au-delà du droit ────────────────────────────────────
//
// Les crons onboarding-emails et winback-emails sont de la prospection : l'opt-out
// y est obligatoire. Le récap mensuel est un email de service, la frontière est
// discutée — et personne n'a intérêt à se placer du mauvais côté.
// L'argument opérationnel pèse autant : sans échappatoire, les gens qui veulent
// partir cliquent « spam », et chaque plainte abîme durablement la réputation du
// domaine. Celle qu'on construit aujourd'hui est celle avec laquelle partira la
// campagne du récap fiscal en pleine saison fiscale.
//
// Server-only : ne jamais importer côté client, le secret fuiterait au build.

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Clerk est chargé À LA DEMANDE, jamais au chargement du module.
 * En import statique, il entrait dans le graphe de toute route important
 * dispatch.ts — dont /api/subscribe, que Next analyse au build sans contexte de
 * requête, ce qui faisait échouer la compilation.
 */
async function clerk() {
  const { clerkClient } = await import("@clerk/nextjs/server");
  return clerkClient();
}

/** Clé de la préférence dans les privateMetadata Clerk. */
const OPT_OUT_KEY = "emailOptOut";

/**
 * Séparation de domaine : le même secret sert aux liens de téléchargement.
 * Le préfixe garantit qu'un token de l'un ne peut pas être rejoué sur l'autre.
 */
const DOMAIN = "unsub.v1:";

export type EmailKind =
  /** Confirmation d'abonnement, résiliation, fin d'essai, livraison produit.
   *  Envoyés MÊME en cas de désinscription : ce sont des messages de service liés
   *  à une transaction, et ne pas prévenir d'un prélèvement à venir serait pire
   *  que d'envoyer un email non désiré. */
  | "transactional"
  /** Séquence d'accueil, relances, récap mensuel, mois manqué, poussée annuelle.
   *  Respectent la désinscription. */
  | "lifecycle";

function getSecret(): string | null {
  return process.env.DOWNLOAD_TOKEN_SECRET ?? null;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(DOMAIN + data).digest("base64url");
}

/**
 * Token de désinscription pour une adresse. Renvoie null si le secret est absent
 * de l'environnement — l'appelant bascule alors sur un lien `mailto:`, qui reste
 * une méthode de désinscription valide. Un email doit toujours partir avec une
 * échappatoire, même mal configuré.
 */
export function createUnsubscribeToken(email: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const data = Buffer.from(JSON.stringify({ e: email })).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(data, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    return typeof payload.e === "string" ? payload.e : null;
  } catch {
    return null;
  }
}

/** Lit la préférence depuis un objet utilisateur Clerk déjà chargé — sans appel réseau. */
export function isOptedOutFromMetadata(
  privateMetadata: unknown
): boolean {
  const meta = privateMetadata as Record<string, unknown> | null | undefined;
  return Boolean(meta?.[OPT_OUT_KEY]);
}

/**
 * Enregistre la désinscription pour une adresse.
 *
 * Renvoie true même si aucun compte ne correspond : une adresse qui n'a jamais
 * eu de compte ne recevra de toute façon rien, et répondre « introuvable » à
 * quelqu'un qui demande à partir serait absurde. Ça évite aussi de révéler
 * l'existence d'un compte à partir d'une adresse.
 */
export async function optOutByEmail(email: string): Promise<boolean> {
  try {
    const { data: users } = await (await clerk()).users.getUserList({
      emailAddress: [email],
      limit: 5,
    });

    for (const user of users) {
      await (await clerk()).users.updateUser(user.id, {
        privateMetadata: {
          ...(user.privateMetadata as Record<string, unknown>),
          [OPT_OUT_KEY]: { at: new Date().toISOString() },
        },
      });
    }
    return true;
  } catch (err) {
    console.error("[email-preferences] échec de la désinscription :", err);
    return false;
  }
}

/** Réinscription — depuis les réglages du compte. */
export async function optInByUserId(userId: string): Promise<void> {
    const user = await (await clerk()).users.getUser(userId);
  const meta = { ...(user.privateMetadata as Record<string, unknown>) };
  delete meta[OPT_OUT_KEY];
  await (await clerk()).users.updateUser(userId, { privateMetadata: meta });
}

/**
 * Vérification par adresse, pour les envois dont l'appelant n'a pas déjà
 * l'objet utilisateur sous la main. Coûte un appel Clerk : dans une boucle de
 * cron, préférer `isOptedOutFromMetadata` sur l'utilisateur déjà chargé.
 *
 * En cas d'erreur réseau, renvoie `false` (on envoie). C'est délibéré : couper
 * tous les emails de service parce que Clerk a hoqueté serait un incident plus
 * grave que l'envoi d'un message à quelqu'un qui s'était désinscrit — et le cas
 * est rattrapé par le lien de désinscription présent dans ce message.
 */
export async function isOptedOutByEmail(email: string): Promise<boolean> {
  try {
    const { data: users } = await (await clerk()).users.getUserList({
      emailAddress: [email],
      limit: 1,
    });
    const user = users[0];
    return user ? isOptedOutFromMetadata(user.privateMetadata) : false;
  } catch {
    return false;
  }
}
