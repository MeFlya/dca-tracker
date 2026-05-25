import { currentUser } from "@clerk/nextjs/server";
import type { PlanId } from "./plans";

export type UserSubscription = {
  plan: PlanId;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  periodEnd: number | null;
  /** "month" | "year" — set by Stripe webhook from price.recurring.interval. */
  subscriptionInterval: "month" | "year" | null;
  /** ISO datetime — when the user first subscribed. */
  subscribedAt: string | null;
};

export async function getUserSubscription(): Promise<UserSubscription> {
  const user = await currentUser();

  if (!user) {
    return {
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      periodEnd: null,
      subscriptionInterval: null,
      subscribedAt: null,
    };
  }

  const priv = user.privateMetadata as Record<string, unknown>;

  return {
    plan: (user.publicMetadata?.plan as PlanId) ?? "free",
    stripeCustomerId: (priv?.stripeCustomerId as string) ?? null,
    stripeSubscriptionId: (priv?.stripeSubscriptionId as string) ?? null,
    subscriptionStatus: (priv?.subscriptionStatus as string) ?? null,
    periodEnd: (priv?.periodEnd as number) ?? null,
    subscriptionInterval:
      (priv?.subscriptionInterval as "month" | "year" | undefined) ?? null,
    subscribedAt: (priv?.subscribedAt as string) ?? null,
  };
}

export function isPremium(plan: PlanId): boolean {
  return plan === "premium";
}
