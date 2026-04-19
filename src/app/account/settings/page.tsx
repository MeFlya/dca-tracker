import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserSubscription } from "@/lib/subscription";
import { getStrategyData } from "@/lib/user-strategy";
import { ExportDataButton } from "@/components/account/settings/ExportDataButton";
import { DeleteAccountButton } from "@/components/account/settings/DeleteAccountButton";
import { ManageSubscriptionButton } from "../ManageSubscriptionButton";

export const metadata: Metadata = {
  title: "Paramètres — DCA Tracker",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sub = await getUserSubscription();
  const { entries } = await getStrategyData(user.id);
  const isPremium = sub.plan === "premium";
  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header + back link */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6" aria-label="Fil d'ariane">
        <Link href="/account" className="hover:text-gray-600 transition-colors">Dashboard</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Paramètres</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres du compte</h1>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Profil
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-mono text-gray-900 text-right">{userEmail}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <dt className="text-gray-500">Nom</dt>
            <dd className="text-gray-900 text-right">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
            </dd>
          </div>
          {memberSince && (
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <dt className="text-gray-500">Membre depuis</dt>
              <dd className="text-gray-900 text-right">{memberSince}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── Subscription ─────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Abonnement
        </h2>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Plan{" "}
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700 ml-1">
                {isPremium ? "Premium" : "Gratuit"}
              </span>
            </p>
            {isPremium && sub.subscriptionStatus === "active" && (
              <p className="text-xs text-gray-500 mt-1">
                Abonnement actif · géré par Stripe
              </p>
            )}
            {!isPremium && (
              <p className="text-xs text-gray-500 mt-1">
                Vous utilisez le plan gratuit.
              </p>
            )}
          </div>
          {isPremium ? (
            <ManageSubscriptionButton />
          ) : (
            <Link href="/tarifs" className="btn-primary text-sm px-4 py-2 btn-lift">
              Essayer Premium 7 jours
            </Link>
          )}
        </div>
      </section>

      {/* ── Data export ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Mes données
        </h2>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Exporter mon historique
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Fichier CSV contenant votre stratégie sauvegardée, vos{" "}
              {entries.length} entrée{entries.length !== 1 ? "s" : ""} mensuelle
              {entries.length !== 1 ? "s" : ""} et le détail de vos contributions.
              Exploitable dans Excel, Numbers ou Google Sheets.
            </p>
          </div>
          <ExportDataButton />
        </div>
      </section>

      {/* ── Security & email (Clerk portal) ──────────────────────────────── */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Sécurité et connexion
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Changer votre mot de passe, gérer vos sessions actives ou associer
          un compte Google se fait depuis l&apos;interface de connexion.
        </p>
        <Link
          href="/account"
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          Gérer depuis le menu utilisateur en haut à droite →
        </Link>
      </section>

      {/* ── Danger zone ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-red-100 bg-red-50/30 p-6">
        <h2 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-3">
          Zone de suppression
        </h2>
        <p className="text-sm text-red-900 leading-relaxed mb-4">
          Supprimer votre compte efface définitivement votre stratégie, votre
          historique et annule votre abonnement. Exportez vos données avant si
          vous souhaitez les conserver.
        </p>
        <DeleteAccountButton userEmail={userEmail} />
      </section>
    </div>
  );
}
