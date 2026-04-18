"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "error";

interface ShareButtonProps {
  className?: string;
}

export function ShareButton({ className }: ShareButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // Clipboard API blocked (e.g. non-HTTPS, iframe) — silent fallback
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }, []);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <p className="text-xs text-gray-400 hidden sm:block">
        Partagez cette simulation
      </p>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copier le lien de cette simulation"
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium",
          "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          state === "idle" &&
            "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500",
          state === "copied" &&
            "border-gain/30 bg-gain/5 text-gain cursor-default focus-visible:ring-gain",
          state === "error" &&
            "border-red-200 bg-red-50 text-red-500 cursor-default focus-visible:ring-red-400"
        )}
        disabled={state !== "idle"}
      >
        {state === "idle" && (
          <>
            <LinkIcon />
            Copier le lien
          </>
        )}
        {state === "copied" && (
          <>
            <CheckIcon />
            Lien copié !
          </>
        )}
        {state === "error" && (
          <>
            <ErrorIcon />
            Copie impossible
          </>
        )}
      </button>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 9.5a4.243 4.243 0 0 0 6 0l2-2a4.243 4.243 0 0 0-6-6l-1 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 6.5a4.243 4.243 0 0 0-6 0l-2 2a4.243 4.243 0 0 0 6 6l1-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 8.5l4 4 7-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 5v3.5M8 11h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
