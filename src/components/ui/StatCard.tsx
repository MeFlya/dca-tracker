import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "gain" | "loss" | "primary";
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  accent = "default",
  className,
}: StatCardProps) {
  return (
    <div className={cn("card flex flex-col gap-1", className)}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      {/* key={value} re-triggers the fade-in animation whenever the formatted
          string changes — gives instant "I caused that" feedback when the
          user drags a slider. The formatted value (not the raw number)
          means tiny sub-cent changes don't flicker the UI. */}
      <p
        key={value}
        className={cn(
          "text-2xl font-semibold tracking-tight animate-fade-in",
          accent === "gain" && "text-gain-dark",
          accent === "loss" && "text-loss-dark",
          accent === "primary" && "text-primary-600",
          accent === "default" && "text-gray-900"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}
