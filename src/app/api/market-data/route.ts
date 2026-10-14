import { NextResponse } from "next/server";

// GET /api/market-data — FERMÉE le 14/10/2026 (410 Gone).
//
// Cette route publique, sans authentification, renvoyait en JSON les cours des
// ETF du catalogue tirés de Yahoo Finance : n'importe qui pouvait récupérer
// par elle des données Yahoo, ce qui revenait à les redistribuer. Les
// conditions de Yahoo interdisent l'usage commercial et la collecte
// automatique ; le site cesse de les utiliser (décision du 14/10/2026).
// Aucune page du site n'appelait cette route (vérifié le 14/10/2026 : aucun
// fetch de /api/market-data dans src).
//
// 410 plutôt que 404 : la ressource a existé et ne reviendra pas. Aucun appel
// au fournisseur de cours n'est fait ici.

const CORPS = {
  error: "gone",
  message:
    "Cette API n'est plus disponible depuis le 14 octobre 2026 et ne diffuse plus de cours. " +
    "Pour le prix d'une part, consultez la valeur liquidative publiée par l'émetteur du fonds.",
} as const;

function gone() {
  return NextResponse.json(CORPS, {
    status: 410,
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}

export const GET = gone;
export const HEAD = gone;
