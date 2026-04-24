"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, AlertTriangle, Check, ArrowLeft } from "lucide-react";
import { parseBrokerCsv, type ParsedMonth, type ParseResult } from "@/lib/csv-import";
import { track } from "@/lib/analytics";

type Stage = "upload" | "map-values" | "importing" | "done";

function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function ImportFlow() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("upload");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  // Portfolio values per month (user fills after parse)
  const [portfolioValues, setPortfolioValues] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    try {
      const text = await file.text();
      const result = parseBrokerCsv(text);
      if (!result.ok) {
        setError(result.error ?? "Erreur lors de la lecture du fichier.");
        return;
      }
      if (result.months.length === 0) {
        setError(
          `Aucune transaction valide trouvée (${result.skippedRows} ligne(s) ignorée(s)). Vérifiez le format de votre fichier.`,
        );
        return;
      }
      if (result.months.length > 60) {
        setError("Fichier trop volumineux (maximum 60 mois par import).");
        return;
      }
      setParseResult(result);
      setStage("map-values");
    } catch (err) {
      console.error(err);
      setError("Impossible de lire le fichier. Format invalide ?");
    }
  }

  async function handleImport() {
    if (!parseResult) return;
    setError("");
    setStage("importing");

    const months = parseResult.months.map((m) => {
      const portfolioValue = parseFloat(portfolioValues[m.month] ?? "");
      return {
        month: m.month,
        contributions: m.contributions,
        portfolioValue: Number.isFinite(portfolioValue) && portfolioValue > 0 ? portfolioValue : 0,
      };
    });

    // Validate: every month needs a portfolio value
    const missing = months.find((m) => m.portfolioValue <= 0);
    if (missing) {
      setError(`Valeur de portefeuille manquante pour ${formatMonth(missing.month)}`);
      setStage("map-values");
      return;
    }

    try {
      const res = await fetch("/api/account/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Erreur lors de l'import.");
        setStage("map-values");
        return;
      }
      const data = (await res.json()) as { imported: number; failed: number };
      setImportResult(data);
      track({
        name: "import_csv",
        props: {
          months: data.imported,
          detected_format: parseResult.detectedFormat,
        },
      });
      setStage("done");
    } catch {
      setError("Erreur réseau. Réessayez.");
      setStage("map-values");
    }
  }

  // ─── Stage: upload ─────────────────────────────────────────────────────────
  if (stage === "upload") {
    return (
      <>
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && fileInput.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInput.current.files = dt.files;
              fileInput.current.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }}
          className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-300 bg-gray-50/50 hover:bg-primary-50/30 p-10 text-center cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
            <Upload size={20} className="text-primary-600" />
          </div>
          <p className="text-base font-semibold text-gray-900 mb-1">
            Déposez votre fichier CSV
          </p>
          <p className="text-sm text-gray-500">
            ou cliquez pour en sélectionner un
          </p>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="mt-8 rounded-xl bg-gray-50/50 border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Formats supportés
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <FileText size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <span><strong>Trade Republic</strong> — export depuis l&apos;appli (Compte → Activité → Exporter)</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <span><strong>Boursorama / Fortuneo</strong> — export des mouvements depuis votre espace client</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <span><strong>CSV générique</strong> — tout fichier avec au minimum une colonne <code className="bg-gray-100 px-1 rounded text-xs">Date</code> et une colonne <code className="bg-gray-100 px-1 rounded text-xs">Montant</code></span>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            L&apos;import regroupe automatiquement vos transactions par mois et
            ne prend en compte que les achats / versements positifs (les retraits
            et frais sont ignorés).
          </p>
        </div>
      </>
    );
  }

  // ─── Stage: map values ─────────────────────────────────────────────────────
  if (stage === "map-values" && parseResult) {
    return (
      <>
        <button
          onClick={() => {
            setParseResult(null);
            setPortfolioValues({});
            setError("");
            setStage("upload");
          }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors"
        >
          <ArrowLeft size={14} />
          Changer de fichier
        </button>

        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mb-6 flex items-start gap-3">
          <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              {parseResult.months.length} mois détectés ·{" "}
              {parseResult.months.reduce((s, m) => s + m.contributions.length, 0)} transactions
            </p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Format détecté : <strong>{parseResult.detectedFormat}</strong>
              {parseResult.skippedRows > 0 && (
                <> · {parseResult.skippedRows} ligne(s) ignorée(s) (retraits, frais ou format invalide)</>
              )}
            </p>
          </div>
        </div>

        <h2 className="text-base font-bold text-gray-900 mb-3">
          Saisissez la valeur du portefeuille pour chaque mois
        </h2>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Le montant investi a été détecté automatiquement. Saisissez la{" "}
          <strong>valeur totale du portefeuille à la fin de chaque mois</strong>{" "}
          pour que le suivi puisse comparer au théorique. Données disponibles
          dans votre application courtier.
        </p>

        <div className="space-y-2 mb-6">
          {parseResult.months.map((m) => (
            <MonthRow
              key={m.month}
              month={m}
              portfolioValue={portfolioValues[m.month] ?? ""}
              onChangePortfolio={(v) =>
                setPortfolioValues((prev) => ({ ...prev, [m.month]: v }))
              }
            />
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              setParseResult(null);
              setPortfolioValues({});
              setStage("upload");
            }}
            className="btn-secondary text-sm"
          >
            Annuler
          </button>
          <button onClick={handleImport} className="btn-primary text-sm flex-1 btn-lift">
            Importer les {parseResult.months.length} mois
          </button>
        </div>
      </>
    );
  }

  // ─── Stage: importing ──────────────────────────────────────────────────────
  if (stage === "importing") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-900 mb-1">Import en cours…</p>
        <p className="text-xs text-gray-500">Quelques secondes, ne fermez pas cette fenêtre.</p>
      </div>
    );
  }

  // ─── Stage: done ───────────────────────────────────────────────────────────
  if (stage === "done" && importResult) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-600 flex items-center justify-center">
          <Check size={20} className="text-white" strokeWidth={3} />
        </div>
        <p className="text-lg font-bold text-emerald-900 mb-1">
          Import terminé
        </p>
        <p className="text-sm text-emerald-800 mb-5">
          {importResult.imported} mois importé{importResult.imported > 1 ? "s" : ""}
          {importResult.failed > 0 && <> · {importResult.failed} échec(s)</>}
        </p>
        <button
          onClick={() => router.push("/account")}
          className="btn-primary text-sm px-5 py-2.5 btn-lift"
        >
          Voir mon dashboard →
        </button>
      </div>
    );
  }

  return null;
}

// ─── Month row ────────────────────────────────────────────────────────────────

function MonthRow({
  month,
  portfolioValue,
  onChangePortfolio,
}: {
  month: ParsedMonth;
  portfolioValue: string;
  onChangePortfolio: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <div>
          <p className="text-sm font-bold text-gray-900 capitalize">
            {formatMonth(month.month)}
          </p>
          <p className="text-xs text-gray-500">
            {month.contributions.length} contribution{month.contributions.length > 1 ? "s" : ""}
            {" · "}investi {formatEur(month.total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500" htmlFor={`pv-${month.month}`}>
            Portefeuille €
          </label>
          <input
            id={`pv-${month.month}`}
            type="number"
            min="0"
            step="1"
            value={portfolioValue}
            onChange={(e) => onChangePortfolio(e.target.value)}
            placeholder="1 450"
            required
            className="w-28 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
