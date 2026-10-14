/**
 * Analytics abstraction layer.
 *
 * All event tracking goes through `track()`. If no provider is configured the
 * function is a no-op in production and logs to the console in development —
 * so you can drop it in anywhere without breaking anything.
 *
 * ─── Le fournisseur, et pourquoi il a changé le 23/08/2026 ──────────────────
 *
 * Vercel Web Analytics, monté par <Analytics /> dans le layout racine. Sans
 * variable d'environnement à poser : le composant suffit.
 *
 * Plausible a été retiré. L'abonnement n'était plus payé, mais son script
 * continuait d'être servi à chaque visite — 6 Ko par page pour n'enregistrer
 * nulle part, et 25 appels de mesure qui ne mesuraient plus rien. Une panne
 * silencieuse de plus : le code se lisait comme s'il collectait.
 *
 * Vercel est sans cookie, comme Plausible l'était : pas de bandeau de consentement.
 *
 * Note (2026-04-29): Google Analytics support was removed to keep the site
 * cookieless and avoid the consent-banner requirement.
 *
 * ─── Event naming convention ─────────────────────────────────────────────────
 *
 * snake_case, descriptive, no PII in event names or props.
 * Props are aggregate signals only (amounts, durations, identifiers, flags).
 */

import { pageview, track as vercelTrack } from "@vercel/analytics";

// ─── Event catalog (discriminated union — typed per-event props) ──────────────

export type AnalyticsEvent =
  // ── Top of funnel
  | { name: "visit_home" }
  | { name: "visit_about" }
  | { name: "homepage_cta_click"; props: { destination: "simulator" | "compare_etf" | "tarifs" } }

  // ── Simulator
  | { name: "start_simulation" }
  | { name: "complete_simulation"; props: { monthly: number; years: number; return_pct: number; fees_pct: number } }
  | { name: "simulator_run"; props: { monthly: number; years: number; return_pct: number } }  // legacy
  | { name: "share_link_click" }
  | { name: "pdf_export_click" }

  // ── Save strategy / conversion blocks
  | { name: "click_save_strategy"; props: { has_account: boolean; plan: string } }
  | { name: "conversion_block_click"; props: { block: "loss" | "time_shift" | "error" } }

  // ── Auth
  | { name: "signup" }
  | { name: "login" }

  // ── Dashboard + tracking
  | { name: "enter_dashboard"; props: { has_strategy: boolean; entries_count: number } }
  | { name: "log_month"; props: { contributions: number; portfolio_value: number } }
  | { name: "edit_month" }
  | { name: "delete_month" }
  | { name: "create_strategy"; props: { monthly: number; years: number; etfs: number } }
  | { name: "edit_strategy"; props: { monthly: number; years: number; etfs: number } }

  // ── Upgrade + payment
  | { name: "open_upgrade"; props: { feature: string } }
  /**
   * Démarre la période d'essai.
   *   - billing : "monthly" | "yearly"
   *   - with_cb : true si CB collectée à l'entrée (Stripe Checkout standard),
   *               false si essai sans CB (flux "trial-then-paywall").
   *               C'est l'axe de l'A/B test Sprint 2 #10 — ne jamais confondre.
   */
  | { name: "start_trial"; props: { billing: "monthly" | "yearly"; with_cb: boolean } }
  | { name: "complete_payment"; props: { plan: string } }
  | { name: "cancel_subscription" }
  // ── Trial conversion funnel (pour A/B test CB vs sans CB)
  | { name: "trial_canceled_during_period"; props: { day_of_trial: number; with_cb: boolean } }
  | { name: "trial_converted_to_paid"; props: { billing: "monthly" | "yearly"; with_cb: boolean } }
  /**
   * Tiré par le cron J+7 post-paiement réussi. Permet de mesurer la rétention
   * "early churn" — bien plus prédictive que le simple paid_count brut.
   * Si ce nombre / start_trial.with_cb=true est < 60 %, le funnel CB est cassé.
   */
  | { name: "subscription_active_j7"; props: { billing: "monthly" | "yearly" } }
  // ── Annual push banner (in-app)
  | { name: "annual_banner_shown" }
  | { name: "annual_banner_click" }
  | { name: "annual_banner_dismiss" }

  // ── Backtest historique (feature Premium récurrente — moat n°1)
  | { name: "backtest_started"; props: { monthly_amount: number; start_date: string; end_date: string } }
  | { name: "backtest_completed"; props: { monthly_amount: number; months_invested: number; gain_pct: number; irr_pct: number | null } }
  | { name: "backtest_premium_locked_cta_clicked" }
  /** Clic sur le teaser /backtest affiché dans les résultats du simulateur. */
  | { name: "backtest_teaser_click" }

  // ── Produits digitaux (paiement unique)
  /**
   * Clic sur un renvoi de fin d'article (RenvoiProduit). `page` est le chemin
   * de l'article : c'est lui qui dit quelle page amène des acheteurs, ce que
   * product_checkout_click, tiré sur la page produit, ne peut pas savoir.
   */
  | { name: "product_renvoi_click"; props: { product_id: string; page: string } }
  | { name: "product_checkout_click"; props: { product_id: string } }
  | { name: "product_purchase"; props: { product_id: string } }
  | { name: "backtest_quick_scenario_used"; props: { scenario_name: string } }

  // ── Account
  | { name: "import_csv"; props: { months: number; detected_format: string } }
  | { name: "export_data" }
  | { name: "delete_account" }

  // ── Other engagement
  | { name: "invest_cta_click"; props: { broker_id: string; account_type: string } }
  | { name: "email_signup"; props: { source: string } };

