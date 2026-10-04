// Boucle muette du bandeau d'accueil : 1080×1080, 30 i/s, 570 images (19 s).
//
// Deux lignes de temps :
//   - le SCÉNARIO (540 images, numéros du storyboard, section 4 : B0 à B5),
//     dans lequel sont écrits tous les numéros d'image de ce fichier ;
//   - le FICHIER rendu (570 images) : le scénario, avec un arrêt sur image de
//     30 images sur l'état final du simulateur (titre, compteur arrivé,
//     graphique), et qui COMMENCE sur cet arrêt.
//
// Pourquoi commencer là (relecture design du 02/10) : l'image 0 du fichier
// sert d'affiche (poster), d'image fixe quand le visiteur demande moins
// d'animations, et c'est ce qui reste à l'écran si la lecture automatique est
// refusée (iPhone en économie d'énergie). Elle doit donc dire ce que fait le
// site, pas répéter le logo de l'en-tête. La carte du nom (B0) passe au milieu
// du fichier, entre le récapitulatif et la question.
//
// Raccord : l'image 569 du fichier est l'image 204 du scénario, l'image 0 est
// la 205 ; l'état est fixe de 202 à 223, les deux images sont identiques
// (vérifié par scripts/rendre.mjs). La carte du nom (scénario 525 → 539 → 0 →
// 14) est elle aussi un plan fixe, au milieu du fichier.

import React from "react";
import { AbsoluteFill, Easing, Freeze, useCurrentFrame } from "remotion";
import { anim, C, EASE, prog } from "../charte";
import { Fond } from "../composants/Fond";
import { CarteNom } from "../composants/Logo";
import { Capture, type Zone } from "../composants/Capture";
import { Morceaux, type Morceau } from "../composants/Morceaux";
import { Anneau, Marqueur, trajet, type Pose } from "../composants/Accents";
import { Compteur, Pastille, Revele, styleMention, styleSousTitre, styleTitre } from "../composants/Texte";
import { CAPTURES, Z } from "../zones";
import donnees from "../donnees.json";
import { HYPOTHESE_AFFICHEE, pointe } from "../courbe";

/** Durée du scénario (storyboard). */
const SCENARIO = 540;
/** Arrêts sur image : à l'image `a` du scénario, l'image est tenue `duree` images. */
const ARRETS = [{ a: 205, duree: 30 }] as const;
/** Position, dans le scénario rallongé des arrêts, de l'image 0 du fichier. */
const DEPART = 205;

export const BOUCLE = {
  largeur: 1080,
  hauteur: 1080,
  fps: 30,
  duree: SCENARIO + ARRETS.reduce((s, x) => s + x.duree, 0),
};

/** Image du fichier → image du scénario. */
export function imageScenario(f: number): number {
  let x = (((f + DEPART) % BOUCLE.duree) + BOUCLE.duree) % BOUCLE.duree;
  for (const { a, duree } of ARRETS) {
    if (x < a) return x;
    if (x < a + duree) return a;
    x -= duree;
  }
  return x;
}

/** Affiche, image fixe (prefers-reduced-motion) : l'image 0 du fichier. */
export const IMAGE_FIXE = 0;

const M = 80; // marge de sécurité
const LIGNE_MENTION = Math.round(34 * 1.35); // interligne de styleMention(34)
const LOGO = 112;
const D = donnees;

// ─── Géométrie partagée (le marqueur en a besoin) ────────────────────────────

// B1 : la courbe du logo, agrandie. Transformation affine des coordonnées du
// logo (viewBox 28×28) : à e = 0, le logo de 112 px centré ; à e = 1, la courbe
// étirée en bas du cadre (de x = 110 à 970).
function versEcran(x: number, y: number, e: number) {
  const X0 = 540 - LOGO / 2 + (x * LOGO) / 28;
  const Y0 = 540 - LOGO / 2 + (y * LOGO) / 28;
  const X1 = 110 + ((x - 5) / 17) * 860;
  const Y1 = 960 - ((21 - y) / 14.5) * 300;
  return { x: X0 + (X1 - X0) * e, y: Y0 + (Y1 - Y0) * e };
}
const etirement = (f: number) => anim(f, 36, 60, 0, 1, EASE.inOut);

