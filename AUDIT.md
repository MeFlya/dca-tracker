# AUDIT — dcatracker.fr

**Date** : 2026-06-10 · **Mode** : lecture seule (aucun fichier modifié, rien installé, rien pushé)
**Méthode** : 4 lecteurs parallèles (perf, UI/UX, funnel, contenu) + 1 vérificateur adversarial indépendant qui a re-vérifié les claims critiques dans le code. **17/17 claims vérifiés confirmés.** Chaque constat cite fichier:ligne.
**Limite assumée** : les Core Web Vitals sont **estimés par lecture de code** (pas de mesure runtime). Pour des chiffres réels : PageSpeed Insights ou Chrome DevTools MCP (§4).

**Scoring** : Impact (1-5, 5 = fort) / Effort (1-5, 5 = lourd) / Risque (1-5, 5 = risque de régression élevé).

---

## 1. PERFORMANCE & CORE WEB VITALS

### 1.1 État estimé par page clé

| Page | Poids JS (build) | LCP | CLS | INP | Notes |
|---|---|---|---|---|---|
| `/` (home) | ~115 kB | 🟡 Moyen | 🟢 Bon | 🟢 Bon | LCP = texte (bon) mais chaîne critique fonts via `@import` CSS. AmbientBackground fixed = pas de shift. |
| `/simulateur` | **286 kB** | 🟠 À risque | 🟡 Moyen | 🟠 À risque | Recharts non code-splitté + recalcul simulation à chaque tick de slider. La page la plus importante du funnel est la plus lente. |
| `/comparatif-etf/cw8-vs-wpea` | ~116 kB | 🟢 Bon | 🟢 Bon | 🟢 Bon | Statique prerendered. C'est la page qui rank — elle est saine. |
| `/strategie-dca` (guide YMYL) | ~116 kB | 🟢 Bon | 🟢 Bon | 🟢 Bon | Statique. Seul risque résiduel : fonts. |

### 1.2 Constats (vérifiés)

