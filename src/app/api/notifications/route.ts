// Endpoint des notifications in-app.
// Lit la stratégie + l'abonnement de l'user, calcule les notifications
// dérivées (lib/notifications) et les renvoie. L'état lu/non-lu est géré
// côté client (localStorage).

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStrategyData } from "@/lib/user-strategy";
import { getUserSubscription } from "@/lib/subscription";
import { computeNotifications } from "@/lib/notifications";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ notifications: [] });
  }

  try {
    const [data, sub] = await Promise.all([
      getStrategyData(userId),
      getUserSubscription(),
    ]);

    const notifications = computeNotifications({
      plan: sub.plan,
      hasStrategy: !!data.strategy,
      entries: data.entries.map((e) => ({
        month: e.month,
        portfolioValue: e.portfolioValue,
        invested: e.invested,
      })),
    });

    return NextResponse.json(
      { notifications },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    // En cas de souci de lecture, on renvoie une liste vide plutôt que 500
    // (les notifications ne sont pas critiques).
    return NextResponse.json({ notifications: [] });
  }
}
