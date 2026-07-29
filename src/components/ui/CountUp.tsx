"use client";

import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Formats intégrés (sérialisables) — pour les composants SERVEUR, qui ne
// peuvent pas passer de fonction `format` à un composant client.
const eurFmt = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const BUILTIN_FORMATS: Record<string, (n: number) => string> = {
  eur: (n) => eurFmt.format(Math.round(n)),
};

// Anime un nombre de 0 → valeur, UNE seule fois.
// - `startOnView` (défaut) : compte quand l'élément entre dans le viewport
//   (parfait pour des chiffres sous la ligne de flottaison).
// - Changements de valeur ULTÉRIEURS (ex. sliders temps réel) : snap direct,
//   pas de ré-animation (sinon ça janke — principe Emil).
// - SSR / no-JS : rend la vraie valeur (présente dans le HTML).
// - Respecte prefers-reduced-motion.
export function CountUp({
  value,
  durationMs = 900,
  startOnView = true,
  as,
  format,
  className,
}: {
  value: number;
  durationMs?: number;
  startOnView?: boolean;
  /** Format intégré sérialisable — à utiliser depuis un composant SERVEUR
   *  (où on ne peut pas passer de fonction `format`). */
  as?: "eur";
  format?: (n: number) => string;
  className?: string;
}) {
  const fmt =
    format ??
    (as ? BUILTIN_FORMATS[as] : (n: number) => Math.round(n).toLocaleString("fr-FR"));
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Déjà animé → on suit la valeur en direct (snap).
    if (doneRef.current) {
      setDisplay(value);
      return;
    }

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value === 0 || typeof IntersectionObserver === "undefined") {
      doneRef.current = true;
      setDisplay(value);
      return;
    }

    // NE PAS remettre l'affichage à 0 ici. Tant que l'IntersectionObserver
    // n'a pas déclenché, on doit montrer la VRAIE valeur : si l'observer ne
    // se déclenche jamais (élément sous la ligne de flottaison chez un
    // visiteur qui ne scrolle pas, crawler, navigateur sans IO fiable), un 0
    // resterait affiché indéfiniment. C'est le bug qui affichait
    // « 0 investisseurs inscrits » sur la home. Le retour à 0 se fait
    // maintenant au tout début de l'animation, une fois qu'on est certain
    // qu'elle va effectivement jouer.
    const animate = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDisplay(0);
      const start = performance.now();
      const tick = (now: number) => {
        // Borné EN BAS autant qu'en haut. Le timestamp que requestAnimationFrame
        // passe au callback est celui du DÉBUT DE FRAME, qui peut précéder le
        // performance.now() capturé juste au-dessus. `now - start` était donc
        // parfois négatif de quelques millisecondes, et easeOutCubic renvoie
        // alors une valeur négative : la première frame affichait « -0 / -3 / -0 »
        // au lieu de « 0 / 0 / 0 ». Repéré en production, reproduit au calcul
        // (−5,4 ms d'écart donnent exactement ces trois valeurs).
        const t = Math.min(1, Math.max(0, (now - start) / durationMs));
        setDisplay(value * easeOutCubic(t));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
        else setDisplay(value);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const el = ref.current;
    if (!startOnView || !el) {
      animate();
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          animate();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs, startOnView]);

  return (
    <span ref={ref} className={className}>
      {fmt(display)}
    </span>
  );
}
