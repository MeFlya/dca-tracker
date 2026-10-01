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
//
// 01/10/2026 — refonte des pages Ressources : props de PRÉSENTATION seulement
// (`note`, `ton`, `libelle`). Le clic, l'appel à /api/products/checkout, son
// corps { productId, origine }, le suivi et l'état « Bientôt disponible » ne
// changent pas. Le hero, l'appel final et la barre collante utilisent tous ce
// même composant.

import { useState } from "react";
import { track } from "@/lib/analytics";
import { figerOrigineDeLAchat } from "@/lib/origine-achat";

interface Props {
  productId: string;
  priceEur: number;
  /** false tant que le price ID Stripe n'est pas en env → état "bientôt". */
  available: boolean;
  className?: string;
  /**
   * Ligne sous le bouton. `null` = aucune, quand le bloc parent porte déjà la
   * réassurance (une seule ligne par bouton, pas plus).
   */
  note?: string | null;
  /** Contraste de la note selon le fond : clair → gris, sombre → slate-400. */
  ton?: "clair" | "sombre";
  /** Libellé du bouton, par exemple « Acheter » dans la barre collante. */
  libelle?: string;
}

const NOTE_PAR_DEFAUT =
  "Livraison immédiate par email · Facture automatique · Paiement sécurisé Stripe";

export function ProductBuyButton({
  productId,
  priceEur,
  available,
  className = "btn-primary text-base px-8 py-3.5 inline-flex items-center justify-center w-full sm:w-auto",
  note = NOTE_PAR_DEFAUT,
  ton = "clair",
  libelle,
}: Props) {
  const [loading, setLoading] = useState(false);
  const couleurNote = ton === "sombre" ? "text-slate-400" : "text-gray-500";

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
        <p className={`text-xs ${couleurNote} mt-2`}>
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
        {loading
          ? "Redirection…"
          : (libelle ?? `Acheter — ${priceEur}\u00a0€ (paiement unique)`)}
      </button>
      {note && <p className={`text-xs ${couleurNote} mt-2`}>{note}</p>}
    </div>
  );
}
