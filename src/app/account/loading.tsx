// Skeleton du dashboard /account (AUDIT U1).
// Couvre aussi /account/import, /account/settings, /account/recap-fiscal
// (le loading.tsx d'un segment s'applique à ses enfants sans loading propre).
//
// Dimensions calquées sur la vraie page (max-w-3xl, header row, cards) →
// pas de CLS au swap. Blocs gris statiques + pulse uniquement si l'user
// n'a pas demandé reduced-motion (motion-safe:).

export default function AccountLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" aria-busy="true">
      <div className="motion-safe:animate-pulse">
        {/* Header : titre + actions */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="h-7 w-44 rounded bg-gray-100 mb-2" />
            <div className="h-3.5 w-56 rounded bg-gray-50" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded-full bg-gray-100" />
            <div className="h-8 w-28 rounded-lg bg-gray-50" />
          </div>
        </div>

        {/* Carte principale (onboarding / tracker) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-6">
          <div className="h-5 w-64 rounded bg-gray-100 mb-3" />
          <div className="h-3.5 w-80 max-w-full rounded bg-gray-50 mb-6" />
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-gray-50" />
            <div className="h-16 rounded-xl bg-gray-50" />
            <div className="h-16 rounded-xl bg-gray-50" />
          </div>
        </div>

        {/* Quick actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-gray-100 bg-gray-50" />
          ))}
        </div>
      </div>
      <span className="sr-only">Chargement de votre tableau de bord…</span>
    </div>
  );
}
