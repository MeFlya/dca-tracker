"use client";

import { useState } from "react";

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      // Cas normal d'un vrai abonné : le portail Stripe s'ouvre — c'est LA
      // page où l'on gère et résilie son abonnement.
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      // Cas sans abonnement Stripe (ex: accès Premium attribué manuellement,
      // ou customer non encore propagé) : pas d'erreur affichée — on emmène
      // l'user vers la page de gestion de compte plutôt qu'un dead-end.
      window.location.href = "/account/settings";
    } catch {
      // Échec réseau pur → fallback vers la même page de gestion.
      window.location.href = "/account/settings";
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
