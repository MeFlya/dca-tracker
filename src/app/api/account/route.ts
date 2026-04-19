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

  // Best-effort Stripe cancellation
  const priv = user.privateMetadata as Record<string, unknown>;
  const stripeSubId = priv?.stripeSubscriptionId as string | undefined;

  if (stripeSubId) {
    try {
      await stripe.subscriptions.cancel(stripeSubId);
    } catch (err) {
      console.error(
        "[account/delete] Failed to cancel Stripe subscription:",
        err,
      );
      // Continue — user explicitly wants to delete their account. Stripe
      // issues can be resolved out-of-band via support.
    }
  }

  // Delete Clerk user (cascades everything)
  await clerk.users.deleteUser(userId);

  return NextResponse.json({ success: true });
}
