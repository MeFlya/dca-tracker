// Série « suivi d'un PEA » (02/10/2026) : les deux emails qui suivent
// l'inscription aux emails occasionnels, envoyés par le cron
// /api/cron/serie-suivi-pea (règle de tri : src/lib/serie-suivi-pea.ts).
//
//   · J+3 — quatre vérifications d'un tableau de suivi (PRU frais inclus, TRI
//     annualisé, plafond compté en versements, date des 5 ans), renvoi vers
//     /suivi-pea-excel et le modèle gratuit ;
//   · J+7 — le TRI d'un mois sur l'autre et le versement du mois
//     (rééquilibrage par les versements), puis UNE mention du Cockpit DCA,
//     prix lu dans products.ts.
//
// ⚠️ On ne sait pas ce que la personne a demandé (cheat sheet ou modèle
// gratuit) : la liste Resend ne garde que l'adresse et la date. Les deux
// textes valent pour les deux, et J+3 dit où demander le modèle à qui ne l'a
// pas.
// ⚠️ Chaque règle est celle de /suivi-pea-excel (mêmes mots quand c'est
// possible) : si la page change une règle, ces emails changent avec elle.
// Aucun chiffre écrit à la main : le plafond vient de PLAFOND_PEA
// (cockpit-exemple.ts, source service-public.fr sur la page), le prix de
// products.ts. Pas de date, pas de valeur qui dépende de l'heure : le contenu
// doit être identique d'un passage à l'autre, sinon la clé d'idempotence
// Resend refuse le second envoi (409) au lieu de le dédoublonner.
// ⚠️ Aucun conseil : le versement du mois est un calcul sur l'allocation que
// la personne fixe elle-même (le site n'a pas le statut de CIF). L'objet aussi
// se lit seul : rien qui ressemble à « où investir ».
// ⚠️ J+7 peut partir sans J+3 (passage manqué, échec, déploiement après la
// fenêtre J+3 des premiers inscrits) : il ne se présente pas comme « le
// second » email et se lit seul (relecture du 02/10/2026).
// Le lien de désinscription est ajouté par sendEmail (dispatch.ts), en HTML
// comme en texte.

import { PLAFOND_PEA } from "@/lib/cockpit-exemple";
import { getProduct } from "@/lib/products";
import { echapperHtml } from "@/lib/ressources-gratuites";
import type { EtapeSerie } from "@/lib/serie-suivi-pea";

const SITE_URL = "https://dcatracker.fr";
const GUIDE_URL = `${SITE_URL}/suivi-pea-excel`;
const h = echapperHtml;

// 02/10/2026 : espace insécable (U+00A0) avant « € », pour que « 150 000 » et
// « € » ne soient jamais coupés en fin de ligne (toLocaleString ne protège que
// le séparateur de milliers, U+202F). Contenu identique d'un envoi à l'autre :
// la clé d'idempotence n'est pas touchée.
function euros(n: number): string {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}\u00a0€`;
}

export interface MessageSerie {
  subject: string;
  html: string;
  text: string;
}

// ─── Briques HTML (même gabarit que modele-gratuit.ts) ──────────────────────

const P = "margin:0 0 16px 0;font-size:15px;color:#475569;line-height:1.7";
const H2 = "margin:8px 0 8px 0;font-size:16px;font-weight:700;color:#0f172a;line-height:1.4";
const LIEN = "color:#1d4ed8;font-weight:600";

function bouton(href: string, texte: string): string {
  return `
              <table cellpadding="0" cellspacing="0" style="margin:4px 0 12px 0">
                <tr>
                  <td style="border-radius:10px;background:#1d4ed8;border:1px solid #1d4ed8">
                    <a href="${h(href)}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;line-height:1">${h(texte)}</a>
                  </td>
                </tr>
              </table>`;
}

function encadre(contenu: string): string {
  return `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;margin:8px 0 8px 0">
                <tr>
                  <td style="padding:16px 20px">
                    <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6">${contenu}</p>
                  </td>
                </tr>
              </table>`;
}

function page(o: { titre: string; apercu: string; surtitre: string; h1: string; corps: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${h(o.titre)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f8fafc">
    ${h(o.apercu)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
              <a href="${h(SITE_URL)}" style="text-decoration:none">
                <span style="font-size:16px;font-weight:700;color:#1d4ed8">DCA</span><span style="font-size:16px;color:#6b7280">Tracker</span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 20px">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.06em">${h(o.surtitre)}</p>
              <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;color:#0f172a;line-height:1.25">${h(o.h1)}</h1>
              ${o.corps}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#fef9c3;border-top:1px solid #fde68a">
              <p style="margin:0;font-size:12px;color:#854d0e;line-height:1.6">
                <strong>À lire&nbsp;:</strong> une méthode de suivi, pas un conseil en investissement
                personnalisé. Investir comporte un risque de perte en capital.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6">
                Vous recevez cet email car vous avez accepté, sur
                <a href="${h(SITE_URL)}" style="color:#94a3b8;text-decoration:underline">dcatracker.fr</a>,
                de recevoir les emails occasionnels de DCA Tracker sur le suivi d&rsquo;un PEA.
                Une question&nbsp;? Répondez simplement à cet email.
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

const PIED_TEXTE = `À lire : une méthode de suivi, pas un conseil en investissement personnalisé. Investir comporte un risque de perte en capital.

