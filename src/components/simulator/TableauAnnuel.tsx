"use client";

import Link from "next/link";
import { SimulatorOutput, formatEur } from "@/lib/simulator";

/**
 * Le détail année par année de la simulation en cours.
 *
 * ─── Pourquoi ce tableau existe ─────────────────────────────────────────────
 *
 * Search Console, 28 derniers jours au 25/09/2026 : /simulateur est en position
 * 4,8 sur « simulateur dca » et entre 3,8 et 5,2 sur ses variantes — pour une
 * poignée de clics. Les pages placées devant ont toutes ce que celle-ci n'avait
 * pas : un tableau année par année, gratuit, lisible sans toucher un curseur.
 * C'est aussi ce que le lecteur recopie, compare et revient consulter.
 *
 * Le tableau suit l'état du simulateur (il se met à jour avec les curseurs) et
 * il est rendu dès le serveur avec la simulation initiale : il est donc dans le
 * HTML que lit Google, pas seulement dans celui que voit un navigateur.
 *
 * ⚠️ Aucun chiffre n'est écrit ici : tout vient de runSimulation, le même moteur
 * que le résultat affiché au-dessus. Un tableau qui dirait autre chose que le
 * graphique serait pire que pas de tableau.
 */

/** Montants qui ont leur page détaillée — le tableau y renvoie quand il tombe dessus. */
const PAGES_MONTANT = [100, 200, 300, 500] as const;

export function TableauAnnuel({ output }: { output: SimulatorOutput }) {
  const { input, base } = output;

  // Un point par année : le dernier mois de chaque année de la simulation.
  const annees = base.monthlyData.filter((p) => p.month % 12 === 0);
  if (annees.length === 0) return null;

  // Au-delà de 15 lignes, on garde les 5 premières, puis une année sur cinq, et
  // toujours la dernière : c'est ce que le lecteur cherche, et un tableau de
  // 40 lignes ne se lit pas sur un téléphone.
  const lignes =
    annees.length <= 15
      ? annees
      : annees.filter(
          (p, i) => i < 5 || p.year % 5 === 0 || i === annees.length - 1,
        );

  const pageDuMontant = PAGES_MONTANT.find((m) => m === input.monthlyAmount);
  const fraisPct = input.annualFeesPct.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });
  const rendementPct = input.annualReturnPct.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });

  return (
    <section
      aria-labelledby="tableau-annuel-titre"
      className="card"
    >
      <h2
        id="tableau-annuel-titre"
        className="text-lg font-bold text-gray-900 mb-1"
      >
        Votre simulation année par année
      </h2>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
        {formatEur(input.monthlyAmount)} versés en début de mois, rendement de{" "}
        {rendementPct} % par an dont on retranche {fraisPct} % de frais.
        Scénario central, en euros courants.
      </p>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th scope="col" className="py-2 px-1 font-semibold">Année</th>
              <th scope="col" className="py-2 px-1 font-semibold text-right">Versé</th>
              <th scope="col" className="py-2 px-1 font-semibold text-right">Valeur estimée</th>
              <th scope="col" className="py-2 px-1 font-semibold text-right">Plus-value</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((p) => (
              <tr key={p.year} className="border-b border-gray-50 last:border-0">
                <th scope="row" className="py-2 px-1 text-left font-medium text-gray-700">
                  {p.year}
                </th>
                <td className="py-2 px-1 text-right text-gray-600">
                  {formatEur(p.invested)}
                </td>
                <td className="py-2 px-1 text-right font-semibold text-gray-900">
                  {formatEur(p.portfolioValue)}
                </td>
                <td className="py-2 px-1 text-right text-emerald-700">
                  {formatEur(p.gain)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Projection à rendement constant : un vrai marché ne monte pas en ligne
        droite.{" "}
        <Link href="/backtest" className="text-primary-700 font-medium hover:underline">
          Ce que ce DCA aurait donné sur les vrais cours, krach de 2008 compris
        </Link>
        {pageDuMontant ? (
          <>
            {" "}·{" "}
            <Link
              href={`/investir-${pageDuMontant}-euros-mois-etf`}
              className="text-primary-700 font-medium hover:underline"
            >
              Le guide complet {pageDuMontant} €/mois
            </Link>
          </>
        ) : null}
      </p>
    </section>
  );
}
