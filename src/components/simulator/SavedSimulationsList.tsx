"use client";

import { useEffect, useState } from "react";
import type { SimulatorInput } from "@/lib/simulator";
import {
  getSavedSimulations,
  deleteSimulation,
  type SavedSimulation,
} from "@/lib/saved-simulations";

interface Props {
  onLoad: (input: SimulatorInput) => void;
  refreshKey: number;
}

export function SavedSimulationsList({ onLoad, refreshKey }: Props) {
  const [sims, setSims] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    setSims(getSavedSimulations());
  }, [refreshKey]);

  if (sims.length === 0) return null;

  function handleDelete(id: string) {
    deleteSimulation(id);
    setSims(getSavedSimulations());
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">
        Simulations sauvegardées
        <span className="ml-2 text-xs font-normal text-gray-500">({sims.length})</span>
      </h3>
      <ul className="space-y-2">
        {sims.map((sim) => (
          <li
            key={sim.id}
            className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50/40 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">{sim.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(sim.savedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onLoad(sim.input)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800 px-2.5 py-1 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Charger
              </button>
              <button
                onClick={() => handleDelete(sim.id)}
                className="text-gray-500 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                aria-label="Supprimer"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
                  <path d="M3 4h10M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 4l.5 9h5l.5-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
