import { NextRequest, NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/email-provider";
import { CHAMP_POT_DE_MIEL, lireRessource, lireSource } from "@/lib/ressources-gratuites";

// Simple RFC-5322-ish check — full validation happens server-side at the provider.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── LIMITE DE DÉBIT (01/10/2026) ────────────────────────────────────────────
//
// Cette route envoie un email depuis hello@dcatracker.fr à l'adresse qu'on lui
// donne, sans compte ni captcha. Sans limite, un script pouvait la faire écrire
// à des milliers de tiers : quota Resend consommé, réputation du domaine
// d'envoi abîmée, et des gens qui reçoivent un message qu'ils n'ont pas
// demandé (constat #27).
//
// Deux compteurs, même technique que rateLimited() du Monte Carlo (fenêtre
// fixe en mémoire de module, pas de dépendance) :
//   · par IP — 5 demandes / 10 min : un visiteur qui se trompe d'adresse a de
//     la marge, un script qui boucle s'arrête vite ;
//   · par adresse — 3 envois / 24 h : c'est lui qui protège le destinataire,
//     quelle que soit l'IP de celui qui tape son adresse.
//
// LIMITE HONNÊTE : la mémoire est celle d'UNE instance Vercel. Plusieurs
// instances en parallèle ont chacune leurs compteurs, et un démarrage à froid
// les remet à zéro. C'est un ralentisseur, pas un mur : il arrête la boucle
// naïve, pas un attaquant qui répartit ses appels. Le mur, ce serait un
// compteur partagé (Vercel KV, Upstash) ou un double opt-in — pas fait ici.

type Compteur = { n: number; until: number };

const PAR_IP = { max: 5, fenetreMs: 10 * 60_000 };
const PAR_ADRESSE = { max: 3, fenetreMs: 24 * 60 * 60_000 };

const HITS_IP = new Map<string, Compteur>();
const HITS_ADRESSE = new Map<string, Compteur>();

/** Compte un appel ; renvoie le nombre de secondes à attendre si la limite est dépassée, sinon 0. */
function depasse(
  table: Map<string, Compteur>,
  cle: string,
  { max, fenetreMs }: { max: number; fenetreMs: number },
): number {
  const now = Date.now();
  const e = table.get(cle);
  if (!e || e.until < now) {
    table.set(cle, { n: 1, until: now + fenetreMs });
    if (table.size > 5000) table.clear(); // borne mémoire, pas de LRU nécessaire
    return 0;
  }
  e.n++;
  return e.n > max ? Math.max(1, Math.ceil((e.until - now) / 1000)) : 0;
}

function ipDe(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "inconnu"
  );
}

function tropDeDemandes(message: string, attente: number) {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(attente) } },
  );
}

export async function POST(req: NextRequest) {
  const attenteIp = depasse(HITS_IP, ipDe(req), PAR_IP);
  if (attenteIp) {
    return tropDeDemandes(
      "Trop de demandes depuis votre connexion. Réessayez dans une dizaine de minutes.",
      attenteIp,
    );
  }

  let body: {
    email?: unknown;
    source?: unknown;
    ressource?: unknown;
    newsletter?: unknown;
    [CHAMP_POT_DE_MIEL]?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Pot de miel rempli : un robot. On répond comme si tout était parti, sans
  // rien envoyer ni inscrire. (Un remplissage automatique du navigateur
  // tomberait aussi ici ; le champ porte autocomplete="off" pour l'éviter.)
  const piege = body[CHAMP_POT_DE_MIEL];
  if (typeof piege === "string" && piege.trim() !== "") {
    console.log("[subscribe] pot de miel rempli — rien envoyé.");
    return NextResponse.json({ success: true });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  // 01/10/2026 : identifiant [a-z0-9-]{1,40} (tiret bas changé en tiret) ou
  // « website » — voir lireSource.
  const source = lireSource(body.source);
  // Booléen STRICT : seule une case cochée (true) inscrit à la liste. "true",
  // 1, "on" ou un champ absent valent refus — le consentement ne se devine pas.
  const newsletter = body.newsletter === true;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Adresse e-mail invalide." },
      { status: 400 }
    );
  }

  const attenteAdresse = depasse(HITS_ADRESSE, email, PAR_ADRESSE);
  if (attenteAdresse) {
    return tropDeDemandes(
      "Plusieurs envois sont déjà partis vers cette adresse aujourd'hui. Regardez dans les spams ou l'onglet « Promotions », sinon réessayez demain.",
      attenteAdresse,
    );
  }

  const result = await subscribeEmail({
    email,
    source,
    ressource: lireRessource(body.ressource),
    newsletter,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Une erreur est survenue. Réessayez dans un instant." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
