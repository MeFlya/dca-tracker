// État du compte côté navigateur, lisible SANS charger Clerk.
//
// Mesuré le 04/10/2026 (Lighthouse mobile, accueil) : Clerk pesait ~165 Ko
// gzip de JavaScript téléchargé à chaque visite, avant le premier rendu —
// clerk.browser.js (84 Ko), ui.browser.js (45 Ko, préchargé en priorité
// haute), et @clerk/react dans le bundle commun (38 Ko). Pour un visiteur non
// connecté, il ne servait à rien hors des pages de connexion.
//
// Clerk n'est donc plus monté dans le layout racine. Ce module répond aux
// questions que l'en-tête et les pages posaient à useUser() :
//  · « connecté ou non » : le cookie `__client_uat`, posé par Clerk sur le
//    domaine du site (voir session-clerk.ts) ;
//  · le plan (publicMetadata.plan), publié par Clerk une fois chargé
//    (voir ClerkActif.tsx).
// Clerk n'est chargé (IlotClerk.tsx) que si ce cookie annonce une session, si
// la page affiche un composant Clerk (connexion, inscription, menu du compte),
// ou au survol d'un lien vers la connexion.
//
// ⚠️ Le plan ne sert qu'à l'AFFICHAGE. Toute autorisation se décide côté
// serveur (getUserSubscription), comme avant.
//
// ⚠️ Aucun import de @clerk/* ici, ni dans les composants qui lisent ce module
// (en-tête, simulateur, tarifs…) : un seul import statique suffirait à
// remettre @clerk/react dans le JavaScript commun de toutes les pages.

import { useSyncExternalStore } from "react";
import { COOKIE_SESSION_CLERK, ROUTES_CLERK } from "./session-clerk";

export type EtatCompte = {
  /** false tant que l'état n'est pas connu : rendu serveur, ou session annoncée et Clerk pas encore chargé. */
  isLoaded: boolean;
  /** undefined tant que isLoaded est false, comme useUser() de Clerk. */
  isSignedIn: boolean | undefined;
  /** publicMetadata.plan du compte, « free » par défaut. */
  plan: string;
};

/** Composants Clerk que l'îlot sait afficher dans un emplacement (EmplacementClerk). */
export type WidgetClerk =
  | { type: "menu-compte"; isPremium: boolean }
  | { type: "sign-in"; signUpUrl: string; fallbackRedirectUrl: string }
  | { type: "sign-up"; signInUrl: string; fallbackRedirectUrl: string };

export type EmplacementWidget = { id: string; noeud: HTMLElement; widget: WidgetClerk };

/** Le strict nécessaire de l'instance Clerk pour les actions déclenchées hors de l'îlot. */
type ClerkPourActions = { signOut: () => Promise<unknown> };

const INCONNU: EtatCompte = { isLoaded: false, isSignedIn: undefined, plan: "free" };
const DECONNECTE: EtatCompte = { isLoaded: true, isSignedIn: false, plan: "free" };
const AUCUN_WIDGET: readonly EmplacementWidget[] = [];

export function estRouteClerk(chemin: string): boolean {
  return ROUTES_CLERK.test(chemin);
}

/**
 * Une session Clerk existe-t-elle dans ce navigateur ? (voir
 * session-clerk.ts). Une valeur non nulle peut correspondre à une session
 * expirée : Clerk, chargé, tranche alors et l'en-tête repasse en déconnecté.
 */
export function sessionClerkPresente(): boolean {
  if (typeof document === "undefined") return false;
  return COOKIE_SESSION_CLERK.test(document.cookie);
}

// ─── Magasin ────────────────────────────────────────────────────────────────
//
// Lu une fois à l'évaluation du module dans le navigateur, avant
// l'hydratation. Pendant le rendu serveur et l'hydratation, les composants
// reçoivent INCONNU (getServerSnapshot), soit exactement ce que useUser()
// renvoyait avant le chargement de Clerk : le HTML ne change pas.

let etat: EtatCompte = INCONNU;
let clerkActif = false;
let widgets: readonly EmplacementWidget[] = AUCUN_WIDGET;
let clerkPret: ClerkPourActions | null = null;
let attenteClerk: ((clerk: ClerkPourActions) => void)[] = [];

if (typeof window !== "undefined") {
  const session = sessionClerkPresente();
  etat = session ? INCONNU : DECONNECTE;
  clerkActif = session || estRouteClerk(window.location.pathname);
}

const ecouteurs = new Set<() => void>();
function notifier() {
  ecouteurs.forEach((ecouteur) => ecouteur());
}
function abonner(ecouteur: () => void) {
  ecouteurs.add(ecouteur);
  return () => {
    ecouteurs.delete(ecouteur);
  };
}

/** Remplace useUser() de Clerk pour isLoaded, isSignedIn et le plan. */
export function useCompte(): EtatCompte {
  return useSyncExternalStore(abonner, () => etat, () => INCONNU);
}

export function useClerkActif(): boolean {
  return useSyncExternalStore(abonner, () => clerkActif, () => false);
}

export function useWidgetsClerk(): readonly EmplacementWidget[] {
  return useSyncExternalStore(abonner, () => widgets, () => AUCUN_WIDGET);
}

/** Clerk au démarrage de la page : session annoncée ou page de connexion. */
export function clerkActifAuDemarrage(): boolean {
  return clerkActif;
}

/** Monte Clerk (une fois pour toutes : il n'est jamais démonté ensuite). */
export function activerClerk() {
  if (clerkActif) return;
  clerkActif = true;
  notifier();
}

// ─── Côté îlot (ClerkActif.tsx) ─────────────────────────────────────────────

/** Appelé par l'îlot dès que Clerk a répondu, puis à chaque changement. */
export function publierEtatClerk(suivant: EtatCompte) {
  if (
    etat.isLoaded === suivant.isLoaded &&
    etat.isSignedIn === suivant.isSignedIn &&
    etat.plan === suivant.plan
  ) {
    return;
  }
  etat = suivant;
  notifier();
}

export function enregistrerClerk(clerk: ClerkPourActions) {
  clerkPret = clerk;
  attenteClerk.forEach((resoudre) => resoudre(clerk));
  attenteClerk = [];
}

// ─── Côté pages ─────────────────────────────────────────────────────────────

/**
 * Réserve un emplacement pour un composant Clerk ; l'îlot l'y rend par un
 * portail, sous son <ClerkProvider>. Rappeler avec le même id met à jour le
 * widget sans le remonter. Renvoie la fonction de retrait.
 */
export function poserWidget(id: string, noeud: HTMLElement, widget: WidgetClerk) {
  widgets = [...widgets.filter((w) => w.id !== id), { id, noeud, widget }];
  clerkActif = true;
  notifier();
  return () => {
    widgets = widgets.filter((w) => w.id !== id);
    notifier();
  };
}

/**
 * Déconnexion depuis une page (suppression du compte) : attend que Clerk soit
 * chargé, sans bloquer plus de 10 s si son script ne vient jamais.
 */
export function deconnecter(): Promise<unknown> {
  activerClerk();
  const clerk = clerkPret
    ? Promise.resolve(clerkPret)
    : new Promise<ClerkPourActions>((resoudre) => attenteClerk.push(resoudre));
  return Promise.race([
    clerk.then((c) => c.signOut()),
    new Promise((resoudre) => setTimeout(resoudre, 10_000)),
  ]);
}
