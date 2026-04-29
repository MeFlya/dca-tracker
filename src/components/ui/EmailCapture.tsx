"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

type SubmitState = "idle" | "loading" | "success" | "error";

interface EmailCaptureProps {
  /**
   * "section" — full-width page section (homepage).
   * "card"    — compact card (embedded below simulator or other content).
   */
  variant?: "section" | "card";
  /** Identifies where the subscription came from in your provider dashboard. */
  source?: string;
  className?: string;
}

const HEADLINE = "5 ETF Premium pour PEA — la cheat sheet 2026";
const SUBLINE =
  "Le PDF récap : indice répliqué, TER, 3 modèles d'allocation prêts à l'emploi. Livré gratuitement par email.";

export function EmailCapture({
  variant = "section",
  source = "website",
  className,
}: EmailCaptureProps) {
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = inputRef.current?.value.trim() ?? "";
    if (!email || state === "loading") return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data: { success?: boolean; error?: string } = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Une erreur est survenue. Réessayez.");
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorMsg("Impossible de se connecter. Réessayez dans un instant.");
      setState("error");
    }
  }

  if (state === "success") {
    return <SuccessState variant={variant} className={className} />;
  }

  if (variant === "section") {
    return (
      <section
        aria-label="Recevoir la cheat sheet 5 ETF Premium pour PEA"
        className={cn("py-16 sm:py-20 border-y border-gray-100 bg-gradient-to-b from-white to-primary-50/30", className)}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <GuideIcon className="mx-auto mb-5" />

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {HEADLINE}
          </h2>
          <p className="mt-3 text-base text-gray-500 leading-relaxed">
            {SUBLINE}
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
          >
            <label htmlFor="email-section" className="sr-only">
              Votre adresse e-mail
            </label>
            <input
              ref={inputRef}
              id="email-section"
              type="email"
              required
              autoComplete="email"
              placeholder="votre@email.fr"
              disabled={state === "loading"}
              className="input-field flex-1 disabled:opacity-60"
            />
            <SubmitButton state={state} />
          </form>

          {state === "error" && (
            <p className="mt-2.5 text-sm text-red-500" role="alert">
              {errorMsg}
            </p>
          )}

          <p className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <LockIcon />
            Désinscription en un clic.
          </p>
        </div>
      </section>
    );
  }

  // ── Card variant ─────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/60 to-blue-50/30 p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <GuideIcon />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 leading-snug">
            {HEADLINE}
          </h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            {SUBLINE}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-4 flex flex-col sm:flex-row gap-2"
      >
        <label htmlFor="email-card" className="sr-only">
          Votre adresse e-mail
        </label>
        <input
          ref={inputRef}
          id="email-card"
          type="email"
          required
          autoComplete="email"
          placeholder="votre@email.fr"
          disabled={state === "loading"}
          className="input-field flex-1 disabled:opacity-60"
        />
        <SubmitButton state={state} />
      </form>

      {state === "error" && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {errorMsg}
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
        <LockIcon />
        Désinscription en un clic.
      </p>
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({
  variant,
  className,
}: {
  variant: "section" | "card";
  className?: string;
}) {
  if (variant === "section") {
    return (
      <section
        aria-label="Cheat sheet envoyée"
        className={cn("py-16 sm:py-20 border-y border-gray-100 bg-gradient-to-b from-white to-primary-50/30", className)}
      >
        <div className="max-w-md mx-auto px-4 text-center">
          <CheckCircleIcon className="mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Cheat sheet envoyée ✅</h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Vérifiez votre boîte mail dans les 2 prochaines minutes.
            Pas reçue ? Pensez à regarder dans les spams ou la
            catégorie « Promotions ».
          </p>
        </div>
      </section>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 flex items-start gap-4",
        className
      )}
    >
      <CheckCircleIcon />
      <div>
        <p className="text-sm font-semibold text-gray-900">Cheat sheet envoyée ✅</p>
        <p className="mt-0.5 text-sm text-gray-500 leading-snug">
          Vérifiez votre boîte mail (et les spams).
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubmitButton({ state }: { state: SubmitState }) {
  return (
    <button
      type="submit"
      disabled={state === "loading"}
      className="btn-primary shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {state === "loading" ? (
        <span className="flex items-center gap-2">
          <SpinnerIcon />
          Envoi…
        </span>
      ) : (
        "Recevoir la cheat sheet"
      )}
    </button>
  );
}

function GuideIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0",
        className
      )}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-15Z"
          stroke="#1d4ed8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 8h7M8.5 11.5h7M8.5 15h4"
          stroke="#1d4ed8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full bg-gain/10 flex items-center justify-center shrink-0",
        className
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="8" stroke="#059669" strokeWidth="1.5" />
        <path
          d="M6.5 10.5l2.5 2.5 4.5-5"
          stroke="#059669"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="3"
        y="7"
        width="10"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4l3-3-3-3v4a8 8 0 0 0-8 8h4z"
      />
    </svg>
  );
}
