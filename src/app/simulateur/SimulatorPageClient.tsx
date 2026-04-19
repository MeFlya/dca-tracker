"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SimulatorForm } from "@/components/simulator/SimulatorForm";
import { SimulatorHero } from "@/components/simulator/SimulatorHero";
import { SimulatorResults } from "@/components/simulator/SimulatorResults";
import { MonteCarloChart } from "@/components/simulator/MonteCarloChart";
import { ScenarioComparison } from "@/components/simulator/ScenarioComparison";
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
  paramsFromSearch,
  paramsToSearch,
  hasSimulationParams,
} from "@/lib/simulation-params";

const FALLBACK_INPUT: SimulatorInput = {
  monthlyAmount: 200,
  durationYears: 20,
  annualReturnPct: 7,
  annualFeesPct: 0.3,
  annualInflationPct: undefined,
};

export function SimulatorPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const plan = (user?.publicMetadata?.plan as string) ?? "free";
  const isPremium = plan === "premium";

  const [initialParams] = useState(() => {
    if (hasSimulationParams(searchParams)) return paramsFromSearch(searchParams);
    return null;
  });

  const initialInput = initialParams?.input ?? FALLBACK_INPUT;
  const initialInflationEnabled = initialParams?.inflationEnabled ?? false;

  const [output, setOutput] = useState<SimulatorOutput>(() =>
    runSimulation({
      ...initialInput,
      annualInflationPct: initialInflationEnabled
        ? initialInput.annualInflationPct
        : undefined,
    })
  );

  const [saveRefreshKey, setSaveRefreshKey] = useState(0);
  const monteCarloResult = useMemo(() => runMonteCarlo(output.input), [output.input]);

  const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolled = useRef(false);

  const handleChange = useCallback(
    (input: SimulatorInput, inflationEnabled: boolean) => {
      setOutput(runSimulation(input));

      if (!hasScrolled.current && window.innerWidth < 1024) {
        hasScrolled.current = true;
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }

      if (urlUpdateTimer.current) clearTimeout(urlUpdateTimer.current);
      urlUpdateTimer.current = setTimeout(() => {
        const qs = paramsToSearch({ input, inflationEnabled }).toString();
        router.replace(`/simulateur?${qs}`, { scroll: false });
      }, 300);
    },
    [router]
  );

  const [formKey, setFormKey] = useState(0);
  const [loadedInput, setLoadedInput] = useState<SimulatorInput | null>(null);

  function handleLoadSaved(input: SimulatorInput) {
    setLoadedInput(input);
    setFormKey((k) => k + 1);
    setOutput(runSimulation(input));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
      {/* Sticky form column */}
      <div className="lg:sticky lg:top-24">
        <SimulatorForm
          key={formKey}
          onChange={handleChange}
          defaultValues={loadedInput ?? initialInput}
          defaultInflationEnabled={initialInflationEnabled}
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
