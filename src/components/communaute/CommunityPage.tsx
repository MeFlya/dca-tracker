"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Target, Activity, Flame, Shield, TrendingUp } from "lucide-react";

type CommunityStats = {
  users: number;
  strategies: number;
  monthsLogged: number;
  monthlyAmountDistribution: { bin: string; count: number }[];
  durationDistribution: { bin: string; count: number }[];
  streakDistribution: { bin: string; count: number }[];
  usersWithStreak3Plus: number;
  usersWithStreak12Plus: number;
  usersWithStreak24Plus: number;
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} k`;
  return n.toLocaleString("fr-FR");
}

function DistributionBar({ items }: { items: { bin: string; count: number }[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const pct = (item.count / total) * 100;
        return (
          <div key={item.bin} className="text-xs">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-gray-700 font-medium">{item.bin}</span>
              <span className="text-gray-500 tabular-nums">
                {item.count} ({pct.toFixed(0)} %)
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CommunityPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CommunityStats | null) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Communauté</span>
      </nav>

      {/* Hero */}
      <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">
        Communauté
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Comment la communauté DCA Tracker investit
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-8">
        Voir ce que font les autres peut vous aider à ajuster votre propre
        stratégie. Tous les chiffres de cette page sont{" "}
        <strong>agrégés et anonymes</strong> : aucune donnée personnelle
        n&apos;est exposée, et seuls les groupes de 3 utilisateurs minimum
        sont affichés.
      </p>

      {/* Privacy callout */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 px-5 py-4 mb-10 flex items-start gap-3">
        <Shield size={18} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-900 mb-1">
            Confidentialité totale
          </p>
          <p className="text-sm text-emerald-800 leading-relaxed">
            Aucun nom, aucune stratégie individuelle, aucun portefeuille exposé.
            Vos données vous appartiennent et ne sont jamais partagées — même
            agrégées, les groupes trop petits sont masqués pour empêcher toute
            identification indirecte.
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-4 mb-10">
          <div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
          <div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
        </div>
      )}

      {!loading && stats && stats.users >= 5 && (
        <>
          {/* Headline numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-primary-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Inscrits
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                {formatCount(stats.users)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-primary-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stratégies suivies
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                {formatCount(stats.strategies)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-primary-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mois enregistrés
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                {formatCount(stats.monthsLogged)}
              </p>
            </div>
          </div>

          {/* Milestones */}
          {(stats.usersWithStreak3Plus > 0 || stats.usersWithStreak12Plus > 0) && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 mb-10">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-amber-600" />
                <p className="text-sm font-bold text-amber-900">
                  Constance cumulée de la communauté
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-amber-800 tabular-nums">
                    {stats.usersWithStreak3Plus}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">≥ 3 mois consécutifs</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-800 tabular-nums">
                    {stats.usersWithStreak12Plus}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">≥ 1 an complet</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-800 tabular-nums">
                    {stats.usersWithStreak24Plus}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">≥ 2 ans consécutifs</p>
                </div>
              </div>
            </div>
          )}

          {/* Distributions */}
          <div className="space-y-6 mb-10">
            {stats.monthlyAmountDistribution.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-primary-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Versement mensuel des utilisateurs
                  </h2>
                </div>
                <DistributionBar items={stats.monthlyAmountDistribution} />
              </section>
            )}

            {stats.durationDistribution.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={16} className="text-primary-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Horizon d&apos;investissement
                  </h2>
                </div>
                <DistributionBar items={stats.durationDistribution} />
              </section>
            )}

            {stats.streakDistribution.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={16} className="text-primary-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Durée de suivi mensuel
                  </h2>
                </div>
                <DistributionBar items={stats.streakDistribution} />
              </section>
            )}
          </div>
        </>
      )}

      {!loading && (!stats || stats.users < 5) && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center mb-10">
          <p className="text-base font-semibold text-gray-900 mb-2">
            La communauté grandit
          </p>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Les chiffres agrégés apparaîtront ici dès que suffisamment
            d&apos;investisseurs auront rejoint DCA Tracker. Soyez parmi les
            premiers à suivre votre DCA.
          </p>
          <Link href="/simulateur" className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift">
            Lancer ma simulation →
          </Link>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center">
        <p className="text-base font-bold text-gray-900 mb-2">
          Rejoignez la communauté
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Sauvegardez votre stratégie, enregistrez votre portefeuille chaque
          mois. Vos chiffres contribueront aux futures statistiques agrégées
          de la communauté — toujours anonymes, jamais partagés
          individuellement.
        </p>
        <Link href="/simulateur" className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift">
          Commencer →
        </Link>
      </div>

      {/* Legal */}
      <p className="mt-10 text-[11px] text-gray-500 leading-relaxed">
        Les chiffres affichés sont cachés pendant 24 heures maximum et
        agrégés en temps réel depuis les données anonymes de la communauté.
        Aucune information personnelle (nom, email, portefeuille individuel)
        n&apos;est jamais exposée sur cette page.
      </p>
    </div>
  );
}
