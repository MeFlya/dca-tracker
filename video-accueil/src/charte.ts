// Charte de dcatracker.fr, reprise telle quelle (règle de Maël : jamais de logo
// ni de style inventé).
//   Couleurs : tailwind.config.ts du site + palette Tailwind 3.4 (slate, gray,
//              indigo, sky, emerald) pour les classes utilisées par le site.
//   Polices  : Inter (texte) et Newsreader (titres), comme app/layout.tsx.
//   Mouvement: jetons de globals.css (--ease-out-expo, --ease-out-quart,
//              --ease-in-out). Pas de rebond, d'élastique, de glitch ni de néon.

import { Easing, interpolate } from "remotion";
import { loadFont as chargerInter } from "@remotion/google-fonts/Inter";
import { loadVariableFont as chargerNewsreader } from "@remotion/google-fonts/Newsreader";

// Inter : graisses statiques (le site charge Inter sans axe optique).
export const INTER = chargerInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily;
// Newsreader : variable, axe optique compris (le site le garde : axes ["opsz"]).
export const NEWSREADER = chargerNewsreader("normal", { subsets: ["latin"] }).fontFamily;

export const C = {
  // primary (tailwind.config.ts)
  bleu50: "#eff6ff",
  bleu100: "#dbeafe",
  bleu300: "#93c5fd",
  bleu400: "#60a5fa",
  bleu500: "#3b82f6",
  bleu: "#1d4ed8", // primary-600, couleur de marque
  bleu700: "#1e40af",
  // slate (sections sombres de l'accueil, /tarifs, Cockpit)
  fond: "#020617", // slate-950
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  blanc: "#ffffff",
  // nom du logo (LogoWordmark)
  gris900: "#111827",
  gris500: "#6b7280",
  // gains (coches de /tarifs sur fond sombre)
  emeraude400: "#34d399",
  // halo de TrackingPitch : primary-500/30 → indigo-400/20 → sky-400/20
  indigo400: "#818cf8",
  sky400: "#38bdf8",
} as const;

/** Ombre `shadow-card-lg` du site. */
export const OMBRE_CARTE = "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)";

export const EASE = {
  expo: Easing.bezier(0.16, 1, 0.3, 1),
  quart: Easing.bezier(0.25, 1, 0.5, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

/** interpolate borné aux deux bouts, avec une courbe. */
export function anim(
  frame: number,
  debut: number,
  fin: number,
  de: number,
  a: number,
  courbe: (t: number) => number = EASE.quart
): number {
  if (fin <= debut) return frame >= fin ? a : de;
  return interpolate(frame, [debut, fin], [de, a], {
    easing: courbe,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Progression 0 → 1 entre deux images. */
export const prog = (frame: number, debut: number, fin: number, courbe = EASE.quart) =>
  anim(frame, debut, fin, 0, 1, courbe);

export const NBSP = " ";
export const NNBSP = " ";

/** 97753 → « 97 753 € », espaces comme sur le site (U+202F, U+00A0). */
export function euros(n: number): string {
  return `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP)}${NBSP}€`;
}
