// Stripe Checkout en mode `payment` (one-time) pour le Lifetime Deal.
// À activer une fois que :
//   1. Un product Stripe one-time est créé (Dashboard → Products → New)
//   2. Son price ID est ajouté en env var STRIPE_LIFETIME_PRICE_ID
//   3. Le flag ENABLE_LIFETIME_DEAL est mis à true en env
//
// Une fois payé, l'utilisateur doit passer Premium "à vie" — la mécanique
// Clerk metadata pour ce flag est encore à câbler dans le webhook
// `checkout.session.completed` (à faire quand le LTD sera prêt à shipper).

export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { log } from "@/lib/logger";

export async function POST() {
  if (process.env.ENABLE_LIFETIME_DEAL !== "true") {
    return NextResponse.json(
      { error: "Lifetime deal n'est pas actif." },
      { status: 404 }
    );
  }

  const priceId = process.env.STRIPE_LIFETIME_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Price ID Lifetime non configuré." },
      { status: 500 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

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

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/payment/success?plan=lifetime&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/payment/cancel`,
    metadata: { clerkUserId: userId, productKind: "lifetime" },
    allow_promotion_codes: true,
    locale: "fr",
  });

  log.event("stripe/checkout-lifetime", "session_created", {
    userId,
    customer: customerId,
    session: session.id,
  });
  return NextResponse.json({ url: session.url });
}
