import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStrategyData, saveStrategy } from "@/lib/user-strategy";
import type { PortfolioAllocation } from "@/lib/simulation-params";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getStrategyData(userId);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ─── Pourquoi il n'y a plus de verrou ici ─────────────────────────────────
  //
  // Sauvegarder une stratégie était réservé au Premium. Conséquence mécanique :
  // aucun compte gratuit ne créait jamais de donnée, donc aucun n'avait de
  // raison de revenir, donc aucun n'atteignait le moment où Premium devient
  // évident. L'email mensuel — la fonctionnalité la plus aboutie du site —
  // était lui aussi en aval de ce verrou : il n'avait rien à envoyer.
  //
  // La règle est désormais : on facture la PROFONDEUR, pas l'EXISTENCE.
  // Restent payants le Monte Carlo, la comparaison A/B, l'export PDF et
  // l'email mensuel automatique.
  //
  // ⚠️ Le modèle ne stocke qu'UNE stratégie (`dcaStrategy` est un objet, pas un
  // tableau, et saveStrategy l'écrase). La limite « une seule » est donc portée
  // par la structure de données elle-même, pas par un test — et il ne faut PAS
  // vendre « la deuxième stratégie » en Premium : elle n'existe pas.

  const body = (await req.json()) as {
    input?: unknown;
    startMonth?: unknown;
    allocation?: unknown;
  };
  if (!body.input) return NextResponse.json({ error: "Missing input" }, { status: 400 });

  const startMonth =
    typeof body.startMonth === "string" ? body.startMonth : undefined;
  const allocation = Array.isArray(body.allocation)
    ? (body.allocation as PortfolioAllocation[])
    : undefined;

  await saveStrategy(
    userId,
    body.input as Parameters<typeof saveStrategy>[1],
    { startMonth, allocation },
  );
  return NextResponse.json({ success: true });
}
