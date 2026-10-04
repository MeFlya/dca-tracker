# Vidéo d'accueil de dcatracker.fr : scénario et storyboard

Version 1, 2 octobre 2026. À valider par Maël avant tout rendu.

Décision de Maël (02/10/2026) :

- **Boucle muette** de 15 à 20 s dans le bandeau d'accueil, à côté du titre (qui reste du vrai texte HTML). Elle démarre seule, sans son.
- Un bouton **« Regarder avec le son »** ouvre la **version complète** d'environ 30 s, avec une musique libre de droits fournie plus tard (`public/musique.mp3`, absente pour l'instant) et des effets sonores discrets synthétisés par un script Node (aucun fichier externe).

Règles appliquées à chaque image :

- **Vouvoiement**, aucun conseil en investissement (le site n'a pas le statut de CIF).
- **Aucun chiffre inventé.** Chaque chiffre affiché vient d'une capture du site en production (`public/captures/`, valeurs relevées dans `public/captures/textes.json`) ou du code (`src/lib/products.ts`, `src/lib/plans.ts`, `src/lib/tarifs-affiches.ts`).
- Pas de superlatif (« le meilleur »…), pas de fausse urgence.
- La section 7 rattache chaque texte affiché à sa source.

---

## 1. Ce que le site propose vraiment

Relevé dans le code et sur le site en production le 02/10/2026. Les phrases entre guillemets sont celles du site.

| Fonction | Page | Accès | Ce qu'elle fait (phrase du site) | Source |
|---|---|---|---|---|
| Simulateur DCA | `/simulateur` | **Gratuit, sans inscription** | « Versement mensuel, durée, rendement : projection immédiate avec intérêts composés et 3 scénarios de marché. » | `src/app/simulateur/page.tsx` (DESCRIPTION) |
| Résultat par défaut du simulateur | `/simulateur` | Gratuit | Pour 200 €/mois pendant 20 ans, à 7 %/an avant frais et 0,38 % de frais : **97 753 €** pour 48 000 € versés. « Scénario central : hypothèse de 7,00 %/an avant frais, pas une prévision ». Les 3 scénarios donnent 78 140 € (5 %), 97 753 € (7 %) et 123 095 € (9 %). | capture `simulateur-bureau-resultat.png`, `textes.json` |
| Carte de démonstration de l'accueil | `/` | Gratuit | 4 montants × 3 durées, « 7 %/an, frais de 0,38 % déduits » (200 €/mois · 20 ans : 97 800 € projetés, valeur arrondie) | `HeroDemoCard.tsx`, `textes.json` (les 12 combinaisons). **Historique : plus lue depuis le 04/10/2026** (la boucle remplace la carte dans le bandeau ; les frais se lisent dans le code du site, voir la section 8) |
| Comparateur d'ETF | `/comparer-etf` | Gratuit | « 19 ETF analysés — monde, USA, Europe, émergents, small cap, obligations. Filtrez par région, éligibilité PEA ou niveau de frais. » Le filtre « PEA uniquement » en laisse 8. | `textes.json` |
| Liste des ETF éligibles au PEA | `/etf-eligibles-pea` | Gratuit | « 13 ETF éligibles au PEA, vérifiés un par un avec leur ISIN et leurs frais. Et 10 fonds qui ne le sont pas, avec la raison pour chacun. » Vérifiée le 28 septembre 2026. | `textes.json`, `src/lib/etf-pea-verifies.ts` |
| Calculateur fiscal PEA vs CTO | `/calculateur-fiscal-pea-cto` | Gratuit (inclus dans le plan Gratuit de `/tarifs`) | « PEA ou CTO : combien d'impôt sur votre DCA ETF ? » 18,6 % de prélèvements sociaux pour un PEA de plus de 5 ans, PFU de 31,4 % sur un CTO. | `textes.json` |
| Article fiscalité 2026 | `/fiscalite-pea-cto-2026` | Gratuit | « Gains d'un PEA ou d'un CTO : 18,6 % de prélèvements sociaux en 2026, soit 1,4 point de plus, et un PFU de 31,4 %. » | `page.tsx` (DESCRIPTION) |
| Modèle de suivi gratuit | `/suivi-pea-excel` | **Gratuit**, reçu par email | « Le journal des achats et la vue par ETF (PRU frais inclus, valeur, plus-value, poids), en Excel et Google Sheets. » Pas de TRI, de versement du mois ni de feuille PEA. | `textes.json`, tableau des onglets de la page |
| Cockpit DCA (classeur) | `/produits/template-suivi-dca` | **19 €, paiement unique** | « Suivez votre PEA en 2 min/mois : PRU, TRI annualisé, plus-value — et chaque mois, où verser pour rester aligné. » 8 onglets, 1 000 lignes, 10 ETF au plus, Excel et Google Sheets. | `src/lib/products.ts` (`priceEur: 19`, metaDescription, chiffresCles) |
| Guide PDF « Démarrer le DCA en France » | `/produits/guide-demarrer-dca` | **19 €** | PDF de 63 pages : « De zéro à votre premier investissement, puis une routine mensuelle qui tient dans la durée. » | `products.ts` (`GUIDE_PRIX`, `GUIDE_PAGES`) |
| Pack Démarrage (guide + Cockpit) | `/produits/pack-demarrage-dca` | **33 €** (38 € séparément) | « Comprendre, démarrer, piloter : le pack complet. » | `products.ts` (`BUNDLE_PRIX`) |
| Backtest MSCI World | `/backtest` | Exemples gratuits. **L'outil interactif est réservé à Premium.** | « L'outil interactif, qui rejoue votre montant et votre période, fait partie de l'abonnement Premium. » Cours réels depuis janvier 2008. | `backtest/page.tsx` (FAQ) |
| Premium | `/tarifs` | **4,90 €/mois ou 49 €/an** (4,08 €/mois), **essai de 7 jours** | Suivi mensuel de stratégie et emails personnalisés, récap fiscal annuel (cases 2042 et 2074), Monte Carlo (1 000 scénarios), backtest sur les vrais cours depuis 2008, comparaison A vs B, 10 simulations sauvegardées, PDF sans filigrane | `plans.ts` (`PREMIUM_PRIX_MENSUEL_EUR = 4.9`, `PREMIUM_ESSAI_JOURS = 7`), `tarifs-affiches.ts` (`PREMIUM_ANNUEL_EUR = 49`), `textes.json` |
| Guides, glossaire, données de marché | `/glossaire`, `/donnees-marche`… | Gratuit | « Cours indicatifs de vos ETF préférés. Source et délai toujours affichés. » | `Features.tsx` |

**Conséquences pour le scénario :**

- On peut écrire « gratuit, sans inscription » à propos du **simulateur** seulement.
- Le **suivi mensuel en ligne** est payant (Premium).
- Le **suivi dans un tableur** se fait avec le modèle gratuit (journal et vue par ETF) ou avec le Cockpit à 19 € (tout le reste).
- « 19 ETF » désigne le comparateur. « 13 ETF éligibles au PEA » désigne la liste vérifiée. On ne mélange pas les deux.

---

## 2. Charte (règle de Maël : jamais de logo ni de style inventé)

**Logo.** `public/logo/logomark.svg` est la copie exacte de `src/components/ui/LogoMark.tsx` :

- carré 28×28 à coins de 7, rempli en #1d4ed8 ;
- courbe blanche `M5 21 Q9 21 13 15 Q17 9 22 6.5` (trait 2,5, bouts ronds) ;
- point blanc r = 2,5 en (22 ; 6,5).

Le nom suit `LogoWordmark` : « DCA » en Inter gras #111827 (gray-900), puis « Tracker » en Inter normal #6b7280 (gray-500), avec une marge de 0,25 em.

Le site ne définit pas de version claire du logo pour un fond sombre. Le nom est donc **toujours posé sur une carte blanche** (le composant « carte blanche sur fond sombre » de la section `TrackingPitch` de l'accueil), jamais recoloré.

**Polices.**

- **Newsreader** (titres) : gras 700, interlettrage −0,02 em, `font-optical-sizing: auto`, comme les h1/h2 de `globals.css`.
- **Inter** (texte, chiffres) : 500, 600 ou 700, chiffres tabulaires (`tabular-nums`) pour les compteurs.
- Surtitres : Inter 600 en capitales, `tracking-widest`.
- Les deux polices sont sous licence SIL OFL et passent par npm (`@fontsource/inter`, `@fontsource/newsreader`, ou `@remotion/google-fonts`), sans téléchargement manuel.

**Couleurs** (`tailwind.config.ts` + palette Tailwind 3.4) :

| Rôle | Valeur |
|---|---|
| Bleu de marque (primary-600) | #1d4ed8 |
| Surtitre sur fond sombre (primary-300) | #93c5fd |
| Bleus d'accent (primary-400 / 500) | #60a5fa / #3b82f6 |
| Fond sombre (slate-950) | #020617 |
| Cartes sombres (slate-900 / 800) | #0f172a / #1e293b |
| Texte principal sur fond sombre | #ffffff |
| Texte secondaire sur fond sombre (slate-300 / 400) | #cbd5e1 / #94a3b8 |
| Gain sur fond sombre (emerald-400, coches de /tarifs) | #34d399 |
| Gain sur fond clair (gain) | #059669 |
| Halo (indigo-500) | #6366f1 |

**Fond des deux vidéos.** Il reprend la section sombre « Un cockpit qui grandit avec votre DCA » (`TrackingPitch.tsx`), mise à l'échelle de l'image :

- slate-950 ;
- `radial-gradient(900px circle at 10% 15%, rgba(59,130,246,0.25), transparent 50%)` ;
- `radial-gradient(700px circle at 90% 85%, rgba(99,102,241,0.20), transparent 55%)` ;
- trame de points blancs de 1 px, au pas de 24 px, à 5 % d'opacité.

C'est aussi le style de `/tarifs` et du haut de la page Cockpit.

**Cartes.**

- **Captures du site :** fond blanc, coins `rounded-2xl` (16 px à l'échelle du site), bordure slate-200 à 60 %, ombre `shadow-card-lg` (`0 10px 15px -3px rgb(0 0 0 / .06), 0 4px 6px -4px rgb(0 0 0 / .04)`). Dessous, le halo de `TrackingPitch` : dégradé `primary-500/30 → indigo-400/20 → sky-400/20`, flou 40 px.
- **Captures du classeur :** elles gardent la fenêtre du site (pastilles grises + nom de fichier), déjà présente dans `cockpit-bureau-fenetre-versement.png`.

**Mouvement** (jetons de `globals.css`) :

- Entrées en `ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)`.
- Mouvements courants en `ease-out-quart` `cubic-bezier(0.25, 1, 0.5, 1)`.
- Changements d'état en `ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)`.
- Apparition des textes comme `data-reveal` : opacité 0 → 1 et montée de 26 px (à l'échelle du site).
- Décalage entre éléments d'une même série : 4 images.
- **Interdits** (le commentaire de `globals.css` les écarte) : rebond, élastique, glitch, néon, confettis.

**Fil conducteur.** Le **point blanc du logo** (le « marqueur » du tracker, selon le commentaire du composant) sert de transition. Il glisse d'un plan à l'autre et se pose sur l'élément à lire. C'est le seul ornement : aucun pictogramme inventé.

---

## 3. Formats

| | Boucle muette | Version complète |
|---|---|---|
| Où | Bandeau d'accueil, colonne de droite (environ 480 px de large sur ordinateur, pleine largeur sur mobile) | Fenêtre ouverte par « Regarder avec le son » |
| Taille | **1080×1080** (1:1) | **1920×1080** (16:9) |
| Cadence | 30 i/s | 30 i/s |
| Durée | **540 images = 18 s** | **900 images = 30 s** |
| Son | Aucune piste audio (lecture automatique muette, `playsinline` sur iOS) | `public/musique.mp3` (fournie par Maël) + effets sonores générés |
| Export | MP4 H.264 yuv420p, objectif 2,5 Mo au plus, et WebM VP9 ou AV1 ; affiche (poster) en WebP | MP4 H.264 + AAC 160 kb/s 48 kHz, objectif 8 Mo au plus |

**Lisibilité.**

- Dans la boucle, un titre fait **84 à 96 px** sur 1080, soit environ 40 px une fois la vidéo réduite à 480 px de large. Le texte secondaire fait 36 à 40 px au moins, soit environ 13 px à la largeur d'un mobile (358 px).
- Marge de sécurité : 80 px sur les quatre bords.

**Outil de rendu proposé :** Remotion (React, rendu image par image, son placé à l'image près). Licence gratuite pour un indépendant. Ce n'est pas installé : ce lot ne fait que le scénario et les visuels.

---

## 4. Boucle muette (1080×1080, 540 images, 18 s)

Elle se comprend sans le son, et chaque plan porte son texte. Pour que la boucle se referme sans à-coup :

- l'image 539 est **identique** à l'image 0 ;
- un plan fixe de 15 images, au début (0 à 14) et à la fin (525 à 539), absorbe la reprise.

Cela donne une ouverture, cinq plans et une fermeture identique à l'ouverture.

### B0. Image d'accroche (images 0 à 14, 0,5 s), identique à la fin

- **Visuel :** fond sombre (section 2). Au centre, une carte blanche de 560×200 px, coins de 40 px, ombre `shadow-card-lg` et halo. Elle contient le **LogoMark** (112 px) et le nom « DCA Tracker » (Inter 64 px, couleurs du site).
- **Mouvement :** aucun.
- **Texte :** aucun en dehors du nom.

### B1. La question (images 15 à 119, 3,5 s)

- **Texte :**
  - « **Investir chaque mois en ETF ?** » : Newsreader 88 px blanc, centré, à 300 px du haut.
  - En dessous : « **Combien, lesquels, et comment suivre ?** » (Inter 40 px, slate-300).
- **Visuel et mouvement :**
  - 15 → 35 : le nom s'efface (opacité 1 → 0 en 12 images). La carte blanche se resserre sur le LogoMark (`ease-in-out`), puis le carré bleu s'efface.
  - 30 → 60 : la **courbe blanche du logo** reste seule et s'agrandit jusqu'à couvrir la largeur de l'image (environ 860 px), en bas du cadre. Le point blanc reste au bout de la courbe.
  - 35 → 50 : le titre apparaît (opacité + montée de 26 px, `ease-out-quart`). Le sous-titre suit, décalé de 4 images.
  - Les textes restent jusqu'à 108, puis sortent de 108 à 119 (opacité → 0, montée de 12 px).
- **Son :** aucun.

### B2. Simuler (images 120 à 239, 4 s)

- **Texte :**
  - « **Simulez votre DCA** » : Newsreader 84 px blanc, aligné à gauche, à 120 px du haut.
  - Compteur « **97 753 €** » : Inter 700, 132 px blanc, chiffres tabulaires.
  - En dessous : « **200 €/mois pendant 20 ans** » (Inter 38 px, slate-300).
  - Mention fixe en bas de l'image : « **Hypothèse de 7 %/an avant frais, pas une prévision** » (Inter 34 px, slate-400).
- **Visuel :** `simulateur-bureau-graphique.png` (carte blanche « Évolution du portefeuille », 944×916, ramenée à 620 px de large). Elle porte déjà la mention « Projection hypothétique — pas une garantie de rendement ».
- **Mouvement :**
  - 120 → 140 : la courbe blanche de B1 se fond dans la courbe bleue « Base » de la carte. La carte monte du bas du cadre (`ease-out-expo`), en débordant volontairement de la bordure basse.
  - 140 → 185 : un masque découvre le graphique de gauche à droite, comme si les courbes se traçaient. **En même temps**, le compteur défile de 0 à 97 753 € (`ease-out-expo` ; la dernière valeur s'affiche à l'image 185).
  - Le point blanc se pose sur l'extrémité de la courbe « Base » à l'image 185 et y reste.
  - 225 → 239 : tout glisse de 80 px vers la gauche en s'effaçant.
- **Chiffres :** 97 753 € et 200 €/mois · 20 ans · 7 %/an avant frais, relevés sur le simulateur (`textes.json` → `simulateur.resultat`).

### B3. Comparer les ETF (images 240 à 344, 3,5 s)

- **Texte :**
  - « **Comparez 19 ETF** » : Newsreader 84 px blanc, à 120 px du haut.
  - En dessous : « **Frais, réplication, éligibilité PEA** » (Inter 38 px, slate-300).
- **Visuel :** `comparer-etf-bureau-carte-wpea.png`, `-carte-dcam.png` et `-carte-cw8.png` (778×1126 chacune, ramenées à 340 px de large). Elles sont posées en éventail : la carte du milieu devant, les deux autres tournées de ±4°, décalées de 230 px.
- **Mouvement :**
  - 245 → 275 : les trois cartes montent l'une après l'autre (décalage de 4 images, montée de 60 px, `ease-out-expo`).
  - 290 → 320 : un anneau primary-300 de 3 px entoure **le badge vert « PEA »** de chaque carte. Il se trouve à environ (664–714 ; 108–140) px dans chaque capture : position à mesurer au rendu. L'anneau monte de 0 à 1 d'opacité, puis redescend à 0,6. Le point blanc saute d'un badge à l'autre.
  - 330 → 344 : sortie vers la gauche.

### B4. Suivre son PEA (images 345 à 449, 3,5 s)

- **Texte :**
  - « **Suivez votre PEA** » : Newsreader 84 px blanc, à 120 px du haut.
  - En dessous : « **Chaque mois, dans Excel ou Google Sheets** » (Inter 38 px, slate-300).
  - Légende en bas à gauche : « **Exemple pré-rempli** » (Inter 30 px, slate-400). Les montants du classeur sont un jeu de démonstration.
- **Visuel :** `cockpit-bureau-fenetre-versement.png` (2216×840). C'est la fenêtre « Cockpit-DCA-PEA_dcatracker.xlsx · Versement du mois », ramenée à 960 px de large.
- **Mouvement :**
  - 345 → 370 : la fenêtre monte du bas (`ease-out-expo`), avec une légère perspective qui se redresse (rotation X de 8° à 0°).
  - 380 → 395 : un anneau primary-600 entoure la case « **300,00 €** » (« Montant à verser ce mois-ci »).
  - 395 → 420 : un second anneau, primary-300, parcourt la colonne verte « **≈ Parts à acheter** » de haut en bas. Le point blanc la suit.
  - 435 → 449 : la fenêtre recule (échelle 1 → 0,92, opacité → 0).
- **Note :** on ne cite **aucun** montant du classeur. C'est un jeu de démonstration, passé aux cours réels le 02/10/2026 (commit `dd0c363`, déployé pendant ce lot ; les captures ont été refaites après). Ses valeurs dépendent de la date. Relancer `npm run captures` juste avant le rendu.

### B5. Fin sur le logo (images 450 à 539, 3 s)

- **Texte :**
  - Récapitulatif sur trois lignes centrées, Newsreader 84 px blanc : « **Simulez.** » / « **Comparez.** » / « **Suivez.** »
  - Puis la carte du nom (B0).
- **Mouvement :**
  - 452 → 480 : les trois mots apparaissent l'un après l'autre (décalage de 8 images, montée de 26 px).
  - 470 → 490 : la carte blanche du nom apparaît sous le récapitulatif, à 780 px du haut (échelle 0,92 → 1, opacité 0 → 1, `ease-out-expo`).
  - 500 → 515 : le récapitulatif s'efface (opacité → 0, montée de 12 px).
  - 505 → 525 : la carte remonte au centre exact de l'image (`ease-in-out`).
  - 525 → 539 : image fixe, **identique pixel pour pixel à l'image 0**. À vérifier en comparant les rendus des images 0 et 539.

**Affiche (poster) de la boucle** : l'image 200 (B2 : titre, compteur arrivé, graphique). Elle sert aussi d'image fixe si `prefers-reduced-motion` est actif.

---

## 5. Version complète avec son (1920×1080, 900 images, 30 s)

Même univers que la boucle, avec plus d'explications. Elle est calée sur la musique avec un tempo par défaut de **120 BPM** :

- 1 temps = 15 images ;
- 1 mesure (4 temps) = 60 images ;
- 30 s = 15 mesures = 60 temps.

**Calage sur la musique de Maël :**

- Toutes les positions sont notées en **temps**.
- La conversion en images est `round(temps × 1800 / BPM)`, avec un seul `BPM` et un décalage `debut_premier_temps_ms` à régler une fois la musique connue.
- À 110 BPM, la vidéo dure 32,7 s ; à 125 BPM, 28,8 s.
- Les coupes tombent sur un temps fort (1 ou 3 de la mesure).

Mise en page générale :

- textes dans la colonne de gauche (x de 120 à 820) ;
- captures à droite (x de 900 à 1800), sauf indication contraire ;
- surtitres : Inter 600, 26 px, capitales, primary-300 ;
- titres : Newsreader 700, 96 px ;
- sous-titres : Inter 500, 40 px, slate-300 ;
- mentions : Inter 30 px, slate-400.

| Plan | Images | Temps | Mesures |
|---|---|---|---|
| C1 Logo | 0 – 89 | 0 – 5 | 1 – 2.2 |
| C2 Questions | 90 – 179 | 6 – 11 | 2.3 – 3 |
| C3 Simuler | 180 – 359 | 12 – 23 | 4 – 6 |
| C4 Comparer | 360 – 479 | 24 – 31 | 7 – 8 |
| C5 Liste PEA vérifiée | 480 – 569 | 32 – 37 | 9 – 10.2 |
| C6 PEA ou CTO | 570 – 629 | 38 – 41 | 10.3 – 11.2 |
| C7 Suivre dans un tableur | 630 – 749 | 42 – 49 | 11.3 – 13.2 |
| C8 Premium | 750 – 839 | 50 – 55 | 13.3 – 14 |
| C9 Fin | 840 – 899 | 56 – 59 | 15 |

### C1. Logo (images 0 à 89, temps 0 à 5)

- **Visuel et mouvement :**
  - 0 → 12 : le LogoMark (180 px, centré) apparaît (échelle 0,8 → 1, opacité, `ease-out-expo`).
  - 8 → 38 : sa courbe blanche se trace, en animant `stroke-dashoffset` comme `animate-draw-line` du site.
  - **45** (temps 3) : le point blanc apparaît au bout de la courbe.
  - 50 → 70 : la carte blanche s'ouvre à l'horizontale depuis le logo et découvre « DCA Tracker ».
  - 60 → 89 : le surtitre apparaît sous la carte.
- **Texte :** surtitre « **Le cockpit DCA pour investisseurs long-terme** », la pastille du haut de l'accueil, mot pour mot.
- **Son :** `whoosh-doux` de 0 à 21 ; `pop` à **45** ; `note-1` à **60**.

### C2. Les questions (images 90 à 179, temps 6 à 11)

- **Texte** (Newsreader 88 px blanc, aligné à gauche, une ligne par question) :
  1. « **Combien peut valoir votre DCA ?** » (apparaît à 90, temps 6)
  2. « **Quels ETF, avec quels frais ?** » (105, temps 7)
  3. « **Comment le suivre ?** » (120, temps 8)
- **Visuel :**
  - 90 → 100 : la carte du nom remonte et sort.
  - La courbe du logo, agrandie, traverse le bas de l'image comme dans la boucle (B1).
- **Mouvement :**
  - Chaque question monte de 26 px et s'affiche en 10 images.
  - Le point blanc se place devant la question en cours.
  - Sortie de 168 à 179.
- **Son :** `clic` à 90, 105 et 120 ; `whoosh-court` à 168.

### C3. Simuler (images 180 à 359, temps 12 à 23, trois mesures)

- **Texte :**
  - Surtitre : « **Simulateur · gratuit, sans inscription** »
  - Titre : « **Simulez votre DCA** »
  - Compteur : « **97 753 €** » (Inter 700, 168 px, chiffres tabulaires)
  - Sous le compteur : « **200 €/mois · 20 ans · 48 000 € versés** »
  - Puis, de 300 à 359 : « **3 scénarios : 5 %, 7 % et 9 % par an avant frais** »
  - Mention fixe en bas, de 240 à 359 : « **Hypothèse de 7 %/an avant frais, pas une prévision. Frais de l'ETF (0,38 %) déduits.** »
- **Visuel et mouvement :**
  - **Mesure 4 (180 → 239)** : `simulateur-bureau-parametres.png` (800×2044), recadrée de y = 0 à y = 1150 (du titre « Paramètres » au curseur « Rendement annuel brut »), entre par la droite. Un anneau primary-600 se pose sur la valeur **200** (195, temps 13), puis **20** (210, temps 14), puis **7** (225, temps 15).
  - **Mesure 5 (240 → 299)** : le panneau glisse vers la droite et s'efface. Le compteur défile de 0 à 97 753 € entre 240 et **270** (temps 18), en `ease-out-expo`. À droite, `simulateur-bureau-graphique.png` se découvre par un masque de gauche à droite, synchronisé avec le compteur.
  - **Mesure 6 (300 → 359)** : `simulateur-bureau-scenarios.png` (1568×404, ramenée à 1100 px) monte sous le compteur. Les trois colonnes s'allument tour à tour : Conservateur à 300, Base à 315, Optimiste à 330, chacune avec un anneau primary-300 qui reste 15 images. Le point blanc saute de l'une à l'autre.
- **Son :** `clic` à 195, 210 et 225. Un `tic` toutes les 3 images de 240 à 267 (gain qui baisse de −24 à −30 dB). `note-2` à **270**. `note-1`, `note-2` et `note-3` à 300, 315 et 330. `whoosh-court` à 350.

### C4. Comparer (images 360 à 479, temps 24 à 31)

- **Texte :**
  - Surtitre : « **Comparateur** »
  - Titre : « **Comparez 19 ETF** »
  - Sous-titre : « **Frais, réplication, ISIN, éligibilité PEA** »
- **Visuel et mouvement :**
  - 360 → 375 : la barre de filtres `comparer-etf-bureau-filtres.png` (2480×288, ramenée à 1500 px) descend en haut à droite.
  - **390** (temps 26) : fondu de 6 images vers `comparer-etf-bureau-filtres-pea.png`. L'interrupteur « PEA uniquement » passe au bleu et le compteur « 19 ETFs » devient « 8 ETFs ». C'est un vrai changement d'état, capturé sur le site.
  - **405, 420 et 435** (temps 27 à 29) : les cartes WPEA, DCAM et CW8 montent l'une après l'autre sous la barre (340 px de large chacune, côte à côte).
  - 450 → 470 : anneaux primary-300 sur les badges « PEA » (comme B3).
- **Son :** `whoosh-court` à 360 ; `clic` à **390** ; `note-1`, `note-2` et `note-3` à 405, 420 et 435 ; `whoosh-court` à 470.

### C5. La liste PEA vérifiée (images 480 à 569, temps 32 à 37)

- **Texte :**
  - Surtitre : « **Vérifiée le 28 septembre 2026** ». Cette date est lue dans `textes.json` au moment du rendu : si la liste est revérifiée, le surtitre suit.
  - Titre : « **13 ETF éligibles au PEA** »
  - Sous-titre : « **Vérifiés un par un, avec leur ISIN et leurs frais** »
- **Visuel :** `etf-eligibles-pea-bureau-msci-world.png` (1456×1092 : tableau CW8, DCAM, EWLD, WPEA ; colonnes ISIN, frais, réplication, dividendes), ramenée à 820 px de haut.
- **Mouvement :**
  - 480 → 495 : le tableau monte.
  - 510 → 550 : une bande primary-300 à 12 % d'opacité descend la colonne **ISIN**, ligne par ligne, une ligne par temps (510, 525, 540).
- **Son :** `clic` à 510 ; `tic` à 525 et 540 ; `whoosh-court` à 560.

### C6. PEA ou CTO (images 570 à 629, temps 38 à 41)

- **Texte :**
  - Titre : « **PEA ou CTO ?** »
  - Sous-titre : « **Le calculateur fiscal compare l'impôt** »
- **Visuel :** `calculateur-fiscal-bureau-taux.png` (1408×356), ramenée à 1000 px. C'est le paragraphe du site : 18,6 % de prélèvements sociaux pour un PEA de plus de 5 ans, PFU de 31,4 % sur un CTO, 12,8 points d'écart.
- **Mouvement :**
  - Zoom lent de 1 à 1,05.
  - À 585, soulignement primary-300 sous « **18,6 %** » ; à 600, sous « **31,4 %** ».
- **Son :** `clic` à 585 et 600.
- **Exclu :** la carte « Le PEA vous fait économiser 6 368 € » (`calculateur-fiscal-bureau-resultat.png`). Hors de son contexte, ce chiffre (réglages par défaut du calculateur) se lirait comme une recommandation d'enveloppe.

### C7. Suivre dans un tableur (images 630 à 749, temps 42 à 49)

- **Texte :**
  - Surtitre : « **Excel et Google Sheets** »
  - Titre : « **Suivez votre PEA** »
  - Étiquette 1 (pastille blanche à 10 %, bordure blanche à 15 %, comme le bouton secondaire de `TrackingPitch`), de 640 à 700 : « **Modèle gratuit : journal des achats et vue par ETF** »
  - Étiquette 2, de 700 à 749 : « **Cockpit DCA · 19 €, paiement unique** »
  - Sous-titre, de 700 à 749 : « **Le versement du mois, en parts entières** »
  - Mention, de 715 à 749 : « **Calcul sur l'allocation que vous fixez, pas un conseil** », reprise de la légende du site.
- **Visuel et mouvement :**
  - 630 → 650 : `suivi-pea-excel-bureau-transactions.png` (1456×1100 : onglet Transactions, identique dans le modèle gratuit et le Cockpit, légende « Jeu de démonstration fictif » comprise) monte à droite.
  - **690** (temps 46) : `cockpit-bureau-fenetre-versement.png` glisse par-dessus, depuis la droite (`ease-out-expo`). La capture Transactions recule (échelle 0,94, opacité 0,4).
  - **705** (temps 47) : anneau sur « 300,00 € ». **720** (temps 48) : anneau sur la colonne « ≈ Parts à acheter », suivi par le point blanc.
- **Son :** `whoosh-court` à 630 ; `whoosh-doux` à 690 ; `clic` à 705 ; `note-3` à 720.
- **Note :** aucun montant du classeur n'est cité (jeu de démonstration : voir B4). Le prix de 19 € vient de `products.ts` (`priceEur`) et doit y être relu au moment du rendu.

### C8. Premium (images 750 à 839, temps 50 à 55)

- **Texte :**
  - Surtitre : « **Premium · 7 jours d'essai gratuit** »
  - Titre : « **Le suivi mensuel, en ligne** »
  - Sous-titre : « **Monte Carlo, backtest depuis 2008, récap fiscal annuel** »
  - Prix : « **4,90 €/mois ou 49 €/an** »
- **Visuel :** `tarifs-bureau-premium-liste.png` (708×724 : liste des fonctions Premium sur la carte sombre de `/tarifs`), ramenée à 640 px de haut, à droite.
- **Mouvement :**
  - Les lignes s'éclairent une par une, sur un fond primary-500 à 12 % : « Suivi mensuel de stratégie » (765), « Récap fiscal annuel » (780), « Analyse Monte Carlo » (795), « Backtest historique » (810).
  - Le prix apparaît à 780 (opacité + montée).
- **Son :** `tic` à 765, 780, 795 et 810 ; `whoosh-court` à 830.
- **Exclu :** le badge « Le plus populaire » de la carte Premium. Les recadrages `tarifs-bureau-premium-prix.png` et `-liste.png` sont faits **sous** ce badge.

### C9. Fin (images 840 à 899, temps 56 à 59)

- **Texte :**
  - Carte blanche du nom (même composition que la boucle, centrée, LogoMark de 120 px).
  - Au-dessus : « **Simulez. Comparez. Suivez.** » (Newsreader 72 px blanc, une ligne).
  - En dessous : « **Simulateur gratuit, sans inscription** » (Inter 36 px, slate-300).
  - Tout en bas : « **dcatracker.fr** » (Inter 30 px, slate-400).
- **Mouvement :**
  - **840** (temps 56, mesure 15) : la carte apparaît d'un coup sur la note finale (échelle 0,96 → 1 en 8 images).
  - Les textes suivent : 846 pour le récapitulatif, 852 pour la ligne du bas.
  - Image fixe jusqu'à 899.
- **Son :** `impact-doux` + `note-4` à **840**. Fondu de la musique de 870 à 899 si le morceau continue.

---

## 6. Effets sonores (synthèse PCM, script Node, aucun fichier externe)

À écrire plus tard, dans `scripts/sons.mjs`.

- Sortie dans `public/sfx/*.wav`, en WAV PCM 16 bits à 48 kHz, mono sauf les souffles (stéréo).
- Tout est calculé par formule : oscillateurs, bruit pseudo-aléatoire à graine fixe (rendu reproductible), enveloppes, filtres biquad écrits dans le script.

| Fichier | Durée | Recette | Crête |
|---|---|---|---|
| `whoosh-doux.wav` | 0,70 s | Bruit rose dans un passe-bande (Q 1,2). Le centre glisse de 400 à 2 500 Hz (exponentiel). Enveloppe sinus² : montée 0,35 s, descente 0,35 s. Panoramique −0,3 → +0,3. | −14 dBFS |
| `whoosh-court.wav` | 0,35 s | Même recette, de 600 à 3 000 Hz. | −18 dBFS |
| `clic.wav` | 0,03 s | Bruit blanc de 2 ms + sinus à 1 800 Hz qui décroît (τ = 6 ms). | −16 dBFS |
| `tic.wav` | 0,015 s | Sinus à 3 200 Hz, décroissance τ = 3 ms (pour le compteur et les listes). | −24 dBFS |
| `pop.wav` | 0,12 s | Sinus de 880 à 440 Hz (glissando exponentiel) + `clic` à −10 dB (apparition du point du logo). | −14 dBFS |
| `note-1` à `note-4.wav` | 0,90 s | Note pincée : fondamentale + harmoniques 2 (−12 dB) et 3 (−20 dB), attaque 5 ms, décroissance τ = 250 ms. Hauteurs par défaut, pentatonique de **La** : A4 440 Hz, C♯5 554,37 Hz, E5 659,26 Hz, A5 880 Hz. | −16 dBFS |
| `impact-doux.wav` | 1,20 s | Sinus de 55 à 45 Hz + bruit dans un passe-bas à 200 Hz, attaque 8 ms, décroissance τ = 350 ms. Reflet aigu : sinus à 1 760 Hz à −28 dB. | −12 dBFS |

**À régler quand la musique sera connue :**

- Le script prend un paramètre `--tonalite` (par défaut `A`) pour accorder les notes sur le morceau de Maël.
- Il prend aussi `--bpm`, utilisé seulement pour placer les sons : les durées ne changent pas.

**Mixage :**

- musique ramenée à −16 LUFS intégrés ;
- effets 6 à 10 dB sous la musique ;
- pas d'atténuation de la musique (ducking), les effets étant courts ;
- crête finale −1 dBTP.

**Morceau à choisir (pour Maël) :**

- licence libre de droits qui autorise un usage commercial sur un site ;
- instrumental, pulsation régulière entre 110 et 125 BPM ;
- introduction de 4 s au plus ;
- au moins 30 s, avec une fin franche ou facile à couper.

---

## 7. Vérification de chaque texte affiché

| Texte à l'écran | Où | Source qui le rend vrai |
|---|---|---|
| « Investir chaque mois en ETF ? » / « Combien, lesquels, et comment suivre ? » | B1 | Questions, sans affirmation |
| « Simulez votre DCA » | B2, C3 | Simulateur, `/simulateur` |
| « 97 753 € », « 200 €/mois pendant 20 ans », « 48 000 € versés » | B2, C3 | `simulateur-bureau-resultat.png`, `textes.json` → `simulateur.resultat` / `indicateurs` |
| « Hypothèse de 7 %/an avant frais, pas une prévision » | B2, C3 | Mention du site : « Scénario central : hypothèse de 7,00 %/an avant frais, pas une prévision » |
| « Frais de l'ETF (0,38 %) déduits » ; version carrée : « 200 €/mois sur 20 ans, frais de l'ETF (0,38 %) déduits » | C3, B2 | `TER_REFERENCE_SIMULATEUR` (`src/lib/simulation-params.ts` → `src/lib/etf-config.ts`, TER de CW8), lu par `extraire-donnees.mjs`, qui vérifie que 7,00 − 0,38 = le « Rendement net : 6,62 %/an » du simulateur (`textes.json` → `simulateur.indicateurs`) et, à partir des captures postérieures au 04/10, la ligne « − 0,38 % (frais TER) » de `textes.simulateur.hypotheses`. Boucle (B2, depuis le 04/10) : « Frais de l'ETF CW8 (0,38 %/an) déduits », l'ETF venant de `simulateur.etfFrais` |
| « Hypothèses avant frais, pas des prévisions » (version carrée, pendant les 3 scénarios) | C3 | Même mention du site, au pluriel parce que trois hypothèses (5, 7 et 9 %) sont montrées |
| « 3 scénarios : 5 %, 7 % et 9 % par an avant frais » | C3 | `simulateur-bureau-scenarios.png` : « 5 %/an brut », « 7 %/an brut », « 9 %/an brut » |
| « Simulateur · gratuit, sans inscription » / « Simulateur gratuit, sans inscription » | C3, C9 | Titre de `/simulateur` : « Simulateur DCA ETF gratuit, sans inscription » |
| « Comparez 19 ETF » | B3, C4 | « 19 ETF analysés » (`textes.json` → `comparer_etf.chapeau`) |
| « Frais, réplication, (ISIN,) éligibilité PEA » | B3, C4 | Cartes du comparateur : TER, Réplication, ISIN, badge PEA |
| « Le cockpit DCA pour investisseurs long-terme » | C1 | Pastille du bandeau d'accueil (`Hero.tsx`) |
| « Combien peut valoir votre DCA ? » / « Quels ETF, avec quels frais ? » / « Comment le suivre ? » | C2 | Questions, sans affirmation (la première reprend le H1) |
| « Vérifiée le 28 septembre 2026 », « 13 ETF éligibles au PEA », « Vérifiés un par un, avec leur ISIN et leurs frais » | C5 | `textes.json` → `etf_eligibles_pea.entete` |
| « PEA ou CTO ? », « Le calculateur fiscal compare l'impôt » | C6 | H1 du calculateur ; le site dit « Ce calcul compare l'impôt, rien d'autre. » |
| « PEA de plus de 5 ans · 18,6 % · prélèvements sociaux », « Compte-titres (CTO) · 31,4 % · prélèvement forfaitaire unique (PFU) » (version carrée) | C6 | Paragraphe du calculateur fiscal (`calculateur-fiscal-bureau-taux.png`, `textes.json` → `calculateur_fiscal.taux`) ; taux relus par `extraire-donnees.mjs` |
| « Filtre « PEA uniquement » : 8 ETF » | C4 | Compteur du comparateur filtre activé (`textes.json` → `comparer_etf.compteur_pea_uniquement`) |
| « Suivez votre PEA » / « Chaque mois, dans Excel ou Google Sheets » | B4, C7 | Cockpit : « Suivez votre PEA en 2 min/mois », « Excel + Google Sheets » ; le modèle gratuit existe aussi en Excel et Google Sheets |
| « Modèle gratuit : journal des achats et vue par ETF » | C7 | `/suivi-pea-excel` : « Le journal des achats et la vue par ETF… en Excel et Google Sheets » |
| « Cockpit DCA · 19 €, paiement unique » | C7 | `products.ts` : `priceEur: 19` ; bandeau « 19 € · paiement unique » |
| « Le versement du mois, en parts entières » | C7 | `products.ts` : « il le répartit en parts entières par ETF » |
| « Calcul sur l'allocation que vous fixez, pas un conseil » | C7 | Légende du site : « Calcul fait sur l'allocation que vous fixez, pas un conseil. » |
| « Exemple pré-rempli » | B4 | Légende du site : « Dans l'exemple pré-rempli… » ; « Jeu de démonstration » |
| « Premium · 7 jours d'essai gratuit » | C8 | `plans.ts` : `PREMIUM_ESSAI_JOURS = 7` ; « Essai gratuit 7 jours » sur `/tarifs` |
| « Le suivi mensuel, en ligne » | C8 | Fonction Premium : « Suivi mensuel de stratégie + emails personnalisés » |
| « Monte Carlo, backtest depuis 2008, récap fiscal annuel » | C8 | Liste Premium de `/tarifs` (`textes.json` → `tarifs`) |
| « 4,90 €/mois ou 49 €/an » | C8 | `plans.ts` : `PREMIUM_PRIX_MENSUEL_EUR = 4.9` ; `tarifs-affiches.ts` : `PREMIUM_ANNUEL_EUR = 49` |
| « Annulable à tout moment, moyen de paiement requis » (version carrée) | C8 | `/tarifs` : « Essai gratuit 7 jours · annulable à tout moment » ; FAQ de `src/app/tarifs/page.tsx` : « Un moyen de paiement est requis pour confirmer l'essai » (les deux relus par `extraire-donnees.mjs`) |
| « Simulez. Comparez. Suivez. » | B5, C9 | Trois fonctions réelles (simulateur, comparateur, suivi par le modèle, le Cockpit ou Premium) |
| « dcatracker.fr » | C9 | Domaine du site |
| « Pas un conseil en investissement. Investir comporte un risque de perte en capital. » (version carrée) | C9 | Avertissement de `src/components/layout/Footer.tsx` : « Il ne constitue pas un conseil en investissement… Investir comporte un risque de perte en capital. » (relu par `extraire-donnees.mjs`) |

**Au rendu :** prix, nombres d'ETF et date de vérification sont relus dans le code ou dans `textes.json`. On ne les recopie pas à la main dans les compositions.

---

## 8. Écarté volontairement

| Élément | Pourquoi |
|---|---|
| Les chiffres de la maquette « Suivi de stratégie » de l'accueil (1 380 €, « En avance de +133 € », « 6 mois consécutifs ») et des maquettes Premium de `/tarifs` (2 680 €, « +3,2 % vs projection »…) | Ce sont des **illustrations** : le code les marque comme n'étant le portefeuille de personne. La capture `accueil-bureau-section-sombre.png` sert de référence de style, pas de source. |
| Les montants, TRI et plus-values du classeur Cockpit | Jeu de démonstration (achats fictifs, cours réels depuis `dd0c363`) dont les valeurs changent avec la date. Un TRI affiché en gros se lirait comme une promesse. |
| « Le PEA vous fait économiser 6 368 € » | Se lirait comme une recommandation d'enveloppe (voir C6). |
| Le « pire cas réaliste » du Monte Carlo (51 866 €), les gains de la comparaison A vs B, les résultats du backtest (127 720 € depuis 2010…) | Performances passées ou simulées sans leur contexte, impossibles à nuancer en 2 s. Le backtest est seulement nommé (C8). |
| Le badge « Le plus populaire » | Affirmation qu'on ne vérifie pas. Recadrages faits sous le badge. |
| « Vous laissez de l'argent sur la table », « Le tableau de bord que votre courtier aurait dû vous donner » | Phrases d'accroche du site, trop commerciales pour une vidéo sobre. |
| Guide PDF (19 €) et Pack (33 €) | Pas de place dans 30 s sans surcharger. Ils peuvent remplacer C6 si Maël préfère. |

---

## 9. À trancher par Maël

1. **Emplacement.** *Tranché le 04/10/2026 : la boucle remplace la carte dans la colonne de droite (`<HeroVideo />`, voir `src/components/home/Hero.tsx`).* La boucle prend la colonne de droite du bandeau. C'est la place de la carte de démonstration interactive (`HeroDemoCard`). Faut-il la remplacer, ou placer la vidéo au-dessus de la carte, ou sous les boutons sur mobile ?
2. **Fin sur carte blanche.** Le nom « DCA Tracker » n'existe qu'en version sombre sur fond clair. Je le pose donc sur une carte blanche (composant du site) plutôt que de l'inverser en blanc. Une version « nom en blanc » demanderait une décision de charte.
3. **Les prix dans la version complète** (19 € en C7, 4,90 €/mois ou 49 €/an en C8). Ils sont exacts et relus dans le code au rendu. Faut-il les garder, ou ne nommer que les produits ?
4. **C6 (PEA ou CTO) ou le Guide PDF.** Un seul tient en 2 s.
5. **La musique** : tempo et tonalité, pour caler les coupes et accorder les notes.
6. **Intégration** (lot suivant, après validation) :
   - `<video autoplay muted loop playsinline preload="metadata" poster>` ;
   - image fixe si `prefers-reduced-motion` ;
   - **bouton pause** visible (WCAG 2.2.2 : tout mouvement automatique de plus de 5 s doit pouvoir s'arrêter) ;
   - chargement après le titre, pour ne pas peser sur le LCP ;
   - fenêtre accessible pour la version complète, avec un texte alternatif qui reprend les titres des plans.

---

## 10. Visuels

- Liste complète des captures : `public/captures/INDEX.md` (page, contenu, appareil, pixels, poids) et `public/captures/index.json` (avec l'heure de chaque capture).
- Valeurs relevées dans le DOM au même moment : `public/captures/textes.json`.
- Les captures viennent de **https://dcatracker.fr** (production), prises le 2 octobre 2026 par `npm run captures` (Playwright + Chromium, installés dans ce dossier seulement) :
  - ordinateur : 1440×900, densité 2 ;
  - mobile : 390×844, densité 3.
- Le site n'affiche aucun bandeau cookies.
- Aucune saisie et aucun envoi de formulaire n'a été fait. Seuls des boutons d'affichage ont été cliqués : montant et durée de la carte d'accueil, filtre « PEA uniquement », bascule mensuel/annuel.
- **Avant le rendu final**, relancer `npm run captures` : l'exemple du Cockpit dépend de la date, et les prix ou les nombres d'ETF peuvent changer.
