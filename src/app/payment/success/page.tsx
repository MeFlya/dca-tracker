import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement confirmé — DCA Tracker",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-16 px-4 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Abonnement activé 🎉
        </h1>
        <p className="text-gray-500 mb-8">
          Votre paiement a été confirmé. Un email de confirmation vous a été envoyé.
          Votre plan est maintenant actif.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/simulateur" className="btn-primary">
            Démarrer le simulateur
          </Link>
          <Link
            href="/account"
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Mon compte
          </Link>
        </div>
      </div>
    </div>
  );
}
