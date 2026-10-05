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

/**
 * Boucle muette du MODÈLE GRATUIT, sur /suivi-pea-excel, dans l'encadré
 * « Deux façons de faire », juste après le formulaire du haut (décision du
 * 04/10/2026, video-accueil/STORYBOARD-MODELE-GRATUIT.md §6 et §10).
 * 1080×1080, 17 s, sans piste audio ; rendu `npm run rendu -- modele`
 * (out/boucle-modele-gratuit.*). Comme pour les deux autres boucles, la
 * première et la dernière image sont identiques à l'affiche (l'onglet Par
 * ETF, PRU de PE500 entouré).
 */
export const VIDEO_MODELE = {
  boucle: {
    webm: "/video/boucle-modele-gratuit-f8082c21.webm",
    mp4: "/video/boucle-modele-gratuit-6745ad95.mp4",
    affiche: "/video/boucle-modele-gratuit-affiche-dd6c7e3e.jpg",
    largeur: 1080,
    hauteur: 1080,
    /** 510 images à 30 i/s. */
    dureeSecondes: 17,
  },
} as const;

/**
 * Chiffres et promesses GRAVÉS dans la boucle du modèle gratuit
 * (video-accueil/src/donnees.json, clé `modeleBoucle`, et captures du journal
 * et de Par ETF recomposées à l'image). VideoModeleGratuit.tsx les recalcule à
 * chaque build depuis cockpit-exemple.ts et ressources-gratuites.ts : au
 * moindre écart, la vidéo n'est PAS affichée (elle ne remplace aucun visuel,
 * la page redevient celle d'avant la vidéo) et le journal du build le
 * signale, jusqu'au prochain rendu. Après un nouveau rendu, mettre ces valeurs
 * à jour en même temps que les noms de fichiers.
 *
 * Le nom du fichier livré, écrit dans la barre de fenêtre
 * (« Modele-suivi-PEA_dcatracker.xlsx »), n'est vérifié qu'au rendu
 * (extraire-donnees.mjs lit la route de téléchargement) : le site ne peut pas
 * importer une constante interne d'une route API.
 */
export const DANS_LA_VIDEO_MODELE = {
  /** Pastille de P3, cartes de P4, fin : « Excel + Google Sheets » (MODELE_GRATUIT_SHEETS_COPIE non nul). */
  sheets: true,
  /** P2 : les sept lignes visibles du journal (date, ticker, parts, prix affiché au centime, frais), dans l'ordre du fichier. */
  journal: [
    ["2024-01-15", "PE500", 4, 35.7, 1.99],
    ["2024-01-15", "ETZ", 4, 14.53, 1.99],
    ["2024-01-15", "PAEEM", 2, 20.23, 1.99],
    ["2024-02-15", "PE500", 4, 37.92, 1.99],
    ["2024-02-15", "ETZ", 4, 14.98, 1.99],
    ["2024-02-15", "PAEEM", 2, 20.81, 1.99],
    ["2024-03-15", "PE500", 4, 38.27, 1.99],
  ],
  /**
   * P3 (l'affiche) : parts détenues, total investi (frais compris) et PRU, en
   * euros, dans l'ordre du fichier. La réponse « → 44,40 € la part, frais
   * compris » est le PRU de la première ligne (PE500, entouré).
   */
  parEtf: [
    { ticker: "PE500", parts: 101, investi: 4484.17, pru: 44.4 },
    { ticker: "ETZ", parts: 116, investi: 2056.7, pru: 17.73 },
    { ticker: "PAEEM", parts: 60, investi: 1566.34, pru: 26.11 },
  ],
} as const;
