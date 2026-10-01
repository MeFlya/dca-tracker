export type PlanId = "free" | "premium";

/**
 * Prix de Premium affichés hors de /tarifs (hub /produits, 01/10/2026) —
 * prix payé, TVA non applicable (art. 293 B du CGI).
 * ⚠️ Ces valeurs sont encore écrites en dur à deux autres endroits :
 * - `src/app/tarifs/PricingCards.tsx` (`monthlyPrice: 4.9`, essai implicite) ;
 * - `src/app/api/stripe/checkout/route.ts` (`TRIAL_DAYS = 7`, la durée
 *   d'essai réellement appliquée par Stripe).
 * Les brancher sur ces constantes dans un lot qui touche /tarifs et le
 * paiement Premium, et changer les trois ensemble d'ici là.
 */
export const PREMIUM_PRIX_MENSUEL_EUR = 4.9;
export const PREMIUM_ESSAI_JOURS = 7;

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
