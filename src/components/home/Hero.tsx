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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50/60 border-b border-slate-200/60">
      {/* Ambient grid — slightly stronger than before for depth */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(to right, #1d4ed8 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      {/* Floating gradient orbs — punchier now, more on-screen, saturated. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-primary-400/40 blur-3xl animate-float-a" />
        <div className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-sky-400/30 blur-3xl animate-float-b" />
        <div className="absolute -bottom-20 left-1/4 w-[450px] h-[450px] rounded-full bg-indigo-400/25 blur-3xl animate-float-a" style={{ animationDelay: "-5s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ── Left column: copy + CTAs ───────────────────────────────── */}
          <div className="lg:col-span-7">
            {/* Badge — dot "breathes" to signal live/active */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-medium mb-6">
              <span className="relative w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 animate-breathe">
                <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-50" />
              </span>
              Le cockpit DCA pour investisseurs long-terme
            </div>

            {/* H1 — no colored span. A hyperlink-looking emphasis ("votre argent"
                in text-primary-600) was weakening the headline. The size already
                does the work; keeping the accent would compete with CTAs. */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Combien peut valoir votre argent dans 20 ans ?
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
              Simulez votre stratégie DCA, sauvegardez-la, puis suivez votre
              progression mois après mois. Hypothèses transparentes, trois
              scénarios de marché, zéro jargon.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/simulateur"
                className="btn-primary group text-base px-6 py-3"
              >
                Voir ce que vaut mon argent
                <span aria-hidden className="arrow-nudge">→</span>
              </Link>
              <Link
                href="/simulateur"
                className="btn-secondary text-base px-6 py-3"
              >
                Tester avec 200 €/mois
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
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
            {/* Wrapping div for the glow halo effect behind the card */}
            <div className="relative w-full max-w-sm">
              {/* Halo — softly glowing primary gradient ring behind the card */}
              <div
                className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary-400/30 via-primary-300/10 to-sky-300/20 blur-2xl opacity-80 pointer-events-none"
                aria-hidden
              />
              <div className="relative w-full bg-white rounded-2xl border border-slate-200/70 shadow-card-lg p-5 select-none animate-slide-up">

              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-0.5">
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

              {/* Mini portfolio chart — replaces the two capital-split bars.
                  SVG path traces an exponential compound-growth curve from
                  year 0 to year 20. stroke-dashoffset animation makes the
                  line appear to draw itself on mount (~2.4s). A soft
                  gradient area under the curve sits behind the stroke for
                  visual weight — no JS, pure CSS + SVG. */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] text-gray-500 mb-2">
                  <span>Croissance sur 20 ans</span>
                  <span className="tabular-nums">{DEMO.gainsShare} % d&apos;intérêts</span>
                </div>
                <svg
                  viewBox="0 0 280 80"
                  className="w-full h-20"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="heroChartArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="heroChartStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                  {/* Area under the curve */}
                  <path
                    d="M 0 70 C 40 68, 80 60, 120 48 S 200 22, 280 8 L 280 80 L 0 80 Z"
                    fill="url(#heroChartArea)"
                    className="animate-fade-in"
                    style={{ animationDelay: "1.8s", animationDuration: "600ms" }}
                  />
                  {/* The animated line */}
                  <path
                    d="M 0 70 C 40 68, 80 60, 120 48 S 200 22, 280 8"
                    fill="none"
                    stroke="url(#heroChartStroke)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="animate-draw-line"
                  />
                  {/* Endpoint dot with pulse */}
                  <circle
                    cx="280"
                    cy="8"
                    r="4"
                    fill="#1d4ed8"
                    className="animate-fade-in"
                    style={{ animationDelay: "2.4s", animationDuration: "400ms" }}
                  />
                  <circle
                    cx="280"
                    cy="8"
                    r="4"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    className="animate-fade-in"
                    style={{ animationDelay: "2.4s", animationDuration: "400ms", transformOrigin: "280px 8px" }}
                  >
                    <animate attributeName="r" from="4" to="10" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>

              {/* Multiplier row */}
              <div className="flex items-center justify-between py-3 border-t border-gray-50">
                <span className="text-xs text-gray-500">Multiplicateur du capital</span>
                <span className="text-sm font-bold text-gray-900">{DEMO.multiplier}</span>
              </div>

              {/* CTA */}
              <Link
                href="/simulateur"
                className="group mt-1 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-semibold transition-colors duration-150"
              >
                Tester avec mes chiffres
                <span aria-hidden className="arrow-nudge">→</span>
              </Link>
              </div>
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
    color === "green" ? "text-gain-dark"        :
    "text-gray-700";

  return (
    <div className={`rounded-xl border-t-2 border border-gray-100 bg-gray-50 p-2.5 ${accent}`}>
      <p className="text-[10px] text-gray-500 mb-1 leading-none">{label}</p>
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
      className="shrink-0 text-gain-dark"
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
