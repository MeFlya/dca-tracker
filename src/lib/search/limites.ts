// Limites partagées par le moteur et les champs de recherche. Module sans
// dépendance : l'en-tête peut l'importer sans embarquer MiniSearch.

/**
 * Longueur maximale d'une requête, en caractères. Aucune question réelle ne
 * la dépasse ; sans elle, un lien /recherche?q=… de 1 200 mots figeait
 * l'onglet 2 s (constat 46, mesuré le 28/09/2026). Le moteur coupe la requête
 * à cette longueur ; les champs de saisie peuvent la reprendre en maxLength.
 */
export const LONGUEUR_MAX_REQUETE = 150;
