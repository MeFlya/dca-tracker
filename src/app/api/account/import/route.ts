// Bulk import endpoint — writes multiple MonthlyEntry rows in a single request.
// POST /api/account/import
// Body: { months: [{ month, contributions: [...], portfolioValue, note? }] }

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  upsertMonthlyEntry,
  type StoredMonthlyEntry,
  type Contribution,
} from "@/lib/user-strategy";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type IncomingMonth = {
  month: string;
  contributions: { date: string; amount: number; note?: string }[];
  portfolioValue: number;
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
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getUserSubscription();
  if (sub.plan === "free") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
  }

  const body = (await req.json()) as { months?: IncomingMonth[] };
  if (!Array.isArray(body.months) || body.months.length === 0) {
    return NextResponse.json({ error: "No months provided" }, { status: 400 });
  }
  if (body.months.length > 60) {
    return NextResponse.json(
      { error: "Trop de mois (60 maximum par import)" },
      { status: 400 },
    );
  }

  let imported = 0;
  let failed = 0;

  for (const m of body.months) {
    if (!m.month || !/^\d{4}-\d{2}$/.test(m.month)) {
      failed++;
      continue;
    }
    if (typeof m.portfolioValue !== "number" || m.portfolioValue <= 0) {
      failed++;
      continue;
    }
    if (!Array.isArray(m.contributions) || m.contributions.length === 0) {
      failed++;
      continue;
    }

    const contributions: Contribution[] = [];
    let skipContrib = false;
    for (const c of m.contributions) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date) || !c.date.startsWith(m.month + "-")) {
        skipContrib = true;
        break;
      }
      if (!Number.isFinite(c.amount) || c.amount < 0) {
        skipContrib = true;
        break;
      }
      contributions.push({
        id: randomUUID(),
        date: c.date,
        amount: c.amount,
        note: cleanNote(c.note),
      });
    }
    if (skipContrib) {
      failed++;
      continue;
    }

    const entry: StoredMonthlyEntry = {
      month: m.month,
      contributions,
      portfolioValue: m.portfolioValue,
      note: cleanNote(m.note),
    };

    try {
      await upsertMonthlyEntry(userId, entry);
      imported++;
    } catch (err) {
      console.error(`[account/import] Failed for month ${m.month}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ imported, failed, total: body.months.length });
}
