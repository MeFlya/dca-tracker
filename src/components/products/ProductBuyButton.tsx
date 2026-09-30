"use client";

// Bouton d'achat des produits digitaux → Stripe Checkout (mode payment).
// Pas de compte requis (checkout invité) — Stripe collecte l'email.
// Si le produit n'a pas encore de prix Stripe configuré (available=false),
// on affiche un état "bientôt disponible" au lieu d'un bouton qui échoue.
//
// 30/09/2026 — la demande de paiement emporte `origine` : la page du site d'où
// vient l'acheteur (dernier renvoi cliqué, sinon référent). L'API la pose dans
// les métadonnées Stripe ; voir src/lib/origine-achat.ts pour la lire. Elle est
// figée au clic pour qu'un second essai après annulation sur Stripe ne parte
// pas avec « externe:checkout.stripe.com ».

import { useState } from "react";
import { track } from "@/lib/analytics";
import { figerOrigineDeLAchat } from "@/lib/origine-achat";

interface Props {
  productId: string;
  priceEur: number;
  /** false tant que le price ID Stripe n'est pas en env → état "bientôt". */
  available: boolean;
  className?: string;
}

export function ProductBuyButton({
  productId,
  priceEur,
  available,
  className = "btn-primary text-base px-8 py-3.5 inline-flex items-center justify-center w-full sm:w-auto",
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!available) {
    return (
      <div>
        <button
          type="button"
          disabled
          className={`${className} opacity-60 cursor-not-allowed`}
        >
          Bientôt disponible
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Ouverture des ventes très prochainement.
        </p>
      </div>
    );
  }

  async function handleClick() {
    track({ name: "product_checkout_click", props: { product_id: productId } });
    setLoading(true);
    try {
      const res = await fetch("/api/products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, origine: figerOrigineDeLAchat() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Erreur lors de la création du paiement.");
        setLoading(false);
      }
    } catch {
      alert("Erreur réseau — réessayez dans quelques secondes.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${className} disabled:opacity-60`}
      >
        {loading ? "Redirection…" : `Acheter — ${priceEur} € (paiement unique)`}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Livraison immédiate par email · Facture automatique · Paiement sécurisé
        Stripe
      </p>
    </div>
  );
}