// ─── Global context (auto-appended to every event) ────────────────────────────

type GlobalContext = {
  plan?: string;  // "free" | "premium"
  device?: "mobile" | "desktop";
};

let globalContext: GlobalContext = {};

/** Update globally-propagated context. Call this once per page, client-side. */
export function setAnalyticsContext(ctx: Partial<GlobalContext>): void {
  globalContext = { ...globalContext, ...ctx };
}

function detectDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

// ─── Core track function ──────────────────────────────────────────────────────

/**
 * Fire an analytics event. Safe to call anywhere — client-only, no-op on
 * the server or when no provider is configured.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const eventProps = "props" in event ? (event.props as Record<string, unknown>) : {};
  const mergedProps: Record<string, unknown> = {
    ...eventProps,
    ...globalContext,
    device: globalContext.device ?? detectDevice(),
  };

  // Always log in dev so you can verify hooks are wired correctly.
  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event.name}`, mergedProps);
  }

  // ⚠️ CORRECTION DU 28/09/2026 — ce qui était écrit ici était FAUX.
  //
  // Le commentaire précédent affirmait que le plan Hobby incluait les
  // événements personnalisés. Le tableau de bord Vercel dit le contraire :
  // « No custom events — Upgrade to a Pro team to access this feature ».
  // Pendant cinq semaines, ces appels sont donc partis vers Vercel pour n'être
  // enregistrés nulle part — la même panne silencieuse que celle de Plausible,
  // que ce fichier prétendait justement réparer.
  //
  // Les pages vues, elles, sont bien mesurées par <Analytics /> : c'est ce qui
  // fournit visiteurs, pages et sources. Le tunnel fin (clics sur les CTA,
  // démarrages d'essai) ne l'est pas, et ne le sera qu'avec un plan Pro.
  //
  // Plutôt que d'envoyer des requêtes qui ne servent à rien depuis le
  // navigateur de chaque visiteur, on n'envoie pas. Passer le drapeau à `true`
  // suffit le jour où le plan le permet — tous les appels track() du site sont
  // déjà en place.
  if (!EVENEMENTS_PERSONNALISES_ACTIFS) return;

  // Les événements qui ne font que doubler une page vue ne partent pas.
  if (EVENEMENTS_REDONDANTS.has(event.name)) return;

  vercelTrack(event.name, primitivesSeules(mergedProps));
}

/** Vercel ne stocke les événements personnalisés qu'à partir du plan Pro. */
const EVENEMENTS_PERSONNALISES_ACTIFS = false;

/** Doublons purs d'une page vue, que Vercel compte déjà. */
const EVENEMENTS_REDONDANTS = new Set<AnalyticsEvent["name"]>([
  "visit_home",
  "visit_about",
]);

/**
 * Vercel n'accepte que des valeurs plates. Tout le reste est écarté plutôt que
 * converti : un objet transformé en « [object Object] » occuperait une place
 * dans le quota pour ne rien apprendre.
 */
