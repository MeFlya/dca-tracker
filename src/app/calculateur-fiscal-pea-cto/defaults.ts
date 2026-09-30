import { TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";

/**
 * Valeurs de départ du calculateur fiscal.
 *
 * Sorties de CalculatorClient.tsx le 30/09/2026 : la page affiche aussi un
 * « exemple concret » écrit à la main (102 000 €, 54 000 € de gains, 6 912 €
 * d'écart), calculé sans frais, alors que le calculateur, juste au-dessus,
 * s'ouvre avec 0,38 % de frais et affiche un autre écart. Deux réponses à la
 * même question sur la même page. L'exemple est désormais calculé par le même
 * moteur, sur ces mêmes valeurs : il ne peut plus contredire le calculateur.
 *
 * Module à part, et non export du composant : un fichier "use client" ne
 * transmet pas ses constantes à une page serveur.
 */
export const DEFAULTS_CALCULATEUR = {
  monthlyAmount: 200,
  durationYears: 20,
  annualReturnPct: 7,
  annualFeesPct: TER_REFERENCE_SIMULATEUR, // même référence que le simulateur (28/09/2026)
};
