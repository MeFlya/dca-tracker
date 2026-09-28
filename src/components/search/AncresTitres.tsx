"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ancre, texteTitre } from "@/lib/search/ancre";

/**
 * Fait fonctionner les liens « page#titre-de-section » sur tout le site.
 *
 * Sur 692 titres de section, 43 avaient un id : un lien vers un passage
 * précis n'était possible que pour eux. Plutôt que d'ajouter un id à la main
 * dans une soixantaine de pages, l'ancre est calculée depuis le texte du titre
 * (ancre()) — par l'index de recherche au build, et ici au chargement. Quand
 * l'URL porte une ancre qu'aucun id ne porte, on cherche le titre h2/h3 ou la
 * question de FAQ (<summary>) dont le texte donne cette ancre, on ouvre la
 * question si elle est repliée, on fait défiler et on surligne brièvement.
 *
 * Tourne à chaque changement de page (navigation client) et d'ancre.
 */

/** Temps laissé au contenu pour arriver après le squelette de chargement. */
const ATTENTE_MAX_MS = 5000;

const TITRE = /^(H[1-6]|SUMMARY)$/;

function trouver(id: string): HTMLElement | null {
  let cible = document.getElementById(id);
  if (cible) {
    // L'id peut être celui d'un conteneur (<section id>, <div id>) : viser
    // son premier titre (constat n° 44). Aligner le conteneur mettait son
    // titre sous l'en-tête collant, et toute la section clignotait.
    if (!TITRE.test(cible.tagName)) {
      const titre = cible.querySelector<HTMLElement>("h2, h3, summary");
      if (titre) cible = titre;
    }
    return cible;
  }
  for (const el of document.querySelectorAll<HTMLElement>("main h2, main h3, main summary")) {
    if (ancre(texteTitre(el)) === id) return el;
  }
  return null;
}

export function AncresTitres() {
  const pathname = usePathname();

  useEffect(() => {
    let observateur: MutationObserver | null = null;
    let finAttente: number | undefined;
    let defilement: number | undefined;

    const arreterAttente = () => {
      observateur?.disconnect();
      observateur = null;
      window.clearTimeout(finAttente);
    };

    const viser = (cible: HTMLElement) => {
      // Question de FAQ repliée, ou passage dans un bloc replié : on ouvre.
      const details = cible.closest("details");
      if (details && !details.open) details.open = true;

      // Après le défilement que tente Next.js à la navigation. Un seul
      // défilement en attente à la fois.
      window.clearTimeout(defilement);
      defilement = window.setTimeout(() => {
        cible.scrollIntoView({ block: "start", behavior: "auto" });
        const surligne = cible.tagName === "SUMMARY" && details ? details : cible;
        surligne.classList.remove("cible-ancre");
        void surligne.offsetWidth; // relance l'animation
        surligne.classList.add("cible-ancre");
        surligne.addEventListener("animationend", () => surligne.classList.remove("cible-ancre"), {
          once: true,
        });
        // Un titre n'est pas focalisable : tabindex -1 pour y placer le focus
        // (lecteurs d'écran). Un <summary> l'est déjà — surtout ne pas le
        // retirer de l'ordre de tabulation.
        if (cible.tagName !== "SUMMARY" && !cible.hasAttribute("tabindex")) {
          cible.setAttribute("tabindex", "-1");
        }
        cible.focus({ preventScroll: true });
      }, 60);
    };

    const aller = () => {
      arreterAttente();
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      // « #:~:text=… » : fragment de texte, géré par le navigateur.
      if (!id || id.startsWith(":~:")) return;

      const cible = trouver(id);
      if (cible) {
        viser(cible);
        return;
      }

      // Pas encore là (constat n° 15) : /simulateur et /backtest sont
      // dynamiques et ont un loading.tsx. À la navigation, Next affiche
      // d'abord le squelette — pathname a déjà changé, cet effet tourne, ne
      // trouve aucun titre — puis le contenu arrive sans nouveau changement de
      // pathname. On surveille donc <main> (dans le layout racine, il persiste)
      // jusqu'à l'arrivée du titre, 5 s au plus.
      const main = document.querySelector("main");
      if (!main) return;
      observateur = new MutationObserver(() => {
        const trouvee = trouver(id);
        if (!trouvee) return;
        arreterAttente();
        viser(trouvee);
      });
      observateur.observe(main, { childList: true, subtree: true });
      finAttente = window.setTimeout(arreterAttente, ATTENTE_MAX_MS);
    };

    aller();
    window.addEventListener("hashchange", aller);
    return () => {
      window.removeEventListener("hashchange", aller);
      arreterAttente();
      window.clearTimeout(defilement);
    };
  }, [pathname]);

  return null;
}
