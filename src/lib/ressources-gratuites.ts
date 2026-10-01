// Ressources gratuites envoyées par email contre une adresse (/api/subscribe).
//
// Deux à ce jour :
//   · « cheat-sheet » : le tableau des 5 ETF du guide PEA (depuis l'accueil et
//     le simulateur, composant EmailCapture) — l'envoi historique ;
//   · « modele-suivi-pea » (01/10/2026) : le modèle de suivi gratuit, tiré du
//     Cockpit v2.0 (journal + Par ETF), depuis /suivi-pea-excel.
//
// Le nom de ressource arrive du navigateur : on ne le croit pas, on le lit
// dans cette liste fermée (toute autre valeur retombe sur la cheat sheet,
// l'envoi d'avant).

export const RESSOURCES_GRATUITES = ["cheat-sheet", "modele-suivi-pea"] as const;
export type RessourceGratuite = (typeof RESSOURCES_GRATUITES)[number];

export function lireRessource(valeur: unknown): RessourceGratuite {
  return RESSOURCES_GRATUITES.find((r) => r === valeur) ?? "cheat-sheet";
}

/** Clé du fichier dans PRODUCT_FILES (route /api/products/download). */
export const MODELE_GRATUIT_FICHIER = "modele-gratuit-xlsx";

/** Validité du lien de téléchargement du modèle gratuit. */
export const MODELE_GRATUIT_TTL_JOURS = 30;

/**
 * Lien « Faire une copie » de la version Google Sheets du modèle gratuit
 * (Drive de Maël, partagé « tous les utilisateurs disposant du lien :
 * lecteur »). Pas un secret : c'est le lien que reçoit chaque inscrit.
 * `null` tant que la feuille n'existe pas : l'email n'en parle alors pas.
 */
export const MODELE_GRATUIT_SHEETS_COPIE: string | null = null;
