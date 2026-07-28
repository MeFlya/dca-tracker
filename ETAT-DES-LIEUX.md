# État des lieux technique — dcatracker.fr

**Date :** 28 juillet 2026 · **Commit analysé :** `716a82b` (7 juillet 2026, = HEAD = prod)
**Méthode :** lecture du code + `curl` du site live + vérification adversariale de l'audit externe.
Chaque affirmation ci-dessous est sourcée (`fichier:ligne` ou commande). Ce qui n'a pas pu être
vérifié est signalé comme tel.

---

## 0. À lire en premier — ce qui change le plan

Cinq constats modifient la mission telle qu'elle est écrite. Ils sont détaillés plus bas, résumés ici.

| # | Constat | Conséquence sur la mission |
|---|---------|----------------------------|
| 1 | **Les 5 routes cron sont publiquement déclenchables en production** (garde fail-open + `CRON_SECRET` absent, confirmé par un `200` non authentifié en live) | Faille active. À corriger **avant** tout le reste — n'importe qui peut déclencher un envoi de masse sur ta liste Resend. |
| 2 | **Le récap fiscal — le produit à 79 € — est à moitié construit** : pas de PDF, pas d'export CSV (les deux sont pourtant promis sur `/tarifs`), cases 2042/2074 calculées seulement si l'utilisateur saisit sa vente à la main, rien n'est persisté | Le Lot 1.3 n'est pas « créer une page produit », c'est **finir le produit**. Chiffrage réel : plusieurs jours, pas une journée. |
| 3 | **Aucune base de données.** Tout vit dans Clerk `privateMetadata`, plafonné à 8 Ko/utilisateur. Mesure : socle 955 o + 142 o/mois → **plafond atteint avant la fin de vie d'un abonné annuel** | Vendre 99 €/an un service qui casse silencieusement en cours d'année est intenable. Une vraie base devient un prérequis, pas un confort. |
| 4 | **Les achats one-shot ne laissent aucune trace** (le webhook ignore volontairement Clerk en mode `payment`) | Rien ne permet aujourd'hui de dire « cet utilisateur a acheté le récap fiscal ». Le produit 79 € a besoin d'un mécanisme d'accès qui n'existe pas. |
| 5 | **Le type `PlanId` est binaire** (`"free" \| "premium"`), et les prix sont en dur dans 10+ fichiers **dont les CGV** | Le passage à 2 paliers est un refactor, pas un changement de chiffres. Et les CGV imposent un préavis de 30 jours aux abonnés. |

---

## 1. Contre-audit : ce que l'audit externe a faux

L'audit Cowork est bon sur la stratégie. Sur les faits, **3 affirmations sur 5 sont fausses ou
trompeuses**. Construire dessus aurait coûté cher.

### ❌ « Les compteurs affichent 0 » — FAUX (tu avais raison)

L'API renvoie `{"users":247,"strategies":180,"monthsLogged":620}` et le composant **se masque
entièrement** si les chiffres sont vides (`LiveSocialProof.tsx:51-52`). Un visiteur ne voit jamais
de zéro. L'audit a probablement lu le HTML brut, où le bloc est absent car rendu côté client.

> **⚠️ Mais j'ai trouvé pire à cet endroit.** Ces chiffres ne sont pas réels : ce sont des
> **planchers codés en dur** (`api/stats/public/route.ts:52-56`), affichés sous un label qui dit
> **« Données réelles · mise à jour toutes les 24h »**. Le commentaire du code parle lui-même d'un
> *« early-stage trick »*, et **ce fichier est lisible publiquement sur GitHub** (HTTP 200 vérifié).
> Pour un site dont l'argument est « transparence totale, aucune boîte noire », sur un sujet YMYL,
> et alors que tu prévois de poster sur r/vosfinances — communauté qui auditera ton repo — c'est
> le risque de crédibilité n°1 du projet. **Décision à prendre (ta décision, pas la mienne).**

### ❌ « `/comparatif-etf` et `/comparer-etf` sont un doublon, fais une 301 » — FAUX

