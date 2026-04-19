"use client";

import { LayoutDashboard, ListOrdered, Brain } from "lucide-react";
import { useStrategy, type TabKey } from "./StrategyContext";

type Tab = {
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const TABS: Tab[] = [
  { key: "overview", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { key: "activity", label: "Activité", Icon: ListOrdered },
  { key: "insights", label: "Analyse", Icon: Brain },
];

export function StrategyTabs() {
  const { activeTab, setActiveTab } = useStrategy();

  return (
    <nav
      className="flex items-center gap-1 border-b border-gray-100 overflow-x-auto"
      aria-label="Sections du dashboard"
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap relative
              ${isActive
                ? "text-primary-700"
                : "text-gray-500 hover:text-gray-800"
              }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={15} className={isActive ? "text-primary-600" : "text-gray-400"} />
            {label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
