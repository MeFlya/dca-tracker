// Annual plan push — weekly cron targeting monthly subscribers at
// 3-month / 6-month / 12-month thresholds. Dedupes via annualPushSent[]
// in Clerk privateMetadata.

import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sendAnnualPush, type AnnualPushMilestone } from "@/lib/emails/send";

export const dynamic = "force-dynamic";

const MILESTONES: { id: AnnualPushMilestone; days: number }[] = [
  { id: "month-3", days: 90 },
  { id: "month-6", days: 180 },
  { id: "month-12", days: 365 },
];

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const clerk = await clerkClient();
  let sent = 0;
  let errors = 0;
  let skipped = 0;
  let offset = 0;
  const limit = 100;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  while (true) {
    const { data: users } = await clerk.users.getUserList({ limit, offset });
    if (!users.length) break;

    for (const user of users) {
      const plan = (user.publicMetadata?.plan as string) ?? "free";
      if (plan === "free") { skipped++; continue; }

      const priv = (user.privateMetadata ?? {}) as Record<string, unknown>;
      const interval = priv.subscriptionInterval as string | undefined;
      const subscribedAt = priv.subscribedAt as string | undefined;
      const alreadySent = (priv.annualPushSent as string[] | undefined) ?? [];

      // Skip if not a monthly subscriber
      if (interval !== "month") { skipped++; continue; }
      if (!subscribedAt) { skipped++; continue; }

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) { skipped++; continue; }

      const daysSince = Math.floor((now - new Date(subscribedAt).getTime()) / dayMs);

      // Find the highest-threshold milestone not yet sent
      const milestone = [...MILESTONES]
        .reverse()
        .find((m) => daysSince >= m.days && !alreadySent.includes(m.id));

      if (!milestone) { skipped++; continue; }

      try {
        const firstName = user.firstName ?? "Investisseur";
        await sendAnnualPush({
          email,
          firstName,
          milestone: milestone.id,
        });

        await clerk.users.updateUserMetadata(user.id, {
          privateMetadata: {
            annualPushSent: [...alreadySent, milestone.id],
          },
        });

        sent++;
      } catch (err) {
        console.error(`[cron/annual-push] Failed for user ${user.id}:`, err);
        errors++;
      }
    }

    if (users.length < limit) break;
    offset += limit;
  }

  console.log(`[cron/annual-push] sent=${sent} errors=${errors} skipped=${skipped}`);
  return NextResponse.json({ sent, errors, skipped });
}
