// Ressources gratuites envoyées par email contre une adresse (/api/subscribe).
//
// Deux à ce jour :
//   · « cheat-sheet » : le tableau des 5 ETF du guide PEA (depuis l'accueil et
//     le simulateur, composant EmailCapture) — l'envoi historique ;
//   · « modele-suivi-pea » (01/10/2026) : le modèle de suivi gratuit, tiré du
//     Cockpit v2.0 (journal + Par ETF), depuis /suivi-pea-excel.
//
// Le nom de ressource arrive du navigateur : on ne le croit pas, on le lit
// dans cette liste fermée (toute autre valeur retombe sur la cheat sheet,
// l'envoi d'avant).
//
// 01/10/2026 : la ressource part sur simple demande ; l'inscription à la liste
// d'emails (audience Resend) est une case à part, non cochée par défaut, que
// la route lit en booléen strict (`newsletter === true`). Voir email-provider.ts.

export const RESSOURCES_GRATUITES = ["cheat-sheet", "modele-suivi-pea"] as const;
export type RessourceGratuite = (typeof RESSOURCES_GRATUITES)[number];

export function lireRessource(valeur: unknown): RessourceGratuite {
  return RESSOURCES_GRATUITES.find((r) => r === valeur) ?? "cheat-sheet";
}

// ─── LE CHAMP « source », QUI N'ÉTAIT QUE TRONQUÉ (01/10/2026) ──────────────
//
// La route faisait `body.source.slice(0, 64)` puis l'email l'insérait tel quel
// dans son HTML (« source : … » en pied de message). 64 caractères suffisent à
// un `<a href=//site-piege>Accéder à votre compte</a>` : n'importe qui pouvait
// faire partir de hello@dcatracker.fr, signé par notre domaine, un lien de son
// choix vers l'adresse de son choix (constats #15 et #26).
//
// On ne garde plus qu'un identifiant [a-z0-9-]{1,40} : minuscules, chiffres,
// tiret. Toute autre valeur retombe sur « website ».
//
// Contrôle du 01/10/2026 : huit pages appellent EmailCapture avec un tiret bas
// (« guide_interets_composes », « simulation_100 », « guide_pea_cto »…). Le
// premier jet élargissait le filtre à [a-z0-9_-] pour ne pas les ramener à
// « website » ; on garde le filtre demandé et on change le tiret bas en tiret
// AVANT le test — « guide_dca » arrive en « guide-dca » dans l'email et les
// journaux serveur. L'attribution Plausible (track email_signup, côté
// navigateur) garde, elle, la valeur d'origine.
const SOURCE_RE = /^[a-z0-9-]{1,40}$/;

export function lireSource(valeur: unknown): string {
  if (typeof valeur !== "string") return "website";
  const id = valeur.replace(/_/g, "-");
  return SOURCE_RE.test(id) ? id : "website";
}

/**
 * Échappe une valeur avant de l'insérer dans un gabarit HTML d'email (texte ou
 * attribut entre guillemets). Seconde barrière, indépendante de `lireSource` :
 * si un jour une valeur arrive par un autre chemin, elle reste du texte.
 */
export function echapperHtml(valeur: string | number): string {
  return String(valeur)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Nom du champ « pot de miel » des formulaires gratuits (ModeleGratuitForm,
 * EmailCapture). Hors écran, hors tabulation, ignoré des lecteurs d'écran :
 * une personne ne le voit pas, un robot qui remplit tout le remplit. Rempli,
 * /api/subscribe répond « succès » et n'envoie rien — le robot n'apprend pas
 * qu'il a été repéré.
 */
export const CHAMP_POT_DE_MIEL = "site_web";

/** Clé du fichier dans PRODUCT_FILES (route /api/products/download). */
export const MODELE_GRATUIT_FICHIER = "modele-gratuit-xlsx";

/** Validité du lien de téléchargement du modèle gratuit. */
export const MODELE_GRATUIT_TTL_JOURS = 30;

/**
 * Lien « Faire une copie » de la version Google Sheets du modèle gratuit
 * (Drive de Maël, « Modèle de suivi PEA (gratuit) - DCA Tracker », partagé
 * « tous les utilisateurs qui ont le lien : lecteur »). Pas un secret : c'est
 * le lien que reçoit chaque personne qui demande le modèle. Créée le 01/10/2026 depuis le .xlsx livré
 * (sha1 f8e54804…), formule GOOGLEFINANCE collée en Par ETF E9:E18 — vérifiée :
 * PE500, ETZ et PAEEM renvoient les bons fonds.
 * Mettre `null` si la feuille disparaît : la page et l'email n'en parlent plus.
 */
export const MODELE_GRATUIT_SHEETS_COPIE: string | null =
  "https://docs.google.com/spreadsheets/d/1bs7EQA0_qoaffcPVmxwpqvS25ubmIJU7Nmuc-t7Nwh0/copy";
