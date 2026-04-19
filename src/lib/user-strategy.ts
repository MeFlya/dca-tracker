// Strategy tracking — stored in Clerk privateMetadata.
// Small data (~5KB max per user for 5 years of monthly entries).
// Server-side only — never import in client components.

import { clerkClient } from "@clerk/nextjs/server";
import type { SimulatorInput } from "./simulator";

// Re-export pure math helpers so callers don't need to import from strategy-math directly.
export { theoreticalValueAtMonth, monthsElapsed, currentMonth } from "./strategy-math";

export type Strategy = {
  input: SimulatorInput;
  startMonth: string; // "YYYY-MM"
  savedAt: string;    // ISO
};

export type MonthlyEntry = {
  month: string;         // "YYYY-MM"
  invested: number;      // EUR invested this month
  portfolioValue: number; // broker value at month end
};

export type StrategyData = {
  strategy: Strategy | null;
  entries: MonthlyEntry[];
};

// ─── Clerk metadata helpers ───────────────────────────────────────────────────

export async function getStrategyData(userId: string): Promise<StrategyData> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;
  return {
    strategy: (meta.dcaStrategy as Strategy) ?? null,
    entries: (meta.dcaEntries as MonthlyEntry[]) ?? [],
  };
}

export async function saveStrategy(userId: string, input: SimulatorInput): Promise<void> {
  const now = new Date();
  const startMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const existing = user.privateMetadata as Record<string, unknown>;

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...existing,
      dcaStrategy: {
        input,
        startMonth,
        savedAt: now.toISOString(),
      } satisfies Strategy,
    },
  });
}

export async function addMonthlyEntry(userId: string, entry: MonthlyEntry): Promise<void> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;
  const entries = (meta.dcaEntries as MonthlyEntry[]) ?? [];

  const filtered = entries.filter((e) => e.month !== entry.month);
  const updated = [...filtered, entry].sort((a, b) => a.month.localeCompare(b.month));

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { ...meta, dcaEntries: updated },
  });
}

