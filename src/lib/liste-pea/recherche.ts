/**
 * Texte de recherche de la liste PEA : minuscules, sans accents, pour que
 * « Société » et « societe » se trouvent l'un l'autre. Partagé par la page
 * (attribut data-q de chaque ligne, côté serveur) et par ses filtres (saisie,
 * côté navigateur) : les deux doivent normaliser de la même façon.
 */
export function normaliserRecherche(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
