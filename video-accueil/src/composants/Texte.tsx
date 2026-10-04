// Textes : apparition comme `data-reveal` sur le site (opacité 0 → 1 et montée,
// ease-out-quart), sortie en opacité avec une légère montée.

import React from "react";
import { useCurrentFrame } from "remotion";
import { anim, C, EASE, INTER, NEWSREADER } from "../charte";

export const Revele: React.FC<{
  debut: number;
  duree?: number;
  sortie?: number;
  dureeSortie?: number;
  montee?: number;
  flou?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ debut, duree = 14, sortie, dureeSortie = 12, montee = 26, flou = 0, style, children }) => {
  const frame = useCurrentFrame();
  const t = anim(frame, debut, debut + duree, 0, 1, EASE.quart);
  const s = sortie === undefined ? 0 : anim(frame, sortie, sortie + dureeSortie, 0, 1, EASE.inOut);
  const o = t * (1 - s);
  if (o <= 0.001) return null;
  const y = (1 - t) * montee - s * 12;
  const f = flou * (1 - t);
  return (
    <div
      style={{
        position: "absolute",
        opacity: o,
        transform: `translateY(${y}px)`,
        filter: f > 0.05 ? `blur(${f}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Titre : Newsreader 700, interlettrage -0,02 em (h1/h2 de globals.css). */
export const styleTitre = (taille: number): React.CSSProperties => ({
  fontFamily: NEWSREADER,
  fontWeight: 700,
  fontSize: taille,
  lineHeight: 1.08,
  letterSpacing: "-0.02em",
  fontOpticalSizing: "auto",
  color: C.blanc,
  margin: 0,
});

/** Surtitre : Inter 600, capitales, tracking-widest, primary-300 (sections sombres). */
export const styleSurtitre = (taille: number): React.CSSProperties => ({
  fontFamily: INTER,
  fontWeight: 600,
  fontSize: taille,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: C.bleu300,
  whiteSpace: "nowrap",
});

export const styleSousTitre = (taille: number): React.CSSProperties => ({
  fontFamily: INTER,
  fontWeight: 500,
  fontSize: taille,
  lineHeight: 1.3,
  color: C.slate300,
});

export const styleMention = (taille: number): React.CSSProperties => ({
  fontFamily: INTER,
  fontWeight: 400,
  fontSize: taille,
  lineHeight: 1.35,
  color: C.slate400,
});

/** Pastille sur fond sombre (bouton secondaire de TrackingPitch : blanc 10 %, bordure blanche 15 %). */
export const Pastille: React.FC<{ taille: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ taille, children, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: taille * 0.5,
      padding: `${taille * 0.45}px ${taille * 0.9}px`,
      borderRadius: 999,
      background: "rgba(255,255,255,0.10)",
      border: "1.5px solid rgba(255,255,255,0.15)",
      fontFamily: INTER,
      fontWeight: 600,
      fontSize: taille,
      color: C.blanc,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

/**
 * Compteur en chiffres d'Inter gras : chaque chiffre a une case de largeur
 * fixe, le nombre ne « danse » pas pendant qu'il défile.
 */
export const Compteur: React.FC<{ valeur: number; taille: number; couleur?: string }> = ({ valeur, taille, couleur = C.blanc }) => {
  const chiffres = String(Math.round(valeur));
  const groupes: string[] = [];
  for (let i = chiffres.length; i > 0; i -= 3) groupes.unshift(chiffres.slice(Math.max(0, i - 3), i));
  return (
    <span
      style={{
        fontFamily: INTER,
        fontWeight: 700,
        fontSize: taille,
        letterSpacing: "-0.02em",
        color: couleur,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "baseline",
      }}
    >
      {groupes.map((g, i) => (
        <span key={i} style={{ display: "inline-flex", marginLeft: i === 0 ? 0 : "0.2em" }}>
          {g.split("").map((c, j) => (
            <span key={j} style={{ display: "inline-block", width: "0.6em", textAlign: "center" }}>
              {c}
            </span>
          ))}
        </span>
      ))}
      <span style={{ marginLeft: "0.22em" }}>€</span>
    </span>
  );
};
