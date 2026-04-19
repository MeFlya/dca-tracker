import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { addMonthlyEntry } from "@/lib/user-strategy";
import { getUserSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getUserSubscription();
  if (sub.plan === "free") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
  }

  const body = await req.json() as {
    month?: string;
    invested?: number;
    portfolioValue?: number;
  };

  const { month, invested, portfolioValue } = body;
  if (!month || typeof invested !== "number" || typeof portfolioValue !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await addMonthlyEntry(userId, { month, invested, portfolioValue });
  return NextResponse.json({ success: true });
}
