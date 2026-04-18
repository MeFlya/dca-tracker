import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ManageSubscriptionButton } from "./ManageSubscriptionButton";

export const metadata: Metadata = {
  title: "Mon compte — DCA Tracker",
  robots: { index: false, follow: false },
};

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "Gratuit",  color: "text-gray-600",   bg: "bg-gray-100"    },
  premium: { label: "Premium",  color: "text-primary-700", bg: "bg-primary-50" },
  pro:     { label: "Pro",      color: "text-white",       bg: "bg-slate-800"  },
};

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sub = await getUserSubscription();
  const planInfo = PLAN_LABELS[sub.plan] ?? PLAN_LABELS.free;

  const periodEndDate = sub.periodEnd
    ? new Date(sub.periodEnd * 1000).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon compte</h1>

      {/* Profil */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Profil
        </h2>
        <div className="flex items-center gap-4">
          {user.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Plan actuel */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Plan actuel
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${planInfo.bg} ${planInfo.color}`}
            >
              {planInfo.label}
            </span>
            {sub.subscriptionStatus === "active" && periodEndDate && (
              <span className="text-sm text-gray-400">
                Renouvellement le {periodEndDate}
              </span>
            )}
            {sub.subscriptionStatus === "canceled" && (
              <span className="text-sm text-red-500">Annulé</span>
            )}
          </div>

          {sub.plan === "free" ? (
            <Link href="/tarifs" className="btn-primary text-xs px-4 py-2">
              Passer Premium
            </Link>
          ) : (
            <ManageSubscriptionButton />
          )}
        </div>
      </div>

      {/* Fonctions disponibles */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Vos accès
        </h2>
        <ul className="space-y-2.5 text-sm">
          {[
            { label: "Simulateur DCA", available: true },
            { label: "Comparaison ETF", available: true },
            { label: "Guides éducatifs", available: true },
            {
              label: "Export PDF sans filigrane",
              available: sub.plan === "premium" || sub.plan === "pro",
            },
            {
              label: "Support prioritaire",
              available: sub.plan === "pro",
            },
            {
              label: "Accès anticipé nouvelles fonctions",
              available: sub.plan === "pro",
            },
          ].map(({ label, available }) => (
            <li key={label} className="flex items-center gap-2.5">
              {available ? (
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 16 16">
                  <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              <span className={available ? "text-gray-700" : "text-gray-400"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {sub.plan === "free" && (
        <div className="rounded-2xl bg-primary-600 p-6 text-center">
          <p className="text-white font-semibold mb-1">Passez à Premium</p>
          <p className="text-primary-200 text-sm mb-4">
            Export PDF propre, simulations sauvegardées et plus — à partir de 3,25 €/mois
          </p>
          <Link
            href="/tarifs"
            className="inline-block bg-white text-primary-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Voir les offres
          </Link>
        </div>
      )}
    </div>
  );
}
