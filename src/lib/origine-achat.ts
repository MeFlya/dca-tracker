/**
 * Origine d'un achat : la page du site d'où vient l'acheteur.
 *
 * ─── Pourquoi (30/09/2026) ──────────────────────────────────────────────────
 *
 * Un paiement Stripe ne disait pas d'où venait l'acheteur. Les événements
 * personnalisés de Vercel ne sont pas enregistrés sur le plan gratuit (voir
 * EVENEMENTS_PERSONNALISES_ACTIFS dans analytics.ts) : les `track()` posés sur
 * les renvois et les boutons d'achat n'arrivent nulle part. La seule mesure qui
 * tienne est donc de transmettre la page d'origine AVEC le paiement, dans les
 * métadonnées de la session Checkout.
 *
 * ─── Ce qui est transmis ────────────────────────────────────────────────────
 *
 * Une chaîne courte, sous l'une de ces formes, et rien d'autre :
 *
 *   /guide/dca-pea          une page du site : le chemin seul, jamais la query
 *                           ni le fragment. Les segments dynamiques du site sont
 *                           des slugs publics (ETF, glossaire, comparatifs),
 *                           pas des identifiants de personne.
 *   direct                  aucun référent : adresse tapée, favori, application
 *                           mail, ou site qui masque son référent.
 *   externe:www.google.com  le NOM DE DOMAINE du site référent, seul.
 *   inconnue                valeur absente ou refusée par le serveur (ancien
 *                           onglet ouvert avant ce déploiement, requête forgée…).
 *
 * ─── D'où vient la valeur, par ordre de priorité ────────────────────────────
 *
 *   1. Le DERNIER renvoi produit cliqué dans cet onglet (LienRenvoiProduit),
 *      gardé en sessionStorage : c'est la page de contenu qui a envoyé vers la
 *      vente. Il survit à l'aller-retour vers Stripe ou vers l'inscription,
 *      et disparaît à la fermeture de l'onglet.
 *   2. À défaut, document.referrer : chemin seul s'il est du même domaine,
 *      « externe:<domaine> » sinon, « direct » s'il est vide.
 *
 * Relecture du 30/09/2026 : la valeur tirée du référent est FIGÉE (même clé
 * sessionStorage) au premier clic d'achat de l'onglet — `figerOrigineDeLAchat`.
 * Sans ça, l'acheteur qui annule sur Stripe revient sur la page produit par un
 * chargement complet, son référent devient checkout.stripe.com, et le second
 * clic partait avec « externe:checkout.stripe.com » au lieu de sa vraie
 * origine. Un renvoi cliqué ensuite l'écrase (le dernier renvoi gagne).
 * Stockage indisponible : rien n'est figé, un tel second clic garde alors
 * « externe:checkout.stripe.com » — lisible comme « revenu de Stripe ».
 *
 * ⚠️ document.referrer n'est PAS mis à jour par les navigations internes de
 * Next (<Link>) : il désigne la page qui a amené le dernier chargement complet
 * de l'onglet. « externe:www.google.com » sur un achat veut donc dire « arrivé
 * de Google sur le site, puis parvenu à l'achat sans cliquer de renvoi » — pas
 * « arrivé de Google directement sur la page produit ».
 *
 * ─── Lire le résultat ───────────────────────────────────────────────────────
 *
 *   - Produits (paiement unique) : tableau de bord Stripe > Paiements > ouvrir
 *     un paiement > bloc « Métadonnées » > `origine`. Aussi sur la session
 *     Checkout (metadata.origine, à côté de metadata.productId).
 *   - Abonnement Premium : l'essai de 7 jours ne crée pas de paiement au
 *     checkout ; lire `origine` sur l'abonnement (Clients > Abonnements >
 *     Métadonnées) ou sur la session Checkout.
 *   - API : `stripe.paymentIntents.search({ query: "metadata['origine']:'/guide/dca-pea'" })`,
 *     ou `stripe.checkout.sessions.list()` puis `session.metadata.origine`.
 *
 * Ce module est partagé : `nettoyerOrigine` sert au serveur (seule barrière
 * réelle, le navigateur pouvant envoyer n'importe quoi), les autres fonctions
 * ne s'appellent que dans le navigateur, depuis un gestionnaire de clic.
 */

