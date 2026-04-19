import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { getPlanFromPriceId } from "@/lib/plans";
import {
  sendSubscriptionConfirmed,
  sendSubscriptionCancelled,
  sendOnboardingDay1,
} from "@/lib/emails/send";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// Stripe envoie le body brut — ne pas parser en JSON avant vérification de signature
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const clerk = await clerkClient();

  try {
    switch (event.type) {
      // ── Checkout complété → activation abonnement ───────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;

        if (!clerkUserId || !session.customer || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const interval = subscription.items.data[0]?.price.recurring?.interval ?? "month";
        const subscribedAt = subscription.start_date
          ? new Date(subscription.start_date * 1000).toISOString()
          : new Date().toISOString();

        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: { plan },
          privateMetadata: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: subscription.status,
            periodEnd: // eslint-disable-next-line @typescript-eslint/no-explicit-any
(subscription as any).current_period_end as number ?? null,
            subscriptionInterval: interval,
            subscribedAt,
            annualPushSent: [],
          },
        });

        const user = await clerk.users.getUser(clerkUserId);
        const email = user.emailAddresses[0]?.emailAddress;
        if (email) {
          const firstName = user.firstName ?? "Investisseur";
          await Promise.all([
            sendSubscriptionConfirmed(email, firstName, plan),
            sendOnboardingDay1(email, firstName, plan),
          ]);
        }
        break;
      }

      // ── Abonnement mis à jour (upgrade / downgrade / renouvellement) ────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (!clerkUserId) break;

        const priceId = sub.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const activePlan = sub.status === "active" ? plan : "free";
        const interval = sub.items.data[0]?.price.recurring?.interval ?? "month";

        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: { plan: activePlan },
          privateMetadata: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            periodEnd: // eslint-disable-next-line @typescript-eslint/no-explicit-any
(sub as any).current_period_end as number ?? null,
            subscriptionInterval: interval,
          },
        });
        break;
      }

      // ── Abonnement annulé → retour au plan gratuit ──────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (!clerkUserId) break;

        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: { plan: "free" },
          privateMetadata: {
            stripeSubscriptionId: null,
            subscriptionStatus: "canceled",
            periodEnd: null,
          },
        });

        const user = await clerk.users.getUser(clerkUserId);
        const email = user.emailAddresses[0]?.emailAddress;
        if (email) {
          await sendSubscriptionCancelled(
            email,
            user.firstName ?? "Investisseur"
          );
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] Erreur handler:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
