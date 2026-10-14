"use client";

// Envoie la page vue fictive d'une étape du tunnel (/evt/…) au montage,
// une seule fois par clé — voir mesurerEtape et le tableau des chemins dans
// src/lib/analytics.ts. Pour les pages serveur (merci, succès) qui ne peuvent
// pas appeler pageview() elles-mêmes.

import { useEffect } from "react";
import { mesurerEtape, type EtapeMesuree } from "@/lib/analytics";

export function MesureEtape({
  etape,
  portee,
  cle,
}: {
  etape: EtapeMesuree;
  portee?: "onglet" | "navigateur";
  /** Ce qui rend l'étape unique (ex. la session Stripe). Reste dans le navigateur. */
  cle?: string;
}) {
  useEffect(() => {
    mesurerEtape(etape, { portee, cle });
    // Une étape par montage : l'objet `etape` est recréé à chaque rendu
    // serveur, son contenu ne change pas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
