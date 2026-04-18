"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SimulatorForm } from "@/components/simulator/SimulatorForm";
import { SimulatorResults } from "@/components/simulator/SimulatorResults";
import { ShareButton } from "@/components/simulator/ShareButton";
import { ExportPDFButton } from "@/components/simulator/ExportPDFButton";
import { runSimulation, SimulatorInput, SimulatorOutput } from "@/lib/simulator";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { InvestCTA } from "@/components/ui/InvestCTA";
import {
  paramsFromSearch,
  paramsToSearch,
  hasSimulationParams,
} from "@/lib/simulation-params";

// Fallback defaults when no URL params are present
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

  // Derive initial state from URL params on first render
  const [initialParams] = useState(() => {
    if (hasSimulationParams(searchParams)) {
      return paramsFromSearch(searchParams);
    }
    return null;
  });

  const initialInput = initialParams?.input ?? FALLBACK_INPUT;
  const initialInflationEnabled = initialParams?.inflationEnabled ?? false;

  // Derive initial simulation from URL or defaults — visible immediately
  const [output, setOutput] = useState<SimulatorOutput>(() =>
    runSimulation({
      ...initialInput,
      annualInflationPct: initialInflationEnabled
        ? initialInput.annualInflationPct
        : undefined,
    })
  );

  // Debounce URL updates to avoid flooding the router on slider drags
  const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track whether we've auto-scrolled on mobile
  const hasScrolled = useRef(false);

  const handleChange = useCallback(
    (input: SimulatorInput, inflationEnabled: boolean) => {
      setOutput(runSimulation(input));

      // Scroll to results the first time on small screens
      if (!hasScrolled.current && window.innerWidth < 1024) {
        hasScrolled.current = true;
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 120);
      }

      // Debounce URL sync — 300 ms is imperceptible to users but prevents
      // dozens of router.replace calls per second while dragging
      if (urlUpdateTimer.current) clearTimeout(urlUpdateTimer.current);
      urlUpdateTimer.current = setTimeout(() => {
        const qs = paramsToSearch({ input, inflationEnabled }).toString();
        router.replace(`/simulateur?${qs}`, { scroll: false });
      }, 300);
    },
    [router]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
      {/* Sticky form column */}
      <div className="lg:sticky lg:top-24">
        <SimulatorForm
          onChange={handleChange}
          defaultValues={initialInput}
          defaultInflationEnabled={initialInflationEnabled}
        />
      </div>

      {/* Results column */}
      <div id="results" className="space-y-4">
        {/* Action bar — sits above results, visually attached */}
        <div className="flex items-center justify-end gap-2">
          <ExportPDFButton output={output} />
          <ShareButton />
        </div>

        <SimulatorResults output={output} />

        <EmailCapture variant="card" source="simulator" />

        <InvestCTA />
      </div>
    </div>
  );
}