| # | Constat | Preuve | I | E | R |
|---|---|---|---|---|---|
| P1 | **Recharts importé statiquement** — 5 composants charts (`PortfolioChart`, `MonteCarloChart`, `GainsDonutChart`, `ScenarioComparison`, `BacktestClient`) importent recharts sans `dynamic()`. Chunks de 343K/327K dans le bundle. Gain estimé : **−80 à −120 kB** de JS initial sur /simulateur. Fix : `next/dynamic` avec skeleton à dimensions réservées (pas de CLS induit). ✅ Confirmé par vérificateur. | `src/components/simulator/PortfolioChart.tsx:1-12`, `MonteCarloChart.tsx:3-11`, `SimulatorPageClient.tsx:10-11` | 4 | 2 | 2 |
| P2 | **Fonts Google via `@import` CSS** (Inter + Newsreader) — chaîne critique : CSS → fetch Google CSS → fetch WOFF2. `display=swap` est là (bon), mais `preconnect` sans preload = 300-500 ms perdus. **Le vrai fix : migrer vers `next/font/google`** (self-host automatique, `size-adjust` anti-CLS, supprime la requête tierce). ✅ Confirmé. | `src/app/globals.css:12`, `src/app/layout.tsx:94-99` | 4 | 2 | 1 |
| P3 | **Sliders du simulateur sans debounce** — chaque tick de slider déclenche `runSimulation()` immédiatement (le debounce existant ne couvre que l'analytics). INP dégradé pendant le drag (50-200 ms par tick). Fix : debounce 100-150 ms sur le recalcul, ou `useDeferredValue`. ✅ Confirmé. | `src/components/ui/SliderInput.tsx:59-67`, `SimulatorPageClient.tsx:97-109` | 3 | 1 | 1 |
| P4 | **CLS Header (Clerk)** — placeholder `w-24 h-8` pendant `!isLoaded`, mais le contenu final (Dashboard + Passer à Premium + cloche + avatar) est plus large → micro-shift à l'hydratation. Fix : dimensionner le placeholder à la largeur réelle. | `src/components/layout/Header.tsx:88-128` | 2 | 1 | 1 |
| P5 | **AnnualPushBanner apparaît post-mount** (useEffect + localStorage) sans réservation de hauteur → ~120 px de CLS sur /account pour les Premium mensuels éligibles. Fix : réserver la hauteur ou l'afficher server-side. | `src/components/account/AnnualPushBanner.tsx:35-60` | 2 | 1 | 1 |
| P6 | **~55 composants `"use client"`** dont plusieurs pourraient être server (gain 20-40 kB partagé). Chantier de fond, pas urgent. | grep `"use client"` src/ | 2 | 3 | 2 |
| P7 | **AmbientBackground animé en boucle 40 s** — GPU-friendly (background-position) et `prefers-reduced-motion` respecté ✅. Coût marginal batterie mobile. RAS, à garder. | `globals.css:227-246, 311-340` | 1 | 1 | 1 |
| P8 | **NotificationBell** : fetch au mount sans skeleton + `animate-ping` permanent sur le badge. Micro-jank, faible priorité. | `NotificationBell.tsx:62-130` | 2 | 2 | 2 |

### 1.3 Quick wins perf (ordre d'exécution recommandé)

1. **`next/font`** pour Inter + Newsreader (P2) — touche toutes les pages, LCP + CLS.
2. **`dynamic()` sur les 5 composants recharts** (P1) — la page funnel principale passe de 286 → ~170 kB.
3. **Debounce du recalcul simulation** (P3) — INP du simulateur.
4. P4 + P5 (placeholders dimensionnés) — 30 min cumulées.

---

## 2. UI / UX — DIAGNOSTIC HONNÊTE

**Vue d'ensemble** : la base est pro (design system btn-primary/btn-secondary, DA Premium dark cohérente, typographie Newsreader, AmbientBackground discret). Ce qui fait "presque pro mais pas tout à fait" : l'absence totale d'états de chargement/erreur, des incohérences de détail (boutons ad hoc, typo), et des empty states bruts.

| # | Amélioration chirurgicale | Preuve | Impact attendu | I | E | R |
|---|---|---|---|---|---|---|
| U1 | **Aucun `loading.tsx` / `error.tsx` dans tout `src/app`** (1 seul `not-found.tsx` sur /etf/[symbol]). Navigation sans feedback, erreurs API silencieuses — grave pour des payants. Fix : 5-6 `loading.tsx` skeleton (dimensions réservées = zéro CLS) + `error.tsx` avec bouton retry sur /account, /simulateur, /backtest, /account/import. | `find src/app -name loading.tsx` → 0 | Crédibilité + rétention premium | 4 | 2 | 1 |
| U2 | **7 styles de "bouton blanc" inline ad hoc** vs les 2 classes officielles — même intention, paddings différents selon les pages. Fix : créer `.btn-white-primary` dans globals.css + refacto des 7 occurrences. | grep `bg-white text-primary` → 7 fichiers, ex. `investir-500-euros-mois-etf/page.tsx`, `etf/[symbol]/page.tsx` | Cohérence visuelle | 3 | 1 | 1 |
| U3 | **Empty states bruts** : Testimonials auto-masqué (zone vide), SavedSimulationsList et notifications sans illustration/copy affirmant. Fix : 3 empty states avec icône + phrase engageante ("Aucune simulation sauvegardée — créez-en une"). Pas d'image raster → zéro coût CWV. | `tarifs/page.tsx:300`, `account/page.tsx:93-99` | Perception "produit vivant" | 3 | 2 | 1 |
| U4 | **3 tables sans `overflow-x-auto`** sur mobile (les guides en ont, certaines pages investir-X non) — texte coupé non scrollable. Fix : wrapper div, 20 min. | `investir-500-euros-mois-etf/page.tsx:447` (sans) vs `:480` (avec) | Mobile UX | 2 | 1 | 1 |
| U5 | **Contraste limite** : `text-gray-400` sur blanc = 4.6:1 (AA juste). ~7 instances sur des textes informatifs. Fix : → `text-gray-500`. | `AllocationClient.tsx:385`, `RecapFiscalClient.tsx` | Accessibilité + finition | 2 | 1 | 1 |
| U6 | **Transitions abruptes blanc ↔ slate-950** (/tarifs, /guide-5-etf-pea-premium) — saut brutal perçu. Fix : bande de transition `bg-gradient-to-b` de 8-12 px (pure CSS, zéro CWV). *Trade-off : certains design systems assument la coupe nette — à trancher visuellement.* | `tarifs/page.tsx:170 vs 236` | Polish | 2 | 1 | 1 |
| U7 | **Focus keyboard absent sur le thumb des sliders** (focus-visible OK sur le number input, pas sur le range). WCAG 2.4.7. Fix CSS. | `globals.css:312-411`, `SliderInput.tsx:122` | Accessibilité | 2 | 1 | 1 |
| U8 | **Hiérarchie typo non systématique** : h1 tantôt `text-2xl font-bold`, tantôt `text-3xl md:text-4xl`, `text-gray-900` vs `text-slate-900`. Fix : règle unique (h1 = `text-3xl md:text-4xl font-bold text-gray-900`) + alignement 1 h. | `strategie-dca/page.tsx:156` vs `tarifs/page.tsx:200` | Cohérence | 2 | 1 | 1 |

**Note images/animations** : aucune des recos ci-dessus n'ajoute d'image raster ni d'animation. Si des illustrations sont ajoutées plus tard (empty states, témoignages) → `next/image` + dimensions explicites + lazy en dessous de la fold, et toute animation derrière `prefers-reduced-motion` (le pattern existe déjà dans `globals.css:311-340`).

---

## 3. FUNNEL & CONVERSION

### 3.1 Parcours simulateur → premium : où ça fuit

| # | Fuite | Preuve | Fix (sans dark pattern) | I | E | R |
|---|---|---|---|---|---|---|
| F1 | **EmailCapture placé APRÈS les ConversionBlocks** — l'user sous tension d'upgrade qui n'est pas prêt à payer part sans laisser d'email. | `SimulatorPageClient.tsx:223` | Intercaler une capture douce avant le paywall Monte Carlo ("Recevez votre simulation par email"). **À A/B tester, pas déplacer brutalement** — le placement actuel peut aussi capter les déçus du paywall. | 4 | 2 | 3 |
| F2 | **/backtest invisible depuis le funnel simulateur** — la feature Premium la plus différenciante n'est référencée ni dans les résultats ni dans les ConversionBlocks (header/footer seulement). | grep /backtest dans SimulatorPageClient → 0 | Ajouter un teaser "Et sur les vraies données 2009-2026 ?" dans les résultats → /backtest. Cohérent avec le positionnement transparence. | 3 | 2 | 2 |
| F3 | **CTA des ConversionBlocks désalignés** avec la douleur évoquée : LossBlock (perte €) → save-strategy, ErrorBlock → monte-carlo, sans logique systématique douleur→feature. | `ConversionBlocks.tsx:152-157, 238-246, 367-372` | Aligner chaque bloc sur la feature qui répond à SA douleur. | 3 | 1 | 2 |
| F4 | **`/payment/success` sous-exploité** — au pic de motivation post-paiement, l'user reçoit un lien vers /simulateur (3 étapes avant la valeur). | `payment/success/page.tsx:74-87` | Onboarding direct : "Sauvegardez votre première stratégie maintenant" avec pré-remplissage. | 2 | 3 | 2 |
| ~~F5~~ | ~~Pages investir-X sans lien simulateur~~ — **CLAIM RÉFUTÉ à la re-vérification (2026-06-10)** : les 4 pages ont déjà un CTA simulateur paramétré (`/simulateur?monthly=X&years=20&return=7&fees=0.2`, ex. investir-100:445). Rien à faire. | sed investir-100:434-455 | n/a | – | – | – |

### 3.2 Maillage guides → comparatif courtiers (question critique — vérifié exhaustivement)

**Verdict : les guides sont des culs-de-sac vers les pages courtiers. 14/14 pages vérifiées (grep + contre-vérification indépendante) : ZÉRO lien vers `/comparatif` (hub courtiers) ou `/comparatif/{trade-republic, boursorama-bourse, fortuneo}`.**

Attention à la confusion d'URL : les guides pointent bien vers `/comparatif-etf` (comparaisons d'ETF) — mais **jamais** vers `/comparatif` (courtiers). Détail :

