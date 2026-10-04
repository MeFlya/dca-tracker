// Version carrée avec le son : 1080×1080, 30 i/s, 60 temps (30 s à 120 BPM).
//
// Décision de Maël (03/10/2026) : le format carré, « plus pro », remplace le
// 16:9 pour la fenêtre « Regarder avec le son ». Cette composition raconte les
// MÊMES neuf plans que Complete (STORYBOARD.md, section 5 : C1 à C9), coupés
// aux MÊMES temps (0, 6, 12, 24, 32, 38, 42, 50, 56) : la musique et la
// bande-son partagée (src/son/BandeSon.tsx) tombent donc juste, bruitages
// compris (questions, bascule du filtre, bande ISIN, soulignements).
//
// Mise en page de la Boucle : une idée par plan, texte en haut (surtitre,
// titre, sous-titre) aligné à gauche dans la marge de 80 px, une capture
// recadrée serrée en dessous, un seul point d'attention à la fois (anneau,
// bande, soulignement, ou le point blanc du logo).
//
// Lisibilité : la vidéo est vue vers 343 px de large sur un téléphone (×0,32)
// et 600 à 720 px sur ordinateur. Titres 84 px, sous-titres 40 px, mentions et
// surtitres 32 à 34 px ; chaque capture est recadrée ou parcourue par une
// fenêtre (panoramique, défilement) pour que ses chiffres restent lisibles.
//
// Textes : ceux de Complete (STORYBOARD.md, section 7, source de chacun),
// parfois raccourcis pour le carré, jamais complétés. Chiffres et prix :
// donnees.json (scripts/extraire-donnees.mjs).

import React from "react";
import { AbsoluteFill, Easing, Img, interpolateColors, staticFile, useCurrentFrame } from "remotion";
import { anim, C, EASE, INTER, OMBRE_CARTE, prog } from "../charte";
import { Fond } from "../composants/Fond";
import { CarteNom, geometrieCarte } from "../composants/Logo";
import { Capture, type Rect, type Zone } from "../composants/Capture";
import { Anneau, Bande, Marqueur, trajet, type Pose } from "../composants/Accents";
import { Compteur, Pastille, Revele, styleMention, styleSousTitre, styleSurtitre, styleTitre } from "../composants/Texte";
import { CAPTURES, Z } from "../zones";
import { HYPOTHESE_AFFICHEE, pointe } from "../courbe";
import { DUREE_COMPLETE, t } from "../tempo";
import { BandeSon, type BandeSonProps } from "../son/BandeSon";
import { TransitionSeries } from "@remotion/transitions";
import { FlouMouvement, glissement, HorlogeAbsolue, Reflet, tempsCoupe, type FenetreFlou } from "./Finition";
import donnees from "../donnees.json";

export const COMPLETE_CARREE = { largeur: 1080, hauteur: 1080, fps: 30, duree: DUREE_COMPLETE };
const L = COMPLETE_CARREE.largeur;
const M = 80; // marge de sécurité (comme la boucle)
const LARGEUR_UTILE = L - 2 * M; // 920
const D = donnees;
const A = D.affichage;
const S = D.simulateur;

// ─── Typographie et en-tête (identiques d'un plan à l'autre) ─────────────────
const TITRE = 84; // comme la boucle
const LIGNE_TITRE = Math.round(TITRE * 1.08);
const Y_SURTITRE = 66;
const Y_TITRE = 124;
const SURTITRE = 32;
const SOUS_TITRE = 40;
const MENTION = 34; // comme la boucle (environ 11 px sur un téléphone)
/** Bas du titre (une ou deux lignes). */
const basTitre = (lignes: 1 | 2) => Y_TITRE + LIGNE_TITRE * lignes;
/** Haut du sous-titre, sous un titre d'une ou deux lignes. */
const ySousTitre = (lignes: 1 | 2) => basTitre(lignes) + 18;

// ─── Bornes des plans (en images), les mêmes que Complete ────────────────────
const P = {
  c1: [t(0), t(6) - 1],
  c2: [t(6), t(12) - 1],
  c3: [t(12), t(24) - 1],
  c4: [t(24), t(32) - 1],
  c5: [t(32), t(38) - 1],
  c6: [t(38), t(42) - 1],
  c7: [t(42), t(50) - 1],
  c8: [t(50), t(56) - 1],
  c9: [t(56), DUREE_COMPLETE - 1],
} as const;

/** Les coupes entre plans (finition du 04/10/2026) : un <TransitionSeries> de
 * @remotion/transitions, chaque transition centrée sur le temps de la coupe
 * (voir COUPES, en bas du fichier). Le plan qui sort glisse à gauche et
 * s'efface, celui qui entre arrive de la droite (Finition.tsx, glissement).
 *
 * Décalage des entrées par rapport au temps de la coupe : l'en-tête et la
 * capture du plan suivant commencent à t(n) - 2, PENDANT le glissement. Le
 * plan qui entre ne devient visible qu'à 25 % de la transition (vers
 * t(n) - 1), mais ses éléments sont alors déjà en route : sur l'image du temps,
 * il est à environ 45 %, l'ancien presque effacé. Il n'y a plus de creux au
 * milieu de la coupe : avant, ils attendaient t(n) + 1 et l'image du milieu ne
 * montrait que le fond. */
const APRES_COUPE = -2;

/** En-tête en haut à gauche : surtitre, titre (une ou deux lignes), sous-titre. */
const EnTete: React.FC<{ debut: number; surtitre?: string; titre: React.ReactNode; lignes?: 1 | 2; sousTitre?: React.ReactNode }> = ({
  debut,
  surtitre,
  titre,
  lignes = 1,
  sousTitre,
}) => (
  <>
    {surtitre ? (
      <Revele debut={debut + APRES_COUPE} style={{ left: M, top: Y_SURTITRE }}>
        <span style={styleSurtitre(SURTITRE)}>{surtitre}</span>
      </Revele>
    ) : null}
    <Revele debut={debut + APRES_COUPE + 1} flou={6} style={{ left: M, top: Y_TITRE, width: LARGEUR_UTILE }}>
      <h2 style={{ ...styleTitre(TITRE), whiteSpace: lignes === 1 ? "nowrap" : undefined }}>{titre}</h2>
    </Revele>
    {sousTitre ? (
      <Revele debut={debut + APRES_COUPE + 5} style={{ left: M, top: ySousTitre(lignes), width: LARGEUR_UTILE }}>
        <p style={{ ...styleSousTitre(SOUS_TITRE), margin: 0 }}>{sousTitre}</p>
      </Revele>
    ) : null}
  </>
);

/** Profondeur des captures (finition du 04/10/2026) : sous l'ombre douce du
 * site (shadow-card-lg), une ombre portée plus longue et diffuse, qui pose la
 * carte au-dessus du fond. Discrète sur le fond sombre : elle se voit surtout
 * sous les cartes, là où le halo bleu s'éteint. */
const OMBRE_PROFONDE = "0 30px 60px -20px rgba(0, 0, 0, 0.6)";
/** La même ombre sous une <Capture> (style de son cadre extérieur, aux coins
 * de la carte). */
const profondeur = (rayon: number): React.CSSProperties => ({ borderRadius: rayon, boxShadow: OMBRE_PROFONDE });

/** Halo de TrackingPitch derrière une carte (comme composants/Capture). */
const Halo: React.FC<{ rayon: number }> = ({ rayon }) => (
  <div
    style={{
      position: "absolute",
      inset: -14,
      borderRadius: rayon * 1.5,
      background: "linear-gradient(to bottom right, rgba(59,130,246,0.30), rgba(129,140,248,0.20), rgba(56,189,248,0.20))",
      filter: "blur(40px)",
    }}
  />
);

