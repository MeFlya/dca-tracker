// Geometric Brownian Motion Monte Carlo for DCA simulations.
// Runs N_SCENARIOS independent paths and returns annual percentile bands.
//
// ⚠️ SERVEUR UNIQUEMENT — et c'est le cœur du verrou, pas une précaution.
//
// Ce module tournait dans le navigateur de TOUS les visiteurs : le résultat
// complet partait dans le JS de la page et n'était masqué que par une classe
// CSS `blur-sm`. Retirer la classe dans les outils de développement suffisait à
// tout lire. Le contrôle du plan, lui, se faisait via useUser() côté client,
// donc falsifiable.
//
// L'import de `server-only` fait ÉCHOUER LE BUILD si quelqu'un réimporte ce
// fichier depuis un composant client. C'est un garde-fou vérifié à la
// compilation, pas une discipline qu'on espère tenir — même philosophie que le
// contrôle de longueur des titres et le fail-closed des crons.
//
// Le simulateur passe désormais par /api/simulator/monte-carlo, qui lit le plan
// côté serveur et ne renvoie au plan gratuit qu'UNE seule valeur.
import "server-only";

import type { SimulatorInput } from "./simulator";

export interface MonteCarloDataPoint {
  year: number;
  p10: number;   // 10th percentile — pire cas réaliste
  p50: number;   // médiane
  p90: number;   // 90th percentile — meilleur cas réaliste
  invested: number;
}

export interface MonteCarloResult {
  data: MonteCarloDataPoint[];
  finalP10: number;
  finalP50: number;
  finalP90: number;
  probabilityPositive: number; // % des scénarios où portefeuille > capital investi
}

const N_SCENARIOS = 1000;

// ─── Générateur DÉTERMINISTE ─────────────────────────────────────────────────
//
// L'ancienne version utilisait Math.random(), donc le résultat changeait à
// chaque appel. Tant que tout était masqué derrière un flou, ça ne se voyait
// pas. Depuis que le plan gratuit reçoit UN chiffre mis en avant — « votre pire
// cas réaliste : 104 216 € » — ce n'est plus acceptable :
//   · le chiffre changerait à chaque rechargement, sur un site dont l'argument
//     est « formules vérifiables, hypothèses transparentes » ;
//   · l'acheteur verrait une autre valeur APRÈS avoir payé, ce qui est la pire
//     impression possible ;
//   · et une réponse non déterministe n'est pas cachable.
//
// mulberry32, amorcé par les paramètres d'entrée : mêmes paramètres → mêmes
// chiffres, toujours. Ce n'est pas un affaiblissement statistique — la qualité
// requise ici est celle d'une simulation, pas d'une clé cryptographique.

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Amorce stable dérivée des paramètres — pas de l'horloge. */
function seedFrom(input: SimulatorInput, volatilityPct: number): number {
  const key = [
    input.monthlyAmount,
    input.durationYears,
    input.annualReturnPct,
    input.annualFeesPct,
    input.startingCapital ?? 0,
    volatilityPct,
  ].join("|");
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Box-Muller: produces standard normal samples from two uniform draws
function makeRandn(rand: () => number): () => number {
  return function randn(): number {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };
}

function percentile(sorted: number[], p: number): number {
  return sorted[Math.floor(p * sorted.length)];
}

export function runMonteCarlo(
  input: SimulatorInput,
  volatilityPct = 15 // historical ETF annual volatility — ~15% for MSCI World
): MonteCarloResult {
  const randn = makeRandn(mulberry32(seedFrom(input, volatilityPct)));
  const { monthlyAmount, durationYears, annualReturnPct, annualFeesPct } = input;
  const netAnnualReturn = (annualReturnPct - annualFeesPct) / 100;
  const totalMonths = durationYears * 12;

  // GBM monthly parameters
  const annualSigma = volatilityPct / 100;
  const monthlySigma = annualSigma / Math.sqrt(12);
  // Drift: log(1+R)/12 - σ²/2 ensures the expected annual compound = R
  const drift = Math.log(1 + netAnnualReturn) / 12 - (monthlySigma * monthlySigma) / 2;

  // yearlyValues[yearIdx][scenarioIdx]
  const yearlyValues: Float64Array[] = Array.from(
    { length: durationYears },
    () => new Float64Array(N_SCENARIOS)
  );

  for (let s = 0; s < N_SCENARIOS; s++) {
    let portfolio = 0;
    for (let m = 1; m <= totalMonths; m++) {
      const monthlyReturn = Math.exp(drift + monthlySigma * randn()) - 1;
      portfolio = (portfolio + monthlyAmount) * (1 + monthlyReturn);
      if (m % 12 === 0) {
        yearlyValues[m / 12 - 1][s] = portfolio;
      }
    }
  }

  const data: MonteCarloDataPoint[] = yearlyValues.map((vals, i) => {
    const sorted = Array.from(vals).sort((a, b) => a - b);
    return {
      year: i + 1,
      p10: Math.round(percentile(sorted, 0.1)),
      p50: Math.round(percentile(sorted, 0.5)),
      p90: Math.round(percentile(sorted, 0.9)),
      invested: Math.round(monthlyAmount * (i + 1) * 12),
    };
  });

  const finalSorted = Array.from(yearlyValues[durationYears - 1]).sort((a, b) => a - b);
  const totalInvested = monthlyAmount * totalMonths;

  return {
    data,
    finalP10: Math.round(percentile(finalSorted, 0.1)),
    finalP50: Math.round(percentile(finalSorted, 0.5)),
    finalP90: Math.round(percentile(finalSorted, 0.9)),
    probabilityPositive: Math.round(
      (Array.from(yearlyValues[durationYears - 1]).filter((v) => v > totalInvested).length /
        N_SCENARIOS) *
        100
    ),
  };
}