function primitivesSeules(
  props: Record<string, unknown>,
): Record<string, string | number | boolean | null> | undefined {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || ["string", "number", "boolean"].includes(typeof v)) {
      out[k] = v as string | number | boolean | null;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// ═════════════════════════════════════════════════════════════════════════════
// ÉTAPES CLÉS, MESURÉES PAR DES PAGES VUES FICTIVES (14/10/2026)
// ═════════════════════════════════════════════════════════════════════════════
//
// ─── Pourquoi ────────────────────────────────────────────────────────────────
//
// Le plan Hobby de Vercel n'enregistre pas les événements personnalisés (voir
// EVENEMENTS_PERSONNALISES_ACTIFS plus haut), et le plan Pro n'est pas au
// budget. Il enregistre en revanche toutes les pages vues, y compris celles
// qu'on lui signale à la main avec pageview({ path }) — la technique déjà
// utilisée par la vidéo d'accueil (/video/son-ouvert dans HeroVideoLecteur).
//
// Chaque étape clé du tunnel envoie donc une page vue fictive, sous /evt/…
// Ces pages n'existent pas sur le site (elles répondraient 404) : elles ne
// servent qu'à apparaître dans Vercel > Analytics > Pages, où l'on filtre
// sur « /evt/ » pour lire le tunnel. Elles comptent dans le quota de pages
// vues du plan Hobby, comme une page ordinaire (quelques dizaines par mois au
// trafic actuel).
//
// ─── Les chemins ─────────────────────────────────────────────────────────────
//
//   Étape                          Chemin                                          Quand, et combien de fois
//   ─────────────────────────────  ──────────────────────────────────────────────  ─────────────────────────────────────────────
//   Clic vers un courtier          /evt/courtier/<courtier>/<compte>/depuis/<page>  Clic sur un lien partenaire (PartnerLink).
//                                  ex. /evt/courtier/trade-republic/pea/depuis/etf/cw8   Une fois par courtier et par page dans
//                                                                                   l'onglet. Rien tant que l'affiliation est
//                                                                                   éteinte (aucun lien partenaire affiché).
//   Ressource email envoyée        /evt/email/ressource/<ressource>/depuis/<page>   Réponse « succès » de /api/subscribe.
//                                  ressource : cheat-sheet | modele-suivi-pea      Une fois par ressource et par page dans l'onglet.
//   Inscription à la liste         /evt/email/liste/ajoutee                         Case cochée ET contact réellement ajouté au
//                                                                                   segment Resend (le serveur le confirme).
//   Échec d'ajout à la liste       /evt/email/liste/refusee                         Case cochée mais Resend a refusé (clé sans
//                                                                                   droit sur les contacts, segment absent…) :
//                                                                                   c'est l'alarme d'une liste qui ne se remplit pas.
//   Compte créé                    /evt/compte/cree                                 Premier chargement d'une page par un compte
//                                                                                   créé il y a moins de 30 minutes. Une fois
//                                                                                   par navigateur.
//   Début de paiement              /evt/paiement/debut/<offre>                      Clic d'achat qui part vraiment vers Stripe
//                                  offre : template-suivi-dca | guide-demarrer-dca  (après le verrou anti double clic). Une fois
//                                  | bundle-dca | premium-annuel | premium-mensuel  par offre dans l'onglet : un second essai
//                                  | premium-a-vie                                  après annulation sur Stripe ne recompte pas.
//   Paiement réussi                /evt/paiement/reussi/<offre>                     /produits/merci, session Stripe « paid »
//                                  offre : id produit | premium-essai               vérifiée côté serveur ; /payment/success,
//                                                                                   session « complete » vérifiée (Premium :
//                                                                                   l'essai de 7 jours démarre, aucun débit
//                                                                                   encore). Une fois par session Stripe.
//
// <page> est le chemin de la page où l'action a eu lieu (« accueil » pour /).
// Ce sont des slugs publics (fiches ETF, guides, comparatifs).
//
// ─── Ce qui n'entre JAMAIS dans un chemin ────────────────────────────────────
//
// Aucune donnée personnelle : ni adresse email, ni identifiant de compte, ni
// identifiant de session Stripe, ni paramètre d'URL. Chaque segment est
// réduit à [a-z0-9-] ; ce qui ne passe pas devient « autre ». Les pages de
// l'espace connecté (/account…) sont écrites « espace-compte » sans détail.
//
// ─── Lire le tunnel ──────────────────────────────────────────────────────────
//
// Vercel > projet dca-tracker > Analytics > Pages, filtre « /evt/ ». Les
// « visiteurs » d'une ligne /evt/… sont des personnes distinctes (Vercel les
// compte par jour sans cookie) : c'est le chiffre à lire, plutôt que les
// pages vues.

/** Une étape du tunnel, avec ce qu'il faut pour écrire son chemin. */
export type EtapeMesuree =
  | { etape: "courtier"; courtier: string; compte: string }
  | { etape: "email-ressource"; ressource: "cheat-sheet" | "modele-suivi-pea" }
  | { etape: "email-liste"; resultat: "ajoutee" | "refusee" }
  | { etape: "compte-cree" }
  | { etape: "paiement-debut"; offre: string }
  | { etape: "paiement-reussi"; offre: string };

/** Segment de chemin sûr : minuscules, chiffres, tirets ; « autre » sinon. */
function segment(brut: string): string {
  const s = brut
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "autre";
}

/** Préfixes de pages qui parlent d'une personne, jamais détaillés. */
const PAGES_PRIVEES = ["/account", "/sign-in", "/sign-up", "/upgrade", "/payment", "/produits/merci", "/desinscription"];

/** Chemin de la page courante, réduit à des segments sûrs. « accueil » pour /. */
function pageCourante(): string {
  const chemin = window.location.pathname;
  if (chemin === "/" || chemin === "") return "accueil";
  if (PAGES_PRIVEES.some((p) => chemin === p || chemin.startsWith(`${p}/`))) {
    return "espace-compte";
  }
  const segments = chemin
    .split("/")
    .filter(Boolean)
    .slice(0, 4)
    .map((s) => {
      try {
        return segment(decodeURIComponent(s));
      } catch {
        return "autre";
      }
    });
  return segments.join("/") || "accueil";
}

/** Le chemin /evt/… d'une étape. Exporté pour la vérification et les tests. */
export function cheminEtape(e: EtapeMesuree): string {
  switch (e.etape) {
    case "courtier":
      return `/evt/courtier/${segment(e.courtier)}/${segment(e.compte)}/depuis/${pageCourante()}`;
    case "email-ressource":
      return `/evt/email/ressource/${segment(e.ressource)}/depuis/${pageCourante()}`;
    case "email-liste":
      return `/evt/email/liste/${e.resultat}`;
    case "compte-cree":
      return "/evt/compte/cree";
    case "paiement-debut":
      return `/evt/paiement/debut/${segment(e.offre)}`;
    case "paiement-reussi":
      return `/evt/paiement/reussi/${segment(e.offre)}`;
  }
}

/**
 * Clés déjà mesurées dans ce chargement de page : le filet quand le stockage
 * du navigateur est indisponible (navigation privée stricte, cookies bloqués).
 */
const DEJA_MESURE = new Set<string>();

function stockage(portee: "onglet" | "navigateur"): Storage | null {
  try {
    return portee === "onglet" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Envoie la page vue fictive d'une étape, UNE SEULE FOIS par clé.
 *
 * - `portee` : « onglet » (sessionStorage, défaut) ou « navigateur »
 *   (localStorage) — le compte créé et le paiement réussi ne doivent pas
 *   recompter au rechargement ni dans un nouvel onglet.
 * - `cle` : ce qui rend l'étape unique, si ce n'est pas le chemin lui-même
 *   (ex. l'identifiant de la session Stripe : il reste dans le navigateur de
 *   la personne, il ne part JAMAIS chez Vercel).
 *
 * Renvoie true si la page vue est partie. Sans effet côté serveur.
 */
export function mesurerEtape(
  e: EtapeMesuree,
  options: { portee?: "onglet" | "navigateur"; cle?: string } = {},
): boolean {
  if (typeof window === "undefined") return false;
  const path = cheminEtape(e);
  const cle = `dca-evt:${options.cle ? `${e.etape}:${options.cle}` : path}`;
  if (DEJA_MESURE.has(cle)) return false;
  const s = stockage(options.portee ?? "onglet");
  try {
    if (s?.getItem(cle)) return false;
    s?.setItem(cle, "1");
  } catch {
    /* stockage plein ou refusé : le filet en mémoire suffit pour ce chargement */
  }
  DEJA_MESURE.add(cle);

  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] page vue fictive ${path}`);
  }
  // `route` = `path` : le script de Vercel garde la route de la dernière page
  // vue réelle (« /etf/[symbol] »…) et l'envoie (champ dp) avec le chemin
  // qu'on lui donne — vérifié dans son code le 14/10/2026. Sans `route`,
  // l'onglet « Routes » du tableau de bord risquerait de compter la vue
  // /evt/… comme une vue de plus de la page où l'action a eu lieu.
  fileAttenteVercel();
  pageview({ route: path, path });
  return true;
}

/**
 * Crée la file d'attente de Vercel Analytics si elle n'existe pas encore.
 *
 * Relecture du 14/10/2026 : pageview() de @vercel/analytics appelle
 * `window.va?.(…)` — si window.va n'existe pas, l'appel est PERDU sans bruit.
 * Or window.va n'est créé que par l'effet de <Analytics /> (inject), monté en
 * DERNIER dans le layout racine, après {children}. Sur un premier chargement
 * (retour de Stripe vers /produits/merci ou /payment/success), l'effet de
 * <MesureEtape /> passe AVANT celui de <Analytics /> : sans cette file, la
 * page vue « paiement réussi » partait dans le vide, et la clé déjà posée
 * dans le stockage empêchait tout nouvel essai.
 *
 * Même file que celle de la bibliothèque (initQueue) : inject() ne la
 * remplace pas si elle existe, et le script de Vercel rejoue window.vaq à son
 * chargement, dans l'ordre.
 */
function fileAttenteVercel(): void {
  const w = window as unknown as { va?: (...params: unknown[]) => void; vaq?: unknown[][] };
  if (w.va) return;
  w.va = function va(...params: unknown[]) {
    if (!w.vaq) w.vaq = [];
    w.vaq.push(params);
  };
}
