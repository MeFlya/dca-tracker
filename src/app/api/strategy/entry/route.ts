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
    note?: string;
  };

  const { month, invested, portfolioValue, note } = body;
  if (!month || typeof invested !== "number" || typeof portfolioValue !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  if (invested < 0 || portfolioValue < 0) {
    return NextResponse.json({ error: "Values must be positive" }, { status: 400 });
  }

  const entry: { month: string; invested: number; portfolioValue: number; note?: string } = {
    month,
    invested,
    portfolioValue,
  };
  if (note && typeof note === "string" && note.trim()) {
    entry.note = note.trim().slice(0, 500); // cap to 500 chars
  }

  await addMonthlyEntry(userId, entry);
  return NextResponse.json({ success: true });
}
