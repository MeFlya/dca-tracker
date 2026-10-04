// Fond des deux vidéos : la section sombre « Un cockpit qui grandit avec votre
// DCA » de l'accueil (TrackingPitch.tsx), mise à l'échelle de l'image.
//   - slate-950 ;
//   - radial-gradient(900px circle at 10% 15%, rgba(59,130,246,0.25), transparent 50%)
//   - radial-gradient(700px circle at 90% 85%, rgba(99,102,241,0.20), transparent 55%)
//   - trame de points blancs (1 px au pas de 24 px sur le site), 5 % d'opacité.
// Le fond est fixe : rien n'y bouge, l'encodeur ne le paie qu'une fois.
// Seule exception, la version carrée : `decalage` fait glisser la trame de
// points de quelques pixels pendant les coupes (parallaxe). Sans `decalage`
// (Boucle, Complete), le rendu est inchangé.

import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../charte";

export const Fond: React.FC<{ largeur: number; pasPoints: number; rayonPoint: number; decalage?: number }> = ({
  largeur,
  pasPoints,
  rayonPoint,
  decalage = 0,
}) => {
  // La section du site fait ~1440 px de large.
  const s = largeur / 1440;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      <AbsoluteFill
        style={{
          backgroundImage: [
            `radial-gradient(${Math.round(900 * s)}px circle at 10% 15%, rgba(59, 130, 246, 0.25), transparent 50%)`,
            `radial-gradient(${Math.round(700 * s)}px circle at 90% 85%, rgba(99, 102, 241, 0.20), transparent 55%)`,
          ].join(", "),
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage: `radial-gradient(#ffffff ${rayonPoint}px, transparent ${rayonPoint + 0.5}px)`,
          backgroundSize: `${pasPoints}px ${pasPoints}px`,
          backgroundPosition: `${pasPoints / 2 + decalage}px ${pasPoints / 2}px`,
        }}
      />
    </AbsoluteFill>
  );
};
