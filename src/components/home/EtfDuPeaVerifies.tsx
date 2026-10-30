import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { CHEMIN_CSV_LISTE_PEA, DATE_RELEVE_LISTE_PEA, LIGNES_PEA } from "@/lib/liste-pea/donnees";
import { URL_LISTE_PEA, dateEnToutesLettres } from "@/lib/etf-pea-verifies";
import { FICHES_V2 } from "@/data/etf";
import { dateCourte } from "@/lib/fiche-etf-v2/textes";

// Accès aux données vérifiées, depuis l'accueil (30/10/2026, plan du 14/10 :
// « pas de refonte de l'accueil, l'accroche et un bloc d'accès »). Composant
// serveur : les 128 lignes de la liste et les fiches restent hors du
// JavaScript du navigateur, la page reste statique.
//
// Tout ce qui est compté ou daté ici est lu dans les données : nombre de
// lignes et date du relevé de la liste, liste des fiches v2 et date de leurs
// chiffres. Pas de « référence », de « plus complet » ni de « meilleur »
// (plan §1.3 et §1.4) : on montre la preuve, pas un superlatif.

const FICHES = Object.values(FICHES_V2).sort((a, b) => a.mnemo.localeCompare(b.mnemo, "fr"));

/** Date des chiffres de l'émetteur, commune aux fiches ; sinon null (chaque ligne donne la sienne). */
const DATES_CHIFFRES = [...new Set(FICHES.map((f) => f.chiffres.au))];
const DATE_COMMUNE = DATES_CHIFFRES.length === 1 ? DATES_CHIFFRES[0] : null;

export function EtfDuPeaVerifies() {
  return (
    <section aria-labelledby="etf-du-pea-titre" className="py-16 md:py-20 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-700 mb-3">
            Vérifiés à la source
          </p>
          <h2 id="etf-du-pea-titre" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Les ETF du PEA, preuve à l&apos;appui
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Frais, éligibilité, indice suivi&nbsp;: chaque donnée renvoie au
            document de l&apos;émetteur et porte sa date.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── La liste ─────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-primary-100 bg-white shadow-card-lg p-6 sm:p-8 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-2">Liste vérifiée</p>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Les {LIGNES_PEA.length} ETF éligibles au PEA cotés à Paris
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Relevés le {dateEnToutesLettres(DATE_RELEVE_LISTE_PEA)}. Pour chacun&nbsp;: ISIN, frais
              courants, indice suivi, et le document daté de l&apos;émetteur qui établit
              l&apos;éligibilité. Les fonds souvent pris pour des ETF du PEA sans
              l&apos;être sont présentés à part, avec la raison.
            </p>
            <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <Link href={URL_LISTE_PEA} className="btn-primary group self-start">
                Voir la liste
                <ArrowRight size={16} aria-hidden className="arrow-nudge" />
              </Link>
              <a
                href={CHEMIN_CSV_LISTE_PEA}
                download
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 underline-offset-4 hover:underline transition-colors self-start"
              >
                <Download size={15} aria-hidden />
                Télécharger le CSV
              </a>
            </div>
          </div>

          {/* ── Les fiches v2 ────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-slate-200/70 bg-white shadow-card p-6 sm:p-8 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-2">Fiches vérifiées</p>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Les chiffres publiés par l&apos;émetteur</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Frais, performances et encours{DATE_COMMUNE ? <> au {dateCourte(DATE_COMMUNE)}</> : null}, chacun
              avec le document qui le donne. Les performances passées ne préjugent pas des performances futures.
            </p>
            <ul className="mt-auto divide-y divide-slate-100 rounded-2xl border border-slate-200/70 overflow-hidden">
              {FICHES.map((f) => (
                <li key={f.mnemo}>
                  <Link
                    href={`/etf/${f.mnemo}`}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="shrink-0 w-16 px-2 py-0.5 rounded-full bg-primary-50 text-center text-xs font-bold text-primary-700 tracking-tight">
                      {f.mnemo}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-gray-700">
                      {f.nomCourt}
                      {DATE_COMMUNE ? null : (
                        <span className="text-gray-500"> · au {dateCourte(f.chiffres.au)}</span>
                      )}
                    </span>
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="shrink-0 text-gray-400 group-hover:text-primary-600 transition-colors"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
