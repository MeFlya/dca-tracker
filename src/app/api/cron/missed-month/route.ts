// Missed-month reminder cron — fires around the 10th of each month.
// For each Premium/Pro user with a saved strategy who has NOT logged the
// previous month, send a "streak in danger" reminder email.
// Skips users whose strategy started this month or last month (no data expected).
// Protected by CRON_SECRET env var.

import { NextResponse } from "next/server";
import { denyUnlessCron } from "@/lib/cron-auth";
import { clerkClient } from "@clerk/nextjs/server";
import { getStrategyData } from "@/lib/user-strategy";
import { currentMonth, previousMonth, computeStreak } from "@/lib/strategy-math";
import { sendMissedMonth } from "@/lib/emails/send";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = denyUnlessCron(req);
  if (denied) return denied;

  const clerk = await clerkClient();
  let sent = 0;
  let errors = 0;
  let skipped = 0;
  let offset = 0;
  const limit = 100;

  const curM = currentMonth();
  const prevM = previousMonth(curM);

  while (true) {
    const { data: users } = await clerk.users.getUserList({ limit, offset });
    if (!users.length) break;

    for (const user of users) {
      const plan = (user.publicMetadata?.plan as string) ?? "free";
      if (plan === "free") {
        skipped++;
        continue;
      }

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) {
        skipped++;
        continue;
      }

      try {
        const { strategy, entries } = await getStrategyData(user.id);
        if (!strategy) {
          skipped++;
          continue;
        }

        // Skip if strategy started this month or the previous month
        // (no data expected yet — they're still onboarding).
        if (strategy.startMonth >= prevM) {
          skipped++;
          continue;
        }

        // Skip if the previous month is already logged.
        if (entries.some((e) => e.month === prevM)) {
          skipped++;
          continue;
        }

        const streak = computeStreak(entries.map((e) => e.month));
        const firstName = user.firstName ?? "Investisseur";

        await sendMissedMonth({
          email,
          firstName,
          prevMonth: prevM,
          streak,
        });

        sent++;
      } catch (err) {
        console.error(`[cron/missed-month] Failed for user ${user.id}:`, err);
        errors++;
      }
    }

    if (users.length < limit) break;
    offset += limit;
  }

  console.log(`[cron/missed-month] sent=${sent} errors=${errors} skipped=${skipped}`);
  return NextResponse.json({ sent, errors, skipped });
}
