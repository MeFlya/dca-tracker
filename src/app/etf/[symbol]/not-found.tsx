import Link from "next/link";

export default function ETFNotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-4xl mb-6">🔍</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        ETF introuvable
      </h1>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Le symbole demandé ne correspond à aucun ETF référencé sur DCA Tracker.
        Il est peut-être mal orthographié ou n&apos;a pas encore été ajouté.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/comparer-etf" className="btn-primary">
          Voir tous les ETF
        </Link>
        <Link href="/" className="btn-secondary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
