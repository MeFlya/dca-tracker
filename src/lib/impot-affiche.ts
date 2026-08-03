// Montants d'impôt affichés dans la prose — CALCULÉS, jamais écrits.
//
// Pendant du module ecart-frais.ts, pour l'autre moteur. Celui-là couvre les
// montants qui dépendent des TAUX FISCAUX, et il existe pour la même raison :
// le 2 août 2026, corriger 17,2 % en 18,6 % dans le contenu a laissé derrière
// lui six montants en euros calculés sur l'ancien taux — « 54 000 × 18,6 % =
// 9 288 € », arithmétiquement faux dans la même phrase que le taux juste. Une
// page qui se contredit à l'intérieur d'une seule ligne est pire qu'une page
// périmée.
//
// La règle est la même : un nombre que le moteur sait produire ne se rédige
// pas. Interpolé depuis le barème, il suit la prochaine loi de finances tout
// seul — et il n'y aura pas de prochaine passe de correction manuelle.
//
// Les taux, eux, viennent de BAREMES_CAPITAL dans fiscal/pea-cto.ts, qui porte
// les sources (LFSS 2026 art. 12, art. 200 A CGI) et la liste des produits qui
// restent à 17,2 %.

import { PFU_RATE, SOCIAL_CHARGES_RATE } from "@/lib/fiscal/pea-cto";

/** 10044 → « 10 044 ». Séparateur de milliers en espace, comme le reste du site. */
function formater(v: number): string {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Arrondi « environ », pour les phrases qui écrivent « ≈ ». À la centaine
 * au-dessus de 1 000 €. Une projection à vingt ans ne se donne pas à l'euro.
 */
function environ(v: number): number {
  return Math.round(v / 100) * 100;
}

/** Prélèvements sociaux sur un gain de PEA détenu plus de 5 ans. */
export function impotPEA(gain: number): string {
  return formater(gain * SOCIAL_CHARGES_RATE);
}

/** PFU sur un gain de compte-titres ordinaire. */
export function impotCTO(gain: number): string {
  return formater(gain * PFU_RATE);
}

/** Les mêmes, arrondis à la centaine, pour les phrases en « ≈ ». */
export function impotPEAEnviron(gain: number): string {
  return formater(environ(gain * SOCIAL_CHARGES_RATE));
}

export function impotCTOEnviron(gain: number): string {
  return formater(environ(gain * PFU_RATE));
}

/**
 * Écart d'imposition entre CTO et PEA sur le même gain — l'argument éditorial
 * le plus visible du site.
 *
 * Remarquable et contre-intuitif : il ne bouge PAS avec la réforme 2026.
 * 31,4 − 18,6 = 12,8 comme 30 − 17,2 = 12,8, la part d'impôt sur le revenu du
 * PFU étant inchangée. Sur 54 000 € de gains, l'écart reste 6 912 €. Raison de
 * plus pour le calculer : quelqu'un qui verrait ce nombre survivre à une
 * correction générale des taux le croirait oublié.
 */
export function ecartFiscal(gain: number): string {
  return formater(gain * (PFU_RATE - SOCIAL_CHARGES_RATE));
}

/** Valeur nette après impôt, pour les phrases « → net X € ». */
export function netApresPEA(capital: number, gain: number): string {
  return formater(capital - gain * SOCIAL_CHARGES_RATE);
}

export function netApresCTO(capital: number, gain: number): string {
  return formater(capital - gain * PFU_RATE);
}

/** L'écart, arrondi à la centaine, pour les phrases en « ≈ » ou « ~ ». */
export function ecartFiscalEnviron(gain: number): string {
  return formater(environ(gain * (PFU_RATE - SOCIAL_CHARGES_RATE)));
}
