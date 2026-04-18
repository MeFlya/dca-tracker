import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement annulé — DCA Tracker",
  robots: { index: false, follow: false },
};

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-16 px-4 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Paiement annulé
        </h1>
        <p className="text-gray-500 mb-8">
          Aucun montant n'a été débité. Vous pouvez revenir aux tarifs et
          choisir un plan quand vous voulez.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/tarifs" className="btn-primary">
            Voir les tarifs
          </Link>
          <Link
            href="/simulateur"
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continuer gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
}
