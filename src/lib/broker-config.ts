/**
 * Broker / affiliate partner configuration.
 *
 * ─── ⚠️ Pré-requis avant activation (3 actions humaines) ────────────────────
 *
 *  A. Créer les comptes affiliés sur les plateformes broker :
 *     - Trade Republic — https://trade.re/refer (programme d'apporteur)
 *     - Boursorama Bourse — programme de parrainage en self-service
 *     - Fortuneo — affiliation via Awin ou TimeOne (selon disponibilité FR)
 *     Récupérer pour chacun l'URL d'affiliation unique.
 *
 *  B. Vérifier la conformité AMF — un site pédagogique qui présente plusieurs
 *     courtiers et touche une commission est légal MAIS doit afficher la
 *     mention "lien affilié" avant le clic (Code de la consommation L.111-7
 *     + LCEN). Le composant <AffiliateDisclaimer /> s'en charge automatiquement
 *     dès que isBrokerCTAActive() = true.
 *     Ressources :
 *       - https://www.amf-france.org/fr/espace-professionnels/agent-lie
 *       - https://www.economie.gouv.fr/dgccrf/influenceurs-information-consommateur
 *
 *  C. Une fois A + B faits :
 *     1. enabled: true (ci-dessous)
 *     2. Décommenter et remplir les 3 partenaires PEA+CTO
 *     3. Push → Vercel deploy → vérifier le rendu sur /simulateur,
 *        /comparatif, /etf/<symbol>
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
 * ─── Partners to consider (France-first) ────────────────────────────────────
 *
 *  Trade Republic     — https://refer.trade.to/...  (PEA + CTO) — sans commission, très populaire
 *  Boursorama Bourse  — https://clients.boursorama.com/...  (PEA + CTO) — référence banque en ligne
 *  Fortuneo           — https://...  (PEA + CTO) — bonne expérience mobile
 *  BforBank           — https://...  (PEA + CTO) — filiale du Crédit Agricole
 *  Saxo Banque        — https://...  (PEA + CTO) — gamme ETF étendue
 *  Degiro             — https://www.degiro.fr/...  (CTO only) — frais très bas
 *  Interactive Brokers — déconseillé pour débutants : interface complexe, fiscalité à gérer manuellement
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
    // ── Recommandés pour débutants français (PEA + CTO) ──────────────────────
    // Décommenter et remplacer [À REMPLIR PAR MAEL] par les vraies URLs
    // affiliées une fois les comptes créés (cf pré-requis A en haut du
    // fichier). Garder enabled: false jusqu'à ce qu'au moins 1 partenaire
    // soit configuré avec une URL réelle.
    //
    // {
    //   id: "trade-republic",
    //   name: "Trade Republic",
    //   url: "[À REMPLIR PAR MAEL — URL d'affiliation Trade Republic]",
    //   accountTypes: ["PEA", "CTO"],
    //   badge: "Sans commission",
    // },
    // {
    //   id: "boursorama",
    //   name: "Boursorama Bourse",
    //   url: "[À REMPLIR PAR MAEL — URL parrainage Boursorama]",
    //   accountTypes: ["PEA", "CTO"],
    //   badge: "Banque en ligne",
    // },
    // {
    //   id: "fortuneo",
    //   name: "Fortuneo",
    //   url: "[À REMPLIR PAR MAEL — URL d'affiliation Fortuneo via Awin/TimeOne]",
    //   accountTypes: ["PEA", "CTO"],
    // },
    //
    // ── CTO uniquement ────────────────────────────────────────────────────────
    //
    // {
    //   id: "degiro",
    //   name: "Degiro",
    //   url: "[À REMPLIR PAR MAEL — URL d'affiliation Degiro]",
    //   accountTypes: ["CTO"],
    //   badge: "Frais réduits",
    // },
  ],

  // Texte court rendu en fine print dans <InvestCTA />, en complément du
  // composant <AffiliateDisclaimer /> qui assure la mention LCEN visible
  // avant le clic (Code de la consommation art. L.111-7).
  disclosureText:
    "DCA Tracker peut percevoir une commission si vous ouvrez un compte via les liens ci-dessus. Cela ne change rien au coût pour vous. Aucun classement payant — l'ordre des courtiers est uniquement basé sur leur pertinence pour un DCA ETF.",
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
