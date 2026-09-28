// Écart de capital final entre deux niveaux de frais — CALCULÉ, jamais écrit.
//
// ─── Pourquoi ce module existe ──────────────────────────────────────────────
//
// Le 2 août 2026, six pages publiaient « 0,18 % de TER en moins = environ
// 4 500 € sur 20 ans à 200 €/mois ». Le moteur du site répond 2 024 €. Le même
// 4 500 € servait aussi de réponse à un écart de 0,23 point (2 595 € en
// réalité), et « ~750 € » à un écart de 0,03 point (344 €). Le plus exposé
// était dans une meta description, donc affiché dans les résultats de
// recherche.
//
// Ce n'étaient pas trois fautes de frappe mais UNE SEULE classe de défaut :
// un nombre que le site sait calculer, recopié à la main dans une chaîne de
// caractères. Le jour où le moteur, les hypothèses ou les taux bougent, la
// prose ne bouge pas — elle ne peut pas. C'est le même mécanisme que les
// dizaines d'emplacements qui répètent les anciens taux fiscaux à côté d'un
// moteur fiscal pourtant centralisé.
//
// ─── La règle, et pourquoi elle est formulée comme ça ───────────────────────
//
// AUCUN NOMBRE QUE LE MOTEUR SAIT PRODUIRE NE DOIT ÊTRE RÉDIGÉ À LA MAIN.
//
// Le réflexe naturel serait d'écrire un script qui détecte les montants en
// euros dans le texte et les recalcule. C'est une mauvaise idée : un détecteur
// qui rate une occurrence rassure sans protéger, et ce projet sait ce que
// coûte une vérification qui donne un faux feu vert. On prend donc l'autre
// voie — ne plus jamais ÉCRIRE ces nombres, mais les RÉFÉRENCER. Un nombre
// interpolé depuis `runSimulation` ne peut pas diverger du moteur : il EST le
// moteur.
//
// Le garde-fou complémentaire (scripts/check-montants-calcules.mjs) ne cherche
// donc pas à deviner l'intention d'un nombre. Il tient un inventaire des
// montants encore écrits à la main dans les fichiers de contenu et refuse
// qu'il en apparaisse de nouveaux — le même cliquet que la dette de
// descriptions SEO, qui ne peut que décroître.

import { runSimulation } from "@/lib/simulator";

/**
 * Les hypothèses affichées par les pages de comparaison ETF.
 *
 * Elles sont ici parce que la prose les ÉNONCE (« sur 20 ans à 200 €/mois et
 * 7 %/an ») : si elles changent un jour, le texte et le calcul doivent bouger
 * ensemble, ce qui n'est vrai que s'ils lisent la même source.
 */
export const HYPOTHESES_COMPARATIFS = {
  monthlyAmount: 200,
  durationYears: 20,
  annualReturnPct: 7,
} as const;

/** Capital final pour un TER donné, sous les hypothèses ci-dessus. */
function capitalFinal(terPct: number, hyp = HYPOTHESES_COMPARATIFS): number {
  return runSimulation({ ...hyp, annualFeesPct: terPct }).base.finalValue;
}

/**
 * Arrondi « environ » : à la centaine au-dessus de 1 000 €, à la dizaine en
 * dessous. Une précision à l'euro près sur une projection à vingt ans serait
 * une fausse précision — et le texte qui l'entoure dit « environ ».
 */
function arrondirEnviron(v: number): number {
  const pas = Math.abs(v) >= 1000 ? 100 : 10;
  return Math.round(v / pas) * pas;
}

