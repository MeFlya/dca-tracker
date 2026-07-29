"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SimulatorOutput } from "@/lib/simulator";
import { generateSimulationPDF } from "@/lib/pdf-export";
import { buildUpgradeUrl } from "@/lib/upgrade-link";

type ExportState = "idle" | "generating" | "error";

export function ExportPDFButton({ output }: { output: SimulatorOutput }) {
  const [state, setState] = useState<ExportState>("idle");
  const { user } = useUser();
  const router = useRouter();

  const plan = (user?.publicMetadata?.plan as string) ?? "free";
  const isPremium = plan === "premium";

  async function handleClick() {
    if (state === "generating") return;
    // Le plan gratuit reçoit un PDF FILIGRANÉ, pas une redirection.
    // /tarifs annonce « Export PDF · Gratuit : Filigrané » : rediriger vers
    // /upgrade sans rien générer rendait cette ligne fausse (art. L.121-2).
    // Le filigrane existait déjà dans pdf-export.ts (paramètre withWatermark),
    // il n'était simplement jamais activé. Accessoirement, un PDF filigrané qui
    // circule est un support d'acquisition, là où une redirection ne produit rien.
    setState("generating");
    try {
      await generateSimulationPDF(output, !isPremium);
      setState("idle");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "generating"}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed
        border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50"
      title={isPremium ? "Exporter en PDF sans filigrane" : "Débloquer l'export PDF propre — Premium"}
    >
      {state === "generating" ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
          Génération…
        </>
      ) : state === "error" ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0v-4a.75.75 0 00-1.5 0v4zm0 2.25a.75.75 0 001.5 0 .75.75 0 00-1.5 0z" clipRule="evenodd" />
          </svg>
          Erreur
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          PDF
          {!isPremium && (
            <span className="bg-primary-100 text-primary-700 text-[9px] font-bold px-1 py-0.5 rounded uppercase tracking-wide">
              Premium
            </span>
          )}
        </>
      )}
    </button>
  );
}
