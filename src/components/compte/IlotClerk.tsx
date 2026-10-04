"use client";

// Monte Clerk seulement quand il sert (voir etat-compte.ts) : session annoncée
// par le cookie, composant Clerk sur la page, ou intention d'aller se
// connecter. Sinon : rien, ni script ni requête vers Clerk.

import { useEffect, useState, type ComponentType } from "react";
import { flushSync } from "react-dom";
import {
  activerClerk,
  clerkActifAuDemarrage,
  estRouteClerk,
  sessionClerkPresente,
  useClerkActif,
} from "./etat-compte";

// Même nom de morceau que l'import d'EmplacementClerk : sans lui, webpack
// faisait deux groupes, et le préchargement de /sign-in visait l'autre.
const chargerClerkActif = () => import(/* webpackChunkName: "clerk-ilot" */ "./ClerkActif");

// Session annoncée ou page de connexion : le morceau de Clerk part dès
// l'évaluation de ce module, en parallèle de l'hydratation, au lieu
// d'attendre qu'elle se termine.
if (typeof window !== "undefined" && clerkActifAuDemarrage()) {
  void chargerClerkActif();
}

export function IlotClerk() {
  const actif = useClerkActif();
  const [ClerkActif, setClerkActif] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!actif) return;
    let annule = false;
    void chargerClerkActif().then(({ default: composant }) => {
      if (annule) return;
      // Rendu et validation du provider dans la même tâche, sans
      // interruption. Le constructeur d'IsomorphicClerk insère le script de
      // Clerk PENDANT le rendu, et ce script se retire du DOM une fois chargé.
      // Validé plus tard (rendu concurrent interrompu, ou suspendu comme avec
      // next/dynamic), le <script> que rend ClerkProvider ne le retrouvait
      // plus et React en insérait un second : clerk.browser.js (320 Ko)
      // exécuté deux fois, constaté le 04/10/2026 sur une arrivée directe
      // sur /sign-in. Validé tout de suite, React adopte le script de Clerk.
      flushSync(() => setClerkActif(() => composant));
    });
    return () => {
      annule = true;
    };
  }, [actif]);

  useEffect(() => {
    if (actif) return;

    // Survol, toucher ou focus d'un lien vers /sign-in ou /sign-up : Clerk se
    // charge pendant que le visiteur clique, et le formulaire n'arrive pas
    // vide après la navigation. (`pointerover` couvre aussi le toucher : il
    // précède `pointerdown`.)
    function surIntention(e: Event) {
      const lien = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (lien instanceof HTMLAnchorElement && lien.origin === window.location.origin && estRouteClerk(lien.pathname)) {
        activerClerk();
      }
    }
    // Connexion faite dans un autre onglet : la session apparaît au retour.
    function surRetour() {
      if (document.visibilityState === "visible" && sessionClerkPresente()) activerClerk();
    }

    const options = { capture: true, passive: true };
    document.addEventListener("pointerover", surIntention, options);
    document.addEventListener("focusin", surIntention, options);
    document.addEventListener("visibilitychange", surRetour);
    window.addEventListener("focus", surRetour);
    return () => {
      document.removeEventListener("pointerover", surIntention, options);
      document.removeEventListener("focusin", surIntention, options);
      document.removeEventListener("visibilitychange", surRetour);
      window.removeEventListener("focus", surRetour);
    };
  }, [actif]);

  return ClerkActif ? <ClerkActif /> : null;
}
