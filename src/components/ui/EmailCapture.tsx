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
        aria-label="Inscription à la newsletter"
        className={cn("py-16 sm:py-20 border-y border-gray-100 bg-gradient-to-b from-white to-primary-50/30", className)}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <EnvelopeIcon className="mx-auto mb-5" />

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Recevez le guide :{" "}
            <span className="text-primary-600">PEA ou CTO</span>{" "}
            — quelle enveloppe pour vos ETF ?
          </h2>
          <p className="mt-3 text-base text-gray-500 leading-relaxed">
            Le guide pratique que tout investisseur DCA devrait lire avant
            d&apos;ouvrir un compte. Quelle enveloppe choisir, quels ETF y
            mettre, et comment éviter les erreurs courantes. Gratuit, sans spam.
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

          <p className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1.5">
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
        <EnvelopeIcon />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 leading-snug">
            Recevez le guide PEA vs CTO + ressources pour investisseurs DCA
          </h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            Quelle enveloppe fiscale pour vos ETF, quel montant mensuel,
            comment démarrer. Gratuit, sans spam.
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

      <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
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
        aria-label="Inscription confirmée"
        className={cn("py-16 sm:py-20 border-y border-gray-100 bg-gradient-to-b from-white to-primary-50/30", className)}
      >
        <div className="max-w-sm mx-auto px-4 text-center">
          <CheckCircleIcon className="mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">C&apos;est noté !</h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Bienvenue. Vous recevrez bientôt des idées simples pour investir sur
            le long terme.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-green-100 bg-green-50/60 p-6 flex items-start gap-4",
        className
      )}
    >
      <CheckCircleIcon />
      <div>
        <p className="text-sm font-semibold text-gray-900">C&apos;est noté !</p>
        <p className="mt-0.5 text-sm text-gray-500 leading-snug">
          Bienvenue. Vous recevrez bientôt des idées simples pour investir sur
          le long terme.
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
        "S'inscrire"
      )}
    </button>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0",
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
        <path
          d="M2.5 5.5A1.5 1.5 0 0 1 4 4h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-9Z"
          stroke="#1d4ed8"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 6 10 11l7.5-5"
          stroke="#1d4ed8"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
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
