// Zones de la boucle du Cockpit (BoucleCockpit), en pixels des PNG de
// public/captures/ (captures du 02/10/2026). Mesurées en lisant les pixels
// (filets, bords des cases, texte foncé), le 04/10/2026 : voir
// STORYBOARD-COCKPIT.md §3. Les captures du classeur sont celles du site
// (public/produits/, même empreinte : vérifié par scripts/extraire-donnees.mjs).
//
// Si l'exemple du classeur est régénéré, extraire-donnees.mjs arrête le rendu :
// refaire les captures, puis vérifier ces zones sur les images de contrôle
// (npm run controle -- BoucleCockpit).

import type { Zone } from "./composants/Capture";
import type { Morceau } from "./composants/Morceaux";

export const CAPTURES_COCKPIT = {
  dashboard: { fichier: "classeur/cockpit-v2-dashboard.png", l: 2586, h: 1580 },
  pea: { fichier: "classeur/cockpit-v2-pea.png", l: 2365, h: 1715 },
  // Fenêtre « Versement du mois » de la page produit (capture du site, comme B4).
  versement: { fichier: "cockpit-bureau-fenetre-versement.png", l: 2216, h: 840 },
} as const;

// ─── Barre de fenêtre ────────────────────────────────────────────────────────
// Copie de `Fenetre` (src/components/products/visuels.tsx), telle que la
// capture de P3 la montre à 2× : fond slate-50, filet slate-200 de 2 px,
// pastilles slate-300 de 20 px espacées de 12, texte xs (24 px) font-medium.
// Positions lues sur cockpit-bureau-fenetre-versement.png : barre de y = 6 à
// 74, filet de 74 à 76, pastilles à partir de x = 35, texte à partir de x = 145.
// P2, P4 et P5 la refont en HTML, à la même taille que P3 : la barre ne change
// pas de taille d'un plan à l'autre.
export const BARRE_FENETRE = { hauteur: 68, filet: 2, pastilles: 35, texte: 145, taille: 24 };
export const FICHIER_CLASSEUR = "Cockpit-DCA-PEA_dcatracker.xlsx";

// ─── P2 : tableau « Répartition par ETF » du Dashboard ───────────────────────
// En-tête de y = 797 à 892, filet 893-895, lignes PE500 896-956, ETZ 960-1020,
// PAEEM 1024-1084 (filets de 3 px entre elles), filet du bas 1085-1087. Le
// tableau va de x = 65 à 1789. Retirés (relecture du 04/10) : la colonne
// « Valeur (€) » (x = 587 à 746 : il ne reste aucun montant) et les barres du
// poids (x = 937 à 1206), pour agrandir le tableau de 0,92 à 1,14 (à 343 px,
// les cellules faisaient 9 px). Texte du poids : x = 817 à 918 ; de 1207 à
// 1448 (« Cible »), rien que le fond : le morceau Cible + Écart commence en
// 1370 pour garder un blanc de 93 px entre « 55,2 % » et « 50 % ».
const TAB = { y1: 797, y2: 1092 };
export const REPARTITION = {
  k: 1.14,
  largeurPng: 197 + 134 + 420,
  hauteurPng: TAB.y2 - TAB.y1,
  morceaux: [
    { de: [65, TAB.y1, 262, TAB.y2], x: 0, y: 0 }, // ETF
    { de: [796, TAB.y1, 930, TAB.y2], x: 197, y: 0 }, // Poids actuel (texte seul)
    { de: [1370, TAB.y1, 1790, TAB.y2], x: 331, y: 0 }, // Cible + Écart
  ] as Morceau[],
  /** Ligne d'ETZ, d'un bord à l'autre de la recomposition (y du PNG). */
  ligneEtz: { y1: 960, y2: 1021 },
  /** « -6,7 % » (texte en x = 1660 à 1751, y = 978 à 1004). */
  ecartEtz: [1654, 974, 1757, 1010] as Zone,
};

