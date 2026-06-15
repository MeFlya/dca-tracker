"use client";

import { useEffect, useRef, useState } from "react";

// Anime un nombre de 0 → valeur, UNE seule fois (à l'apparition).
// Sur les changements de valeur suivants (ex. sliders du simulateur en temps
// réel), on SNAP directement — pas de ré-animation, sinon ça janke et ça
// fatigue (principe Emil : ne pas animer ce qui change souvent).
// Respecte prefers-reduced-motion (affiche la valeur finale immédiatement).
export function CountUp({
  value,
  durationMs = 900,
  format = (n: number) => Math.round(n).toLocaleString("fr-FR"),
  className,
}: {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const firstRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Changements ultérieurs (temps réel) : snap.
    if (!firstRef.current) {
      setDisplay(value);
      return;
    }
    firstRef.current = false;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value === 0) {
      setDisplay(value);
      return;
    }

    const from = 0;
    const to = value;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setDisplay(from + (to - from) * easeOutCubic(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{format(display)}</span>;
}
