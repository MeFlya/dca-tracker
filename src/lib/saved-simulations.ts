// Client-side only — localStorage. Imported only in client components.

import type { SimulatorInput } from "./simulator";

export type SavedSimulation = {
  id: string;
  name: string;
  input: SimulatorInput;
  savedAt: number;
};

const KEY = "dca_saved_simulations";

export const SAVE_LIMITS: Record<string, number> = {
  free: 0,
  premium: 10,
  pro: Infinity,
};

function readStore(): SavedSimulation[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeStore(sims: SavedSimulation[]): void {
  localStorage.setItem(KEY, JSON.stringify(sims));
}

export function getSavedSimulations(): SavedSimulation[] {
  return readStore().sort((a, b) => b.savedAt - a.savedAt);
}

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "limit_reached" | "upgrade_required" };

export function saveSimulation(
  input: SimulatorInput,
  name: string,
  plan: string
): SaveResult {
  const limit = SAVE_LIMITS[plan] ?? 0;
  if (limit === 0) return { ok: false, reason: "upgrade_required" };
  const current = readStore();
  if (current.length >= limit) return { ok: false, reason: "limit_reached" };
  writeStore([
    ...current,
    { id: crypto.randomUUID(), name, input, savedAt: Date.now() },
  ]);
  return { ok: true };
}

export function deleteSimulation(id: string): void {
  writeStore(readStore().filter((s) => s.id !== id));
}
