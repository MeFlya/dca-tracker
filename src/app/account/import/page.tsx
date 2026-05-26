import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserSubscription } from "@/lib/subscription";
import { ImportFlow } from "@/components/account/import/ImportFlow";

export const metadata: Metadata = {
  title: "Importer mes transactions — DCA Tracker",
  robots: { index: false, follow: false },
};

export default async function ImportPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sub = await getUserSubscription();
  const isPremium = sub.plan === "premium";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/account" className="hover:text-gray-600 transition-colors">Dashboard</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Importer des transactions</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Importer mes transactions
      </h1>
      <p className="text-base text-gray-600 leading-relaxed mb-8">
        Importez l&apos;historique de votre courtier (Trade Republic,
        Boursorama, Fortuneo, ou tout CSV avec des colonnes Date et Montant).
        Les transactions seront regroupées par mois et ajoutées à votre suivi.
      </p>

      {!isPremium ? (
        // Dark Premium paywall — DA partagée avec PremiumFix (ConversionBlocks),
        // UpgradePrompt card, PremiumLockedOverlay, et les PremiumNudge des
        // outils gratuits (allocation, fiscal). Slate-950 + dot pattern + glow
        // bleu + CTA blanc inversé.
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
            aria-hidden
          />
          <div
            className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center bg-primary-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                Premium
              </span>
            </div>
            <p className="text-base font-bold text-white mb-2">
              L&apos;import CSV est une fonction Premium
            </p>
            <p className="text-sm text-slate-300 mb-5 max-w-md mx-auto leading-relaxed">
              Importez des années d&apos;historique en quelques secondes plutôt
              que de saisir chaque mois manuellement.
            </p>
            <Link
              href="/tarifs"
              className="inline-block bg-white text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Essayer Premium 7 jours →
            </Link>
          </div>
        </div>
      ) : (
        <ImportFlow />
      )}
    </div>
  );
}
