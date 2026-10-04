// Une capture du site recomposée à partir de plusieurs morceaux, posée comme
// une carte (même halo, même ombre, mêmes coins que <Capture>).
//
// Sert à RETIRER une partie d'une capture sans la retoucher : chaque morceau
// est un rectangle du PNG d'origine, posé à sa place dans la carte. Rien n'est
// redessiné, aucun texte n'est ajouté (retouches de la boucle du 04/10/2026) :
//   - carte d'ETF sans son bloc de cours (« 7,13 € +0,93 % · Mis à jour il y a
//     4 h » était figé au jour de la capture) ;
//   - fenêtre « Versement du mois » réduite à trois colonnes, pour être lue de
//     près (à 343 px de large, le tableau entier faisait des textes de 5 px).
//
// Un morceau peut être étiré en largeur (`largeur`) : seulement sur une bande
// VIDE du tableau (fond d'en-tête et filets horizontaux, uniformes), pour que
// les colonnes gardées remplissent la carte.
//
// `z(zone)` convertit une zone du PNG d'origine (src/zones.ts) en position dans
// la carte : les anneaux restent posés sur les mêmes pixels qu'avant.

import React from "react";
import { Img, staticFile } from "remotion";
import { C, OMBRE_CARTE } from "../charte";
import type { Rect, Zone } from "./Capture";

export type Morceau = {
  /** Rectangle du PNG d'origine [x1, y1, x2, y2]. */
  de: Zone;
  /** Position dans la carte, en pixels du PNG (avant mise à l'échelle). */
  x: number;
  y: number;
  /** Largeur posée, en pixels du PNG ; par défaut celle du rectangle (pas d'étirement). */
  largeur?: number;
};

export const Morceaux: React.FC<{
  fichier: string;
  /** Taille du PNG d'origine. */
  l: number;
  h: number;
  morceaux: Morceau[];
  /** Taille de la carte recomposée, en pixels du PNG. */
  largeurPng: number;
  hauteurPng: number;
  /** Largeur affichée de la carte. */
  largeur: number;
  rayonPng?: number;
  halo?: boolean;
  style?: React.CSSProperties;
  children?: (z: (zone: Zone) => Rect, k: number) => React.ReactNode;
}> = ({ fichier, l, h, morceaux, largeurPng, hauteurPng, largeur, rayonPng = 32, halo = true, style, children }) => {
  const k = largeur / largeurPng;
  const hauteur = hauteurPng * k;
  const rayon = rayonPng * k;
  const etirement = (m: Morceau) => (m.largeur ?? m.de[2] - m.de[0]) / (m.de[2] - m.de[0]);
  const z = (zone: Zone): Rect => {
    const cx = (zone[0] + zone[2]) / 2;
    const cy = (zone[1] + zone[3]) / 2;
    const m = morceaux.find((p) => cx >= p.de[0] && cx <= p.de[2] && cy >= p.de[1] && cy <= p.de[3]);
    if (!m) throw new Error(`Morceaux : la zone [${zone.join(", ")}] n'est dans aucun morceau de ${fichier}`);
    const sx = etirement(m);
    return {
      left: (m.x + (zone[0] - m.de[0]) * sx) * k,
      top: (m.y + zone[1] - m.de[1]) * k,
      width: (zone[2] - zone[0]) * sx * k,
      height: (zone[3] - zone[1]) * k,
    };
  };
  return (
    <div style={{ position: "absolute", width: largeur, height: hauteur, ...style }}>
      {halo ? (
        // Le même halo que <Capture> (TrackingPitch du site).
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
          background: C.blanc,
          boxShadow: OMBRE_CARTE,
        }}
      >
        {morceaux.map((m, i) => {
          const sx = etirement(m);
          const [x1, y1, x2, y2] = m.de;
          return (
            <div
              key={i}
              style={{ position: "absolute", left: m.x * k, top: m.y * k, width: (x2 - x1) * sx * k, height: (y2 - y1) * k, overflow: "hidden" }}
            >
              <Img
                src={staticFile(`captures/${fichier}`)}
                style={{ position: "absolute", left: -x1 * sx * k, top: -y1 * k, width: l * sx * k, height: h * k, maxWidth: "none" }}
              />
            </div>
          );
        })}
      </div>
      {children ? <div style={{ position: "absolute", inset: 0 }}>{children(z, k)}</div> : null}
    </div>
  );
};
