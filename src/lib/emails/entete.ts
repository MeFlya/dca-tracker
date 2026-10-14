// En-tête commun à TOUS les emails du site (14/10/2026).
//
// Jusqu'ici l'en-tête n'était que le mot « DCATracker » en texte (« DCA » bleu,
// « Tracker » gris, sans espace), et la moitié des emails n'en avait aucun. Il
// porte maintenant le vrai logo — LogoMark, rendu en PNG par
// scripts/generer-logo-email.mjs — suivi du nom en texte, comme l'en-tête du
// site (LogoWordmark : « DCA » gras gris-900, « Tracker » normal gris-500).
//
// Contraintes des clients mail, d'où la forme :
//   · PNG et non SVG : Gmail et Outlook n'affichent pas le SVG ;
//   · URL absolue sur dcatracker.fr, fichier versionné par empreinte
//     (servi « immutable », next.config.ts) : un email déjà reçu garde son
//     logo même après un nouveau rendu ;
//   · image 96×96 affichée à 48 px (2x pour les écrans haute densité), avec
//     width/height en attributs (Outlook ignore ceux du style) ;
//   · nom en TEXTE à côté : lisible quand les images sont bloquées (Outlook
//     les bloque par défaut). D'où alt="" et un logo non cliquable : avec
//     alt="DCA Tracker", un client qui bloque les images affichait « DCA
//     Tracker » deux fois côte à côte (aperçu du 14/10/2026), et un lecteur
//     d'écran l'annonçait deux fois. Le nom en texte porte le lien ;
//   · tableau plutôt que flex : Outlook (moteur Word) ne connaît pas flex ;
//   · coins du PNG transparents, carré opaque : en mode sombre, le carré bleu
//     reste visible et aucun coin blanc n'apparaît.
// Aucun pixel espion : l'image est la même pour tous, sans paramètre.

const SITE_URL = "https://dcatracker.fr";

/** Logo des emails. Nom à reporter ici après chaque `node scripts/generer-logo-email.mjs`. */
export const LOGO_EMAIL = {
  src: `${SITE_URL}/email/logo-43a03bf1.png`,
  /** Taille d'affichage, en px CSS (le fichier fait le double). */
  taille: 48,
} as const;

const POLICE = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Logo + « DCA Tracker » (le nom porte le lien vers le site). Bloc autonome, sans marge extérieure. */
export function marqueEmail(): string {
  const t = LOGO_EMAIL.taille;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
                <tr>
                  <td style="padding:0 12px 0 0;vertical-align:middle;width:${t}px">
                    <img src="${LOGO_EMAIL.src}" width="${t}" height="${t}" alt="" border="0" style="display:block;width:${t}px;height:${t}px;border:0;outline:none;text-decoration:none">
                  </td>
                  <td style="vertical-align:middle">
                    <a href="${SITE_URL}" style="text-decoration:none;font-family:${POLICE};font-size:19px;line-height:24px;font-weight:700;color:#111827;letter-spacing:-0.01em">DCA <span style="font-weight:400;color:#6b7280">Tracker</span></a>
                  </td>
                </tr>
              </table>`;
}

/** Ligne d'en-tête des emails « carte » (tableau 560-580 px à fond blanc). */
export function ligneEnteteEmail(): string {
  return `<tr>
            <td style="padding:20px 32px;border-bottom:1px solid #f1f5f9">
              ${marqueEmail()}
            </td>
          </tr>`;
}

/** En-tête des emails au corps simple (sans carte) : placé en tête du <body>. */
export function enteteEmailSimple(): string {
  return `<div style="margin:0 0 28px 0">
    ${marqueEmail()}
  </div>`;
}