---
Vous recevez cet email car vous avez accepté, sur dcatracker.fr, de recevoir les emails occasionnels de DCA Tracker sur le suivi d'un PEA. Une question ? Répondez simplement à cet email.`;

// ─── J+3 : quatre vérifications ──────────────────────────────────────────────

function emailJ3(): MessageSerie {
  const subject = "Votre suivi de PEA : quatre points à vérifier";
  const plafond = euros(PLAFOND_PEA);
  const modeleUrl = `${GUIDE_URL}#modele-gratuit`;

  const points: { titre: string; html: string; texte: string }[] = [
    {
      titre: "1. Le PRU compte les frais de courtage",
      // 02/10/2026 : condition « rien vendu » reprise de la FAQ du guide
      // (pru-plusieurs-achats) ; après une vente partielle, ce calcul
      // surestime le PRU.
      html: `Le prix de revient unitaire (PRU) d&rsquo;un ETF, c&rsquo;est tout ce que vous avez payé pour lui,
                frais compris, divisé par le nombre de parts détenues, tant que vous n&rsquo;avez rien vendu (le
                cas courant d&rsquo;un DCA sur un PEA). Les frais se saisissent sur la ligne de chaque achat, dans
                le journal&nbsp;: tenus à part, ils disparaissent du PRU et du rendement.`,
      texte:
        "Le prix de revient unitaire (PRU) d'un ETF, c'est tout ce que vous avez payé pour lui, frais compris, divisé par le nombre de parts détenues, tant que vous n'avez rien vendu (le cas courant d'un DCA sur un PEA). Les frais se saisissent sur la ligne de chaque achat, dans le journal : tenus à part, ils disparaissent du PRU et du rendement.",
    },
    {
      titre: "2. Le rendement est annualisé (TRI)",
      html: `Une plus-value en pourcentage ne dit rien du temps&nbsp;: quand on verse chaque mois, une partie
                de l&rsquo;argent n&rsquo;est investie que depuis quelques semaines. Le taux de rendement interne
                (TRI) tient compte de la date de chaque versement. Dans le tableur, TRI.PAIEMENTS (XIRR en
                anglais) prend les achats en négatif et la valeur du jour en positif, à la date du jour. La plage
                doit commencer au premier achat&nbsp;: des lignes vides en tête comptent comme des flux nuls et
                faussent le résultat.`,
      texte:
        "Une plus-value en pourcentage ne dit rien du temps : quand on verse chaque mois, une partie de l'argent n'est investie que depuis quelques semaines. Le taux de rendement interne (TRI) tient compte de la date de chaque versement. Dans le tableur, TRI.PAIEMENTS (XIRR en anglais) prend les achats en négatif et la valeur du jour en positif, à la date du jour. La plage doit commencer au premier achat : des lignes vides en tête comptent comme des flux nuls et faussent le résultat.",
    },
    {
      titre: "3. Le plafond se compte en versements",
      html: `Le plafond de ${h(plafond)} vise l&rsquo;argent que vous déposez sur le plan, pas sa
                valeur&nbsp;: les plus-values n&rsquo;en consomment rien. Votre tableau doit additionner vos
                dépôts, et non la valeur du portefeuille.`,
      texte: `Le plafond de ${plafond} vise l'argent que vous déposez sur le plan, pas sa valeur : les plus-values n'en consomment rien. Votre tableau doit additionner vos dépôts, et non la valeur du portefeuille.`,
    },
    {
      titre: "4. Les 5 ans partent du premier versement",
      html: `La date d&rsquo;ouverture du plan est celle du premier versement (<span style="white-space:nowrap">service-public.fr</span>). C&rsquo;est
                d&rsquo;elle que partent les 5&nbsp;ans, pas forcément de votre premier achat d&rsquo;ETF.
                Notez-la une fois dans le tableau, avec la date des 5&nbsp;ans qui en découle.`,
      texte:
        "La date d'ouverture du plan est celle du premier versement (service-public.fr). C'est d'elle que partent les 5 ans, pas forcément de votre premier achat d'ETF. Notez-la une fois dans le tableau, avec la date des 5 ans qui en découle.",
    },
  ];

  const corps = `
              <p style="${P}">
                Il y a quelques jours, vous avez demandé une ressource sur dcatracker.fr et accepté de recevoir
                nos emails sur le suivi d&rsquo;un PEA. Voici le premier des deux emails de cette courte série. Il vaut
                pour n&rsquo;importe quel tableau&nbsp;: notre modèle gratuit, un fichier que vous tenez déjà ou
                celui que vous allez commencer.
              </p>
              ${points
                .map(
                  (p) => `
              <p style="${H2}">${h(p.titre)}</p>
              <p style="${P}">
                ${p.html}
              </p>`,
                )
                .join("")}
              ${encadre(
                // 02/10/2026 : pour ces trois points, le guide ne donne
                // qu'une formule (TRI.PAIEMENTS) ; le plafond et les 5 ans y
                // sont une règle et un exemple chiffré (section
                // #plafond-et-5-ans). Ne pas promettre plus que la page.
                `Le modèle gratuit (journal des achats et vue par ETF) règle le premier point&nbsp;: il calcule
                    le PRU frais inclus, avec la valeur, la plus-value et le poids de chaque ligne. Pour les trois
                    autres, le guide donne la formule du TRI, pour Excel et Google Sheets, et montre sur un exemple
                    le plafond utilisé et la date des 5&nbsp;ans.`,
              )}
              <div style="height:12px"></div>
              ${bouton(GUIDE_URL, "Lire le guide")}
              <p style="margin:0 0 16px 0;font-size:13px;color:#64748b;line-height:1.6">
                Vous n&rsquo;avez pas encore le modèle&nbsp;? Il se demande sur la même page&nbsp;:
                <a href="${h(modeleUrl)}" style="${LIEN}">recevoir le modèle gratuit</a>.
              </p>
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
                Dans quelques jours, le second et dernier email de la série&nbsp;: le TRI d&rsquo;un mois sur
                l&rsquo;autre, et le calcul du versement du mois.
              </p>`;

  const html = page({
    titre: subject,
    apercu: "PRU frais inclus, TRI annualisé, plafond en versements, date des 5 ans.",
    surtitre: "Suivi d'un PEA",
    h1: "Quatre points à vérifier dans un tableau de suivi",
    corps,
  });

  const text = `Quatre points à vérifier dans un tableau de suivi

Il y a quelques jours, vous avez demandé une ressource sur dcatracker.fr et accepté de recevoir nos emails sur le suivi d'un PEA. Voici le premier des deux emails de cette courte série. Il vaut pour n'importe quel tableau : notre modèle gratuit, un fichier que vous tenez déjà ou celui que vous allez commencer.

${points.map((p) => `${p.titre}\n${p.texte}`).join("\n\n")}

Le modèle gratuit (journal des achats et vue par ETF) règle le premier point : il calcule le PRU frais inclus, avec la valeur, la plus-value et le poids de chaque ligne. Pour les trois autres, le guide donne la formule du TRI, pour Excel et Google Sheets, et montre sur un exemple le plafond utilisé et la date des 5 ans.

→ Lire le guide : ${GUIDE_URL}
→ Vous n'avez pas encore le modèle ? Il se demande sur la même page : ${modeleUrl}

Dans quelques jours, le second et dernier email de la série : le TRI d'un mois sur l'autre, et le calcul du versement du mois.

${PIED_TEXTE}`;

  return { subject, html, text };
}