/**
 * Fenêtre de lecture : une carte blanche de taille fixe, à travers laquelle on
 * voit une partie d'une capture agrandie. `dx`, `dy` (pixels du PNG) placent le
 * coin haut gauche de la partie visible : en les animant, la capture défile
 * sous la fenêtre (panoramique), sans jamais rétrécir ses chiffres.
 * `fondus` (opacités 0 → 1) : un dégradé blanc sur un bord où la capture est
 * coupée, pour qu'il se lise comme un extrait et non comme une coupure.
 * `largeurFondu` : largeur de ce dégradé (110 px par défaut).
 * `zoom` : échelle du contenu autour du centre de la fenêtre.
 */
const Fenetre: React.FC<{
  capture: { fichier: string; l: number; h: number };
  recadrage: Zone;
  k: number;
  dx?: number;
  dy?: number;
  largeur: number;
  hauteur: number;
  marge?: number;
  fondus?: { gauche?: number; droite?: number };
  largeurFondu?: number;
  zoom?: number;
  style?: React.CSSProperties;
  children?: (z: (zone: Zone) => Rect) => React.ReactNode;
}> = ({ capture, recadrage, k, dx = 0, dy = 0, largeur, hauteur, marge = 0, fondus = {}, largeurFondu = 110, zoom = 1, style, children }) => {
  const [x1, y1, x2] = recadrage;
  const fondu = (cote: "left" | "right", o = 0) =>
    o > 0 ? (
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [cote]: 0,
          width: largeurFondu,
          opacity: o,
          // Un tiers plein, puis le dégradé : un chiffre tronqué au bord ne se lit plus.
          background: `linear-gradient(to ${cote === "left" ? "right" : "left"}, #ffffff, #ffffff 35%, rgba(255,255,255,0))`,
        }}
      />
    ) : null;
  return (
    <div style={{ position: "absolute", width: largeur, height: hauteur, ...style }}>
      <Halo rayon={20} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          overflow: "hidden",
          background: C.blanc,
          border: "1px solid rgba(226,232,240,0.6)",
          boxShadow: `${OMBRE_CARTE}, ${OMBRE_PROFONDE}`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: zoom !== 1 ? `scale(${zoom})` : undefined }}>
          <Capture
            {...capture}
            recadrage={recadrage}
            largeur={(x2 - x1) * k}
            rayonPng={0}
            halo={false}
            style={{ left: marge - (dx - x1) * k, top: marge - (dy - y1) * k }}
          >
            {children ? (z) => children(z) : undefined}
          </Capture>
        </div>
        {fondu("left", fondus.gauche)}
        {fondu("right", fondus.droite)}
      </div>
    </div>
  );
};

/** Trait sous un texte natif (pas une capture), qui se trace de gauche à
 * droite comme Soulignement, à la largeur du texte quelle qu'elle soit. */
const Trait: React.FC<{ f: number; debut: number; couleur?: string; epaisseur?: number; ecart?: number; children: React.ReactNode }> = ({
  f,
  debut,
  couleur = C.bleu500,
  epaisseur = 6,
  ecart = 6,
  children,
}) => {
  const p = anim(f, debut, debut + 10, 0, 1, EASE.expo);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {p > 0 ? (
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: -ecart - epaisseur,
            width: `${100 * p}%`,
            height: epaisseur,
            borderRadius: epaisseur,
            background: couleur,
          }}
        />
      ) : null}
    </span>
  );
};

/** Mot d'un sous-titre allumé (blanc, souligné) pendant que l'anneau qui lui
 * correspond est posé sur la capture : la capture montre le détail, souvent
 * trop petit pour un téléphone ; le mot dit ce que l'anneau désigne. */
const Mot: React.FC<{ f: number; debut: number; fin?: number; children: React.ReactNode }> = ({ f, debut, fin, children }) => {
  const on = anim(f, debut, debut + 6, 0, 1, EASE.expo) * (fin === undefined ? 1 : 1 - prog(f, fin, fin + 6, EASE.inOut));
  return (
    <span style={{ position: "relative", display: "inline-block", color: interpolateColors(on, [0, 1], [C.slate300, C.blanc]) }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          borderRadius: 4,
          background: C.bleu500,
          opacity: on,
          transform: `scaleX(${on})`,
          transformOrigin: "left",
        }}
      />
    </span>
  );
};

// ─── C1 : le logo, puis la carte du nom s'ouvre ──────────────────────────────
const LOGO = 120; // carte de fin (C9), où la place manque
// Ouverture : logo plus grand (51 px sur un téléphone au lieu de 38) ; la carte
// ouverte fait alors environ 870 px, dans la largeur utile de 920.
const LOGO_OUVERTURE = 160;
const CARTE1 = { cx: 540, cy: 480 };

const Ouverture: React.FC<{ f: number }> = ({ f }) => {
  const ouverture = anim(f, t(3.33), t(4.67), 0, 1, EASE.inOut);
  // Sortie : la carte s'efface sur place en reculant un peu (×0,94), de
  // t(6) - 6 à t(6) + 6 ; c'est la première transition de COUPES.
  // Dès l'image 0, le carré bleu est déjà là (35 %) : la première image n'est
  // pas vide.
  const apparition = prog(f, 0, 12, EASE.expo);
  const g = geometrieCarte(LOGO_OUVERTURE, 1);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35 + 0.65 * apparition,
          transform: `scale(${0.9 + 0.1 * apparition})`,
          transformOrigin: `${CARTE1.cx}px ${CARTE1.cy}px`,
        }}
      >
        <CarteNom
          cx={CARTE1.cx}
          cy={CARTE1.cy}
          logo={LOGO_OUVERTURE}
          ouverture={ouverture}
          serrage={1 - ouverture}
          opaciteNom={prog(f, t(3.8), t(4.8))}
          logoAnime={{
            trace: anim(f, 8, 38, 0, 1, EASE.inOut),
            point: anim(f, t(3), t(3) + 8, 0, 1, EASE.expo),
          }}
        />
      </div>
      {/* La pastille de l'accueil, mot pour mot, sur deux lignes équilibrées. */}
      <Revele debut={t(4)} style={{ left: M, width: LARGEUR_UTILE, top: CARTE1.cy + g.hauteur / 2 + 64, textAlign: "center" }}>
        <span style={{ ...styleSurtitre(34), whiteSpace: "normal", textWrap: "balance", display: "inline-block", lineHeight: 1.45, maxWidth: 720 }}>
          {D.pastilleAccueil}
        </span>
      </Revele>
    </AbsoluteFill>
  );
};

// ─── C2 : les questions ──────────────────────────────────────────────────────
// Trois questions de 72 px (88 dans Complete : la largeur du carré les coupe
// en deux lignes), la question en cours en blanc, les précédentes en retrait.
const QUESTIONS: React.ReactNode[] = [
  <>
    Combien peut valoir
    <br />
    votre DCA&nbsp;?
  </>,
  <>
    Quels ETF,
    <br />
    avec quels frais&nbsp;?
  </>,
  <>Comment le suivre&nbsp;?</>,
];
const TAILLE_Q = 72;
const Q_TOP = [136, 356, 576];
const Q_X = 150;
const puceQuestion = (i: number) => ({ x: M + 26, y: Q_TOP[i] + 43 });

const Questions: React.FC<{ f: number }> = ({ f }) => {
  // La courbe du logo, agrandie, traverse le bas de l'image (comme la boucle, B1).
  const pt = (x: number, y: number) => ({ x: 110 + ((x - 5) / 17) * 860, y: 1000 - ((21 - y) / 14.5) * 280 });
  const [a, b, c, d, e] = [pt(5, 21), pt(9, 21), pt(13, 15), pt(17, 9), pt(22, 6.5)];
  const trace = anim(f, t(6) + 4, t(6) + 40, 0, 1, EASE.inOut);
  return (
    <>
      <svg width={L} height={L} style={{ position: "absolute", inset: 0 }}>
        {trace > 0 ? (
          <path
            d={`M${a.x} ${a.y} Q${b.x} ${b.y} ${c.x} ${c.y} Q${d.x} ${d.y} ${e.x} ${e.y}`}
            stroke="white"
            strokeOpacity={0.9}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - trace}
          />
        ) : null}
      </svg>
      {QUESTIONS.map((q, i) => (
        // La première commence 2 images avant le temps 6, pendant le fondu
        // enchaîné de la coupe : elle est lisible sur la note du temps.
        <Revele key={i} debut={t(6 + i) - (i === 0 ? 2 : 0)} duree={10} flou={6} style={{ left: Q_X, top: Q_TOP[i] }}>
          <p style={{ ...styleTitre(TAILLE_Q), opacity: i < 2 ? anim(f, t(7 + i), t(7 + i) + 8, 1, 0.42) : 1 }}>{q}</p>
        </Revele>
      ))}
    </>
  );
};

