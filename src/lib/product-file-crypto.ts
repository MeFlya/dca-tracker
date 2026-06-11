// Chiffrement au repos des fichiers produits payants.
//
// POURQUOI : le repo GitHub est PUBLIC. Committer les fichiers payants en
// clair dans private-assets/ reviendrait à les offrir (et l'historique git
// est scrapé en continu — passer le repo en privé après coup ne suffirait
// pas). On committe donc des .enc (AES-256-GCM) ; la clé n'existe que dans
// l'env (DOWNLOAD_TOKEN_SECRET, déjà requis pour signer les liens) et la
// route de téléchargement déchiffre à la volée.
//
// Format binaire .enc : magic "DCA1" (4 o) | IV (12 o) | tag GCM (16 o) | ciphertext.
// ⚠️ Toute modif ici doit être répliquée dans scripts/encrypt-product-assets.mjs
// (script standalone Node, ne peut pas importer ce module TS).
//
// Server-only : ne jamais importer côté client.

import { createDecipheriv, hkdfSync } from "node:crypto";

const MAGIC = Buffer.from("DCA1");
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const HKDF_SALT = "dcatracker-product-files";
const HKDF_INFO = "aes-256-gcm-v1";

function getFileKey(): Buffer {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) throw new Error("DOWNLOAD_TOKEN_SECRET manquant (env)");
  return Buffer.from(hkdfSync("sha256", secret, HKDF_SALT, HKDF_INFO, 32));
}

/** Déchiffre un fichier produit .enc — throw si clé absente ou fichier corrompu. */
export function decryptProductFile(encrypted: Buffer): Buffer {
  if (
    encrypted.length < MAGIC.length + IV_LENGTH + TAG_LENGTH ||
    !encrypted.subarray(0, MAGIC.length).equals(MAGIC)
  ) {
    throw new Error("Fichier .enc invalide (magic/longueur)");
  }
  let offset = MAGIC.length;
  const iv = encrypted.subarray(offset, (offset += IV_LENGTH));
  const tag = encrypted.subarray(offset, (offset += TAG_LENGTH));
  const ciphertext = encrypted.subarray(offset);

  const decipher = createDecipheriv("aes-256-gcm", getFileKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
