/**
 * Broker / affiliate partner configuration.
 *
 * ─── How to add a partner ────────────────────────────────────────────────────
 *
 * 1. Set  enabled: true
 * 2. Push a BrokerPartner object into the  partners  array:
 *
 *    {
 *      id:           "trade-republic",      // unique slug, used as React key
 *      name:         "Trade Republic",      // display name
 *      url:          "https://...",         // affiliate / referral link
 *      accountTypes: ["PEA", "CTO"],        // account types this broker supports
 *      badge:        "Sans commission",     // optional short highlight (≤ 25 chars)
 *    }
 *
 * 3. Deploy — the CTA block appears automatically wherever <InvestCTA /> is
 *    rendered. No component changes needed.
 *
 * ─── Account types ───────────────────────────────────────────────────────────
 *
 *  "PEA"  — Plan d'Épargne en Actions (French tax wrapper, EU ETFs only)
 *  "CTO"  — Compte-Titres Ordinaire   (all markets, no tax benefit)
 *
 * ─── Partners to consider ────────────────────────────────────────────────────
 *
 *  Trade Republic     — https://refer.trade.to/...  (PEA + CTO)
 *  Boursorama Bourse  — https://www.boursorama.com/...  (PEA + CTO)
 *  Degiro             — https://www.degiro.fr/...    (CTO only)
 *  Interactive Brokers — https://ibkr.com/...        (CTO only)
 *  Fortuneo           — https://...                  (PEA + CTO)
 */

export type AccountType = "PEA" | "CTO";

export interface BrokerPartner {
  id: string;
  name: string;
  url: string;
  accountTypes: AccountType[];
  /** Short highlight shown as a badge next to the button — keep it ≤ 25 chars. */
  badge?: string;
}

export interface BrokerCTAConfig {
  /** Master switch. Set to true only once real partner links are in place. */
  enabled: boolean;
  partners: BrokerPartner[];
  /** Shown in fine print whenever the block is visible. */
  disclosureText: string;
}

// ─── Active configuration ─────────────────────────────────────────────────────
//
// Default: disabled. Add partners and flip enabled to true when ready.

export const BROKER_CONFIG: BrokerCTAConfig = {
  enabled: false,

  partners: [
    // Example — uncomment and fill in real URLs to activate:
    //
    // {
    //   id: "trade-republic",
    //   name: "Trade Republic",
    //   url: "https://refer.trade.to/VOTRE_CODE",
    //   accountTypes: ["PEA", "CTO"],
    //   badge: "Sans commission",
    // },
    // {
    //   id: "boursorama",
    //   name: "Boursorama Bourse",
    //   url: "https://www.boursorama.com/...",
    //   accountTypes: ["PEA", "CTO"],
    // },
    // {
    //   id: "degiro",
    //   name: "Degiro",
    //   url: "https://www.degiro.fr/...",
    //   accountTypes: ["CTO"],
    //   badge: "Frais réduits",
    // },
  ],

  disclosureText:
    "Certains liens pourront être affiliés à l'avenir. DCA Tracker perçoit alors une commission si vous ouvrez un compte via ces liens, sans frais supplémentaires pour vous.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true only when the block should render (enabled + ≥1 partner). */
export function isBrokerCTAActive(): boolean {
  return BROKER_CONFIG.enabled && BROKER_CONFIG.partners.length > 0;
}

/**
 * Returns partners filtered by account type.
 * Pass undefined to get all partners.
 */
export function getPartners(accountType?: AccountType): BrokerPartner[] {
  if (!accountType) return BROKER_CONFIG.partners;
  return BROKER_CONFIG.partners.filter((p) =>
    p.accountTypes.includes(accountType)
  );
}
