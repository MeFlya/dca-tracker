// Série « suivi d'un PEA » (02/10/2026) — cron quotidien, vercel.json
// « 0 8 * * * » (8 h UTC). Envoie l'email J+3 puis l'email J+7 aux personnes
// qui ont COCHÉ « Recevoir aussi les emails occasionnels de DCA Tracker sur le
// suivi d'un PEA » (ModeleGratuitForm, EmailCapture → /api/subscribe →
// subscribeEmail, qui n'ajoute le contact à l'audience RESEND_AUDIENCE_ID
// qu'avec la case cochée).
//
// ─── COMMENT ÇA MARCHE, SANS BASE DE DONNÉES ─────────────────────────────────
//
//  1. On lit TOUTE l'audience Resend (le seul endroit où un prospect existe),
//     page par page. Si la lecture échoue, on n'envoie rien (502).
//  2. Chaque contact est rangé par classerContact (src/lib/serie-suivi-pea.ts) :
//     créé avant la coupure du 02/10/2026 → jamais ; `unsubscribed` autre que
//     false → jamais ; créé dans la fenêtre de 24 h de J+3 ou de J+7 (calée
//     sur l'heure du cron, pas sur l'heure réelle) → l'étape correspondante.
//  3. Un appel Clerk par contact retenu (lireCompte) : un compte désinscrit
//     est sauté, et un compte dont la séquence d'accueil écrit à moins de
//     24 h de ce passage aussi (accueilProche, serie-suivi-pea.ts).
//  4. Envoi par sendEmail (kind « lifecycle » par défaut), avec la préférence
//     déjà lue (`optedOut`) : il ajoute le lien de désinscription et les
//     en-têtes List-Unsubscribe. Si Clerk n'a pas répondu, sendEmail refait
//     lui-même la vérification.
//
// ─── LES CAS DIFFICILES ──────────────────────────────────────────────────────
//
//  · Désinscription par notre lien ou par le bouton de Gmail : optOutByEmail
//    marque désormais AUSSI le contact Resend `unsubscribed: true`
//    (email-preferences.ts) ; il sort de la série dès le passage suivant.
//    Avant le 02/10/2026, il n'écrivait que dans Clerk, où ces prospects
//    n'existent pas.
//  · Passage déclenché deux fois (Vercel le dit possible) ou relancé à la main
//    le même jour : même ancre, mêmes contacts, mais chaque envoi porte une
//    clé d'idempotence `serie-suivi-pea/<étape>/<id du contact>` ; pendant
//    24 h, Resend répond par le premier envoi sans en refaire un. Deux
//    passages de même ancre sont toujours à moins de 24 h l'un de l'autre.
//  · Échec passager (429 de débit, 5xx dont le 503 `service_unavailable`,
//    réseau ; règle estPassagere) : deux nouvelles tentatives, même clé,
//    donc sans risque de doublon. Un quota du jour ou du mois dépassé (429
//    aussi) n'est pas réessayé. Échec persistant : journalisé, compté, et
//    le contact n'aura pas cette étape (le lendemain, il est hors fenêtre).
//    Une relance manuelle LE JOUR MÊME rattrape les échecs sans doublonner
//    les envois réussis.
//  · Passage manqué par Vercel (« best effort ») : la cohorte de ce jour-là
//    n'a pas l'étape. Choix assumé : sans état, rattraper un jour manqué
//    exposerait au double envoi ; on préfère un email en moins.
//  · Fuseau : tout en UTC (voir serie-suivi-pea.ts).
//  · Compte créé le même jour que l'inscription à la liste : la séquence
//    d'accueil (cron onboarding-emails, 9 h UTC) écrit aussi à J+3 et J+7.
//    L'étape de la série est sautée quand un email d'accueil part à moins de
//    24 h (constat de relecture du 02/10/2026 : deux emails à une heure
//    d'écart, deux fois). Comptée « sautesAccueil ».
//  · Journaux : jamais d'adresse en clair (page confidentialité, 3.5) ;
//    l'identifiant de contact Resend suffit à retrouver un cas dans le
//    tableau de bord Resend.
//
// ─── MODE SIMULATION ─────────────────────────────────────────────────────────
//
// `?dry=1`, sous la MÊME authentification (Authorization: Bearer CRON_SECRET) :
// lit l'audience, range les contacts et renvoie les compteurs par étape, sans
// rien envoyer et sans aucune adresse. Il interroge Clerk comme le ferait
// l'envoi (désinscrits côté compte, séquence d'accueil en cours). C'est aussi
// le test de la clé Resend : un 502 avec `restricted_api_key` dans le journal
// veut dire une clé « Sending access », sans accès aux contacts ; il faut une
// clé « Full access » (la désinscription l'utilise aussi).
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//     "https://dcatracker.fr/api/cron/serie-suivi-pea?dry=1"

