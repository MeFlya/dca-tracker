// Export user's strategy + monthly entries as a CSV file.
// GET /api/account/export — requires auth, returns text/csv download.

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStrategyData } from "@/lib/user-strategy";

export const dynamic = "force-dynamic";

function escapeCsv(value: string | number | undefined | null): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { strategy, entries } = await getStrategyData(userId);
  const exportedAt = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];

  // ── Header metadata ────────────────────────────────────────────────────────
  lines.push("DCA Tracker — Export de données");
  lines.push(`Exporté le,${exportedAt}`);

  if (strategy) {
    lines.push("");
    lines.push("Stratégie");
    lines.push(`Versement mensuel (€),${strategy.input.monthlyAmount}`);
    lines.push(`Durée (ans),${strategy.input.durationYears}`);
    lines.push(`Rendement annuel cible (%),${strategy.input.annualReturnPct}`);
    lines.push(`Frais annuels (%),${strategy.input.annualFeesPct}`);
    lines.push(`Mois de début,${strategy.startMonth}`);
    lines.push(`Sauvegardée le,${strategy.savedAt.slice(0, 10)}`);
  }

  // ── Monthly entries ────────────────────────────────────────────────────────
  if (entries.length > 0) {
    lines.push("");
    lines.push("Entrées mensuelles");
    lines.push(
      "Mois,Nb contributions,Total investi (€),Valeur portefeuille (€),Commentaire"
    );
    for (const e of entries) {
      lines.push(
        [
          e.month,
          e.contributions.length,
          e.invested,
          e.portfolioValue,
          escapeCsv(e.note),
        ].join(","),
      );
    }

    // Individual contributions sheet
    lines.push("");
    lines.push("Contributions détaillées");
    lines.push("Mois,Date,Montant (€),Libellé");
    for (const e of entries) {
      for (const c of e.contributions) {
        lines.push(
          [e.month, c.date, c.amount, escapeCsv(c.note)].join(","),
        );
      }
    }
  } else {
    lines.push("");
    lines.push("Aucune entrée enregistrée.");
  }

  const csv = lines.join("\n");
  const filename = `dca-tracker-export-${exportedAt}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
