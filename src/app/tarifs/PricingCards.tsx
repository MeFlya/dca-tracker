"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { track } from "@/lib/analytics";

type Feature = { label: string; included: boolean };

type Plan = {
  id: "free" | "premium";
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyTotal: number;
  yearlyPerMonth: number;
  features: Feature[];
  cta: string;
  ctaHref: string;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Pour découvrir et simuler",
    monthlyPrice: 0,
    yearlyTotal: 0,
    yearlyPerMonth: 0,
    cta: "Essayer le simulateur",
    ctaHref: "/simulateur",
    features: [
      { label: "Simulateur DCA (3 scénarios, 30 ans)", included: true },
      { label: "Comparaison ETF (tous les ETF)", included: true },
      { label: "Guides et glossaire", included: true },
      { label: "Lien de partage de simulation", included: true },
      { label: "Export PDF (avec filigrane)", included: true },
      { label: "Analyse Monte Carlo (1 000 scénarios)", included: false },
      { label: "Suivi mensuel de stratégie", included: false },
      { label: "Comparaison A vs B", included: false },
      { label: "Simulations sauvegardées", included: false },
      { label: "Export PDF sans filigrane", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Le cockpit DCA complet",
    monthlyPrice: 4.9,
    yearlyTotal: 49,
    yearlyPerMonth: 4.08,
    badge: "Le plus populaire",
    cta: "Choisir Premium",
    ctaHref: "#",
    features: [
      { label: "Tout du plan Gratuit", included: true },
      { label: "Analyse Monte Carlo (1 000 scénarios)", included: true },
      { label: "Suivi mensuel de stratégie + insights", included: true },
      { label: "Comparaison A vs B (deux stratégies)", included: true },
      { label: "Simulations sauvegardées (10 slots)", included: true },
      { label: "Export PDF professionnel (sans filigrane)", included: true },
      { label: "Emails mensuels de suivi", included: true },
      { label: "Support par email", included: true },
    ],
  },
];

// ─── Checkout button ──────────────────────────────────────────────────────────

function CheckoutButton({
  billing,
  label,
}: {
  billing: "monthly" | "yearly";
  label: string;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/tarifs")}`;
      return;
    }
    track({ name: "start_trial", props: { billing } });
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "premium", billing }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Erreur lors de la création du paiement.");
      }
    } catch {
      alert("Erreur réseau — réessayez dans quelques secondes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      <button
        onClick={handleClick}
        disabled={!isLoaded || loading}
        className="w-full text-center text-sm font-semibold py-2.5 px-4 rounded-xl transition-all block bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
      >
        {loading ? "Chargement…" : isSignedIn ? `${label} — 7 jours gratuits` : "Créer un compte"}
      </button>
      <p className="text-[11px] text-gray-500 text-center mt-2">
        Essai gratuit 7 jours · annulable à tout moment
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingCards() {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="mb-20">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-500"}`}>
          Mensuel
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          aria-label="Basculer entre tarif mensuel et annuel"
          onClick={() => setYearly((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors ${yearly ? "bg-primary-600" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${yearly ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? "text-gray-900" : "text-gray-500"}`}>
          Annuel
          <span className="bg-gain-light text-gain-dark text-xs font-bold px-2 py-0.5 rounded-full">−17 %</span>
        </span>
      </div>

      {/* Cards — 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearlyPerMonth : plan.monthlyPrice;
          const isHighlight = plan.id === "premium";
          const billing: "monthly" | "yearly" = yearly ? "yearly" : "monthly";

          return (
            <div key={plan.id} id={plan.id} className="relative">
              {/* Premium card : effets empilés pour vraiment marquer la différence.
                  1. Halo flou coloré derrière (visible au-delà de la card)
                  2. Bordure gradient animée qui sweep (primary → indigo → sky)
                  3. Card blanche opaque par dessus */}
              {isHighlight && (
                <>
                  {/* Halo flou — plus grand que la card, visible autour */}
                  <div
                    className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary-400/40 via-indigo-400/30 to-sky-400/30 blur-2xl animate-breathe pointer-events-none"
                    aria-hidden
                  />
                  {/* Bordure animée — 4 couleurs pour un vrai sweep visible */}
                  <div
                    className="absolute -inset-[3px] rounded-2xl bg-gradient-to-r from-primary-400 via-indigo-500 via-sky-400 to-primary-500 animate-gradient pointer-events-none"
                    aria-hidden
                  />
                </>
              )}
              <div
                className={`relative flex flex-col rounded-2xl p-6 h-full transition-all ${
                  isHighlight
                    ? "bg-white shadow-card-lg"
                    : "border border-slate-200/70 bg-white"
                }`}
              >
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
                  isHighlight ? "text-primary-600" : "text-gray-500"
                }`}>
                  {plan.tagline}
                </p>
                {/* Plan name: H2 (not H3) to maintain a valid H1→H2→H3 order
                    — the page H1 is the hero "Commencez gratuitement". Visual
                    styling preserved via className (text-xl, not h2-default). */}
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  {plan.name}
                </h2>

                <div className="flex items-end gap-1.5">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">
                      Gratuit
                    </span>
                  ) : (
                    <>
                      {/* key on billing mode triggers a fade-in each time the
                          user toggles monthly ↔ yearly. No flicker for
                          numerically identical values because the formatted
                          string changes ("4,90" vs "4,08"). */}
                      <span
                        key={`${plan.id}-${yearly ? "y" : "m"}`}
                        className="text-4xl font-bold text-gray-900 tabular-nums animate-fade-in"
                      >
                        {price.toFixed(2).replace(".", ",")} €
                      </span>
                      <span className="text-sm mb-1 text-gray-500">
                        /mois
                      </span>
                    </>
                  )}
                </div>
                {plan.monthlyPrice > 0 && yearly && (
                  <p className="text-xs mt-1 text-gray-500">
                    Facturé {plan.yearlyTotal} € / an
                    <span className="ml-2 font-semibold text-gain-default">
                      (économisez {Math.round(plan.monthlyPrice * 12 - plan.yearlyTotal)} €)
                    </span>
                  </p>
                )}
                {plan.monthlyPrice > 0 && !yearly && (
                  <p className="text-xs mt-1 text-gray-500">
                    Ou {plan.yearlyPerMonth.toFixed(2).replace(".", ",")} €/mois facturé annuellement
                  </p>
                )}
              </div>

              {/* CTA */}
              {plan.id === "free" ? (
                <Link
                  href={plan.ctaHref}
                  className="w-full text-center text-sm font-semibold py-2.5 px-4 rounded-xl transition-all mb-6 block border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                >
                  {plan.cta}
                </Link>
              ) : (
                <CheckoutButton billing={billing} label={plan.cta} />
              )}

              {/* Feature list */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-gain-default" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
                        <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className={`leading-snug ${!f.included ? "text-gray-500" : "text-gray-700"}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        7 jours d&apos;essai gratuit · TVA incluse · Annulation en 1 clic
      </p>
    </section>
  );
}