// ─── C3 : simuler ────────────────────────────────────────────────────────────
// Mesure 4 : les trois réglages (pastilles + anneaux sur le panneau).
// Mesure 5 : le compteur et le graphique, comme la boucle (B2).
// Mesure 6 : les trois scénarios, un à la fois, dans une fenêtre qui glisse.
const PARAM = { recadrage: [24, 440, 776, 1150] as Zone, largeur: 660, y: 338 };
const Y_COMPTEUR = 232;
const Y_SOUS_C3 = 378;
const Y_MENTION_C3 = 448;
const LIGNE_MENTION = Math.round(MENTION * 1.35);
// Le graphique, recadré sur la zone utile (axes et courbes, sans le titre de la
// carte ni la légende) pour tenir dans le carré, sous la mention, de 556 à 996
// (la carte entière dépassait de 93 px en bas). Même échelle qu'avant (×0,7).
const GRAPH = { recadrage: [60, 170, 944, 800] as Zone, y: 556, hauteur: 440 };
const kGraph = GRAPH.hauteur / (GRAPH.recadrage[3] - GRAPH.recadrage[1]);
const largeurGraph = (GRAPH.recadrage[2] - GRAPH.recadrage[0]) * kGraph;
const xGraph = Math.round((L - largeurGraph) / 2);
const SCEN = { y: 548, k: 1.28, recadrage: [0, 60, 1568, 404] as Zone };
const FIN_C3 = t(17.5);
const M5 = t(16);
// Un demi-temps plus tard que la mesure, comme Complete : laisse lire
// « 200 €/mois · 20 ans · 48 000 € versés » sous la valeur arrivée.
const M6 = t(20.5);
const balayageC3 = (f: number) => prog(f, M5 + 2, FIN_C3, Easing.bezier(0.45, 0, 0.2, 1));
function pointeC3(f: number) {
  const g = Z.graphique;
  // Le balayage s'arrête sur « 20 ans » (x20ans), pas au bout de la zone de
  // tracé : le compteur arrive ainsi sur 97 753 € à FIN_C3, sur la cloche du
  // temps 17,5, et non 5 images avant (il atteignait x20ans à 96 % du balayage).
  const xBord = g.trace[0] + (g.x20ans - g.trace[0]) * balayageC3(f);
  const p = pointe(xBord);
  const [x1, y1] = GRAPH.recadrage;
  return { xBord, compteur: p.compteur, ecran: { x: xGraph + (p.x - x1) * kGraph, y: GRAPH.y + (p.y - y1) * kGraph } };
}
/** Bord gauche de la fenêtre des scénarios (pixels du PNG) : toujours centrée
 * sur la carte allumée, même aux extrémités (au-delà de la capture, le fond
 * blanc de la fenêtre). Ainsi les voisines ne dépassent que de la même
 * largeur des deux côtés, et le fondu des bords les couvre toujours. */
function bordScenarios(f: number) {
  const visible = LARGEUR_UTILE / SCEN.k;
  const bord = (cle: "conservateur" | "base" | "optimiste") => {
    const [x1, , x2] = Z.scenarios[cle];
    return (x1 + x2) / 2 - visible / 2;
  };
  const b1 = anim(f, t(21.5) - 8, t(21.5), bord("conservateur"), bord("base"), EASE.inOut);
  return anim(f, t(22.5) - 8, t(22.5), b1, bord("optimiste"), EASE.inOut);
}

