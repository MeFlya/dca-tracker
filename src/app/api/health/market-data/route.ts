import { NextResponse } from "next/server";

// GET /api/health/market-data — FERMÉE le 14/10/2026 (410 Gone).
//
// Ce contrôle interrogeait Yahoo Finance (cours de CW8) à chaque appel, pour
// un éventuel service de surveillance externe. Le site cesse d'utiliser les
// cours Yahoo (conditions : ni usage commercial, ni collecte automatique,
// décision du 14/10/2026) : il n'y a plus de fournisseur de cours à surveiller
// hors des fiches ETF, qui changent le 23/10/2026. Si un service de
// surveillance (UptimeRobot ou autre) appelait cette adresse, il faut le
// désactiver : il recevra désormais 410.

function gone() {
  return NextResponse.json(
    {
      status: "gone",
      message: "Contrôle retiré le 14 octobre 2026.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export const dynamic = "force-dynamic";
export const GET = gone;
export const HEAD = gone;
