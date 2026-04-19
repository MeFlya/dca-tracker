import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStrategyData, saveStrategy } from "@/lib/user-strategy";
import { getUserSubscription } from "@/lib/subscription";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getStrategyData(userId);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getUserSubscription();
  if (sub.plan === "free") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
  }

  const body = await req.json() as { input?: unknown };
  if (!body.input) return NextResponse.json({ error: "Missing input" }, { status: 400 });

  await saveStrategy(userId, body.input as Parameters<typeof saveStrategy>[1]);
  return NextResponse.json({ success: true });
}
