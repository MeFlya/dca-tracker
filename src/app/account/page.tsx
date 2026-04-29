import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/subscription";
import { getStrategyData } from "@/lib/user-strategy";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ManageSubscriptionButton } from "./ManageSubscriptionButton";
import { StrategyTracker } from "@/components/account/StrategyTracker";
import { ReLockedStrategy } from "@/components/account/ReLockedStrategy";
import { OnboardingChecklist } from "@/components/account/OnboardingChecklist";
import { OnboardingEmailTrigger } from "@/components/account/OnboardingEmailTrigger";
import { DashboardEntryTracker } from "@/components/analytics/DashboardEntryTracker";

export const metadata: Metadata = {
  title: "Dashboard — DCA Tracker",
  robots: { index: false, follow: false },
};

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "Gratuit",  color: "text-gray-600",    bg: "bg-gray-100"   },
  premium: { label: "Premium",  color: "text-primary-700", bg: "bg-primary-100" },
};

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sub = await getUserSubscription();
  const planMeta = PLAN_META[sub.plan] ?? PLAN_META.free;
  const isPremium = sub.plan === "premium";

  // Fetch strategy data server-side so we can detect the "canceled with
  // preserved data" state for the re-lock UI.
  const { strategy, entries } = await getStrategyData(user.id);
  const hasLockedData = !isPremium && strategy !== null;

  const periodEndDate = sub.periodEnd
    ? new Date(sub.periodEnd * 1000).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <OnboardingEmailTrigger />
      <DashboardEntryTracker
        hasStrategy={!!strategy}
        entriesCount={entries.length}
      />

      {/* Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour{user.firstName ? `, ${user.firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Votre tableau de bord DCA</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${planMeta.bg} ${planMeta.color}`}>
            {planMeta.label}
          </span>
          <Link
            href="/account/settings"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Paramètres
          </Link>
          {sub.plan === "free" ? (
            <Link href="/tarifs" className="btn-primary text-xs px-4 py-2">
              Passer Premium →
            </Link>
          ) : (
            <ManageSubscriptionButton />
          )}
        </div>
      </div>

      {/* ── HERO: 4 states ─────────────────────────────────────────────────
          1. Premium + strategy → full StrategyTracker (dashboard)
          2. Free + preserved data (canceled) → ReLockedStrategy (reactivate CTA)
          3. Premium + no strategy yet → OnboardingChecklist (activation flow)
          4. Free + no data → OnboardingChecklist (activation flow + trial pitch)
      ─────────────────────────────────────────────────────────────────── */}
      {isPremium && strategy ? (
        <div className="mb-6">
          <StrategyTracker initialStrategy={strategy} initialEntries={entries} />
        </div>
      ) : hasLockedData && strategy ? (
        <div className="mb-6">
          <ReLockedStrategy strategy={strategy} entries={entries} />
        </div>
      ) : (
        <OnboardingChecklist
          isPremium={isPremium}
          hasStrategy={!!strategy}
          firstName={user.firstName ?? undefined}
        />
      )}

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {/* Primary: Simuler */}
        <Link
          href="/simulateur"
          className="group rounded-2xl border border-primary-600 bg-primary-600 text-white p-5 card-hover"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <PlayIcon />
            </div>
          </div>
          <p className="text-base font-bold leading-tight mb-1">
            Simuler un scénario
          </p>
          <p className="text-xs text-primary-100 leading-snug">
            Tester un scénario et voir votre potentiel réel
          </p>
        </Link>

        {/* Secondary: Optimiser */}
        {isPremium && strategy ? (
          <Link
            href={`/simulateur?monthly=${strategy.input.monthlyAmount}&years=${strategy.input.durationYears}&return=${strategy.input.annualReturnPct}&fees=${strategy.input.annualFeesPct}`}
            className="group rounded-2xl border border-gray-100 bg-white p-5 card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                <SlidersIcon />
              </div>
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary-700 transition-colors">
              Optimiser ma stratégie
            </p>
            <p className="text-xs text-gray-500 leading-snug">
              Améliorer votre stratégie actuelle pour maximiser vos gains
            </p>
          </Link>
        ) : (
          <Link
            href="/upgrade?feature=save-strategy"
            className="group rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5 card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                <SlidersIcon />
              </div>
            </div>
            <p className="text-base font-bold text-gray-500 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              Optimiser ma stratégie
            </p>
            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wide mt-1">
              Premium
            </p>
          </Link>
        )}

        {/* Emphasized: Monte Carlo (risk analysis) */}
        {isPremium ? (
          <Link
            href="/simulateur#monte-carlo"
            className="group rounded-2xl border-2 border-primary-200 bg-white p-5 card-hover relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                <ShieldIcon />
              </div>
              <span className="absolute top-3 right-3 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                Premium
              </span>
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary-700 transition-colors">
              Analyser mon risque
            </p>
            <p className="text-xs text-gray-500 leading-snug">
              Tester votre stratégie dans 1 000 scénarios de marché
            </p>
          </Link>
        ) : (
          <Link
            href="/upgrade?feature=monte-carlo"
            className="group rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5 card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                <ShieldIcon />
              </div>
            </div>
            <p className="text-base font-bold text-gray-500 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              Analyser mon risque
            </p>
            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wide mt-1">
              Premium
            </p>
          </Link>
        )}

        {/* Récap fiscal annuel (Premium) — bouton 4e action.
            Free users : redirige vers /upgrade?feature=recap-fiscal. */}
        {isPremium ? (
          <Link
            href="/account/recap-fiscal"
            className="group rounded-2xl border border-gray-100 bg-white p-5 card-hover relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                <DocumentIcon />
              </div>
              <span className="absolute top-3 right-3 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                Premium
              </span>
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary-700 transition-colors">
              Récap fiscal annuel
            </p>
            <p className="text-xs text-gray-500 leading-snug">
              Synthèse PDF de votre année — cases 2042 et 2074
            </p>
          </Link>
        ) : (
          <Link
            href="/upgrade?feature=recap-fiscal"
            className="group rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5 card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                <DocumentIcon />
              </div>
            </div>
            <p className="text-base font-bold text-gray-500 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              Récap fiscal annuel
            </p>
            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wide mt-1">
              Premium
            </p>
          </Link>
        )}

        {/* Importer CSV — surface l'import broker comme une vraie quick action.
            Sinon, la page /account/import reste cachée et beaucoup d'users
            ne savent pas qu'elle existe. */}
        {isPremium ? (
          <Link
            href="/account/import"
            className="group rounded-2xl border border-gray-100 bg-white p-5 card-hover relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                <UploadIcon />
              </div>
              <span className="absolute top-3 right-3 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                Premium
              </span>
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary-700 transition-colors">
              Importer mes positions
            </p>
            <p className="text-xs text-gray-500 leading-snug">
              CSV Trade Republic, Boursorama, Fortuneo
            </p>
          </Link>
        ) : (
          <Link
            href="/upgrade?feature=save-strategy"
            className="group rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5 card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                <UploadIcon />
              </div>
            </div>
            <p className="text-base font-bold text-gray-500 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              Importer mes positions
            </p>
            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wide mt-1">
              Premium
            </p>
          </Link>
        )}
      </div>

      {/* ── Plan + subscription status ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${planMeta.bg} ${planMeta.color}`}>
              {planMeta.label}
            </span>
            {isPremium && sub.subscriptionStatus === "active" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Actif
              </span>
            )}
            {sub.subscriptionStatus === "canceled" && (
              <span className="text-xs text-red-500">Annulé</span>
            )}
            {periodEndDate && (
              <span className="text-xs text-gray-500">Renouvellement le {periodEndDate}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{user.emailAddresses[0]?.emailAddress}</span>
          </div>
        </div>
      </div>

      {/* ── What you get (Premium) / What you unlock (Free) ───────────────── */}
      {!isPremium && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Ce que vous débloquez avec Premium
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { feature: "save-strategy", Icon: SaveIcon,    label: "Suivi de stratégie", desc: "Enregistrez vos performances mensuelles" },
              { feature: "recap-fiscal",  Icon: ReceiptIcon, label: "Récap fiscal annuel", desc: "Cases 2042 et 2074 calculées" },
              { feature: "monte-carlo",   Icon: ChartIcon,   label: "Monte Carlo",        desc: "1 000 scénarios de marché simulés" },
              { feature: "pdf-export",    Icon: PdfIcon,     label: "Export PDF propre",  desc: "Sans filigrane, prêt à partager" },
              { feature: "ab-comparison", Icon: ScaleIcon,   label: "Comparaison A/B",   desc: "Deux stratégies côte à côte" },
            ].map(({ feature, Icon, label, desc }) => (
              <Link
                key={feature}
                href={`/upgrade?feature=${feature}`}
                className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
              >
                <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                  <Icon />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Action card icons (inline SVG, no lucide dep in server component) ───────

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.3 4.5a1 1 0 0 1 1.5-.87l8 5.5a1 1 0 0 1 0 1.74l-8 5.5A1 1 0 0 1 6.3 15.5V4.5Z" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="6" x2="16" y2="6" />
      <circle cx="8" cy="6" r="1.75" fill="white" />
      <line x1="4" y1="14" x2="16" y2="14" />
      <circle cx="13" cy="14" r="1.75" fill="white" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5 4 4.5v5c0 4 2.5 7 6 8 3.5-1 6-4 6-8v-5l-6-2Z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M12 3v3h3" />
      <path d="M7 10h6" />
      <path d="M7 13h6" />
      <path d="M7 16h4" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h10l3 3v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M6 4v5h7V4" />
      <rect x="6" y="11" width="8" height="6" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 2v16l2-1.5L9 18l2-1.5L13 18l2-1.5V2H5Z" />
      <path d="M8 6h4" />
      <path d="M8 9h4" />
      <path d="M8 12h2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17V5" />
      <path d="M3 17h14" />
      <rect x="6" y="10" width="2.5" height="5" />
      <rect x="11" y="7" width="2.5" height="8" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 2h7l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M12 2v5h4" />
      <text x="6.5" y="14.5" fontSize="4.5" fontWeight="700" fill="currentColor" stroke="none">PDF</text>
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3v14" />
      <path d="M5 17h10" />
      <path d="M6 9 4 6 8 6Z" />
      <path d="M14 9 12 6 16 6Z" />
      <path d="M3 6h14" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3v10" />
      <path d="M6 7l4-4 4 4" />
      <path d="M4 14v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" />
    </svg>
  );
}