import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { denyUnlessCron } from "@/lib/cron-auth";
import { resend, cleResendManquante } from "@/lib/resend-client";
import { isOptedOutFromMetadata } from "@/lib/email-preferences";
import { EnvoiRefuse, sendEmail } from "@/lib/emails/dispatch";
import { contenuSerieSuiviPea, type MessageSerie } from "@/lib/emails/serie-suivi-pea";
import {
  ETAPES_SERIE,
  SERIE_COUPURE,
  accueilProche,
  ancreDuPassage,
  classerContact,
  cleIdempotence,
  estPassagere,
  fenetreEtape,
  finDeLAncre,
  sansAdresse,
  type ContactListe,
  type EtapeSerie,
} from "@/lib/serie-suivi-pea";

export const dynamic = "force-dynamic";
// Au plus 60 s, la limite haute du plan Hobby sans Fluid compute ; le budget
// d'envoi ci-dessous s'arrête avant.
export const maxDuration = 60;

/** Contacts par page (maximum de l'API List Contacts). */
const PAR_PAGE = 100;
/** Garde-fou de pagination : 20 000 contacts. Au-delà, on n'envoie rien. */
const PAGES_MAX = 200;
/**
 * Plafond d'envois d'un passage. Une journée normale en compte quelques-uns ;
 * au-delà, c'est une anomalie (import massif dans l'audience, bug de date) et
 * on n'envoie RIEN plutôt que d'écrire à des centaines de personnes. La
 * simulation montre le chiffre.
 */
const ENVOIS_MAX = 200;
/** Temps d'envoi au-delà duquel on s'arrête (les restants sont « non tentés »). */
const BUDGET_MS = 45_000;
/**
 * Tentatives par appel Resend, et pauses entre elles. Seules les erreurs
 * passagères sont réessayées (estPassagere, serie-suivi-pea.ts) ; les autres
 * (quota du jour ou du mois, contenu refusé, clé invalide, 409
 * `invalid_idempotent_request`) ne changeraient pas en réessayant.
 * 02/10/2026 : le motif précédent, une expression régulière sur le nom,
 * oubliait le 503 `service_unavailable` que la doc des erreurs liste.
 */
const ESSAIS = 3;
const PAUSES_MS = [1_000, 4_000];

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ContactLu = ContactListe & { email: string };

/** Lit toute l'audience. Lève si une page est refusée après les reprises. */
async function lireAudience(segmentId: string): Promise<ContactLu[]> {
  // `segmentId` : depuis novembre 2025, les audiences Resend s'appellent des
  // segments (doc « Migrating from Audiences to Segments », consultée le
  // 02/10/2026) et le SDK lit GET /segments/{id}/contacts. L'identifiant
  // d'audience déjà en place est celui du segment.
  const tous: ContactLu[] = [];
  let apres: string | undefined;
  for (let page = 0; page < PAGES_MAX; page++) {
    let reponse = await resend.contacts.list({ segmentId, limit: PAR_PAGE, after: apres });
    for (
      let essai = 1;
      reponse.error && essai < ESSAIS && estPassagere(reponse.error.name, reponse.error.statusCode);
      essai++
    ) {
      await attendre(PAUSES_MS[essai - 1]);
      reponse = await resend.contacts.list({ segmentId, limit: PAR_PAGE, after: apres });
    }
    if (reponse.error) {
      throw new Error(`liste refusée (${reponse.error.name}, HTTP ${reponse.error.statusCode ?? "?"}) : ${reponse.error.message}`);
    }
    const { data, has_more } = reponse.data;
    for (const c of data) {
      tous.push({ id: c.id, email: c.email, created_at: c.created_at, unsubscribed: c.unsubscribed });
    }
    if (!has_more || data.length === 0) return tous;
    apres = data[data.length - 1].id;
  }
  throw new Error(`plus de ${PAGES_MAX * PAR_PAGE} contacts : lecture interrompue`);
}

