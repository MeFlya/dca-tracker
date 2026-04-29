"use client";

// Lifetime Deal — accès à vie pour les early adopters.
//
// ⚠️ DÉSACTIVÉ par défaut. Pour activer :
//   1. Crée un product one-time dans Stripe (Dashboard → Products → New
//      product → "One-time price").
//   2. Ajoute les env vars Vercel :
//        ENABLE_LIFETIME_DEAL=true
//        STRIPE_LIFETIME_PRICE_ID=price_xxx
//        NEXT_PUBLIC_LIFETIME_PRICE_EUR=99       (ex: 99)
//        NEXT_PUBLIC_LIFETIME_CAP=50             (nombre de places)
//        NEXT_PUBLIC_LIFETIME_SOLD=0             (incrémenté manuellement
//                                                ou via cron à terme)
//        NEXT_PUBLIC_LIFETIME_DEADLINE=2026-06-30
//   3. Câbler dans le webhook checkout.session.completed le flag
//      "lifetimeUntil" / plan="premium" sans expiration côté Clerk metadata.
//
// La card s'affiche automatiquement sur /tarifs si ENABLE_LIFETIME_DEAL=true
// est exposé via NEXT_PUBLIC_ENABLE_LIFETIME_DEAL=true (build-time flag).
//
// Pourquoi un composant séparé : isolement total du reste du pricing pour
// pouvoir l'enlever / le modifier / l'A/B-tester sans toucher au flow Premium.

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { track } from "@/lib/analytics";

export function LifetimePricingCard() {
  // Flag exposé au build (NEXT_PUBLIC_…). À ne pas confondre avec
  // ENABLE_LIFETIME_DEAL qui est l'équivalent côté serveur (route checkout).
  if (process.env.NEXT_PUBLIC_ENABLE_LIFETIME_DEAL !== "true") {
    return null;
  }

  return <LifetimeCardInner />;
}

function LifetimeCardInner() {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  const priceEur = process.env.NEXT_PUBLIC_LIFETIME_PRICE_EUR ?? "99";
  const cap = Number(process.env.NEXT_PUBLIC_LIFETIME_CAP ?? "50");
  const sold = Number(process.env.NEXT_PUBLIC_LIFETIME_SOLD ?? "0");
  const remaining = Math.max(0, cap - sold);
  const deadline = process.env.NEXT_PUBLIC_LIFETIME_DEADLINE;

  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      })
    : null;

  async function handleClick() {
    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent("/tarifs")}`;
      return;
    }
    track({ name: "open_upgrade", props: { feature: "lifetime" } });
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout-lifetime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-1">
        <div className="rounded-[20px] bg-slate-950 p-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Offre fondateur — accès à vie
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            Premium à vie pour {priceEur} €
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8">
            Un seul paiement, accès Premium <strong className="text-white">pour toujours</strong>.
            Pour les 50 premiers investisseurs qui parient sur l&apos;outil.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{remaining}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
                / {cap} places
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{priceEur} €</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
                paiement unique
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">
                accès à vie
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleClick}
            disabled={!isLoaded || loading || remaining === 0}
            className="inline-flex items-center gap-2 bg-white text-slate-950 font-bold text-sm px-7 py-3 rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Chargement…"
              : remaining === 0
              ? "Toutes les places sont prises"
              : isSignedIn
              ? "Réserver ma place →"
              : "Créer un compte pour réserver"}
          </button>

          {deadlineLabel && remaining > 0 && (
            <p className="text-[11px] text-slate-400 mt-4">
              Offre limitée — fin le {deadlineLabel}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
