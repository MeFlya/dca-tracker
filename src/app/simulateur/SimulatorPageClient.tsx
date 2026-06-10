"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SimulatorForm } from "@/components/simulator/SimulatorForm";
import type { SimulatorMode } from "@/components/simulator/SimulatorForm";
import { SimulatorHero } from "@/components/simulator/SimulatorHero";
import { SimulatorResults } from "@/components/simulator/SimulatorResults";
import { ScenarioComparison } from "@/components/simulator/ScenarioComparison";

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
import { runMonteCarlo } from "@/lib/monte-carlo";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { InvestCTA } from "@/components/ui/InvestCTA";
import {
  paramsToSearch,
  parsePortfolioFromSearch,
  portfolioToSearchFragment,
} from "@/lib/simulation-params";
import { ETF_LIST } from "@/lib/etf-config";
import type { PortfolioItem } from "@/lib/portfolio";
import { track } from "@/lib/analytics";

interface Props {
  /**
   * Server-computed output. Used as the initial simulation state so the
   * first paint contains real numbers (SSR SEO + instant TTI).
   */
  initialOutput: SimulatorOutput;
}

export function SimulatorPageClient({ initialOutput }: Props) {
  const router = useRouter();
  const { user } = useUser();

  const plan = (user?.publicMetadata?.plan as string) ?? "free";
  const isPremium = plan === "premium";

  // Derive inflation-enabled from the server output itself (presence of
  // inflationAdjustedValue on any scenario = inflation was in the input).
  const initialInflationEnabled =
    initialOutput.input.annualInflationPct !== undefined;
  const initialInput = initialOutput.input;

  // Read URL param ?etfs=CW8:80,AEEM:20 to bootstrap portfolio mode.
  // Done in useState initializer (runs once at mount). Resolves slugs
  // against ETF_LIST and drops unknowns.
  const [initialMode, initialPortfolio] = useMemo<
    [SimulatorMode, PortfolioItem[] | undefined]
  >(() => {
    if (typeof window === "undefined") return ["rapid", undefined];
    const allocs = parsePortfolioFromSearch(
      new URLSearchParams(window.location.search)
    );
    if (!allocs) return ["rapid", undefined];
    const items = allocs
      .map(({ displaySymbol, weight }) => {
        const etf = ETF_LIST.find((e) => e.displaySymbol === displaySymbol);
        return etf ? { etf, weight } : null;
      })
      .filter((x): x is PortfolioItem => x !== null);
    return items.length > 0 ? ["portfolio", items] : ["rapid", undefined];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [output, setOutput] = useState<SimulatorOutput>(initialOutput);

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
  const [mcInput, setMcInput] = useState<SimulatorInput>(initialOutput.input);
  const mcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const monteCarloResult = useMemo(() => runMonteCarlo(mcInput), [mcInput]);
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

      if (urlUpdateTimer.current) clearTimeout(urlUpdateTimer.current);
      urlUpdateTimer.current = setTimeout(() => {
        const qs = paramsToSearch({ input, inflationEnabled });
        if (portfolioFragmentRef.current) {
          qs.set("etfs", portfolioFragmentRef.current);
        }
        router.replace(`/simulateur?${qs.toString()}`, { scroll: false });
      }, 300);
    },
    [router]
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
        />
      </div>

      {/* Results column */}
      <div id="results" className="space-y-5">
        {/* Hero — big impactful result + MC distribution */}
        <SimulatorHero output={output} />

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

        {/* Monte Carlo full chart */}
        <MonteCarloChart result={monteCarloResult} isPremium={isPremium} input={output.input} />

        {/* A vs B — Premium */}
        <ScenarioComparison isPremium={isPremium} input={output.input} />

        <EmailCapture variant="card" source="simulator" />
        <InvestCTA />
      </div>
    </div>
  );
}
