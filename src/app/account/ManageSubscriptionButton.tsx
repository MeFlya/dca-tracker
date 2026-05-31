"use client";

import { useState } from "react";

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      // Avant : un échec (ex: 400 "aucun abonnement Stripe" pour un compte
      // passé Premium manuellement) ne renvoyait pas d'url → le bouton ne
      // faisait RIEN, sans feedback. Maintenant on surface le message.
      alert(
        data.error ??
          "Impossible d'ouvrir la gestion de l'abonnement. Si vous venez de vous abonner, réessayez dans une minute.",
      );
    } catch {
      alert("Erreur réseau — réessayez dans quelques secondes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-gray-500 hover:text-gray-700 underline underline-offset-2 disabled:opacity-50"
    >
      {loading ? "Chargement…" : "Gérer l'abonnement"}
    </button>
  );
}
