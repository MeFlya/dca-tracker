"use client";

// Bouton CTA "Essayer Premium" qui déclenche DIRECTEMENT le Stripe Checkout
// (pas de redirection intermédiaire vers /tarifs).
//
// Pourquoi : avant ce composant, plusieurs CTA "Essayer Premium" (sur /upgrade
// notamment) renvoyaient vers /tarifs#premium, où l'user devait re-cliquer un
// 2e bouton pour atterrir sur Stripe. Chaque step intermédiaire perd 30-50 %
// des clics. Maintenant : 1 clic = 1 redirection Stripe.
//
// Logique : mêmes appels que CheckoutButton dans PricingCards.tsx
// (POST /api/stripe/checkout + redirection + event start_trial).
//
// Note : si on veut un jour A/B tester un flux sans CB (Sprint 2 #10 de
// l'audit), il suffira d'ajouter une prop `withCb` ici. Pour l'instant,
// `with_cb: true` est hardcoded car c'est le seul flux qui existe côté
// Stripe.

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { track } from "@/lib/analytics";

interface Props {
  /**
   * Type de facturation à l'arrivée sur Stripe.
   * Par défaut "yearly" (meilleure LTV + remise 17 %, c'est le toggle par
   * défaut sur /tarifs aussi). L'user peut changer côté Stripe si besoin.
   */
  billing?: "monthly" | "yearly";

  /**
   * Texte du bouton avant le suffixe " — 7 jours gratuits".
   * Defaults to "Essayer Premium".
   */
  label?: string;

  /**
   * Classes Tailwind du bouton. Si non fourni, utilise le style btn-primary
   * standard. Permet à chaque appelant de garder son look (dark slate sur
   * /tarifs, btn-primary bleu sur /upgrade, etc.).
   */
  className?: string;

  /**
   * Ligne de réassurance sous le bouton. `null` ou `false` pour la cacher.
   * Default : "7 jours d'essai gratuit · Annulation en 1 clic".
   */
  fineprint?: React.ReactNode;

  /**
   * Classes Tailwind du paragraphe fineprint. Adapté selon fond clair ou dark.
   */
  fineprintClassName?: string;
}

const DEFAULT_FINEPRINT = "7 jours d'essai gratuit · Annulation en 1 clic";
const DEFAULT_BUTTON_CLASS =
  "btn-primary text-base px-8 py-4 text-center inline-flex items-center justify-center w-full";
const DEFAULT_FINEPRINT_CLASS = "text-xs text-gray-500 mt-3 text-center";

export function PremiumCheckoutButton({
  billing = "yearly",
  label = "Essayer Premium",
  className = DEFAULT_BUTTON_CLASS,
  fineprint = DEFAULT_FINEPRINT,
  fineprintClassName = DEFAULT_FINEPRINT_CLASS,
}: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    // Pas signé → on envoie vers signup avec retour sur la page courante
    // (pour que l'user retombe sur le contexte qui l'a fait cliquer).
    if (!isSignedIn) {
      const redirectUrl =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/tarifs";
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`;
      return;
    }

    // Event funnel — utile pour mesurer le ratio trial / paid / churn
    // par billing (monthly vs yearly) et par flux CB / sans-CB (futur A/B).
    track({ name: "start_trial", props: { billing, with_cb: true } });

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
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!isLoaded || loading}
        className={`${className} disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading
          ? "Chargement…"
          : isSignedIn
            ? `${label} — 7 jours gratuits →`
            : "Créer un compte"}
      </button>
      {fineprint !== null && fineprint !== false && (
        <p className={fineprintClassName}>{fineprint}</p>
      )}
    </>
  );
}
