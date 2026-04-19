"use client";

import { useEffect, useRef } from "react";

/**
 * Fires POST /api/onboarding/welcome once per mount.
 * Server-side dedupes via Clerk metadata, so repeat calls are harmless.
 * Rendered inside /account so authenticated users trigger the sequence
 * on their first visit.
 */
export function OnboardingEmailTrigger() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch("/api/onboarding/welcome", { method: "POST" }).catch((err) => {
      console.warn("[onboarding] schedule failed (non-blocking):", err);
    });
  }, []);

  return null;
}
