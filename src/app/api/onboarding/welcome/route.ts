// Triggers the onboarding sequence: D+0 sent immediately, D+3/+7/+14
// scheduled by writing target dates into Clerk privateMetadata. The
// cron at /api/cron/onboarding-emails picks them up day-by-day.
//
// Why not Resend `scheduled_at`? On the free plan it's capped at 72h,
// so D+7 and D+14 emails were silently sent immediately. Switching to
// our own cron gives accurate timing at any horizon.

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendOnboardingWelcome } from "@/lib/emails/send";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Record<string, unknown>;

  // Idempotent — once the welcome was fired, never re-trigger
  if (meta.onboardingEmailsSent) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

  const firstName = user.firstName ?? "Investisseur";
  const now = Date.now();

  // Send the welcome email immediately. If it fails, we still write the
  // schedule so the rest of the sequence reaches the user.
  try {
    await sendOnboardingWelcome(email, firstName);
  } catch (err) {
    console.error("[onboarding/welcome] Welcome send failed:", err);
  }

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...meta,
      onboardingEmailsSent: true,
      onboardingEmailsSentAt: new Date(now).toISOString(),
      onboarding: {
        welcomeSentAt: new Date(now).toISOString(),
        // Future emails — the cron checks these dates daily.
        scheduledDay3At: new Date(now + 3 * DAY_MS).toISOString(),
        scheduledDay7At: new Date(now + 7 * DAY_MS).toISOString(),
        scheduledDay14At: new Date(now + 14 * DAY_MS).toISOString(),
        day3SentAt: null,
        day7SentAt: null,
        day14SentAt: null,
      },
    },
  });

  return NextResponse.json({ success: true });
}
