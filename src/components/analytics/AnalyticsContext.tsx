"use client";

// Sets the global analytics context (plan, device) once per client session.
// Mount in root layout so every subsequent track() call gets the context.
//
// Reads plan from Clerk's useUser() — falls back to "free" if not signed in.
//
// 14/10/2026 — mesure aussi la création de compte (/evt/compte/cree, voir
// mesurerEtape dans src/lib/analytics.ts). Monté dans le layout racine, il
// voit le premier chargement de page d'un compte tout neuf, où que Clerk
// renvoie après l'inscription (/account, /tarifs?checkout=premium, le
// simulateur…). Compte créé il y a moins de 30 minutes, une seule fois par
// navigateur. Rien sur l'identité : le chemin est fixe.

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { mesurerEtape, setAnalyticsContext } from "@/lib/analytics";

/** Fenêtre après la création du compte pendant laquelle on la compte. */
const FENETRE_COMPTE_NEUF_MS = 30 * 60_000;

export function AnalyticsContextProvider() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const plan = (user?.publicMetadata?.plan as string) ?? "free";
    const device = typeof window !== "undefined" && window.innerWidth < 768
      ? "mobile"
      : "desktop";

    setAnalyticsContext({ plan, device });

    const creeLe = user?.createdAt ? new Date(user.createdAt).getTime() : NaN;
    if (Number.isFinite(creeLe) && Date.now() - creeLe < FENETRE_COMPTE_NEUF_MS) {
      mesurerEtape({ etape: "compte-cree" }, { portee: "navigateur" });
    }
  }, [user, isLoaded]);

  return null;
}
