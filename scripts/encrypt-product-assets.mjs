#!/usr/bin/env node
// Chiffre les fichiers produits pour pouvoir les committer dans le repo
// (qui est PUBLIC — un fichier payant en clair y serait offert à tous).
//
// Usage : npm run assets:encrypt
//   1. Déposer les fichiers originaux dans private-assets/raw/  (gitignoré)
//   2. Lancer le script → private-assets/<nom>.enc  (commitables)
//   3. La route /api/products/download déchiffre à la volée.
//
// La clé est dérivée de DOWNLOAD_TOKEN_SECRET (lu depuis .env.local ou
// l'environnement). La MÊME valeur doit être configurée sur Vercel, sinon
// la prod ne pourra pas déchiffrer.
//
// ⚠️ Le format/dérivation doivent rester identiques à
// src/lib/product-file-crypto.ts (déchiffrement runtime).
// Format .enc : magic "DCA1" (4 o) | IV (12 o) | tag GCM (16 o) | ciphertext.

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
} from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = path.join(ROOT, "private-assets", "raw");
const OUT_DIR = path.join(ROOT, "private-assets");

const MAGIC = Buffer.from("DCA1");
const HKDF_SALT = "dcatracker-product-files";
const HKDF_INFO = "aes-256-gcm-v1";

// Longueur plancher du secret. Le vrai en fait 64 ; tout ce qui est nettement
// plus court est un gabarit ou une valeur de test, pas la clé de production.
const LONGUEUR_MIN_SECRET = 32;

