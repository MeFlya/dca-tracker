/**
 * Vidéos du site (bandeau d'accueil, et depuis le 04/10/2026 bandeau de la
 * page du Cockpit) : TOUS les noms de fichiers sont ici, et nulle part
 * ailleurs.
 *
 * Les fichiers viennent de video-accueil/out/ (projet Remotion, voir
 * video-accueil/LISEZMOI.md) et sont copiés dans public/video/ sous un nom
 * VERSIONNÉ : les 8 premiers caractères de leur empreinte SHA-256. C'est ce qui
 * permet de les servir avec « Cache-Control: immutable » (next.config.ts) : un
 * nouveau rendu porte un nouveau nom, aucun navigateur ne garde l'ancien.
 *
 * Pour remplacer une vidéo après un nouveau rendu, depuis la racine du site :
 *
 *   f=video-accueil/out/complete-carre.mp4
 *   h=$(shasum -a 256 "$f" | cut -c1-8)
 *   cp "$f" "public/video/presentation-avec-son-$h.mp4"
 *
 * puis changer la ligne correspondante ci-dessous et supprimer l'ancien
 * fichier de public/video/. Même chose pour chaque affiche : elle doit rester
 * l'image exacte de la vidéo qu'elle précède.
 */

export const VIDEO_ACCUEIL = {
  /**
   * Boucle muette du bandeau, 1080×1080, 19 s (retouches du 04/10/2026 : cours
   * figé retiré, frais de l'ETF nommés, Cockpit lisible). Sa première et sa dernière
   * image sont identiques à l'affiche : le passage de l'affiche à la vidéo, et
   * l'arrêt après le dernier tour, ne se voient pas.
   */
  boucle: {
    webm: "/video/boucle-971bdb99.webm",
    mp4: "/video/boucle-a780769c.mp4",
    affiche: "/video/boucle-affiche-491ace8b.jpg",
    largeur: 1080,
    hauteur: 1080,
  },
  /**
   * Version carrée avec le son, ouverte par « Regarder avec le son ». Rendu
   * final du 04/10/2026 (corrections d'exactitude, avertissement sur le
   * risque, finition Remotion) ; l'ancien rendu est archivé dans
   * video-accueil/out/archives/complete-carre-avant-finition.mp4.
   */
  avecSon: {
    mp4: "/video/presentation-avec-son-e2696e4f.mp4",
    affiche: "/video/presentation-avec-son-affiche-6c16c394.jpg",
    /** Durée affichée sur le lien, en secondes (30,00 s mesurées). */
    dureeSecondes: 30,
  },
} as const;

/**
 * Chiffres GRAVÉS dans la boucle au moment du rendu
 * (video-accueil/src/donnees.json). HeroVideo.tsx les compare au site à chaque
 * build : au moindre écart, la boucle est périmée et le bandeau affiche à sa
 * place une carte statique calculée en direct, avec un avertissement dans le
 * journal du build, jusqu'au prochain rendu. Après un nouveau rendu, mettre ces
 * valeurs à jour en même temps que les noms de fichiers ci-dessus.
 *
 * La chaîne de rendu (video-accueil/scripts/extraire-donnees.mjs) lit ces
 * valeurs dans le code du site et dans les captures de production : elle ne
 * dépend plus de HeroDemoCard depuis le 04/10/2026.
 */
export const DANS_LA_VIDEO = {
  /** simulateur.valeurFinale : 200 €/mois, 20 ans, 7 %/an, TER de CW8 déduit. */
  montantFinal: 97753,
  /** simulateur.fraisDefaut : TER de référence du simulateur (CW8), en %. */
  fraisPct: 0.38,
  /** comparateur.nbEtf : « Comparez 19 ETF ». */
  nbEtf: 19,
  /** cockpit.prix : « Cockpit DCA · 19 €, paiement unique ». */
  prixCockpit: 19,
} as const;

/**
 * Boucle muette du Cockpit DCA, en tête de /produits/template-suivi-dca, à la
 * place de la fenêtre statique « Versement du mois » du bandeau (décision du
 * 04/10/2026, video-accueil/STORYBOARD-COCKPIT.md §6). 1080×1080, 19 s ;
 * rendu `npm run rendu -- cockpit` (out/boucle-cockpit.*). Comme pour
 * l'accueil, la première et la dernière image sont identiques à l'affiche.
 */
export const VIDEO_COCKPIT = {
  boucle: {
    webm: "/video/boucle-cockpit-0f77d257.webm",
    mp4: "/video/boucle-cockpit-e4bb9328.mp4",
    affiche: "/video/boucle-cockpit-affiche-002e8e24.jpg",
    largeur: 1080,
    hauteur: 1080,
    /** 570 images à 30 i/s. */
    dureeSecondes: 19,
  },
} as const;

/**
 * Chiffres GRAVÉS dans la boucle du Cockpit (video-accueil/src/donnees.json,
 * clé `cockpitBoucle`, et captures du classeur recomposées à l'image).
 * VideoCockpit.tsx les recalcule à chaque build depuis cockpit-exemple.ts,
 * products.ts et le barème fiscal : au moindre écart, la page reprend la
 * fenêtre statique « Versement du mois » (ProductVisual, inchangée) et le
 * journal du build le signale, jusqu'au prochain rendu. Après un nouveau
 * rendu, mettre ces valeurs à jour en même temps que les noms de fichiers.
 */
export const DANS_LA_VIDEO_COCKPIT = {
  /** P6 : « 19 € · paiement unique » (priceEur). */
  prix: 19,
  /** P6 : « Cockpit DCA » (titreHero.principal). */
  titre: "Cockpit DCA",
  /** P6 : « Tableau de bord PEA / Excel + Google Sheets » (titreHero.complement). */
  complement: ["Tableau de bord PEA", "Excel + Google Sheets"],
  /** Mentions de P2 et P4 : achats fictifs, cours de clôture de ce jour (DATE_CAPTURES). */
  dateExemple: "2026-10-02",
  /** P2 : poids actuel et cible, en %, à une décimale, dans l'ordre du fichier. */
  repartition: [
    { ticker: "PE500", poids: 55.2, cible: 50 },
    { ticker: "ETZ", poids: 23.3, cible: 30 },
    { ticker: "PAEEM", poids: 21.5, cible: 20 },
  ],
  /** P3 (l'affiche) : 300 € à verser → 14 parts d'ETZ, aucune des deux autres. */
  versement: 300,
  parts: { PE500: 0, ETZ: 14, PAEEM: 0 },
  /** P4 : valeur du portefeuille, total versé (frais inclus), frais de courtage cumulés, en euros. */
  valeur: 10380.37,
  totalVerse: 8107.21,
  fraisCourtage: 173.13,
  /** P5 : taux des prélèvements sociaux (%), plafond utilisé (%), cap des 5 ans. */
  tauxSociauxPct: 18.6,
  plafondUtilisePct: 5.4,
  cap5ans: "2029-01-15",
} as const;
