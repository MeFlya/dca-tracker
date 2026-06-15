import { cn } from "@/lib/utils";

// Barre de lumière diagonale qui balaie une surface de gauche à droite
// (effet "reflet neuf"). À poser dans un conteneur `relative overflow-hidden`,
// sur fond coloré/sombre. Le contenu au-dessus doit être en `relative` pour
// passer devant. Décoratif → coupé par prefers-reduced-motion (animate-aurora
// est neutralisé dans le bloc reduced-motion de globals.css).
//
// À réserver aux surfaces vues OCCASIONNELLEMENT (CTA, cartes premium, hero
// marketing) — pas aux écrans vus en boucle (dashboard), où un sweep infini
// fatiguerait.
export function AuroraSweep({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 w-1/3 animate-aurora bg-gradient-to-r from-transparent via-white/55 to-transparent",
        className,
      )}
    />
  );
}
