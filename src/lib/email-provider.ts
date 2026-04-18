// Newsletter subscription handler.
// Sends a welcome email via Resend (already configured for transactional emails).
// Optionally adds the contact to a Resend Audience if RESEND_AUDIENCE_ID is set.

import { resend } from "./resend-client";

const FROM = process.env.RESEND_FROM_EMAIL ?? "DCA Tracker <bonjour@dcatracker.fr>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

export interface EmailSubscription {
  email: string;
  source: string;
}

export interface EmailProviderResult {
  success: boolean;
  error?: string;
}

export async function subscribeEmail({
  email,
}: EmailSubscription): Promise<EmailProviderResult> {
  try {
    // 1. Add to Resend Audience (optional — only if RESEND_AUDIENCE_ID is configured)
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      }).catch(() => {
        // Non-blocking: audience add failure doesn't block the welcome email
      });
    }

    // 2. Send welcome email immediately
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Votre guide PEA vs CTO est prêt 📬",
      html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">

  <div style="margin-bottom:24px">
    <span style="font-size:15px;font-weight:700;color:#1d4ed8">DCA</span>
    <span style="font-size:15px;color:#6b7280">Tracker</span>
  </div>

  <h1 style="font-size:22px;font-weight:700;margin:0 0 8px 0;line-height:1.3">
    Votre guide PEA vs CTO est prêt 📬
  </h1>
  <p style="color:#6b7280;margin:0 0 24px 0;font-size:15px">
    Merci de rejoindre DCA Tracker. Voici ce que vous avez demandé.
  </p>

  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px 0">
    <p style="margin:0 0 8px 0;font-weight:700;color:#1e40af;font-size:15px">
      📖 PEA ou CTO — le guide complet
    </p>
    <p style="margin:0 0 14px 0;color:#1e3a8a;font-size:14px;line-height:1.5">
      Quelle enveloppe fiscale pour vos ETF, comment arbitrer entre les deux,
      et les erreurs courantes à éviter quand on débute en DCA.
    </p>
    <a href="${SITE_URL}/pea-ou-cto"
       style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
      Lire le guide →
    </a>
  </div>

  <div style="background:#f8fafc;border-radius:12px;padding:18px;margin:0 0 24px 0;border:1px solid #e2e8f0">
    <p style="margin:0 0 6px 0;font-weight:600;font-size:14px;color:#0f172a">🧮 Et si vous testiez le simulateur ?</p>
    <p style="margin:0 0 12px 0;font-size:13px;color:#475569;line-height:1.5">
      Projetez votre épargne mensuelle sur 10, 20 ou 30 ans. Gratuit, sans compte requis.
    </p>
    <a href="${SITE_URL}/simulateur"
       style="font-size:13px;color:#2563eb;text-decoration:none;font-weight:600">
      Lancer une simulation →
    </a>
  </div>

  <p style="color:#94a3b8;font-size:12px;margin-top:32px;line-height:1.5">
    Vous recevez cet email parce que vous avez demandé le guide PEA vs CTO sur dcatracker.fr.<br>
    Pas d'intérêt ? <a href="${SITE_URL}" style="color:#94a3b8">Désinscription en un clic.</a>
  </p>
</body>
</html>`,
    });

    if (error) {
      console.error("[email-provider] Resend error:", error);
      return { success: false, error: "Impossible d'envoyer l'email pour l'instant." };
    }

    return { success: true };
  } catch (err) {
    console.error("[email-provider] Unexpected error:", err);
    return { success: false, error: "Erreur lors de l'inscription." };
  }
}
