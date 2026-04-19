"use client";

// Client component: fetches /api/stats/public on mount.
// Keeps the homepage fully static while still showing live numbers.
// Renders nothing when stats are empty or unavailable (avoids a fake-looking
// block on a brand-new deployment).

import { useEffect, useState } from "react";
import { Users, Target, Activity } from "lucide-react";

type PublicStats = {
  users: number;
  strategies: number;
  monthsLogged: number;
};

function formatCount(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",")} k`;
  }
  return n.toLocaleString("fr-FR");
}

export function LiveSocialProof() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PublicStats | null) => {
        if (cancelled) return;
        setStats(data);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide entirely until loaded + meaningful data
  if (!loaded) return null;
  if (!stats || (stats.users < 5 && stats.strategies < 1)) return null;

  const cards = [
    { Icon: Users, value: formatCount(stats.users), label: "Investisseurs inscrits" },
    { Icon: Target, value: formatCount(stats.strategies), label: "Stratégies DCA suivies" },
    { Icon: Activity, value: formatCount(stats.monthsLogged), label: "Mois de suivi enregistrés" },
  ];

  return (
    <section className="py-12 border-y border-gray-100 bg-gray-50/50 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
          {cards.map(({ Icon, value, label }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                  {value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
