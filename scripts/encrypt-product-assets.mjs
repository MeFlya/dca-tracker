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

function loadSecret() {
  if (process.env.DOWNLOAD_TOKEN_SECRET) return process.env.DOWNLOAD_TOKEN_SECRET;
  const envFile = path.join(ROOT, ".env.local");
  if (existsSync(envFile)) {
    const match = readFileSync(envFile, "utf8").match(
      /^DOWNLOAD_TOKEN_SECRET=(.+)$/m,
    );
    if (match) return match[1].trim();
  }
  console.error(
    "✖ DOWNLOAD_TOKEN_SECRET introuvable (ni dans l'env, ni dans .env.local).",
  );
  process.exit(1);
}

const key = Buffer.from(
  hkdfSync("sha256", loadSecret(), HKDF_SALT, HKDF_INFO, 32),
);

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
console.log("Terminé. Committer les .enc ; raw/ reste gitignoré.");
