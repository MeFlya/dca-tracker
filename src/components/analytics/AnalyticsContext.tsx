"use client";

// Sets the global analytics context (plan, device) once per client session.
// Mount in root layout so every subsequent track() call gets the context.
//
// Reads plan from useCompte() (sans Clerk, voir compte/etat-compte.ts) —
// "free" if not signed in.

import { useEffect } from "react";
import { useCompte } from "@/components/compte/etat-compte";
import { setAnalyticsContext } from "@/lib/analytics";

export function AnalyticsContextProvider() {
  const { isLoaded, plan } = useCompte();

  useEffect(() => {
    if (!isLoaded) return;

    const device = typeof window !== "undefined" && window.innerWidth < 768
      ? "mobile"
      : "desktop";

    setAnalyticsContext({ plan, device });
  }, [plan, isLoaded]);

  return null;
}
