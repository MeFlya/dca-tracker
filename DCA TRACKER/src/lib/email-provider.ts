/**
 * Email provider abstraction.
 *
 * To wire up a real provider:
 *   1. Set EMAIL_PROVIDER=brevo | resend | mailchimp in your .env.local
 *   2. Add the matching env vars (API key, list ID, …)
 *   3. Uncomment the corresponding import block below and implement the adapter
 *
 * Until a provider is configured this module logs the subscription and returns
 * success — useful for local dev and staging without burning API quota.
 */

export interface EmailSubscription {
  email: string;
  source: string; // e.g. "homepage" | "simulator"
}

export interface EmailProviderResult {
  success: boolean;
  error?: string;
}

type EmailProviderFn = (sub: EmailSubscription) => Promise<EmailProviderResult>;

// ─── Provider registry ────────────────────────────────────────────────────────

function resolveProvider(): EmailProviderFn | null {
  const name = process.env.EMAIL_PROVIDER;
  if (!name) return null;

  // ── Brevo (formerly Sendinblue) ───────────────────────────────────────────
  // Required env: BREVO_API_KEY, BREVO_LIST_ID
  // if (name === "brevo") {
  //   return async ({ email }) => {
  //     const res = await fetch("https://api.brevo.com/v3/contacts", {
  //       method: "POST",
  //       headers: {
  //         "api-key": process.env.BREVO_API_KEY!,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email,
  //         listIds: [Number(process.env.BREVO_LIST_ID)],
  //         updateEnabled: true,
  //       }),
  //     });
  //     if (res.ok || res.status === 204) return { success: true };
  //     const data = await res.json().catch(() => ({}));
  //     return { success: false, error: data.message ?? "Brevo error" };
  //   };
  // }

  // ── Resend (with Audiences) ───────────────────────────────────────────────
  // Required env: RESEND_API_KEY, RESEND_AUDIENCE_ID
  // if (name === "resend") {
  //   return async ({ email }) => {
  //     const res = await fetch(
  //       `https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ email }),
  //       }
  //     );
  //     if (res.ok) return { success: true };
  //     const data = await res.json().catch(() => ({}));
  //     return { success: false, error: data.message ?? "Resend error" };
  //   };
  // }

  // ── Mailchimp ─────────────────────────────────────────────────────────────
  // Required env: MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_SERVER (e.g. "us21")
  // if (name === "mailchimp") {
  //   return async ({ email }) => {
  //     const { createHash } = await import("crypto");
  //     const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  //     const res = await fetch(
  //       `https://${process.env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/${hash}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           Authorization: `Bearer ${process.env.MAILCHIMP_API_KEY}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ email_address: email, status_if_new: "subscribed" }),
  //       }
  //     );
  //     if (res.ok) return { success: true };
  //     const data = await res.json().catch(() => ({}));
  //     return { success: false, error: data.detail ?? "Mailchimp error" };
  //   };
  // }

  console.warn(`[email-provider] Unknown EMAIL_PROVIDER="${name}" — falling back to placeholder.`);
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function subscribeEmail(sub: EmailSubscription): Promise<EmailProviderResult> {
  const provider = resolveProvider();

  if (!provider) {
    // Placeholder mode: no provider configured.
    // Remove this log (or gate it behind NODE_ENV) before production.
    console.log(
      `[email-provider] Placeholder — subscription received: ${sub.email} (source: ${sub.source})`
    );
    return { success: true };
  }

  try {
    return await provider(sub);
  } catch (err) {
    console.error("[email-provider] Unexpected error:", err);
    return { success: false, error: "Erreur lors de l'inscription." };
  }
}
