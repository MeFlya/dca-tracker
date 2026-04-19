"use client";

// Sets the global analytics context (plan, device) once per client session.
// Mount in root layout so every subsequent track() call gets the context.
//
// Reads plan from Clerk's useUser() — falls back to "free" if not signed in.

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { setAnalyticsContext } from "@/lib/analytics";

export function AnalyticsContextProvider() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const plan = (user?.publicMetadata?.plan as string) ?? "free";
    const device = typeof window !== "undefined" && window.innerWidth < 768
      ? "mobile"
      : "desktop";

    setAnalyticsContext({ plan, device });
  }, [user, isLoaded]);

  return null;
}
