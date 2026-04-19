import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/subscription";
import { getStrategyData } from "@/lib/user-strategy";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ManageSubscriptionButton } from "./ManageSubscriptionButton";
import { StrategyTracker } from "@/components/account/StrategyTracker";
import { ReLockedStrategy } from "@/components/account/ReLockedStrategy";

export const metadata: Metadata = {
  title: "Dashboard — DCA Tracker",
  robots: { index: false, follow: false },
};

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "Gratuit",  color: "text-gray-600",    bg: "bg-gray-100"   },
  premium: { label: "Premium",  color: "text-primary-700", bg: "bg-primary-100" },
  pro:     { label: "Pro",      color: "text-white",       bg: "bg-slate-800"  },
};

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sub = await getUserSubscription();
  const planMeta = PLAN_META[sub.plan] ?? PLAN_META.free;
  const isPremium = sub.plan === "premium" || sub.plan === "pro";

  // Fetch strategy data server-side so we can detect the "canceled with
  // preserved data" state for the re-lock UI.
  const { strategy, entries } = await getStrategyData(user.id);
  const hasLockedData = !isPremium && strategy !== null;

  const periodEndDate = sub.periodEnd
    ? new Date(sub.periodEnd * 1000).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour{user.firstName ? `, ${user.firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Votre tableau de bord DCA</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${planMeta.bg} ${planMeta.color}`}>
            {planMeta.label}
          </span>
          {sub.plan === "free" ? (
            <Link href="/tarifs" className="btn-primary text-xs px-4 py-2">
              Passer Premium →
            </Link>
          ) : (
            <ManageSubscriptionButton />
          )}
        </div>
      </div>

      {/* ── HERO: 3 states ─────────────────────────────────────────────────
          1. Premium/Pro → full StrategyTracker
          2. Free + preserved data → ReLockedStrategy (reactivation CTA)
          3. Free + no data → generic upgrade prompt
      ─────────────────────────────────────────────────────────────────── */}
      {isPremium ? (
        <div className="mb-6">
          <StrategyTracker />
        </div>
      ) : hasLockedData && strategy ? (
        <div className="mb-6">
          <ReLockedStrategy strategy={strategy} entries={entries} />
        </div>
      ) : (
        /* ── FREE + no data: generic upgrade prompt ───────────────────────── */
        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-8 mb-6 text-center">
          <p className="text-4xl mb-3">📊</p>
          <h2 className="text-white font-bold text-xl mb-2">
            Suivez votre progression réelle
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed mb-6 max-w-md mx-auto">
            Sauvegardez votre stratégie, enregistrez votre portefeuille chaque mois,
            et voyez si vous êtes en avance ou en retard sur votre projection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tarifs"
              className="inline-block bg-white text-primary-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Débloquer le suivi — 4,90 €/mois →
            </Link>
            <Link
              href="/simulateur"
              className="inline-block bg-white/10 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors"
            >
              Continuer à simuler
            </Link>
          </div>
        </div>
      )}

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Link
          href="/simulateur"
          className="rounded-xl border border-gray-100 bg-white p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
        >
          <p className="text-2xl mb-2">⚡</p>
          <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
            Simuler
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Lancer une projection DCA</p>
        </Link>

        {isPremium ? (
          <Link
            href="/simulateur"
            className="rounded-xl border border-gray-100 bg-white p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
          >
            <p className="text-2xl mb-2">💾</p>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
              Modifier ma stratégie
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Ajuster les paramètres</p>
          </Link>
        ) : (
          <Link
            href="/upgrade?feature=save-strategy"
            className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 hover:border-primary-300 transition-colors group"
          >
            <p className="text-2xl mb-2 opacity-40">💾</p>
            <p className="text-sm font-semibold text-gray-400 group-hover:text-primary-600 transition-colors">
              Sauvegarder stratégie
            </p>
            <p className="text-[10px] text-primary-500 font-bold mt-0.5 uppercase tracking-wide">Premium</p>
          </Link>
        )}

        {isPremium ? (
          <Link
            href="/upgrade?feature=monte-carlo"
            className="rounded-xl border border-gray-100 bg-white p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
          >
            <p className="text-2xl mb-2">📈</p>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
              Monte Carlo
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Analyse de risque complète</p>
          </Link>
        ) : (
          <Link
            href="/upgrade?feature=monte-carlo"
            className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 hover:border-primary-300 transition-colors group"
          >
            <p className="text-2xl mb-2 opacity-40">📈</p>
            <p className="text-sm font-semibold text-gray-400 group-hover:text-primary-600 transition-colors">
              Monte Carlo
            </p>
            <p className="text-[10px] text-primary-500 font-bold mt-0.5 uppercase tracking-wide">Premium</p>
          </Link>
        )}
      </div>

      {/* ── Plan + subscription status ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${planMeta.bg} ${planMeta.color}`}>
              {planMeta.label}
            </span>
            {isPremium && sub.subscriptionStatus === "active" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Actif
              </span>
            )}
            {sub.subscriptionStatus === "canceled" && (
              <span className="text-xs text-red-500">Annulé</span>
            )}
            {periodEndDate && (
              <span className="text-xs text-gray-400">Renouvellement le {periodEndDate}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{user.emailAddresses[0]?.emailAddress}</span>
          </div>
        </div>
      </div>

      {/* ── What you get (Premium) / What you unlock (Free) ───────────────── */}
      {!isPremium && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Ce que vous débloquez avec Premium
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { feature: "save-strategy", icon: "💾", label: "Suivi de stratégie", desc: "Enregistrez vos performances mensuelles" },
              { feature: "monte-carlo",   icon: "📊", label: "Monte Carlo",        desc: "1 000 scénarios de marché simulés" },
              { feature: "pdf-export",    icon: "📄", label: "Export PDF propre",  desc: "Sans filigrane, prêt à partager" },
              { feature: "ab-comparison", icon: "⚖️", label: "Comparaison A/B",   desc: "Deux stratégies côte à côte (Pro)" },
            ].map(({ feature, icon, label, desc }) => (
              <Link
                key={feature}
                href={`/upgrade?feature=${feature}`}
                className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
              >
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
