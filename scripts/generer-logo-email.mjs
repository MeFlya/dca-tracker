// Génère le logo des emails (14/10/2026) : public/email/logo-<empreinte>.png.
//
// Pourquoi un PNG : Gmail et Outlook n'affichent pas le SVG. Le logo est donc
// rendu une fois, en PNG, depuis la géométrie EXACTE de LogoMark
// (src/components/ui/LogoMark.tsx : même viewBox 28×28, même carré rx 7
// #1d4ed8, même courbe d'épaisseur 2,5, même point de rayon 2,5). Si LogoMark
// change, ce SVG change avec lui, puis on relance le script.
//
// Les coins hors du carré arrondi restent transparents : sur un email en mode
// sombre, des coins blancs dessineraient un carré clair autour du logo. Le
// carré lui-même est opaque, donc toujours visible, en clair comme en sombre.
//
// Nom versionné : les 8 premiers caractères de l'empreinte SHA-256 du fichier,
// comme les vidéos (src/lib/video-accueil.ts). Servi « immutable »
// (next.config.ts, source /email/:path*). Après un nouveau rendu : reporter le
// nom affiché dans LOGO_EMAIL (src/lib/emails/entete.ts) et supprimer l'ancien
// fichier — un email déjà envoyé pointe vers son nom pour toujours, donc on ne
// supprime un ancien logo que s'il n'a jamais été envoyé.
//
// Usage, depuis la racine du site :  node scripts/generer-logo-email.mjs
// (sharp est déjà installé avec Next ; aucune dépendance ajoutée.)

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const TAILLE = 96; // affiché à 48 px dans les emails : 2x pour les écrans haute densité

// ⚠️ Copie exacte de LogoMark (src/components/ui/LogoMark.tsx).
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${TAILLE}" height="${TAILLE}" viewBox="0 0 28 28" fill="none">
  <rect width="28" height="28" rx="7" fill="#1d4ed8"/>
  <path d="M5 21 Q9 21 13 15 Q17 9 22 6.5" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <circle cx="22" cy="6.5" r="2.5" fill="white"/>
</svg>`;

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const png = await sharp(Buffer.from(SVG), { density: 72 * (TAILLE / 28) })
  .resize(TAILLE, TAILLE)
  .png({ compressionLevel: 9 })
  .toBuffer();

const empreinte = createHash("sha256").update(png).digest("hex").slice(0, 8);
const nom = `logo-${empreinte}.png`;
const chemin = join(racine, "public", "email", nom);
mkdirSync(dirname(chemin), { recursive: true });
writeFileSync(chemin, png);
console.log(`public/email/${nom} (${TAILLE}×${TAILLE}, ${png.length} octets)`);
