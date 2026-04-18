"use client";

import { useState } from "react";

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Erreur — réessayez dans quelques secondes.");
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
