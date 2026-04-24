# Visual Harmony Audit — v2

Référence: screens 3 & 4 partagés par l'utilisateur.
- **Screen 3** (`TrackingPitch` section home) : `bg-slate-950` + dot grid + radial primary glow + heading blanc + body `slate-300` + eyebrow `primary-300` + card blanche qui pop.
- **Screen 4** (CTA glass `TrackingPitch`) : même bg slate-950 + glass card `bg-white/5 backdrop-blur-sm border-white/10` + badge `bg-primary-500` + CTA primary filled / CTA ghost `bg-white/10 border-white/15`.

Règle du rouge : utilisé UNIQUEMENT sur du texte ou une icône discrète. **Jamais en fond de bloc saturé.** Même règle pour orange/amber (hors disclaimer officiel fintech jaune).

---

## 1. / (homepage)

### TrustSection — icônes multi-tintes saturées
- **File** : `src/components/home/TrustSection.tsx:28-30`
- **Problem** : 4 icon tiles en 4 teintes saturées différentes (`bg-blue-50`, `bg-amber-50`, `bg-purple-50`, `bg-green-50`). Incohérent avec l'approche TrackingPitch qui unifie les icônes en `bg-primary-500/15`.
- **Fix** : 1 seule teinte icon bg (`bg-primary-50` ou `bg-slate-100`), conserver les strokes colorés.

### LiveSocialProof — bg-gray-50/50 semi-transparent sur mesh
- **File** : `src/components/home/LiveSocialProof.tsx:57`
- **Problem** : `bg-gray-50/50` → 50 % alpha laisse leak l'AmbientBackground animé → rendu "pas premium".
- **Fix** : `bg-white` opaque ou `bg-slate-950` si on promeut en Premium-stat band.

### Band "Qui est derrière DCA Tracker ?"
- **File** : `src/app/page.tsx:70-79`
- **Problem** : `bg-slate-50` sandwiché entre TrustSection (slate-50) et FAQ (white) — double stack slate-50 sans rime visuelle.
- **Fix** : supprimer la bande dédiée, lien inline dans FAQ ou Footer.

---

## 2. /simulateur

### SimulatorHero — bloc résultat gradient saturé
- **File** : `src/components/simulator/SimulatorHero.tsx:18-19`
- **Problem** : `bg-gradient-to-br from-primary-700 via-primary-600 to-blue-600` — bloc color saturé bleu, distinct du langage Premium slate-950. C'est le bloc dominant des résultats et il entre en conflit avec les PremiumFix slate-950 qui suivent.
- **Fix** : `bg-slate-950` + radial primary/indigo glows identiques TrackingPitch. Garder le gros number blanc.

### ConversionBlocks — LossBlock (gros fond rouge)
- **File** : `src/components/simulator/ConversionBlocks.tsx:114-165`
- **Problem** : Bloc entier en `bg-red-50 border-red-100`. Rouge saturé sur tout le bloc = violation explicite.
- **Fix** : container neutre (`bg-white border border-slate-200/70`), rouge uniquement sur le `−X €` et l'icône `TrendingDown`.

### ConversionBlocks — TimeShiftBlock (gros fond amber)
- **File** : `src/components/simulator/ConversionBlocks.tsx:198-253`
- **Problem** : `bg-amber-50 border-amber-100` — module de conversion, pas un disclaimer. Gros fond amber = violation.
- **Fix** : container neutre ; amber uniquement sur "X années" et icône `Clock`.

### ConversionBlocks — ErrorBlock (2e gros fond rouge)
- **File** : `src/components/simulator/ConversionBlocks.tsx:338-381`
- **Problem** : 2e `bg-red-50` empilé après le LossBlock. Empilement de gros fonds rouges = la plus grosse violation de la page.
- **Fix** : même traitement que LossBlock.

### noscript fallback (mineur)
- **File** : `src/app/simulateur/page.tsx:83-113`
- **Problem** : `bg-amber-50` est ici un disclaimer légit (JS désactivé) → tolérable.
- **Fix** : aucun.

---

## 3. /tarifs

### Pricing cards — Free vs Premium mismatch
- **File** : `src/app/tarifs/PricingCards.tsx:184-189`
- **Problem** : Free `bg-white`, Premium `bg-slate-950`. User dit explicitement qu'il déteste ce mix sibling.
- **Fix** : 2 options (à trancher ensemble) :
  - **A** : les 2 cards en famille slate-950 (Free = `bg-slate-900` ou glass-variant, Premium = slate-950 + halo/gradient border + badge)
  - **B** : les 2 cards en blanc, Premium se démarque via border primary-600 + subtle glow + badge
- L'option C (celle en prod) "Free white / Premium dark" est exclue.

### "Le plus populaire" badge tronqué
- **File** : `src/app/tarifs/PricingCards.tsx:184-208`
- **Problem** : Card a `overflow-hidden` (l. 185), badge positionné `-top-3` (l. 203). Le badge est clippé par overflow-hidden.
- **Fix** : sortir le badge hors du `overflow-hidden` (le mettre dans le `div.relative` parent), OU retirer `overflow-hidden` et clipper seulement le dot-grid interne.

