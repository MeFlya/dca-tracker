// Logo de dcatracker.fr.
//
// LogoMark : copie EXACTE du SVG de src/components/ui/LogoMark.tsx du site
// (carré 28×28 à coins de 7 en #1d4ed8, courbe blanche, point blanc). Ne pas
// retoucher : si le logo change sur le site, recopier le composant.
//
// LogoWordmark : même composition que LogoWordmark du site (gap-2.5, « DCA » en
// gras gray-900, « Tracker » en normal gray-500, ml-1, tracking-tight), mise à
// l'échelle : au site, le logo fait 28 px et le texte 15 px.

import React from "react";
import { C, INTER, OMBRE_CARTE } from "../charte";

export const LOGO_COURBE = "M5 21 Q9 21 13 15 Q17 9 22 6.5";
export const LOGO_POINT = { x: 22, y: 6.5, r: 2.5 };

/** Copie exacte de LogoMark.tsx. */
export const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true" style={{ display: "block" }}>
    <rect width="28" height="28" rx="7" fill="#1d4ed8" />
    {/* Upward trend curve */}
    <path d={LOGO_COURBE} stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Dot at the tip — the "tracker" marker */}
    <circle cx="22" cy="6.5" r="2.5" fill="white" />
  </svg>
);

/**
 * Le même logo, dont chaque pièce peut s'animer (ouverture de la version
 * complète). À l'état final (carre = 1, trace = 1, point = 1), le rendu est
 * identique à LogoMark.
 */
export const LogoMarkAnime: React.FC<{ size: number; carre?: number; trace?: number; point?: number }> = ({
  size,
  carre = 1,
  trace = 1,
  point = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
    <rect width="28" height="28" rx="7" fill="#1d4ed8" opacity={carre} />
    {trace > 0 ? (
      <path
        d={LOGO_COURBE}
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        pathLength={1}
        strokeDasharray={trace >= 1 ? undefined : "1 1"}
        strokeDashoffset={trace >= 1 ? undefined : 1 - trace}
      />
    ) : null}
    {point > 0 ? (
      <circle cx="22" cy="6.5" r={2.5 * point} fill="white" />
    ) : null}
  </svg>
);

/**
 * Largeur du texte « DCA Tracker » (Inter, tracking-tight, ml-1), en em de la
 * taille du texte. Mesurée dans le navigateur de rendu (composition « Mesure »,
 * 02/10/2026) : sert à placer le logo pendant que la carte s'ouvre ou se
 * referme, sans mesure à chaque image.
 */
export const LARGEUR_NOM_EM = 5.782;

/** Proportions de LogoWordmark (logo 28 px, texte 15 px, gap-2.5 = 10 px). */
export const proportionsNom = (logo: number) => ({
  texte: (logo * 15) / 28,
  ecart: (logo * 10) / 28,
});

export const Nom: React.FC<{ taille: number }> = ({ taille }) => (
  <span
    style={{
      fontFamily: INTER,
      fontSize: taille,
      fontWeight: 700,
      color: C.gris900,
      letterSpacing: "-0.025em",
      whiteSpace: "nowrap",
      lineHeight: 1,
    }}
  >
    DCA<span style={{ fontWeight: 400, color: C.gris500, marginLeft: "0.2667em" }}>Tracker</span>
  </span>
);

/**
 * Carte blanche du nom : le nom « DCA Tracker » n'existe sur le site qu'en
 * foncé sur fond clair, il est donc toujours posé sur une carte blanche (comme
 * la carte de la section sombre TrackingPitch), jamais recoloré.
 *
 * Géométrie fixe, calculée depuis la taille du logo : la carte est centrée sur
 * (cx, cy). `ouverture` (0 → 1) déroule le nom ; à 0, la carte se resserre sur
 * le logo, qui se retrouve exactement en (cx, cy).
 */
export function geometrieCarte(logo: number, ouverture = 1, serrage = 0) {
  const { texte, ecart } = proportionsNom(logo);
  const largeurNom = LARGEUR_NOM_EM * texte;
  // serrage (0 → 1) : la carte se resserre jusqu'aux bords du carré bleu.
  const padV = logo * 0.39 * (1 - serrage);
  const padH = logo * 0.5 * (1 - serrage);
  const contenu = logo + (ecart + largeurNom) * ouverture;
  return {
    texte,
    ecart,
    largeurNom,
    padV,
    padH,
    largeur: contenu + 2 * padH,
    hauteur: logo + 2 * padV,
    rayon: logo * 0.357 + ((logo * 7) / 28 - logo * 0.357) * serrage,
    // centre du logo, relatif au centre de la carte
    logoDx: -contenu / 2 + logo / 2,
  };
}

export const CarteNom: React.FC<{
  cx: number;
  cy: number;
  logo: number;
  ouverture?: number;
  serrage?: number;
  opaciteNom?: number;
  opaciteCarte?: number;
  opaciteHalo?: number;
  echelle?: number;
  afficherLogo?: boolean;
  logoAnime?: { carre?: number; trace?: number; point?: number };
}> = ({ cx, cy, logo, ouverture = 1, serrage = 0, opaciteNom = 1, opaciteCarte = 1, opaciteHalo = 1, echelle = 1, afficherLogo = true, logoAnime }) => {
  const g = geometrieCarte(logo, ouverture, serrage);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - g.largeur / 2,
        top: cy - g.hauteur / 2,
        width: g.largeur,
        height: g.hauteur,
        transform: `scale(${echelle})`,
      }}
    >
      {/* Halo de TrackingPitch : primary-500/30 → indigo-400/20 → sky-400/20, flou. */}
      <div
        style={{
          position: "absolute",
          inset: -logo * 0.14,
          borderRadius: g.rayon * 1.4,
          background: "linear-gradient(to bottom right, rgba(59,130,246,0.30), rgba(129,140,248,0.20), rgba(56,189,248,0.20))",
          filter: `blur(${logo * 0.36}px)`,
          opacity: opaciteHalo * opaciteCarte * (1 - serrage),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: g.rayon,
          background: C.blanc,
          border: "1px solid rgba(226,232,240,0.6)",
          boxShadow: OMBRE_CARTE,
          opacity: opaciteCarte,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: g.padH,
          top: g.padV,
          height: logo,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: logo, height: logo, flexShrink: 0, opacity: afficherLogo ? 1 : 0 }}>
          {logoAnime ? <LogoMarkAnime size={logo} {...logoAnime} /> : <LogoMark size={logo} />}
        </div>
        <div
          style={{
            width: (g.ecart + g.largeurNom) * ouverture,
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ paddingLeft: g.ecart, opacity: opaciteNom, display: "flex", alignItems: "center" }}>
            <Nom taille={g.texte} />
          </div>
        </div>
      </div>
    </div>
  );
};
