// Skeleton de /upgrade (AUDIT U1) — page dynamique (searchParams → projection
// personnalisée calculée server-side, dont un Monte Carlo). Sans skeleton,
// la navigation depuis un paywall paraissait gelée. Layout réel : max-w-2xl.

export default function UpgradeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" aria-busy="true">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="motion-safe:animate-pulse">
          {/* Back link + badge plan */}
          <div className="h-3.5 w-40 rounded bg-gray-100 mb-8" />
          <div className="h-7 w-44 rounded-full bg-gray-100 mb-5" />

          {/* Hero */}
          <div className="h-4 w-56 rounded bg-gray-50 mb-3" />
          <div className="h-10 w-full rounded bg-gray-100 mb-2" />
          <div className="h-10 w-3/4 rounded bg-gray-100 mb-5" />
          <div className="h-4 w-full rounded bg-gray-50 mb-2" />
          <div className="h-4 w-5/6 rounded bg-gray-50 mb-6" />
          <div className="h-12 w-72 max-w-full rounded-xl bg-gray-100 mb-10" />

          {/* Bloc valeur (dark) + projection */}
          <div className="h-56 rounded-2xl bg-gray-100 mb-10" />
          <div className="h-64 rounded-2xl border border-gray-100 bg-gray-50" />
        </div>
        <span className="sr-only">Chargement…</span>
      </div>
    </div>
  );
}
