// Composition d'outillage : mesure la largeur du nom « DCA Tracker » dans le
// navigateur de rendu (résultat écrit sur l'image). Sert à régler
// LARGEUR_NOM_EM dans composants/Logo.tsx si la police change.
import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Nom } from "./composants/Logo";
import { INTER } from "./charte";

export const Mesure: React.FC = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const [largeur, setLargeur] = useState<number | null>(null);
  const [poignee] = useState(() => delayRender("mesure"));
  useLayoutEffect(() => {
    document.fonts.ready.then(() => {
      setLargeur(ref.current!.getBoundingClientRect().width);
      continueRender(poignee);
    });
  }, [poignee]);
  return (
    <AbsoluteFill style={{ background: "white", padding: 40, fontFamily: INTER, fontSize: 40 }}>
      <span ref={ref} style={{ display: "inline-block", alignSelf: "flex-start" }}>
        <Nom taille={100} />
      </span>
      <div style={{ marginTop: 40 }}>largeur à 100 px : {largeur?.toFixed(2)} → {largeur ? (largeur / 100).toFixed(4) : ""} em</div>
    </AbsoluteFill>
  );
};
