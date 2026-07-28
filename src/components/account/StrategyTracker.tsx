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

      <KeyedLogMonthModal />
      <MonthDetailModal />
    </StrategyProvider>
  );
}

/** LogMonthModal n'est jamais démonté (son `return null` arrive après les
 *  hooks), donc ses états — dont le mois cible — restaient figés à la valeur
 *  calculée au tout premier montage : éditer un mois passé pouvait écraser le
 *  mauvais mois. La clé force un remontage propre à chaque ouverture. */
function KeyedLogMonthModal() {
  const { logModalState } = useStrategy();
  const key = logModalState.open
    ? `log-${logModalState.initialEntry?.month ?? "nouveau"}`
    : "log-ferme";
  return <LogMonthModal key={key} />;
}

function TabContent() {
  const { activeTab } = useStrategy();

  switch (activeTab) {
    case "overview": return <OverviewTab />;
    case "activity": return <ActivityTab />;
    case "insights": return <InsightsTab />;
  }
}
