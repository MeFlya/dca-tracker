// Fires the 4-email onboarding sequence (D+0 immediate, then +3, +7, +14 via Resend scheduled_at).
// Deduped via Clerk privateMetadata.onboardingEmailsSent.
// Called client-side on first /account visit; idempotent.

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  sendOnboardingWelcome,
  sendOnboardingDay3,
  sendOnboardingDay7,
  sendOnboardingDay14,
} from "@/lib/emails/send";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;

  if (meta.onboardingEmailsSent) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

  const firstName = user.firstName ?? "Investisseur";

  try {
    await Promise.all([
      sendOnboardingWelcome(email, firstName),
      sendOnboardingDay3(email, firstName),
      sendOnboardingDay7(email, firstName),
      sendOnboardingDay14(email, firstName),
    ]);
  } catch (err) {
    console.error("[onboarding/welcome] Failed:", err);
    // Still mark as sent to prevent hammering Resend on retries.
    // If the first email failed, the user can still use the product.
  }

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...meta,
      onboardingEmailsSent: true,
      onboardingEmailsSentAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true });
}