/** 2000 → « 2 000 ». Séparateur de milliers en espace, comme le reste du site. */
function formaterEuros(v: number): string {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Écart de capital final entre deux niveaux de frais, formaté pour la prose.
 *
 * `ecartCapital(0.38, 0.20)` → « 2 000 » (à insérer avant « € »).
 * L'ordre des arguments est libre : on renvoie toujours la valeur absolue,
 * puisque la phrase dit « X € d'écart » ou « X € de plus ».
 *
 * @param terA  TER d'un côté, en points de pourcentage (0.38 = 0,38 %)
 * @param terB  TER de l'autre côté
 */
export function ecartCapital(
  terA: number,
  terB: number,
  hyp = HYPOTHESES_COMPARATIFS
): string {
  const brut = Math.abs(capitalFinal(terB, hyp) - capitalFinal(terA, hyp));
  return formaterEuros(arrondirEnviron(brut));
}

/**
 * Capital final pour un TER donné, formaté. `capitalPour(0.2)` → « 99 800 ».
 *
 * C'est ici qu'était la RACINE du 4 500 €. Le glossaire écrivait « avec un TER
 * de 0,20 %, capital final ≈ 102 000 € ; avec 0,38 %, ≈ 97 500 € » — or
 * 102 000 € est le capital SANS AUCUN FRAIS. L'écart annoncé comparait donc
 * 0,38 % à zéro, pas à 0,20 %, ce qui double le résultat. Une seule ligne
 * fausse a essaimé sur six pages et jusque dans les résultats de recherche.
 * Arrondi à la centaine : « ≈ » ne promet pas l'euro près.
 */
export function capitalPour(terPct: number, hyp = HYPOTHESES_COMPARATIFS): string {
  return formaterEuros(arrondirEnviron(capitalFinal(terPct, hyp)));
}

/**
 * Ce qu’un TER coûte sur la période, par rapport à des frais nuls — la ligne
 * « Impact TER sur 20 ans » des tableaux de comparaison. Signe négatif inclus.
 *
 * `coutFrais(0.38)` → « −4 300 »
 *
 * Cette ligne portait « −7 400 € » pour CW8 et « −2 900 € » pour ESE comme
 * pour WPEA — le même nombre pour deux TER différents, et tous deux faux.
 * C’est le format le plus vérifiable d’une page : un tableau annonce ses
 * hypothèses entre parenthèses, donc n’importe quel lecteur peut refaire le
 * calcul. Raison de plus pour qu’il vienne du moteur.
 */
export function coutFrais(terPct: number, hyp = HYPOTHESES_COMPARATIFS): string {
  const brut = capitalFinal(terPct, hyp) - capitalFinal(0, hyp);
  return `−${formaterEuros(arrondirEnviron(Math.abs(brut)))}`;
}

/**
 * Plus-value latente pour un TER donné : capital final moins total versé.
 *
 * Existe parce que deux pages posaient « capital final ≈ 102 000 €, dont
 * ≈ 54 000 € de gains » — deux nombres liés, écrits séparément, dont l'un
 * était en réalité le capital AVANT frais. Les faire calculer ensemble
 * garantit que la soustraction reste vraie.
 */
export function gainsPour(terPct: number, hyp = HYPOTHESES_COMPARATIFS): string {
  const { finalValue, totalInvested } = runSimulation({
    ...hyp,
    annualFeesPct: terPct,
  }).base;
  return formaterEuros(arrondirEnviron(finalValue - totalInvested));
}

/**
 * Frais d'ordre payés sur la période quand chaque versement mensuel supporte
 * le même frais fixe : frais × 12 × durée. `fraisOrdrePayes(1)` → « 240 ».
 *
 * Ce n'est pas une projection, juste une multiplication — mais elle lit la
 * même durée que la prose qui l'entoure (« sur 20 ans »), donc elle suit si
 * l'hypothèse change.
 */
export function fraisOrdrePayes(
  fraisParOrdre: number,
  hyp = HYPOTHESES_COMPARATIFS
): string {
  return formaterEuros(fraisParOrdre * 12 * hyp.durationYears);
}

/**
 * Capital final en moins quand un frais d'ordre fixe est prélevé sur chaque
 * versement mensuel (il reste « mensuel − frais » à investir), au TER donné.
 * `coutFraisOrdre(1, 0.38)` → « 490 » : 240 € de frais payés, plus ce que ces
 * frais auraient rapporté s'ils avaient été investis.
 *
 * Ajouté le 28/09/2026 : les fiches courtiers annonçaient « 3 000 à 5 000 € »
 * puis « des milliers d'euros » d'économies pour 1 € par ordre de 200 € sur
 * 20 ans. Le moteur répond environ 490 € (fait BT-33 du dossier de
 * vérification) : un facteur 6 à 10 d'écart, écrit à la main.
 */
export function coutFraisOrdre(
  fraisParOrdre: number,
  terPct: number,
  hyp = HYPOTHESES_COMPARATIFS
): string {
  const plein = runSimulation({ ...hyp, annualFeesPct: terPct }).base.finalValue;
  const ampute = runSimulation({
    ...hyp,
    monthlyAmount: hyp.monthlyAmount - fraisParOrdre,
    annualFeesPct: terPct,
  }).base.finalValue;
  return formaterEuros(arrondirEnviron(plein - ampute));
}

/**
 * Gains en NOMBRE, pour les calculs d'impôt — mêmes hypothèses que gainsPour.
 *
 * Ajouté le 28/09/2026 : plusieurs comparatifs calculaient l'écart fiscal sur
 * un gain de 54 000 € écrit à la main, alors que la même phrase affichait les
 * gains calculés par le moteur (≈ 56 200 € avant frais). Deux chiffres pour la
 * même chose, dans la même phrase. L'impôt se calcule désormais sur le gain que
 * la page affiche, au TER de l'ETF concerné.
 */
export function gainsBruts(terPct: number, hyp = HYPOTHESES_COMPARATIFS): number {
  const { finalValue, totalInvested } = runSimulation({
    ...hyp,
    annualFeesPct: terPct,
  }).base;
  return finalValue - totalInvested;
}
