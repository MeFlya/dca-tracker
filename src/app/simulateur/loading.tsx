// Skeleton du simulateur (AUDIT U1) — la page est dynamique (searchParams →
// calcul server-side), donc ce skeleton s'affiche à chaque navigation.
// Il réplique le layout réel : header + grid lg:[400px_1fr] (colonne
// formulaire sticky + colonne résultats) → zéro CLS au swap.

export default function SimulateurLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-busy="true">
      <div className="motion-safe:animate-pulse">
        {/* Header de page */}
        <div className="mb-10">
          <div className="h-8 w-96 max-w-full rounded bg-gray-100 mb-3" />
          <div className="h-4 w-[28rem] max-w-full rounded bg-gray-50" />
        </div>

        {/* Grid form + résultats — même template que SimulatorPageClient */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
          {/* Colonne formulaire */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="h-5 w-32 rounded bg-gray-100 mb-6" />
            <div className="space-y-7">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i}>
                  <div className="h-3.5 w-40 rounded bg-gray-50 mb-3" />
                  <div className="h-2 rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Colonne résultats */}
          <div className="space-y-5">
            <div className="h-44 rounded-2xl border border-gray-100 bg-gray-50" />
            <div className="h-28 rounded-2xl border border-gray-100 bg-gray-50" />
            <div className="h-[452px] rounded-2xl border border-gray-100 bg-gray-50" />
          </div>
        </div>
      </div>
      <span className="sr-only">Chargement du simulateur…</span>
    </div>
  );
}
