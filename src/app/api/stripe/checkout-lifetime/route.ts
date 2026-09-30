// Stripe Checkout en mode `payment` (one-time) pour le Lifetime Deal.
// À activer une fois que :
//   1. Un product Stripe one-time est créé (Dashboard → Products → New)
//   2. Son price ID est ajouté en env var STRIPE_LIFETIME_PRICE_ID
//   3. Le flag ENABLE_LIFETIME_DEAL est mis à true en env
//
// Une fois payé, l'utilisateur doit passer Premium "à vie" — la mécanique
// Clerk metadata pour ce flag est encore à câbler dans le webhook
// `checkout.session.completed` (à faire quand le LTD sera prêt à shipper).
//
// 30/09/2026 — metadata.origine : la page du site d'où vient l'acheteur, posée
// sur la session ET sur le PaymentIntent (payment_intent_data), lisible dans
// Stripe > Paiements > un paiement > Métadonnées. Formes possibles et lecture :
// src/lib/origine-achat.ts.

export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { nettoyerOrigine } from "@/lib/origine-achat";

export async function POST(req: Request) {
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

  // Corps facultatif : un onglet resté ouvert depuis avant le 30/09/2026
  // n'envoie rien — l'origine vaut alors « inconnue », le paiement reste possible.
  const corps = (await req.json().catch(() => null)) as { origine?: unknown } | null;
  const origine = nettoyerOrigine(corps?.origine);

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
    metadata: { clerkUserId: userId, productKind: "lifetime", origine },
    payment_intent_data: { metadata: { origine } },
    allow_promotion_codes: true,
    locale: "fr",
  });

  log.event("stripe/checkout-lifetime", "session_created", {
    userId,
    customer: customerId,
    session: session.id,
    origine,
  });
  return NextResponse.json({ url: session.url });
}
