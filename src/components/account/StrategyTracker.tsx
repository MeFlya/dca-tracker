"use client";

import type { Strategy, MonthlyEntry } from "@/lib/user-strategy";
import { StrategyProvider, useStrategy } from "./strategy/StrategyContext";
import { StrategyHeader } from "./strategy/StrategyHeader";
import { StrategyTabs } from "./strategy/StrategyTabs";
import { OverviewTab } from "./strategy/tabs/OverviewTab";
import { ActivityTab } from "./strategy/tabs/ActivityTab";
import { InsightsTab } from "./strategy/tabs/InsightsTab";
import { LogMonthModal } from "./strategy/modals/LogMonthModal";
import { MonthDetailModal } from "./strategy/modals/MonthDetailModal";

interface Props {
  initialStrategy: Strategy;
  initialEntries: MonthlyEntry[];
}

export function StrategyTracker({ initialStrategy, initialEntries }: Props) {
  return (
    <StrategyProvider
      initialStrategy={initialStrategy}
      initialEntries={initialEntries}
    >
      <div className="space-y-4 animate-fade-in">
        <StrategyHeader />
        <StrategyTabs />
        <TabContent />
      </div>

      <LogMonthModal />
      <MonthDetailModal />
    </StrategyProvider>
  );
}

function TabContent() {
  const { activeTab } = useStrategy();

  switch (activeTab) {
    case "overview": return <OverviewTab />;
    case "activity": return <ActivityTab />;
    case "insights": return <InsightsTab />;
  }
}