// B2 : graphique du simulateur. Retouche du 04/10 : la mention passe sur deux
// lignes (frais de l'ETF déduits) ; le graphique descend de 46 px et passe de
// 700 à 660 px de large, bord droit inchangé (x = 1000), pour que l'axe des
// années reste dans le cadre.
const GRAPH = { x: 340, y: 516, largeur: 660 };
const kGraph = GRAPH.largeur / CAPTURES.graphique.l;
// Tracé : départ doux, arrivée qui ralentit (le compteur se pose sur la valeur).
const FIN_COMPTEUR = 188;
const balayage = (f: number) => prog(f, 140, FIN_COMPTEUR, Easing.bezier(0.45, 0, 0.2, 1));
function pointeCourbe(f: number) {
  const g = Z.graphique;
  const xBord = g.trace[0] + (g.trace[2] - g.trace[0]) * balayage(f);
  const p = pointe(xBord);
  return { xBord, compteur: p.compteur, ecran: { x: GRAPH.x + p.x * kGraph, y: GRAPH.y + p.y * kGraph } };
}

// B3 : UNE carte du comparateur en grand ; deux autres derrière, en pile.
// À trois cartes de 330 px, le badge « PEA » faisait 14×7 px une fois la vidéo
// réduite à 480 px (relecture design du 02/10).
// Retouche du 04/10 (comme CompleteCarree) : la carte est montrée en deux
// morceaux, l'en-tête (nom, fonds, indice, badge PEA) puis les
// caractéristiques (TER, réplication, ISIN). Le bloc du cours entre les deux
// est retiré : « 7,13 € +0,93 % · Mis à jour il y a 4 h » date de la capture
// et serait faux toute la vie de la vidéo. Même découpe pour les trois cartes.
// La carte, plus courte, est un peu plus large (700 → 780 px).
const CARTE_HAUT: Zone = [0, 0, 778, 340];
const CARTE_BAS: Zone = [0, 478, 778, 664];
const MORCEAUX_CARTE: Morceau[] = [
  { de: CARTE_HAUT, x: 0, y: 0 },
  { de: CARTE_BAS, x: 0, y: CARTE_HAUT[3] - CARTE_HAUT[1] },
];
const H_CARTE_PNG = CARTE_HAUT[3] - CARTE_HAUT[1] + (CARTE_BAS[3] - CARTE_BAS[1]);
// Relectures du 04/10 :
//   - le badge « Données différées » qualifiait le cours retiré : il est caché
//     par du blanc (le fond de la carte, #fff), sans toucher à la pastille
//     « Actions monde développé » qu'il touche. Rectangles mesurés pixel par
//     pixel sur chaque PNG (badge en y = 51 à 124, la pastille s'arrête en
//     y = 98 et le recouvre un peu à gauche ; le nom du fonds commence en
//     y = 135). Le second rectangle prend le bout du badge sous la pastille ;
//   - la carte, plus courte, laissait 200 px vides en bas du cadre : la pile
//     descend de 25 px (bas de la carte vers y = 902 au lieu de 877).
const CARTES: { cle: "carteCw8" | "carteDcam" | "carteWpea"; x: number; y: number; largeur: number; entree: number; caches: Zone[] }[] = [
  { cle: "carteCw8", x: 320, y: 327, largeur: 670, entree: 238, caches: [[240, 46, 391, 129]] },
  { cle: "carteDcam", x: 200, y: 351, largeur: 725, entree: 242, caches: [[262, 46, 397, 129], [397, 97, 406, 129], [406, 98, 407, 129]] },
  { cle: "carteWpea", x: M, y: 375, largeur: 780, entree: 246, caches: [[262, 46, 398, 129], [398, 97, 407, 129]] },
];

