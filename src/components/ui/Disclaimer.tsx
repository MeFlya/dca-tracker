import { cn } from "@/lib/utils";

interface DisclaimerProps {
  className?: string;
  variant?: "warning" | "info";
}

export function Disclaimer({ className, variant = "warning" }: DisclaimerProps) {
  return (
    <div
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

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("demo-badge", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
      Mode démo — données illustratives
    </span>
  );
}

export function DelayedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs",
        className
      )}
    >
      Données différées
    </span>
  );
}