Deux pages de nature différente, aucune ligne de code commune : `/comparer-etf` est le
**comparateur-outil** (grille filtrable de 14 ETF, cours live, ISR 3600 s), `/comparatif-etf` est le
**hub éditorial** des duels. Une 301 détruirait une page fonctionnelle. **À ne pas faire.**

### ❌ « Le glossaire, 14 pages, fusionne-le en une seule + 301 » — FAUX

Il y a **16 URLs** (1 hub + 15 termes), pas 14. Et la fusion+301 est un mauvais conseil pour un site
jeune : perte de pages indexées et d'ancres, contre un gain d'autorité théorique. **Recommandation :
ne pas fusionner**, éventuellement `noindex` les termes les plus faibles.

### ✅ « Tu t'es publiquement engagé à ne jamais faire d'affiliation » — VRAI, et plus fort que décrit

`a-propos/page.tsx:347-353`, sous un titre **« MES ENGAGEMENTS »** et le chapeau *« Tant que je
tiendrai ce projet, voilà ce que je ne ferai jamais »* :

> ✗ *Je ne prendrai pas de commission de broker. Aucun lien d'affiliation sur le site. Si je
> recommande Trade Republic dans le comparatif, c'est parce que leur épargne programmée est
> objectivement le meilleur deal FR, **pas parce qu'ils me versent quoi que ce soit**.*

Trois aggravants que l'audit n'a pas vus :
1. La formulation est **la plus forte possible** (« jamais », durée illimitée).
2. Elle **nomme Trade Republic** — précisément ton premier partenaire probable.
3. L'engagement est aussi dans le **JSON-LD `Organization`** (`a-propos/page.tsx:85` : *« Outil
   indépendant, bootstrappé, sans affiliation »*) — donc indexé par Google, et invisible à l'écran
   (facile à oublier lors du retrait).

Public depuis le 21 avril. **Le repo est public : supprimer la puce en silence produit un diff
`git` embarrassant, prêt à être cité sur un forum.** Voir mes recommandations §6.

*Note : les mentions légales (`mentions-legales:154-161`) anticipent déjà l'affiliation. La
contradiction existe donc **déjà** dans le site aujourd'hui.*

### ⚠️ « `simulateur dca` : 0 clic = problème de title » — TROMPEUR

À la position 8,5 sur 109 impressions, l'espérance est de 1 à 2,7 clics. **La probabilité
d'observer 0 clic par pur hasard est de 7 à 34 %** — c'est du bruit statistique, pas un diagnostic.
Il faudrait ~400-500 impressions avant de conclure. De plus le title **a déjà été réécrit** le
7 juillet (commit `716a82b`) et Google ne l'a pas encore réindexé.

**Le vrai problème, lui, est réel et non détecté par l'audit :** le template `"%s | DCA Tracker"`
(`layout.tsx:49`) porte le title servi à **72 caractères** — « sans inscription », l'argument
différenciant, se fait couper. Et le `<h1>` est *« Projetez votre futur financier »* : ni
« simulateur », ni « DCA ».

---

## 2. Stack et infrastructure

| Élément | État |
|---|---|
| Framework | Next.js **15.5.15**, App Router, React 19.2.5, TypeScript 5.9.3, Tailwind 3.4.19 |
| Hébergement | Vercel (`prj_V6pukhpyVfMlFSlXkE1rO2O5RLJh`), edge `cdg1` |
| Volume | ~44 000 lignes TS · 53 pages · 23 routes API · 86 composants |
| Base de données | **Aucune** — tout dans Clerk `privateMetadata` (voir §4) |
| Tests | **Aucun** (ni jest, ni vitest, ni playwright) |
| CI | 1 seul workflow : rafraîchissement mensuel des données backtest. **Rien ne bloque un déploiement cassé.** |
| Préprod | Aucune (déploiements Vercel preview par branche uniquement) |
| `tsc --noEmit` | ✅ passe sans erreur |

