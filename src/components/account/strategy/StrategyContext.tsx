"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { Strategy, MonthlyEntry, StoredMonthlyEntry } from "@/lib/user-strategy";
import { computeInsights, type Insights } from "@/lib/strategy-insights";
import { monthsElapsed } from "@/lib/strategy-math";
import { track } from "@/lib/analytics";

export type TabKey = "overview" | "activity" | "insights";

type StrategyContextValue = {
  strategy: Strategy;
  entries: MonthlyEntry[];
  insights: Insights | null;
  monthsElapsed: number;

  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  // Modal state
  logModalState: { open: boolean; initialEntry?: MonthlyEntry | null };
  detailMonth: string | null;

  // Actions
  openLogModal: (initialEntry?: MonthlyEntry) => void;
  closeLogModal: () => void;
  openMonthDetail: (month: string) => void;
  closeMonthDetail: () => void;
  upsertEntry: (entry: StoredMonthlyEntry) => Promise<boolean>;
  deleteEntry: (month: string) => Promise<boolean>;
  refetch: () => Promise<void>;
};

const StrategyContext = createContext<StrategyContextValue | null>(null);

export function useStrategy(): StrategyContextValue {
  const ctx = useContext(StrategyContext);
  if (!ctx) throw new Error("useStrategy must be used inside <StrategyProvider>");
  return ctx;
}

export function StrategyProvider({
  initialStrategy,
  initialEntries,
  children,
}: {
  initialStrategy: Strategy;
  initialEntries: MonthlyEntry[];
  children: ReactNode;
}) {
  const [strategy] = useState<Strategy>(initialStrategy);
  const [entries, setEntries] = useState<MonthlyEntry[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [logModalState, setLogModalState] = useState<{
    open: boolean;
    initialEntry?: MonthlyEntry | null;
  }>({ open: false });
  const [detailMonth, setDetailMonth] = useState<string | null>(null);

  const openLogModal = useCallback((initialEntry?: MonthlyEntry) => {
    setLogModalState({ open: true, initialEntry });
  }, []);

  const closeLogModal = useCallback(() => {
    setLogModalState({ open: false });
  }, []);

  const openMonthDetail = useCallback((month: string) => {
    setDetailMonth(month);
  }, []);

  const closeMonthDetail = useCallback(() => {
    setDetailMonth(null);
  }, []);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/strategy");
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch (err) {
      console.error("[strategy] refetch failed", err);
    }
  }, []);

  const upsertEntry = useCallback(
    async (entry: StoredMonthlyEntry): Promise<boolean> => {
      // Detect whether this is an edit or a new log (existing entry for that month?)
      const isEdit = entries.some((e) => e.month === entry.month);
      try {
        const res = await fetch("/api/strategy/entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        if (!res.ok) return false;
        await refetch();
        if (isEdit) {
          track({ name: "edit_month" });
        } else {
          track({
            name: "log_month",
            props: {
              contributions: entry.contributions.length,
              portfolio_value: entry.portfolioValue,
            },
          });
        }
        return true;
      } catch {
        return false;
      }
    },
    [entries, refetch],
  );

  const deleteEntry = useCallback(
    async (month: string): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/strategy/entry?month=${encodeURIComponent(month)}`,
          { method: "DELETE" },
        );
        if (!res.ok) return false;
        await refetch();
        track({ name: "delete_month" });
        return true;
      } catch {
        return false;
      }
    },
    [refetch],
  );

  const insights = useMemo(
    () => computeInsights(strategy.input, strategy.startMonth, entries),
    [strategy, entries],
  );

  const elapsed = useMemo(
    () => Math.max(monthsElapsed(strategy.startMonth), 1),
    [strategy.startMonth],
  );

  const value: StrategyContextValue = {
    strategy,
    entries,
    insights,
    monthsElapsed: elapsed,
    activeTab,
    setActiveTab,
    logModalState,
    detailMonth,
    openLogModal,
    closeLogModal,
    openMonthDetail,
    closeMonthDetail,
    upsertEntry,
    deleteEntry,
    refetch,
  };

  return <StrategyContext.Provider value={value}>{children}</StrategyContext.Provider>;
}
