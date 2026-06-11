// Téléchargement sécurisé des fichiers produits.
//
// GET /api/products/download?token=<hmac> → vérifie le token (signature +
// expiration) puis stream le fichier depuis private-assets/ (HORS de
// /public : jamais servi statiquement). Les fichiers sont inclus dans le
// bundle serverless via outputFileTracingIncludes (next.config.ts).
//
// Lien expiré → page d'erreur lisible avec contact (le support régénère).

export const dynamic = "force-dynamic";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { log } from "@/lib/logger";

// Registre des fichiers livrables. Les fichiers eux-mêmes sont déposés dans
// private-assets/ (cf. README du dossier) — fournis par Maël.
const PRODUCT_FILES: Record<
  string,
  { filename: string; contentType: string; downloadName: string }
> = {
  "guide-pdf": {
    filename: "guide-demarrer-dca.pdf",
    contentType: "application/pdf",
    downloadName: "Guide-Demarrer-le-DCA-en-France.pdf",
  },
  "template-xlsx": {
    filename: "template-suivi-dca.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    downloadName: "Template-Suivi-DCA-PEA.xlsx",
  },
};

function htmlError(title: string, body: string, status: number): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:80px auto;padding:0 16px;color:#1f2937">
<h1 style="font-size:20px">${title}</h1><p style="color:#4b5563;line-height:1.6">${body}</p>
<p><a href="https://dcatracker.fr" style="color:#1d4ed8">← Retour à DCA Tracker</a></p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return htmlError("Lien invalide", "Ce lien de téléchargement est incomplet.", 400);

  const check = verifyDownloadToken(token);
  if (!check.ok) {
    if (check.reason === "expired") {
      return htmlError(
        "Lien expiré",
        "Ce lien de téléchargement a expiré (validité 7 jours). Répondez à votre email de livraison ou écrivez à hello@dcatracker.fr avec votre email d'achat — nous vous renvoyons un lien immédiatement.",
        410,
      );
    }
    return htmlError("Lien invalide", "Ce lien de téléchargement n'est pas valide.", 403);
  }

  const file = PRODUCT_FILES[check.fileKey];
  if (!file) return htmlError("Fichier inconnu", "Ce fichier n'existe pas.", 404);

  try {
    const data = await readFile(
      path.join(process.cwd(), "private-assets", file.filename),
    );
    log.event("products/download", "file_served", {
      fileKey: check.fileKey,
      email: check.email,
    });
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.downloadName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    // Fichier pas encore déposé dans private-assets/ (pré-lancement).
    return htmlError(
      "Fichier en préparation",
      "Ce fichier n'est pas encore disponible — si vous venez d'acheter, écrivez à hello@dcatracker.fr et nous vous le livrons manuellement sans délai.",
      503,
    );
  }
}
