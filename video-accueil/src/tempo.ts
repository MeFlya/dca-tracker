// Calage de la version complète sur la musique.
//
// Toutes les positions de la version complète sont écrites en TEMPS musicaux
// (STORYBOARD.md, section 5) : t(12) = 12e temps. Par défaut, 120 BPM, soit
// 1 temps = 15 images et 60 temps = 30 s.
//
// La musique (public/musique.wav, musique/composer.py) est écrite sur cette
// grille : 120 BPM, premier temps à 0 ms. Pour un autre morceau :
//   npm run sons -- --bpm <tempo> --decalage-ms <début du 1er temps> --tonalite <note>
// puis npm run rendu. Les coupes, les apparitions et les sons se recalent seuls.

import reglages from "./reglages-sons.json";

export const FPS = 30;
export const BPM = reglages.bpm;
/** Image du premier temps (le morceau peut commencer par un court silence). */
export const DECALAGE = Math.round((reglages.decalageMs * FPS) / 1000);

/** Temps musical → numéro d'image. */
export const t = (temps: number) => Math.round(DECALAGE + (temps * FPS * 60) / BPM);

/** 60 temps = 15 mesures. */
export const DUREE_COMPLETE = t(60);

/** Volumes (1 = niveau du fichier).
 * - Musique : public/musique.wav sort du mastering à -16 LUFS et -1,8 dBTP ;
 *   on la garde telle quelle (mélange mesuré par musique/mixage.py).
 * - Bruitages : chacun a son gain dans src/son/BandeSon.tsx ; ce volume les
 *   règle tous à la fois. */
export const VOLUME_EFFETS = 1;
export const VOLUME_MUSIQUE = 1;