**Source du contenu :** ni MDX ni CMS — **des fichiers TypeScript** dans `src/lib/` :
`etf-comparisons.ts` (931 l, 8 duels), `glossary-terms.ts` (538 l, 15 termes), `brokers.ts` (285 l,
3 courtiers), `products.ts` (319 l, 3 produits), `emails/send.ts` (1074 l, 15 templates).
*Conséquence : toute modification de contenu = un déploiement.*

**Particularités `next.config.ts` :** `distDir: ".next.nosync"` hors Vercel (contournement iCloud),
`outputFileTracingRoot` épinglé, 9 redirections 308, header `X-Robots-Tag`.

### 🔴 Sécurité — 2 points bloquants

1. **Les 5 crons sont publiquement appelables.** Le motif est identique dans les 5 routes :
   `const secret = process.env.CRON_SECRET; if (secret) { …401… }`. Si la variable est absente,
   **tout le contrôle est sauté**. `CRON_SECRET` n'est ni dans `.env.example` ni dans l'env Vercel
   pullé. Vérifié en live : réponse `200` sans authentification.
   → *N'importe qui connaissant l'URL peut déclencher un envoi de masse (facturation Resend,
   réputation d'expéditeur brûlée, utilisateurs spammés).*
2. **`npm audit --omit=dev` : 13 vulnérabilités**, dont **1 critique** (jspdf) et 8 hautes
   (Clerk, Next, postcss, sharp).

Le reste est sain : aucun secret dans l'historique git, webhook Stripe signé (`constructEvent`),
routes utilisateur correctement authentifiées, pas de XSS exploitable.

---

## 3. Stripe, prix et gating — chantier Lot 1

### Ce qui fonctionne
Un plan `premium` unique, 2 price IDs (mensuel/annuel), essai 7 jours côté serveur
(`trial_period_days: 7`), webhook signé qui accorde l'accès via `publicMetadata.plan` sur Clerk.
Le tunnel produits one-shot (Cockpit 19 €) fonctionne : checkout invité, facture automatique,
livraison par email avec liens signés HMAC.

### 🔴 Les 5 obstacles au passage à 2 paliers

| Obstacle | Preuve |
|---|---|
| `PlanId` est binaire | `plans.ts:1` — `type PlanId = "free" \| "premium"` ; `getPlanFromPriceId` mappe **tous** les price IDs sur `"premium"` |
| Pas de point de vérité unique | 1 entrée serveur (`getUserSubscription`) **doublée de ~12 lectures brutes** de `publicMetadata.plan`, dont 6 clients et 4 crons qui contournent la lib |
| Prix en dur | 10+ fichiers, **dont les CGV** (`cgv/page.tsx:77-82`) — qui imposent elles-mêmes un **préavis de 30 jours par email** avant tout changement de prix |
| Aucun entitlement one-shot | `webhooks/stripe/route.ts:54-104` — la branche `payment` envoie l'email et sort, sans jamais toucher Clerk. **Rien ne pourra débloquer un récap fiscal à 79 €** |
| Piège armé | `checkout-lifetime` crée une session `payment` **sans `productId`** → le webhook ne matche aucune branche : **encaisse sans rien accorder**. Latent (flag off) mais dangereux |

### 🔴 Bug de facturation actif
`webhooks/stripe/route.ts:153` : `const activePlan = sub.status === "active" ? plan : "free"`.
Or pendant l'essai, le statut Stripe vaut **`trialing`**, pas `active`.
→ **Tout événement `customer.subscription.updated` pendant l'essai (changement de carte, passage par
le portail) repasse l'utilisateur en gratuit.** À corriger quel que soit le plan tarifaire.

### 🔴 Le récap fiscal — le produit à 79 € — n'est pas fini

| Promesse (`/tarifs`) | Réalité |
|---|---|
| « synthèse PDF » | ❌ Seulement `window.print()` (`RecapFiscalClient.tsx:134`) |
| « export CSV » | ❌ **Zéro occurrence** de CSV dans tout le module |
| « cases 2042 et 2074 calculées » | ⚠️ Uniquement si l'utilisateur coche « j'ai vendu » et saisit 2 montants à la main. Sinon : 4 chiffres, aucune case |
| Données conservées | ❌ Rien n'est persisté — ressaisie à chaque visite, aucun historique pluriannuel |

