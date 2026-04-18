export type PlanId = "free" | "premium" | "pro";

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
  pro: {
    id: "pro" as PlanId,
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? null,
  },
} as const;

export function getPlanFromPriceId(priceId: string): PlanId {
  for (const plan of Object.values(PLANS)) {
    if (
      plan.monthlyPriceId === priceId ||
      plan.yearlyPriceId === priceId
    ) {
      return plan.id as PlanId;
    }
  }
  return "free";
}
