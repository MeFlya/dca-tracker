// Finition de la version carrée (passe du 04/10/2026), avec les paquets
// officiels de Remotion, installés dans ce seul projet vidéo :
//   - @remotion/transitions (<TransitionSeries>) : les coupes entre plans ;
//   - @remotion/motion-blur (<CameraMotionBlur>) : un flou de mouvement léger,
//     seulement pendant les glissements et zooms rapides.
// Règles de la finition : élégant, sobre, cohérent avec la Boucle. Pas de
// glitch, d'aberration chromatique, de « film burn » ni d'ondulation ; aucun
// texte ni chiffre nouveau.

import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { linearTiming, type TransitionPresentation, type TransitionPresentationComponentProps } from "@remotion/transitions";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { EASE, prog } from "../charte";

// ─── Coupes : un glissement latéral, comme une caméra qui passe au plan suivant ─

type GlissementProps = {
  /** Déplacement du plan qui sort, vers la gauche (px). */
  sortie: number;
  /** Déplacement du plan qui entre, depuis la droite (px). */
  entree: number;
  /** Échelle d'arrivée du plan qui sort (1 : aucune). */
  echelleSortie: number;
  /** Progression à laquelle le plan qui sort a disparu (0,5 : sur le temps). */
  finSortie: number;
  /** Progression à laquelle le plan qui entre commence à apparaître. */
  debutEntree: number;
};

/**
 * Présentation de transition (API officielle `TransitionPresentation`) : le
 * plan qui sort glisse à gauche et s'efface (il a disparu à `finSortie`, 50 %
 * de la progression : l'image du temps), le plan qui entre arrive de la droite
 * et apparaît de `debutEntree` (25 %) à 80 %.
 * Les deux ne se croisent qu'à faible opacité, autour du temps de la coupe :
 * deux en-têtes ne s'écrivent jamais l'un sur l'autre à pleine opacité. Ils
 * vont dans le même sens : on lit un seul mouvement de caméra.
 * La progression est déjà adoucie par la courbe de la transition (ease-in-out
 * du site) ; sa moitié tombe exactement sur l'image du temps de la coupe.
 */
const Glissement: React.FC<TransitionPresentationComponentProps<GlissementProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  const sort = presentationDirection === "exiting";
  const style: React.CSSProperties = sort
    ? {
        opacity: Math.max(0, 1 - p / passedProps.finSortie),
        transform: `translateX(${-passedProps.sortie * p}px) scale(${1 - (1 - passedProps.echelleSortie) * p})`,
      }
    : {
        opacity: Math.min(1, Math.max(0, (p - passedProps.debutEntree) / (0.8 - passedProps.debutEntree))),
        transform: `translateX(${passedProps.entree * (1 - p)}px)`,
      };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const glissement = (props: GlissementProps): TransitionPresentation<GlissementProps> => ({ component: Glissement, props });

/** Durée d'une coupe en images, centrée sur le temps de la coupe. Courbe :
 * ease-in-out du site (charte.ts). */
export const tempsCoupe = (duree: number) => linearTiming({ durationInFrames: duree, easing: EASE.inOut });

/**
 * Remet l'horloge absolue de la composition sous un <TransitionSeries.Sequence>
 * qui commence à `depart` : les plans sont écrits en temps musicaux absolus
 * (t(n)), et leurs composants (Revele, Anneau, Bande) lisent useCurrentFrame().
 */
export const HorlogeAbsolue: React.FC<{ depart: number; children: React.ReactNode }> = ({ depart, children }) => (
  <Sequence from={-depart} layout="none" name="Horloge absolue">
    {children}
  </Sequence>
);

// ─── Flou de mouvement ───────────────────────────────────────────────────────

/** Fenêtre de flou : [première image, dernière image, échantillons, angle
 * d'obturation en degrés]. */
export type FenetreFlou = readonly [number, number, number, number];

/**
 * <CameraMotionBlur> (officiel) seulement sur les images listées : ailleurs,
 * les enfants sont rendus tels quels. Ce qui ne bouge pas pendant une fenêtre
 * reste net (tous les échantillons sont identiques) : seuls les éléments en
 * mouvement se floutent. Obturateur de 180° (une demi-image, comme une caméra
 * de cinéma) pour les coupes ; 90 à 120° pour les panoramiques très rapides,
 * où un flou d'une demi-image laissait des traînées trop longues.
 *
 * Recentrage : à 180°, <CameraMotionBlur> prend ses échantillons entre
 * f + 0,5 et f + 0,92 (moyenne f + 0,7). Mesuré sur les coupes : l'image
 * t(n) - 1 montrait déjà le plan suivant à moitié, les deux en-têtes
 * superposés. Les enfants sont donc décalés d'une image (<Sequence from={1}>) :
 * échantillons entre f - 0,5 et f - 0,08, moyenne f - 0,3 (10 ms ; moins à
 * 90 ou 120°). Aucune bascule franche
 * (« f >= n ») ne tombe dans une fenêtre de flou, sauf les bornes des plans
 * pendant les coupes, où le plan concerné est alors invisible.
 */
export const FlouMouvement: React.FC<{ fenetres: readonly FenetreFlou[]; children: React.ReactNode }> = ({ fenetres, children }) => {
  const f = useCurrentFrame();
  const w = fenetres.find(([a, b]) => f >= a && f <= b);
  if (!w) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <CameraMotionBlur shutterAngle={w[3]} samples={w[2]}>
      <Sequence from={1} name="Flou recentré">
        {children}
      </Sequence>
    </CameraMotionBlur>
  );
};

// ─── Reflet ──────────────────────────────────────────────────────────────────

/**
 * Un reflet qui balaie une carte, une seule fois, de gauche à droite : une
 * bande de lumière blanche très douce (12 % au plus), en biais. Il se pose
 * au-dessus de la carte (mêmes coins arrondis) et ne change aucune couleur
 * en dehors de son passage.
 */
export const Reflet: React.FC<{ f: number; debut: number; duree: number; rayon: number; style: React.CSSProperties }> = ({
  f,
  debut,
  duree,
  rayon,
  style,
}) => {
  const p = prog(f, debut, debut + duree, EASE.inOut);
  if (p <= 0 || p >= 1) return null;
  // La bande traverse de -30 % à 130 % de la largeur.
  const centre = -30 + 160 * p;
  return (
    <div style={{ position: "absolute", borderRadius: rayon, overflow: "hidden", pointerEvents: "none", ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(105deg, rgba(255,255,255,0) ${centre - 14}%, rgba(255,255,255,0.12) ${centre}%, rgba(255,255,255,0) ${centre + 14}%)`,
        }}
      />
    </div>
  );
};