**Et un bug de calcul :** la durée de détention est comptée en années calendaires depuis le début de
la **stratégie DCA**, pas depuis l'ouverture du PEA (`fiscal/recap.ts:229`) → une stratégie démarrée
en décembre 2021 déclenche la règle des 5 ans dès 2025, avec ~4 ans réels. **Sur un module fiscal
vendu 79 €, sans un seul test unitaire.**

---

## 4. Auth et données utilisateur

**Clerk 7.2.3.** Middleware protégeant `/account(.*)`. ⚠️ En prod, un visiteur non connecté est
redirigé vers le **portail hébergé** `accounts.dcatracker.fr`, pas vers ta page brandée
(`NEXT_PUBLIC_CLERK_SIGN_IN_URL` absente de l'env Vercel) — alors que tous tes emails pointent vers
`dcatracker.fr/account`.

### 🔴 Le plafond de 8 Ko

Aucune base de données. Stratégie, versements mensuels, onboarding, win-back : tout dans
`privateMetadata` Clerk, **plafonné à 8 Ko par utilisateur**.
Mesure sur les structures réelles : **socle 955 o + 142 o par mois enregistré**.
→ Le plafond est franchi **avant la fin de vie d'un abonné annuel**. Au-delà,
`updateUserMetadata` échoue : l'utilisateur ne peut plus enregistrer son mois, avec une erreur
générique « Erreur lors de l'enregistrement ».

**C'est incompatible avec un abonnement à 99 €/an.** Une vraie base (Postgres/Neon/Supabase) devient
un prérequis du Lot 1, pas une optimisation.

### 🔴 Promesses `/tarifs` non tenues

| Vendu | Réalité |
|---|---|
| « Suivi mensuel + **emails personnalisés** » | L'email mensuel n'utilise **jamais** les données réelles : `entries` est déstructuré puis **jamais réutilisé** (`cron/monthly-update/route.ts:58`). Insight générique fonction du seul numéro de mois |
| « **10 simulations sauvegardées** » | Uniquement dans le **localStorage** du navigateur (`saved-simulations.ts:1`). Changement d'appareil ou vidage du cache = tout perdu |
| Monte Carlo / backtest / export PDF | Gatés **côté client uniquement** — un utilisateur gratuit récupère les données via les devtools |
| « Hébergement en Europe » (`sign-in:37`) | ❌ **Faux** : Vercel, Clerk et Resend sont américains — la politique de confidentialité du même site le dit |

**Autre bug :** modifier un mois déjà enregistré est cassé — le modal n'est jamais démonté
(`StrategyTracker.tsx:30`, pas de `key`), son état est figé au premier montage, **il peut écraser le
mauvais mois**.

---

## 5. SEO et mesure

**Sitemap** : généré à la main (`sitemap.xml/route.ts`, `force-static`), **78 URLs**, toutes en 200,
sans doublon. ⚠️ **Les `lastmod` ne sont pas calculés** — ce sont 4 constantes littérales (objet
`REV`), la plus récente au **10 juin**, alors que le dernier commit est du 7 juillet. *Piste
sérieuse pour expliquer pourquoi Google ne relit plus le sitemap : il ne voit aucune fraîcheur.*

**Titles/metas** : `export const metadata` par page + template `"%s | DCA Tracker"` qui ajoute
14 caractères — plusieurs titles dépassent la limite d'affichage à cause de ça.

**Données structurées** : `Article`, `FAQPage`, `BreadcrumbList`, `Product/Offer` présents.
❌ **Aucun `SoftwareApplication`** sur `/simulateur` ni `/backtest` (demandé au Lot 3.1).

**Analytics** : Plausible est bien installé et fonctionnel (chaîne vérifiée de bout en bout).
Sur **40 événements déclarés**, **27 sont réellement émis**. Manquent notamment
`invest_cta_click` et `email_signup` — **les deux qui mesureraient la monétisation**.
→ *Aujourd'hui, impossible de répondre à « quelle page génère des clics sortants ou des inscriptions ».*

**Emails** : 15 templates, plusieurs crons actifs. ❌ **Aucune audience Resend alimentée**
(`RESEND_AUDIENCE_ID` jamais défini) → pas de liste pour annoncer le changement de prix, le récap
fiscal ou l'affiliation. `sendWelcome()` est du code mort.

---

## 6. Affiliation — état réel

**Bonne nouvelle : l'infrastructure est déjà écrite.** `broker-config.ts` (config + `disclosureText`
conforme), `AffiliateDisclaimer.tsx` (mention pré-clic), `InvestCTA.tsx` (boutons en
`rel="sponsored"`).

