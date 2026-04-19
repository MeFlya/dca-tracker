export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { planId, billing } = (await req.json()) as {
    planId: "premium";
    billing: "monthly" | "yearly";
  };

  if (planId !== "premium") {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }
  const plan = PLANS.premium;

  const priceId = billing === "yearly" ? plan.yearlyPriceId : plan.monthlyPriceId;
  if (!priceId) {
    return NextResponse.json(
      { error: "Price ID non configuré — ajoutez les variables d'environnement Stripe" },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  // Réutilise le customer Stripe existant ou en crée un
  const priv = user.privateMetadata as Record<string, unknown>;
  let customerId = priv?.stripeCustomerId as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.emailAddresses[0]?.emailAddress,
      name:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || undefined,
      metadata: { clerkUserId: userId },
    });
    customerId = customer.id;
  }

  // 7-day free trial — user can cancel anytime, no charge if cancelled before day 7.
  // Stripe enforces this server-side; payment method is collected up-front.
  const TRIAL_DAYS = 7;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/payment/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/payment/cancel`,
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { clerkUserId: userId },
    },
    metadata: { clerkUserId: userId },
    allow_promotion_codes: true,
    locale: "fr",
  });

  return NextResponse.json({ url: session.url });
}
