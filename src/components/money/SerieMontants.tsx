import Link from "next/link";

/**
 * Les autres pages de la série « investir N €/mois », plus l'objectif retraite.
 *
 * Audit du 28/09/2026 (crawl, liens de contenu hors navigation) :
 * /investir-500-euros-mois-etf, la page de la série qui ramène le plus de clics,
 * ne recevait qu'UN lien éditorial ; /investir-200 deux ; aucune ne pointait vers
 * /simulateur-retraite, que seul le pied de page reliait. Une série qui ne se
 * relie pas à elle-même laisse le lecteur repartir au lieu de comparer.
 */
const MONTANTS = [100, 200, 300, 500] as const;

export function SerieMontants({ courant }: { courant: number }) {
  return (
    <nav
      aria-label="Les autres montants"
      className="mb-10 rounded-xl bg-slate-50 border border-slate-200/70 px-4 py-3 text-sm text-gray-600"
    >
      <span className="font-semibold text-gray-800">Les autres montants :</span>{" "}
      {MONTANTS.filter((m) => m !== courant).map((m, i) => (
        <span key={m}>
          {i > 0 ? " · " : ""}
          <Link
            href={`/investir-${m}-euros-mois-etf`}
            className="text-primary-700 font-medium hover:underline"
          >
            {m} €/mois
          </Link>
        </span>
      ))}
      {" · "}
      <Link href="/simulateur-retraite" className="text-primary-700 font-medium hover:underline">
        combien investir pour sa retraite
      </Link>
    </nav>
  );
}
