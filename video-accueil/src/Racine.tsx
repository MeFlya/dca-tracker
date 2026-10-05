import React from "react";
import { Composition } from "remotion";
import { Boucle, BOUCLE } from "./boucle/Boucle";
import { BoucleCockpit, BOUCLE_COCKPIT } from "./cockpit/BoucleCockpit";
import { BoucleModeleGratuit, BOUCLE_MODELE_GRATUIT } from "./modele-gratuit/BoucleModeleGratuit";
import { Complete, COMPLETE } from "./complete/Complete";
import { CompleteCarree, COMPLETE_CARREE } from "./carre/CompleteCarree";
import { Mesure } from "./Mesure";
import { Planche, PLANCHE, type PlancheProps } from "./Planche";

export const Racine: React.FC = () => (
  <>
    {/* Boucle muette du bandeau d'accueil (sans piste audio). */}
    <Composition id="Boucle" component={Boucle} width={BOUCLE.largeur} height={BOUCLE.hauteur} fps={BOUCLE.fps} durationInFrames={BOUCLE.duree} />
    {/* Boucle muette de la page du Cockpit DCA (STORYBOARD-COCKPIT.md), sans piste audio. */}
    <Composition
      id="BoucleCockpit"
      component={BoucleCockpit}
      width={BOUCLE_COCKPIT.largeur}
      height={BOUCLE_COCKPIT.hauteur}
      fps={BOUCLE_COCKPIT.fps}
      durationInFrames={BOUCLE_COCKPIT.duree}
    />
    {/* Boucle muette de la page du modèle gratuit, /suivi-pea-excel
        (STORYBOARD-MODELE-GRATUIT.md), sans piste audio. */}
    <Composition
      id="BoucleModeleGratuit"
      component={BoucleModeleGratuit}
      width={BOUCLE_MODELE_GRATUIT.largeur}
      height={BOUCLE_MODELE_GRATUIT.hauteur}
      fps={BOUCLE_MODELE_GRATUIT.fps}
      durationInFrames={BOUCLE_MODELE_GRATUIT.duree}
    />
    {/* Version complète : musique (public/musique.wav, ou .mp3) et bruitages
        d'interface ; --props='{"bruitages":false}' rend la musique seule. */}
    <Composition
      id="Complete"
      component={Complete}
      width={COMPLETE.largeur}
      height={COMPLETE.hauteur}
      fps={COMPLETE.fps}
      durationInFrames={COMPLETE.duree}
      defaultProps={{ bruitages: true }}
    />
    {/* Version carrée avec le son (fenêtre « Regarder avec le son », décision
        de Maël du 03/10) : mêmes plans, mêmes temps et même bande-son que
        Complete ; --props='{"bruitages":false}' rend la musique seule. */}
    <Composition
      id="CompleteCarree"
      component={CompleteCarree}
      width={COMPLETE_CARREE.largeur}
      height={COMPLETE_CARREE.hauteur}
      fps={COMPLETE_CARREE.fps}
      durationInFrames={COMPLETE_CARREE.duree}
      defaultProps={{ bruitages: true }}
    />
    {/* Outillage : mesure du nom « DCA Tracker » (voir composants/Logo.tsx). */}
    <Composition id="Mesure" component={Mesure} width={900} height={300} fps={30} durationInFrames={1} />
    {/* Outillage : planche contact (plusieurs instants d'une composition sur une image). */}
    <Composition
      id="Planche"
      component={Planche}
      width={PLANCHE.largeur}
      height={1080}
      fps={30}
      // Durée longue : <Freeze> ne peut figer qu'une image comprise dans la durée.
      durationInFrames={1200}
      defaultProps={{ id: "Boucle", images: [0] } as PlancheProps}
      calculateMetadata={({ props }) => {
        const c = props.id === "Complete" ? { l: 1920, h: 1080 } : { l: 1080, h: 1080 };
        const lignes = Math.ceil(props.images.length / PLANCHE.colonnes);
        return { height: Math.max(2, Math.round((lignes * c.h * PLANCHE.largeur) / PLANCHE.colonnes / c.l / 2) * 2) };
      }}
    />
  </>
);
