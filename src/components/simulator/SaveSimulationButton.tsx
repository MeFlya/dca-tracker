"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { SimulatorInput } from "@/lib/simulator";
import {
  saveSimulation,
  SAVE_LIMITS,
  getSavedSimulations,
} from "@/lib/saved-simulations";

interface Props {
  input: SimulatorInput;
  plan: string;
  onSaved: () => void;
}

export function SaveSimulationButton({ input, plan, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<"saved" | "error" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = SAVE_LIMITS[plan] ?? 0;

  // Free users — locked prompt
  if (limit === 0) {
    return (
      <Link
        href="/tarifs"
        title="Sauvegardez vos stratégies pour les comparer — disponible en Premium"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
          <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Sauvegarder la stratégie
      </Link>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const label = name.trim() || defaultName(input);
    const savedCount = getSavedSimulations().length;

    if (savedCount >= limit) {
      setFeedback("error");
      setTimeout(() => setFeedback(null), 3000);
      setOpen(false);
      return;
    }

    const result = saveSimulation(input, label, plan);
    if (result.ok) {
      setFeedback("saved");
      setOpen(false);
      setName("");
      onSaved();
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback("error");
      setTimeout(() => setFeedback(null), 3000);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {/* Trigger */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
        >
          {feedback === "saved" ? (
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-emerald-500" aria-hidden>
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
              <path d="M8 3v7M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="2" y="11" width="12" height="2.5" rx="1" fill="currentColor" opacity="0.3" />
            </svg>
          )}
          {feedback === "saved" ? "Sauvegardé !" : feedback === "error" ? "Limite atteinte" : "Sauvegarder"}
        </button>
      )}

      {/* Inline name form */}
      {open && (
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={defaultName(input)}
            maxLength={60}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setName(""); }}
            className="px-2 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}

function defaultName(input: SimulatorInput): string {
  return `${input.monthlyAmount} €/mois · ${input.durationYears} ans · ${input.annualReturnPct} %`;
}
