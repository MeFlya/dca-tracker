"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { track } from "@/lib/analytics";

export function ExportDataButton() {
  const [state, setState] = useState<"idle" | "downloading" | "done" | "error">("idle");

  async function handleExport() {
    if (state === "downloading") return;
    setState("downloading");
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dca-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      track({ name: "export_data" });
      setState("done");
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={state === "downloading"}
      className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2 btn-lift"
    >
      {state === "done" ? (
        <>
          <Check size={14} className="text-emerald-600" />
          Export téléchargé
        </>
      ) : state === "error" ? (
        <>Erreur — réessayer</>
      ) : (
        <>
          <Download size={14} />
          {state === "downloading" ? "Génération…" : "Exporter mes données (CSV)"}
        </>
      )}
    </button>
  );
}
