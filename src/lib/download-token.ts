// Tokens de téléchargement signés (HMAC) pour la livraison des produits.
//
// Principe : après paiement, l'acheteur reçoit des liens
// /api/products/download?token=<payload>.<signature> — le token encode le
// fichier + l'email + une expiration, signé avec DOWNLOAD_TOKEN_SECRET.
// Pas de base de données : la signature EST la preuve d'achat. Un lien
// expiré se régénère en répondant à l'email de livraison (support manuel,
// volume faible au lancement).
//
// Server-only : ne jamais importer côté client (le secret fuiterait au build).

import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_DAYS = 7;

type TokenPayload = {
  /** Clé de fichier (cf. PRODUCT_FILES dans la route download). */
  f: string;
  /** Email de l'acheteur (trace en cas d'abus). */
  e: string;
  /** Expiration (epoch secondes). */
  x: number;
};

function getSecret(): string {
  const s = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!s) throw new Error("DOWNLOAD_TOKEN_SECRET manquant (env)");
  return s;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createDownloadToken(
  fileKey: string,
  email: string,
  ttlDays = DEFAULT_TTL_DAYS,
): string {
  const payload: TokenPayload = {
    f: fileKey,
    e: email,
    x: Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export type TokenCheck =
  | { ok: true; fileKey: string; email: string }
  | { ok: false; reason: "invalid" | "expired" };

export function verifyDownloadToken(token: string): TokenCheck {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return { ok: false, reason: "invalid" };
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(data);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid" };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as TokenPayload;
    if (typeof payload.f !== "string" || typeof payload.x !== "number") {
      return { ok: false, reason: "invalid" };
    }
    if (payload.x < Math.floor(Date.now() / 1000)) {
      return { ok: false, reason: "expired" };
    }
    return { ok: true, fileKey: payload.f, email: payload.e ?? "" };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
