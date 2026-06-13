// Strategy tracking — stored in Clerk privateMetadata.
// Small data (~5-15 KB per user for 5 years of monthly logs with contributions).
// Server-side only — never import in client components.

import { clerkClient } from "@clerk/nextjs/server";
import type { SimulatorInput } from "./simulator";
import type { PortfolioAllocation } from "./simulation-params";

// Re-export pure math helpers so callers don't need to import from strategy-math directly.
export { theoreticalValueAtMonth, monthsElapsed, currentMonth } from "./strategy-math";

export type Strategy = {
  input: SimulatorInput;          // includes startingCapital (capital already invested)
  startMonth: string;             // "YYYY-MM" — when the user actually started investing
  savedAt: string;                // ISO
  allocation?: PortfolioAllocation[]; // chosen ETFs + weights (optional)
};

export type Contribution = {
  id: string;         // stable id for edit/delete
  date: string;       // "YYYY-MM-DD"
  amount: number;     // EUR
  note?: string;      // optional per-contribution label ("ordre mensuel", "surplus", etc.)
};

/** Storage format for a monthly entry — what's actually written to Clerk. */
export type StoredMonthlyEntry = {
  month: string;                // "YYYY-MM"
  contributions: Contribution[];
  portfolioValue: number;       // broker value at month end
  note?: string;                // monthly commentary
};

/** Read format — adds `invested` (sum of contributions) for convenience. */
export type MonthlyEntry = StoredMonthlyEntry & {
  invested: number;
};

export type StrategyData = {
  strategy: Strategy | null;
  entries: MonthlyEntry[];
};

// ─── Normalization (read-time migration from legacy shape) ───────────────────

/** Legacy shape had { month, invested, portfolioValue, note }. Convert on read. */
export function normalizeEntry(raw: unknown): MonthlyEntry {
  const r = (raw ?? {}) as Record<string, unknown>;
  const month = String(r.month ?? "");
  const portfolioValue = Number(r.portfolioValue ?? 0);
  const note = typeof r.note === "string" ? r.note : undefined;

  if (Array.isArray(r.contributions)) {
    const contributions: Contribution[] = (r.contributions as unknown[]).map((c, idx) => {
      const cc = (c ?? {}) as Record<string, unknown>;
      return {
        id: String(cc.id ?? `${month}-${idx}`),
        date: String(cc.date ?? `${month}-15`),
        amount: Number(cc.amount ?? 0),
        note: typeof cc.note === "string" ? cc.note : undefined,
      };
    });
    const invested = contributions.reduce((s, c) => s + c.amount, 0);
    return { month, contributions, invested, portfolioValue, note };
  }

  // Legacy format — synthesize a single mid-month contribution
  const legacyInvested = Number(r.invested ?? 0);
  return {
    month,
    contributions: [
      {
        id: `legacy-${month}`,
        date: `${month}-15`,
        amount: legacyInvested,
      },
    ],
    invested: legacyInvested,
    portfolioValue,
    note,
  };
}

// ─── Clerk metadata helpers ───────────────────────────────────────────────────

export async function getStrategyData(userId: string): Promise<StrategyData> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;
  const rawEntries = (meta.dcaEntries as unknown[]) ?? [];
  return {
    strategy: (meta.dcaStrategy as Strategy) ?? null,
    entries: rawEntries
      .map(normalizeEntry)
      .sort((a, b) => a.month.localeCompare(b.month)),
  };
}

export async function saveStrategy(
  userId: string,
  input: SimulatorInput,
  options?: { startMonth?: string; allocation?: PortfolioAllocation[] },
): Promise<void> {
  const now = new Date();
  const defaultStartMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // Accept a chosen start month ("YYYY-MM") so users who already invest can
  // declare since when; fall back to "now". Never accept a future month.
  const requested = options?.startMonth;
  const startMonth =
    requested && /^\d{4}-\d{2}$/.test(requested) && requested <= defaultStartMonth
      ? requested
      : defaultStartMonth;

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
        ...(options?.allocation?.length ? { allocation: options.allocation } : {}),
      } satisfies Strategy,
    },
  });
}

export async function upsertMonthlyEntry(
  userId: string,
  entry: StoredMonthlyEntry,
): Promise<void> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;
  const entries = ((meta.dcaEntries as unknown[]) ?? [])
    .map(normalizeEntry)
    .filter((e) => e.month !== entry.month);

  // Store without the derived `invested` field.
  const stored: StoredMonthlyEntry = {
    month: entry.month,
    contributions: entry.contributions,
    portfolioValue: entry.portfolioValue,
    note: entry.note,
  };

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...meta,
      dcaEntries: [...entries.map(({ invested, ...rest }) => { void invested; return rest; }), stored]
        .sort((a, b) => a.month.localeCompare(b.month)),
    },
  });
}

export async function deleteMonthlyEntry(userId: string, month: string): Promise<void> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;
  const entries = ((meta.dcaEntries as unknown[]) ?? [])
    .map(normalizeEntry)
    .filter((e) => e.month !== month);

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...meta,
      // Remove derived invested before storage
      dcaEntries: entries.map(({ invested, ...rest }) => { void invested; return rest; }),
    },
  });
}