/**
 * Ce que Clerk dit d'une adresse : désinscrite depuis son compte, et séquence
 * d'accueil à moins de 24 h. Une adresse sans compte n'est ni l'un ni
 * l'autre. Renvoie null si Clerk ne répond pas : l'envoi laisse alors
 * sendEmail revérifier la désinscription, et la séquence d'accueil n'est pas
 * prise en compte (au pire, deux emails le même jour, jamais un envoi à un
 * désinscrit qu'on aurait pu voir).
 */
async function lireCompte(email: string, maintenant: number): Promise<{ desinscrit: boolean; accueil: boolean } | null> {
  try {
    const { data: users } = await (await clerkClient()).users.getUserList({ emailAddress: [email], limit: 1 });
    const user = users[0];
    if (!user) return { desinscrit: false, accueil: false };
    const meta = user.privateMetadata as Record<string, unknown> | undefined;
    return {
      desinscrit: isOptedOutFromMetadata(meta),
      accueil: accueilProche(meta?.onboarding, maintenant),
    };
  } catch {
    return null;
  }
}

/** sendEmail avec reprise sur erreur passagère. Même clé d'idempotence à chaque tentative. */
async function envoyer(
  to: string,
  message: MessageSerie,
  idempotencyKey: string,
  optedOut: boolean | undefined,
): Promise<boolean> {
  for (let essai = 1; ; essai++) {
    try {
      return await sendEmail({ to, ...message, replyTo: "hello@dcatracker.fr", idempotencyKey, optedOut });
    } catch (err) {
      const passagere = err instanceof EnvoiRefuse && estPassagere(err.code, err.statut);
      if (essai >= ESSAIS || !passagere) throw err;
      await attendre(PAUSES_MS[essai - 1]);
    }
  }
}

interface BilanEtape {
  /** Contacts créés dans la fenêtre de l'étape, après la coupure, non désinscrits côté Resend. */
  concernes: number;
  /** Simulation : partiraient. */
  aEnvoyer: number;
  /** Envoi : acceptés par Resend (un rejeu le même jour renvoie le même envoi, sans doublon). */
  envoyes: number;
  /** Désinscrits depuis leur compte (Clerk) : sautés. */
  desinscritsCompte: number;
  /** Compte dont la séquence d'accueil écrit à moins de 24 h : étape sautée. */
  sautesAccueil: number;
  erreurs: number;
  /** Budget de temps épuisé avant leur tour. */
  nonTentes: number;
  fenetre: { debut: string; fin: string };
}