| Page | Lien vers pages courtiers ? | Note |
|---|---|---|
| `/strategie-dca` | ❌ | **Nomme Boursorama/Trade Republic/Fortuneo en texte (ligne 48) sans aucun lien** — le pire cas : l'intention est là, le lien manque. |
| `/pea-ou-cto` | ❌ | Moment clé "chez quel courtier ouvrir mon PEA ?" → aucun chemin proposé. |
| `/meilleurs-etf-debutants` | ❌ | |
| `/interets-composes` | ❌ | |
| `/guide-5-etf-pea-premium` | ❌ | |
| `/investir-en-etf` | ❌ | Le guide "comment ouvrir un compte" ne pointe pas vers le comparatif de comptes. |
| `/investir-{100,200,300,500}-euros-mois-etf` | ❌ ×4 | |
| `/etf-msci-world`, `/etf-sp500`, `/etf-nasdaq` | ❌ ×3 | `related` pointe comparatif-etf/pea-ou-cto/simulateur seulement. |
| `/etf/[symbol]` (14 fiches) | ❌ | InvestCTA rend `null` tant que `BROKER_CONFIG.enabled=false`. |

**Liens manquants à ajouter (par priorité)** :
1. `/pea-ou-cto` → `/comparatif` au moment "ouvrir un PEA" (l'intention commerciale la plus chaude du site)
2. `/strategie-dca:48` → transformer les noms de courtiers en liens vers leurs fiches
3. `/investir-en-etf` (étape "ouvrir un compte") → `/comparatif`
4. `/etf-msci-world`, `/etf-sp500`, `/etf-nasdaq` → ajouter "Chez quel courtier ?" dans `related`
5. Réciproquement : `/comparatif` et les 3 fiches courtiers → liens retour vers les guides (actuellement quasi unidirectionnel, le hub doit irriguer)

Le maillage **interne aux guides** (guide↔guide, guide→comparatif-etf) est bon — c'est spécifiquement la branche courtiers qui est orpheline. Avec `BROKER_CONFIG.enabled=false` (`broker-config.ts:82`, conforme/prudent), ces liens n'ont **aucun enjeu d'affiliation** aujourd'hui — mais ils construisent le PageRank des fiches courtiers en avance de phase, pour le jour où l'affiliation s'active. **I:4 / E:2 / R:1.**

---

## 4. MCP / OUTILLAGE (rien installé — à toi de décider)

| MCP | Apport concret pour CE projet | Install |
|---|---|---|
| **Vercel** (officiel) — *déjà connecté dans cette session* | Vérifier l'état des deploys après chaque push main, lire les **runtime logs des crons** (winback-emails, onboarding-emails — aujourd'hui invisibles), débugger les erreurs webhook Stripe en prod. | `claude mcp add --transport http vercel https://mcp.vercel.com` |
| **Stripe** (officiel) | Interroger subscriptions/customers/events depuis le chat : "combien de trials actifs ?", "pourquoi ce webhook a échoué ?". Utile dès les premiers paiements réels. | `claude mcp add --transport http stripe https://mcp.stripe.com` |
| **Chrome DevTools** (officiel Google) | **Mesurer les VRAIS Core Web Vitals** (traces LCP/CLS/INP sur la prod) au lieu d'estimations par code — indispensable vu ta contrainte CWV prioritaire. + QA visuelle automatisée. | `claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest` |
| **Google Search Console** (communautaire, ex. `mcp-server-gsc`) | La boucle SEO sans export CSV manuel : requêtes/impressions/CTR par page directement en conversation → décisions title/meta data-driven. Nécessite un service account GCP. | `claude mcp add gsc -- npx mcp-server-gsc` (+ credentials) |
| **Plausible** | Pas de MCP officiel mature. **Recommandation : pas de MCP** — l'API Stats suffit via un petit script (`curl` + clé API) pour lire les events funnel (start_trial, backtest_*, annual_banner_*). | n/a (script) |
| Clerk | Pas de MCP officiel. Les scripts API avec `CLERK_SECRET_KEY` (pattern déjà utilisé par les crons) suffisent. | n/a |

