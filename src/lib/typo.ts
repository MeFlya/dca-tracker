// Typographie française des textes produit, appliquée AU RENDU.
//
// Les chaînes de `products.ts` ne changent pas (elles nourrissent aussi les
// métadonnées et le JSON-LD, qu'on ne touche pas) : seul le texte affiché
// reçoit ses espaces insécables, pour qu'aucune ligne ne commence par « : »,
// « € » ou « 000 » (constats du 01/10/2026 : « où verser / : combien »,
// « plafond de 150 / 000 € », « cap des 5 / ans », « pré- / câblées »).

import { createElement, Fragment, type ReactNode } from "react";

const NBSP = "\u00a0";

/** Unités qui ne se séparent jamais de leur nombre. */
const UNITES = "€|%|ans?|jours?|pages?|mois|minutes?|onglets?|lignes?|ETF|pts?";

export function typo(texte: string): string {
  let t = texte
    // Avant la ponctuation haute et le guillemet fermant, après l'ouvrant.
    .replace(/ (?=[:;?!»])/g, NBSP)
    .replace(/« /g, `«${NBSP}`)
    // Nombre et unité : « 5 ans », « 300 € », « 18,6 % ».
    .replace(new RegExp(`(\\d) (?=(?:${UNITES})(?![\\p{L}\\d]))`, "gu"), `$1${NBSP}`)
    // « version 1.1 » : le numéro ne commence jamais une ligne (relecture DA
    // du 01/10/2026, « 1.1 » seul en début de ligne à 375 px).
    .replace(/\b([Vv]ersion) (?=\d)/g, `$1${NBSP}`)
    // Trait d'union insécable dans les mots qui se coupaient mal.
    .replace(/\bpré-/g, "pré‑");
  // Milliers : « 150 000 », « 1 000 000 » (boucle : les groupes se chevauchent).
  const milliers = /(\d) (\d{3})(?!\d)/g;
  while (milliers.test(t)) t = t.replace(milliers, `$1${NBSP}$2`);
  return t;
}

/**
 * `typo()`, plus l'ordinal en exposant : « 1er octobre » → 1<sup>er</sup>
 * (et 1re). Pour les textes rendus en JSX ; les attributs (alt, JSON-LD)
 * gardent « 1er », qu'aucun exposant ne peut porter.
 */
export function typoRiche(texte: string): ReactNode {
  const morceaux = typo(texte).split(/\b1(er|re)\b/);
  if (morceaux.length === 1) return morceaux[0];
  return createElement(
    Fragment,
    null,
    ...morceaux.map((m, i) => (i % 2 === 1 ? createElement(Fragment, { key: i }, "1", createElement("sup", null, m)) : m)),
  );
}
