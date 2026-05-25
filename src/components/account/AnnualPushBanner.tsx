"use client";

// Banner in-app pour pousser le passage du mensuel à l'annuel.
//
// Pourquoi : l'annuel à 49 €/an vs 4,90 €/mois × 12 = -17 % pour l'user,
// mais surtout LTV ×3-5 pour le produit car bypass le churn mois 2-4
// (la majorité des annulations arrivent entre mois 1 et 4 du mensuel).
//
// Comportement :
//   - S'affiche uniquement aux users Premium en facturation mensuelle
//     ET souscrits depuis ≥ 14 jours (laisser passer la période d'essai +
//     premier mois pour ne pas spammer un user qui vient de payer)
//   - Stocke un dismiss dans localStorage (24h cooldown — pas définitif,
//     pour qu'il revienne si l'user a juste cliqué pour fermer rapidement)
//   - Lien direct vers /tarifs pour bascule

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";

interface Props {
  subscriptionInterval: "month" | "year" | null;
  subscribedAt: string | null;
}

const DISMISS_KEY = "dca_annual_banner_dismissed_at";
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const ELIGIBILITY_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

export function AnnualPushBanner({
  subscriptionInterval,
  subscribedAt,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Server-only check first : ne montre pas aux annuels ni aux users
    // sans subscribedAt valide
    if (subscriptionInterval !== "month") return;
    if (!subscribedAt) return;

    const subscribedTime = new Date(subscribedAt).getTime();
    if (Number.isNaN(subscribedTime)) return;

    // Ne pas montrer avant 14 jours de souscription
    if (Date.now() - subscribedTime < ELIGIBILITY_DELAY_MS) return;

    // Check dismiss cooldown via localStorage
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < DISMISS_COOLDOWN_MS) return;
      }
    } catch {
      // localStorage indisponible (private mode Safari) → afficher quand même
    }

    setVisible(true);
    track({ name: "annual_banner_shown" });
  }, [subscriptionInterval, subscribedAt]);

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ignored — au pire le banner s'affichera encore au prochain refresh
    }
    track({ name: "annual_banner_dismiss" });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 p-5 mb-6 overflow-hidden"
      role="region"
      aria-label="Économisez en passant à l'abonnement annuel"
    >
      {/* Halo subtil derrière */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(251, 191, 36, 0.25), transparent 70%)",
        }}
        aria-hidden
      />

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Fermer"
      >
        <X size={14} />
      </button>

      <div className="relative flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Sparkles size={18} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1">
            Économisez 17 %
          </p>
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-1.5">
            Passez à l&apos;abonnement annuel
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            49&nbsp;€/an au lieu de 4,90&nbsp;€/mois × 12 = <strong>9,80&nbsp;€ économisés</strong>{" "}
            chaque année, et plus de friction à chaque renouvellement mensuel.
          </p>
          <Link
            href="/tarifs"
            onClick={() => track({ name: "annual_banner_click" })}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors"
          >
            Voir l&apos;offre annuelle <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
