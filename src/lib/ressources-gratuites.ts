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
 * (Drive de Maël, « Modèle de suivi PEA (gratuit) - DCA Tracker », partagé
 * « tous les utilisateurs qui ont le lien : lecteur »). Pas un secret : c'est
 * le lien que reçoit chaque inscrit. Créée le 01/10/2026 depuis le .xlsx livré
 * (sha1 f8e54804…), formule GOOGLEFINANCE collée en Par ETF E9:E18 — vérifiée :
 * PE500, ETZ et PAEEM renvoient les bons fonds.
 * Mettre `null` si la feuille disparaît : la page et l'email n'en parlent plus.
 */
export const MODELE_GRATUIT_SHEETS_COPIE: string | null =
  "https://docs.google.com/spreadsheets/d/1bs7EQA0_qoaffcPVmxwpqvS25ubmIJU7Nmuc-t7Nwh0/copy";