export async function GET(req: Request) {
  const denied = denyUnlessCron(req);
  if (denied) return denied;

  const simulation = new URL(req.url).searchParams.get("dry") === "1";
  const mode = simulation ? "simulation" : "envoi";

  const segmentId = process.env.RESEND_AUDIENCE_ID;
  if (!segmentId) {
    console.error("[serie-suivi-pea] RESEND_AUDIENCE_ID absent — aucune audience à lire, rien envoyé.");
    return NextResponse.json({ error: "RESEND_AUDIENCE_ID absent" }, { status: 503 });
  }
  if (cleResendManquante) {
    console.error("[serie-suivi-pea] RESEND_API_KEY absent — rien envoyé.");
    return NextResponse.json({ error: "RESEND_API_KEY absent" }, { status: 503 });
  }

  const debut = Date.now();
  const ancre = ancreDuPassage(debut);

  let contacts: ContactLu[];
  try {
    contacts = await lireAudience(segmentId);
  } catch (err) {
    console.error(`[serie-suivi-pea] ${mode} : audience illisible, rien envoyé — ${sansAdresse(String(err))}`);
    return NextResponse.json({ error: "Audience Resend illisible — rien envoyé." }, { status: 502 });
  }

  const bilan = Object.fromEntries(
    ETAPES_SERIE.map((e) => {
      const f = fenetreEtape(ancre, e.delaiJours);
      const b: BilanEtape = {
        concernes: 0,
        aEnvoyer: 0,
        envoyes: 0,
        desinscritsCompte: 0,
        sautesAccueil: 0,
        erreurs: 0,
        nonTentes: 0,
        fenetre: { debut: new Date(f.debut).toISOString(), fin: new Date(f.fin).toISOString() },
      };
      return [e.id, b];
    }),
  ) as Record<EtapeSerie, BilanEtape>;
  const ignores = { avantCoupure: 0, desinscritsResend: 0, datesIllisibles: 0 };
  const aEcrire: { contact: ContactLu; etape: EtapeSerie }[] = [];

  for (const contact of contacts) {
    const r = classerContact(contact, ancre);
    if (r.statut === "a-ecrire") {
      aEcrire.push({ contact, etape: r.etape });
      bilan[r.etape].concernes++;
    } else if (r.statut === "avant-coupure") ignores.avantCoupure++;
    else if (r.statut === "desinscrit") ignores.desinscritsResend++;
    else if (r.statut === "date-illisible") ignores.datesIllisibles++;
  }

  const rapport = () => ({
    mode,
    ancre: new Date(ancre).toISOString(),
    coupure: SERIE_COUPURE,
    contactsLus: contacts.length,
    etapes: bilan,
    ignores,
  });

  if (ignores.datesIllisibles > 0) {
    console.error(
      `[serie-suivi-pea] ${ignores.datesIllisibles} contact(s) à created_at illisible, laissés de côté — format Resend changé ?`,
    );
  }

  if (aEcrire.length > ENVOIS_MAX) {
    console.error(
      `[serie-suivi-pea] ${aEcrire.length} contacts dans les fenêtres (plafond ${ENVOIS_MAX}) : anomalie, rien envoyé.`,
    );
    return NextResponse.json({ error: "Plafond de sécurité dépassé — rien envoyé.", ...rapport() }, { status: 500 });
  }

  if (simulation) {
    for (const { contact, etape } of aEcrire) {
      const compte = await lireCompte(contact.email, debut);
      if (compte?.desinscrit) bilan[etape].desinscritsCompte++;
      else if (compte?.accueil) bilan[etape].sautesAccueil++;
      else bilan[etape].aEnvoyer++;
    }
    return NextResponse.json({ ok: true, ...rapport() });
  }

  // Contenu construit une fois par étape, avant le premier envoi : s'il ne
  // peut pas l'être (produit absent de products.ts), personne ne reçoit un
  // email à moitié rempli.
  let messages: Record<EtapeSerie, MessageSerie>;
  try {
    messages = { j3: contenuSerieSuiviPea("j3"), j7: contenuSerieSuiviPea("j7") };
  } catch (err) {
    console.error(`[serie-suivi-pea] gabarits impossibles à construire, rien envoyé — ${String(err)}`);
    return NextResponse.json({ error: "Gabarits indisponibles — rien envoyé.", ...rapport() }, { status: 500 });
  }

  for (const { contact, etape } of aEcrire) {
    const b = bilan[etape];
    if (Date.now() - debut > BUDGET_MS) {
      b.nonTentes++;
      continue;
    }
    const compte = await lireCompte(contact.email, Date.now());
    if (compte?.desinscrit) {
      b.desinscritsCompte++;
      continue;
    }
    if (compte?.accueil) {
      b.sautesAccueil++;
      continue;
    }
    try {
      // Préférence déjà lue : sendEmail ne refait pas l'appel Clerk. Clerk
      // muet (null) : undefined, et sendEmail revérifie de son côté.
      const parti = await envoyer(contact.email, messages[etape], cleIdempotence(etape, contact.id), compte ? false : undefined);
      if (parti) b.envoyes++;
      else b.desinscritsCompte++;
    } catch (err) {
      b.erreurs++;
      console.error(
        `[serie-suivi-pea] ${etape} — contact ${contact.id} : échec — ${sansAdresse(err instanceof Error ? err.message : String(err))}`,
      );
    }
  }

  const erreurs = ETAPES_SERIE.reduce((s, e) => s + bilan[e.id].erreurs + bilan[e.id].nonTentes, 0);
  console.log(
    `[serie-suivi-pea] ancre ${new Date(ancre).toISOString()} — ` +
      ETAPES_SERIE.map(
        (e) =>
          `${e.id} : ${bilan[e.id].envoyes} envoyé(s), ${bilan[e.id].desinscritsCompte} désinscrit(s) compte, ` +
          `${bilan[e.id].sautesAccueil} sauté(s) pour la séquence d'accueil, ` +
          `${bilan[e.id].erreurs} erreur(s), ${bilan[e.id].nonTentes} non tenté(s)`,
      ).join(" ; ") +
      ` — ignorés : ${ignores.avantCoupure} avant coupure, ${ignores.desinscritsResend} désinscrit(s) Resend.`,
  );
  if (erreurs > 0) {
    console.error(
      `[serie-suivi-pea] ${erreurs} envoi(s) manqué(s). Une relance manuelle avant ${new Date(finDeLAncre(ancre)).toISOString()} ` +
        "les rattrape sans doublon (même ancre, clé d'idempotence) ; après, ces contacts n'auront pas cette étape.",
    );
  }

  return NextResponse.json({ ok: erreurs === 0, ...rapport() });
}
