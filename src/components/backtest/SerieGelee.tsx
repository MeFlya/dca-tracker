// Mention « série gelée » — 14/10/2026.
//
// La série mensuelle des backtests a été relevée sur Yahoo Finance, que le site
// cesse d'utiliser (décision du 14/10/2026). Elle reste en ligne, sans mise à
// jour, jusqu'à ce qu'une source autorisée la remplace. Toutes les pages qui la
// présentent affichent CETTE mention, construite dans backtest.ts
// (mentionSerieGelee) : un seul texte, un seul endroit à changer le jour où la
// série sera remplacée.

import { mentionSerieGelee } from "@/lib/backtest";
import { cn } from "@/lib/utils";

export function SerieGelee({
  variant = "encadre",
  className,
}: {
  /** `encadre` : bloc visible près des chiffres. `ligne` : simple paragraphe. */
  variant?: "encadre" | "ligne";
  className?: string;
}) {
  const texte = mentionSerieGelee();
  if (variant === "ligne") {
    return <p className={className}>{texte}</p>;
  }
  return (
    <p
      role="note"
      className={cn(
        "rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 leading-relaxed",
        className,
      )}
    >
      {texte}
    </p>
  );
}
