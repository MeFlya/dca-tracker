"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SimulatorForm } from "@/components/simulator/SimulatorForm";
import type { SimulatorMode } from "@/components/simulator/SimulatorForm";
import { SimulatorHero } from "@/components/simulator/SimulatorHero";
import { SimulatorResults } from "@/components/simulator/SimulatorResults";
import { ScenarioComparison } from "@/components/simulator/ScenarioComparison";
import { TableauAnnuel } from "@/components/simulator/TableauAnnuel";

// Monte Carlo en import dynamique (ssr: false) — il embarque recharts et ne
// sert qu'après hydratation. Avec PortfolioChart/GainsDonutChart (dans
// SimulatorResults), ça sort recharts du JS initial de /simulateur (AUDIT P1).
// Placeholder à hauteur fixe ≈ rendu final (header + légende + chart) → pas
// de CLS au swap, et le bloc est sous la fold de toute façon.
const MonteCarloChart = dynamic(
  () =>
    import("@/components/simulator/MonteCarloChart").then(
      (m) => m.MonteCarloChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="card h-[520px]" aria-busy="true" aria-label="Chargement de l'analyse Monte Carlo">
        <div className="h-4 w-56 rounded bg-gray-100 mb-2" />
        <div className="h-3 w-72 rounded bg-gray-50 mb-5" />
        <div className="h-[400px] rounded-xl bg-gray-50" />
      </div>
    ),
  },
);
import { SaveSimulationButton } from "@/components/simulator/SaveSimulationButton";
import { SaveStrategyButton } from "@/components/simulator/SaveStrategyButton";
import { ConversionBlocks } from "@/components/simulator/ConversionBlocks";
import { SavedSimulationsList } from "@/components/simulator/SavedSimulationsList";
import { ShareButton } from "@/components/simulator/ShareButton";
import { ExportPDFButton } from "@/components/simulator/ExportPDFButton";
import { runSimulation, SimulatorInput, SimulatorOutput } from "@/lib/simulator";
import type { MonteCarloResponse } from "@/components/simulator/MonteCarloChart";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { InvestCTA } from "@/components/ui/InvestCTA";
import {
  hasSimulationParams,
  paramsFromSearch,
  paramsToSearch,
  parsePortfolioFromSearch,
  portfolioToSearchFragment,
} from "@/lib/simulation-params";
import { ETF_LIST } from "@/lib/etf-config";
import type { PortfolioItem } from "@/lib/portfolio";
import { track } from "@/lib/analytics";
import { usePremium } from "@/lib/use-premium";

/** Les champs que lit /api/simulator/monte-carlo : même valeur, même réponse. */
function memeEntreeMonteCarlo(a: SimulatorInput, b: SimulatorInput): boolean {
  return (
    a.monthlyAmount === b.monthlyAmount &&
    a.durationYears === b.durationYears &&
    a.annualReturnPct === b.annualReturnPct &&
    a.annualFeesPct === b.annualFeesPct &&
    (a.startingCapital ?? 0) === (b.startingCapital ?? 0)
  );
}

interface Props {
  /**
   * Résultat des réglages par défaut, calculé au build (page statique) : le
   * premier affichage contient de vrais chiffres, y compris pour les robots.
   * Remplacé au montage si l'URL porte des paramètres.
   */
  initialOutput: SimulatorOutput;
}

