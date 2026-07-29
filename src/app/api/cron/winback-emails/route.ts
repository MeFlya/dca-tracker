// Win-back email scheduler — fires J+7 and J+30 emails post-cancellation.
// Triggered daily via Vercel Cron (cf vercel.json).
//
// State lives in Clerk privateMetadata (set by the Stripe webhook on
// customer.subscription.deleted). Relevant fields :
//   - canceledAt     : "ISO date"
//   - winBackJ7Sent  : boolean
//   - winBackJ30Sent : boolean
//
// On chaque tick :
//   - Scan all users
//   - Skip ceux sans canceledAt
//   - Skip si réactivé (plan === "premium" → l'user est revenu, on n'envoie pas)
//   - Envoyer J+7 si >= 7 jours depuis canceledAt et !winBackJ7Sent
//   - Envoyer J+30 si >= 30 jours depuis canceledAt et !winBackJ30Sent
//
// Pattern strictement aligné sur onboarding-emails (même structure auth,
// même boucle pagination, même gestion d'erreurs).

import { NextResponse } from "next/server";
import { denyUnlessCron } from "@/lib/cron-auth";
import { isOptedOutFromMetadata } from "@/lib/email-preferences";
import { clerkClient } from "@clerk/nextjs/server";
import { sendWinBackJ7, sendWinBackJ30 } from "@/lib/emails/send";

export const dynamic = "force-dynamic";

const J7_MS = 7 * 24 * 60 * 60 * 1000;
const J30_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  // Auth via CRON_SECRET (Vercel cron sends this in Authorization header)
  const denied = denyUnlessCron(req);
  if (denied) return denied;

  const clerk = await clerkClient();
  const now = Date.now();
  let scanned = 0;
  let sentJ7 = 0;
  let sentJ30 = 0;
  let errors = 0;
  let skippedOptOut = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: users } = await clerk.users.getUserList({ limit, offset });
    if (!users.length) break;

    for (const user of users) {
      // Désinscription lue depuis l'objet utilisateur déjà chargé — aucun appel
      // réseau supplémentaire. Le garde-fou de dispatch.ts reste en second
      // rideau pour les envois qui ne passent pas par une boucle de cron.
      if (isOptedOutFromMetadata(user.privateMetadata)) {
        skippedOptOut++;
        continue;
      }

      scanned++;
      const meta = user.privateMetadata as Record<string, unknown>;
      const publicMeta = user.publicMetadata as Record<string, unknown>;

      const canceledAt = meta.canceledAt as string | undefined;
      if (!canceledAt) continue;

      // Si l'user a réactivé entre temps (plan === "premium"), on ne
      // déclenche plus de win-back — il est revenu, pas besoin de nudger.
      if (publicMeta.plan === "premium") continue;

      const canceledTime = new Date(canceledAt).getTime();
      if (Number.isNaN(canceledTime)) continue;

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;
      const firstName = user.firstName ?? "Investisseur";

      const elapsed = now - canceledTime;
      const winBackJ7Sent = meta.winBackJ7Sent === true;
      const winBackJ30Sent = meta.winBackJ30Sent === true;

      let dirty = false;
      const newMeta: Record<string, unknown> = {};

      // ── J+7 ──────────────────────────────────────────────────────────
      if (!winBackJ7Sent && elapsed >= J7_MS) {
        try {
          await sendWinBackJ7(email, firstName);
          newMeta.winBackJ7Sent = true;
          dirty = true;
          sentJ7++;
        } catch (err) {
          console.error(`[winback-cron] J7 failed for ${email}:`, err);
          errors++;
        }
      }

      // ── J+30 ─────────────────────────────────────────────────────────
      if (!winBackJ30Sent && elapsed >= J30_MS) {
        try {
          await sendWinBackJ30(email, firstName);
          newMeta.winBackJ30Sent = true;
          dirty = true;
          sentJ30++;
        } catch (err) {
          console.error(`[winback-cron] J30 failed for ${email}:`, err);
          errors++;
        }
      }

      if (dirty) {
        try {
          await clerk.users.updateUserMetadata(user.id, {
            privateMetadata: newMeta,
          });
        } catch (err) {
          console.error(
            `[winback-cron] Failed to persist metadata for ${email}:`,
            err
          );
          errors++;
        }
      }
    }

    if (users.length < limit) break;
    offset += limit;
  }

  return NextResponse.json({
    ok: true,
    scanned,
    sentJ7,
    sentJ30,
    errors,
  });
}
