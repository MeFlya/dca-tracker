"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Révèle les éléments marqués `data-reveal` quand ils entrent dans le viewport.
// Perf : UN seul IntersectionObserver pour toute la page, chaque élément est
// dé-observé après sa révélation, transitions GPU (opacity/transform) côté CSS
// (off main thread). Re-scanne à chaque navigation client (App Router).
// Optionnel : `data-reveal-delay="80"` pour un stagger entre éléments voisins.
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"),
    );
    if (els.length === 0) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pas d'animation (ou pas d'IO) → on montre tout immédiatement.
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay;
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      // Se déclenche quand le HAUT de la section atteint ~78 % de la hauteur
      // d'écran (moitié basse, là où l'œil regarde) — pas tout en bas, sinon
      // l'anim est finie avant qu'on ne la voie.
      { threshold: 0, rootMargin: "0px 0px -22% 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
