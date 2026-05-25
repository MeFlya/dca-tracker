import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { getPlanFromPriceId } from "@/lib/plans";
import { log } from "@/lib/logger";
import {
  sendSubscriptionConfirmed,
  sendSubscriptionCancelled,
  sendOnboardingDay1,
  sendTrialEndingSoon,
  type TrialEndingFeatures,
} from "@/lib/emails/send";
import { getStrategyData } from "@/lib/user-strategy";
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

  log.event("webhook/stripe", "received", { type: event.type, id: event.id });

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
            sendSubscriptionConfirmed(email, firstName),
            sendOnboardingDay1(email, firstName),
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

      // ── Essai bientôt terminé → email de rappel anti-surprise ──────────
      // Stripe émet ce hook automatiquement à T-3 jours de la fin d'essai.
      // On envoie un récap + montant + 2 CTAs (continuer / annuler avant
      // prélèvement). Évite les chargebacks et les "j'ai été prélevé sans
      // m'en rendre compte".
      //
      // TESTED MANUALLY:
      //   1. stripe trigger customer.subscription.trial_will_end
      //   2. Vérifier dans la console webhook que l'email est expédié
      //   3. Vérifier le contenu de l'email (date, montant, manageUrl)
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (!clerkUserId) break;

        const item = sub.items.data[0];
        const priceObject = item?.price;
        const interval = (priceObject?.recurring?.interval ?? "month") as "month" | "year";
        const amountCents = priceObject?.unit_amount ?? 0;
        const currency = priceObject?.currency ?? "eur";
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

        if (!trialEnd) {
          log.event("webhook/stripe", "trial_will_end_no_date", { id: sub.id });
          break;
        }

        const user = await clerk.users.getUser(clerkUserId);
        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) break;
        const firstName = user.firstName ?? "Investisseur";

        // Read engagement signals — tells us what the user has actually done.
        const { strategy, entries } = await getStrategyData(clerkUserId);
        const features: TrialEndingFeatures = {
          hasSavedStrategy: !!strategy,
          monthsLogged: entries.length,
          // We don't track Monte Carlo / CSV import server-side today; default
          // to false. Wire when those events are persisted.
          hasUsedMonteCarlo: false,
          hasImportedCsv: false,
        };

        // Build a Stripe billing portal session so the user can cancel cleanly.
        // Falls back to /account if portal session can't be created.
        const customerId = sub.customer as string;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";
        let manageUrl = `${siteUrl}/account`;
        try {
          const portal = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${siteUrl}/account`,
          });
          manageUrl = portal.url;
        } catch (err) {
          console.warn("[webhook] billingPortal create failed, falling back to /account:", err);
        }

        await sendTrialEndingSoon({
          email,
          firstName,
          trialEndDate: trialEnd,
          amountCents,
          currency,
          interval,
          manageUrl,
          features,
        });

        log.event("webhook/stripe", "trial_ending_email_sent", {
          userId: clerkUserId,
          subId: sub.id,
          trialEnd: trialEnd.toISOString(),
          amountCents,
          interval,
          hasSavedStrategy: features.hasSavedStrategy,
          monthsLogged: features.monthsLogged,
        });
        break;
      }

      // ── Abonnement annulé → retour au plan gratuit ──────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (!clerkUserId) break;

        // canceledAt timestamp ISO → utilisé par le cron win-back pour
        // envoyer les emails J+7 et J+30. winBackJ7Sent / winBackJ30Sent
        // sont initialisés à false pour le cron.
        const canceledAt = new Date().toISOString();

        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: { plan: "free" },
          privateMetadata: {
            stripeSubscriptionId: null,
            subscriptionStatus: "canceled",
            periodEnd: null,
            canceledAt,
            winBackJ7Sent: false,
            winBackJ30Sent: false,
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
