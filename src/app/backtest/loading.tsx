// Skeleton du backtest (AUDIT U1) — page dynamique (lecture subscription
// server-side). Réplique le layout réel (max-w-4xl, header, pills scénarios,
// carte formulaire) → zéro CLS au swap.

export default function BacktestLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" aria-busy="true">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="motion-safe:animate-pulse">
          {/* Breadcrumb + header */}
          <div className="h-3.5 w-64 rounded bg-gray-100 mb-8" />
          <div className="h-5 w-40 rounded bg-gray-100 mb-4" />
          <div className="h-9 w-[30rem] max-w-full rounded bg-gray-100 mb-3" />
          <div className="h-4 w-full max-w-2xl rounded bg-gray-50 mb-10" />

          {/* Pills scénarios rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-16 rounded-xl border border-gray-100 bg-white" />
            ))}
          </div>

          {/* Carte formulaire */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i}>
                  <div className="h-3 w-32 rounded bg-gray-50 mb-2" />
                  <div className="h-11 rounded-xl bg-gray-50" />
                </div>
              ))}
            </div>
            <div className="h-12 w-48 rounded-xl bg-gray-100" />
          </div>
        </div>
        <span className="sr-only">Chargement du backtest…</span>
      </div>
    </div>
  );
}
