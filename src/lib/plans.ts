export type PlanId = "free" | "premium";

export const PLANS = {
  free: {
    id: "free" as PlanId,
    name: "Gratuit",
    monthlyPriceId: null as string | null,
    yearlyPriceId: null as string | null,
  },
  premium: {
    id: "premium" as PlanId,
    name: "Premium",
    monthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? null,
    yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID ?? null,
  },
} as const;

/**
 * Map a Stripe price ID to a plan.
 * Legacy Pro price IDs are still recognised and mapped to "premium" — existing
 * Pro subscribers keep access to all premium features (A/B comparison moved
 * from Pro to Premium during the plan consolidation).
 */
export function getPlanFromPriceId(priceId: string | null | undefined): PlanId {
  if (!priceId) return "free";

  const premiumIds = [
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    // Legacy Pro IDs — map to premium so existing subscribers keep their benefits
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ].filter(Boolean);

  return premiumIds.includes(priceId) ? "premium" : "free";
}
