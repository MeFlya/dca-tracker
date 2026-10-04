// Bande-son partagée : musique (public/musique.wav, rendue par musique/) et
// bruitages d'interface (public/sons/*.wav, scripts/generer-sons.mjs).
//
// Utilisée par la version complète 16:9 (Complete) et par la version carrée :
// toutes les positions sont en temps musicaux, t(n) (src/tempo.ts), et le son
// ne dépend pas du format de l'image. Les deux compositions ont donc
// exactement la même bande-son, pourvu qu'elles gardent le même découpage.
//
// Deux feuilles de bruitages :
// - SANS musique (public/ n'a ni musique.wav ni musique.mp3) : la feuille
//   d'origine du storyboard (section 6), notes de repère et impact compris.
// - AVEC la musique : la musique joue déjà les notes de repère (note-1 à
//   note-4), l'impact final et toutes les transitions de plan. Il ne reste que
//   des détails d'interface, placés là où la musique n'a pas d'accent
//   semblable au même instant, et réglés 6 à 10 dB sous elle (mesures :
//   musique/mixage.py, explications : musique/LISEZMOI.md, « Mixage »).
//
// La prop `bruitages` (true par défaut) permet de rendre la musique seule,
// pour comparer : npm run rendu -- son (voir scripts/rendre.mjs).

