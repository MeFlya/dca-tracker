"use client";

// Bandeau de réassurance de la home et de /tarifs.
//
// RÈGLE ABSOLUE : aucun chiffre affiché ici n'est inventé.
// - Les métriques d'USAGE (inscrits, stratégies, mois suivis) viennent de
//   /api/stats/public, calculées en direct. Elles ne s'affichent qu'au-dessus
//   d'un seuil : en dessous, un petit compteur dessert plus qu'il ne sert.
//   (Historique : ces valeurs étaient auparavant remplacées par des planchers
//   codés en dur — 247/180/620 — sous un label « Données réelles ». Supprimé.)
// - En dessous du seuil, on affiche des métriques de CONTENU, calculées côté
//   serveur à partir des sources de vérité (listes d'ETF, de comparatifs, jeu
//   de données du backtest) et passées en props. Elles sont modestes mais
//   exactes, et le restent automatiquement quand le contenu grandit.

import { useEffect, useState } from "react";
import { Users, Target, Activity, Scale, BookOpen, LineChart } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";

type PublicStats = {
  users: number;
  strategies: number;
  monthsLogged: number;
};

/** Métriques de contenu calculées côté serveur (voir src/app/page.tsx). */
export type ContentMetrics = {
  comparisons: number;
  glossaryTerms: number;
  backtestMonths: number;
  backtestFromYear: number;
};

/** En dessous de ce nombre d'inscrits, on n'affiche pas les compteurs d'usage. */
const USAGE_DISPLAY_THRESHOLD = 50;

function formatCount(n: number): string {
  // Arrondi d'abord : pendant le count-up, n est un flottant.
  const v = Math.round(n);
  if (v >= 1000) {
    return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(".", ",")} k`;
  }
  return v.toLocaleString("fr-FR");
}

export function LiveSocialProof({ content }: { content?: ContentMetrics }) {
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

  const usageReady = !!stats && stats.users >= USAGE_DISPLAY_THRESHOLD;

  // Tant que l'usage n'a pas atteint le seuil, on montre le contenu — qui, lui,
  // est vrai dès le premier jour. Si aucune métrique de contenu n'est fournie,
  // on ne rend rien plutôt que d'afficher un bloc vide.
  const useContent = !usageReady;
  if (useContent && !content) return null;
  // Évite un saut de mise en page : on attend la réponse avant de trancher.
  if (!loaded) return null;

  const eyebrow = useContent
    ? "Ce que contient le site"
    : "Données réelles · recalculées en continu";

  const cards = useContent
    ? [
        { Icon: Scale, value: content!.comparisons, label: "comparatifs ETF documentés" },
        { Icon: LineChart, value: content!.backtestMonths, label: `mois de données réelles depuis ${content!.backtestFromYear}` },
        { Icon: BookOpen, value: content!.glossaryTerms, label: "termes expliqués au glossaire" },
      ]
    : [
        { Icon: Users, value: stats!.users, label: "investisseurs inscrits" },
        { Icon: Target, value: stats!.strategies, label: "stratégies DCA suivies" },
        { Icon: Activity, value: stats!.monthsLogged, label: "mois de suivi enregistrés" },
      ];

  return (
    <section className="py-12 border-y border-slate-200/70 bg-white animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-700 text-center mb-6">
          {eyebrow}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {cards.map(({ Icon, value, label }) => (
            <div
              key={label}
              className="relative pl-5 sm:text-center sm:pl-0 sm:pt-4"
            >
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
              <p className="font-display text-5xl sm:text-6xl font-bold text-gray-900 tabular-nums leading-none tracking-tight">
                <CountUp value={value} durationMs={1100} format={formatCount} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
