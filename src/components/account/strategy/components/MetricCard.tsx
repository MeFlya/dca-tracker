import type { ReactNode } from "react";

type Tone = "default" | "positive" | "negative" | "muted" | "primary";

const toneClasses: Record<Tone, string> = {
  default: "text-gray-900",
  positive: "text-emerald-700",
  negative: "text-orange-600",
  muted: "text-gray-400",
  primary: "text-primary-700",
};

export function MetricCard({
  label,
  value,
  subvalue,
  tone = "default",
  icon,
  size = "default",
}: {
  label: string;
  value: ReactNode;
  subvalue?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  size?: "default" | "compact" | "large";
}) {
  const padding = size === "compact" ? "px-3 py-2.5" : size === "large" ? "px-5 py-4" : "px-4 py-3";
  const valueSize = size === "compact" ? "text-sm" : size === "large" ? "text-2xl" : "text-lg";

  return (
    <div className={`rounded-xl bg-white border border-gray-100 card-hover ${padding}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">
          {label}
        </p>
      </div>
      <p className={`${valueSize} font-bold tabular-nums leading-tight ${toneClasses[tone]}`}>
        {value}
      </p>
      {subvalue && (
        <p className="text-[11px] text-gray-400 mt-1 leading-snug">{subvalue}</p>
      )}
    </div>
  );
}
