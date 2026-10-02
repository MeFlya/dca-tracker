// Série « suivi d'un PEA » : deux emails après l'inscription aux emails
// occasionnels (02/10/2026). Ce fichier ne contient que la règle de tri,
// sans import ni réseau : qui reçoit quelle étape, et quand. L'envoi est dans
// src/app/api/cron/serie-suivi-pea/route.ts, les gabarits dans
// src/lib/emails/serie-suivi-pea.ts.
//
// ─── POURQUOI UNE FENÊTRE, ET PAS UN « DÉJÀ ENVOYÉ » ─────────────────────────
//
// Il n'y a pas de base de données pour les prospects : l'audience Resend est
// le seul endroit où ils existent (commentaire en tête de subscribeEmail,
// email-provider.ts), et la liste des contacts ne renvoie que id, email,
// created_at et unsubscribed — rien où noter « étape 2 partie ». On ne stocke
// donc rien : chaque passage du cron calcule une ANCRE (la dernière heure
// pleine HEURE_CRON_UTC passée) et l'étape J+N part aux contacts créés dans
// [ancre − (N+1) jours, ancre − N jours[. Deux passages de deux jours
// consécutifs ont deux ancres distantes de 24 h exactement : leurs fenêtres se
// touchent sans se chevaucher, chaque contact tombe dans UNE fenêtre par étape.
// Au moment de l'envoi, le contact est inscrit depuis 3 à 4 jours (J+3) ou 7 à
// 8 jours (J+7), plus le retard du passage sur l'heure pleine (59 min au plus).
//
// L'ancre ne dépend pas de l'heure réelle d'exécution : sur le plan Hobby,
// Vercel déclenche « 0 8 * * * » entre 8 h 00 et 8 h 59 UTC (doc Cron Jobs,
// « Usage & Pricing », consultée le 02/10/2026). Calculer la fenêtre depuis
// `Date.now()` aurait laissé des trous ou des doublons d'une heure au plus.
//
// Ce que la fenêtre ne règle pas seule — un passage rejoué le même jour —
// est réglé à l'envoi par une clé d'idempotence Resend (24 h), voir la route.
//
// Ce fichier porte aussi deux petites règles sans réseau utilisées par la
// route et par la désinscription : estPassagere (quelle erreur Resend vaut une
// reprise) et accueilProche (ne pas doubler la séquence d'accueil d'un compte).
//
// ⚠️ Tout est en UTC : l'ancre, les fenêtres et `created_at` (que Resend
// renvoie en « +00 »). « 8 h UTC », c'est 10 h à Paris l'été, 9 h l'hiver.

/** Jour en millisecondes. */
const JOUR_MS = 86_400_000;

/**
 * Heure UTC du cron dans vercel.json (« 0 8 * * * »). À changer AUX DEUX
 * endroits. Un écart ne casse pas la série (deux passages consécutifs restent
 * à 24 h d'ancre), il décale seulement l'âge des contacts au moment de l'envoi.
 */
export const HEURE_CRON_UTC = 8;

/**
 * Marge avant l'heure pleine. Une horloge de fonction en retard d'une seconde
 * sur celle du planificateur Vercel ferait prendre l'ancre de la veille : la
 * cohorte du jour serait sautée (et celle de la veille, re-sélectionnée, ne
 * partirait pas deux fois grâce à l'idempotence). 15 minutes couvrent ce cas
 * sans rien changer aux passages normaux (8 h 00 à 8 h 59).
 */
const TOLERANCE_MS = 15 * 60_000;

/**
 * DATE DE COUPURE (02/10/2026). La case « Recevoir aussi les emails
 * occasionnels » est en ligne depuis le commit 328ca82 (01/10/2026, 22 h 21,
 * heure de Paris ; vérifiée en production le 02/10). Avant, chaque demande de
 * ressource ajoutait l'adresse à l'audience SANS case cochée : ces contacts
 * n'ont pas consenti et ne reçoivent JAMAIS cette série. Minuit UTC le
 * lendemain laisse 3 h 40 de marge après le déploiement.
 *
 * Effet voulu : une personne inscrite avant la coupure qui coche la case
 * après garde son `created_at` d'origine (le contact existe déjà chez Resend)
 * et reste exclue. On perd quelques envois légitimes plutôt que d'en faire un
 * seul sans consentement.
 */
