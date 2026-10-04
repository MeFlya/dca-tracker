// Courbe « Base » du graphique du simulateur (capture simulateur-bureau-graphique.png).
//
// Sert à deux choses, dans les deux vidéos :
//   - poser le marqueur sur la pointe de la courbe pendant qu'elle se découvre ;
//   - faire défiler le compteur au rythme du tracé.
// Le compteur finit TOUJOURS sur la valeur lue sur le site (donnees.json) : la
// formule ci-dessous est recalée sur elle, elle ne produit aucun chiffre affiché
// à l'arrêt.

import donnees from "./donnees.json";
import { Z } from "./zones";

const nombre = (s: string) => Number(s.replace(/[^\d,]/g, "").replace(",", "."));
const HYPOTHESE = nombre(donnees.simulateur.hypothese);
const FRAIS = nombre(donnees.simulateur.fraisDefaut);
export const HYPOTHESE_AFFICHEE = String(HYPOTHESE).replace(".", ",");

/** Valeur de la courbe à n années (versements en début de mois, rendement net
 * de frais), recalée pour valoir exactement la valeur du site à la durée du site. */
export function valeurBase(n: number) {
  const r = Math.pow(1 + (HYPOTHESE - FRAIS) / 100, 1 / 12) - 1;
  const A = (k: number) => ((Math.pow(1 + r, 12 * k) - 1) / r) * (1 + r);
  return (donnees.simulateur.valeurFinale * A(n)) / A(donnees.simulateur.dureeAns);
}

/**
 * Pointe de la courbe quand le cache qui la découvre a son bord gauche en
 * `xBord` (pixels du PNG). Renvoie l'année, la position (pixels du PNG) et la
 * valeur à afficher par le compteur.
 */
export function pointe(xBord: number) {
  const g = Z.graphique;
  const xc = Math.min(g.x20ans, Math.max(g.x1an, xBord));
  const n = 1 + ((xc - g.x1an) / (g.x20ans - g.x1an)) * (donnees.simulateur.dureeAns - 1);
  const v = valeurBase(n);
  const y = g.y0 - (v / 1000) * g.pxParKEur;
  // Avant la première année, le compteur part de 0.
  const depart = Math.min(1, Math.max(0, (xBord - g.trace[0]) / (g.x1an - g.trace[0])));
  const fini = xBord >= g.trace[2];
  return { n, x: xc, y, compteur: fini ? donnees.simulateur.valeurFinale : v * depart };
}
