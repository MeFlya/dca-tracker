// Composition d'outillage : planche contact. Montre, sur une seule image, une
// composition figée à plusieurs instants (transitions, enchaînements), pour
// relire le mouvement sans regarder la vidéo image par image.
//   npx remotion still src/index.ts Planche out/controle/planche.png --props='{"id":"Boucle","images":[118,122,126,130]}'
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { Boucle, BOUCLE } from "./boucle/Boucle";
import { BoucleCockpit, BOUCLE_COCKPIT } from "./cockpit/BoucleCockpit";
import { Complete, COMPLETE } from "./complete/Complete";
import { CompleteCarree, COMPLETE_CARREE } from "./carre/CompleteCarree";

export type PlancheProps = { id: "Boucle" | "BoucleCockpit" | "Complete" | "CompleteCarree"; images: number[] };

/** Dimensions et composant de chaque composition (Boucle, BoucleCockpit et CompleteCarree sont carrées). */
const COMPOSITIONS = {
  Boucle: { c: BOUCLE, Comp: Boucle },
  BoucleCockpit: { c: BOUCLE_COCKPIT, Comp: BoucleCockpit },
  Complete: { c: COMPLETE, Comp: Complete },
  CompleteCarree: { c: COMPLETE_CARREE, Comp: CompleteCarree },
} as const;

export const PLANCHE = { largeur: 1920, colonnes: 4 };

export const Planche: React.FC<PlancheProps> = ({ id, images }) => {
  const { c, Comp } = COMPOSITIONS[id];
  const l = PLANCHE.largeur / PLANCHE.colonnes;
  const k = l / c.largeur;
  return (
    <AbsoluteFill style={{ background: "#111", display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start" }}>
      {images.map((n) => (
        <div key={n} style={{ width: l, height: c.hauteur * k, position: "relative", overflow: "hidden", outline: "1px solid #333" }}>
          <div style={{ width: c.largeur, height: c.hauteur, transform: `scale(${k})`, transformOrigin: "0 0", position: "absolute" }}>
            <Freeze frame={n}>
              <Comp />
            </Freeze>
          </div>
          <span style={{ position: "absolute", left: 6, top: 4, color: "#fff", font: "600 16px sans-serif", background: "rgba(0,0,0,.6)", padding: "1px 5px" }}>{n}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};
