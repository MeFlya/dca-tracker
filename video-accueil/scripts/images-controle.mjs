// Images fixes de contrôle : une image à chaque changement de plan (et au
// milieu des plans chargés), pour relire texte, cadrage, logo et couleurs
// sans regarder la vidéo image par image. Plus deux planches contact.
//
// Lancer : npm run controle               (toutes les images + planches)
//          npm run controle -- CompleteCarree (les images par défaut d'une seule
//                                              composition, et sa planche)
//          npm run controle -- Boucle:0,97 Complete:300,315   (images choisies)
// Sortie : out/controle/<composition>-<image>.png
//          out/controle/_planche-boucle.png, _planche-complete.png,
//          _planche-completecarree.png
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
