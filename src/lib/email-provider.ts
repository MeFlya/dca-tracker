// Newsletter subscription handler.
// Sends a welcome email via Resend and optionally adds the contact to a
// Resend Audience (requires RESEND_AUDIENCE_ID env var).

import { resend } from "./resend-client";

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "DCA Tracker <hello@dcatracker.fr>";
const SITE_URL = "https://dcatracker.fr";

export interface EmailSubscription {
  email: string;
  source: string;
}

export interface EmailProviderResult {
  success: boolean;
  error?: string;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildWelcomeHtml(source: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Bienvenue sur DCA Tracker</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
              <a href="${SITE_URL}" style="text-decoration:none">
                <span style="font-size:16px;font-weight:700;color:#1d4ed8">DCA</span><span style="font-size:16px;color:#6b7280">Tracker</span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px">

              <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3">
                Bienvenue sur DCA Tracker
              </h1>

              <p style="margin:0 0 20px 0;font-size:15px;color:#475569;line-height:1.7">
                Tu viens de rejoindre DCA Tracker.<br/>
                L&rsquo;objectif&nbsp;: t&rsquo;aider &agrave; comprendre ce que ton &eacute;pargne
                peut vraiment devenir dans le temps.
              </p>

              <!-- Example callout -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0">
                <tr>
                  <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px">
                    <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em">
                      Exemple concret
                    </p>
                    <p style="margin:0;font-size:15px;color:#1e3a8a;line-height:1.65">
                      <strong>200&nbsp;&euro;/mois pendant 20&nbsp;ans</strong> peuvent repr&eacute;senter
                      environ <strong>104&nbsp;000&nbsp;&euro;</strong> selon les hypoth&egrave;ses
                      choisies &mdash; dont plus de la moiti&eacute; g&eacute;n&eacute;r&eacute;s par les
                      int&eacute;r&ecirc;ts compos&eacute;s, sans effort suppl&eacute;mentaire.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px 0;font-size:15px;color:#475569;line-height:1.7">
                Lance ta premi&egrave;re simulation&nbsp;: choisis un versement mensuel,
                une dur&eacute;e et un rendement cible. Le r&eacute;sultat s&rsquo;affiche
                en quelques secondes avec trois sc&eacute;narios compar&eacute;s.
              </p>

              <!-- Primary CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
                <tr>
                  <td style="border-radius:8px;background:#2563eb">
                    <a href="${SITE_URL}/simulateur"
                       style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;line-height:1">
                      Lancer ma simulation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary links -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;padding-top:24px">
                <tr>
                  <td>
                    <p style="margin:0 0 10px 0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em">
                      Pour aller plus loin
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr><td style="padding:4px 0"><a href="${SITE_URL}/investir-200-euros-mois-etf" style="font-size:14px;color:#2563eb;text-decoration:none">200&nbsp;&euro;/mois en ETF &mdash; simulation sur 20&nbsp;ans &rarr;</a></td></tr>
                      <tr><td style="padding:4px 0"><a href="${SITE_URL}/pea-ou-cto" style="font-size:14px;color:#2563eb;text-decoration:none">PEA ou CTO &mdash; quelle enveloppe choisir&nbsp;? &rarr;</a></td></tr>
                      <tr><td style="padding:4px 0"><a href="${SITE_URL}/strategie-dca" style="font-size:14px;color:#2563eb;text-decoration:none">La strat&eacute;gie DCA expliqu&eacute;e &rarr;</a></td></tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
              <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;line-height:1.5">
                &Agrave; bient&ocirc;t,<br/>
                <strong>L&rsquo;&eacute;quipe DCA Tracker</strong>
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;line-height:1.6">
                Vous recevez cet email car vous vous &ecirc;tes inscrit sur
                <a href="${SITE_URL}" style="color:#cbd5e1;text-decoration:underline">${SITE_URL}</a>
                (source&nbsp;: ${source}).
                DCA Tracker est un outil p&eacute;dagogique &mdash; pas de conseil en investissement.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeText(source: string): string {
  return `Bienvenue sur DCA Tracker

Tu viens de rejoindre DCA Tracker.
L'objectif : t'aider à comprendre ce que ton épargne peut vraiment devenir dans le temps.

--- Exemple concret ---
200€/mois pendant 20 ans peuvent représenter environ 104 000€ selon les
hypothèses choisies — dont plus de la moitié générés par les intérêts
composés, sans effort supplémentaire.

Lance ta première simulation :
${SITE_URL}/simulateur

Pour aller plus loin :
- 200€/mois en ETF : ${SITE_URL}/investir-200-euros-mois-etf
- PEA ou CTO : ${SITE_URL}/pea-ou-cto
- Stratégie DCA : ${SITE_URL}/strategie-dca

À bientôt,
L'équipe DCA Tracker

---
Vous recevez cet email car vous vous êtes inscrit sur ${SITE_URL} (source : ${source}).
DCA Tracker est un outil pédagogique — pas de conseil en investissement.`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function subscribeEmail({
  email,
  source,
}: EmailSubscription): Promise<EmailProviderResult> {
  try {
    // 1. Add to Resend Audience — optional, non-blocking.
    //    Set RESEND_AUDIENCE_ID in Vercel env vars to enable contact list management.
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      }).catch((err) =>
        console.warn("[email-provider] Audience add failed (non-blocking):", err)
      );
    }

    // 2. Send welcome email — blocking: failure surfaces to caller.
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Bienvenue sur DCA Tracker",
      html: buildWelcomeHtml(source),
      text: buildWelcomeText(source),
    });

    if (error) {
      console.error("[email-provider] Resend send error:", error);
      return {
        success: false,
        error: "Impossible d'envoyer l'email pour l'instant.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[email-provider] Unexpected error:", err);
    return { success: false, error: "Erreur lors de l'inscription." };
  }
}