// ─── P3 : fenêtre « Versement du mois » ──────────────────────────────────────
// Recopie EXACTE de la recomposition du plan B4 (src/boucle/Boucle.tsx :
// BARRE, BARRE_VIDE, LIGNE, COL_ETF, BANDE_VIDE, COL_SUGGERE_PARTS, FEN). Ces
// constantes n'y sont pas exportées, et la boucle d'accueil ne doit pas changer.
const PAD_X = 31;
const PAD_Y = 24;
const BARRE: Zone = [24, 6, 800, 76];
const BARRE_VIDE: Zone = [1000, 6, 1012, 76];
const LIGNE: Zone = [44, 336, 901, 432];
const TABLEAU = { y1: 532, y2: 800 };
const COL_ETF: Zone = [44, TABLEAU.y1, 250, TABLEAU.y2];
const BANDE_VIDE: Zone = [250, TABLEAU.y1, 262, TABLEAU.y2];
const COL_SUGGERE_PARTS: Zone = [1357, TABLEAU.y1, 1770, TABLEAU.y2];
const largeurLigne = LIGNE[2] - LIGNE[0];
const hBarre = BARRE[3] - BARRE[1];
const yLigne = hBarre + PAD_Y;
const yTableau = yLigne + (LIGNE[3] - LIGNE[1]) + PAD_Y;
const largeurBande = largeurLigne - (COL_ETF[2] - COL_ETF[0]) - (COL_SUGGERE_PARTS[2] - COL_SUGGERE_PARTS[0]);
export const VERSEMENT = {
  largeurPng: largeurLigne + 2 * PAD_X,
  hauteurPng: yTableau + (TABLEAU.y2 - TABLEAU.y1) + PAD_Y,
  morceaux: [
    { de: BARRE_VIDE, x: 0, y: 0, largeur: largeurLigne + 2 * PAD_X },
    { de: BARRE, x: BARRE[0], y: 0 },
    { de: LIGNE, x: PAD_X, y: yLigne },
    { de: COL_ETF, x: PAD_X, y: yTableau },
    { de: COL_SUGGERE_PARTS, x: PAD_X + largeurLigne - (COL_SUGGERE_PARTS[2] - COL_SUGGERE_PARTS[0]), y: yTableau },
    { de: BANDE_VIDE, x: PAD_X + (COL_ETF[2] - COL_ETF[0]) - 1, y: yTableau, largeur: largeurBande + 2 },
  ] as Morceau[],
  /** Case « 300,00 € » (Z.versement.montant de src/zones.ts). */
  montant: [684, 343, 893, 425] as Zone,
  /**
   * Valeurs des deux colonnes vertes (« Montant suggéré (€) », « ≈ Parts à
   * acheter »), sous leur en-tête : l'en-tête et son filet s'arrêtent en
   * y = 625, la ligne PE500 commence en 626 (texte à partir de 638).
   */
  valeurs: [1357, 626, 1770, 800] as Zone,
  /** « 14 » d'ETZ (texte en x = 1728 à 1763, y = 695 à 720 ; ligne de 684 à 737). */
  partsEtz: [1700, 684, 1770, 731] as Zone,
  /**
   * Ligne d'ETZ, entre ses filets (679-682 et 737-740), dans les deux morceaux
   * qu'elle traverse (colonne ETF, colonnes vertes) : la bande va d'un bord à
   * l'autre du tableau recomposé.
   */
  ligneEtzEtf: [44, 683, 250, 737] as Zone,
  ligneEtzParts: [1357, 683, 1770, 737] as Zone,
};

// ─── P4 : trois cases du Dashboard ───────────────────────────────────────────
// Chaque case garde son filet du haut (y = 222 ou 471). Contenu mesuré : Valeur
// et Total versé finissent en y = 362, Frais de courtage en 668 (« 2,1 % du
// versé »). Valeur et Total versé gardent leur ordre du fichier (1er rang, 1re
// et 2e colonnes) ; les frais (2e rang, 2e colonne) sont centrés dessous.
// Retirées (relecture du 04/10) : la Plus-value latente (« +28,0 % » : une
// performance passée réelle de trois ETF nommés, le chiffre le plus coloré du
// plan), le TRI et « Votre DCA » (32 mois — 87 achats : dépend de la date).
const RANG_1 = 370 - 222; // 148
const RANG_2 = 426 - 222; // 204
export const TABLEAU_DE_BORD = {
  largeurPng: 900,
  ecartRangs: 40,
  cases: [
    // Chaque case commence 15 px avant son filet (blanc) : l'anneau a la
    // place de passer à gauche de l'étiquette sans la toucher.
    { de: [50, 222, 485, 222 + RANG_1] as Zone, x: 0, y: 0 }, // Valeur du portefeuille
    { de: [913, 222, 1348, 222 + RANG_1] as Zone, x: 465, y: 0 }, // Total versé (frais inclus)
    { de: [913, 471, 1348, 471 + RANG_2] as Zone, x: 232, y: RANG_1 + 40 }, // Frais de courtage cumulés (texte jusqu'à x = 1339)
  ],
  hauteurPng: RANG_1 + 40 + RANG_2,
  /** Étiquette et valeur (texte en x = 72 à 419, y = 260 à 362). */
  valeur: [72, 258, 419, 362] as Zone,
};

// ─── P5 : onglet PEA ─────────────────────────────────────────────────────────
// Chaque libellé est rapproché de sa valeur ; la jauge passe sur sa ligne.
// Case bleue du taux : bordure de y = 401 à 473, x = 889 à 1198 (au-dessus et
// en dessous, les cases voisines : on coupe sur la bordure).
// Écartés : « Âge du plan » et « encore 836 jour(s) avant le cap » (dépendent
// du jour d'ouverture du fichier), la fiscalité estimée en euros.
export const ONGLET_PEA = {
  largeurPng: 900,
  hauteurPng: 462,
  morceaux: [
    { de: [50, 405, 560, 470], x: 0, y: 0 }, // « Taux des prélèvements sociaux : » (texte 426-456, centré sur la case)
    { de: [886, 401, 1201, 474], x: 540, y: 0 }, // case bleue « 18,6 % »
    { de: [50, 765, 500, 800], x: 0, y: 120 }, // « PLAFOND DE VERSEMENTS »
    { de: [50, 940, 290, 988], x: 0, y: 176 }, // « Plafond utilisé : »
    { de: [1090, 940, 1195, 988], x: 270, y: 176 }, // « 5,4 % »
    { de: [1200, 938, 1880, 988], x: 0, y: 240 }, // jauge
    { de: [50, 1105, 420, 1145], x: 0, y: 360 }, // « ANCIENNETÉ DU PLAN »
    { de: [50, 1222, 292, 1268], x: 0, y: 416 }, // « Cap des 5 ans : »
    { de: [895, 1222, 1072, 1268], x: 270, y: 416 }, // « 15/01/2029 » (l'anneau passe à 26 px du « : »)
  ] as Morceau[],
  taux: [889, 401, 1199, 474] as Zone,
  jauge: [1205, 943, 1877, 983] as Zone,
  cap: [902, 1230, 1069, 1261] as Zone,
};
