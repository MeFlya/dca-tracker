import type { Metadata } from "next";
import { Suspense } from "react";
import { FormulaireRecherche, ResultatsRecherche } from "./ResultatsRecherche";

// Page de résultats complète, pour « Tous les résultats » et pour qui partage
// ou garde un lien de recherche. Hors index Google (noindex ici et en en-tête
// HTTP, cf. next.config.ts) et hors sitemap : une page de résultats indexée
// serait du contenu dupliqué des pages qu'elle liste.
//
// Page statique : searchParams n'est pas lu ici (il la rendrait dynamique).
// Le formulaire est hors de la limite Suspense, donc dans le HTML pré-rendu
// (constat n° 40, 28/09/2026) : avant, useSearchParams faisait passer tout le
// bloc, formulaire compris, au rendu client — sans JavaScript, ou tant qu'il
// chargeait, la page n'affichait que « Chargement de la recherche… », et le
// champ apparaissait à l'hydratation en décalant la page.
export const metadata: Metadata = {
  title: "Recherche sur DCA Tracker",
  description: "Rechercher un ETF, un courtier, une notion ou une question sur DCA Tracker.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/recherche" },
};

export default function PageRecherche() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Rechercher sur le site
      </h1>
      <FormulaireRecherche />
      <Suspense fallback={<p className="text-sm text-gray-500">Chargement de la recherche…</p>}>
        <ResultatsRecherche />
      </Suspense>
    </div>
  );
}
