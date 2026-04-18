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

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  free:    { label: "Gratuit",  color: "text-gray-600",    bg: "bg-gray-100",    ring: "" },
  premium: { label: "Premium",  color: "text-primary-700", bg: "bg-primary-50",  ring: "ring-2 ring-primary-200" },
  pro:     { label: "Pro",      color: "text-white",       bg: "bg-slate-800",   ring: "ring-2 ring-slate-300" },
};

type AccessItem = { label: string; available: boolean; isNew?: boolean };

function buildAccessList(plan: string): AccessItem[] {
  const isPremium = plan === "premium" || plan === "pro";
  const isPro = plan === "pro";
  return [
    { label: "Simulateur DCA", available: true },
    { label: "Comparaison ETF", available: true },
    { label: "Guides éducatifs", available: true },
    { label: "Export PDF sans filigrane", available: isPremium },
    { label: "Analyse Monte Carlo (1 000 scénarios)", available: isPremium, isNew: true },
    { label: "Simulations sauvegardées", available: isPremium },
    { label: "Données de marché temps réel", available: isPremium },
    { label: "Simulations illimitées", available: isPro },
    { label: "Suivi portefeuille réel", available: isPro },
    { label: "Simulation multi-ETF", available: isPro },
    { label: "Accès anticipé nouvelles fonctions", available: isPro },
    { label: "Support prioritaire", available: isPro },
  ];
}

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sub = await getUserSubscription();
  const planInfo = PLAN_LABELS[sub.plan] ?? PLAN_LABELS.free;
  const isPremium = sub.plan === "premium" || sub.plan === "pro";
  const accessList = buildAccessList(sub.plan);

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
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Profil
        </h2>
        <div className="flex items-center gap-4">
          {user.imageUrl && (
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-full ring-2 ring-gray-100"
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
      <div className={`rounded-2xl border bg-white p-6 mb-6 ${isPremium ? "border-primary-200" : "border-gray-100"}`}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Plan actuel
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${planInfo.bg} ${planInfo.color} ${planInfo.ring}`}
            >
              {planInfo.label}
            </span>
            {isPremium && sub.subscriptionStatus === "active" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Actif
              </span>
            )}
            {sub.subscriptionStatus === "active" && periodEndDate && (
              <span className="text-xs text-gray-400">
                Renouvellement le {periodEndDate}
              </span>
            )}
            {sub.subscriptionStatus === "canceled" && (
              <span className="text-xs text-red-500">Annulé</span>
            )}
          </div>

          {sub.plan === "free" ? (
            <Link href="/tarifs" className="btn-primary text-xs px-4 py-2">
              Passer Premium →
            </Link>
          ) : (
            <ManageSubscriptionButton />
          )}
        </div>
      </div>

      {/* Accès */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Vos accès
        </h2>
        <ul className="space-y-2.5 text-sm">
          {accessList.map(({ label, available, isNew }) => (
            <li key={label} className="flex items-center gap-2.5">
              {available ? (
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-200 shrink-0" fill="none" viewBox="0 0 16 16">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
              <span className={available ? "text-gray-700" : "text-gray-300"}>
                {label}
              </span>
              {available && isNew && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  Nouveau
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Premium CTA (free only) */}
      {sub.plan === "free" && (
        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 text-center">
          <p className="text-white font-bold text-lg mb-1">Passez à Premium</p>
          <p className="text-primary-200 text-sm mb-5 leading-relaxed">
            Monte Carlo, export PDF propre, simulations sauvegardées — à partir de&nbsp;3,25&nbsp;€/mois
          </p>
          <Link
            href="/tarifs"
            className="inline-block bg-white text-primary-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Voir les offres →
          </Link>
        </div>
      )}

      {/* Premium: quick link to Monte Carlo */}
      {isPremium && (
        <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5 text-center">
          <p className="text-primary-800 font-semibold mb-1 text-sm">
            Testez votre fonctionnalité phare
          </p>
          <p className="text-primary-600 text-xs mb-3">
            L&apos;analyse Monte Carlo vous attend dans le simulateur
          </p>
          <Link
            href="/simulateur"
            className="inline-block bg-primary-600 text-white font-semibold text-sm px-5 py-2 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Ouvrir le simulateur →
          </Link>
        </div>
      )}
    </div>
  );
}
