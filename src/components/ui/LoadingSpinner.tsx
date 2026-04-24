import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block w-5 h-5 rounded-full border-2 border-gray-200 border-t-primary-600 animate-spin",
        className
      )}
      role="status"
      aria-label="Chargement…"
    />
  );
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "card flex items-center justify-center min-h-[120px] gap-3 text-gray-500",
        className
      )}
    >
      <LoadingSpinner />
      <span className="text-sm">Chargement des données…</span>
    </div>
  );
}

export function ErrorCard({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card flex items-start gap-3 border-red-100 bg-red-50 text-red-700",
        className
      )}
    >
      <span className="shrink-0">⚠️</span>
      <div>
        <p className="font-medium text-sm">Données indisponibles</p>
        <p className="text-xs text-red-600 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