// ─── J+7 : le TRI et le versement du mois ───────────────────────────────────

function emailJ7(): MessageSerie {
  // 02/10/2026 : l'objet se lit seul dans la boîte de réception, sans
  // l'avertissement du bas. « Où mettre vos prochains euros » sonnait comme
  // une recommandation ; on reprend le titre, qui dit d'où part le calcul.
  const subject = "Le versement du mois, calculé sur votre allocation";
  const cockpit = getProduct("template-suivi-dca");
  // Même garde que modele-gratuit.ts : pas de prix, pas de mention. Mieux
  // vaut une erreur au premier envoi (journalisée par le cron) qu'un prix
  // écrit à la main.
  if (!cockpit) throw new Error("Produit template-suivi-dca introuvable (products.ts)");
  const prix = euros(cockpit.priceEur);
  const cockpitUrl = `${SITE_URL}/produits/${cockpit.slug}`;
  const exempleUrl = `${GUIDE_URL}#versement-du-mois`;

  const etapes: { html: string; texte: string }[] = [
    {
      html: `<strong>la cible après versement</strong>&nbsp;: (valeur du portefeuille + versement) × poids cible&nbsp;;`,
      texte: "la cible après versement : (valeur du portefeuille + versement) × poids cible ;",
    },
    {
      html: `<strong>le manque</strong>&nbsp;: cette cible moins la valeur actuelle de la ligne (zéro si la ligne est déjà au-dessus)&nbsp;;`,
      texte: "le manque : cette cible moins la valeur actuelle de la ligne (zéro si la ligne est déjà au-dessus) ;",
    },
    {
      html: `<strong>la part du versement</strong>&nbsp;: le versement réparti au prorata des manques (s&rsquo;il les couvre tous, le surplus suit vos poids cibles)&nbsp;;`,
      texte: "la part du versement : le versement réparti au prorata des manques (s'il les couvre tous, le surplus suit vos poids cibles) ;",
    },
    {
      html: `<strong>le nombre de parts</strong>&nbsp;: cette part divisée par le cours, arrondie à l&rsquo;entier inférieur.`,
      texte: "le nombre de parts : cette part divisée par le cours, arrondie à l'entier inférieur.",
    },
  ];

  const corps = `
              <p style="${P}">
                Il y a une semaine, vous avez accepté de recevoir nos emails sur le suivi d&rsquo;un PEA.
                Celui-ci porte sur les deux calculs qui reviennent chaque mois dans un tableau de suivi&nbsp;: le
                rendement annualisé (TRI), et la répartition du versement.
              </p>
              <p style="${H2}">Le TRI, d&rsquo;un mois sur l&rsquo;autre</p>
              <p style="${P}">
                Le plus simple&nbsp;: mettre le tableau à jour à la même date chaque mois, après votre achat. Le TRI
                ne se compare d&rsquo;un mois sur l&rsquo;autre que s&rsquo;il est calculé de la même façon&nbsp;:
                tous les achats en négatif, la valeur du portefeuille en positif, à la date du jour. Les premiers
                mois, il varie fortement&nbsp;: annualiser un rendement obtenu sur quelques semaines amplifie les
                mouvements du marché.
              </p>
              <p style="${H2}">Le versement du mois&nbsp;: rééquilibrer sans vendre</p>
              <p style="${P}">
                Plutôt que de vendre ce qui a monté, on dirige chaque versement vers les ETF passés sous la cible
                que vous vous êtes fixée. Pour chaque ETF&nbsp;:
              </p>
              <ol style="margin:0 0 16px 0;padding-left:22px;font-size:15px;color:#475569;line-height:1.7">
                ${etapes.map((e) => `<li style="margin:0 0 6px 0">${e.html}</li>`).join("\n                ")}
              </ol>
              <p style="${P}">
                Ce qui reste attend en liquidités sur le PEA et s&rsquo;ajoute au versement du mois suivant. Sans
                rien vendre, la répartition revient vers votre cible. Le calcul part de l&rsquo;allocation que vous
                avez fixée&nbsp;: il ne dit ni quels ETF choisir, ni dans quelles proportions.
              </p>
              ${bouton(exempleUrl, "Voir le calcul sur un exemple")}
              ${encadre(
                `Le <a href="${h(cockpitUrl)}" style="${LIEN}">Cockpit DCA</a> calcule le TRI, le versement
                    du mois, le plafond et la date des 5&nbsp;ans (${h(prix)}, paiement unique, Excel et Google
                    Sheets). La méthode reste sur la page du guide,
                    pour qui préfère l&rsquo;ajouter à son propre fichier.`,
              )}
              <p style="margin:16px 0 0 0;font-size:14px;color:#475569;line-height:1.7">
                C&rsquo;était le dernier email de cette série. Les suivants seront occasionnels, et chacun porte
                un lien pour vous désinscrire.
              </p>`;

  const html = page({
    titre: subject,
    apercu: "Le TRI d'un mois sur l'autre, et le versement réparti sur l'allocation que vous avez fixée.",
    surtitre: "Suivi d'un PEA",
    h1: "Le versement du mois, calculé sur votre allocation",
    corps,
  });

  const text = `Le versement du mois, calculé sur votre allocation

Il y a une semaine, vous avez accepté de recevoir nos emails sur le suivi d'un PEA. Celui-ci porte sur les deux calculs qui reviennent chaque mois dans un tableau de suivi : le rendement annualisé (TRI), et la répartition du versement.

Le TRI, d'un mois sur l'autre
Le plus simple : mettre le tableau à jour à la même date chaque mois, après votre achat. Le TRI ne se compare d'un mois sur l'autre que s'il est calculé de la même façon : tous les achats en négatif, la valeur du portefeuille en positif, à la date du jour. Les premiers mois, il varie fortement : annualiser un rendement obtenu sur quelques semaines amplifie les mouvements du marché.

Le versement du mois : rééquilibrer sans vendre
Plutôt que de vendre ce qui a monté, on dirige chaque versement vers les ETF passés sous la cible que vous vous êtes fixée. Pour chaque ETF :
${etapes.map((e, i) => `${i + 1}. ${e.texte}`).join("\n")}

Ce qui reste attend en liquidités sur le PEA et s'ajoute au versement du mois suivant. Sans rien vendre, la répartition revient vers votre cible. Le calcul part de l'allocation que vous avez fixée : il ne dit ni quels ETF choisir, ni dans quelles proportions.

→ Voir le calcul sur un exemple : ${exempleUrl}

Le Cockpit DCA calcule le TRI, le versement du mois, le plafond et la date des 5 ans (${prix}, paiement unique, Excel et Google Sheets) : ${cockpitUrl}
La méthode reste sur la page du guide, pour qui préfère l'ajouter à son propre fichier.

C'était le dernier email de cette série. Les suivants seront occasionnels, et chacun porte un lien pour vous désinscrire.

${PIED_TEXTE}`;

  return { subject, html, text };
}

/** Contenu d'une étape. Sans paramètre personnel : le même pour tous, à l'octet près. */
export function contenuSerieSuiviPea(etape: EtapeSerie): MessageSerie {
  return etape === "j3" ? emailJ3() : emailJ7();
}
