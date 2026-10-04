// Une capture du site en production (public/captures/), posée comme une carte.
//
// Les coordonnées passées aux enfants (anneaux, surlignages) sont celles de la
// capture d'origine, en pixels de l'image PNG : `z(x1, y1, x2, y2)` les
// convertit en position dans la carte. Les zones sont mesurées sur les PNG du
// 02/10/2026 (voir src/zones.ts).

import React from "react";
import { Img, staticFile } from "remotion";
import { C, OMBRE_CARTE } from "../charte";

export type Rect = { left: number; top: number; width: number; height: number };
export type Zone = readonly [number, number, number, number];

export type CaptureProps = {
  fichier: string;
  /** Taille de la capture, en pixels du PNG. */
  l: number;
  h: number;
  /** Largeur affichée de la partie visible (recadrage compris), hors marge. */
  largeur: number;
  /** Partie visible de la capture [x1, y1, x2, y2], en pixels du PNG. */
  recadrage?: Zone;
  /** Rayon des coins, en pixels du PNG (rounded-2xl du site = 32 px à @2x). */
  rayonPng?: number;
  /** Carte blanche autour de la capture (captures prises sur fond de page). */
  marge?: number;
  fondCarte?: string;
  bordure?: string;
  halo?: boolean;
  style?: React.CSSProperties;
  children?: (z: (zone: Zone) => Rect, k: number) => React.ReactNode;
};

export const Capture: React.FC<CaptureProps> = ({
  fichier,
  l,
  h,
  largeur,
  recadrage,
  rayonPng = 32,
  marge = 0,
  fondCarte = C.blanc,
  bordure = "1px solid rgba(226,232,240,0.6)",
  halo = true,
  style,
  children,
}) => {
  const [x1, y1, x2, y2] = recadrage ?? [0, 0, l, h];
  const k = largeur / (x2 - x1);
  const hauteur = (y2 - y1) * k;
  const rayon = rayonPng * k + (marge ? marge * 0.6 : 0);
  const z = (zone: Zone): Rect => ({
    left: marge + (zone[0] - x1) * k,
    top: marge + (zone[1] - y1) * k,
    width: (zone[2] - zone[0]) * k,
    height: (zone[3] - zone[1]) * k,
  });
  return (
    <div style={{ position: "absolute", width: largeur + 2 * marge, height: hauteur + 2 * marge, ...style }}>
      {halo ? (
        // Halo de TrackingPitch (primary-500/30 → indigo-400/20 → sky-400/20, flou).
        <div
          style={{
            position: "absolute",
            inset: -14,
            borderRadius: rayon * 1.5,
            background: "linear-gradient(to bottom right, rgba(59,130,246,0.30), rgba(129,140,248,0.20), rgba(56,189,248,0.20))",
            filter: "blur(40px)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: rayon,
          overflow: "hidden",
          background: fondCarte,
          border: marge ? bordure : undefined,
          boxShadow: OMBRE_CARTE,
        }}
      >
        {/* Fenêtre de recadrage : seule la partie choisie de la capture se voit,
            même dans la marge de la carte. */}
        <div
          style={{
            position: "absolute",
            left: marge - (marge ? 1 : 0),
            top: marge - (marge ? 1 : 0),
            width: largeur,
            height: hauteur,
            overflow: "hidden",
            borderRadius: marge ? 0 : rayonPng * k,
          }}
        >
          <Img
            src={staticFile(`captures/${fichier}`)}
            style={{ position: "absolute", left: -x1 * k, top: -y1 * k, width: l * k, height: h * k, maxWidth: "none" }}
          />
        </div>
      </div>
      {children ? <div style={{ position: "absolute", inset: 0 }}>{children(z, k)}</div> : null}
    </div>
  );
};
