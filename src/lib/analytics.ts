/**
 * Analytics abstraction layer.
 *
 * All event tracking goes through `track()`. If no provider is configured the
 * function is a no-op in production and logs to the console in development —
 * so you can drop it in anywhere without breaking anything.
 *
 * ─── Le fournisseur, et pourquoi il a changé le 23/08/2026 ──────────────────
 *
 * Vercel Web Analytics, monté par <Analytics /> dans le layout racine. Sans
 * variable d'environnement à poser : le composant suffit.
 *
 * Plausible a été retiré. L'abonnement n'était plus payé, mais son script
 * continuait d'être servi à chaque visite — 6 Ko par page pour n'enregistrer
 * nulle part, et 25 appels de mesure qui ne mesuraient plus rien. Une panne
 * silencieuse de plus : le code se lisait comme s'il collectait.
 *
 * Vercel est sans cookie, comme Plausible l'était : pas de bandeau de consentement.
 *
 * Note (2026-04-29): Google Analytics support was removed to keep the site
 * cookieless and avoid the consent-banner requirement.
 *
 * ─── Event naming convention ─────────────────────────────────────────────────
 *
 * snake_case, descriptive, no PII in event names or props.
 * Props are aggregate signals only (amounts, durations, identifiers, flags).
 */

import { track as vercelTrack } from "@vercel/analytics";

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
  | { name: "create_strategy"; props: { monthly: number; years: number; etfs: number } }
  | { name: "edit_strategy"; props: { monthly: number; years: number; etfs: number } }

  // ── Upgrade + payment
  | { name: "open_upgrade"; props: { feature: string } }
  /**
   * Démarre la période d'essai.
   *   - billing : "monthly" | "yearly"
   *   - with_cb : true si CB collectée à l'entrée (Stripe Checkout standard),
   *               false si essai sans CB (flux "trial-then-paywall").
   *               C'est l'axe de l'A/B test Sprint 2 #10 — ne jamais confondre.
   */
  | { name: "start_trial"; props: { billing: "monthly" | "yearly"; with_cb: boolean } }
  | { name: "complete_payment"; props: { plan: string } }
  | { name: "cancel_subscription" }
  // ── Trial conversion funnel (pour A/B test CB vs sans CB)
  | { name: "trial_canceled_during_period"; props: { day_of_trial: number; with_cb: boolean } }
  | { name: "trial_converted_to_paid"; props: { billing: "monthly" | "yearly"; with_cb: boolean } }
  /**
   * Tiré par le cron J+7 post-paiement réussi. Permet de mesurer la rétention
   * "early churn" — bien plus prédictive que le simple paid_count brut.
   * Si ce nombre / start_trial.with_cb=true est < 60 %, le funnel CB est cassé.
   */
  | { name: "subscription_active_j7"; props: { billing: "monthly" | "yearly" } }
  // ── Annual push banner (in-app)
  | { name: "annual_banner_shown" }
  | { name: "annual_banner_click" }
  | { name: "annual_banner_dismiss" }

  // ── Backtest historique (feature Premium récurrente — moat n°1)
  | { name: "backtest_started"; props: { monthly_amount: number; start_date: string; end_date: string } }
  | { name: "backtest_completed"; props: { monthly_amount: number; months_invested: number; gain_pct: number; irr_pct: number | null } }
  | { name: "backtest_premium_locked_cta_clicked" }
  /** Clic sur le teaser /backtest affiché dans les résultats du simulateur. */
  | { name: "backtest_teaser_click" }

  // ── Produits digitaux (paiement unique)
  | { name: "product_checkout_click"; props: { product_id: string } }
  | { name: "product_purchase"; props: { product_id: string } }
  | { name: "backtest_quick_scenario_used"; props: { scenario_name: string } }

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

  // Les événements qui ne font que doubler une page vue ne partent pas.
  // Le plan Hobby inclut 2 500 événements par mois, et une page vue en
  // consomme un : envoyer « visit_home » à chaque arrivée sur l'accueil
  // paierait deux fois la même information, et le quota s'épuiserait en plein
  // mois — c'est-à-dire qu'on perdrait la mesure sans être prévenu.
  if (EVENEMENTS_REDONDANTS.has(event.name)) return;

  vercelTrack(event.name, primitivesSeules(mergedProps));
}

/** Doublons purs d'une page vue, que Vercel compte déjà. */
const EVENEMENTS_REDONDANTS = new Set<AnalyticsEvent["name"]>([
  "visit_home",
  "visit_about",
]);

/**
 * Vercel n'accepte que des valeurs plates. Tout le reste est écarté plutôt que
 * converti : un objet transformé en « [object Object] » occuperait une place
 * dans le quota pour ne rien apprendre.
 */
function primitivesSeules(
  props: Record<string, unknown>,
): Record<string, string | number | boolean | null> | undefined {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || ["string", "number", "boolean"].includes(typeof v)) {
      out[k] = v as string | number | boolean | null;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