### Tableau de comparaison
- **File** : `src/app/tarifs/page.tsx:181-223`
- **Problem** : Table `bg-white` sur mesh grid animé, colonne Premium tintée `bg-primary-50/80` mais header `bg-slate-900` → palette mixte. Fragment React `<>` sans `key` (warning mineur, l. 205).
- **Fix** : wrapper section `bg-white` opaque, colonne Premium uniformisée (`bg-slate-900/5` OU primary-50, choisir un seul).

### "Pourquoi un outil payant ?" box
- **File** : `src/app/tarifs/page.tsx:227-241`
- **Problem** : `bg-gray-50` sur la mesh grid animée → rendu "washed-out".
- **Fix** : soit `bg-white` opaque + shadow, soit bloc manifesto slate-950 + texte blanc.

### FAQ accordion
- **File** : `src/app/tarifs/page.tsx:252`
- **Problem** : `bg-white` details sur mesh grid → même problème de leak AmbientBackground.
- **Fix** : wrapper opaque OU promouvoir la page /tarifs entière en "hero slate-950 + section contenu white opaque".

---

## 4. /comparer-etf

### Page sans wrapper de fond
- **File** : `src/app/comparer-etf/page.tsx:54-91`
- **Problem** : Aucun bg page → tout flotte directement sur la mesh animée. Barre filtres, sort, disclaimer = sur mesh nue.
- **Fix** : wrapper page `bg-white` ou `bg-slate-50` opaque pour stopper le leak mesh.

### ETFCard — état "cours indisponible"
- **File** : `src/components/etf/ETFCard.tsx:70-72`
- **Problem** : `bg-red-50` pour erreur + `bg-green-50` pour badge PEA dans la même card → palette pill saturée mélangée.
- **Fix** : error state → `bg-slate-50 text-slate-500` + petite icône rouge seule.

---

## 5. /investir-300-euros-mois-etf

### Hero result block gradient
- **File** : `src/app/investir-300-euros-mois-etf/page.tsx:186-212`
- **Problem** : `from-primary-600 to-blue-700` bloc saturé — même pattern que SimulatorHero, pas aligné slate-950.
- **Fix** : slate-950 + radial primary glow.

### Scenario cards — 3 tiles saturées (orange/primary/emerald)
- **File** : `src/app/investir-300-euros-mois-etf/page.tsx:39-80, 462-498`
- **Problem** : 3 cards siblings en `bg-orange-50`, `bg-primary-50`, `bg-emerald-50` — gros fonds saturés en 3 teintes différentes. Orange = violation du rouge/amber. Pattern répété dans la grid Monte Carlo.
- **Fix** : 1 seul bg neutre (`bg-white border-slate-200`), couleur uniquement sur la valeur et le label percentile.

### A vs B — bloc primary filled vs gray
- **File** : `src/app/investir-300-euros-mois-etf/page.tsx:398-427`
- **Problem** : Strat A `bg-primary-50`, Strat B `bg-gray-50` — sibling mismatch (même famille que Free/Premium tarifs).
- **Fix** : 2 cards neutres, différencier A par un pill "recommandé" uniquement.

### Callout amber sous A vs B
- **File** : `src/app/investir-300-euros-mois-etf/page.tsx:428-439`
- **Problem** : `bg-amber-50` comme insight card (pas disclaimer). Gros fond.
- **Fix** : card neutre, amber seulement sur un petit pill "⚡ insight".

### CTA simulateur block
- **File** : `src/app/investir-300-euros-mois-etf/page.tsx:367-386`
- **Problem** : `bg-primary-600` bloc saturé → conflit avec le CTA slate-950 glass de TrackingPitch (référence).
- **Fix** : reproduire le CTA slate-950 glass de `TrackingPitch.tsx:158-199`.

---

## Shared components

### UpgradePrompt (banner + card)
- **File** : `src/components/ui/UpgradePrompt.tsx:41-119`
- **État** : Déjà aligné reference (slate-950, primary glow, CTA blanc). Pas de déviation.

### ConversionBlocks — PremiumFix
- **File** : `src/components/simulator/ConversionBlocks.tsx:37-73`
- **État** : PremiumFix est correct en slate-950. MAIS il est nested dans les parents Loss/TimeShift/Error en fond rouge/amber → juxtaposition slate-950-sur-red-50 ultra jarring.
- **Fix** : résolu automatiquement quand on fixe les parents.

---

## Résumé

| Catégorie | Nombre | Détail |
|---|---|---|
| **Critical** (gros fond rouge/orange/amber saturé) | 7 | ConversionBlocks Loss + TimeShift + Error ; 300€ scenarios + Monte Carlo ; 300€ A vs B amber callout |
| **Sibling mismatch** (Free vs Premium, etc.) | 3 | Tarifs cards, 300€ A vs B, TrustSection icon tints |
| **Premium identity deviation** (saturé vs slate-950) | 3 | SimulatorHero, 300€ hero, 300€ CTA primary-600 |
| **AmbientBackground bleed** (bg light sur mesh) | 3 | /tarifs "why paid" + FAQ, /comparer-etf global, LiveSocialProof 50 % alpha |
| **Minor** | 2 | Badge "Le plus populaire" clipped, ETFCard error pill red |

**Total : 18 findings**
