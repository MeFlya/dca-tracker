"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { track } from "@/lib/analytics";
import { AuroraSweep } from "@/components/ui/AuroraSweep";

type Feature = { label: string; included: boolean };

type Plan = {
  id: "free" | "premium";
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyTotal: number;
  yearlyPerMonth: number;
  features: Feature[];
  cta: string;
  ctaHref: string;
  badge?: string;
};

// Pitch repensée — plutôt que de mener avec Monte Carlo (one-shot,
// rationnel), on met en avant les 2 vrais moats du Premium :
// 1. Le SUIVI MENSUEL (récurrent → justifie l'abonnement vs achat ponctuel)
// 2. Le RÉCAP FISCAL annuel (valeur immédiate concrète pour 100 % des
//    investisseurs FR, surtout en mai pour la déclaration)
// Monte Carlo + A/B passent en argumentaire #2.
const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Tout pour démarrer votre DCA",
    monthlyPrice: 0,
    yearlyTotal: 0,
    yearlyPerMonth: 0,
    cta: "Essayer le simulateur",
    ctaHref: "/simulateur",
    features: [
      { label: "Simulateur DCA (3 scénarios, 30 ans)", included: true },
      { label: "Comparaison ETF (tous les ETF)", included: true },
      { label: "Calculateur fiscal PEA vs CTO", included: true },
      { label: "Guides et glossaire", included: true },
      { label: "Lien de partage de simulation", included: true },
      { label: "Export PDF (avec filigrane)", included: true },
      { label: "Suivi mensuel de stratégie", included: false },
      { label: "Récap fiscal annuel (cases 2042 et 2074 calculées)", included: false },
      { label: "Analyse Monte Carlo (1 000 scénarios)", included: false },
      { label: "Backtest historique (données réelles)", included: false },
      { label: "Comparaison A vs B", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Suivez et optimisez votre DCA chaque mois",
    monthlyPrice: 4.9,
    yearlyTotal: 49,
    yearlyPerMonth: 4.08,
    badge: "Le plus populaire",
    cta: "Choisir Premium",
    ctaHref: "#",
    features: [
      // Le moat récurrent en 1er
      { label: "Suivi mensuel de stratégie + emails personnalisés", included: true },
      // Le moat fiscal en 2e (gros levier mai/juin)
      { label: "Récap fiscal annuel (cases 2042 et 2074 calculées)", included: true },
      // Décisions stratégiques (Monte Carlo + A/B)
      { label: "Analyse Monte Carlo (1 000 scénarios de marché)", included: true },
      { label: "Backtest historique (DCA sur données réelles 2009+)", included: true },
      { label: "Comparaison A vs B (deux stratégies)", included: true },
      // Sauvegarde + outputs propres
      { label: "Simulations sauvegardées (10 slots)", included: true },
      { label: "Export PDF professionnel (sans filigrane)", included: true },
      { label: "Tout du plan Gratuit", included: true },
      { label: "Support par email", included: true },
    ],
  },
];

// ─── Checkout button ──────────────────────────────────────────────────────────

