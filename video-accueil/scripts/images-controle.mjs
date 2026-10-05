// Images fixes de contrôle : une image à chaque changement de plan (et au
// milieu des plans chargés), pour relire texte, cadrage, logo et couleurs
// sans regarder la vidéo image par image. Plus deux planches contact.
//
// Lancer : npm run controle               (toutes les images + planches)
//          npm run controle -- CompleteCarree (les images par défaut d'une seule
//                                              composition, et sa planche)
//          npm run controle -- BoucleCockpit  (boucle de la page du Cockpit)
//          npm run controle -- BoucleModeleGratuit (boucle du modèle gratuit)
//          npm run controle -- Boucle:0,97 Complete:300,315   (images choisies)
// Sortie : out/controle/<composition>-<image>.png
//          out/controle/_planche-boucle.png, _planche-bouclecockpit.png,
//          _planche-bouclemodelegratuit.png,
//          _planche-complete.png, _planche-completecarree.png
//
// Les numéros de la boucle sont ceux du FICHIER rendu (570 images), qui
// commence sur l'état final du simulateur ; entre parenthèses, l'image du
// scénario (storyboard) correspondante.

import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { navigateurLocal } from "./navigateur.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const SORTIE = path.join(RACINE, "out/controle");

const PAR_DEFAUT = {
  Boucle: [
    0, // (205) affiche : titre, compteur arrivé, graphique
    55, // (230) sortie du simulateur
    85, // (260) comparer : cartes qui montent
    100, // (275) anneau « TER »
    115, // (290) anneau « Réplication »
    135, // (310) les trois anneaux
    180, // (355) suivre : fenêtre qui monte
    210, // (385) anneau « 300,00 € », pastille Cockpit
    235, // (410) anneau des parts, ETF visible
    255, // (430) fin du plan
    295, // (470) récapitulatif
    315, // (490)
    337, // (512) retour de la carte du nom
    364, // (539) carte du nom
    385, // (20) la carte se resserre
    395, // (30)
    415, // (50) la question
    465, // (100)
    490, // (125) entrée du simulateur
    530, // (165) le compteur défile, sans sous-titre
    555, // (190) compteur arrivé, le sous-titre apparaît
    569, // (204) dernière image = image 0
  ],
  // Boucle du Cockpit (STORYBOARD-COCKPIT.md). Numéros du FICHIER (570
  // images, qui commence sur l'affiche) ; entre parenthèses, l'image du
  // scénario : fichier = scénario − 225 à partir de 255, scénario + 315 avant.
  BoucleCockpit: [
    0, // (255) affiche : ligne d'ETZ, anneau du « 14 », « → 14 parts d'ETZ »
    52, // (277) P3 recule
    61, // (286) P4 : la fenêtre entre, les cases avec elle
    65, // (290) P4 : 1re image où la fenêtre dépasse 0,5 d'opacité (mention ?)
    80, // (305) les cases sont posées
    115, // (340) anneau « Valeur » seul
    155, // (380) P5 : 1re image où la fenêtre dépasse 0,5 (mention ?)
    185, // (410) anneau du cap des 5 ans
    215, // (440) P5 posé
    232, // (457) P5 presque sortie, le carré du logo apparaît
    240, // (465) le logo se trace, le nom entre
    290, // (515) fin : nom, formats, prix
    307, // (532) la fin s'éteint
    310, // (535) la question entre déjà
    314, // (539) dernière image du scénario : la question entre
    315, // (0) reprise : même état qu'en 539, une image plus loin
    317, // (2) la question entre
    345, // (30) la question
    381, // (66) sortie de la question
    394, // (79) P2 : 1re image où la fenêtre dépasse 0,5 (mention ?)
    418, // (103) bande sur la ligne d'ETZ
    440, // (125) anneau « -6,7 % »
    472, // (157) sortie de P2
    485, // (170) P3 : 1re image où la fenêtre dépasse 0,5 (mention ?)
    515, // (200) anneau « 300,00 € »
    530, // (215) le calcul se découvre, la bande d'ETZ arrive
    545, // (230) anneau du « 14 », la réponse entre
    569, // (254) dernière image = image 0
  ],
  // Boucle du modèle gratuit (STORYBOARD-MODELE-GRATUIT.md). Numéros du
  // FICHIER (510 images, qui commence sur l'affiche) ; entre parenthèses,
  // l'image du scénario : fichier = scénario − 225 à partir de 255,
  // scénario + 255 avant.
  BoucleModeleGratuit: [
    0, // (255) affiche : pastille, Par ETF (parts, investi, PRU), anneau, réponse, mention
    50, // (275) P3 recule
    58, // (283) P4 : titre et sous-titre entrent, P3 presque sortie
    66, // (291) P4 : la carte Excel monte, la carte Sheets entre
    90, // (315) P4 posé, note sur deux lignes
    140, // (365) P4 toujours lisible (sortie à 371 depuis la relecture design)
    148, // (373) sortie de P4
    156, // (381) fin de la sortie de P4, avant le carré du logo
    158, // (383) le carré du logo apparaît, les cartes éteintes
    161, // (386) le titre de la fin entre avec le carré
    164, // (389) le logo se trace
    172, // (397) la fin entre
    176, // (401) la réponse « → Gratuit, reçu par email » entre
    184, // (409) la réponse posée
    200, // (425) fin posée
    245, // (470) la fin s'éteint
    251, // (476) la question entre déjà, la fin presque éteinte
    254, // (479) dernière image du scénario
    255, // (0) reprise : même état qu'en 479, une image plus loin
    258, // (3) la question entre
    290, // (35) la question
    318, // (63) sortie de la question
    326, // (71) P2 : titre, fenêtre qui monte
    330, // (75) P2 : 1re image où la fenêtre dépasse 0,5 d'opacité (mention ?)
    355, // (100) l'anneau de la colonne Frais entre
    365, // (110) anneau de la colonne Frais posé
    395, // (140) P2 posé
    412, // (157) sortie de P2
    415, // (160) fin de la sortie de P2, le titre de P3 entre
    420, // (165) P3 entre, la pastille arrive
    428, // (173) P3 : 1re image où la fenêtre dépasse 0,5 (mention ?)
    450, // (195) P3 : fenêtre posée, cache encore plein
    460, // (205) les calculs se découvrent
    475, // (220) calculs découverts, avant l'anneau
    480, // (225) l'anneau du PRU se pose
    490, // (235) la réponse se pose
    509, // (254) dernière image = image 0
  ],
  // C1 | C2 | C3 (réglages, compteur, scénarios) | C4 | C5 | C6 | C7 | C8 | C9
  Complete: [0, 30, 75, 100, 130, 196, 230, 255, 265, 290, 320, 375, 395, 440, 465, 500, 545, 590, 615, 660, 700, 715, 735, 770, 820, 845, 880, 899],
  // Version carrée, mêmes temps que Complete (t(n) = 15 n) :
  // C1 logo, point, carte ouverte | C2 questions | C3 réglages (13, 14, 15),
  // compteur qui défile puis arrivé (17,5), scénarios (20,5 / 21,5 / 22,5) |
  // C4 interrupteur (26), cartes et anneaux (28, 29, 30) | C5 bande ISIN
  // (34 à 37, défilement) | C6 soulignements (39, 40) | C7 modèle gratuit,
  // Cockpit, anneaux (46,5 ; 47,5) | C8 lignes Premium, prix | C9 fin.
  // Plus les images des relectures du 03/10 : première image (0), compteur
  // arrivé sur la cloche (263), passage graphique → scénarios (305), entrée
  // des cartes (410, 420), tics ISIN (540, 555), panoramique du Cockpit (712,
  // 722), et la coupe franche C8 → C9 (839, 840).
  // Finition du 04/10 : le milieu d'une coupe glissée (180, sur le temps 12),
  // le flou de mouvement des scénarios (320) et du panoramique (708), le
  // reflet sur la carte Premium (760).
  CompleteCarree: [
    0, 30, 48, 75, 100, 125, 150, 172, 180, 205, 215, 230, 250, 263, 290, 305, 320, 330, 345, 362, 395, 410, 420, 440, 455,
    470, 478, 500, 515, 530, 540, 555, 565, 590, 605, 625, 660, 686, 700, 708, 712, 722, 745, 760, 770, 790, 815, 839, 840,
    860, 880, 899,
  ],
};

