// Monte Carlo — calcul serveur, avec le plan vérifié côté serveur.
//
// ─── Pourquoi cette route existe ────────────────────────────────────────────
//
// Le calcul tournait dans le navigateur de tout le monde : les 1 000 scénarios
// étaient exécutés, le résultat complet partait dans le JS de la page, et seule
// une classe CSS `blur-sm` le masquait. Le plan était lu via useUser(), donc
// falsifiable. Autrement dit : la fonctionnalité vendue était offerte, et le
// « verrou » était un rideau.
//
// Ici, le plan vient de `getUserSubscription()` — côté serveur, non falsifiable.
// Un visiteur non payant ne reçoit JAMAIS `data[]`, `finalP50`, `finalP90` ni
// `probabilityPositive`. Il reçoit une seule valeur, `finalP10`, réellement
// calculée pour SA stratégie. Ce n'est pas une consolation : c'est le meilleur
// argument de vente disponible, parce qu'il est vrai et qu'il le concerne.

import { NextResponse } from "next/server";
import { runMonteCarlo } from "@/lib/monte-carlo";
import { getUserSubscription, isPremium } from "@/lib/subscription";
import type { SimulatorInput } from "@/lib/simulator";

export const dynamic = "force-dynamic";

/** Bornes de sécurité : cette route calcule 1 000 trajectoires, elle est publique. */
const LIMITS = {
  monthlyAmount: { min: 1, max: 100_000 },
  durationYears: { min: 1, max: 40 },
  annualReturnPct: { min: -20, max: 30 },
  annualFeesPct: { min: 0, max: 10 },
  startingCapital: { min: 0, max: 10_000_000 },
} as const;

function clamp(v: unknown, { min, max }: { min: number; max: number }, fallback: number) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
}

// ─── Cache et limitation de débit ────────────────────────────────────────────
//
// Route publique qui exécute 1 000 trajectoires par appel : sans garde-fou,
// c'est un moyen simple de faire grimper la facture Vercel. Le simulateur
// déclenche déjà un appel par mouvement de curseur (débouncé à 250 ms).
//
// Le cache n'est possible QUE parce que runMonteCarlo est désormais
// déterministe : mêmes paramètres → mêmes chiffres. En mémoire de module, donc
// perdu à chaque démarrage à froid — c'est voulu, il n'y a rien à persister et
// ça absorbe l'essentiel, qui est la rafale pendant un réglage de curseurs.

const CACHE = new Map<string, unknown>();
const CACHE_MAX = 500;

const HITS = new Map<string, { n: number; until: number }>();
const RATE = { max: 40, windowMs: 10_000 };

function rateLimited(req: Request): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "inconnu";
  const now = Date.now();
  const e = HITS.get(ip);
  if (!e || e.until < now) {
    HITS.set(ip, { n: 1, until: now + RATE.windowMs });
    if (HITS.size > 5000) HITS.clear(); // borne mémoire, pas de LRU nécessaire
    return false;
  }
  e.n++;
  return e.n > RATE.max;
}

function remember(key: string, payload: unknown) {
  if (CACHE.size >= CACHE_MAX) {
    const oldest = CACHE.keys().next().value;
    if (oldest !== undefined) CACHE.delete(oldest);
  }
  CACHE.set(key, payload);
}

export async function POST(req: Request) {
  if (rateLimited(req)) {
    return NextResponse.json(
      { error: "Trop de requêtes — réessayez dans quelques secondes." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Entrée normalisée avant tout calcul : la route est publique et exécute
  // 1 000 trajectoires — une durée de 10 000 ans la ferait tomber.
  const input: SimulatorInput = {
    monthlyAmount: clamp(body.monthlyAmount, LIMITS.monthlyAmount, 200),
    durationYears: clamp(body.durationYears, LIMITS.durationYears, 20),
    annualReturnPct: clamp(body.annualReturnPct, LIMITS.annualReturnPct, 7),
    annualFeesPct: clamp(body.annualFeesPct, LIMITS.annualFeesPct, 0.3),
    startingCapital: clamp(body.startingCapital, LIMITS.startingCapital, 0),
  };

  // Si la lecture du plan échoue (Clerk indisponible, variables absentes), on
  // dégrade en « gratuit » plutôt que de renvoyer une erreur. Deux raisons :
  //   · le sens est sûr — un incident d'authentification ne doit jamais OUVRIR
  //     une fonctionnalité payante ;
  //   · le simulateur gratuit ne doit pas tomber parce que l'auth a hoqueté.
  const premium = await getUserSubscription()
    .then((sub) => isPremium(sub.plan))
    .catch((err) => {
      console.error("[monte-carlo] lecture du plan impossible, repli en gratuit :", err);
      return false;
    });

  // La clé inclut le plan : une réponse « teaser » ne doit jamais être servie à
  // un abonné, ni l'inverse.
  const key = `${premium ? "p" : "f"}:${JSON.stringify(input)}`;
  const cached = CACHE.get(key);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const result = runMonteCarlo(input);

  if (!premium) {
    // ⚠️ Ne jamais élargir cette réponse sans mesurer ce qu'on donne. Chaque
    // champ ajouté ici est un champ qu'on cesse de vendre.
    const payload = {
      premium: false,
      teaser: {
        finalP10: result.finalP10,
        totalInvested:
          input.monthlyAmount * input.durationYears * 12 +
          (input.startingCapital ?? 0),
      },
    };
    remember(key, payload);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const payload = { premium: true, result };
  remember(key, payload);
  // `private, no-store` obligatoire : la réponse dépend du cookie de session.
  // Un cache partagé servirait la version teaser à un abonné, ou la version
  // complète à un visiteur — c'est-à-dire précisément la fuite qu'on ferme.
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