/** Valeur posée quand l'origine reçue est absente ou non conforme. */
export const ORIGINE_INCONNUE = "inconnue";

/** Plafond de longueur — les métadonnées Stripe acceptent 500, on vise court. */
const LONGUEUR_MAX = 100;

/**
 * Les trois formes acceptées. Classes de caractères sans quantificateurs
 * imbriqués : la vérification reste linéaire, même sur une entrée hostile.
 * Un chemin non ASCII arrive percent-encodé (voir `cheminSeul`), d'où « % ».
 */
const FORME_ORIGINE =
  /^(?:direct|\/[A-Za-z0-9._~%\/-]*|externe:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/;

/** Clé sessionStorage du dernier renvoi cliqué (ou de l'origine mise de côté). */
const CLE_SESSION = "dca:origine-achat";

/**
 * Ramène n'importe quelle valeur reçue à une origine propre, ou à
 * « inconnue ». C'est la seule fonction appelée côté serveur.
 */
export function nettoyerOrigine(valeur: unknown): string {
  if (typeof valeur !== "string") return ORIGINE_INCONNUE;
  if (valeur.length === 0 || valeur.length > LONGUEUR_MAX) return ORIGINE_INCONNUE;
  return FORME_ORIGINE.test(valeur) ? valeur : ORIGINE_INCONNUE;
}

/**
 * Le chemin seul d'une adresse ou d'un pathname : ni query, ni fragment, et
 * percent-encodé s'il contient des caractères non ASCII.
 */
function cheminSeul(adresseOuChemin: string): string {
  try {
    return new URL(adresseOuChemin, "https://origine.invalid").pathname;
  } catch {
    return "";
  }
}

/**
 * Met une origine de côté pour la durée de l'onglet. Silencieux si le
 * stockage est indisponible (navigation privée stricte, stockage bloqué) :
 * on retombera alors sur document.referrer.
 */
function memoriserOrigine(origine: string): void {
  const propre = nettoyerOrigine(origine);
  if (propre === ORIGINE_INCONNUE) return;
  try {
    window.sessionStorage.setItem(CLE_SESSION, propre);
  } catch {
    // Stockage indisponible : rien à faire, le référent prendra le relais.
  }
}

/** Mémorise la page courante comme origine — appelé au clic d'un renvoi produit. */
export function memoriserPageDOrigine(pathname: string): void {
  memoriserOrigine(cheminSeul(pathname));
}

function origineMemorisee(): string {
  try {
    return nettoyerOrigine(window.sessionStorage.getItem(CLE_SESSION));
  } catch {
    return ORIGINE_INCONNUE;
  }
}

function origineDuReferent(): string {
  const brut = document.referrer;
  if (!brut) return "direct";
  let referent: URL;
  try {
    referent = new URL(brut);
  } catch {
    return ORIGINE_INCONNUE;
  }
  if (referent.host === window.location.host) {
    return nettoyerOrigine(cheminSeul(referent.pathname));
  }
  // hostname : déjà en minuscules et en punycode — le domaine seul.
  return nettoyerOrigine(`externe:${referent.hostname}`);
}

/**
 * L'origine à envoyer avec une demande de paiement, FIGÉE au passage pour la
 * durée de l'onglet : elle survit ainsi au détour par l'inscription et au
 * retour de Stripe après une annulation (voir l'en-tête). À appeler au clic
 * d'achat, dans le navigateur (page produit, page d'abonnement) — y compris
 * juste avant d'envoyer le visiteur s'inscrire.
 */
export function figerOrigineDeLAchat(): string {
  if (typeof window === "undefined") return ORIGINE_INCONNUE;
  const memorisee = origineMemorisee();
  if (memorisee !== ORIGINE_INCONNUE) return memorisee;
  const origine = origineDuReferent();
  memoriserOrigine(origine);
  return origine;
}
