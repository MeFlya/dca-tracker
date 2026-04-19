// Account deletion endpoint.
// DELETE /api/account
//
// Flow:
// 1. Verify user is authenticated
// 2. Verify confirmation (email string in request body matches user's email)
// 3. Cancel active Stripe subscription (if any) — best-effort
// 4. Delete Clerk user (cascades: metadata, strategy, entries all removed)
//
// After deletion, the client signs out and redirects home.

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { confirmation?: string };
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();

  if (!userEmail || body.confirmation?.trim().toLowerCase() !== userEmail) {
    return NextResponse.json(
      { error: "Saisissez votre adresse email exacte pour confirmer." },
      { status: 400 },
    );
  }

  // Stripe cancellation — hard-fail if it errors. We don't want to delete the
  // Clerk user while leaving an active Stripe subscription that keeps charging.
  const priv = user.privateMetadata as Record<string, unknown>;
  const stripeSubId = priv?.stripeSubscriptionId as string | undefined;
  const stripeStatus = priv?.subscriptionStatus as string | undefined;

  if (stripeSubId && stripeStatus === "active") {
    try {
      await stripe.subscriptions.cancel(stripeSubId);
      log.event("account/delete", "stripe_cancelled", { userId, sub_id: stripeSubId });
    } catch (err) {
      log.error("account/delete", "stripe_cancel_failed", { userId, sub_id: stripeSubId }, err);
      return NextResponse.json(
        {
          error:
            "Impossible d'annuler votre abonnement Stripe. Contactez le support avant de supprimer votre compte.",
        },
        { status: 500 },
      );
    }
  }

  // Delete Clerk user (cascades everything)
  try {
    await clerk.users.deleteUser(userId);
    log.event("account/delete", "success", { userId });
  } catch (err) {
    log.error("account/delete", "clerk_delete_failed", { userId }, err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte. Réessayez ou contactez le support." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
