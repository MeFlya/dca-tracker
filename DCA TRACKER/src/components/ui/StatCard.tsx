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
      <p
        className={cn(
          "text-2xl font-semibold tracking-tight",
          accent === "gain" && "text-gain",
          accent === "loss" && "text-loss",
          accent === "primary" && "text-primary-600",
          accent === "default" && "text-gray-900"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
