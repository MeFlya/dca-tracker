import Link from "next/link";

// ─── Feature data ─────────────────────────────────────────────────────────────

const PRIMARY_FEATURES = [
  {
    icon: <ChartIcon />,
    iconBg: "bg-primary-50",
    title: "Visualisez l'effet du temps",
    description:
      "Modifiez le versement mensuel, la durée ou le rendement : la projection s'actualise en direct. 3 scénarios (conservateur, base, optimiste), graphique interactif et export PDF.",
    cta: "Tester ma simulation",
    href: "/simulateur",
  },
  {
    icon: <CompareIcon />,
    iconBg: "bg-blue-50",
    title: "Comparez les principaux ETF",
    description:
      "CW8, VWCE, EWLD, SPY, QQQ — TER réels, méthode de réplication, derniers cours indicatifs. Chaque ETF détaillé avec son profil et ses points d'attention.",
    cta: "Comparer les ETF",
    href: "/comparer-etf",
  },
  {
    icon: <BookIcon />,
    iconBg: "bg-slate-50",
    title: "Comprenez vos hypothèses",
    description:
      "Toutes les formules du simulateur sont documentées et auditables. Pas de boîte noire : vous savez exactement comment chaque chiffre est calculé.",
    cta: "Lire la méthodologie",
    href: "/methodologie",
  },
] as const;

const SECONDARY_FEATURE = {
  icon: <SignalIcon />,
  title: "Données de marché en direct",
  description:
    "Cours indicatifs de vos ETF préférés. Source et délai toujours affichés — aucune donnée simulée présentée comme réelle.",
  cta: "Voir les marchés",
  href: "/donnees-marche",
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Ce que vous pouvez faire dès maintenant
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Des outils simples pour des décisions éclairées
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Pas de jargon inutile, pas de boîte noire. Chaque outil est conçu
            pour vous donner une image honnête de votre investissement.
          </p>
        </div>

        {/* Primary feature cards — 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {PRIMARY_FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group card hover:shadow-card-hover hover:border-primary-100 transition-all duration-200 flex flex-col"
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-5 text-primary-600`}
              >
                {f.icon}
              </div>

              {/* Copy */}
              <h3 className="font-semibold text-gray-900 text-base mb-2 leading-snug">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                {f.description}
              </p>

              {/* CTA */}
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
                {f.cta}
                <ArrowRight />
              </span>
            </Link>
          ))}
        </div>

        {/* Secondary feature — full-width narrow strip */}
        <Link
          href={SECONDARY_FEATURE.href}
          className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 rounded-2xl border border-gray-100 bg-slate-50 hover:border-gray-200 hover:bg-white transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 text-gray-500">
            {SECONDARY_FEATURE.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {SECONDARY_FEATURE.title}
            </p>
            <p className="text-sm text-gray-500 mt-0.5 leading-snug">
              {SECONDARY_FEATURE.description}
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
            {SECONDARY_FEATURE.cta}
            <ArrowRight />
          </span>
        </Link>

      </div>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 15L7.5 9.5L11 12.5L15.5 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 6H12.5M15.5 6V9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="5.5" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.5" y="8" width="5.5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 3h5.5M11.5 3h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 4.5A1.5 1.5 0 0 1 5.5 3H16v14H5.5A1.5 1.5 0 0 1 4 15.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 15.5A1.5 1.5 0 0 0 5.5 17H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 7.5h5M8 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 14c2.2-2.8 5-4 8-4s5.8 1.2 8 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.5 10.5C6.9 9.1 8.4 8.4 10 8.4s3.1.7 4.5 2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 7.5C9 7.2 9.5 7 10 7s1 .2 1.5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="translate-x-0 group-hover:translate-x-0.5 transition-transform"
    >
      <path
        d="M3 8h10M9.5 4.5l4 3.5-4 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
