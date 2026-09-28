// Ouverture de la recherche PENDANT le geste du lecteur.
//
// iOS n'ouvre le clavier virtuel que si le focus est donné dans le
// gestionnaire du toucher lui-même. Tant que l'ouverture passait par un état
// React (et, à la première fois, par un composant chargé à la demande),
// showModal() et le focus arrivaient dans une tâche ultérieure : fenêtre
// ouverte, champ focalisé, mais pas de clavier — il fallait toucher le champ
// une seconde fois (constat n° 39, revue du 28/09/2026).
//
// La fenêtre de recherche, toujours montée, enregistre ici des fonctions qui
// agissent sur le DOM tout de suite (showModal + focus) puis mettent l'état
// React à jour. Le bouton de l'en-tête et les raccourcis clavier les appellent
// directement, sans événement ni rendu intermédiaire.
//
// Aucune dépendance : ce module est dans le bundle de toutes les pages.

export type Ouvreur = {
  /** Ouvre la recherche (avec une requête éventuelle) et place le focus dans le champ. */
  ouvrir: (q?: string) => void;
  fermer: () => void;
  estOuverte: () => boolean;
};

let actuel: Ouvreur | null = null;

/** Appelé par la fenêtre de recherche au montage ; renvoie la fonction de retrait. */
export function enregistrerOuvreur(o: Ouvreur): () => void {
  actuel = o;
  return () => {
    if (actuel === o) actuel = null;
  };
}

/**
 * Ouvre la recherche. Renvoie false si la fenêtre n'est pas (encore) montée,
 * pour que l'appelant puisse se rabattre sur la page /recherche.
 */
export function ouvrirRecherche(q?: string): boolean {
  if (!actuel) return false;
  actuel.ouvrir(q);
  return true;
}

/** ⌘K / Ctrl+K : ouvre si fermée, ferme si ouverte. */
export function basculerRecherche(): void {
  if (!actuel) return;
  if (actuel.estOuverte()) actuel.fermer();
  else actuel.ouvrir();
}