const Simuler: React.FC<{ f: number }> = ({ f }) => {
  const d = t(12) + APRES_COUPE;
  const entreeParam = prog(f, d, d + 20, EASE.expo);
  const sortieParam = prog(f, M5 - 2, M5 + 8, EASE.inOut);
  const bout = pointeC3(f);
  const valeur = f >= FIN_C3 ? S.valeurFinale : bout.compteur;
  // Le graphique est parti quand la fenêtre des scénarios arrive (M6 - 4) :
  // leurs chiffres ne se superposent plus.
  const sortieGraph = prog(f, M6 - 12, M6 - 4, EASE.inOut);
  // Chaque pastille arrive sur le « ping » de la musique (demi-temps 13,5,
  // 14,5, 15,5), l'anneau restant sur le temps (grosse caisse et clap).
  const parametres = [
    { debut: t(13), texte: A.versementMensuel, zone: Z.parametres.versement },
    { debut: t(14), texte: `${S.dureeAns} ans`, zone: Z.parametres.duree },
    { debut: t(15), texte: `${HYPOTHESE_AFFICHEE} %/an avant frais`, zone: Z.parametres.rendement },
  ];
  const hScen = (SCEN.recadrage[3] - SCEN.recadrage[1]) * SCEN.k;
  return (
    <>
      <EnTete debut={t(12)} surtitre="Simulateur · gratuit, sans inscription" titre="Simulez votre DCA" />
      {/* Mesure 4 : chaque réglage en grand, au temps où son anneau se pose. */}
      <div style={{ position: "absolute", left: M, top: ySousTitre(1) + 6, display: "flex", gap: 14 }}>
        {parametres.map((p) => {
          const o = prog(f, p.debut + 7, p.debut + 15) * (1 - prog(f, M5 - 2, M5 + 4));
          return o > 0 ? (
            <div key={p.texte} style={{ opacity: o, transform: `translateY(${(1 - prog(f, p.debut + 7, p.debut + 19)) * 16}px)` }}>
              <Pastille taille={34}>{p.texte}</Pastille>
            </div>
          ) : null;
        })}
      </div>
      {f < M5 + 8 ? (
        <Capture
          {...CAPTURES.parametres}
          recadrage={PARAM.recadrage}
          largeur={PARAM.largeur}
          rayonPng={20}
          style={{
            ...profondeur(20 * (PARAM.largeur / (PARAM.recadrage[2] - PARAM.recadrage[0]))),
            left: (L - PARAM.largeur) / 2,
            top: PARAM.y,
            opacity: prog(f, d, d + 8) * (1 - sortieParam),
            transform: `translateY(${(1 - entreeParam) * 90 + sortieParam * 60}px)`,
          }}
        >
          {(z) =>
            parametres.map((p, i) => (
              <Anneau key={i} rect={z(p.zone)} debut={p.debut} fin={p.debut + 12} couleur={C.bleu} epaisseur={4} marge={6} rayon={14} />
            ))
          }
        </Capture>
      ) : null}
      {/* Mesure 5 : le compteur suit la pointe de la courbe et finit sur la
          valeur du site. Il attend que la 3e pastille (même hauteur) soit partie. */}
      <Revele debut={M5 + 2} duree={8} montee={16} style={{ left: M - 4, top: Y_COMPTEUR }}>
        <Compteur valeur={valeur} taille={132} />
      </Revele>
      {/* N'apparaît qu'une fois le compteur arrivé : à côté d'une valeur
          intermédiaire, « 20 ans » serait faux. Montée courte : elle ne passe
          pas sur la mention. */}
      <Revele debut={FIN_C3} duree={10} montee={8} sortie={M6 - 6} dureeSortie={8} style={{ left: M, top: Y_SOUS_C3 }}>
        <p style={{ ...styleSousTitre(SOUS_TITRE), margin: 0, whiteSpace: "nowrap" }}>
          {A.versementMensuel} · {S.dureeAns}&nbsp;ans · {A.capitalVerse} versés
        </p>
      </Revele>
      <Revele debut={M6} montee={8} style={{ left: M, top: Y_SOUS_C3 }}>
        <p style={{ ...styleSousTitre(SOUS_TITRE), margin: 0, whiteSpace: "nowrap" }}>
          3 scénarios&nbsp;: {S.tauxScenarios[0]}, {S.tauxScenarios[1]} et {S.tauxScenarios[2]}&nbsp;%/an avant frais
        </p>
      </Revele>
      {/* Mention, ligne 1 : au singulier tant qu'un seul scénario est montré,
          au pluriel quand les trois défilent. */}
      <Revele debut={M5 + 8} sortie={M6 - 6} dureeSortie={8} style={{ left: M, top: Y_MENTION_C3, width: LARGEUR_UTILE }}>
        <p style={{ ...styleMention(MENTION), margin: 0, whiteSpace: "nowrap" }}>
          Hypothèse de {HYPOTHESE_AFFICHEE}&nbsp;%/an avant frais, pas une prévision.
        </p>
      </Revele>
      <Revele debut={M6} style={{ left: M, top: Y_MENTION_C3, width: LARGEUR_UTILE }}>
        <p style={{ ...styleMention(MENTION), margin: 0, whiteSpace: "nowrap" }}>Hypothèses avant frais, pas des prévisions.</p>
      </Revele>
      {/* Ligne 2 : le versement et la durée restent sous 97 753 € jusqu'à la
          fin du plan, même quand le sous-titre passe aux scénarios. */}
      <Revele debut={M5 + 8} style={{ left: M, top: Y_MENTION_C3 + LIGNE_MENTION, width: LARGEUR_UTILE }}>
        <p style={{ ...styleMention(MENTION), margin: 0, whiteSpace: "nowrap" }}>
          {A.versementMensuel} sur {S.dureeAns}&nbsp;ans, frais de l&apos;ETF ({S.fraisDefaut}) déduits.
        </p>
      </Revele>
      {f >= M5 - 2 && sortieGraph < 1 ? (
        <Capture
          {...CAPTURES.graphique}
          recadrage={GRAPH.recadrage}
          largeur={largeurGraph}
          rayonPng={28}
          style={{
            ...profondeur(28 * kGraph),
            left: xGraph,
            top: GRAPH.y,
            opacity: prog(f, M5 + 4, M5 + 12) * (1 - sortieGraph),
            transform: `translateY(${(1 - prog(f, M5 + 2, M5 + 22, EASE.expo)) * 120 + 80 * sortieGraph}px)`,
          }}
        >
          {(z) => {
            // Cache blanc sur la partie pas encore tracée (le fond de la carte est blanc).
            const [, y1, x2, y2] = Z.graphique.trace;
            return f < FIN_C3 ? <div style={{ position: "absolute", ...z([bout.xBord, y1, x2, y2]), background: C.blanc }} /> : null;
          }}
        </Capture>
      ) : null}
      {/* Mesure 6 : une carte de scénario à la fois, assez grande pour que son
          capital final se lise sur un téléphone. Elle entre opaque (pas de
          fondu sur le graphique) ; ses bords se fondent dans le blanc, pour
          que les cartes voisines ne montrent pas de chiffres tronqués. */}
      {f >= M6 - 4 ? (
        <Fenetre
          capture={CAPTURES.scenarios}
          recadrage={SCEN.recadrage}
          k={SCEN.k}
          dx={bordScenarios(f)}
          dy={SCEN.recadrage[1]}
          largeur={LARGEUR_UTILE}
          hauteur={hScen}
          fondus={{ gauche: 1, droite: 1 }}
          largeurFondu={170}
          style={{
            left: M,
            top: SCEN.y,
            opacity: prog(f, M6 - 4, M6 - 1),
            transform: `translateY(${(1 - prog(f, M6 - 4, M6 + 14, EASE.expo)) * 60}px)`,
          }}
        >
          {(z) =>
            [Z.scenarios.conservateur, Z.scenarios.base, Z.scenarios.optimiste].map((zone, i) => (
              <Anneau key={i} rect={z(zone)} debut={t(20.5 + i)} fin={i < 2 ? t(21.5 + i) - 6 : undefined} couleur={C.bleu} epaisseur={5} marge={-2} rayon={22} />
            ))
          }
        </Fenetre>
      ) : null}
    </>
  );
};

// ─── C4 : comparer ───────────────────────────────────────────────────────────
// Temps 24 à 27 : l'interrupteur « PEA uniquement » bascule (vraie capture des
// deux états), la pastille dit ce qu'il reste ; elle reste jusqu'à la fin du
// plan, puisque C5 la reprend (« Dont les 8 »). Temps 27 à 32 : les cartes de
// la boucle (B3), une en grand, et ses trois anneaux.
// L'interrupteur à ×1,95 (≈ 1 pixel de PNG pour 1 pixel CSS du site : net),
// au milieu de la place libre sous la pastille.
const INTERRUPTEUR = { recadrage: [1514, 8, 1860, 94] as Zone, largeur: 672, marge: 24, y: 540 };
const Y_PASTILLE_C4 = ySousTitre(1) + 60;
// Carte d'ETF en deux morceaux : l'en-tête (nom, fonds, indice, badge PEA),
// puis les caractéristiques (TER, réplication, ISIN). Le bloc du cours entre
// les deux est retiré : un cours du 02/10/2026 avec « Mis à jour il y a 4 h »
// serait faux toute la vie de la vidéo, et il ne sert pas le plan.
const CARTE_HAUT = [0, 0, 778, 340] as const;
const CARTE_BAS = [0, 478, 778, 664] as const;
const H_CARTE_PNG = CARTE_HAUT[3] - CARTE_HAUT[1] + (CARTE_BAS[3] - CARTE_BAS[1]);
const CARTES = [
  { cle: "carteCw8", x: 320, y: 368, largeur: 640, entree: t(27) },
  { cle: "carteDcam", x: 220, y: 376, largeur: 680, entree: t(27) + 6 },
  { cle: "carteWpea", x: M, y: 384, largeur: 740, entree: t(27) + 12 },
] as const;
// Anneaux sur la carte WPEA, et le mot du sous-titre allumé avec chacun. Le
// badge PEA prend la cloche la plus haute (Mi5, temps 29) : c'est le sujet du
// site.
const ANNEAUX_C4 = { ter: t(28), pea: t(29), replication: t(30) };

/** Carte d'ETF (capture du comparateur) sans son bloc de cours ; `enfants`
 * reçoit la conversion des zones du PNG en position dans la carte. */
const CarteEtf: React.FC<{
  fichier: string;
  largeur: number;
  halo: boolean;
  style: React.CSSProperties;
  enfants?: (z: (zone: Zone) => Rect) => React.ReactNode;
}> = ({ fichier, largeur, halo, style, enfants }) => {
  const k = largeur / 778;
  const hHaut = (CARTE_HAUT[3] - CARTE_HAUT[1]) * k;
  const z = (zone: Zone): Rect => {
    const bas = zone[1] >= CARTE_BAS[1];
    return {
      left: zone[0] * k,
      top: bas ? hHaut + (zone[1] - CARTE_BAS[1]) * k : zone[1] * k,
      width: (zone[2] - zone[0]) * k,
      height: (zone[3] - zone[1]) * k,
    };
  };
  const morceau = (r: readonly [number, number, number, number], top: number) => (
    <div style={{ position: "absolute", left: 0, top, width: largeur, height: (r[3] - r[1]) * k, overflow: "hidden" }}>
      <Img
        src={staticFile(`captures/${fichier}`)}
        style={{ position: "absolute", left: 0, top: -r[1] * k, width: 778 * k, height: 1126 * k, maxWidth: "none" }}
      />
    </div>
  );
  return (
    <div style={{ position: "absolute", width: largeur, height: H_CARTE_PNG * k, ...style }}>
      {halo ? <Halo rayon={32 * k} /> : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 32 * k,
          overflow: "hidden",
          background: C.blanc,
          border: "1px solid rgba(226,232,240,0.6)",
          boxShadow: `${OMBRE_CARTE}, ${OMBRE_PROFONDE}`,
        }}
      >
        {morceau(CARTE_HAUT, 0)}
        {morceau(CARTE_BAS, hHaut)}
      </div>
      {enfants ? <div style={{ position: "absolute", inset: 0 }}>{enfants(z)}</div> : null}
    </div>
  );
};

