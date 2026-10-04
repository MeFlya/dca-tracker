// Accents posés sur les captures : anneau (focus), bande de surlignage,
// soulignement, et le marqueur (le point blanc du logo, fil conducteur).
// Toutes les durées sont en images, relatives à la séquence qui les contient.

import React from "react";
import { useCurrentFrame } from "remotion";
import { anim, C, EASE } from "../charte";
import type { Rect } from "./Capture";

type Fenetre = { debut: number; fin?: number; repos?: number };

/** Opacité et échelle d'un accent : entrée en 8 images (ease-out-expo), repos
 * éventuel à une opacité plus basse, sortie en 8 images. */
function etat(frame: number, { debut, fin, repos }: Fenetre) {
  const entree = anim(frame, debut, debut + 8, 0, 1, EASE.expo);
  let o = entree;
  if (repos !== undefined) o *= anim(frame, debut + 12, debut + 22, 1, repos, EASE.inOut);
  if (fin !== undefined) o *= anim(frame, fin, fin + 8, 1, 0, EASE.inOut);
  const echelle = anim(frame, debut, debut + 10, 1.12, 1, EASE.expo);
  return { o, echelle };
}

/** Anneau autour d'une zone (primary-600 ou primary-300, halo bleu doux). */
export const Anneau: React.FC<
  Fenetre & { rect: Rect; couleur?: string; epaisseur?: number; rayon?: number; marge?: number }
> = ({ rect, couleur = C.bleu, epaisseur = 4, rayon = 12, marge = 8, ...fenetre }) => {
  const frame = useCurrentFrame();
  const { o, echelle } = etat(frame, fenetre);
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.left - marge,
        top: rect.top - marge,
        width: rect.width + 2 * marge,
        height: rect.height + 2 * marge,
        borderRadius: rayon,
        border: `${epaisseur}px solid ${couleur}`,
        boxShadow: `0 0 0 ${epaisseur * 1.5}px rgba(59,130,246,0.14), 0 0 ${epaisseur * 8}px rgba(59,130,246,0.40)`,
        opacity: o,
        transform: `scale(${echelle})`,
      }}
    />
  );
};

/** Bande de surlignage (primary-500 très clair) : lignes d'un tableau, d'une liste. */
export const Bande: React.FC<Fenetre & { rect: Rect; couleur?: string; bord?: string; rayon?: number; marge?: number }> = ({
  rect,
  couleur = "rgba(59,130,246,0.14)",
  bord = "rgba(59,130,246,0.55)",
  rayon = 10,
  marge = 6,
  ...fenetre
}) => {
  const frame = useCurrentFrame();
  const { o } = etat(frame, fenetre);
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.left - marge,
        top: rect.top - marge,
        width: rect.width + 2 * marge,
        height: rect.height + 2 * marge,
        borderRadius: rayon,
        background: couleur,
        boxShadow: `inset 0 0 0 2px ${bord}`,
        opacity: o,
      }}
    />
  );
};

/** Soulignement qui se trace de gauche à droite. */
export const Soulignement: React.FC<{ rect: Rect; debut: number; couleur?: string; epaisseur?: number }> = ({
  rect,
  debut,
  couleur = C.bleu500,
  epaisseur = 5,
}) => {
  const frame = useCurrentFrame();
  const t = anim(frame, debut, debut + 10, 0, 1, EASE.expo);
  if (t <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.left,
        top: rect.top + rect.height + epaisseur,
        width: rect.width * t,
        height: epaisseur,
        borderRadius: epaisseur,
        background: couleur,
      }}
    />
  );
};

/**
 * Le marqueur : le point blanc du logo (« the "tracker" marker », dit le
 * commentaire de LogoMark.tsx), cerclé du bleu du logo. Il glisse d'un plan à
 * l'autre et se pose sur l'élément à lire. Seul ornement de la vidéo.
 */
export const Marqueur: React.FC<{ x: number; y: number; r: number; o: number; anneau?: number }> = ({ x, y, r, o, anneau = 1 }) => {
  if (o <= 0.001) return null;
  const bord = r * 0.42 * anneau;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: "50%",
        background: C.blanc,
        boxShadow: `0 0 0 ${bord}px ${C.bleu}, 0 0 ${r * 2.4 * anneau}px ${r * 0.5 * anneau}px rgba(59,130,246,0.55)`,
        opacity: o,
      }}
    />
  );
};

// ─── Trajet du marqueur ──────────────────────────────────────────────────────

export type Point = { x: number; y: number };
export type Pose = {
  /** Le marqueur est posé de `de` à `a` (images absolues de la composition). */
  de: number;
  a: number;
  pos: (frame: number) => Point;
  o?: number;
  r?: number;
  anneau?: number;
};

/**
 * Position du marqueur à une image donnée : posé sur une Pose, ou en vol entre
 * deux poses (ease-in-out). Hors des poses (avant la première, après la
 * dernière), il est masqué.
 */
export function trajet(poses: Pose[], frame: number, rDefaut: number) {
  const val = (p: Pose, f: number) => ({ ...p.pos(f), o: p.o ?? 1, r: p.r ?? rDefaut, anneau: p.anneau ?? 1 });
  for (let i = 0; i < poses.length; i++) {
    const p = poses[i];
    if (frame >= p.de && frame <= p.a) return val(p, frame);
    const suivante = poses[i + 1];
    if (suivante && frame > p.a && frame < suivante.de) {
      const t = EASE.inOut((frame - p.a) / (suivante.de - p.a));
      const A = val(p, p.a);
      const B = val(suivante, suivante.de);
      const mix = (a: number, b: number) => a + (b - a) * t;
      return { x: mix(A.x, B.x), y: mix(A.y, B.y), o: mix(A.o, B.o), r: mix(A.r, B.r), anneau: mix(A.anneau, B.anneau) };
    }
  }
  return { x: 0, y: 0, o: 0, r: rDefaut, anneau: 1 };
}