export function SimulatorPageClient({ initialOutput }: Props) {
  const { user } = useUser();

  // Décidé par le serveur (/api/abonnement, via lib/use-premium.ts), demandé
  // depuis le navigateur : la page est statique depuis le 30/10/2026. Ne
  // JAMAIS revenir à une lecture de useUser().publicMetadata pour ça : c'est
  // falsifiable depuis la console.
  const isPremium = usePremium();

  // `plan` ne sert plus qu'à l'affichage (libellés, boutons). L'autorisation,
  // elle, vient de `isPremium`, décidé côté serveur.
  const plan = isPremium ? "premium" : ((user?.publicMetadata?.plan as string) ?? "free");

  const initialInput = initialOutput.input;

  // ── Paramètres de l'URL, appliqués au montage (30/10/2026) ───────────────
  // La page est la même pour toutes les URL (prérendue au build) : les
  // réglages d'un lien partagé (?monthly=…&years=…&return=…&fees=…,
  // ?inflationOn=1, ?etfs=CW8:80,AEEM:20) sont lus ici, après l'hydratation,
  // puis le formulaire est remonté avec eux. Avant, le serveur les lisait
  // pendant le rendu (et le mode portefeuille était lu dans window PENDANT le
  // rendu, ce qui faisait différer le HTML serveur du premier rendu client).
  const [initialInflationEnabled, setInitialInflationEnabled] = useState(
    initialOutput.input.annualInflationPct !== undefined,
  );
  const [initialMode, setInitialMode] = useState<SimulatorMode>("rapid");
  const [initialPortfolio, setInitialPortfolio] = useState<PortfolioItem[] | undefined>(undefined);

  const [output, setOutput] = useState<SimulatorOutput>(initialOutput);
  // Mode réellement affiché par le formulaire (remonté par onModeChange,
  // après montage) : « rapid » au rendu serveur, comme le formulaire.
  const [mode, setMode] = useState<SimulatorMode>("rapid");

  // Mark the onboarding "step 2: run first simulation" as complete as soon
  // as the user lands on the simulator page. Read by <OnboardingChecklist>
  // on the dashboard. Wrapped in try/catch for private-mode Safari.
  useEffect(() => {
    try {
      localStorage.setItem("dca_has_simulated", "1");
    } catch {
      // Storage disabled — onboarding step will stay "current", no crash
    }
  }, []);

  const [saveRefreshKey, setSaveRefreshKey] = useState(0);

  // Monte Carlo DÉBOUNCÉ (AUDIT P3) : runMonteCarlo simule 1 000 trajectoires
  // — le recalculer à chaque tick de slider bloquait le main thread pendant
  // le drag (INP). La simulation principale (runSimulation, ~480 itérations)
  // reste instantanée pour le feedback temps réel ; seul le Monte Carlo
  // attend 250 ms après le dernier mouvement.
  //
  // null au départ (30/10/2026) : le premier calcul attend le premier
  // onChange du formulaire, qui arrive au montage, et après les paramètres de
  // l'URL s'il y en a. Un seul appel au chargement, avec les bons réglages ;
  // avant, la page en faisait deux (l'état initial, puis le même après 250 ms).
  const [mcInput, setMcInputBrut] = useState<SimulatorInput | null>(null);
  const setMcInput = useCallback((input: SimulatorInput) => {
    setMcInputBrut((prev) => (prev && memeEntreeMonteCarlo(prev, input) ? prev : input));
  }, []);
  const mcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Le Monte Carlo ne tourne plus dans le navigateur : lib/monte-carlo.ts est
  // désormais `server-only`, et le calcul passe par /api/simulator/monte-carlo,
  // qui lit le plan côté serveur. Un visiteur non payant ne reçoit qu'une seule
  // valeur — voir le commentaire de la route.
  const [mc, setMc] = useState<MonteCarloResponse | null>(null);
  useEffect(() => {
    if (!mcInput) return;
    let cancelled = false;
    fetch("/api/simulator/monte-carlo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mcInput),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MonteCarloResponse | null) => {
        if (!cancelled) setMc(d);
      })
      .catch(() => {
        if (!cancelled) setMc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [mcInput]);
  useEffect(() => {
    return () => {
      if (mcTimer.current) clearTimeout(mcTimer.current);
    };
  }, []);

  const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolled = useRef(false);
  const hasTrackedStart = useRef(false);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds the current ?etfs= URL fragment, or "" if portfolio mode is off.
  // Refs (vs state) avoids re-renders on URL serialization.
  const portfolioFragmentRef = useRef<string>("");

  const handleChange = useCallback(
    (input: SimulatorInput, inflationEnabled: boolean) => {
      setOutput(runSimulation(input));

      // Monte Carlo : recalcul seulement 250 ms après le dernier tick (INP).
      if (mcTimer.current) clearTimeout(mcTimer.current);
      mcTimer.current = setTimeout(() => setMcInput(input), 250);

      // Fire start_simulation once per session on first interaction
      if (!hasTrackedStart.current) {
        hasTrackedStart.current = true;
        track({ name: "start_simulation" });
      }

      // Fire complete_simulation debounced so we don't flood when dragging sliders
      if (completeTimer.current) clearTimeout(completeTimer.current);
      completeTimer.current = setTimeout(() => {
        track({
          name: "complete_simulation",
          props: {
            monthly: input.monthlyAmount,
            years: input.durationYears,
            return_pct: input.annualReturnPct,
            fees_pct: input.annualFeesPct,
          },
        });
      }, 1500);

      if (!hasScrolled.current && window.innerWidth < 1024) {
        hasScrolled.current = true;
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }

      // history.replaceState, pas router.replace (30/10/2026) : router.replace
      // redemandait la page au serveur à chaque réglage (un rendu complet
      // quand la page était dynamique). Next synchronise useSearchParams et
      // usePathname avec l'historique natif ; rien d'autre ne change.
      if (urlUpdateTimer.current) clearTimeout(urlUpdateTimer.current);
      urlUpdateTimer.current = setTimeout(() => {
        const qs = paramsToSearch({ input, inflationEnabled });
        if (portfolioFragmentRef.current) {
          qs.set("etfs", portfolioFragmentRef.current);
        }
        window.history.replaceState(null, "", `/simulateur?${qs.toString()}`);
      }, 300);
    },
    [setMcInput]
  );

  // Fired by SimulatorForm when in portfolio mode — keeps URL ?etfs= in sync.
  const handlePortfolioChange = useCallback(
    (items: PortfolioItem[] | null) => {
      portfolioFragmentRef.current = items
        ? portfolioToSearchFragment(
            items.map((i) => ({
              displaySymbol: i.etf.displaySymbol,
              weight: i.weight,
            }))
          )
        : "";
      // The form will fire its own onChange right after, which triggers
      // the URL update. No need to push immediately here.
    },
    []
  );

  const [formKey, setFormKey] = useState(0);
  const [loadedInput, setLoadedInput] = useState<SimulatorInput | null>(null);

  // Lu une fois, au montage : voir « Paramètres de l'URL » plus haut. Cet
  // effet passe après celui du formulaire (les effets enfants d'abord), donc
  // avant que ses minuteurs (URL à 300 ms, Monte Carlo à 250 ms) ne partent :
  // la query string lue est bien celle d'arrivée, et le formulaire remonté
  // les relance avec les valeurs de l'URL.
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const avecReglages = hasSimulationParams(search) || search.get("inflationOn") === "1";
    const items = (parsePortfolioFromSearch(search) ?? [])
      .map(({ displaySymbol, weight }) => {
        const etf = ETF_LIST.find((e) => e.displaySymbol === displaySymbol);
        return etf ? { etf, weight } : null;
      })
      .filter((x): x is PortfolioItem => x !== null);
    if (!avecReglages && items.length === 0) return;
    if (avecReglages) {
      const p = paramsFromSearch(search);
      setLoadedInput(p.input);
      setInitialInflationEnabled(p.inflationEnabled);
    }
    if (items.length > 0) {
      setInitialMode("portfolio");
      setInitialPortfolio(items);
    }
    setFormKey((k) => k + 1);
  }, []);

  function handleLoadSaved(input: SimulatorInput) {
    setLoadedInput(input);
    setFormKey((k) => k + 1);
    setOutput(runSimulation(input));
    // Action ponctuelle (pas un drag) → Monte Carlo immédiat, sans debounce.
    if (mcTimer.current) clearTimeout(mcTimer.current);
    setMcInput(input);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
      {/* Sticky form column */}
      <div className="lg:sticky lg:top-24">
        <SimulatorForm
          key={formKey}
          onChange={handleChange}
          onPortfolioChange={handlePortfolioChange}
          defaultValues={loadedInput ?? initialInput}
          defaultInflationEnabled={initialInflationEnabled}
          defaultMode={initialMode}
          defaultPortfolio={initialPortfolio}
          onModeChange={setMode}
        />
      </div>

      {/* Results column */}
      <div id="results" className="space-y-5">
        {/* Hero — big impactful result + MC distribution */}
        <SimulatorHero output={output} mode={mode} />

        {/* Conversion blocks — emotional tension on result view */}
        <ConversionBlocks output={output} />

        {/* Save strategy CTA */}
        <div className="flex items-center justify-between gap-3 px-1">
          <SaveStrategyButton input={output.input} plan={plan} />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <SaveSimulationButton
            input={output.input}
            plan={plan}
            onSaved={() => setSaveRefreshKey((k) => k + 1)}
          />
          <div className="flex items-center gap-2">
            <ExportPDFButton output={output} />
            <ShareButton />
          </div>
        </div>

        {/* Saved simulations list */}
        <SavedSimulationsList
          onLoad={handleLoadSaved}
          refreshKey={saveRefreshKey}
        />

        {/* Detailed results */}
        <SimulatorResults output={output} />

        {/* Le détail année par année — gratuit, comme chez tous les concurrents
            placés devant sur « simulateur dca ». */}
        <TableauAnnuel output={output} />

        {/* Monte Carlo full chart */}
        <MonteCarloChart data={mc} isPremium={isPremium} input={output.input} />

        {/* A vs B — Premium */}
        <ScenarioComparison isPremium={isPremium} input={output.input} />

        {/* Teaser backtest (AUDIT F2) — la feature la plus différenciante du
            site était invisible depuis le funnel simulateur. Ton transparence :
            la projection est théorique, le backtest montre le réel. */}
        <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 mb-1">
              Cette projection suppose un marché régulier. La réalité, elle, a
              connu le COVID et 2022.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Le backtest rejoue votre DCA sur les vraies données MSCI World
              depuis 2008 — krach compris — avec TRI et pire perte traversée.
            </p>
          </div>
          <Link
            href="/backtest"
            onClick={() => track({ name: "backtest_teaser_click" })}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 underline-offset-4 hover:underline transition-colors"
          >
            Tester sur les vraies données →
          </Link>
        </div>

        <EmailCapture variant="card" source="simulator" />
        <InvestCTA />

        {/* Maillage vers les pages money (audit 07/2026) — le simulateur est
            la page la plus forte du site, ses liens comptent double. */}
        <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200/70 px-4 py-3 text-sm text-gray-600 leading-relaxed">
          Quel ETF mettre derrière ces chiffres ?{" "}
          <Link href="/comparatif-etf/cw8-vs-wpea" className="text-primary-700 font-medium hover:underline">
            CW8 vs WPEA : le verdict pour votre PEA
          </Link>{" "}
          ·{" "}
          <Link href="/etf-msci-world" className="text-primary-700 font-medium hover:underline">
            Le guide du MSCI World
          </Link>{" "}
          ·{" "}
          <Link href="/meilleurs-etf-debutants" className="text-primary-700 font-medium hover:underline">
            Meilleur ETF pour débuter
          </Link>
        </div>
      </div>
    </div>
  );
}