function loadSecret() {
  const brut = process.env.DOWNLOAD_TOKEN_SECRET ?? lireDepuisEnvLocal();
  if (brut === null) {
    console.error(
      "✖ DOWNLOAD_TOKEN_SECRET introuvable (ni dans l'env, ni dans .env.local).",
    );
    process.exit(1);
  }
  // ⚠️ Les guillemets se retirent AVANT toute validation. `SECRET=""` donne
  // sinon une « valeur » de deux caractères, non vide au sens de JavaScript,
  // qui traverse tous les contrôles et dérive une clé parfaitement cohérente
  // — mais qui n'est pas celle de la production.
  const secret = brut.trim().replace(/^(["'])(.*)\1$/s, "$2");
  if (secret.length < LONGUEUR_MIN_SECRET) {
    console.error(
      `✖ DOWNLOAD_TOKEN_SECRET fait ${secret.length} caractère(s), il en faut au moins ${LONGUEUR_MIN_SECRET}.\n` +
        "  C'est un gabarit vide, pas la clé de production. Le .enc produit serait\n" +
        "  indéchiffrable en ligne, et l'acheteur verrait « Fichier en préparation ».\n" +
        "  → Lancer depuis le dépôt principal, ou poser DOWNLOAD_TOKEN_SECRET dans l'environnement.",
    );
    process.exit(1);
  }
  return secret;
}

function lireDepuisEnvLocal() {
  const envFile = path.join(ROOT, ".env.local");
  if (!existsSync(envFile)) return null;
  const match = readFileSync(envFile, "utf8").match(
    /^DOWNLOAD_TOKEN_SECRET=(.*)$/m,
  );
  return match ? match[1] : null;
}

const key = Buffer.from(
  hkdfSync("sha256", loadSecret(), HKDF_SALT, HKDF_INFO, 32),
);

// ─── L'EMPREINTE DE CLÉ, et pourquoi elle existe ────────────────────────────
//
// Le self-check plus bas déchiffre avec la clé qui vient de chiffrer : il
// attrape une corruption, jamais une MAUVAISE clé. Une clé fausse produit un
// aller-retour parfaitement cohérent avec lui-même. C'est ce qui s'est passé le
// 4 août 2026 : le .enc a été régénéré depuis un worktree dont le .env.local
// ne contenait que `DOWNLOAD_TOKEN_SECRET=""`. Tout est passé au vert, et le
// téléchargement payant est resté cassé dix-huit jours — un acheteur aurait vu
// « Fichier en préparation » après avoir payé 19 €.
//
// L'empreinte est le seul témoin qui survit d'une machine à l'autre : un HMAC
// de la clé sur une chaîne publique, commité à côté des .enc. Elle ne révèle
// rien — remonter à la clé demanderait de casser HMAC-SHA256 — et elle suffit à
// répondre à la seule question qui compte : « est-ce la même clé que celle qui
// a chiffré les fichiers déjà en ligne ? »
const EMPREINTE_PATH = path.join(OUT_DIR, "CLE-EMPREINTE.txt");
const empreinte = createHmac("sha256", key)
  .update("dcatracker-cle-empreinte-v1")
  .digest("hex")
  .slice(0, 16);
const rotation = process.argv.includes("--rotation");

if (existsSync(EMPREINTE_PATH) && !rotation) {
  const attendue = readFileSync(EMPREINTE_PATH, "utf8")
    .split("\n")
    .find((l) => l.trim() && !l.startsWith("#"))
    ?.trim();
  if (attendue && attendue !== empreinte) {
    console.error(
      `✖ La clé dérivée ici (${empreinte}) n'est PAS celle qui a chiffré les\n` +
        `  fichiers commités (${attendue}). Rien n'a été écrit.\n\n` +
        "  Le .enc produit serait indéchiffrable en production. Cas les plus\n" +
        "  fréquents : lancé depuis un worktree au .env.local vide, ou secret\n" +
        "  d'environnement différent de celui posé sur Vercel.\n\n" +
        "  → Si le secret a VRAIMENT changé (rotation), relancer avec --rotation,\n" +
        "    puis mettre à jour DOWNLOAD_TOKEN_SECRET sur Vercel dans la foulée :\n" +
        "    entre les deux, les fichiers déjà en ligne ne se déchiffrent plus.",
    );
    process.exit(1);
  }
}

if (!existsSync(RAW_DIR)) {
  console.error(`✖ Dossier introuvable : ${RAW_DIR}`);
  process.exit(1);
}

const files = readdirSync(RAW_DIR).filter((f) => !f.startsWith("."));
if (files.length === 0) {
  console.error(`✖ Aucun fichier dans ${RAW_DIR}`);
  process.exit(1);
}

for (const name of files) {
  const plaintext = readFileSync(path.join(RAW_DIR, name));
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const encrypted = Buffer.concat([MAGIC, iv, cipher.getAuthTag(), ciphertext]);

  // Self-check : on déchiffre ce qu'on vient d'écrire et on compare.
  // Il attrape une corruption du chiffrement, PAS une mauvaise clé —
  // c'est l'empreinte ci-dessus qui s'en charge.
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(cipher.getAuthTag());
  const roundtrip = Buffer.concat([
    decipher.update(encrypted.subarray(MAGIC.length + 12 + 16)),
    decipher.final(),
  ]);
  if (!roundtrip.equals(plaintext)) {
    console.error(`✖ Échec du self-check pour ${name} — fichier NON écrit.`);
    process.exit(1);
  }

  const outName = `${name.replace(/\.[^.]+$/, "")}.enc`;
  writeFileSync(path.join(OUT_DIR, outName), encrypted);
  console.log(
    `✔ ${name} → ${outName} (${(encrypted.length / 1024).toFixed(0)} Ko)`,
  );
}
// L'empreinte s'écrit APRÈS les fichiers : si le chiffrement échoue en cours de
// route, on ne veut pas d'un témoin qui certifie une livraison qui n'a pas eu lieu.
const premiere = !existsSync(EMPREINTE_PATH);
writeFileSync(
  EMPREINTE_PATH,
  "# Empreinte de la clé ayant chiffré les .enc de ce dossier.\n" +
    "# HMAC-SHA256(clé, \"dcatracker-cle-empreinte-v1\"), 16 premiers caractères.\n" +
    "# Ne révèle pas le secret. Commitée exprès : c'est ce qui permet à une autre\n" +
    "# machine de refuser de chiffrer avec la mauvaise clé.\n" +
    `${empreinte}\n`,
);
if (premiere) console.log(`  Empreinte de clé inscrite : ${empreinte}`);
else if (rotation) console.log(`  ⚠️ ROTATION — nouvelle empreinte : ${empreinte}`);
else console.log(`  Empreinte de clé confirmée : ${empreinte}`);

console.log("Terminé. Committer les .enc ET CLE-EMPREINTE.txt ; raw/ reste gitignoré.");
