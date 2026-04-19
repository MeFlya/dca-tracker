"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires `enter_dashboard` once per mount with session-specific context.
 */
export function DashboardEntryTracker({
  hasStrategy,
  entriesCount,
}: {
  hasStrategy: boolean;
  entriesCount: number;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track({
      name: "enter_dashboard",
      props: { has_strategy: hasStrategy, entries_count: entriesCount },
    });
  }, [hasStrategy, entriesCount]);

  return null;
}
