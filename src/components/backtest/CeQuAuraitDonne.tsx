import Link from "next/link";
import { runBacktest, getAvailableRange, getDatasetMeta } from "@/lib/backtest";
import { paramsFromSearch } from "@/lib/simulation-params";
import { formatEur } from "@/lib/simulator";

/**
 * « Ce qu'auraient réellement donné N €/mois » — sur les vrais cours, pas sur
 * un rendement constant.
 *
 * ─── Pourquoi ce bloc existe ────────────────────────────────────────────────
 *
 * Toutes les pages concurrentes sur « investir N euros par mois » projettent à
 * taux constant (audit du 28/09/2026 : invesse, avenuedesinvestisseurs,
 * les-investisseurs-affranchis, arbolyo). Aucune ne montre ce qu'un montant
 * mensuel AURAIT DONNÉ. Le site a la série mensuelle réelle d'un ETF MSCI World
 * en euros depuis janvier 2008 et le moteur de backtest : c'est le seul contenu
 * de la page que personne d'autre ne peut écrire.
 *
 * C'est aussi la réponse au « zéro clic » : la description de ces pages donnait
 * la projection dans l'extrait Google lui-même. Ce bloc est ce que l'extrait ne
 * peut pas livrer.
 *
 * ─── Les choix qui empêchent de choisir son résultat ────────────────────────
 *
 * · CINQ dates de départ, dont les deux pires moments pour commencer : janvier
 *   2008, juste avant le krach, et janvier 2022, juste avant la baisse de
 *   l'année. Ne montrer que 2012 serait vendre la période la plus flatteuse.
 * · La colonne « au pire moment » ne mesure PAS la baisse de valeur d'un
 *   sommet à un creux. Cette mesure-là, versements compris, masque les pertes
 *   du début : pour un départ en 2008 elle retient la baisse du Covid (−18 %)
 *   au lieu de février 2009, où le portefeuille valait 25,7 % de moins que ce
 *   qui avait été versé. On affiche l'écart entre la valeur et le total versé,
 *   parce que c'est ce que l'épargnant voit sur son relevé.
 * · Aucun chiffre écrit à la main : tout vient de runBacktest, sur la série
 *   publiée, jusqu'au dernier mois disponible. Le cron mensuel met la série à
 *   jour ; le bloc suit au déploiement suivant.
 */

const DEPARTS = [
  { mois: "2008-01", repere: "juste avant le krach de 2008" },
  { mois: "2012-01", repere: "" },
  { mois: "2016-01", repere: "" },
  { mois: "2020-01", repere: "juste avant le Covid" },
  { mois: "2022-01", repere: "juste avant la baisse de 2022" },
] as const;

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const libelleMois = (ym: string) => {
  const [a, m] = ym.split("-").map(Number);
  return `${MOIS_FR[m - 1]} ${a}`;
};
// Signe moins typographique (U+2212) plutôt que le tiret de toLocaleString.
const pct = (v: number, d = 1) =>
  v
    .toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d })
    .replace(/^-/, "−");

