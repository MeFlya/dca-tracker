"use client";

// Statut Premium du visiteur pour une page STATIQUE (30/10/2026).
//
// /simulateur et /backtest sont prérendues au build et servies par le CDN :
// elles ne savent plus qui les regarde. Ce hook pose la question au serveur,
// dans le navigateur, une seule fois par page vue :
//   · visiteur déconnecté (ou Clerk pas encore chargé) → false, sans requête ;
//   · visiteur connecté → GET /api/abonnement, qui lit le plan côté serveur
//     (getUserSubscription), jamais useUser().publicMetadata.
//
// Prix : un abonné voit la version gratuite le temps de la réponse, puis la
// page se déverrouille. Le sens du repli ne change pas : une erreur réseau ou
// d'authentification laisse « gratuit », elle n'ouvre jamais une
// fonctionnalité payante. Ce booléen ne protège que de l'affichage ; ce qui se
// vend reste vérifié côté serveur (/api/simulator/monte-carlo).

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export function usePremium(): boolean {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setPremium(false);
      return;
    }
    let annule = false;
    fetch("/api/abonnement", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { premium?: unknown } | null) => {
        if (!annule) setPremium(d?.premium === true);
      })
      .catch(() => {
        if (!annule) setPremium(false);
      });
    return () => {
      annule = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  return premium;
}