const demandes = process.argv.slice(2);
// « CompleteCarree » seul : ses images par défaut et sa planche ; « id:a,b » :
// les images choisies, sans planche.
const choisies = demandes.some((d) => d.includes(":"));
const travail = demandes.length
  ? Object.fromEntries(demandes.map((d) => { const [c, l] = d.split(":"); return [c, l ? l.split(",").map(Number) : PAR_DEFAUT[c]]; }))
  : PAR_DEFAUT;
for (const [c, l] of Object.entries(travail)) if (!l) throw new Error(`Composition inconnue : ${c}`);

await mkdir(SORTIE, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(RACINE, "src/index.ts"), publicDir: path.join(RACINE, "public") });
const browserExecutable = navigateurLocal();
const puppeteerInstance = await openBrowser("chrome", { browserExecutable });

for (const [id, images] of Object.entries(travail)) {
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance });
  for (const frame of images) {
    if (frame >= composition.durationInFrames) continue;
    const fichier = path.join(SORTIE, `${id.toLowerCase()}-${String(frame).padStart(4, "0")}.png`);
    await renderStill({ serveUrl, composition, frame, output: fichier, imageFormat: "png", puppeteerInstance, overwrite: true });
    console.log(`✓ ${path.relative(RACINE, fichier)}`);
  }
  // Planche contact des mêmes images (une seule image, 4 colonnes).
  if (!choisies) {
    const inputProps = { id, images };
    const planche = await selectComposition({ serveUrl, id: "Planche", inputProps, puppeteerInstance });
    const fichier = path.join(SORTIE, `_planche-${id.toLowerCase()}.png`);
    await renderStill({ serveUrl, composition: planche, inputProps, frame: 0, output: fichier, imageFormat: "png", puppeteerInstance, overwrite: true });
    console.log(`✓ ${path.relative(RACINE, fichier)}`);
  }
}

await puppeteerInstance.close({ silent: true });
