import { cn } from "@/lib/utils";

interface DisclaimerProps {
  className?: string;
  variant?: "warning" | "info";
}

export function Disclaimer({ className, variant = "warning" }: DisclaimerProps) {
  return (
    <div data-nosearch=""
      // data-nosnippet : ce texte légal ne doit jamais servir d'extrait Google
      // à la place des meta descriptions.
      data-nosnippet
      className={cn(
        "flex gap-3 items-start p-4 rounded-xl text-sm",
        variant === "warning"
          ? "bg-amber-50 border border-amber-200 text-amber-800"
          : "bg-blue-50 border border-blue-200 text-blue-800",
        className
      )}
    >
      <span className="shrink-0 text-base">{variant === "warning" ? "⚠️" : "ℹ️"}</span>
      <p>
        <strong>Simulation hypothétique.</strong> Les résultats affichés sont
        basés sur des hypothèses de rendement constant et ne constituent pas une
        garantie de performance future. Les marchés financiers sont volatils.
        Ce simulateur est un outil pédagogique, pas un conseil en
        investissement.
      </p>
    </div>
  );
}

// DemoBadge et DelayedBadge retirés le 30/10/2026 : ils n'accompagnaient que
// le cours des fiches ETF (Yahoo Finance), retiré ce jour-là.