export function CeQuAuraitDonne({ monthlyAmount }: { monthlyAmount: number }) {
  const { min, max } = getAvailableRange();
  const meta = getDatasetMeta();
  const hypothese = paramsFromSearch(new URLSearchParams()).input.annualReturnPct;

  const lignes = DEPARTS.filter((d) => d.mois >= min && d.mois < max).map((d) => {
    const r = runBacktest({ monthlyAmount, startMonth: d.mois, endMonth: max });
    // Le pire écart entre la valeur du portefeuille et ce qui a été versé.
    let pire = { ecart: 0, mois: "" };
    for (const p of r.series) {
      const e = p.invested > 0 ? p.value / p.invested - 1 : 0;
      if (e < pire.ecart) pire = { ecart: e, mois: p.month };
    }
    return { ...d, r, pire };
  });
  if (lignes.length === 0) return null;

  const tris = lignes.map((l) => l.r.irrAnnualPct).filter((v): v is number => v != null);
  const toutesAuDessus = tris.length > 0 && tris.every((t) => t > hypothese);

  return (
    <section aria-labelledby="ce-qu-aurait-donne" className="mb-10">
      <h2 id="ce-qu-aurait-donne" className="text-xl font-bold text-gray-900 mb-2">
        Ce qu&apos;auraient réellement donné {formatEur(monthlyAmount)} par mois
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        La projection ci-dessus suppose un marché qui monte en ligne droite. Voici
        le même effort mensuel rejoué sur les vrais cours d&apos;un ETF MSCI World
        en euros, jusqu&apos;en {libelleMois(max)}, selon l&apos;année où l&apos;on
        aurait commencé. Ce n&apos;est pas une projection : c&apos;est ce qui
        s&apos;est passé.
      </p>

      <div className="overflow-x-auto -mx-1 rounded-xl border border-gray-100">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-gray-50/60">
              <th scope="col" className="py-2 px-2 font-semibold">Départ</th>
              <th scope="col" className="py-2 px-2 font-semibold text-right">Versé</th>
              <th scope="col" className="py-2 px-2 font-semibold text-right">Valeur</th>
              <th scope="col" className="py-2 px-2 font-semibold text-right">Par an</th>
              <th scope="col" className="py-2 px-2 font-semibold text-right">Au pire moment</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map(({ mois, repere, r, pire }) => (
              <tr key={mois} className="border-b border-gray-50 last:border-0">
                <th scope="row" className="py-2 px-2 text-left font-medium text-gray-800">
                  {libelleMois(mois)}
                  {repere ? (
                    <span className="block text-xs font-normal text-gray-400">{repere}</span>
                  ) : null}
                </th>
                <td className="py-2 px-2 text-right text-gray-600 whitespace-nowrap">{formatEur(r.totalInvested)}</td>
                <td className="py-2 px-2 text-right font-semibold text-gray-900 whitespace-nowrap">{formatEur(r.finalValue)}</td>
                <td className="py-2 px-2 text-right text-gray-700 whitespace-nowrap">
                  {r.irrAnnualPct != null ? `${pct(r.irrAnnualPct)} %` : "—"}
                </td>
                <td className="py-2 px-2 text-right">
                  {pire.mois ? (
                    <span className="text-red-600 whitespace-nowrap">
                      {pct(pire.ecart * 100)} %
                      <span className="block text-xs text-gray-400">{libelleMois(pire.mois)}</span>
                    </span>
                  ) : (
                    <span className="text-gray-500">jamais sous le versé</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        « Par an » : taux de rendement interne, qui tient compte de la date de
        chaque versement. « Au pire moment » : l&apos;écart le plus défavorable
        entre la valeur du portefeuille et le total versé à cette date — ce
        qu&apos;on aurait lu sur son relevé. Cours de clôture mensuels du{" "}
        {meta.source.split(" — ")[1]?.split(",")[0] ?? meta.source}, frais du fonds (
        {pct(meta.terAnnuelPct, 2)} %/an) déjà inclus dans le cours ; ni
        courtage, ni fiscalité.
      </p>
      {toutesAuDessus ? (
        <p className="text-sm text-gray-700 mt-3 leading-relaxed">
          Sur toutes ces périodes, le résultat dépasse l&apos;hypothèse de{" "}
          {pct(hypothese, 0)} % par an de la projection. C&apos;est un résultat
          passé, porté par une longue hausse des marchés, pas une promesse pour
          les années qui viennent — c&apos;est justement pourquoi la projection,
          elle, reste prudente.
        </p>
      ) : null}
      <p className="text-sm mt-3">
        <Link href="/backtest" className="text-primary-700 font-medium hover:underline">
          Le backtest : trois périodes célèbres en accès libre, toutes les autres
          en Premium →
        </Link>
      </p>
    </section>
  );
}
