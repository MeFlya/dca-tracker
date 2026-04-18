"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Feature = {
  label: string;
  /** true = included, false = not in this tier */
  included: boolean;
  /** true = feature exists but not built yet */
  soon?: boolean;
};

type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyTotal: number;
  yearlyPerMonth: number;
  savePercent: number;
  features: Feature[];
  cta: string;
  ctaHref: string;
  ctaStyle: "ghost" | "primary" | "dark";
  badge?: string;
};

// ─── Plan definitions ─────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Pour découvrir et simuler",
    monthlyPrice: 0,
    yearlyTotal: 0,
    yearlyPerMonth: 0,
    savePercent: 0,
    ctaStyle: "ghost",
    cta: "Essayer le simulateur",
    ctaHref: "/simulateur",
    features: [
      { label: "Simulateur DCA (3 scénarios, 30 ans)", included: true },
      { label: "Comparaison ETF (tous les ETF)", included: true },
      { label: "Guides et articles éducatifs", included: true },
      { label: "Données de marché (délai ~15 min)", included: true },
      { label: "Export PDF (avec filigrane)", included: true },
      { label: "Lien de partage de simulation", included: true },
      { label: "Simulations sauvegardées", included: false },
      { label: "Calculateur fiscal PEA / CTO", included: false },
      { label: "Comparaison de scénarios (A vs B)", included: false },
      { label: "Rappels DCA automatiques", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Pour investisseurs actifs",
    monthlyPrice: 4.9,
    yearlyTotal: 39,
    yearlyPerMonth: 3.25,
    savePercent: 34,
    badge: "Le plus populaire",
    ctaStyle: "primary",
    cta: "Être notifié au lancement",
    ctaHref: "#acces-anticipe",
    features: [
      { label: "Tout du plan Gratuit", included: true },
      { label: "Export PDF professionnel (sans filigrane)", included: true },
      { label: "Données de marché en temps réel", included: true, soon: true },
      { label: "Simulations sauvegardées (10 slots)", included: true, soon: true },
      { label: "Comparaison de scénarios (A vs B)", included: true, soon: true },
      { label: "Calculateur d'avantage fiscal PEA / CTO", included: true, soon: true },
      { label: "Rappels DCA automatiques par email", included: true, soon: true },
      { label: "Suivi de portefeuille réel", included: false },
      { label: "Simulation multi-ETF pondérée", included: false },
      { label: "Monte Carlo (1 000+ scénarios)", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour investisseurs avancés",
    monthlyPrice: 9.9,
    yearlyTotal: 79,
    yearlyPerMonth: 6.58,
    savePercent: 34,
    ctaStyle: "dark",
    cta: "Rejoindre l'accès anticipé",
    ctaHref: "#acces-anticipe",
    features: [
      { label: "Tout du plan Premium", included: true },
      { label: "Simulations illimitées sauvegardées", included: true, soon: true },
      { label: "Suivi de portefeuille réel vs projection", included: true, soon: true },
      { label: "Simulation multi-ETF pondérée", included: true, soon: true },
      { label: "Monte Carlo (1 000+ scénarios)", included: true, soon: true },
      { label: "Récapitulatif fiscal annuel (déclaration)", included: true, soon: true },
      { label: "Accès anticipé aux nouvelles fonctions", included: true },
      { label: "Support prioritaire", included: true },
      { label: "—", included: false },
      { label: "—", included: false },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingCards() {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="mb-20">

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-400"}`}>
          Mensuel
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors ${yearly ? "bg-primary-600" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${yearly ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? "text-gray-900" : "text-gray-400"}`}>
          Annuel
          <span className="bg-gain-light text-gain-dark text-xs font-bold px-2 py-0.5 rounded-full">
            −33 %
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearlyPerMonth : plan.monthlyPrice;
          const isHighlight = plan.id === "premium";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                isHighlight
                  ? "border-primary-400 shadow-card-lg ring-2 ring-primary-500 ring-offset-2"
                  : plan.id === "pro"
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${
                  plan.id === "pro" ? "text-slate-400" : isHighlight ? "text-primary-600" : "text-gray-400"
                }`}>
                  {plan.tagline}
                </p>
                <h3 className={`text-xl font-bold mb-4 ${plan.id === "pro" ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-end gap-1.5">
                  {plan.monthlyPrice === 0 ? (
                    <span className={`text-4xl font-bold ${plan.id === "pro" ? "text-white" : "text-gray-900"}`}>
                      Gratuit
                    </span>
                  ) : (
                    <>
                      <span className={`text-4xl font-bold ${plan.id === "pro" ? "text-white" : "text-gray-900"}`}>
                        {price.toFixed(2).replace(".", ",")} €
                      </span>
                      <span className={`text-sm mb-1 ${plan.id === "pro" ? "text-slate-400" : "text-gray-400"}`}>
                        /mois
                      </span>
                    </>
                  )}
                </div>
                {plan.monthlyPrice > 0 && yearly && (
                  <p className={`text-xs mt-1 ${plan.id === "pro" ? "text-slate-400" : "text-gray-400"}`}>
                    Facturé {plan.yearlyTotal} € / an
                    <span className={`ml-2 font-semibold ${plan.id === "pro" ? "text-green-400" : "text-gain-default"}`}>
                      (économisez {Math.round(plan.monthlyPrice * 12 - plan.yearlyTotal)} €)
                    </span>
                  </p>
                )}
                {plan.monthlyPrice > 0 && !yearly && (
                  <p className={`text-xs mt-1 ${plan.id === "pro" ? "text-slate-400" : "text-gray-400"}`}>
                    Ou {plan.yearlyPerMonth.toFixed(2).replace(".", ",")} €/mois facturé annuellement
                  </p>
                )}
              </div>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`w-full text-center text-sm font-semibold py-2.5 px-4 rounded-xl transition-all mb-6 block ${
                  plan.ctaStyle === "primary"
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : plan.ctaStyle === "dark"
                    ? "bg-white text-slate-900 hover:bg-gray-100"
                    : "border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Feature list */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, i) => {
                  if (f.label === "—" && !f.included) return <li key={i} className="h-5" />;
                  return (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <svg className={`w-4 h-4 shrink-0 mt-0.5 ${plan.id === "pro" ? "text-green-400" : "text-gain-default"}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
                          <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 shrink-0 mt-0.5 text-gray-300" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      <span className={`leading-snug ${
                        !f.included
                          ? plan.id === "pro" ? "text-slate-600" : "text-gray-300"
                          : plan.id === "pro" ? "text-slate-200" : "text-gray-700"
                      }`}>
                        {f.label}
                        {f.soon && f.included && (
                          <span className={`ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full align-middle ${
                            plan.id === "pro"
                              ? "bg-slate-700 text-slate-300"
                              : "bg-primary-100 text-primary-600"
                          }`}>
                            Bientôt
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Tous les prix incluent la TVA · Pas d&apos;engagement · Annulation à tout moment
      </p>
    </section>
  );
}