**Ce qui manque :**
1. `broker-config.ts:83` → `enabled: false`, `partners: []` (4 partenaires en commentaire avec
   `[À REMPLIR PAR MAEL]`).
2. Aucun champ `affiliateUrl` sur le type `BrokerData`.
3. **`<InvestCTA />` n'est monté que sur 2 pages** (`/simulateur`, `/etf/[symbol]`) — **pas sur les
   3 fiches courtiers ni sur `/comparatif`**, les pages les plus intentionnistes.
   → *Flipper `enabled: true` n'activerait rien là où ça compte.*
4. Les 4 mentions « DCA Tracker n'est pas affilié » (3 fiches + `/comparatif:224`).
5. L'engagement public de `/a-propos` (§1) + le JSON-LD.

**Ma recommandation sur l'engagement** (c'est ta décision, je documente l'option la moins risquée) :
ne pas supprimer la puce, **la réécrire**. Garder les 2 autres engagements (données, conseil
personnalisé) qui restent tenables, et remplacer « aucun lien d'affiliation » par un engagement
**plus fort et tenable** : classement jamais payant, mention « lien affilié » systématique avant le
clic, aucun courtier ne peut acheter sa place. C'est exactement ce que `disclosureText` promet déjà.
Retirer la phrase nominative sur Trade Republic est non négociable. Et publier un **changelog daté**
plutôt que de laisser découvrir le diff.

---

## 7. Ce que je recommande de changer dans le plan

1. **Insérer un Lot 0 « sécurité et vérité »** avant tout : `CRON_SECRET`, `npm audit`, décision sur
   les planchers de social proof, correction du bug Premium-pendant-l'essai, retrait de
   « Hébergement en Europe ».
2. **Le Lot 1.3 (récap fiscal 79 €) n'est pas une journée** : c'est finir un produit inachevé
   (PDF, CSV, persistance, correction du calcul de durée, tests). Vendre en l'état exposerait à des
   remboursements et à un risque de réputation sur un sujet fiscal.
3. **Ajouter une migration de base de données** au périmètre, sinon le palier 99 €/an casse en cours
   d'année.
4. **Ne pas faire** les 301 glossaire et `/comparer-etf` (§1).
5. **Ne pas retoucher le title de `/simulateur`** — sauf pour corriger la troncature du template.
   Le remodifier remettrait la mesure à zéro.
6. **Avant d'augmenter les prix** : honorer les promesses `/tarifs` non tenues (emails
   personnalisés, simulations sauvegardées côté serveur) — sinon on double le prix d'un produit qui
   ne fait pas ce qu'il annonce.

---

## 8. Ce qu'il me faut de toi pour continuer

| # | Décision attendue |
|---|---|
| 1 | **Planchers de social proof** : on les retire, on les assume publiquement, ou on les garde ? |
| 2 | **Base de données** : on migre (recommandé) ou on reste sur Clerk avec le risque documenté ? |
| 3 | **Récap fiscal** : on le finit avant de le vendre 79 € (recommandé), ou on vend une v1 réduite avec une promesse réécrite ? |
| 4 | **Engagement `/a-propos`** : réécriture + changelog (recommandé) ou autre approche ? |
| 5 | **Ligne de démarcation 49 €/99 €** — à valider (proposition dans ma réponse) |
| 6 | Confirmation du workflow **branche + PR par lot** (jusqu'ici on poussait direct sur `main`) |

---

*Aucune modification n'a été faite sur le code. Ce document est le livrable 1 de la mission.*
