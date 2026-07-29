// Onboarding email scheduler — fires Day3, Day7, Day14 emails when their
// scheduled date is reached. Triggered daily via Vercel Cron.
//
// State lives in Clerk privateMetadata.onboarding (set by the welcome
// route at signup). The schema:
//   {
//     welcomeSentAt:    "ISO date",
//     scheduledDay3At:  "ISO date",
//     scheduledDay7At:  "ISO date",
//     scheduledDay14At: "ISO date",
//     day3SentAt:       "ISO date" | null,
//     day7SentAt:       "ISO date" | null,
//     day14SentAt:      "ISO date" | null,
//   }
//
// Why this rather than Resend `scheduled_at`? Resend's free plan caps
// `scheduled_at` at 72h in the future — Day7 and Day14 were silently
// sent immediately. Our own cron gives accurate timing at any horizon.
//
// Protected by CRON_SECRET env var (set in Vercel project settings).

import { NextResponse } from "next/server";
import { denyUnlessCron } from "@/lib/cron-auth";
import { isOptedOutFromMetadata } from "@/lib/email-preferences";
import { clerkClient } from "@clerk/nextjs/server";
import {
  sendOnboardingDay3,
  sendOnboardingDay7,
  sendOnboardingDay14,
} from "@/lib/emails/send";

export const dynamic = "force-dynamic";

type OnboardingState = {
  welcomeSentAt?: string;
  scheduledDay3At?: string;
  scheduledDay7At?: string;
  scheduledDay14At?: string;
  day3SentAt?: string | null;
  day7SentAt?: string | null;
  day14SentAt?: string | null;
};

type Step = {
  key: "day3" | "day7" | "day14";
  scheduledKey: "scheduledDay3At" | "scheduledDay7At" | "scheduledDay14At";
  sentKey: "day3SentAt" | "day7SentAt" | "day14SentAt";
  send: (email: string, firstName: string) => Promise<void>;
};

const STEPS: Step[] = [
  {
    key: "day3",
    scheduledKey: "scheduledDay3At",
    sentKey: "day3SentAt",
    send: sendOnboardingDay3,
  },
  {
    key: "day7",
    scheduledKey: "scheduledDay7At",
    sentKey: "day7SentAt",
    send: sendOnboardingDay7,
  },
  {
    key: "day14",
    scheduledKey: "scheduledDay14At",
    sentKey: "day14SentAt",
    send: sendOnboardingDay14,
  },
];

export async function GET(req: Request) {
  // Auth via CRON_SECRET (Vercel cron sends this in Authorization header)
  const denied = denyUnlessCron(req);
  if (denied) return denied;

  const clerk = await clerkClient();
  const now = Date.now();
  let scanned = 0;
  let sent = 0;
  let errors = 0;
  let skippedOptOut = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: users } = await clerk.users.getUserList({ limit, offset });
    if (!users.length) break;

    for (const user of users) {
      // Désinscription lue depuis l'objet utilisateur déjà chargé — aucun appel
      // réseau supplémentaire. Le garde-fou de dispatch.ts reste en second
      // rideau pour les envois qui ne passent pas par une boucle de cron.
      if (isOptedOutFromMetadata(user.privateMetadata)) {
        skippedOptOut++;
        continue;
      }

      scanned++;
      const meta = user.privateMetadata as Record<string, unknown>;
      const onboarding = meta.onboarding as OnboardingState | undefined;
      if (!onboarding) continue;

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;
      const firstName = user.firstName ?? "Investisseur";

      // Process each step in order. Each iteration may persist metadata
      // changes — keep `currentMeta` in memory so we don't lose state.
      let currentMeta: OnboardingState = { ...onboarding };
      let dirty = false;

      for (const step of STEPS) {
        const scheduledIso = currentMeta[step.scheduledKey];
        const sentIso = currentMeta[step.sentKey];

        // Skip if already sent
        if (sentIso) continue;

        // Skip if scheduled date is missing or still in the future
        if (!scheduledIso) continue;
        const scheduledTime = new Date(scheduledIso).getTime();
        if (Number.isNaN(scheduledTime) || scheduledTime > now) continue;

        // Send the email
        try {
          await step.send(email, firstName);
          currentMeta = {
            ...currentMeta,
            [step.sentKey]: new Date(now).toISOString(),
          };
          dirty = true;
          sent++;
        } catch (err) {
          console.error(
            `[onboarding-cron] Failed to send ${step.key} to ${email}:`,
            err
          );
          errors++;
          // Don't mark as sent — will retry on next cron run
        }
      }

      if (dirty) {
        try {
          await clerk.users.updateUserMetadata(user.id, {
            privateMetadata: { ...meta, onboarding: currentMeta },
          });
        } catch (err) {
          console.error(
            `[onboarding-cron] Failed to update metadata for ${user.id}:`,
            err
          );
          errors++;
        }
      }
    }

    if (users.length < limit) break;
    offset += limit;
  }

  return NextResponse.json({ scanned, sent, errors });
}
