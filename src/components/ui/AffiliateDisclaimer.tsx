// Affiliate disclosure — French legal requirement (Code de la consommation
// art. L.111-7 + LCEN). Must be visible BEFORE the user clicks an affiliate
// link, not as a small footnote elsewhere.
//
// Use cases:
// - Inline next to a single affiliate button (variant="inline")
// - Block above a list of affiliate CTAs (variant="block")
//
// Wired by <InvestCTA /> when broker affiliate links are rendered.

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  variant?: "inline" | "block";
  className?: string;
}

const TEXT =
  "Lien affilié : DCA Tracker peut percevoir une commission si vous ouvrez un compte via ce lien. Cela ne change rien au coût pour vous.";

export function AffiliateDisclaimer({
  variant = "block",
  className,
}: Props) {
  if (variant === "inline") {
    return (
      <p
        className={cn(
          "text-[11px] text-gray-500 leading-snug flex items-start gap-1.5",
          className
        )}
      >
        <Info size={12} className="shrink-0 mt-0.5" aria-hidden />
        <span>{TEXT}</span>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-start gap-2 text-xs text-amber-900",
        className
      )}
      role="note"
    >
      <Info size={14} className="shrink-0 mt-0.5" aria-hidden />
      <p className="leading-relaxed">{TEXT}</p>
    </div>
  );
}
