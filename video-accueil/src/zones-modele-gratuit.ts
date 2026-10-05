// Zones de la boucle du modèle gratuit (BoucleModeleGratuit), en pixels des
// PNG de public/captures/. Mesurées en lisant les pixels (bords des cellules,
// filets, texte foncé) le 04/10/2026 : voir STORYBOARD-MODELE-GRATUIT.md §3.
//
// Les deux captures sont celles du site (même empreinte SHA-256, vérifiée par
// scripts/extraire-donnees.mjs, qui recalcule aussi l'exemple avec le code du
// site). Si l'exemple est régénéré, le rendu s'arrête : refaire les captures,
// puis vérifier ces zones sur les images de contrôle
// (npm run controle -- BoucleModeleGratuit).

import type { Zone } from "./composants/Capture";
import type { Morceau } from "./composants/Morceaux";

export const CAPTURES_MODELE = {
  // Onglet Transactions DU MODÈLE GRATUIT, aux cours réels (copie de
  // ../public/ressources/modele-suivi-pea-transactions.png).
  transactions: { fichier: "modele/modele-suivi-pea-transactions.png", l: 1882, h: 1301 },
  // Onglet Par ETF du Cockpit v2.0 : le modèle gratuit garde cet onglet tel
  // quel (mêmes ETF, mêmes cours manuels ; la page le légende « L'onglet Par
  // ETF (Cockpit et modèle gratuit) »).
  parEtf: { fichier: "classeur/cockpit-v2-par-etf.png", l: 3698, h: 1319 },
} as const;

// ─── P2 : le journal (onglet Transactions), échelle 1 ────────────────────────
// Lignes : blanc au-dessus du tableau jusqu'en y = 374, en-tête de 375 à 458,
// filet 459-460, puis sept lignes de 48 px séparées par un blanc de 2 px
// (461-508, 511-558, …, 761-808). La recomposition va de y = 355 (20 px de
// blanc du fichier au-dessus de l'en-tête) à 810.
// Cellules (fond primary-50, séparées par un blanc de 2 px) : Date 42-239,
// ETF 242-456, Parts 459-673, Prix 676-923, Frais 926-1089. Textes : dates
// 71-215, tickers 250-385, parts (en-tête) 492-666, prix 730-916, frais
// (en-tête) 986-1083.
// Les cinq colonnes que l'on saisit (cases bleues) sont gardées ; « Montant
// total » et « Note » sont retirées (pas de place à l'échelle 1). Chaque
// colonne garde le blanc qui la sépare de la suivante ; pour l'ETF, dont le
// texte est à gauche, la cellule est coupée à droite et son séparateur
// (457-458) est posé à part.
const J = { y1: 355, y2: 810 };
const colonnesJournal: [number, number][] = [
  [58, 242], // Date (+ séparateur 240-241)
  [242, 400], // ETF (ticker)
  [457, 459], // séparateur de la cellule ETF
  [484, 676], // Parts achetées (+ séparateur 674-675)
  [722, 926], // Prix unitaire (€) (+ séparateur 924-925)
  [960, 1090], // Frais (€)
];
const morceauxJournal: Morceau[] = [];
{
  let x = 0;
  for (const [a, b] of colonnesJournal) {
    morceauxJournal.push({ de: [a, J.y1, b, J.y2], x, y: 0 });
    x += b - a;
  }
}
export const JOURNAL = {
  k: 1,
  morceaux: morceauxJournal,
  largeurPng: colonnesJournal.reduce((s, [a, b]) => s + b - a, 0),
  hauteurPng: J.y2 - J.y1,
  /** Haut de la recomposition, en y du PNG. */
  y1: J.y1,
  /**
   * La colonne « Frais (€) », de l'en-tête à la 6e ligne (relecture design du
   * 04/10 : un anneau sur un seul « 1,99 € », identique sur les sept lignes,
   * faisait chercher une différence qui n'existe pas). Texte de l'en-tête en
   * x = 986 à 1082, y = 410 à 432 ; « 1,99 € » en x = 1004 à 1081 ; 6e ligne
   * jusqu'en y = 758, texte de la 7e dès y = 775. À marge 6, le bord gauche
   * reste à 21 px du « € » des prix (texte jusqu'en x = 915, soit 949 une fois
   * la colonne recomposée).
   */
  frais: [976, 392, 1090, 756] as Zone,
  /** Fondu de la dernière ligne gardée (761-808) : le journal continue. */
  fondu: 70,
};

// ─── P3 : la vue par ETF (onglet Par ETF), l'AFFICHE, échelle 1,05 ──────────
// En-tête de y = 394 à 489, filet 490-492, lignes PE500 494-554, ETZ 558-617,
// PAEEM 622-681 (séparateurs gris clair), blanc 682-685. Colonne Ticker :
// cellule de x = 48 à 218, blanc 219-220. Colonnes calculées (fond blanc,
// pixels identiques sur toute la hauteur de x = 1900 à 1945 et de 2550 à
// 2595 : coupes nettes) : Parts détenues (texte 1951-2068), Total investi
// (2126-2337), PRU (2435-2547). Retirés : nom de l'ETF, allocation cible,
// TER, les trois colonnes de cours, Valeur actuelle (2605-2854), plus-value,
// perf., poids, écart.
//
// Valeur actuelle est retirée depuis la relecture d'exactitude du 04/10 : à
// côté de Total investi, elle laissait lire la plus-value de chaque ETF
// (+27,8 % pour PE500), une performance passée de trois ETF nommés, sur
// l'image la plus vue. Parts détenues, Total investi et PRU montrent à la place
// le calcul que la vidéo annonce : 4 484,17 € ÷ 101 parts = 44,40 €.
const E = { y1: 394, y2: 686 };
export const PAR_ETF = {
  k: 1.05,
  morceaux: [
    { de: [48, E.y1, 221, E.y2], x: 0, y: 0 }, // Ticker (+ blanc 219-220)
    { de: [1920, E.y1, 2575, E.y2], x: 173, y: 0 }, // Parts détenues, Total investi, PRU
  ] as Morceau[],
  largeurPng: 173 + (2575 - 1920),
  hauteurPng: E.y2 - E.y1,
  /** Valeurs calculées, sous l'en-tête et son filet : le cache qui se retire. */
  valeurs: [1920, 493, 2575, E.y2] as Zone,
  /** « 44,40 € », PRU de PE500 (texte en x = 2435 à 2548, y = 512 à 539 ; ligne 494-554). */
  pruPe500: [2427, 505, 2556, 546] as Zone,
};
