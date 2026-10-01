// Email qui livre le modèle de suivi PEA gratuit (01/10/2026).
//
// Ce qui part, et rien d'autre : un lien de téléchargement du fichier Excel
// (jeton signé, 30 jours), le lien de copie Google Sheets quand il existe, le
// guide qui explique les formules, et UNE ligne sur le Cockpit complet — prix
// lu dans products.ts, jamais écrit ici.

import { createDownloadToken } from "@/lib/download-token";
import { getProduct } from "@/lib/products";
import {
  MODELE_GRATUIT_FICHIER,
  MODELE_GRATUIT_SHEETS_COPIE,
  MODELE_GRATUIT_TTL_JOURS,
} from "@/lib/ressources-gratuites";

const SITE_URL = "https://dcatracker.fr";
const GUIDE_URL = `${SITE_URL}/suivi-pea-excel`;

export const SUJET_MODELE_GRATUIT = "Votre modèle de suivi PEA (Excel et Google Sheets)";

function euros(n: number): string {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })} €`;
}

export function contenuModeleGratuit(email: string, source: string) {
  const lienFichier = `${SITE_URL}/api/products/download?token=${encodeURIComponent(
    createDownloadToken(MODELE_GRATUIT_FICHIER, email, MODELE_GRATUIT_TTL_JOURS),
  )}`;
  const cockpit = getProduct("template-suivi-dca");
  if (!cockpit) throw new Error("Produit template-suivi-dca introuvable (products.ts)");
  const prix = euros(cockpit.priceEur);
  const cockpitUrl = `${SITE_URL}/produits/${cockpit.slug}`;
  const sheets = MODELE_GRATUIT_SHEETS_COPIE;

  const bouton = (href: string, texte: string, principal: boolean) => `
              <table cellpadding="0" cellspacing="0" style="margin:0 0 12px 0">
                <tr>
                  <td style="border-radius:10px;background:${principal ? "#1d4ed8" : "#ffffff"};border:1px solid #1d4ed8">
                    <a href="${href}" style="display:inline-block;padding:13px 24px;color:${principal ? "#ffffff" : "#1d4ed8"};font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;line-height:1">${texte}</a>
                  </td>
                </tr>
              </table>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${SUJET_MODELE_GRATUIT}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f8fafc">
    Journal des achats et vue par ETF&nbsp;: PRU frais inclus, valeur, plus-value, poids.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
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
            <td style="padding:36px 32px 8px">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.06em">Modèle gratuit</p>
              <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;color:#0f172a;line-height:1.25">Votre modèle de suivi PEA</h1>
              <p style="margin:0 0 20px 0;font-size:15px;color:#475569;line-height:1.7">
                Voici le fichier demandé&nbsp;: un <strong>journal de vos achats</strong> et une
                <strong>vue par ETF</strong> qui calcule votre prix de revient frais inclus (PRU),
                la valeur, la plus-value et le poids de chaque ligne. Le premier onglet,
                «&nbsp;Mode d&rsquo;emploi&nbsp;», se lit en trois minutes.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px">
              ${bouton(lienFichier, "Télécharger le fichier Excel", true)}
              ${sheets ? bouton(sheets, "Copier la version Google Sheets", false) : ""}
              <p style="margin:4px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.6">
                Lien de téléchargement valable ${MODELE_GRATUIT_TTL_JOURS}&nbsp;jours.${
                  sheets
                    ? " La version Google Sheets récupère les cours toute seule (GOOGLEFINANCE)&nbsp;; « Copier » crée votre exemplaire dans votre Drive."
                    : ""
                }
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px">
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
                Les formules, onglet par onglet, sont expliquées dans notre guide&nbsp;:
                <a href="${GUIDE_URL}" style="color:#1d4ed8;font-weight:600">suivre votre PEA dans Excel ou Google Sheets</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe">
                <tr>
                  <td style="padding:16px 20px">
                    <p style="margin:0;font-size:13px;color:#1e3a8a;line-height:1.6">
                      Ce modèle ne calcule pas le rendement annualisé (TRI), le versement du mois ni le
                      plafond et la date des 5&nbsp;ans du PEA. Ce sont les onglets du
                      <a href="${cockpitUrl}" style="color:#1d4ed8;font-weight:600">Cockpit DCA</a>
                      (${prix}, paiement unique).
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#fef9c3;border-top:1px solid #fde68a">
              <p style="margin:0;font-size:12px;color:#854d0e;line-height:1.6">
                <strong>À lire&nbsp;:</strong> un outil de suivi, pas un conseil en investissement
                personnalisé. Investir comporte un risque de perte en capital.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6">
                Vous recevez cet email car vous avez demandé ce modèle sur
                <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:underline">dcatracker.fr</a>
                (source&nbsp;: ${source}). Une question&nbsp;? Répondez simplement à cet email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Votre modèle de suivi PEA

Voici le fichier demandé : un journal de vos achats et une vue par ETF qui calcule votre prix de revient frais inclus (PRU), la valeur, la plus-value et le poids de chaque ligne. Le premier onglet, « Mode d'emploi », se lit en trois minutes.

→ Télécharger le fichier Excel (lien valable ${MODELE_GRATUIT_TTL_JOURS} jours) : ${lienFichier}
${sheets ? `→ Copier la version Google Sheets (cours automatiques) : ${sheets}\n` : ""}
Les formules, onglet par onglet : ${GUIDE_URL}

Ce modèle ne calcule pas le rendement annualisé (TRI), le versement du mois ni le plafond et la date des 5 ans du PEA. Ce sont les onglets du Cockpit DCA (${prix}, paiement unique) : ${cockpitUrl}

À lire : un outil de suivi, pas un conseil en investissement personnalisé. Investir comporte un risque de perte en capital.

---
Vous recevez cet email car vous avez demandé ce modèle sur dcatracker.fr (source : ${source}).`;

  return { subject: SUJET_MODELE_GRATUIT, html, text };
}