// B4 : fenêtre « Versement du mois » du Cockpit. Retouche du 04/10 : le
// tableau entier (10 colonnes, 1 240 px de large) faisait des textes d'environ
// 5 px une fois la vidéo réduite à 343 px. On n'en garde que ce qui raconte le
// plan, recomposé à partir de la capture (rien n'est redessiné) :
//   - la barre de fenêtre (pastilles, « Cockpit-DCA-PEA_dcatracker.xlsx ·
//     Versement du mois ») : c'est elle qui dit « classeur » (relecture de
//     fidélité du 04/10 ; sans elle, on prenait la fenêtre pour une carte du
//     site). Sa partie vide (x = 1000 à 1012, fond et filet du bas) est
//     étirée sur toute la largeur, puis le contenu posé dessus, à partir de
//     x = 24 (avant, le coin arrondi et le bord sombre de la capture) ;
//   - « Montant à verser ce mois-ci :        300,00 € », tel quel ;
//   - trois colonnes : « ETF », « Montant suggéré (€) », « ≈ Parts à acheter ».
//     Entre « ETF » et « Montant suggéré », une bande vide du tableau (x = 250
//     à 262 : fond d'en-tête et filets, sans texte) est étirée pour que le
//     tableau ait la largeur de la ligne du montant.
// Échelle 1 (un pixel de la capture = un pixel de la vidéo) : le texte reste
// net (à ×1,21, il était plus mou que le reste ; relecture du 04/10). Les
// textes du tableau font 28 px (capitales de 20 px), environ 9 px sur un
// téléphone. La fenêtre va d'une marge à l'autre (x = 80 à 999). La capture
// n'a pas de mention de fraîcheur (« Mis à jour… »).
const PAD_X = 31;
const PAD_Y = 24;
const BARRE: Zone = [24, 6, 800, 76]; // pastilles, nom du fichier, filet du bas (y = 74-75)
const BARRE_VIDE: Zone = [1000, 6, 1012, 76];
const LIGNE: Zone = [44, 336, 901, 432]; // « Montant à verser ce mois-ci : » … case « 300,00 € »
const TABLEAU = { y1: 532, y2: 800 };
const COL_ETF: Zone = [44, TABLEAU.y1, 250, TABLEAU.y2];
const BANDE_VIDE: Zone = [250, TABLEAU.y1, 262, TABLEAU.y2];
const COL_SUGGERE_PARTS: Zone = [1357, TABLEAU.y1, 1770, TABLEAU.y2]; // fond vert des deux colonnes
const largeurLigne = LIGNE[2] - LIGNE[0];
const hBarre = BARRE[3] - BARRE[1];
const yLigne = hBarre + PAD_Y;
const yTableau = yLigne + (LIGNE[3] - LIGNE[1]) + PAD_Y;
const largeurBande = largeurLigne - (COL_ETF[2] - COL_ETF[0]) - (COL_SUGGERE_PARTS[2] - COL_SUGGERE_PARTS[0]);
const FEN = {
  largeurPng: largeurLigne + 2 * PAD_X,
  hauteurPng: yTableau + (TABLEAU.y2 - TABLEAU.y1) + PAD_Y,
  morceaux: [
    { de: BARRE_VIDE, x: 0, y: 0, largeur: largeurLigne + 2 * PAD_X },
    { de: BARRE, x: BARRE[0], y: 0 },
    { de: LIGNE, x: PAD_X, y: yLigne },
    { de: COL_ETF, x: PAD_X, y: yTableau },
    { de: COL_SUGGERE_PARTS, x: PAD_X + largeurLigne - (COL_SUGGERE_PARTS[2] - COL_SUGGERE_PARTS[0]), y: yTableau },
    // Posée en dernier, avec 1 px de recouvrement de chaque côté : pas de
    // filet clair entre deux morceaux (le contenu de la bande est uniforme).
    { de: BANDE_VIDE, x: PAD_X + (COL_ETF[2] - COL_ETF[0]) - 1, y: yTableau, largeur: largeurBande + 2 },
  ] as Morceau[],
};
const LARGEUR_FEN = FEN.largeurPng; // échelle 1
const kFen = LARGEUR_FEN / FEN.largeurPng;
const FEN_Y = 290;
// Elle glisse à peine vers la gauche, jusqu'à la marge, et s'y pose AVANT le
// premier anneau (image 380) : aligné sur le titre pendant les anneaux, et
// texte net à l'arrêt (relecture de fidélité du 04/10 : elle n'arrivait
// qu'en 425, et le glissement, en `left`, avançait par à-coups d'un pixel).
const panFen = (f: number) => anim(f, 341, 375, 40, 0, EASE.quart);

// ─── Trajet du marqueur ──────────────────────────────────────────────────────
// Le point du logo devient la pointe de la courbe du simulateur (B1 → B2),
// puis s'efface avec le plan. Il n'est pas posé sur les captures suivantes :
// à côté d'un anneau, il se lit comme un bouton de l'interface.
const POSES: Pose[] = [
  // B1 : c'est le point du logo, qui suit la courbe qui s'étire.
  { de: 34, a: 120, pos: (f) => versEcran(22, 6.5, etirement(f)), r: 10, anneau: 0 },
  // B1 → B2 : il rejoint le début de la courbe « Base » et suit le tracé.
  { de: 140, a: 224, pos: (f) => pointeCourbe(f).ecran },
  { de: 238, a: 238, pos: () => ({ x: pointeCourbe(238).ecran.x - 80, y: pointeCourbe(238).ecran.y }), o: 0 },
];

