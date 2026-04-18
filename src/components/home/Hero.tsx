import Link from "next/link";

// Static demo numbers — 200 €/mois, 20 ans, 7 %/an net
// FV = 200 × ((1.07^(1/12))^240 - 1) / (1.07^(1/12) - 1) × (1 + r) ≈ 102 094 €
const DEMO = {
  label:     "200 € / mois · 20 ans · 7 %/an net",
  invested:  "48 000 €",
  projected: "102 000 €",
  gains:     "+ 54 000 €",
  gainPct:   "+ 113 %",
  multiplier: "× 2,13",
  investedShare: 47,   // % of final value that is capital
  gainsShare:    53,   // % that is compound interest
} as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50 border-b border-gray-100">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(to right, #1d4ed8 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ── Left column: copy + CTAs ───────────────────────────────── */}
          <div className="lg:col-span-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              Outil éducatif gratuit — pas de conseil financier
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Combien peut valoir{" "}
              <span className="text-primary-600">votre argent</span>{" "}
              dans 20 ans ?
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8 max-w-xl">
              Entrez un versement mensuel et une durée.
              DCA Tracker projette vos placements en ETF avec les intérêts
              composés — hypothèses transparentes, résultats en temps réel.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/simulateur"
                className="btn-primary text-base px-6 py-3"
              >
                Tester ma simulation
                <span aria-hidden> →</span>
              </Link>
              <Link
                href="/comparer-etf"
                className="btn-secondary text-base px-6 py-3"
              >
                Comparer les ETF
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
              {[
                "Sans inscription",
                "Formules vérifiables",
                "Hypothèses transparentes",
                "Gratuit",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckIcon />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right column: demo preview card ───────────────────────── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-card-lg p-5 select-none">

              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                    Exemple illustratif
                  </p>
                  <p className="text-sm font-semibold text-gray-700 leading-snug">
                    {DEMO.label}
                  </p>
                </div>
                <span className="shrink-0 mt-0.5 px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-[11px] font-semibold">
                  {DEMO.gainPct}
                </span>
              </div>

              {/* 3 stat boxes */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <DemoStat label="Investis" value={DEMO.invested} color="gray" />
                <DemoStat label="Projetés" value={DEMO.projected} color="blue" />
                <DemoStat label="Gains" value={DEMO.gains} color="green" />
              </div>

              {/* Capital split — bars */}
              <div className="space-y-2.5 mb-4">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Capital investi</span>
                    <span>{DEMO.investedShare} %</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-300 transition-all"
                      style={{ width: `${DEMO.investedShare}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Intérêts composés</span>
                    <span>{DEMO.gainsShare} %</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gain/50 transition-all"
                      style={{ width: `${DEMO.gainsShare}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Multiplier row */}
              <div className="flex items-center justify-between py-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">Multiplicateur du capital</span>
                <span className="text-sm font-bold text-gray-900">{DEMO.multiplier}</span>
              </div>

              {/* CTA */}
              <Link
                href="/simulateur"
                className="mt-1 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-semibold transition-colors duration-150"
              >
                Tester avec mes chiffres
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DemoStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "gray" | "blue" | "green";
}) {
  const accent =
    color === "blue"  ? "border-t-primary-400"  :
    color === "green" ? "border-t-gain/60"       :
    "border-t-gray-300";

  const valueColor =
    color === "blue"  ? "text-primary-700" :
    color === "green" ? "text-gain"        :
    "text-gray-700";

  return (
    <div className={`rounded-xl border-t-2 border border-gray-100 bg-gray-50 p-2.5 ${accent}`}>
      <p className="text-[10px] text-gray-400 mb-1 leading-none">{label}</p>
      <p className={`text-sm font-bold tabular-nums leading-tight ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-gain"
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M5 8.5l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
