import { NextRequest, NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/email-provider";

// Simple RFC-5322-ish check — full validation happens server-side at the provider.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: unknown; source?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source =
    typeof body.source === "string" ? body.source.slice(0, 64) : "website";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Adresse e-mail invalide." },
      { status: 400 }
    );
  }

  const result = await subscribeEmail({ email, source });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Une erreur est survenue. Réessayez dans un instant." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