const Comparer: React.FC<{ f: number }> = ({ f }) => {
  // Le filtre entre avec la cymbale du temps 24, pendant le glissement de la
  // coupe, comme les captures des autres plans (APRES_COUPE).
  const entree = prog(f, t(24) + APRES_COUPE, t(25) + APRES_COUPE, EASE.expo);
  // L'interrupteur est parti quand la première carte arrive (t(27)).
  const sortieFiltre = prog(f, t(27) - 8, t(27), EASE.inOut);
  // Bascule franche, comme sur le site : un fondu superposerait les deux états.
  const cle = f >= t(26) ? "filtresPea" : "filtres";
  return (
    <>
      <EnTete
        debut={t(24)}
        surtitre="Comparateur"
        titre={`Comparez ${D.comparateur.nbEtf} ETF`}
        sousTitre={
          <>
            <Mot f={f} debut={ANNEAUX_C4.ter} fin={ANNEAUX_C4.pea}>
              Frais
            </Mot>
            , <Mot f={f} debut={ANNEAUX_C4.replication}>réplication</Mot>, ISIN,{" "}
            <Mot f={f} debut={ANNEAUX_C4.pea} fin={ANNEAUX_C4.replication}>
              éligibilité PEA
            </Mot>
          </>
        }
      />
      {sortieFiltre < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - sortieFiltre, transform: `translateY(${-40 * sortieFiltre}px)` }}>
          <Capture
            {...CAPTURES[cle]}
            recadrage={INTERRUPTEUR.recadrage}
            largeur={INTERRUPTEUR.largeur}
            marge={INTERRUPTEUR.marge}
            fondCarte="#f8fafc"
            rayonPng={0}
            style={{ left: M, top: INTERRUPTEUR.y, opacity: entree, transform: `translateY(${(1 - entree) * 50}px)` }}
          >
            {(z) => <Anneau rect={z(Z.filtres.interrupteur)} debut={t(26)} couleur={C.bleu} epaisseur={5} marge={10} rayon={56} />}
          </Capture>
        </AbsoluteFill>
      ) : null}
      {CARTES.map((c) => {
        const e = prog(f, c.entree, c.entree + 22, EASE.expo);
        const devant = c.cle === "carteWpea";
        return e > 0 ? (
          <CarteEtf
            key={c.cle}
            fichier={CAPTURES[c.cle].fichier}
            largeur={c.largeur}
            halo={devant}
            // Opaque en 2 images : on ne lit jamais une carte à travers une autre.
            // Elles se posent en se redressant (10° → 0, perspective de 1 400 px,
            // pivot en bas) : la pile prend de la profondeur sans rien déformer
            // une fois posée.
            style={{
              left: c.x,
              top: c.y,
              opacity: prog(f, c.entree, c.entree + 2),
              transform: `perspective(1400px) translateY(${(1 - e) * 60}px) rotateX(${(1 - e) * 10}deg)`,
              transformOrigin: "50% 100%",
            }}
            enfants={
              devant
                ? (z) => (
                    <>
                      <Anneau rect={z(Z.carteEtf.ter)} debut={ANNEAUX_C4.ter} repos={0.55} couleur={C.bleu} epaisseur={4} marge={8} rayon={12} />
                      <Anneau rect={z(Z.carteEtf.badgePea)} debut={ANNEAUX_C4.pea} repos={0.55} couleur={C.bleu} epaisseur={4} marge={7} rayon={16} />
                      <Anneau rect={z(Z.carteEtf.replication)} debut={ANNEAUX_C4.replication} couleur={C.bleu} epaisseur={4} marge={8} rayon={12} />
                    </>
                  )
                : undefined
            }
          />
        ) : null;
      })}
      {/* Au-dessus des cartes, et jusqu'à la fin du plan. */}
      <Revele debut={t(26) + 2} style={{ left: M, top: Y_PASTILLE_C4 }}>
        <Pastille taille={34}>
          Filtre «&nbsp;PEA uniquement&nbsp;»&nbsp;: {D.comparateur.nbEtfFiltrePea}&nbsp;ETF
        </Pastille>
      </Revele>
    </>
  );
};

// ─── C5 : la liste PEA vérifiée ──────────────────────────────────────────────
// Le tableau (colonnes Fonds, ISIN, Frais) à la taille de lecture ; son
// en-tête reste fixe et les lignes défilent pour suivre la bande ISIN.
// Hauteur du corps : exactement les deux premières lignes (229 → 611), pour
// qu'aucune ligne ne soit coupée en bas ; les défilements s'arrêtent eux aussi
// sur le bas d'une ligne.
const TABLE = { x1: 24, x2: 960, yEntete: 139, yCorps: 229, yFin: 1072, y: 496, hCorps: (611 - 229) * (920 / 936) };
const kTable = LARGEUR_UTILE / (TABLE.x2 - TABLE.x1);
/** Haut de la partie visible du corps du tableau (pixels du PNG). */
function hautTable(f: number) {
  const visible = TABLE.hCorps / kTable;
  const [, , [, fin3], [, fin4]] = Z.listePea.lignes;
  const a = anim(f, t(36) - 8, t(36), TABLE.yCorps, fin3 - visible, EASE.inOut);
  return anim(f, t(37) - 8, t(37), a, fin4 - visible, EASE.inOut);
}

const ListePea: React.FC<{ f: number }> = ({ f }) => {
  const d = t(32) + APRES_COUPE;
  const e = prog(f, d, d + 15, EASE.expo);
  const hEntete = (TABLE.yCorps - TABLE.yEntete) * kTable;
  const haut = hautTable(f);
  return (
    <>
      <EnTete
        debut={t(32)}
        surtitre={`Liste vérifiée le ${D.listePea.dateVerif}`}
        titre={
          <>
            {D.listePea.nbEtf}&nbsp;ETF éligibles
            <br />
            au PEA
          </>
        }
        lignes={2}
        sousTitre="Vérifiés un par un, ISIN et frais"
      />
      {/* Le plan d'avant montre « 8 ETF » (filtre du comparateur) : sans ce
          lien, 8 puis 13 donneraient l'impression que le site se contredit.
          Les 13 sont les 8 du catalogue plus 5 fonds hors catalogue
          (src/lib/etf-pea-verifies.ts du site, ETF_PEA_VERIFIES). */}
      <Revele debut={t(33)} style={{ left: M, top: ySousTitre(2) + 72 }}>
        <Pastille taille={34}>
          Dont les {D.comparateur.nbEtfFiltrePea} du filtre «&nbsp;PEA uniquement&nbsp;»
        </Pastille>
      </Revele>
      <div
        style={{
          position: "absolute",
          left: M,
          top: TABLE.y,
          width: LARGEUR_UTILE,
          height: hEntete + TABLE.hCorps,
          opacity: prog(f, d, d + 8),
          transform: `translateY(${(1 - e) * 80}px)`,
        }}
      >
        <Halo rayon={20} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 20, overflow: "hidden", background: C.blanc, boxShadow: `${OMBRE_CARTE}, ${OMBRE_PROFONDE}` }}>
          {/* Corps : défile sous l'en-tête. */}
          <div style={{ position: "absolute", left: 0, top: hEntete, width: LARGEUR_UTILE, height: TABLE.hCorps, overflow: "hidden" }}>
            <Capture
              {...CAPTURES.listePea}
              recadrage={[TABLE.x1, TABLE.yCorps, TABLE.x2, TABLE.yFin]}
              largeur={LARGEUR_UTILE}
              rayonPng={0}
              halo={false}
              style={{ left: 0, top: -(haut - TABLE.yCorps) * kTable }}
            >
              {(z) =>
                Z.listePea.lignes.map(([y1, y2], i) => (
                  <Bande
                    key={i}
                    rect={z([Z.listePea.isin[0], y1 + 10, Z.listePea.isin[2], y2 - 10])}
                    debut={t(34 + i)}
                    // Les bandes 2 et 3 s'éteignent PENDANT le défilement qui
                    // les remonte (t(n) - 8 à t(n)) : sur les tics 36 et 37, une
                    // seule bande, la nouvelle, et jamais une case vide surlignée.
                    fin={i === 0 ? t(35) - 2 : i < 3 ? t(35 + i) - 8 : undefined}
                  />
                ))
              }
            </Capture>
          </div>
          {/* En-tête du tableau (Fonds, ISIN, Frais), fixe. */}
          <Capture
            {...CAPTURES.listePea}
            recadrage={[TABLE.x1, TABLE.yEntete, TABLE.x2, TABLE.yCorps]}
            largeur={LARGEUR_UTILE}
            rayonPng={0}
            halo={false}
            style={{ left: 0, top: 0, boxShadow: "0 1px 0 rgba(226,232,240,1)" }}
          />
        </div>
      </div>
    </>
  );
};

