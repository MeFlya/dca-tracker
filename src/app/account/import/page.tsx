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
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-6">
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
        <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center">
          <p className="text-base font-bold text-gray-900 mb-2">
            L&apos;import CSV est une fonction Premium
          </p>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Importez des années d&apos;historique en quelques secondes plutôt
            que de saisir chaque mois manuellement.
          </p>
          <Link href="/tarifs" className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift">
            Essayer Premium 7 jours →
          </Link>
        </div>
      ) : (
        <ImportFlow />
      )}
    </div>
  );
}