import React from "react";
import { Html5Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { t, VOLUME_EFFETS, VOLUME_MUSIQUE } from "../tempo";
import donnees from "../donnees.json";

export type Son = "whoosh-doux" | "whoosh-court" | "clic" | "tic" | "pop" | "note-1" | "note-2" | "note-3" | "note-4" | "impact-doux";

/** Un bruitage : son temps musical (t(temps) donne l'image de départ), le
 * fichier public/sons/<son>.wav et un gain en dB (0 = niveau du fichier). */
export type Effet = { temps: number; son: Son; gainDb?: number };

/** Nom du fichier de musique dans public/, ou null (scripts/extraire-donnees.mjs). */
export const MUSIQUE: string | null = typeof donnees.musique === "string" ? donnees.musique : null;

// ─── Sans musique : feuille d'origine (STORYBOARD.md, section 6) ─────────────
export const EFFETS_SANS_MUSIQUE: Effet[] = [
  // C1
  { temps: 0, son: "whoosh-doux" },
  { temps: 3, son: "pop" },
  { temps: 4, son: "note-1" },
  // C2
  { temps: 6, son: "clic" },
  { temps: 7, son: "clic" },
  { temps: 8, son: "clic" },
  { temps: 11.2, son: "whoosh-court" },
  // C3
  { temps: 13, son: "clic" },
  { temps: 14, son: "clic" },
  { temps: 15, son: "clic" },
  // le compteur : un tic toutes les 3 images (0,2 temps), de plus en plus discret
  ...Array.from({ length: 8 }, (_, i) => ({ temps: 16 + 0.2 * i, son: "tic" as Son, gainDb: -(6 * i) / 7 })),
  { temps: 17.5, son: "note-2" },
  { temps: 20.5, son: "note-1" },
  { temps: 21.5, son: "note-2" },
  { temps: 22.5, son: "note-3" },
  { temps: 23.33, son: "whoosh-court" },
  // C4
  { temps: 24, son: "whoosh-court" },
  { temps: 26, son: "clic" },
  { temps: 27, son: "note-1" },
  { temps: 28, son: "note-2" },
  { temps: 29, son: "note-3" },
  { temps: 31.33, son: "whoosh-court" },
  // C5
  { temps: 34, son: "clic" },
  { temps: 35, son: "tic" },
  { temps: 36, son: "tic" },
  { temps: 37, son: "tic" },
  { temps: 37.33, son: "whoosh-court" },
  // C6
  { temps: 39, son: "clic" },
  { temps: 40, son: "clic" },
  // C7
  { temps: 42, son: "whoosh-court" },
  { temps: 46, son: "whoosh-doux" },
  { temps: 46.5, son: "clic" },
  { temps: 47.5, son: "note-3" },
  // C8
  { temps: 51, son: "tic" },
  { temps: 52, son: "tic" },
  { temps: 53, son: "tic" },
  { temps: 54, son: "tic" },
  { temps: 55.33, son: "whoosh-court" },
  // C9
  { temps: 56, son: "impact-doux" },
  { temps: 56, son: "note-4" },
];

// ─── Avec la musique ─────────────────────────────────────────────────────────
// Retirés (mesures sur la musique v2, musique/mixage.py --feuille sans) :
// - note-1 à note-4 et impact-doux : la musique les joue (cloche, impact) ;
// - les 8 tics du compteur (16 à 17,4, toutes les 3 images) : ils tombent à
//   25-50 ms des doubles croches, et la grimpée de la musique joue le défilement ;
// - les whooshes de 11,2 ; 23,33 ; 24 ; 31,33 ; 42 ; 46 et 55,33 : masqués (0 à
//   3 dB d'émergence) ou doublés par une transition de la musique (montée,
//   cymbale inversée, souffle inversé, cymbale) ;
// - les clics de 13 et 15 et les tics de 35, 51 et 53 : le clap tombe au même
//   instant. Le clic de 14 et les tics de 52 et 54 restaient seuls au milieu
//   du groove, où ils se liraient comme une percussion de plus : retirés aussi.
//   La musique marque déjà chaque temps (grosse caisse) ;
// - le clic de 46,5 : à l'image 698, il tombe 16,7 ms après le shaker du
//   contretemps (deux coups), et un bruitage ne peut partir qu'au début d'une
//   image. La cymbale de 46 et la cloche de 47,5 portent ce plan.
// Gardés : là où la musique n'a pas d'accent semblable au même instant, et
// réglés pour être 6 à 10 dB sous elle (gainDb).
export const EFFETS_AVEC_MUSIQUE: Effet[] = [
  // C1 : le logo apparaît, puis son point
  { temps: 0, son: "whoosh-doux", gainDb: -9.5 },
  { temps: 3, son: "pop", gainDb: -6.5 },
  // C2 : les trois questions
  { temps: 6, son: "clic", gainDb: 5 },
  { temps: 7, son: "clic", gainDb: 5 },
  { temps: 8, son: "clic", gainDb: 5 },
  // C4 : le filtre « PEA uniquement » bascule
  { temps: 26, son: "clic", gainDb: 10 },
  // C5 : la bande descend la colonne ISIN (le clap de 35 marque la 2e ligne)
  { temps: 34, son: "clic", gainDb: 10 },
  { temps: 36, son: "tic", gainDb: 18 },
  { temps: 37, son: "tic", gainDb: 8 },
  { temps: 37.33, son: "whoosh-court", gainDb: -7.5 },
  // C6 : soulignements de 18,6 % puis de 31,4 %
  { temps: 39, son: "clic", gainDb: 5 },
  { temps: 40, son: "clic", gainDb: 5 },
];

export const EFFETS: Effet[] = MUSIQUE ? EFFETS_AVEC_MUSIQUE : EFFETS_SANS_MUSIQUE;

export type BandeSonProps = {
  /** false : la musique seule, sans aucun bruitage (pour comparer). */
  bruitages?: boolean;
};

export const BandeSon: React.FC<BandeSonProps> = ({ bruitages = true }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      {MUSIQUE ? (
        <Html5Audio
          src={staticFile(MUSIQUE)}
          // Pas de fondu : la musique s'éteint d'elle-même (accord final, puis
          // fondu de mastering sur ses 0,25 dernières secondes). Seul un fondu
          // de sécurité sur les 3 dernières images protège la fin du fichier
          // si un autre morceau, plus long, était posé ici.
          volume={(f) =>
            VOLUME_MUSIQUE *
            interpolate(f, [durationInFrames - 4, durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }
        />
      ) : null}
      {bruitages
        ? EFFETS.map((e, i) => (
            <Sequence key={i} from={t(e.temps)} durationInFrames={45} layout="none" name={e.son}>
              <Html5Audio src={staticFile(`sons/${e.son}.wav`)} volume={VOLUME_EFFETS * Math.pow(10, (e.gainDb ?? 0) / 20)} />
            </Sequence>
          ))
        : null}
    </>
  );
};
