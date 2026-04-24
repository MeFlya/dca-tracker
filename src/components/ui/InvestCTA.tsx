import {
  isBrokerCTAActive,
  getPartners,
  BROKER_CONFIG,
  type AccountType,
  type BrokerPartner,
} from "@/lib/broker-config";
import { cn } from "@/lib/utils";

interface InvestCTAProps {
  /**
   * Optional filter — only show brokers supporting this account type.
   * Useful on ETF pages: EU-listed ETFs → "PEA", US ETFs → "CTO".
   * Omit to show all configured partners.
   */
  accountType?: AccountType;
  className?: string;
}

/**
 * Renders nothing when no partner is configured.
 * Flip BROKER_CONFIG.enabled and add partners to make it appear.
 */
export function InvestCTA({ accountType, className }: InvestCTAProps) {
  if (!isBrokerCTAActive()) return null;

  const partners = getPartners(accountType);
  if (partners.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6",
        className
      )}
    >
      {/* Header */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Passer à l&apos;action
      </p>

      <h3 className="text-base font-semibold text-gray-900 leading-snug">
        Prêt à passer à l&apos;action ?
      </h3>
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
        Si vous souhaitez commencer à investir, vous pouvez ouvrir un compte
        chez un courtier adapté à une stratégie long terme.
      </p>

      {/* Partner buttons */}
      <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-2.5">
        {partners.map((partner) => (
          <PartnerButton key={partner.id} partner={partner} />
        ))}
      </div>

      {/* Disclosure */}
      <p className="mt-4 flex items-start gap-1.5 text-[11px] text-slate-400 leading-relaxed">
        <InfoIcon />
        {BROKER_CONFIG.disclosureText}
      </p>
    </div>
  );
}

// ─── Partner button ───────────────────────────────────────────────────────────

function PartnerButton({ partner }: { partner: BrokerPartner }) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 text-sm font-medium text-gray-700 hover:text-primary-700 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <span>{partner.name}</span>

      {/* Account type pills */}
      <span className="flex items-center gap-1">
        {partner.accountTypes.map((type) => (
          <AccountTypePill key={type} type={type} />
        ))}
      </span>

      {/* Optional highlight badge */}
      {partner.badge && (
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-gain/10 text-gain-dark text-[10px] font-semibold">
          {partner.badge}
        </span>
      )}

      <ExternalLinkIcon />
    </a>
  );
}

function AccountTypePill({ type }: { type: AccountType }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
      {type}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 opacity-40 group-hover:opacity-70 transition-opacity"
    >
      <path
        d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9.5 2.5H13.5V6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 2.5L8 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 mt-0.5"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 7v4M8 5.5h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
