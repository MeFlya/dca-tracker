"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Fires a single analytics event once per mount. Use to track arrival on
 * specific pages ('visit_home', 'enter_dashboard', etc.).
 *
 * Rendered via {@link <VisitTracker event={{ name: "visit_home" }} />}
 */
export function VisitTracker({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
    // Stringify event for stable dep; only care about the name for effect identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.name]);

  return null;
}