function CheckoutButton({
  billing,
  label,
}: {
  billing: "monthly" | "yearly";
  label: string;
}) {
  const { isSignedIn, isLoaded, user } = useUser();
  const isAlreadyPremium =
    (user?.publicMetadata?.plan as string | undefined) === "premium";
  const [loading, setLoading] = useState(false);

  // Déjà Premium → aucun CTA d'essai (l'user a déjà tout). On propose la
  // gestion d'abonnement à la place. Évite l'absurdité "Essayer Premium —
  // 7 jours gratuits" affichée à quelqu'un qui est déjà abonné.
  if (isLoaded && isAlreadyPremium) {
    return (
      <div className="relative mb-6">
        <Link
          href="/account"
          className="w-full text-center text-sm font-semibold py-2.5 px-4 rounded-xl transition-all block bg-white/10 border border-white/15 text-white hover:bg-white/15"
        >
          Gérer mon abonnement
        </Link>
        <p className="text-[11px] text-emerald-300 text-center mt-2 flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.25" />
            <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Vous êtes déjà Premium
        </p>
      </div>
    );
  }

  async function handleClick() {
    if (!isSignedIn) {
      // ⚠️ Le choix mensuel/annuel ET l'intention d'achat voyagent dans le
      // redirect_url. Sans ça, le visiteur qui avait basculé sur « Mensuel »
      // revenait sur une page repassée à l'annuel — et devait re-cliquer le
      // bouton qu'il venait déjà de cliquer. Deux étapes ajoutées à un tunnel
      // qui n'a converti personne, et un plan présélectionné qui n'est pas
      // celui qu'il avait choisi.
      const retour = `/tarifs?billing=${billing}&checkout=premium#premium`;
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent(retour)}`;
      return;
    }
    // with_cb: true → flux actuel = Stripe Checkout standard (CB collectée à
    // l'entrée). Le futur A/B test introduira un flux with_cb=false pour mesurer
    // l'impact sur conversion trial → paid.
    track({ name: "start_trial", props: { billing, with_cb: true } });
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "premium", billing }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Erreur lors de la création du paiement.");
      }
    } catch {
      alert("Erreur réseau — réessayez dans quelques secondes.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Reprise du checkout au retour de l'inscription ───────────────────────
  //
  // Ne se déclenche que sur `?checkout=premium`, une seule fois, et seulement
  // pour un utilisateur connecté qui n'est pas déjà abonné. Le paramètre est
  // consommé AVANT l'appel : un rafraîchissement ou un retour arrière ne doit
  // pas relancer un second checkout.
  //
  // Aucun débit n'est possible à cet instant — la session Stripe ouvre sur
  // sept jours d'essai — mais la garde du « une seule fois » vaut quand même :
  // deux sessions ouvertes pour un même visiteur, c'est deux factures
  // possibles et une trace illisible.
  const repriseFaite = useRef(false);
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isAlreadyPremium || repriseFaite.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "premium") return;
    repriseFaite.current = true;
    params.delete("checkout");
    const reste = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${reste ? `?${reste}` : ""}${window.location.hash}`,
    );
    void handleClick();
    // handleClick est stable pour ce qui nous intéresse ici : il ne dépend que
    // de `billing`, qui est déjà figé par le paramètre d'URL lu au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, isAlreadyPremium]);

  return (
    <div className="relative mb-6">
      <button
        onClick={handleClick}
        disabled={!isLoaded || loading}
        className="w-full text-center text-sm font-semibold py-2.5 px-4 rounded-xl transition-all block bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
      >
        {loading ? "Chargement…" : isSignedIn ? `${label} — 7 jours gratuits` : "Créer un compte"}
      </button>
      <p className="text-[11px] text-slate-400 text-center mt-2">
        Essai gratuit 7 jours · annulable à tout moment
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingCards() {
  // L'annuel reste le défaut — c'est l'offre mise en avant. Mais si l'URL
  // porte `billing=monthly`, c'est que le visiteur l'a choisi avant d'aller
  // s'inscrire, et le lui reprendre au retour serait lui vendre autre chose
  // que ce qu'il a demandé.
  //
  // La lecture se fait dans un effet, pas à l'initialisation : `window`
  // n'existe pas au rendu serveur, et lire l'URL pendant l'hydratation
  // produirait un écart entre le HTML servi et le premier rendu client.
  const [yearly, setYearly] = useState(true);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("billing") === "monthly") {
      setYearly(false);
    }
  }, []);

  return (
    <section className="mb-20">
      {/* Billing toggle — adapted to dark parent section */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`text-sm font-medium ${!yearly ? "text-white" : "text-slate-400"}`}>
          Mensuel
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          aria-label="Basculer entre tarif mensuel et annuel"
          onClick={() => setYearly((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors ${yearly ? "bg-primary-500" : "bg-slate-700"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${yearly ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? "text-white" : "text-slate-400"}`}>
          Annuel
          <span className="bg-emerald-400/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">−17 %</span>
        </span>
      </div>

      {/* Cards — 2-column layout.
          Both cards share the same dark family (Free = slate-900, Premium = slate-950)
          so they read as siblings. Premium differentiates via:
          - Depth (slate-950 vs slate-900)
          - Radial primary glow behind
          - Animated gradient border
          - "Le plus populaire" badge above card
          - Primary-filled CTA (vs ghost on Free)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearlyPerMonth : plan.monthlyPrice;
          const isHighlight = plan.id === "premium";
          const billing: "monthly" | "yearly" = yearly ? "yearly" : "monthly";

          return (
            // Outer wrapper — NOT overflow-hidden, so the top badge
            // can stick out above the card without being clipped.
            // pt-4 reserves space above so the badge doesn't collide
            // with whatever sits above the grid.
            <div key={plan.id} id={plan.id} className="relative pt-4">
              {/* Halo + animated border for Premium only */}
              {isHighlight && (
                <>
                  <div
                    className="absolute -inset-3 mt-4 rounded-3xl bg-gradient-to-br from-primary-400/40 via-indigo-500/30 to-sky-400/30 blur-2xl animate-breathe pointer-events-none"
                    aria-hidden
                  />
                  <div
                    className="absolute -inset-[2px] top-4 rounded-2xl bg-gradient-to-r from-primary-400 via-indigo-500 via-sky-400 to-primary-500 animate-gradient pointer-events-none"
                    aria-hidden
                  />
                </>
              )}

              {/* Badge — absolutely positioned on the outer wrapper
                  (NOT inside the overflow-hidden inner) so it isn't clipped. */}
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ring-2 ring-slate-950">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Inner card — overflow-hidden clips only the dot-grid
                  texture, never the badge. Both cards share slate family. */}
              <div
                className={`relative flex flex-col rounded-2xl p-6 h-full overflow-hidden ${
                  isHighlight
                    ? "bg-slate-950 border border-primary-500/30"
                    : "bg-slate-900 border border-slate-800"
                }`}
              >
                {/* Dot grid texture — same on both cards for sibling consistency */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                  aria-hidden
                />
                {/* Premium gets an extra inner radial glow for warmth */}
                {isHighlight && (
                  <div
                    className="absolute -top-20 -right-20 w-64 h-64 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%)",
                    }}
                    aria-hidden
                  />
                )}
                {/* Reflet "neuf" très subtil — la carte est déjà animée, on
                    reste léger pour ne pas surcharger. */}
                {isHighlight && <AuroraSweep className="via-white/12" />}

                {/* Header */}
                <div className="relative mb-6">
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${
                    isHighlight ? "text-primary-300" : "text-slate-400"
                  }`}>
                    {plan.tagline}
                  </p>
                  {/* Plan name: H2 to keep the H1→H2→H3 outline valid. */}
                  <h2 className="text-xl font-bold mb-4 text-white">
                    {plan.name}
                  </h2>

                  <div className="flex items-end gap-1.5">
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-4xl font-bold text-white">
                        Gratuit
                      </span>
                    ) : (
                      <>
                        <span
                          key={`${plan.id}-${yearly ? "y" : "m"}`}
                          className="text-4xl font-bold tabular-nums animate-fade-in text-white"
                        >
                          {price.toFixed(2).replace(".", ",")} €
                        </span>
                        <span className="text-sm mb-1 text-slate-400">
                          /mois
                        </span>
                      </>
                    )}
                  </div>
                  {plan.monthlyPrice > 0 && yearly && (
                    <p className="text-xs mt-1 text-slate-400">
                      Facturé {plan.yearlyTotal} € / an
                      <span className="ml-2 font-semibold text-emerald-400">
                        (économisez {Math.round(plan.monthlyPrice * 12 - plan.yearlyTotal)} €)
                      </span>
                    </p>
                  )}
                  {plan.monthlyPrice > 0 && !yearly && (
                    <p className="text-xs mt-1 text-slate-400">
                      Ou {plan.yearlyPerMonth.toFixed(2).replace(".", ",")} €/mois facturé annuellement
                    </p>
                  )}
                </div>

                {/* CTA — Free = ghost, Premium = primary filled */}
                {plan.id === "free" ? (
                  <Link
                    href={plan.ctaHref}
                    className="relative w-full text-center text-sm font-semibold py-2.5 px-4 rounded-xl transition-all mb-6 block bg-white/10 border border-white/15 text-white hover:bg-white/15"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <CheckoutButton billing={billing} label={plan.cta} />
                )}

                {/* Feature list — same typography on both cards */}
                <ul className="relative space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
                          <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      <span className={`leading-snug ${f.included ? "text-slate-100" : "text-slate-500"}`}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        7 jours d&apos;essai gratuit · TVA incluse · Annulation en 1 clic
      </p>
    </section>
  );
}