// ─── C6 : PEA ou CTO ─────────────────────────────────────────────────────────
// Les deux taux en grand, en typographie native (le paragraphe du calculateur,
// vu de près, était coupé au milieu des mots, et ses chiffres faisaient 10 px
// sur un téléphone). Libellés : les mots en gras du paragraphe ; taux :
// donnees.json. Le paragraphe entier arrive ensuite en bas, en petit, comme
// preuve (la capture du calculateur fiscal), sans être fait pour être lu sur
// un téléphone.
const TAUX = {
  blocs: [
    { yLibelle: 316, libelle: "PEA de plus de 5 ans", taux: D.fiscal.tauxPea, detail: "prélèvements sociaux", couleur: C.blanc },
    { yLibelle: 540, libelle: "Compte-titres (CTO)", taux: D.fiscal.tauxCto, detail: "prélèvement forfaitaire unique (PFU)", couleur: C.slate300 },
  ],
  taille: 140,
  preuve: { recadrage: Z.taux.recadrage as Zone, largeur: LARGEUR_UTILE - 40, marge: 20, y: 772 },
};

const PeaCto: React.FC<{ f: number }> = ({ f }) => {
  const d = t(38) + APRES_COUPE;
  // Le PEA d'abord, souligné sur le clic du temps 39 ; le CTO ensuite,
  // souligné sur celui du temps 40. Le libellé du PEA suit le sous-titre
  // d'une image (d + 6) : l'en-tête se lit de haut en bas, sans qu'une ligne
  // du bas apparaisse avant celle du dessus.
  const debuts = [d + 6, t(39) + 4];
  const soulignes = [t(39), t(40)];
  const p = TAUX.preuve;
  const ePreuve = prog(f, t(40) + 4, t(41) + 4, EASE.expo);
  return (
    <>
      <EnTete debut={t(38)} titre={"PEA ou CTO ?"} sousTitre={"Le calculateur fiscal compare l'impôt"} />
      {TAUX.blocs.map((b, i) => (
        <React.Fragment key={b.libelle}>
          <Revele debut={debuts[i]} style={{ left: M, top: b.yLibelle }}>
            <p style={{ ...styleSousTitre(SOUS_TITRE), margin: 0, whiteSpace: "nowrap" }}>{b.libelle}</p>
          </Revele>
          <Revele debut={debuts[i] + 3} montee={20} style={{ left: M, top: b.yLibelle + 56, width: LARGEUR_UTILE }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 36 }}>
              <Trait f={f} debut={soulignes[i]} epaisseur={8} ecart={4}>
                <span
                  style={{
                    fontFamily: INTER,
                    fontWeight: 700,
                    fontSize: TAUX.taille,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: b.couleur,
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {b.taux}
                </span>
              </Trait>
              <p style={{ ...styleMention(MENTION), margin: 0, paddingBottom: 10, maxWidth: 380 }}>{b.detail}</p>
            </div>
          </Revele>
        </React.Fragment>
      ))}
      <Capture
        {...CAPTURES.taux}
        recadrage={p.recadrage}
        largeur={p.largeur}
        marge={p.marge}
        rayonPng={0}
        halo={false}
        style={{ ...profondeur(p.marge * 0.6), left: M, top: p.y, opacity: prog(f, t(40) + 4, t(40) + 12), transform: `translateY(${(1 - ePreuve) * 40}px)` }}
      />
    </>
  );
};

// ─── C7 : suivre dans un tableur ─────────────────────────────────────────────
// Temps 42 à 46 : le modèle gratuit (onglet Transactions, commun au modèle et
// au Cockpit). Temps 46 à 50 : la fenêtre « Versement du mois » du Cockpit,
// payant, comme dans la boucle (B4). Même structure pour les deux : pastille
// (quel produit), sous-titre (ce qu'il fait), capture.
//
// La fenêtre du Cockpit est trop large pour se lire en entier dans le carré
// (300,00 € y ferait 6 px sur un téléphone). On la voit de près (×0,9), en
// deux temps : d'abord « Montant à verser ce mois-ci : 300,00 € » avec les
// ETF, puis un panoramique qui se resserre (×0,9 → ×1,45) sur les trois
// colonnes « Manque à la cible », « Montant suggéré » et « ≈ Parts à
// acheter ». Il part sur le clap du temps 47 et finit sur la cloche du temps
// 47,5, où l'anneau se pose sur la colonne des parts (« 14 »). Ses bords
// d'arrivée tombent entre deux colonnes : aucun montant tronqué.
const Y_PASTILLE_C7 = ySousTitre(1) + 4;
const Y_SOUS_C7 = Y_PASTILLE_C7 + 78;
const Y_CAPTURE_C7 = 404;
// Cinq lignes entières du journal (la 6e, coupée par le bas, est retirée).
const TRANS = { recadrage: [44, 40, 1064, 555] as Zone };
const kTrans = LARGEUR_UTILE / (TRANS.recadrage[2] - TRANS.recadrage[0]);
const VERS = {
  recadrage: [0, 290, CAPTURES.versement.l, 805] as Zone,
  k: 0.9,
  // Arrivée du panoramique : x de 1180 à 1815 (entre « Cible après
  // versement » et « Montant arrondi »), du haut du tableau à sa fin.
  arrivee: { x: 1180, y: 505, k: LARGEUR_UTILE / (1815 - 1180) },
};
/** Avancement du panoramique (0 → 1). */
const panVers = (f: number) => anim(f, t(47), t(47.5), 0, 1, EASE.inOut);

const Tableur: React.FC<{ f: number }> = ({ f }) => {
  const d = t(42) + APRES_COUPE;
  const eTr = prog(f, d, d + 20, EASE.expo);
  // La capture Transactions part avant que la fenêtre n'arrive : pas de superposition.
  const sortieTr = prog(f, t(46) - 6, t(46) + 2, EASE.inOut);
  const eFen = prog(f, t(46), t(46) + 14, EASE.expo);
  const hVers = (VERS.recadrage[3] - VERS.recadrage[1]) * VERS.k;
  const pan = panVers(f);
  const kVers = VERS.k + (VERS.arrivee.k - VERS.k) * pan;
  const [tx1, ty1, , ty2] = TRANS.recadrage;
  return (
    <>
      <EnTete debut={t(42)} surtitre="Excel et Google Sheets" titre="Suivez votre PEA" />
      <Revele debut={d + 4} sortie={t(46) - 6} dureeSortie={8} style={{ left: M, top: Y_PASTILLE_C7 }}>
        <Pastille taille={34}>Modèle gratuit</Pastille>
      </Revele>
      <Revele debut={d + 8} sortie={t(46) - 6} dureeSortie={8} style={{ left: M, top: Y_SOUS_C7 }}>
        <p style={{ ...styleSousTitre(SOUS_TITRE), margin: 0 }}>Journal des achats et vue par ETF</p>
      </Revele>
      <Revele debut={t(46) + 4} style={{ left: M, top: Y_PASTILLE_C7 }}>
        <Pastille taille={34}>
          Cockpit DCA · {A.cockpitPrix}, paiement unique
        </Pastille>
      </Revele>
      <Revele debut={t(46) + 8} style={{ left: M, top: Y_SOUS_C7 }}>
        <p style={{ ...styleSousTitre(SOUS_TITRE), margin: 0 }}>Le versement du mois, en parts entières</p>
      </Revele>
      {sortieTr < 1 ? (
        <Fenetre
          capture={CAPTURES.transactions}
          recadrage={TRANS.recadrage}
          k={kTrans}
          dx={tx1}
          dy={ty1}
          largeur={LARGEUR_UTILE}
          hauteur={(ty2 - ty1) * kTrans}
          fondus={{ droite: 1 }}
          style={{
            left: M,
            top: Y_CAPTURE_C7,
            opacity: prog(f, d, d + 8) * (1 - sortieTr),
            transform: `translateY(${(1 - eTr) * 90 - 100 * sortieTr}px)`,
          }}
        />
      ) : null}
      {f >= t(46) ? (
        <Fenetre
          capture={CAPTURES.versement}
          recadrage={VERS.recadrage}
          k={kVers}
          dx={VERS.arrivee.x * pan}
          dy={VERS.recadrage[1] + (VERS.arrivee.y - VERS.recadrage[1]) * pan}
          largeur={LARGEUR_UTILE}
          hauteur={hVers}
          // À droite, la colonne coupée au départ se fond ; à l'arrivée, les
          // deux bords tombent entre deux colonnes et ne se fondent plus.
          fondus={{ gauche: 4 * pan * (1 - pan), droite: 1 - pan }}
          largeurFondu={160}
          style={{ left: M, top: Y_CAPTURE_C7, opacity: prog(f, t(46), t(46) + 6), transform: `translateX(${(1 - eFen) * 360}px)` }}
        >
          {(z) => (
            <>
              <Anneau rect={z(Z.versement.montant)} debut={t(46) + 5} fin={t(47)} couleur={C.bleu} epaisseur={4} marge={2} rayon={10} />
              {/* À sa taille finale, sur la cloche du temps 47,5 : un bord qui
                  balaie la colonne se lisait « 1 1 ». */}
              <Anneau rect={z(Z.versement.colonneParts)} debut={t(47.5)} couleur={C.bleu} epaisseur={4} marge={4} rayon={12} />
            </>
          )}
        </Fenetre>
      ) : null}
      <Revele debut={t(47)} style={{ left: M, top: Y_CAPTURE_C7 + hVers + 26, width: LARGEUR_UTILE }}>
        <p style={{ ...styleMention(MENTION), margin: 0 }}>Calcul sur l&apos;allocation que vous fixez, pas un conseil</p>
      </Revele>
      {/* Les montants des deux captures sont un jeu de démonstration. */}
      {/* Avec la capture, avant qu'on en lise les montants. */}
      <Revele debut={d} style={{ left: M, top: 950 }}>
        <p style={{ ...styleMention(MENTION), margin: 0 }}>Exemple pré-rempli</p>
      </Revele>
    </>
  );
};

// ─── C8 : Premium ────────────────────────────────────────────────────────────
// La liste des fonctions Premium de /tarifs porte le sous-titre de Complete
// (Monte Carlo, backtest depuis 2008, récap fiscal) : ses lignes s'allument
// une à une ; le prix arrive au temps 52, avec les conditions de l'essai
// (/tarifs : « annulable à tout moment » ; FAQ de /tarifs : « un moyen de
// paiement est requis »).
// Carte de 880 px (texte de la liste vers 11 px sur un téléphone, comme les
// mentions) : un peu moins que les 920 des autres plans, pour laisser la place
// au prix et aux conditions au-dessus de la marge du bas.
const PREMIUM = { recadrage: [16, 18, 704, 412] as Zone, largeur: 840, marge: 20, y: 326 };

const Premium: React.FC<{ f: number }> = ({ f }) => {
  const d = t(50) + APRES_COUPE;
  const e = prog(f, d, d + 18, EASE.expo);
  const k = PREMIUM.largeur / (PREMIUM.recadrage[2] - PREMIUM.recadrage[0]);
  const bas = PREMIUM.y + (PREMIUM.recadrage[3] - PREMIUM.recadrage[1]) * k + 2 * PREMIUM.marge;
  return (
    // Coupe franche sur l'impact du temps 56 (le coup le plus fort du
    // morceau) : le plan reste plein jusqu'à sa dernière image, sans aucune
    // image vide avant la fin.
    <>
      <EnTete
        debut={t(50)}
        surtitre={`Premium · ${D.premium.essaiJours} jours d'essai gratuit`}
        titre={
          <>
            Le suivi mensuel,
            <br />
            en ligne
          </>
        }
        lignes={2}
      />
      <Capture
        {...CAPTURES.premium}
        recadrage={PREMIUM.recadrage}
        largeur={PREMIUM.largeur}
        marge={PREMIUM.marge}
        fondCarte={C.fond}
        bordure="1px solid rgba(255,255,255,0.10)"
        rayonPng={0}
        style={{ ...profondeur(PREMIUM.marge * 0.6), left: M, top: PREMIUM.y, opacity: prog(f, d, d + 8), transform: `translateY(${(1 - e) * 80}px)` }}
      >
        {(z) =>
          Z.premium.lignes.map((zone, i) => (
            // Une ligne allumée à la fois ; la dernière reste jusqu'à la fin du plan.
            <Bande
              key={i}
              rect={z(zone)}
              debut={t(51 + i)}
              fin={i < Z.premium.lignes.length - 1 ? t(52 + i) - 4 : undefined}
              couleur="rgba(59,130,246,0.16)"
              bord="rgba(96,165,250,0.45)"
              marge={4}
              rayon={14}
            />
          ))
        }
      </Capture>
      {/* Un reflet balaie la carte une fois, pendant qu'elle se pose, et sort
          de la carte quand la première ligne s'allume (temps 51) : le seul de
          la vidéo. */}
      <Reflet
        f={f}
        debut={d + 4}
        duree={14}
        rayon={PREMIUM.marge * 0.6}
        style={{ left: M, top: PREMIUM.y + (1 - e) * 80, width: PREMIUM.largeur + 2 * PREMIUM.marge, height: bas - PREMIUM.y }}
      />
      <Revele debut={t(52)} style={{ left: M, top: bas + 18 }}>
        <p style={{ ...styleSousTitre(56), lineHeight: 1.15, color: C.blanc, fontWeight: 700, margin: 0, whiteSpace: "nowrap" }}>
          {A.premiumMensuel} <span style={{ color: C.slate400, fontWeight: 500 }}>ou</span> {A.premiumAnnuel}
        </p>
      </Revele>
      <Revele debut={t(52) + 6} style={{ left: M, top: bas + 18 + 76 }}>
        <p style={{ ...styleMention(MENTION), margin: 0, whiteSpace: "nowrap" }}>Annulable à tout moment, moyen de paiement requis</p>
      </Revele>
    </>
  );
};

// ─── C9 : fin (comme la fin de la boucle, B5) ────────────────────────────────
// La carte du nom tombe sur l'impact du temps 56, en coupe franche (l'à-coup
// vient de son échelle, 0,96 → 1). L'adresse est l'appel à l'action : en
// blanc, soulignée du bleu du logo. Dessous, l'avertissement du pied de page
// du site (Footer.tsx), que la vidéo, partageable seule, doit porter.
const Fin: React.FC<{ f: number }> = ({ f }) => {
  if (f < P.c9[0]) return null;
  const e = prog(f, t(56), t(56) + 8, EASE.expo);
  const mots = ["Simulez.", "Comparez.", "Suivez."];
  return (
    <AbsoluteFill>
      {mots.map((m, i) => (
        <Revele key={m} debut={t(56) + 4 + 4 * i} flou={6} style={{ left: 0, width: L, top: 128 + 96 * i, textAlign: "center" }}>
          <p style={styleTitre(TITRE)}>{m}</p>
        </Revele>
      ))}
      <CarteNom cx={540} cy={566} logo={LOGO} echelle={0.96 + 0.04 * e} />
      <Revele debut={t(56) + 14} style={{ left: 0, width: L, top: 704, textAlign: "center" }}>
        <p style={{ ...styleSousTitre(SOUS_TITRE), margin: 0 }}>Simulateur gratuit, sans inscription</p>
      </Revele>
      <Revele debut={t(56) + 16} style={{ left: 0, width: L, top: 772, textAlign: "center" }}>
        <p style={{ ...styleSousTitre(SOUS_TITRE), color: C.blanc, fontWeight: 600, margin: 0 }}>
          <Trait f={f} debut={t(57) + 4} couleur={C.bleu} epaisseur={6} ecart={2}>
            dcatracker.fr
          </Trait>
        </p>
      </Revele>
      <Revele debut={t(56) + 20} style={{ left: 0, width: L, top: 878, textAlign: "center" }}>
        <p style={{ ...styleMention(MENTION), margin: 0 }}>
          Pas un conseil en investissement.
          <br />
          Investir comporte un risque de perte en capital.
        </p>
      </Revele>
    </AbsoluteFill>
  );
};

// ─── Marqueur (le point blanc du logo) ───────────────────────────────────────
const POSES: Pose[] = [
  // C2 : devant la question en cours.
  { de: t(6) + 2, a: t(6) + 2, pos: () => puceQuestion(0), o: 0 },
  { de: t(6) + 8, a: t(6) + 12, pos: () => puceQuestion(0) },
  { de: t(7) + 2, a: t(7) + 12, pos: () => puceQuestion(1) },
  { de: t(8) + 2, a: t(11) + 1, pos: () => puceQuestion(2) },
  { de: t(12) - 1, a: t(12) - 1, pos: () => ({ x: puceQuestion(2).x - 80, y: puceQuestion(2).y }), o: 0 },
  // C3 : la pointe de la courbe « Base », pendant qu'elle se trace, jusqu'à la
  // sortie du graphique (mesure 6).
  { de: M5 - 2, a: M5 - 2, pos: (f) => pointeC3(f).ecran, o: 0 },
  { de: M5 + 4, a: M6 - 16, pos: (f) => pointeC3(f).ecran },
  { de: M6 - 6, a: M6 - 6, pos: (f) => ({ x: pointeC3(f).ecran.x, y: pointeC3(f).ecran.y + 80 }), o: 0 },
];

// ─── Montage : les plans, les coupes, le flou de mouvement ───────────────────
// Les coupes tombent aux temps de la musique (0, 6, 12, 24, 32, 38, 42, 50,
// 56) : chaque transition est CENTRÉE sur le temps (de t(n) - durée/2 à
// t(n) + durée/2), si bien que la moitié du glissement est sur l'image du
// temps. La durée totale reste 900 images (somme des plans moins celle des
// transitions) ; la bande-son, hors du <TransitionSeries>, ne bouge pas.
const GLISSE = glissement({ sortie: 120, entree: 60, echelleSortie: 1, finSortie: 0.5, debutEntree: 0.25 });
const COUPES = [
  // C1 → C2 : la carte du nom s'efface sur place en reculant (×0,94), en
  // fondu enchaîné complet (la première question s'écrit plus haut, sans
  // chevaucher la carte) : pas de glissement, pas d'image vide.
  { temps: 6, duree: 12, presentation: glissement({ sortie: 0, entree: 0, echelleSortie: 0.94, finSortie: 1, debutEntree: 0 }) },
  { temps: 12, duree: 10, presentation: GLISSE },
  { temps: 24, duree: 10, presentation: GLISSE },
  { temps: 32, duree: 10, presentation: GLISSE },
  { temps: 38, duree: 10, presentation: GLISSE },
  { temps: 42, duree: 10, presentation: GLISSE },
  { temps: 50, duree: 10, presentation: GLISSE },
  // C8 → C9 : coupe franche sur l'impact du temps 56 (relecture du 03/10).
  { temps: 56, duree: 0, presentation: null },
] as const;
const PLANS: React.FC<{ f: number }>[] = [Ouverture, Questions, Simuler, Comparer, ListePea, PeaCto, Tableur, Premium, Fin];
const debutPlan = (i: number) => (i === 0 ? 0 : t(COUPES[i - 1].temps) - COUPES[i - 1].duree / 2);
const finPlan = (i: number) => (i === PLANS.length - 1 ? DUREE_COMPLETE : t(COUPES[i].temps) + COUPES[i].duree / 2);

/** Parallaxe : pendant chaque coupe glissée, la trame de points du fond se
 * décale de 24 px (le contenu, de 80 + 48 px) ; elle est périodique (pas de
 * 48 px), donc sans raccord visible. */
const decalageFond = (f: number) =>
  -(
    COUPES.reduce((s, c) => (c.duree > 0 ? s + prog(f, t(c.temps) - c.duree / 2, t(c.temps) + c.duree / 2, EASE.inOut) : s), 0) * 24
  ) % 48;

/** Flou de mouvement : seulement pendant les mouvements rapides, jamais quand
 * un chiffre en mouvement doit être lu (pas sur le compteur qui défile). Les
 * textes immobiles pendant une fenêtre restent nets. */
const FLOU: readonly FenetreFlou[] = [
  // Les coupes glissées, et la montée rapide (ease-out-expo) des captures qui entrent.
  [t(6) - 6, t(6) + 6, 6, 180],
  ...COUPES.slice(1)
    .filter((c) => c.duree > 0)
    .map((c) => [t(c.temps) - c.duree / 2, t(c.temps) + 6, 8, 180] as const),
  // C3 : la fenêtre des scénarios glisse d'une carte à l'autre (≈ 660 px en 8 images).
  [t(21.5) - 8, t(21.5) - 1, 16, 90],
  [t(22.5) - 8, t(22.5) - 1, 16, 90],
  // C4 : les trois cartes montent (6 images d'écart) ; le flou s'arrête
  // avant l'anneau du TER (temps 28), qu'il faut lire.
  [t(27), t(28) - 1, 8, 180],
  // C5 : les lignes du tableau défilent sous l'en-tête.
  [t(36) - 8, t(36) - 1, 12, 120],
  [t(37) - 8, t(37) - 1, 12, 120],
  // C7 : la capture Transactions sort, la fenêtre du Cockpit arrive de la
  // droite, puis le panoramique qui se resserre sur les colonnes (≈ 1 400 px
  // en 8 images).
  [t(46) - 6, t(46) + 8, 10, 120],
  [t(47), t(47.5) - 1, 16, 90],
];

/** Les plans, les coupes et le marqueur : tout ce qui bouge, sous le flou de
 * mouvement. Lit l'image courante lui-même, pour que chaque échantillon du
 * flou reçoive la sienne. */
const Montage: React.FC = () => {
  const f = useCurrentFrame();
  const m = trajet(POSES, f, 12);
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {PLANS.map((Plan, i) => {
          const coupe = COUPES[i];
          return (
            <React.Fragment key={i}>
              <TransitionSeries.Sequence durationInFrames={finPlan(i) - debutPlan(i)} premountFor={COMPLETE_CARREE.fps} name={`C${i + 1}`}>
                <HorlogeAbsolue depart={debutPlan(i)}>
                  <Plan f={f} />
                </HorlogeAbsolue>
              </TransitionSeries.Sequence>
              {coupe && coupe.presentation ? <TransitionSeries.Transition presentation={coupe.presentation} timing={tempsCoupe(coupe.duree)} /> : null}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      <Marqueur {...m} />
    </AbsoluteFill>
  );
};

export const CompleteCarree: React.FC<BandeSonProps> = ({ bruitages = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fond largeur={L} pasPoints={48} rayonPoint={1.6} decalage={decalageFond(f)} />
      <FlouMouvement fenetres={FLOU}>
        <Montage />
      </FlouMouvement>
      <BandeSon bruitages={bruitages} />
    </AbsoluteFill>
  );
};
