/**
 * Analytics abstraction layer.
 *
 * All event tracking goes through `track()`. If no provider is configured the
 * function is a no-op in production and logs to the console in development —
 * so you can drop it in anywhere without breaking anything.
 *
 * ─── Connecting a provider ───────────────────────────────────────────────────
 *
 * Plausible (sole supported provider — cookie-free, GDPR-compliant by default,
 * exempt from prior consent per CNIL guidance):
 *   NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
 *   NEXT_PUBLIC_SITE_DOMAIN=dcatracker.fr
 *
 * Note (2026-04-29): Google Analytics support was removed to keep the site
 * cookieless and avoid the consent-banner requirement.
 *
 * ─── Event naming convention ─────────────────────────────────────────────────
 *
 * snake_case, descriptive, no PII in event names or props.
 * Props are aggregate signals only (amounts, durations, identifiers, flags).
 */

// ─── Event catalog (discriminated union — typed per-event props) ──────────────

export type AnalyticsEvent =
  // ── Top of funnel
  | { name: "visit_home" }
  | { name: "visit_about" }
  | { name: "homepage_cta_click"; props: { destination: "simulator" | "compare_etf" | "tarifs" } }

  // ── Simulator
  | { name: "start_simulation" }
  | { name: "complete_simulation"; props: { monthly: number; years: number; return_pct: number; fees_pct: number } }
  | { name: "simulator_run"; props: { monthly: number; years: number; return_pct: number } }  // legacy
  | { name: "share_link_click" }
  | { name: "pdf_export_click" }

  // ── Save strategy / conversion blocks
  | { name: "click_save_strategy"; props: { has_account: boolean; plan: string } }
  | { name: "conversion_block_click"; props: { block: "loss" | "time_shift" | "error" } }

  // ── Auth
  | { name: "signup" }
  | { name: "login" }

  // ── Dashboard + tracking
  | { name: "enter_dashboard"; props: { has_strategy: boolean; entries_count: number } }
  | { name: "log_month"; props: { contributions: number; portfolio_value: number } }
  | { name: "edit_month" }
  | { name: "delete_month" }

  // ── Upgrade + payment
  | { name: "open_upgrade"; props: { feature: string } }
  | { name: "start_trial"; props: { billing: "monthly" | "yearly" } }
  | { name: "complete_payment"; props: { plan: string } }
  | { name: "cancel_subscription" }

  // ── Account
  | { name: "import_csv"; props: { months: number; detected_format: string } }
  | { name: "export_data" }
  | { name: "delete_account" }

  // ── Other engagement
  | { name: "invest_cta_click"; props: { broker_id: string; account_type: string } }
  | { name: "email_signup"; props: { source: string } };

// ─── Global context (auto-appended to every event) ────────────────────────────

type GlobalContext = {
  plan?: string;  // "free" | "premium"
  device?: "mobile" | "desktop";
};

let globalContext: GlobalContext = {};

/** Update globally-propagated context. Call this once per page, client-side. */
export function setAnalyticsContext(ctx: Partial<GlobalContext>): void {
  globalContext = { ...globalContext, ...ctx };
}

function detectDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

// ─── Core track function ──────────────────────────────────────────────────────

/**
 * Fire an analytics event. Safe to call anywhere — client-only, no-op on
 * the server or when no provider is configured.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const eventProps = "props" in event ? (event.props as Record<string, unknown>) : {};
  const mergedProps: Record<string, unknown> = {
    ...eventProps,
    ...globalContext,
    device: globalContext.device ?? detectDevice(),
  };

  // Always log in dev so you can verify hooks are wired correctly.
  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event.name}`, mergedProps);
  }

  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;

  if (provider === "plausible") {
    // Plausible custom events: https://plausible.io/docs/custom-event-goals
    const plausible = (window as Window & { plausible?: PlausibleFn }).plausible;
    if (typeof plausible === "function") {
      plausible(event.name, Object.keys(mergedProps).length > 0 ? { props: mergedProps } : undefined);
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
