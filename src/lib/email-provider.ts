import { sendEmail } from "./emails/dispatch";
// Newsletter subscription handler.
// Delivers the "5 ETF Premium pour PEA" cheat sheet via Resend.
// The `source` field is preserved in the footer for attribution tracking.

import { resend } from "./resend-client";

const SITE_URL = "https://dcatracker.fr";
const GUIDE_URL = `${SITE_URL}/guide-5-etf-pea-premium`;

export interface EmailSubscription {
  email: string;
  source: string;
}

export interface EmailProviderResult {
  success: boolean;
  error?: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────

interface ETFShortRow {
  rank: number;
  symbol: string;
  index: string;
  ter: string;
  role: string;
}

const ETFS: ETFShortRow[] = [
  { rank: 1, symbol: "CW8",  index: "MSCI World",          ter: "0,38 %", role: "Cœur de portefeuille" },
  { rank: 2, symbol: "500",  index: "S&P 500",             ter: "0,15 %", role: "Surpondération US"    },
  { rank: 3, symbol: "PCEU", index: "STOXX Europe 600",    ter: "0,07 %", role: "Diversification Europe" },
  { rank: 4, symbol: "ANX",  index: "Nasdaq 100",          ter: "0,23 %", role: "Boost croissance"     },
  { rank: 5, symbol: "AEEM", index: "Marchés émergents",   ter: "0,20 %", role: "Satellite émergents"  },
];

function buildHtml(source: string): string {
  const rowsHtml = ETFS.map(
    (e) => `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;width:36px;vertical-align:top">
            <span style="display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;background:#2563eb;color:#fff;border-radius:50%;font-size:12px;font-weight:700;line-height:24px;text-align:center">${e.rank}</span>
          </td>
          <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top">
            <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#0f172a;font-family:'SFMono-Regular',Menlo,Consolas,monospace">${e.symbol}</p>
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.5">${e.index}</p>
            <p style="margin:4px 0 0 0;font-size:12px;color:#94a3b8">${e.role} · TER ${e.ter}</p>
          </td>
        </tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Votre cheat sheet 5 ETF Premium pour PEA</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">

  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f8fafc">
    Votre s&eacute;lection de 5 ETF &eacute;ligibles PEA pour 2026.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">

          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
              <a href="${SITE_URL}" style="text-decoration:none">
                <span style="font-size:16px;font-weight:700;color:#1d4ed8">DCA</span><span style="font-size:16px;color:#6b7280">Tracker</span>
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px 16px">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em">
                Cheat sheet 2026
              </p>
              <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;color:#0f172a;line-height:1.25">
                5 ETF Premium pour PEA
              </h1>
              <p style="margin:0 0 24px 0;font-size:15px;color:#475569;line-height:1.7">
                Voici la s&eacute;lection courte que vous avez demand&eacute;e&nbsp;:
                5 ETF &eacute;ligibles PEA fr&eacute;quemment retenus par les
                investisseurs long terme. Chacun est filtr&eacute; sur 4&nbsp;crit&egrave;res&nbsp;:
                <strong>&eacute;ligibilit&eacute; PEA</strong>, <strong>TER bas</strong>,
                <strong>encours &eacute;lev&eacute;s</strong>, <strong>capitalisant</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
                ${rowsHtml}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 16px">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe">
                <tr>
                  <td style="padding:18px 22px">
                    <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#1e40af">
                      Comment les combiner&nbsp;?
                    </p>
                    <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6">
                      Le guide complet pr&eacute;sente <strong>3 mod&egrave;les d&rsquo;allocation</strong>
                      pr&ecirc;ts &agrave; l&rsquo;emploi (Simple, &Eacute;quilibr&eacute;, Croissance) et les
                      points d&rsquo;attention sp&eacute;cifiques &agrave; chaque ETF.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 32px" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#2563eb">
                    <a href="${GUIDE_URL}"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;line-height:1">
                      Lire le guide complet &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0;font-size:12px;color:#94a3b8">
                D&eacute;tails, ISIN, points d&rsquo;attention et 3 allocations types.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 24px;background:#fef9c3;border-top:1px solid #fde68a">
              <p style="margin:0;font-size:12px;color:#854d0e;line-height:1.6">
                <strong>&Agrave; lire&nbsp;:</strong> cette s&eacute;lection est p&eacute;dagogique,
                pas un conseil en investissement personnalis&eacute;. Investir comporte
                un risque de perte en capital.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
              <p style="margin:0;font-size:11px;color:#cbd5e1;line-height:1.6">
                Vous recevez cet email car vous vous &ecirc;tes inscrit sur
                <a href="${SITE_URL}" style="color:#cbd5e1;text-decoration:underline">${SITE_URL}</a>
                (source&nbsp;: ${source}).
                DCA Tracker est un outil p&eacute;dagogique &mdash; pas de conseil
                en investissement.
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
  const rows = ETFS.map(
    (e) => `${e.rank}. ${e.symbol} — ${e.index} (TER ${e.ter}) — ${e.role}`
  ).join("\n");

  return `Votre cheat sheet : 5 ETF Premium pour PEA en 2026

Filtrés sur 4 critères : éligibilité PEA, TER bas, encours élevés, capitalisant.

${rows}

Comment les combiner ?
Le guide complet présente 3 modèles d'allocation prêts à l'emploi (Simple, Équilibré, Croissance) et les points d'attention spécifiques à chaque ETF.

→ Lire le guide complet : ${GUIDE_URL}

À lire : cette sélection est pédagogique, pas un conseil en investissement personnalisé. Investir comporte un risque de perte en capital.

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

    // Passe par sendEmail() comme tous les autres envois : c'est un email
    // d'acquisition, il doit porter un lien de désinscription et respecter une
    // désinscription antérieure. Il partait sans, jusqu'ici.
    await sendEmail({
      to: email,
      subject: "Votre cheat sheet : 5 ETF Premium pour PEA en 2026",
      html: buildHtml(source),
      text: buildText(source),
    });

    console.log("[email-provider] Email sent to:", email, "source:", source);
    return { success: true };
  } catch (err) {
    console.error("[email-provider] Unexpected error:", err);
    return { success: false, error: "Erreur lors de l'inscription." };
  }
}
