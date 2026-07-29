"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import type { SimulatorInput } from "@/lib/simulator";
import { track } from "@/lib/analytics";

interface Props {
  input: SimulatorInput;
  plan: string;
}

type State = "idle" | "saving" | "saved" | "error";

export function SaveStrategyButton({ input, plan }: Props) {
  const { isSignedIn } = useUser();
  const [state, setState] = useState<State>("idle");

  if (!isSignedIn) {
    return (
      <Link
        href="/sign-in"
        onClick={() => track({ name: "click_save_strategy", props: { has_account: false, plan: "free" } })}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        <LockIcon />
        Sauvegarder ma stratégie →
      </Link>
    );
  }

  // ⚠️ Ce bloc renvoyait un compte gratuit vers /upgrade au lieu de sauvegarder.
  // C'était le mur : quelqu'un qui venait de s'inscrire cliquait sur la
  // troisième étape de son accueil et atterrissait sur une page de paiement,
  // quatre-vingt-dix secondes après son arrivée. Sauvegarder est désormais
  // gratuit — le bouton fait ce qu'il annonce, pour tout le monde.

  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
        <CheckIcon />
        Stratégie sauvegardée —{" "}
        <Link href="/account" className="underline underline-offset-2 hover:text-emerald-700">
          voir le suivi
        </Link>
      </span>
    );
  }

  async function handleSave() {
    if (state === "saving") return;
    track({ name: "click_save_strategy", props: { has_account: true, plan } });
    setState("saving");
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error();
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={state === "saving"}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-60"
    >
      {state === "saving" ? (
        <>
          <SpinnerIcon />
          Sauvegarde…
        </>
      ) : state === "error" ? (
        <>
          <span className="text-red-500">Erreur</span>
          <button onClick={() => setState("idle")} className="text-gray-500 text-xs underline">
            réessayer
          </button>
        </>
      ) : (
        <>
          <BookmarkIcon />
          Sauvegarder ma stratégie →
        </>
      )}
    </button>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v12l-5-3-5 3v-12Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4l3-3-3-3v4a8 8 0 0 0-8 8h4z" />
    </svg>
  );
}
