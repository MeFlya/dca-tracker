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

/**
 * En-tête `Authorization: Bearer <jeton de session>` pour un appel /api lancé
 * AUTOMATIQUEMENT depuis une page statique (30/10/2026).
 *
 * Le cookie __session ne vit que 60 s. Tant que le middleware tournait sur
 * toutes les pages, Clerk le rafraîchissait au chargement du document
 * (handshake) avant tout appel. Les pages publiques ne passent plus par le
 * middleware : un abonné qui revient après une minute arrive avec un cookie
 * périmé, et un appel parti avant que clerk-js ne l'ait renouvelé est vu
 * déconnecté (un POST n'est jamais rafraîchi côté serveur). getToken()
 * renvoie, lui, un jeton valide, renouvelé au besoin ; le middleware le lit
 * dans l'en-tête aussi bien que dans le cookie.
 *
 * À n'appeler que si useAuth() dit isLoaded && isSignedIn : getToken() attend
 * le chargement de Clerk, indéfiniment si clerk-js ne se charge jamais
 * (bloqueur de publicité). Sans jeton, aucun en-tête : l'appel part avec le
 * cookie, comme avant.
 */
export async function enTeteSession(
  getToken: () => Promise<string | null>,
): Promise<Record<string, string>> {
  const jeton = await getToken().catch(() => null);
  return jeton ? { Authorization: `Bearer ${jeton}` } : {};
}

export function usePremium(): boolean {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setPremium(false);
      return;
    }
    let annule = false;
    enTeteSession(getToken)
      .then((headers) =>
        fetch("/api/abonnement", { cache: "no-store", credentials: "same-origin", headers }),
      )
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
  }, [isLoaded, isSignedIn, userId, getToken]);

  return premium;
}
