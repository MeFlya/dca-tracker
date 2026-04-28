import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserSubscription } from "@/lib/subscription";
import { getStrategyData } from "@/lib/user-strategy";
import { RecapFiscalClient } from "./RecapFiscalClient";

export const metadata: Metadata = {
  title: "Récap fiscal annuel — DCA Tracker",
  robots: { index: false, follow: false },
};

export default async function RecapFiscalPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sub = await getUserSubscription();
  if (sub.plan !== "premium") {
    // Free → redirect to /tarifs with the recap-fiscal feature flag for analytics.
    redirect("/upgrade?feature=recap-fiscal");
  }

  const { strategy, entries } = await getStrategyData(user.id);

  // No saved strategy → guide the user back.
  if (!strategy) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Récap fiscal
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Aucune stratégie sauvegardée
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Le récap fiscal s&apos;appuie sur votre stratégie de DCA et le
            suivi mensuel que vous tenez à jour. Sauvegardez d&apos;abord une
            stratégie depuis le simulateur, puis revenez ici en fin
            d&apos;année.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/simulateur"
              className="btn-primary text-sm px-5 py-2.5"
            >
              Ouvrir le simulateur
            </Link>
            <Link
              href="/account"
              className="btn-secondary text-sm px-5 py-2.5"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const requestedYear = params?.year ? parseInt(params.year, 10) : undefined;
  const currentYear = new Date().getFullYear();
  const selectedYear = requestedYear && !isNaN(requestedYear)
    ? requestedYear
    : currentYear;

  // Build the list of available years (start year of strategy → current year).
  const startYear = parseInt(strategy.startMonth.split("-")[0], 10);
  const availableYears: number[] = [];
  for (let y = currentYear; y >= startYear; y--) availableYears.push(y);

  return (
    // bg-white opaque — page de lecture/calcul, fond calme.
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-4">
        {/* Breadcrumb (hidden when printing) */}
        <nav
          aria-label="Fil d'ariane"
          className="flex items-center gap-2 text-sm text-gray-500 mb-3 print:hidden"
        >
          <Link href="/account" className="hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-700" aria-current="page">
            Récap fiscal {selectedYear}
          </span>
        </nav>

        <RecapFiscalClient
          strategy={strategy}
          entries={entries}
          selectedYear={selectedYear}
          availableYears={availableYears}
          firstName={user.firstName ?? null}
        />
      </div>
    </div>
  );
}
