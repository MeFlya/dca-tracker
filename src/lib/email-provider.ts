// Newsletter subscription handler.
// Sends a high-conversion projection email via Resend.
// Hook → Number → Insight → Light FOMO → CTA to simulator.
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

function buildHtml(source: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Voici o&ugrave; vous en &ecirc;tes dans 20 ans</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f8fafc">
    La plupart des gens sous-estiment ce chiffre.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">

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
            <td style="padding:36px 32px 32px">

              <!-- Hook -->
              <p style="margin:0 0 20px 0;font-size:15px;color:#475569;line-height:1.7">
                La plupart des gens sous-estiment ce que 200&nbsp;&euro; par mois peuvent vraiment
                devenir sur le long terme.
              </p>

              <!-- Number block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;margin-bottom:24px">
                <tr>
                  <td style="padding:20px 24px">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em">
                      Avec 7&nbsp;%/an · 20&nbsp;ans
                    </p>
                    <p style="margin:0 0 4px 0;font-size:32px;font-weight:800;color:#1e40af;line-height:1.1">
                      102&nbsp;000&nbsp;&euro;
                    </p>
                    <p style="margin:8px 0 0 0;font-size:14px;color:#3b82f6;line-height:1.6">
                      Dont plus de <strong>50&nbsp;000&nbsp;&euro;</strong> g&eacute;n&eacute;r&eacute;s par la croissance,<br/>
                      pas par vos versements.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Insight -->
              <p style="margin:0 0 20px 0;font-size:15px;color:#475569;line-height:1.7">
                C&rsquo;est l&rsquo;effet des int&eacute;r&ecirc;ts compos&eacute;s&nbsp;: plus le temps passe,
                plus votre capital travaille pour vous &mdash; ind&eacute;pendamment de ce que vous versez.
              </p>

              <!-- FOMO -->
              <p style="margin:0 0 28px 0;font-size:15px;color:#475569;line-height:1.7">
                Ce qui fait vraiment la diff&eacute;rence, ce n&rsquo;est pas d&rsquo;investir
                &laquo;&nbsp;beaucoup&nbsp;&raquo;. C&rsquo;est surtout de <strong style="color:#0f172a">commencer t&ocirc;t</strong>.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#2563eb">
                    <a href="${SITE_URL}/simulateur"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;line-height:1">
                      Simuler mon portefeuille &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
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

function buildText(source: string): string {
  return `La plupart des gens sous-estiment ce que 200 € par mois peuvent vraiment devenir sur le long terme.

Avec 7 %/an · 20 ans :
→ 102 000 €

Dont plus de 50 000 € générés par la croissance, pas par vos versements.

C'est l'effet des intérêts composés : plus le temps passe, plus votre capital travaille pour vous.

Ce qui fait vraiment la différence, ce n'est pas d'investir "beaucoup".
C'est surtout de commencer tôt.

Simuler mon portefeuille : ${SITE_URL}/simulateur

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

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Vous investissez 200 € par mois. Voici où vous en êtes dans 20 ans.",
      html: buildHtml(source),
      text: buildText(source),
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
