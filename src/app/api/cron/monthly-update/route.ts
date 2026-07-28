// Monthly update cron — triggered on the 1st of each month via Vercel Cron.
// Sends a personalised "Mois X" email to every Premium/Pro user with a saved strategy.
// Protected by CRON_SECRET env var (set in Vercel project settings).

import { NextResponse } from "next/server";
import { denyUnlessCron } from "@/lib/cron-auth";
import { clerkClient } from "@clerk/nextjs/server";
import { getStrategyData, theoreticalValueAtMonth, monthsElapsed } from "@/lib/user-strategy";
import { sendMonthlyUpdate } from "@/lib/emails/send";

export const dynamic = "force-dynamic";

function buildInsight(monthNumber: number, theoreticalValue: number, monthlyAmount: number): string {
  if (monthNumber <= 1) {
    return "Tu viens de démarrer ta stratégie. Continue, c'est le premier pas qui compte.";
  }
  if (monthNumber === 6) {
    return `6 mois de régularité — c'est maintenant que les intérêts composés commencent à travailler.`;
  }
  if (monthNumber === 12) {
    return `Un an de DCA complet. À ce rythme, dans 20 ans ta stratégie peut atteindre plusieurs fois ton capital investi.`;
  }
  // Generic insight
  const totalInvested = monthlyAmount * monthNumber;
  const gains = theoreticalValue - totalInvested;
  if (gains > 0) {
    return `Sur ${monthNumber} mois, les intérêts ont généré environ ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(gains)} en plus de tes versements.`;
  }
  return `Continue ton DCA — la régularité sur le long terme fait toute la différence.`;
}

export async function GET(req: Request) {
  const denied = denyUnlessCron(req);
  if (denied) return denied;

  const clerk = await clerkClient();
  let sent = 0;
  let errors = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: users } = await clerk.users.getUserList({ limit, offset });
    if (!users.length) break;

    for (const user of users) {
      const plan = (user.publicMetadata?.plan as string) ?? "free";
      if (plan === "free") continue;

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      try {
        const { strategy, entries } = await getStrategyData(user.id);
        if (!strategy) continue;

        const elapsed = monthsElapsed(strategy.startMonth);
        const monthNumber = Math.max(elapsed, 1);
        const theoretical = theoreticalValueAtMonth(strategy.input, monthNumber);
        const insight = buildInsight(monthNumber, theoretical, strategy.input.monthlyAmount);
        const firstName = user.firstName ?? "Investisseur";

        await sendMonthlyUpdate({
          email,
          firstName,
          monthNumber,
          theoreticalValue: theoretical,
          monthlyAmount: strategy.input.monthlyAmount,
          insight,
        });

        sent++;
      } catch (err) {
        console.error(`[cron] Failed for user ${user.id}:`, err);
        errors++;
      }
    }

    if (users.length < limit) break;
    offset += limit;
  }

  console.log(`[cron/monthly-update] sent=${sent} errors=${errors}`);
  return NextResponse.json({ sent, errors });
}
