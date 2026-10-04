// Zones des captures, en pixels des PNG de public/captures/ (02/10/2026).
// Mesurées en lisant les pixels (couleur du badge, des bordures, du texte), pas
// à l'œil. Si `npm run captures` refait les images et que la mise en page du
// site a bougé, vérifier ces zones sur les images de contrôle
// (npm run controle) : un anneau décalé s'y voit tout de suite.

export const CAPTURES = {
  graphique: { fichier: "simulateur-bureau-graphique.png", l: 944, h: 916 },
  parametres: { fichier: "simulateur-bureau-parametres.png", l: 800, h: 2044 },
  scenarios: { fichier: "simulateur-bureau-scenarios.png", l: 1568, h: 404 },
  carteWpea: { fichier: "comparer-etf-bureau-carte-wpea.png", l: 778, h: 1126 },
  carteDcam: { fichier: "comparer-etf-bureau-carte-dcam.png", l: 778, h: 1126 },
  carteCw8: { fichier: "comparer-etf-bureau-carte-cw8.png", l: 778, h: 1126 },
  filtres: { fichier: "comparer-etf-bureau-filtres.png", l: 2480, h: 288 },
  filtresPea: { fichier: "comparer-etf-bureau-filtres-pea.png", l: 2480, h: 288 },
  listePea: { fichier: "etf-eligibles-pea-bureau-msci-world.png", l: 1456, h: 1092 },
  taux: { fichier: "calculateur-fiscal-bureau-taux.png", l: 1408, h: 356 },
  transactions: { fichier: "suivi-pea-excel-bureau-transactions.png", l: 1456, h: 1164 },
  versement: { fichier: "cockpit-bureau-fenetre-versement.png", l: 2216, h: 840 },
  premium: { fichier: "tarifs-bureau-premium-liste.png", l: 708, h: 724 },
} as const;

export const Z = {
  // Graphique « Évolution du portefeuille » : zone de tracé et courbe « Base ».
  graphique: {
    trace: [150, 180, 905, 770] as const, // courbes, grille et axe des années
    // Axe des abscisses : 1 an en x = 172, 20 ans en x = 877 ; axe des
    // ordonnées : 0 € en y = 728, 140 k€ en y ≈ 195 (3,806 px par k€).
    x1an: 172,
    x20ans: 877,
    y0: 728,
    pxParKEur: 3.806,
    finBase: { x: 877, y: 356 },
  },
  parametres: {
    recadrage: [0, 0, 800, 1150] as const,
    versement: [610, 459, 721, 518] as const, // case « 200 »
    duree: [586, 727, 697, 786] as const, // case « 20 »
    rendement: [602, 1027, 713, 1086] as const, // case « 7 »
  },
  scenarios: {
    conservateur: [2, 72, 500, 402] as const,
    base: [535, 72, 1033, 402] as const,
    optimiste: [1068, 72, 1566, 402] as const,
  },
  // Cartes du comparateur. Badge vert « PEA » identique sur les trois ; TER et
  // réplication mesurés sur la carte WPEA (la seule qui porte des anneaux dans
  // la boucle), texte foncé lu pixel par pixel le 02/10/2026.
  carteEtf: {
    badgePea: [655, 107, 728, 144] as const,
    ter: [51, 501, 195, 522] as const, // « TER : 0,20 % »
    replication: [408, 501, 687, 555] as const, // « Réplication : Synthétique (swap) »
    // En-tête de la carte, jusqu'à l'ISIN (le filet de séparation est en y = 679).
    recadrage: [0, 0, 778, 664] as const,
  },
  filtres: {
    // Partie droite de la barre : interrupteur « PEA uniquement » et compteur.
    recadrage: [1252, 0, 2480, 160] as const, // à partir de la puce « Obligations »
    interrupteur: [1528, 31, 1599, 70] as const,
    libellePea: [1528, 22, 1790, 80] as const,
    compteur: [2355, 112, 2455, 137] as const,
  },
  listePea: {
    recadrage: [24, 139, 1434, 1072] as const, // le tableau seul, sans le paragraphe
    isin: [598, 0, 798, 0] as const, // colonne ISIN (x)
    lignes: [
      [229, 399],
      [399, 611],
      [611, 857],
      [857, 1069],
    ] as const,
    texteIsin: [605, 787] as const,
  },
  taux: {
    recadrage: [0, 30, 1408, 330] as const, // sans la ligne coupée du bas
    pea: [425, 106, 566, 138] as const, // « 18,6 % »
    cto: [839, 166, 952, 198] as const, // « 31,4 % »
  },
  versement: {
    montant: [684, 343, 893, 425] as const, // case « 300,00 € »
    colonneParts: [1573, 536, 1770, 792] as const, // « ≈ Parts à acheter »
  },
  premium: {
    // Lignes de la liste : suivi mensuel, récap fiscal, Monte Carlo, backtest.
    lignes: [
      [22, 30, 690, 112],
      [22, 128, 690, 208],
      [22, 224, 690, 304],
      [22, 322, 690, 402],
    ] as const,
  },
} as const;
