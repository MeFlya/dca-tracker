/**
 * Verrou des boutons de paiement — un seul départ vers Stripe à la fois.
 *
 * ─── Le constat (revue du 05/10/2026, enquête du 14/10/2026) ────────────────
 *
 * Sur les 5 sessions Checkout ouvertes du 28/09 au 05/10/2026, deux paires
 * ont été créées à une seconde d'intervalle. Reproduit en local le 14/10
 * (Chromium, réponse du checkout simulée à 1,5 s, sans appel à Stripe) :
 *
 *   · double clic sur UN bouton produit : 1 seule session. L'état `loading`
 *     désactivait déjà ce bouton-là ;
 *   · mais une page produit porte TROIS boutons d'achat (hero, appel final,
 *     barre collante sur mobile), chacun avec son propre `loading`. Un clic
 *     sur l'un, puis un second sur un autre pendant l'attente : 2 sessions,
 *     à 0,4 et 0,9 s d'écart. C'est la cause la plus probable des paires ;
 *   · Premium (/tarifs) : le `finally { setLoading(false) }` réactivait le
 *     bouton dès la réponse reçue, PENDANT le chargement de Stripe — un
 *     second clic dans cette fenêtre ouvrait une seconde session.
 *
 * ─── Ce que fait ce module ───────────────────────────────────────────────────
 *
 *   1. Un verrou de MODULE, donc partagé par tous les boutons de la page :
 *      tant qu'un départ est en cours, les autres clics ne font rien. Il est
 *      pris de façon synchrone, avant tout `await` : deux clics arrivés avant
 *      le rendu suivant ne passent pas tous les deux.
 *   2. Une « tentative » : identifiant aléatoire envoyé avec la demande. Le
 *      serveur en fait la clé d'idempotence de Stripe : si le navigateur
 *      rejoue la même requête (coupure réseau, nouvel essai automatique),
 *      Stripe renvoie la MÊME session au lieu d'en créer une seconde.
 *   3. Le verrou n'est rendu qu'en cas d'échec. En cas de succès, la page
 *      part vers Stripe et le bouton reste sur « Redirection… ». Si la
 *      personne revient par le bouton Retour (page restaurée depuis le cache
 *      du navigateur), `surRetourArriere` rend le verrou et réactive le
 *      bouton : sinon il resterait bloqué.
 */

let enCours = false;
let tentative: string | null = null;

function nouvelIdentifiant(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* contexte non sécurisé : repli ci-dessous */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Prend le verrou. Renvoie l'identifiant de la tentative, ou null si un
 * départ est déjà en cours (le clic doit alors être ignoré).
 */
export function prendreVerrouPaiement(): string | null {
  if (enCours) return null;
  enCours = true;
  tentative = nouvelIdentifiant();
  return tentative;
}

/** Rend le verrou après un échec (erreur affichée, le visiteur peut réessayer). */
export function rendreVerrouPaiement(): void {
  enCours = false;
  tentative = null;
}

/**
 * Appelle `rappel` quand la page est restaurée depuis le cache du navigateur
 * (retour depuis Stripe), après avoir rendu le verrou. Renvoie la fonction de
 * nettoyage, pour un useEffect.
 */
export function surRetourArriere(rappel: () => void): () => void {
  const ecoute = (e: PageTransitionEvent) => {
    if (!e.persisted) return;
    rendreVerrouPaiement();
    rappel();
  };
  window.addEventListener("pageshow", ecoute);
  return () => window.removeEventListener("pageshow", ecoute);
}

/** Délai au-delà duquel on abandonne l'appel au serveur (le verrou est rendu). */
const DELAI_MAX_PAIEMENT_MS = 20_000;

/**
 * Signal d'abandon après DELAI_MAX_PAIEMENT_MS, pour fetch. undefined sur les
 * navigateurs sans AbortSignal.timeout (Safari avant 16) : l'appel part alors
 * sans délai plutôt que d'échouer.
 */
export function signalDelaiPaiement(): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(DELAI_MAX_PAIEMENT_MS)
    : undefined;
}

/** Forme acceptée par le serveur pour une tentative (UUID ou repli ci-dessus). */
export const FORME_TENTATIVE = /^[a-z0-9-]{16,64}$/i;

/** Clé d'idempotence Stripe, ou undefined si la tentative reçue n'est pas conforme. */
export function cleIdempotence(prefixe: string, tentativeRecue: unknown): string | undefined {
  return typeof tentativeRecue === "string" && FORME_TENTATIVE.test(tentativeRecue)
    ? `${prefixe}-${tentativeRecue}`
    : undefined;
}