**Priorité** : Chrome DevTools (mesure CWV réelle) > Vercel (logs crons) > GSC (boucle SEO) > Stripe (dès vrais clients).

---

## 5. CONTENU — AJOUTER / RETIRER / AMÉLIORER

### 5.1 À créer (cohérent avec la stratégie SEO existante)

| # | Contenu | Pourquoi | I | E | R |
|---|---|---|---|---|---|
| C1 | **Comparaisons ETF manquantes** : `wpea-vs-dcam` (les deux 0,20 % — LE débat 2025-26), `iwda-vs-cw8` (physique vs synthétique / CTO vs PEA), `ese-vs-psp5` (S&P 500 PEA), `vwce-vs-wpea`. Le format rank déjà (cw8-vs-wpea : 261 imp/mois). | 4 nouvelles pages sur l'arme SEO prouvée du site | 4 | 3 | 1 |
| C2 | **Glossaire : 3 → 15-20 entrées** (PEA, CTO, TER, drawdown, lump sum, réplication physique/synthétique, capitalisant/distribuant, volatilité…). Long-tail facile + maillage interne. Template existant. | `glossaire/page.tsx:21-40` = 3 entrées | 3 | 2 | 1 |
| C3 | **Pages backtest SEO publiques** (`/backtest-covid-2020`, `/backtest-2022-inflation`) avec scénario pré-rempli — top-funnel unique (aucun concurrent FR ne l'a) + vitrine de la feature Premium. | Différenciant outil vs contenu | 3 | 2 | 1 |
| C4 | Pages `investir-50/750/1000-euros-mois-etf` (50 € = micro-DCA débutant ; note : `/investir-1000` redirige 308 vers /investir-en-etf aujourd'hui — à arbitrer). | Long-tail, template existant | 2 | 1 | 1 |

### 5.2 À améliorer

| # | Constat | Preuve | I | E | R |
|---|---|---|---|---|---|
| C5 | **E-E-A-T absent sur ~15 pages à chiffres** (investir-X, etf-sp500/msci-world/nasdaq, allocation, calculateur-fiscal…) : ni ArticleByline ni SourcesReferences. Nuance : sur les **outils** (/simulateur, /calculateur), le bon pattern est plutôt **disclaimer visible + lien /methodologie** qu'une byline d'article. Sur les pages **éditoriales** (investir-X, etf-*), appliquer le pattern complet déjà en place ailleurs. | grep -L ArticleByline → 15 pages | 4 | 2 | 1 |
| C6 | **Fraîcheur** : "JP Morgan Q3 2025" (`allocation-portefeuille/page.tsx:53`), "Last reviewed: 2026-03" (`etf-comparisons.ts:2`), "janvier 2025" sur /a-propos. Pour du YMYL, dater les revues et rafraîchir trimestriellement (TER/encours). | fichiers cités | 2 | 1 | 1 |
| C7 | **`/donnees-marche` en mode démo** par défaut (badge "Mode démo" visible) — soit brancher une vraie clé API provider, soit dé-prioriser la page (la sortir du header). En l'état elle dessert la crédibilité. | `donnees-marche/page.tsx:37` | 2 | 2 | 1 |

### 5.3 À retirer / trancher

| # | Sujet | Recommandation | I | E | R |
|---|---|---|---|---|---|
| C8 | **Triple naming** `/comparatif` (courtiers) vs `/comparatif-etf` (articles) vs `/comparer-etf` (outil) — confusion utilisateur + risque de cannibalisation. **Reco : NE PAS renommer** (le jus SEO de comparatif-etf est l'actif n°1 du site) — différencier plutôt les intentions dans titles/breadcrumbs ("Comparatif des courtiers" / "ETF face à face" / "Outil de comparaison"), et si renommage un jour : seulement `/comparer-etf` → `/comparateur-etf`, avec 308. | Trancher : différencier sans renommer | 2 | 1 | 3* |
| C9 | `/communaute` : quasi 100 % client-side, zéro contenu éditorial SEO. Garder (social proof) mais dé-prioriser ; pas d'investissement avant d'avoir >50 users. | RAS | 1 | 1 | 1 |

*\*Risque 3 = celui du renommage. La variante "différencier sans renommer" est R:1.*

---

## TOP 5 — SI JE NE FAIS QUE 5 CHOSES CE MOIS-CI

| # | Action | Pourquoi elle d'abord | Scores |
|---|---|---|---|
| **1** | **Migrer les fonts vers `next/font/google`** (P2) | Touche le LCP/CLS de TOUTES les pages, 2 h de travail, et c'est ta contrainte n°1 (CWV). | I4 / E2 / R1 |
| **2** | **`dynamic()` sur les 5 composants recharts** (P1) + debounce sliders (P3) | /simulateur est la page de conversion ET la plus lourde (286 kB). −100 kB + INP fluide = le funnel respire. | I4 / E2 / R2 |
| **3** | **Maillage guides → comparatif courtiers** (§3.2) *(F5 retiré : réfuté à la re-vérification — les pages investir-X avaient déjà leur CTA simulateur paramétré)* | 14 pages culs-de-sac vérifiées ; /strategie-dca nomme les courtiers sans liens ; gratuit en risque, prépare l'affiliation. | I4 / E2 / R1 |
| **4** | **`loading.tsx` + `error.tsx` sur les 6 routes critiques** (U1) | Le plus gros écart "amateur vs pro" identifié. Skeletons à dimensions fixes = bonus CLS. | I4 / E2 / R1 |
| **5** | **E-E-A-T sur les pages éditoriales restantes + fraîcheur 2026** (C5+C6) | Le pattern existe (ArticleByline/Sources), il manque sur 15 pages qui donnent des chiffres. YMYL = c'est ce que Google regarde. | I4 / E2 / R1 |

**Mentions honorables (mois suivant)** : comparaisons wpea-vs-dcam + iwda-vs-cw8 (C1), glossaire ×5 (C2), pages backtest SEO (C3), empty states (U3), alignement CTA ConversionBlocks (F3).

---

*Audit produit par 4 agents d'exploration parallèles + 1 vérificateur adversarial (re-vérification indépendante des claims maillage et perf — 17/17 confirmés). Aucune modification de code, aucune installation, aucun push.*
