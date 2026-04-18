import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement confirmé — DCA Tracker",
  robots: { index: false, follow: false },
};

const PLAN_FEATURES: Record<string, { headline: string; features: string[] }> = {
  premium: {
    headline: "Votre plan Premium est actif",
    features: [
      "Analyse Monte Carlo — 1 000 scénarios de marché simulés",
      "Export PDF professionnel sans filigrane",
      "Données de marché en temps réel (bientôt)",
      "Simulations sauvegardées — 10 emplacements (bientôt)",
      "Calculateur fiscal PEA / CTO (bientôt)",
      "Rappels DCA automatiques par email (bientôt)",
    ],
  },
  pro: {
    headline: "Votre plan Pro est actif",
    features: [
      "Analyse Monte Carlo — 1 000 scénarios de marché simulés",
      "Export PDF professionnel sans filigrane",
      "Simulations illimitées sauvegardées (bientôt)",
      "Suivi de portefeuille réel vs projection (bientôt)",
      "Simulation multi-ETF pondérée (bientôt)",
      "Récapitulatif fiscal annuel (bientôt)",
      "Accès anticipé aux nouvelles fonctions",
      "Support prioritaire",
    ],
  },
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan = "premium" } = await searchParams;
  const content = PLAN_FEATURES[plan] ?? PLAN_FEATURES.premium;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-16 px-4">
      <div className="max-w-lg w-full">

        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-50">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {content.headline} 🎉
          </h1>
          <p className="text-gray-500 text-sm">
            Un email de confirmation vient d&apos;être envoyé à votre adresse.
          </p>
        </div>

        {/* Unlocked features */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-6 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-4">
            Vous venez de débloquer
          </p>
          <ul className="space-y-2.5">
            {content.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={f.includes("bientôt") ? "text-gray-400" : "text-gray-700 font-medium"}>
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Primary CTA — Monte Carlo */}
        <div className="bg-slate-900 rounded-2xl p-5 mb-4 text-center">
          <p className="text-white font-semibold mb-1">
            Commencez par l&apos;analyse Monte Carlo
          </p>
          <p className="text-slate-400 text-xs mb-4">
            Votre première fonctionnalité Premium — visualisez 1&nbsp;000 scénarios possibles pour votre épargne.
          </p>
          <Link
            href="/simulateur"
            className="inline-block bg-white text-slate-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Découvrir le Monte Carlo →
          </Link>
        </div>

        <div className="text-center">
          <Link
            href="/account"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Voir mon compte →
          </Link>
        </div>

      </div>
    </div>
  );
}
