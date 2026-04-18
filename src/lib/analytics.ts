/**
 * Analytics abstraction layer.
 *
 * All event tracking goes through `track()`. If no provider is configured the
 * function is a no-op in production and logs to the console in development —
 * so you can drop it in anywhere without breaking anything.
 *
 * ─── Connecting a provider ───────────────────────────────────────────────────
 *
 * Plausible (recommended — cookie-free, GDPR-compliant by default):
 *   NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
 *   NEXT_PUBLIC_SITE_DOMAIN=dcatracker.fr
 *
 * Google Analytics 4:
 *   NEXT_PUBLIC_ANALYTICS_PROVIDER=ga
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * ─── Event naming convention ─────────────────────────────────────────────────
 *
 * snake_case, descriptive, no PII in event names or props.
 * Props are aggregate signals only (amounts, durations, identifiers).
 */

// ─── Event catalog ────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  /** Hero CTA buttons clicked */
  | { name: "homepage_cta_click"; props: { destination: "simulator" | "compare_etf" } }
  /** First simulation computed after page load — fires once per session */
  | { name: "simulator_run"; props: { monthly: number; years: number; return_pct: number } }
  /** "Copier le lien" button clicked */
  | { name: "share_link_click" }
  /** "Télécharger PDF" button clicked */
  | { name: "pdf_export_click" }
  /** Partner link clicked in InvestCTA block */
  | { name: "invest_cta_click"; props: { broker_id: string; account_type: string } }
  /** Email successfully submitted via EmailCapture */
  | { name: "email_signup"; props: { source: string } };

// ─── Core track function ──────────────────────────────────────────────────────

/**
 * Fire an analytics event. Safe to call anywhere — client-only, no-op on
 * the server or when no provider is configured.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  // Always log in dev so you can verify hooks are wired correctly.
  if (process.env.NODE_ENV === "development") {
    const props = "props" in event ? event.props : undefined;
    console.debug(`[analytics] ${event.name}`, props ?? "");
  }

  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const props = "props" in event ? (event.props as Record<string, unknown>) : undefined;

  if (provider === "plausible") {
    // Plausible custom events: https://plausible.io/docs/custom-event-goals
    const plausible = (window as Window & { plausible?: PlausibleFn }).plausible;
    if (typeof plausible === "function") {
      plausible(event.name, props ? { props } : undefined);
    }
    return;
  }

  if (provider === "ga") {
    // Google Analytics 4 custom events: https://developers.google.com/analytics/devguides/collection/ga4/events
    const gtag = (window as Window & { gtag?: GtagFn }).gtag;
    if (typeof gtag === "function") {
      gtag("event", event.name, props);
    }
    return;
  }

  // No provider configured — already logged in dev above, silent in prod.
}

// ─── Provider type stubs ──────────────────────────────────────────────────────

type PlausibleFn = (
  name: string,
  options?: { props?: Record<string, unknown>; callback?: () => void }
) => void;

type GtagFn = (
  command: "event" | "config" | "js",
  target: string,
  params?: Record<string, unknown>
) => void;
