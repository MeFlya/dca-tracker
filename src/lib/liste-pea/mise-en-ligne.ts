// Date de mise en ligne de la liste complète des ETF éligibles au PEA.
//
// Module minuscule, sans import : etf-pea-verifies.ts (lu par les images
// Open Graph en edge) et changelog.ts le lisent sans embarquer les 128 lignes.

/**
 * Mise en ligne de la liste complète (128 lignes) sur /etf-eligibles-pea,
 * AAAA-MM-JJ. À RÉGLER AU JOUR RÉEL DU DÉPLOIEMENT : elle sert à la fois
 * de date de mise à jour visible (« Mis à jour le… », signature « Par Maël
 * Faleyras »), de dateModified (JSON-LD Article), de lastmod (sitemap,
 * via MAJ_LISTE_PEA) et de date de l'entrée du journal des changements.
 *
 * La page a été modifiée le 14/10/2026 : pas de nouvelle mise en ligne avant
 * le 28/10/2026. La build refuse de construire tant que cette date est dans
 * le futur (src/lib/liste-pea/index.ts), sauf aperçu local explicite :
 * LISTE_PEA_APERCU=1 npm run build.
 *
 * Mise en ligne réelle : le 30/10/2026, avec les fiches ETF v2.
 */
export const MISE_EN_LIGNE_LISTE_PEA = "2026-10-30";