// ─── Plans ───────────────────────────────────────────────────────────────────

/** B0 : la carte du nom, identique au début et à la fin du scénario. */
const Accroche: React.FC = () => (
  <AbsoluteFill>
    <Fond largeur={BOUCLE.largeur} pasPoints={48} rayonPoint={1.6} />
    <CarteNom cx={540} cy={540} logo={LOGO} />
  </AbsoluteFill>
);

/** B1 : la carte se resserre sur le logo, la courbe s'étire, la question. */
const Question: React.FC<{ f: number }> = ({ f }) => {
  const e = etirement(f);
  const p = (x: number, y: number) => versEcran(x, y, e);
  const [a, b, c, d, g] = [p(5, 21), p(9, 21), p(13, 15), p(17, 9), p(22, 6.5)];
  const carre = anim(f, 34, 44, 1, 0, EASE.inOut);
  const sortieCourbe = anim(f, 112, 130, 1, 0, EASE.inOut);
  const echelle = LOGO / 28 + (8 / 2.5 - LOGO / 28) * e; // épaisseur du trait : 10 px → 8 px
  return (
    <>
      {f < 34 ? (
        <CarteNom
          cx={540}
          cy={540}
          logo={LOGO}
          opaciteNom={anim(f, 15, 25, 1, 0)}
          ouverture={anim(f, 17, 31, 1, 0, EASE.inOut)}
          serrage={anim(f, 24, 34, 0, 1, EASE.inOut)}
        />
      ) : null}
      {f >= 34 ? (
        <svg width={BOUCLE.largeur} height={BOUCLE.hauteur} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {carre > 0 ? (
            <rect x={540 - LOGO / 2} y={540 - LOGO / 2} width={LOGO} height={LOGO} rx={(7 * LOGO) / 28} fill={C.bleu} opacity={carre} />
          ) : null}
          <path
            d={`M${a.x} ${a.y} Q${b.x} ${b.y} ${c.x} ${c.y} Q${d.x} ${d.y} ${g.x} ${g.y}`}
            stroke="white"
            strokeWidth={2.5 * echelle}
            strokeLinecap="round"
            fill="none"
            opacity={sortieCourbe}
          />
        </svg>
      ) : null}
      <Revele debut={46} sortie={108} flou={6} style={{ left: M, width: BOUCLE.largeur - 2 * M, top: 236, textAlign: "center" }}>
        <h1 style={styleTitre(88)}>
          Investir chaque mois
          <br />
          en ETF&nbsp;?
        </h1>
      </Revele>
      <Revele debut={50} sortie={110} style={{ left: M, width: BOUCLE.largeur - 2 * M, top: 452, textAlign: "center" }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>Combien, lesquels, et comment suivre&nbsp;?</p>
      </Revele>
    </>
  );
};

/** B2 : simuler. */
const Simuler: React.FC<{ f: number }> = ({ f }) => {
  const sortie = prog(f, 223, 237, EASE.inOut);
  const entree = prog(f, 120, 144, EASE.expo);
  const bout = pointeCourbe(f);
  // Le compteur suit la pointe de la courbe et finit sur la valeur du site.
  const valeur = f >= FIN_COMPTEUR ? D.simulateur.valeurFinale : bout.compteur;
  return (
    <AbsoluteFill style={{ transform: `translateX(${-80 * sortie}px)`, opacity: 1 - sortie }}>
      <Revele debut={122} flou={6} style={{ left: M, top: 92 }}>
        <h2 style={styleTitre(84)}>Simulez votre DCA</h2>
      </Revele>
      <Revele debut={134} style={{ left: M - 4, top: 196 }}>
        <Compteur valeur={valeur} taille={132} />
      </Revele>
      {/* « 200 €/mois pendant 20 ans » n'apparaît qu'une fois le compteur
          arrivé : à côté d'une valeur intermédiaire, l'association serait fausse. */}
      <Revele debut={FIN_COMPTEUR} style={{ left: M, top: 344 }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>
          {D.affichage.versementMensuel} pendant {D.simulateur.dureeAns}&nbsp;ans
        </p>
      </Revele>
      <Revele debut={134} style={{ left: M, top: 402 }}>
        <p style={{ ...styleMention(34), margin: 0 }}>
          Hypothèse de {HYPOTHESE_AFFICHEE}&nbsp;%/an avant frais, pas une prévision
        </p>
      </Revele>
      {/* Retouche du 04/10 : 97 753 € est un résultat APRÈS les frais de l'ETF
          (rendement net du simulateur = hypothèse − frais, vérifié par
          scripts/extraire-donnees.mjs). Vrai aussi pour les valeurs
          intermédiaires du compteur : la ligne arrive avec la première.
          L'ETF est nommé (relecture d'exactitude du 04/10) : sans son nom, on
          prenait ces frais pour ceux de la carte WPEA du plan suivant, dont
          l'anneau entoure « TER : 0,20 % ». */}
      <Revele debut={138} style={{ left: M, top: 402 + LIGNE_MENTION }}>
        <p style={{ ...styleMention(34), margin: 0 }}>
          Frais de l&apos;ETF {D.simulateur.etfFrais} ({D.simulateur.fraisDefaut}/an) déduits
        </p>
      </Revele>
      <Capture
        {...CAPTURES.graphique}
        largeur={GRAPH.largeur}
        style={{ left: GRAPH.x, top: GRAPH.y, transform: `translateY(${(1 - entree) * 320}px)`, opacity: prog(f, 120, 130) }}
      >
        {(z) => {
          // Cache blanc sur la partie pas encore tracée (le fond de la carte est blanc).
          const [, y1, x2, y2] = Z.graphique.trace;
          return f < FIN_COMPTEUR ? <div style={{ position: "absolute", ...z([bout.xBord, y1, x2, y2]), background: C.blanc }} /> : null;
        }}
      </Capture>
    </AbsoluteFill>
  );
};

/** B3 : comparer. Les trois anneaux suivent le sous-titre : frais, réplication, PEA. */
const Comparer: React.FC<{ f: number }> = ({ f }) => {
  const sortie = prog(f, 328, 342, EASE.inOut);
  return (
    <AbsoluteFill style={{ transform: `translateX(${-80 * sortie}px)`, opacity: 1 - sortie }}>
      <Revele debut={236} flou={6} style={{ left: M, top: 92 }}>
        <h2 style={styleTitre(84)}>Comparez {D.comparateur.nbEtf}&nbsp;ETF</h2>
      </Revele>
      <Revele debut={240} style={{ left: M, top: 200 }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>Frais, réplication, éligibilité PEA</p>
      </Revele>
      {CARTES.map((c) => {
        const t = prog(f, c.entree, c.entree + 30, EASE.expo);
        const devant = c.cle === "carteWpea";
        return (
          <Morceaux
            key={c.cle}
            {...CAPTURES[c.cle]}
            morceaux={MORCEAUX_CARTE}
            largeurPng={CAPTURES[c.cle].l}
            hauteurPng={H_CARTE_PNG}
            largeur={c.largeur}
            halo={devant}
            style={{ left: c.x, top: c.y, opacity: prog(f, c.entree, c.entree + 10), transform: `translateY(${(1 - t) * 60}px)` }}
          >
            {(z) => (
              <>
                {c.caches.map((zone) => (
                  <div key={zone.join()} style={{ position: "absolute", ...z(zone), background: C.blanc }} />
                ))}
                {devant ? (
                  <>
                    <Anneau rect={z(Z.carteEtf.ter)} debut={272} repos={0.55} couleur={C.bleu} epaisseur={4} marge={8} rayon={12} />
                    <Anneau rect={z(Z.carteEtf.replication)} debut={284} repos={0.55} couleur={C.bleu} epaisseur={4} marge={8} rayon={12} />
                    <Anneau rect={z(Z.carteEtf.badgePea)} debut={296} couleur={C.bleu} epaisseur={4} marge={7} rayon={16} />
                  </>
                ) : null}
              </>
            )}
          </Morceaux>
        );
      })}
    </AbsoluteFill>
  );
};

/** B4 : suivre son PEA (fenêtre « Versement du mois » du Cockpit, payant). */
const Suivre: React.FC<{ f: number }> = ({ f }) => {
  const sortie = prog(f, 435, 449, EASE.inOut);
  const entree = prog(f, 341, 366, EASE.expo);
  const basFen = FEN_Y + FEN.hauteurPng * kFen;
  return (
    <AbsoluteFill style={{ opacity: 1 - sortie, transform: `scale(${1 - 0.08 * sortie})` }}>
      <Revele debut={341} flou={6} style={{ left: M, top: 92 }}>
        <h2 style={styleTitre(84)}>Suivez votre PEA</h2>
      </Revele>
      <Revele debut={345} style={{ left: M, top: 200 }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>Chaque mois, dans Excel ou Google&nbsp;Sheets</p>
      </Revele>
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <Morceaux
          {...CAPTURES.versement}
          morceaux={FEN.morceaux}
          largeurPng={FEN.largeurPng}
          hauteurPng={FEN.hauteurPng}
          largeur={LARGEUR_FEN}
          rayonPng={16}
          style={{
            left: M,
            top: FEN_Y,
            opacity: prog(f, 341, 352),
            transform: `translateX(${panFen(f)}px) translateY(${(1 - entree) * 90}px) rotateX(${8 * (1 - entree)}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          {(z) => (
            <>
              <Anneau rect={z(Z.versement.montant)} debut={380} repos={0.55} couleur={C.bleu} epaisseur={4} marge={2} rayon={10} />
              {/* L'anneau apparaît à sa taille finale : un bord qui balaie la
                  colonne passait sur le « 14 » (lu « 1 1 »). */}
              <Anneau rect={z(Z.versement.colonneParts)} debut={395} couleur={C.bleu} epaisseur={4} marge={4} rayon={12} />
            </>
          )}
        </Morceaux>
      </div>
      {/* Cette fenêtre est celle du Cockpit, payant : la boucle le dit (elle
          enchaîne sur deux outils gratuits et se regarde sans le son). */}
      <Revele debut={372} style={{ left: M, top: basFen + 34 }}>
        <Pastille taille={32}>
          Cockpit DCA · {D.affichage.cockpitPrix}, paiement unique
        </Pastille>
      </Revele>
      <Revele debut={378} style={{ left: M, top: basFen + 116 }}>
        <p style={{ ...styleMention(34), margin: 0 }}>Exemple pré-rempli, extrait du tableau</p>
      </Revele>
    </AbsoluteFill>
  );
};

/** B5 : récapitulatif, puis retour à la carte du nom (identique à l'image 0 du scénario). */
const Fin: React.FC<{ f: number }> = ({ f }) => {
  const mots = ["Simulez.", "Comparez.", "Suivez."];
  const cy = anim(f, 505, 525, 880, 540, EASE.inOut);
  const entreeCarte = prog(f, 468, 488, EASE.expo);
  const opaciteCarte = prog(f, 468, 474);
  return (
    <>
      {mots.map((m, i) => (
        <Revele key={m} debut={447 + 8 * i} sortie={500} dureeSortie={15} flou={6} style={{ left: 0, width: BOUCLE.largeur, top: 250 + 104 * i, textAlign: "center" }}>
          <p style={styleTitre(84)}>{m}</p>
        </Revele>
      ))}
      <div style={{ position: "absolute", inset: 0, opacity: opaciteCarte }}>
        <CarteNom cx={540} cy={cy} logo={LOGO} echelle={0.92 + 0.08 * entreeCarte} />
      </div>
    </>
  );
};

/** Le scénario, image par image (numéros du storyboard). */
const Scenario: React.FC = () => {
  const f = useCurrentFrame();
  if (f <= 14 || f >= 525) return <Accroche />;
  const m = trajet(POSES, f, 12);
  return (
    <AbsoluteFill>
      <Fond largeur={BOUCLE.largeur} pasPoints={48} rayonPoint={1.6} />
      {f < 130 ? <Question f={f} /> : null}
      {f >= 120 && f < 238 ? <Simuler f={f} /> : null}
      {f >= 236 && f < 343 ? <Comparer f={f} /> : null}
      {f >= 341 && f < 450 ? <Suivre f={f} /> : null}
      {f >= 446 ? <Fin f={f} /> : null}
      <Marqueur {...m} />
    </AbsoluteFill>
  );
};

/** Le fichier : le scénario, avec ses arrêts, commencé sur l'état final du simulateur. */
export const Boucle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={imageScenario(f)}>
      <Scenario />
    </Freeze>
  );
};
