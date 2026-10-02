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
 * Marque le contact Resend de cette adresse comme désinscrit (02/10/2026).
 *
 * POURQUOI : la désinscription n'écrivait que dans Clerk. Or les inscrits aux
 * emails occasionnels n'ont, pour la plupart, PAS de compte : ils n'existent
 * que dans l'audience Resend. Leur clic sur « Se désinscrire » ne laissait
 * donc aucune trace — « une adresse qui n'a jamais eu de compte ne recevra de
 * toute façon rien » n'est plus vrai depuis la série serie-suivi-pea, qui
 * écrit à ces contacts. La page confidentialité (3.5) promet un retrait du
 * consentement « en un clic, depuis le lien de désinscription présent dans
 * chaque email » : c'est ici qu'il devient réel. Le cron saute ensuite tout
 * contact dont `unsubscribed` n'est pas `false`.
 *
 * `PATCH /contacts/{email}` (doc Update Contact, consultée le 02/10/2026) :
 * depuis le passage aux contacts globaux de novembre 2025, `unsubscribed`
 * vaut pour tout le compte Resend, pas pour une seule audience. On garde le
 * contact (désinscrit) plutôt que de le supprimer : c'est ce qui empêche de
 * lui réécrire, et ce que fait la page de préférences de Resend elle-même.
 *
 * Renvoie true si le contact est désinscrit ou n'existe pas (404 : adresse
 * hors liste, rien à faire) ; false sur un échec qui persiste après les
 * reprises — la route le signale alors comme une panne, pas comme un succès.
 *
 * 02/10/2026, après relecture : pour un prospect sans compte, ce PATCH est
 * le SEUL barrage avant l'email suivant de la série. Il ne peut donc pas se
 * contenter d'un essai quand le cron, lui, en fait trois.
 *  · Reprises : deux, après 1 s puis 4 s, sur 429, 5xx, coupure réseau ou
 *    délai dépassé (5 s par essai). Comme `envoyer` dans le cron.
 *  · Sans RESEND_AUDIENCE_ID ou sans clé : rien à écrire. subscribeEmail
 *    n'ajoute personne à la liste et le cron de la série répond 503 sans
 *    rien envoyer ; faire échouer la désinscription (et afficher « Ça n'a pas
 *    fonctionné » à un titulaire de compte bien désinscrit dans Clerk) ne
 *    protégerait personne.
 *  · 401 / 403 (clé « Sending access », suspendue, invalide : doc « Errors »,
 *    consultée le 02/10/2026) : même raisonnement. Une clé qui ne peut pas
 *    écrire un contact ne peut pas non plus lire la liste : le cron de la
 *    série échoue (502) avant tout envoi. Journalisé fort, mais la
 *    désinscription n'échoue pas pour autant.
 *  · Journaux : jamais l'adresse (page confidentialité, 3.5), ni l'erreur
 *    réseau brute, dont l'URL contient l'adresse.
 */
async function desinscrireContactResend(email: string): Promise<boolean> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle || !process.env.RESEND_AUDIENCE_ID) {
    console.error(
      "[email-preferences] RESEND_API_KEY ou RESEND_AUDIENCE_ID absent — pas de liste à mettre à jour, " +
        "désinscription enregistrée côté compte seulement.",
    );
    return true;
  }
  // L'adresse va dans le chemin : on encode ce qui le casserait (#, ?, /, %…)
  // mais on laisse « @ » et « + » tels quels, comme l'exemple de la doc et le
  // SDK, pour ne pas dépendre du décodage de Resend dans le cas courant.
  const segment = encodeURIComponent(email).replace(/%40/g, "@").replace(/%2B/gi, "+");
  const PAUSES_MS = [1_000, 4_000];
  let dernier = "";
  for (let essai = 0; essai <= PAUSES_MS.length; essai++) {
    if (essai > 0) await new Promise((r) => setTimeout(r, PAUSES_MS[essai - 1]));
    try {
      const res = await fetch(`https://api.resend.com/contacts/${segment}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
        body: JSON.stringify({ unsubscribed: true }),
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok || res.status === 404) return true;
      if (res.status === 401 || res.status === 403) {
        console.error(
          `[email-preferences] Clé Resend sans accès aux contacts (HTTP ${res.status}) — contact non marqué. ` +
            "La série serie-suivi-pea ne peut pas lire la liste avec cette clé ; il faut une clé « Full access ».",
        );
        return true;
      }
      dernier = `HTTP ${res.status}`;
      if (res.status !== 429 && res.status < 500) break; // 400, 422… : réessayer n'y changerait rien
    } catch (err) {
      dernier = err instanceof Error ? err.name : "erreur réseau"; // TimeoutError, TypeError (fetch failed)
    }
  }
  console.error(`[email-preferences] Désinscription du contact Resend échouée (${dernier}).`);
  return false;
}

/**
 * Empreinte d'une adresse pour les journaux (02/10/2026) : HMAC tronqué, avec
 * le même secret que les jetons et un préfixe de domaine à part. Elle permet
 * de retrouver un cas à la main (calculer l'empreinte des adresses candidates,
 * contacts Resend ou comptes Clerk, et comparer) sans que l'adresse figure
 * dans les journaux Vercel, ce que la page confidentialité (3.5) exclut.
 */
export function empreinteAdresse(email: string): string {
  const secret = getSecret();
  if (!secret) return "sans-secret";
  return createHmac("sha256", secret).update(`trace.v1:${email.trim().toLowerCase()}`).digest("hex").slice(0, 12);
}

/**
 * Enregistre la désinscription pour une adresse : dans Clerk (comptes) ET
 * dans Resend (liste des emails occasionnels, voir desinscrireContactResend).
 *
 * Renvoie true même si aucun compte ni contact ne correspond : répondre
 * « introuvable » à quelqu'un qui demande à partir serait absurde, et ça
 * évite de révéler l'existence d'un compte à partir d'une adresse. Renvoie
 * false si l'un des deux enregistrements a échoué : la route l'affiche et le
 * journalise pour traitement à la main.
 */
export async function optOutByEmail(email: string): Promise<boolean> {
  // Les deux écritures sont indépendantes : un échec de l'une ne doit pas
  // empêcher l'autre.
  const [clerkOk, resendOk] = await Promise.all([
    (async () => {
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
    })(),
    desinscrireContactResend(email),
  ]);
  return clerkOk && resendOk;
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
