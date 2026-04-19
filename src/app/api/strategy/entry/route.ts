import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  upsertMonthlyEntry,
  deleteMonthlyEntry,
  type Contribution,
  type StoredMonthlyEntry,
} from "@/lib/user-strategy";
import { getUserSubscription } from "@/lib/subscription";

type IncomingContribution = {
  id?: string;
  date: string;
  amount: number;
  note?: string;
};

type PostBody = {
  month?: string;
  contributions?: IncomingContribution[];
  invested?: number; // legacy single-contribution compat
  portfolioValue?: number;
  note?: string;
};

function cleanNote(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 500);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getUserSubscription();
  if (sub.plan === "free") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
  }

  const body = (await req.json()) as PostBody;
  const month = body.month;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }
  if (typeof body.portfolioValue !== "number" || body.portfolioValue <= 0) {
    return NextResponse.json({ error: "Portfolio value must be positive" }, { status: 400 });
  }

  let contributions: Contribution[];

  if (Array.isArray(body.contributions) && body.contributions.length > 0) {
    contributions = body.contributions.map((c) => ({
      id: c.id ?? randomUUID(),
      date: c.date,
      amount: Number(c.amount),
      note: cleanNote(c.note),
    }));

    for (const c of contributions) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) {
        return NextResponse.json({ error: `Invalid contribution date: ${c.date}` }, { status: 400 });
      }
      if (!c.date.startsWith(month + "-")) {
        return NextResponse.json({ error: `Contribution ${c.date} outside of month ${month}` }, { status: 400 });
      }
      if (!Number.isFinite(c.amount) || c.amount < 0) {
        return NextResponse.json({ error: "Contribution amount must be positive" }, { status: 400 });
      }
    }
  } else if (typeof body.invested === "number" && body.invested >= 0) {
    // Legacy compat — synthesize single mid-month contribution
    contributions = [
      {
        id: randomUUID(),
        date: `${month}-15`,
        amount: body.invested,
      },
    ];
  } else {
    return NextResponse.json({ error: "No contributions provided" }, { status: 400 });
  }

  const entry: StoredMonthlyEntry = {
    month,
    contributions,
    portfolioValue: body.portfolioValue,
    note: cleanNote(body.note),
  };

  await upsertMonthlyEntry(userId, entry);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getUserSubscription();
  if (sub.plan === "free") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
  }

  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  await deleteMonthlyEntry(userId, month);
  return NextResponse.json({ success: true });
}
