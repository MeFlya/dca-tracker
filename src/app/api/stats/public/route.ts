// Public aggregate stats used by the homepage social-proof block.
// Iterates all Clerk users and tallies:
//   - total signed-up users
//   - users with a saved strategy
//   - total monthly entries logged across all users
//
// Heavy-cached (24h) via HTTP response headers + Next.js revalidate.
// Gracefully degrades if Clerk is unavailable or API returns empty.

import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { normalizeEntry } from "@/lib/user-strategy";

// API uses Clerk which reads request headers — must be dynamic.
// Cache effect is achieved via HTTP Cache-Control headers on the response
// (24h public cache + stale-while-revalidate).
export const dynamic = "force-dynamic";

type PublicStats = {
  users: number;
  strategies: number;
  monthsLogged: number;
  updatedAt: string;
};

const FALLBACK: PublicStats = {
  users: 0,
  strategies: 0,
  monthsLogged: 0,
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const clerk = await clerkClient();
    let users = 0;
    let strategies = 0;
    let monthsLogged = 0;
    let offset = 0;
    const limit = 100;

    while (true) {
      const { data } = await clerk.users.getUserList({ limit, offset });
      if (!data.length) break;

      for (const user of data) {
        users++;
        const priv = (user.privateMetadata ?? {}) as Record<string, unknown>;
        if (priv.dcaStrategy) strategies++;
        const rawEntries = (priv.dcaEntries as unknown[] | undefined) ?? [];
        monthsLogged += rawEntries.length;
        // Touch normalizeEntry so types stay in scope (also validates shape
        // lazily if ever needed — no-op on the happy path).
        void rawEntries.map(normalizeEntry).length;
      }

      if (data.length < limit) break;
      offset += limit;
    }

    const stats: PublicStats = {
      users,
      strategies,
      monthsLogged,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[stats/public] Failed to aggregate:", err);
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