export const SERIE_COUPURE = "2026-10-02T00:00:00Z";
const COUPURE_MS = Date.parse(SERIE_COUPURE);

export type EtapeSerie = "j3" | "j7";

/** Les deux étapes, dans l'ordre. `delaiJours` : âge minimal du contact. */
export const ETAPES_SERIE: readonly { id: EtapeSerie; delaiJours: number }[] = [
  { id: "j3", delaiJours: 3 },
  { id: "j7", delaiJours: 7 },
];

/**
 * Lit un `created_at` Resend. La doc (List Contacts, consultée le 02/10/2026)
 * le montre sous la forme « 2026-10-06 23:47:56.678+00 » : espace au lieu du
 * T, décalage sans minutes. Le parseur de `Date` n'est pas tenu d'accepter ce
 * format ; on le remet en ISO 8601 avant. Une date illisible renvoie null, et
 * le contact n'est pas écrit — jamais d'envoi sur un doute.
 */
export function lireDateResend(valeur: unknown): number | null {
  if (typeof valeur !== "string") return null;
  const m = valeur
    .trim()
    .match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i);
  if (!m) return null;
  const [, jour, heure, decalageBrut] = m;
  let decalage = "Z";
  if (decalageBrut && decalageBrut.toUpperCase() !== "Z") {
    const d = decalageBrut.replace(":", "");
    decalage = `${d.slice(0, 3)}:${d.length > 3 ? d.slice(3, 5) : "00"}`;
  }
  const t = Date.parse(`${jour}T${heure}${decalage}`);
  return Number.isNaN(t) ? null : t;
}

/** Ancre du passage : la dernière HEURE_CRON_UTC:00 passée (à la tolérance près). */
export function ancreDuPassage(maintenant: number): number {
  const repere = maintenant + TOLERANCE_MS;
  const d = new Date(repere);
  const duJour = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), HEURE_CRON_UTC);
  return duJour <= repere ? duJour : duJour - JOUR_MS;
}

/**
 * Dernier instant où un passage retombe sur la même ancre (l'ancre suivante,
 * moins la tolérance). Une relance manuelle avant cette heure rattrape les
 * échecs du jour sans doublon : elle est à moins de 24 h des premiers envois,
 * dans la durée de vie des clés d'idempotence Resend.
 */
export function finDeLAncre(ancre: number): number {
  return ancre + JOUR_MS - TOLERANCE_MS;
}

/** Fenêtre de création [debut, fin[ servie par l'étape J+`delaiJours` à cette ancre. */
export function fenetreEtape(ancre: number, delaiJours: number): { debut: number; fin: number } {
  return { debut: ancre - (delaiJours + 1) * JOUR_MS, fin: ancre - delaiJours * JOUR_MS };
}

/** Ce que la liste Resend donne d'un contact, et rien de plus. */
export interface ContactListe {
  id: string;
  created_at: string;
  unsubscribed: boolean;
}

export type Classement =
  | { statut: "date-illisible" }
  | { statut: "avant-coupure" }
  | { statut: "desinscrit" }
  | { statut: "hors-fenetre" }
  | { statut: "a-ecrire"; etape: EtapeSerie };

/**
 * Range un contact. L'ordre des tests compte : la date illisible et la
 * coupure passent AVANT tout le reste, pour qu'aucune autre règle ne puisse
 * un jour faire écrire à un contact sans consentement.
 */
export function classerContact(contact: ContactListe, ancre: number): Classement {
  const cree = lireDateResend(contact.created_at);
  if (cree === null) return { statut: "date-illisible" };
  if (cree < COUPURE_MS) return { statut: "avant-coupure" };
  // Seul un `false` explicite autorise l'envoi : un champ absent ou d'un autre
  // type (changement de format côté Resend) compte comme désinscrit. Même
  // logique que la case du formulaire, lue en booléen strict.
  if (contact.unsubscribed !== false) return { statut: "desinscrit" };
  for (const e of ETAPES_SERIE) {
    const { debut, fin } = fenetreEtape(ancre, e.delaiJours);
    if (cree >= debut && cree < fin) return { statut: "a-ecrire", etape: e.id };
  }
  return { statut: "hors-fenetre" };
}

