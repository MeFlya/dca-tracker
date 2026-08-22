import type { SimulatorInput } from "./simulator";

/**
 * Les clés de fonctionnalité que /upgrade sait rendre.
 *
 * ⚠️ ELLE VIT ICI, PAS DANS LA PAGE, et c'est délibéré. Tant que
 * `buildUpgradeUrl` acceptait un `string`, une clé inexistante compilait sans
 * broncher et la page retombait en silence sur son argumentaire par défaut.
 * C'est arrivé : le bouton « Comparer mes deux scénarios » du simulateur
 * émettait `feature=comparison` au lieu de `ab-comparison`, et servait au
 * visiteur une page entièrement consacrée à la volatilité — au moment précis
 * où il cliquait pour comparer deux stratégies.
 *
 * Le défaut ne pouvait pas se voir : l'URL était bien formée, la page
 * répondait 200, et le repli avait l'air d'un choix. Typer l'argument est ce
 * qui transforme cette faute en erreur de compilation.
 */
export const FEATURE_KEYS = [
  "monte-carlo",
  "save-strategy",
  "pdf-export",
  "ab-comparison",
  "recap-fiscal",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Vrai si la chaîne est une clé que /upgrade sait rendre. */
export function estCleConnue(v: string): v is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(v);
}

/**
 * Build a URL to /upgrade that preserves the user's current simulator params.
 * This lets the upgrade page show per-user projection (their Monte Carlo,
 * their theoretical value at month 12) instead of generic examples.
 */
export function buildUpgradeUrl(
  feature: FeatureKey,
  input?: SimulatorInput,
): string {
  const params = new URLSearchParams({ feature });
  if (input) {
    params.set("monthly", String(input.monthlyAmount));
    params.set("years", String(input.durationYears));
    params.set("return", String(input.annualReturnPct));
    params.set("fees", String(input.annualFeesPct));
  }
  return `/upgrade?${params.toString()}`;
}
