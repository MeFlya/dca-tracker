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
  if (!stats || (stats.users < 1 && stats.strategies < 1)) return null;

  const cards = [
    { Icon: Users,    value: formatCount(stats.users),        label: "investisseurs inscrits" },
    { Icon: Target,   value: formatCount(stats.strategies),   label: "stratégies DCA suivies" },
    { Icon: Activity, value: formatCount(stats.monthsLogged), label: "mois de suivi enregistrés" },
  ];

  return (
    <section className="py-12 border-y border-slate-200/70 bg-white animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-700 text-center mb-6">
          Données réelles · mise à jour toutes les 24h
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {cards.map(({ Icon, value, label }) => (
            <div
              key={label}
              className="relative pl-5 sm:text-center sm:pl-0 sm:pt-4"
            >
              {/* Accent stripe : barre verticale teal à gauche (mobile) ou ligne
                  horizontale au-dessus (desktop) — signature visuelle qui
                  différencie ces stats d'un simple paragraphe. */}
              <span
                aria-hidden
                className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-accent-500 sm:left-1/2 sm:-translate-x-1/2 sm:top-0 sm:bottom-auto sm:w-10 sm:h-0.5"
              />
              <div className="flex items-center gap-2 sm:justify-center mb-1 text-accent-700">
                <Icon size={14} strokeWidth={2} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {label}
                </span>
              </div>
              {/* Big number — Fraunces (font-display) pour signature
                  éditoriale, tabular-nums pour l'alignement parfait des
                  chiffres. */}
              <p className="font-display text-5xl sm:text-6xl font-bold text-gray-900 tabular-nums leading-none tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