/**
 * Clé d'idempotence Resend d'un envoi (≤ 256 caractères, gardée 24 h par
 * Resend). Stable pour un contact et une étape : un second passage dans la
 * même journée d'ancre renvoie la réponse du premier sans renvoyer l'email.
 */
export function cleIdempotence(etape: EtapeSerie, contactId: string): string {
  return `serie-suivi-pea/${etape}/${contactId}`.slice(0, 256);
}

/**
 * Retire toute adresse email d'un texte avant de le journaliser. La page
 * confidentialité (3.5) dit que l'adresse n'est pas dans nos journaux ; un
 * message d'erreur de Resend pourrait la citer.
 */
export function sansAdresse(texte: string): string {
  return texte.replace(/[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+/g, "[adresse]");
}

/**
 * Noms d'erreur Resend qui valent une nouvelle tentative (02/10/2026, doc
 * « Errors » consultée ce jour). `service_unavailable` (503) n'est pas dans
 * les types du SDK 6.18.1, mais le SDK renvoie tel quel le JSON d'erreur de
 * l'API : c'est ce nom-là qui arrive. `application_error` couvre aussi la
 * coupure réseau (le SDK la range sous ce nom, statut null).
 * Volontairement absents : `daily_quota_exceeded` et `monthly_quota_exceeded`,
 * des 429 qui ne changeront pas dans les 5 secondes d'une reprise.
 */
const NOMS_PASSAGERS = new Set([
  "rate_limit_exceeded",
  "concurrent_idempotent_requests",
  "application_error",
  "internal_server_error",
  "service_unavailable",
]);

/** Erreur Resend passagère : un nom ci-dessus, ou tout statut 5xx (nom inconnu compris). */
export function estPassagere(nom: string | null | undefined, statut: number | null | undefined): boolean {
  return (typeof statut === "number" && statut >= 500) || (nom != null && NOMS_PASSAGERS.has(nom));
}

/** Les dates de la séquence d'accueil d'un compte (privateMetadata.onboarding, onboarding/welcome). */
const ACCUEIL_ENVOYES = ["welcomeSentAt", "day3SentAt", "day7SentAt", "day14SentAt"] as const;
const ACCUEIL_PREVUS = [
  ["scheduledDay3At", "day3SentAt"],
  ["scheduledDay7At", "day7SentAt"],
  ["scheduledDay14At", "day14SentAt"],
] as const;

/**
 * Un email de la séquence d'accueil du compte part-il à moins de 24 h de ce
 * passage (envoyé depuis moins de 24 h, ou dû dans les 24 h) ? (02/10/2026)
 *
 * POURQUOI : la séquence d'accueil (cron onboarding-emails, 9 h UTC) écrit à
 * J+3, J+7 et J+14 de la création du compte ; cette série, à J+3 et J+7 de
 * l'inscription à la liste. Quelqu'un qui crée son compte et coche la case le
 * même jour recevait deux emails non transactionnels à une heure d'écart, deux
 * fois. Dans ce cas, l'étape de la série est sautée (sans état, elle ne se
 * rattrape pas) : la séquence du compte passe en premier, la page du guide
 * reste en ligne.
 *
 * Une date illisible ne compte pas : on ne saute pas une étape sur un doute
 * de format, l'écart reste un simple doublon.
 */
export function accueilProche(onboarding: unknown, maintenant: number): boolean {
  if (!onboarding || typeof onboarding !== "object") return false;
  const o = onboarding as Record<string, unknown>;
  const date = (cle: string): number | null => {
    const v = o[cle];
    if (typeof v !== "string") return null;
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  };
  for (const cle of ACCUEIL_ENVOYES) {
    const t = date(cle);
    if (t !== null && t <= maintenant && maintenant - t < JOUR_MS) return true;
  }
  for (const [prevu, envoye] of ACCUEIL_PREVUS) {
    const t = date(prevu);
    // Pas encore parti et dû avant demain même heure : le cron d'accueil
    // l'enverra à son prochain passage, aujourd'hui ou demain à 9 h UTC.
    if (t !== null && !o[envoye] && t <= maintenant + JOUR_MS) return true;
  }
  return false;
}
