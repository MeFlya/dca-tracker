// Newsletter subscription handler.
// Sends the PEA vs CTO guide delivery email via Resend.
// All EmailCapture placements on the site promise this guide, so every
// subscription triggers the same guide email regardless of source.
// The `source` field is preserved in the footer for attribution tracking.

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

// ─── Templates ────────────────────────────────────────────────────────────────

function buildGuideHtml(source: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Votre guide PEA vs CTO est pr&ecirc;t</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">

  <!--[if mso]><div style="display:none"><![endif]-->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f8fafc">
    Le guide pratique pour choisir la bonne enveloppe pour vos ETF.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <!--[if mso]></div><![endif]-->

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

          <!-- Hero -->
          <tr>
            <td style="padding:36px 32px 0">
              <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.08em">
                Votre guide est pr&ecirc;t
              </p>
              <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#0f172a;line-height:1.3">
                PEA ou CTO &mdash; quelle enveloppe pour vos ETF&nbsp;?
              </h1>
              <p style="margin:0 0 28px 0;font-size:15px;color:#475569;line-height:1.7">
                Merci. Voici le guide pratique que vous avez demand&eacute;&nbsp;: tout ce
                qu&rsquo;il faut savoir pour choisir la bonne enveloppe fiscale avant
                de commencer &agrave; investir en ETF.
              </p>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td style="padding:0 32px 32px">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#2563eb">
                    <a href="${SITE_URL}/pea-ou-cto"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;line-height:1">
                      Lire le guide &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What the guide covers -->
          <tr>
            <td style="padding:0 32px 32px">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;padding-top:24px">
                <tr>
                  <td>
                    <p style="margin:0 0 16px 0;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em">
                      Ce que couvre le guide
                    </p>

                    <!-- Point 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px">
                          <div style="width:20px;height:20px;border-radius:50%;background:#eff6ff;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#2563eb">1</div>
                        </td>
                        <td style="padding-left:12px">
                          <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600;line-height:1.4">Quelle enveloppe choisir</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#64748b;line-height:1.5">PEA, CTO, assurance-vie : les crit&egrave;res concrets pour ne pas se tromper selon votre situation.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Point 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px">
                          <div style="width:20px;height:20px;border-radius:50%;background:#eff6ff;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#2563eb">2</div>
                        </td>
                        <td style="padding-left:12px">
                          <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600;line-height:1.4">Quels ETF y loger</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#64748b;line-height:1.5">Tous les ETF ne sont pas &eacute;ligibles PEA. Voici lesquels privil&eacute;gier dans chaque enveloppe.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Point 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px">
                          <div style="width:20px;height:20px;border-radius:50%;background:#eff6ff;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#2563eb">3</div>
                        </td>
                        <td style="padding-left:12px">
                          <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600;line-height:1.4">Les erreurs courantes &agrave; &eacute;viter</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#64748b;line-height:1.5">Ouvrir un CTO avant un PEA, m&eacute;langer les enveloppes sans strat&eacute;gie : les pi&egrave;ges que font la plupart des d&eacute;butants.</p>
                        </td>
                      </tr>
                    </table>

                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:8px;background:#2563eb">
                          <a href="${SITE_URL}/pea-ou-cto"
                             style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;line-height:1">
                            Lire le guide complet &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary CTA -->
          <tr>
            <td style="padding:0 32px 32px">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
                <tr>
                  <td style="padding:20px">
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#0f172a">
                      Et apr&egrave;s avoir choisi votre enveloppe&nbsp;?
                    </p>
                    <p style="margin:0 0 14px 0;font-size:13px;color:#64748b;line-height:1.5">
                      Simulez combien peut valoir votre &eacute;pargne mensuelle sur 10, 20 ou 30&nbsp;ans avec les int&eacute;r&ecirc;ts compos&eacute;s.
                    </p>
                    <a href="${SITE_URL}/simulateur"
                       style="font-size:13px;color:#2563eb;font-weight:600;text-decoration:none">
                      Lancer ma simulation &rarr;
                    </a>
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

function buildGuideText(source: string): string {
  return `Votre guide PEA vs CTO est prêt
========================================

Merci. Voici le guide pratique que vous avez demandé : tout ce qu'il faut
savoir pour choisir la bonne enveloppe fiscale avant de commencer à
investir en ETF.

Lire le guide : ${SITE_URL}/pea-ou-cto


CE QUE COUVRE LE GUIDE
-----------------------

1. Quelle enveloppe choisir
   PEA, CTO, assurance-vie : les critères concrets pour ne pas se tromper
   selon votre situation.

2. Quels ETF y loger
   Tous les ETF ne sont pas éligibles PEA. Voici lesquels privilégier
   dans chaque enveloppe.

3. Les erreurs courantes à éviter
   Ouvrir un CTO avant un PEA, mélanger les enveloppes sans stratégie :
   les pièges que font la plupart des débutants.


ET APRÈS AVOIR CHOISI VOTRE ENVELOPPE ?
-----------------------------------------
Simulez combien peut valoir votre épargne mensuelle sur 10, 20 ou 30 ans.

Lancer ma simulation : ${SITE_URL}/simulateur


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
    // Optional: add to Resend Audience for list management.
    // Set RESEND_AUDIENCE_ID in Vercel env vars to enable.
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

    // All EmailCapture placements promise the PEA vs CTO guide.
    // Send the guide delivery email for every subscription source.
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Votre guide PEA vs CTO est prêt",
      html: buildGuideHtml(source),
      text: buildGuideText(source),
    });

    if (error) {
      console.error("[email-provider] Resend error:", error);
      return {
        success: false,
        error: "Impossible d'envoyer l'email pour l'instant.",
      };
    }

    console.log("[email-provider] Email sent:", data?.id, "to:", email, "source:", source);
    return { success: true };
  } catch (err) {
    console.error("[email-provider] Unexpected error:", err);
    return { success: false, error: "Erreur lors de l'inscription." };
  }
}
