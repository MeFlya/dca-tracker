# Boucle du Cockpit DCA : scénario, storyboard et emplacement

Version 1, 4 octobre 2026. Rendue le même jour (section 8) et mise en ligne le 4 octobre 2026 dans le bandeau de la page du Cockpit (src/components/products/VideoCockpit.tsx).

**Demande de Maël (04/10) :** une vidéo sur la page du Cockpit (`/produits/template-suivi-dca`) pour donner envie d'acheter.

**Décision :** une boucle dédiée au Cockpit. Ce n'est pas la boucle de l'accueil, dont les deux tiers parlent du simulateur et du comparateur. Elle est muette et carrée, dure 19 s et garde le langage de la boucle de l'accueil :
- une idée par plan ;
- de grandes cartes, recadrées serré ;
- Newsreader et Inter, bleu #1d4ed8, anneaux, fond sombre ;
- un raccord parfait.

Les règles de `STORYBOARD.md` (sections 2 et 3 : charte, lisibilité, marges de 80 px) s'appliquent ici sans exception.

Maquettes statiques des six plans : `out/maquettes-cockpit/`, ignoré par git.
- Fichiers : `planche-343.png`, puis `pN-*-1080.png`, `-480.png` et `-343.png`.
- Script : `maquette.py`, en Python (PIL).
- Elles sont faites avec les **vraies captures**, recadrées et recomposées comme décrit ci-dessous. Les polices sont de remplacement (Georgia, Helvetica).
- Elles valident l'encombrement et la lisibilité des captures à 343 et 480 px, mais **pas** le rendu final.

---

## 1. Ce que le Cockpit fait vraiment (la seule matière autorisée)

Tout texte affiché vient de `src/lib/products.ts` (fiche `TEMPLATE`), de `src/lib/cockpit-exemple.ts`, ou se lit dans une capture du fichier livré.

| Fait | Phrase source |
|---|---|
| Versement du mois | `features[1]` : « saisissez votre montant, il le répartit en parts entières par ETF pour revenir vers votre allocation cible » ; `abstract[1]` : « chaque mois, il vous dit où verser » |
| Il ne décide **pas** du montant | C'est vous qui le saisissez (case bleue). D'où l'écart avec la question proposée dans la commande, « Combien investir ce mois-ci ? », qui serait **fausse** : voir P1 |
| Répartition réelle face à la cible | `features[0]` : « répartition réelle vs cible » ; colonnes « Poids actuel », « Cible », « Écart » du Dashboard |
| Tableau de bord | `features[0]` : « valeur du portefeuille, total versé, plus-value €/%, TRI annualisé (XIRR), frais cumulés […] — tout se met à jour seul » |
| PEA | `abstract[2]` : « Conçu 100 % pour le PEA français — plafond, cap des 5 ans, prélèvements sociaux » |
| Formats, prix | `titreHero` : « Cockpit DCA » / « Tableau de bord PEA (Excel + Google Sheets) » ; `priceEur: 19` ; « paiement unique » (bandeau) |
| Exemple | Achats **fictifs**, cours **réels** (clôtures Euronext), cours de Par ETF du `DATE_CAPTURES` = 2026-10-02 |

**Écarté de la vidéo :**
- **Le TRI de l'exemple (17,0 %)** : un pourcentage annuel en gros se lit comme une promesse. Le TRI est seulement *nommé* (P4).
- **« 32 mois — 87 achats » et « encore 836 jour(s) avant le cap »** : ces valeurs dépendent de la date d'ouverture du fichier, et seraient fausses le reste de la vie de la vidéo.
- **La Projection (291 251 € à 25 ans, courbe jusqu'à 900 000 €)** : c'est une hypothèse, impossible à nuancer en 3 s.
- **L'onglet Frais (21 821 €)** : même raison.
- **La phrase d'accroche « Le tableau de bord que votre courtier aurait dû vous donner »** : déjà en HTML juste au-dessus de la vidéo, et trop commerciale pour l'image (même règle que `STORYBOARD.md` §8).

---

## 2. Format

| | Boucle du Cockpit |
|---|---|
| Composition | `BoucleCockpit` (nouveau fichier `src/cockpit/BoucleCockpit.tsx` ; zones dans un nouveau `src/zones-cockpit.ts`). `Boucle`, `Complete`, `CompleteCarree`, la musique et la bande-son ne sont pas touchés |
| Taille | 1080×1080, 30 i/s |
| Durée | Scénario de **540 images** (P1 à P6), plus un **arrêt de 30 images** sur l'affiche, soit **570 images (19,0 s)** dans le fichier |
| Son | Aucune piste audio |
| Sorties | `out/boucle-cockpit.webm` (VP9), `out/boucle-cockpit.mp4` (H.264, QP constant comme la boucle d'accueil), `out/boucle-cockpit-affiche.jpg` |
| Objectifs | Moins de 1,5 Mo par fichier vidéo ; affiche sous 120 Ko |

**Raccord : même mécanique que `Boucle.tsx`.**
- Réglages : `ARRETS = [{ a: 255, duree: 30 }]` et `DEPART = 255`.
- L'image 0 du fichier est l'image 255 du scénario, c'est-à-dire l'état final du versement du mois : c'est **l'affiche**.
- La dernière image du fichier est l'image 254 du scénario.
- **Tout est immobile de 250 à 269 :** le dernier anneau (226) est posé à 248, puisque `etat()` d'`Accents.tsx` finit à début + 22.
- Les images 0 et 569 sont donc identiques. Le test de raccord de `scripts/rendre.mjs` doit le prouver (même empreinte SHA-256).
- La reprise du scénario (P6 → P1, image 539 → 0) se fait sur fond vide : P6 est à opacité 0 dès 538 et P1 commence à 4.

**Lisibilité (mesurée sur les maquettes) :**
- Les textes des captures restent à **28 px ou plus** dans le rendu 1080 :
  - échelle 1 : les cellules du classeur font 32 px, celles de la capture du site 28 px ;
  - échelle 0,92 : environ 29,5 px.
- Soit 9 à 10 px à 343 px de large, comme le plan B4 de la boucle d'accueil, déjà relu.
- Titres en Newsreader 84 ; sous-titres en Inter 36 à 40, slate-300 ; mentions en Inter 34, slate-400.

**Barre de fenêtre :**
- **Le classeur se reconnaît** à la barre des fenêtres du site : trois pastilles slate-300, puis « Cockpit-DCA-PEA_dcatracker.xlsx » en slate-500 et « · Onglet » en slate-400.
- **D'où elle vient :**
  - P3 la reprend telle quelle dans la capture du site, comme B4.
  - P2, P4 et P5 la font en HTML, en copie exacte du composant `Fenetre` de `src/components/products/visuels.tsx` : mêmes couleurs, `text-xs font-medium` mis à l'échelle (30 px), même hauteur de 70 px.
- **Ce n'est pas un style inventé :** c'est le composant du site, comme `Logo.tsx` copie `LogoMark`.

---

## 3. Le scénario, plan par plan

Les numéros d'image sont ceux du **scénario**, comme dans `Boucle.tsx`. Mouvements et durées suivent la charte (`STORYBOARD.md` §2).
- Entrées en `ease-out-expo`, montée de 26 px pour les textes, de 90 px pour les fenêtres.
- Sorties : glissement de −80 px avec un fondu (P1, P2, P4, P5). P3 recule (échelle 1 → 0,92), comme B4.
- Décalage de 4 images dans une série.
- Aucun rebond, aucun compteur. Les montants de l'exemple ne défilent pas : un compteur afficherait des valeurs intermédiaires fausses.
- Le point blanc (marqueur) ne se pose sur aucune capture (relecture du 02/10 : à côté d'un anneau, on le prend pour un bouton).

### P1. La question (images 0 à 74, 2,5 s)

- **Texte :**
  - « **Ce mois-ci, quel ETF acheter ?** » : Newsreader 88, blanc, centré, sur deux lignes (« Ce mois-ci, quel ETF » / « acheter ? »), en y = 300.
  - En dessous, en y = 540 : « **Et combien de parts, pour rester sur votre allocation ?** », Inter 40, slate-300, centré, sur deux lignes.
- **Source :** `abstract[1]` (« combien de parts de chaque ETF acheter pour rester aligné sur VOTRE allocation »). C'est une question, pas une affirmation.
- **Pourquoi pas « Combien investir ce mois-ci, et dans quel ETF ? » (proposé dans la commande) :** le Cockpit ne décide pas du montant. Vous le saisissez, puis il le répartit. La question annoncerait un service que le fichier ne rend pas, et se lirait comme du conseil.
- **Mouvement :** titre de 4 à 16 (`Revele`, flou 6), sous-titre à partir de 10, sortie de 62 à 74.
- **Anneaux :** aucun.

### P2. La répartition face à la cible (images 70 à 164, 3 s)

Le constat : un ETF est sous sa cible.

- **Texte :**
  - « **Votre répartition** » : Newsreader 84, en (80 ; 92).
  - « **Poids réel, cible et écart, ETF par ETF** » : Inter 40, slate-300, en y = 200.
- **Mention :** « **Exemple pré-rempli : achats fictifs, cours du 2 octobre 2026** » (Inter 34, slate-400), sous la fenêtre, sur deux lignes au besoin. La date vient de `DATE_CAPTURES`, lu par le script (§5).
- **Capture :** `public/captures/classeur/cockpit-v2-dashboard.png` (2586×1580), même fichier que `public/produits/` (SHA-1 identique, vérifié le 04/10). Tableau « Répartition par ETF », recomposé en trois morceaux, de y = 797 à 1092 (en-tête, trois lignes, filet) :

  | Morceau | Zone du PNG [x1, y1, x2, y2] | Position dans la recomposition |
  |---|---|---|
  | ETF | [65, 797, 262, 1092] | x = 0 |
  | Poids actuel + barres | [796, 797, 1215, 1092] | x = 197 |
  | Cible + Écart | [1426, 797, 1790, 1092] | x = 616 |

  - **Échelle :** largeur 980 px, à l'échelle **0,92**, soit 902 px. La valeur « Valeur (€) » est retirée : il ne reste aucun montant.
  - **Mise en page :** fenêtre centrée en y = 330, avec une marge blanche de 24 px en haut et en bas, et de 9 px sur les côtés (largeur 920).
- **Anneaux :**
  - `Bande` sur la ligne d'ETZ : [65, 962, 1790, 1022], début 108, `repos` 0,55.
  - `Anneau` sur l'écart d'ETZ, « -6,7 % » : [1654, 974, 1757, 1010], début 118, couleur `C.bleu`, épaisseur 4, marge 8.
- **Mouvement :**
  - fenêtre de 74 à 100 (opacité de 74 à 84, montée de 90 px) ;
  - titre à 72, sous-titre à 76, mention à 90 ;
  - sortie de 150 à 164.
- Les pourcentages sont ceux de l'exemple, d'où la mention.

### P3. Le versement du mois : l'AFFICHE (images 160 à 284, 4 s, plus l'arrêt de 30 images à 255)

La décision : où vont les 300 € de l'exemple.

- **Texte :**
  - « **Où verser ce mois-ci** » : Newsreader 84, en (80 ; 92), sur une ligne.
  - « **En parts entières, vers votre allocation cible** » : Inter 38, slate-300, en y = 200 ; si la ligne dépasse 920 px en Inter, passer à 36.
  - **Sources :** `abstract[1]` (« il vous dit où verser ») et `features[1]` (« il le répartit en parts entières par ETF pour revenir vers votre allocation cible »).
- **Mentions** (Inter 34, slate-400, sous la fenêtre, à 36 px puis à 82 px de son bas) :
  - « **Exemple pré-rempli** » ;
  - « **Calcul sur l'allocation que vous fixez, pas un conseil** » (légende du site : « Calcul fait sur l'allocation que vous fixez, pas un conseil »).
- **Capture :** `public/captures/cockpit-bureau-fenetre-versement.png`, recomposée **exactement comme B4** dans `Boucle.tsx` (constantes `BARRE`, `BARRE_VIDE`, `LIGNE`, `COL_ETF`, `BANDE_VIDE`, `COL_SUGGERE_PARTS`, `FEN`).
  - Échelle 1. Fenêtre de 919×506 en (80 ; 290).
  - Elle montre la barre « Cockpit-DCA-PEA_dcatracker.xlsx · Versement du mois », puis « Montant à verser ce mois-ci : 300,00 € », puis ETF / Montant suggéré (€) / ≈ Parts à acheter.
  - Recopier ces constantes dans `zones-cockpit.ts` plutôt que les importer de `Boucle.tsx` (elles n'y sont pas exportées, et la boucle d'accueil ne doit pas changer).
- **Mouvement et anneaux :**
  - 164 → 190 : la fenêtre monte (opacité de 164 à 175, montée de 90 px, `rotateX` de 8° à 0°, origine en bas), comme B4.
  - 162 et 166 : titre, puis sous-titre. 186 et 190 : les deux mentions.
  - 196 : `Anneau` sur la case « 300,00 € » (`Z.versement.montant` = [684, 343, 893, 425], marge 2, `repos` 0,55).
  - 208 → 226 : **le calcul apparaît.** Un cache blanc (le fond des lignes est blanc) couvre les valeurs des deux colonnes vertes, « Montant suggéré » et « ≈ Parts à acheter », sous leur en-tête. Il se retire de haut en bas (`ease-out-quart`). Rien n'est redessiné : on découvre les pixels de la capture.
    - Zone du cache : de x = 1357 à 1770, de y = 618 à 800 dans la capture du site.
    - Mesures au pixel : le texte de l'en-tête s'arrête à y = 609, la première ligne de valeurs commence à y = 638.
  - 226 : `Anneau` sur le « 14 » d'ETZ : [1700, 684, 1770, 731] dans la capture du site (le texte « 14 » est en x = 1728 à 1763, y = 695 à 720, mesuré au pixel le 04/10). Marge 4, apparition à sa taille finale, sans balayage : un bord qui passait sur le « 14 » le faisait lire « 1 1 » dans B4.
  - Repos de 248 à 269 : tout est immobile. L'arrêt de 30 images à 255 donne l'affiche.
  - 270 → 284 : la fenêtre recule (échelle 1 → 0,92, opacité → 0).
- **L'affiche, à elle seule** (maquette `p3-versement-affiche-1080.png`) :
  - elle dit ce qu'est le Cockpit : un classeur (`.xlsx`) qui, pour le montant que vous saisissez, donne le nombre de parts de chaque ETF ;
  - elle montre la valeur ajoutée (la décision, pas un constat) ;
  - elle porte les deux mentions d'honnêteté ;
  - le H1 « Cockpit DCA (Excel + Google Sheets) » et le prix sont en HTML juste au-dessus, donc l'affiche ne les répète pas.

### P4. Le tableau de bord (images 280 à 374, 3 s)

- **Texte :**
  - « **Le tableau de bord** » : Newsreader 84. La maquette a montré que « Votre PEA d'un coup d'œil » déborde à 84 px.
  - « **Valeur, versé, plus-value, TRI : tout se met à jour seul** » : Inter 36, slate-300. Source : `features[0]`. Le TRI est seulement nommé.
- **Mention :** « **Exemple pré-rempli : achats fictifs,** » / « **cours de clôture du 2 octobre 2026** » (Inter 34, slate-400, deux lignes, date tirée de `DATE_CAPTURES`).
- **Capture :** `classeur/cockpit-v2-dashboard.png`. Quatre des six cases du haut, chacune avec son filet, recomposées en **2 × 2** à l'échelle 1 :

  | Case | Zone du PNG | Position |
  |---|---|---|
  | Valeur du portefeuille | [65, 222, 485, 430] | (0 ; 0) |
  | Total versé (frais inclus) | [928, 222, 1348, 430] | (480 ; 0) |
  | Plus-value latente (+28,0 %) | [1790, 222, 2210, 430] | (0 ; 248) |
  | Frais de courtage cumulés (2,1 % du versé) | [928, 471, 1348, 680] | (480 ; 248) |

  - **Taille :** grille de 900×456, posée en (10 ; 24) dans la fenêtre de 920×496 (barre comprise), en (80 ; 290).
  - **Pourquoi « Frais de courtage » plutôt que « TRI » ou « Votre DCA » :** le TRI se lirait comme une promesse, et « 32 mois — 87 achats » dépend de la date.
- **Anneaux :**
  - `Anneau` sur la case Valeur (étiquette et valeur : [72, 256, 419, 362]) à 316, `repos` 0,55 ;
  - `Anneau` sur Total versé ([935, 256, 1260, 362]) à 328, `repos` 0,55 ;
  - **aucun anneau sur la plus-value.**
- **Mouvement :**
  - fenêtre de 284 à 310 ;
  - les quatre cases à 292, 296, 300 et 304 (opacité, montée de 26 px) ;
  - mentions à 300 et 304 ;
  - sortie de 360 à 374.

### P5. Pensé pour le PEA (images 370 à 464, 3 s)

- **Texte :**
  - « **Pensé pour le PEA** » : Newsreader 84 (`abstract[2]` : « Conçu 100 % pour le PEA français »).
  - « **Plafond, cap des 5 ans, prélèvements sociaux** » : Inter 38, slate-300. C'est le texte de `abstract[2]` mot pour mot, lu par le script (§5) et non retapé.
- **Mention :** « **Exemple pré-rempli** ».
- **Capture :** `classeur/cockpit-v2-pea.png` (2365×1715), recomposée à l'échelle 1 dans une fenêtre de 920×540 en (80 ; 286). Chaque libellé est rapproché de sa valeur, et la jauge passe sur sa propre ligne :

  | Morceau | Zone du PNG | Position (x ; y) |
  |---|---|---|
  | « Taux des prélèvements sociaux : » | [50, 405, 560, 470] | (0 ; 4) |
  | Case bleue « 18,6 % » | [886, 399, 1201, 476] | (540 ; 0) |
  | « PLAFOND DE VERSEMENTS » | [50, 765, 500, 800] | (0 ; 120) |
  | « Plafond utilisé : » | [50, 940, 290, 988] | (0 ; 176) |
  | « 5,4 % » | [1090, 940, 1195, 988] | (250 ; 176) |
  | Jauge | [1200, 938, 1880, 988] | (0 ; 240) |
  | « ANCIENNETÉ DU PLAN » | [50, 1105, 420, 1145] | (0 ; 360) |
  | « Cap des 5 ans : » | [50, 1222, 292, 1268] | (0 ; 416) |
  | « 15/01/2029 » | [895, 1222, 1072, 1268] | (250 ; 416) |

  - **Ce qui est écarté :**
    - « Âge du plan » et « encore 836 jour(s) » : ils dépendent de la date ;
    - la fiscalité estimée en euros.
  - **Pourquoi la date du cap reste :** elle découle de la date d'ouverture saisie (15/01/2024), donc ne vieillit pas.
- **Anneaux :**
  - case 18,6 % ([889, 401, 1198, 473]) à 404, `repos` 0,55 ;
  - jauge ([1205, 943, 1877, 983]) à 416, `repos` 0,55 ;
  - date du cap ([902, 1231, 1068, 1260]) à 428.
- **Mouvement :**
  - fenêtre de 374 à 400 ;
  - titre à 372, sous-titre à 376, mention à 390 ;
  - sortie de 450 à 464.
- **Vérification juridique :** le 18,6 % est un taux légal (LFSS 2026), déjà affiché par le site et le classeur. Ce n'est pas un chiffre de l'exemple.

### P6. Fin (images 460 à 539, 2,7 s)

- **Visuel :**
  - LogoMark 112 px centré en y = 250 (`LogoMarkAnime` : le carré, puis le trait, puis le point, de 462 à 480) ;
  - « **Cockpit DCA** » : Newsreader 104, blanc, centré, en y = 390 ;
  - « **Tableau de bord PEA** » / « **Excel + Google Sheets** » : Inter 44, slate-300, deux lignes centrées, en y = 530 et 590 ;
  - pastille (`Pastille`, Inter 36) « **19 € · paiement unique** » en y = 700.
- **Sources :**
  - `titreHero.principal` et `titreHero.complement` (« Tableau de bord PEA (Excel + Google Sheets) », coupé sur « ( ») ;
  - `priceEur`, déjà dans `donnees.json` (`affichage.cockpitPrix`) ;
  - « paiement unique », déjà vérifié par `extraire-donnees.mjs`.
- **Mouvement :**
  - logo de 462 à 480 ;
  - titre à 468 ; sous-titre à 472 et 476 ; pastille à 482 ;
  - tenue jusqu'à 524 ;
  - sortie de 524 à 538 (opacité 0 dès 538).
- **Pourquoi le prix ici,** alors qu'il est en HTML juste au-dessus : la boucle doit rester juste si on la réutilise ailleurs (voir §6), et le visiteur qui a fait défiler la page ne voit plus le bandeau.

### Résumé du minutage

| Plan | Images du scénario | Durée | Image clé |
|---|---|---|---|
| P1 La question | 0 – 74 | 2,5 s | |
| P2 Répartition vs cible | 70 – 164 | 3,1 s | anneau « -6,7 % » d'ETZ |
| P3 Versement du mois | 160 – 284 | 4,1 s + 1 s d'arrêt | **affiche = image 255** |
| P4 Tableau de bord | 280 – 374 | 3,1 s | |
| P5 PEA | 370 – 464 | 3,1 s | |
| P6 Fin | 460 – 539 | 2,7 s | |
| **Fichier** | 570 images | **19,0 s** | image 0 = 569 = affiche |

Fil narratif :
1. la question ;
2. le constat : ETZ est 6,7 points sous sa cible ;
3. la décision : les 300 € vont en 14 parts d'ETZ ;
4. le suivi ;
5. le PEA ;
6. le produit et son prix.

C'est la promesse de la fiche, « Pas un constat de plus — une décision claire à chaque versement », montrée sans la dire.

---

## 4. Honnêteté : contrôle plan par plan

| Règle | Comment elle est tenue |
|---|---|
| « Exemple pré-rempli » visible dès qu'un montant du classeur est lisible | Mention en P2, P3 (affiche comprise), P4 et P5. P1 et P6 n'ont aucun montant du classeur |
| Aucune performance présentée comme une promesse | TRI jamais chiffré. La plus-value de l'exemple (P4) est sans anneau, sous une mention qui dit « achats fictifs » et date les cours. Ni la Projection ni les Frais ne sont montrés |
| Versement du mois | « Calcul sur l'allocation que vous fixez, pas un conseil » sur le plan et sur l'affiche |
| Prix | Lu dans `products.ts` (`priceEur`) par `extraire-donnees.mjs`, jamais écrit à la main |
| Aucun cours figé présenté comme actuel | Pas de « Mis à jour il y a… » dans les captures retenues (aucune n'en a). Valeurs de l'exemple datées : « cours du 2 octobre 2026 » |
| Aucun chiffre écrit à la main | Chaque texte avec un chiffre (prix, « 5 ans », date) vient de `donnees.json` (§5) |

---

## 5. Données : ce que `scripts/extraire-donnees.mjs` doit ajouter

Nouvelle clé `cockpitBoucle` dans `src/donnees.json`. Le script **s'arrête** si une valeur manque ou diverge.

1. **`dateExemple` :** `DATE_CAPTURES` lu dans `src/lib/cockpit-exemple.ts`, mis en forme « 2 octobre 2026 ».
2. **`titre`, `complement` :** `titreHero.principal` et `titreHero.complement` lus dans `products.ts`. La forme « … (Excel + Google Sheets) » est vérifiée, puis coupée en deux lignes.
3. **Phrases sources :** le script vérifie que `products.ts` contient bien :
   - « en parts entières par ETF pour revenir vers votre allocation cible » ;
   - « il vous dit où verser » ;
   - « plafond, cap des 5 ans, prélèvements sociaux » (le sous-titre de P5 est **copié** de cette chaîne) ;
   - « tout se met à jour seul » ;
   - « pas un conseil ».

   Si l'une d'elles disparaît de la fiche, la vidéo ne doit plus la dire.
4. **Captures du classeur :** SHA-256 de `public/captures/classeur/cockpit-v2-dashboard.png` et `cockpit-v2-pea.png`, comparés à ceux de `../public/produits/`. Ils sont identiques aujourd'hui ; si l'exemple est régénéré, le rendu s'arrête au lieu de montrer un ancien exemple.
5. Prix et « paiement unique » : déjà vérifiés aujourd'hui.

   **Attention :** la vérification actuelle lit `textes.cockpit.bandeau` dans les captures du 02/10. Si `npm run captures` est relancé, s'assurer qu'elle trouve toujours le texte, car la mise en page du bandeau a changé depuis.

**Garde-fou côté site,** sur le modèle de `src/lib/video-accueil.ts` et `HeroVideo.tsx` :
- `src/lib/video-cockpit.ts` porte les noms de fichiers versionnés (`/video/cockpit-<sha8>.webm|mp4`, `/video/cockpit-affiche-<sha8>.jpg`).
- Il porte aussi `DANS_LA_VIDEO_COCKPIT = { prix, dateExemple }`.
- Au build, si `priceEur` ou `DATE_CAPTURES` ont changé, la page reprend **le visuel actuel** : la fenêtre « Versement du mois » de `ProductVisual`, inchangée. La vidéo ne montre donc jamais un prix ou un exemple périmé.

---

## 6. Emplacement sur la page produit

État actuel, mesuré sur `cockpit-bureau-ecran.png` (1440×900) et `cockpit-mobile-ecran.png` (390×844).
- **Ordre du bandeau sombre :** fil d'Ariane, H1, accroche, prix, bouton d'achat (avec sa note), **fenêtre statique « Versement du mois »** et sa légende (`ProductVisual`), puis les chiffres clés.
- **Bouton d'achat :** il finit vers y = 490 px CSS sur téléphone, vers y = 480 sur ordinateur.
- **Visuel :** il commence vers y = 530 à 545.

### Les options

| | (a) Dans le bandeau, sous le bouton, centré, 480 px au plus | (b) En tête de la visite (« Ce que vous verrez en ouvrant le fichier ») | (c) Bandeau à deux colonnes sur ordinateur (texte à gauche, vidéo à droite, comme l'accueil) |
|---|---|---|---|
| Bouton visible sans défiler | Oui, inchangé : la vidéo est **sous** le bouton | Oui | Oui |
| Vidéo vue au premier écran | Téléphone : le haut de l'affiche (titre « Où verser ce mois-ci » et haut de la fenêtre), environ 200 px. Ordinateur : environ 360 px sur 480 | Non : environ 2 000 px plus bas sur ordinateur, 3 000 sur téléphone, après la présentation. Peu de visiteurs y arrivent avant de décider | Ordinateur : entière. Téléphone : comme (a) |
| Redondance | Aucune **si la vidéo remplace la fenêtre statique** (l'affiche EST ce versement, mieux cadré et annoté) | Doublon avec la visite par onglets, qui montre déjà les mêmes onglets en statique | Aucune |
| Coût et risque | Faible : seul le Cockpit change, `ProductVisual` reste le secours | Faible, mais peu d'effet | Fort : le bandeau est partagé avec le Guide et le Pack, et sa mise en page centrée a été décidée le 01/10 (refonte « langage de /tarifs ») |

### Recommandation : (a), la boucle **à la place** de la fenêtre statique du bandeau, pour le Cockpit seulement

- **Où :** dans `ProductHero`, à la place de `<ProductVisual>` quand le produit est le Cockpit et que la vidéo n'est pas périmée (§5).
- **Taille :** centrée, `w-full max-w-[480px]`, carrée (`aspect-square`), coins `rounded-2xl`, `ring-1 ring-white/10`. Sur téléphone, elle prend la largeur moins les gouttières de 16 px (358 px à 390), ce que la maquette 343 couvre.
- **Pourquoi remplacer et non ajouter :**
  - l'affiche reprend le même onglet, mieux recadré ;
  - garder les deux mettrait le même tableau deux fois à la suite ;
  - les chiffres clés descendraient d'environ 500 px.
- **Ce qui ne bouge pas :**
  - l'onglet « Versement du mois » reste en statique dans la visite, en entier, avec « Agrandir » ;
  - le bouton d'achat (`ProductBuyButton`), Stripe, la sentinelle `#achat-hero`, les URL ;
  - les données structurées : `imagesDuProduit` lit `product.screenshots`, pas le visuel du bandeau, donc `TEMPLATE_CAPTURES` n'est pas touché et le JSON-LD Product/Offer reste identique.
  - **À vérifier après intégration :** diff du JSON-LD avant/après sur la page construite.
- **Légende sous la vidéo** (`figcaption`, text-sm slate-300, centrée), courte, car l'image porte déjà ses mentions :
  - « Exemple pré-rempli (achats fictifs, cours réels du 2 octobre 2026). Calcul sur l'allocation que vous fixez, pas un conseil. » ;
  - un lien « Voir les onglets du fichier ↓ » vers `#visite`.

  La date vient de `DATE_CAPTURES`.
- **Lecteur :** reprendre le comportement de `HeroVideoLecteur` (déjà testé) :
  - l'affiche est une vraie `<img>` rendue par le serveur, avec ses dimensions et `fetchPriority="high"`. Elle devient l'élément LCP à la place de la capture actuelle, et doit rester sous 120 Ko ;
  - les sources sont posées après `load` ;
  - pas de vidéo quand le visiteur demande moins d'animations ;
  - bouton pause (WCAG 2.2.2) ;
  - « Lancer l'animation » si la lecture automatique est refusée.

  Ce composant est aujourd'hui lié à `VIDEO_ACCUEIL` et à la version avec le son. Il faut le rendre paramétrable (sources, affiche, version avec le son facultative) **sans changer le comportement de l'accueil**, ou en extraire un lecteur commun.
- **Texte alternatif** (`aria-label` de la figure ou texte masqué) : « Animation muette de 19 secondes sur l'exemple pré-rempli du Cockpit : la répartition face à la cible, le versement du mois réparti en parts entières (14 parts d'ETZ pour 300 €), le tableau de bord, l'onglet PEA, puis Cockpit DCA, 19 €, paiement unique. » Les chiffres de ce texte sont lus dans `cockpit-exemple.ts` et `priceEur`, pas écrits à la main.
- **Barre d'achat mobile :** inchangée. Elle apparaît quand `#achat-hero` sort de l'écran, donc pendant que la vidéo joue : le bouton reste toujours à portée de pouce.

### Lien « Regarder avec le son » ?

**Non.**
- Il n'existe pas de version avec le son dédiée au Cockpit, et celle de l'accueil parle surtout des outils gratuits : sur une page de vente, elle détournerait du produit.
- La boucle porte tous ses textes à l'image.
- Le bouton pause et le texte alternatif suffisent pour l'accessibilité.

---

## 7. Preuves à fournir au rendu (personne ne peut regarder la vidéo en mouvement)

1. `npm run controle -- BoucleCockpit` : images 0, 40, 118, 226, 255, 316, 416, 500 et 569, plus une planche contact.
2. Images 0 et 569 identiques (SHA-256), et l'affiche JPEG comparée à l'image 0 décodée (écart moyen de moins de 1 niveau, comme pour l'accueil).
3. Chaque image clé réduite à **343 px** et **480 px**, puis regardée : le « 14 » et le « -6,7 % » sont lisibles, l'anneau ne coupe aucun chiffre, les mentions sont lisibles.
4. Tailles : WebM et MP4 sous 1,5 Mo, affiche sous 120 Ko.
5. Après intégration :
   - `npm run build`, puis `npx next start` ;
   - captures Playwright de la page à 390×844 et 1440×900 : bouton d'achat visible sans défiler, haut de la vidéo visible, aucun décalage de mise en page ;
   - JSON-LD identique avant et après ;
   - `tsconfig.tsbuildinfo` restauré s'il a bougé.

---

## 8. Rendu du 4 octobre 2026 : écarts au storyboard

Fichiers : `out/boucle-cockpit.mp4` (1,38 Mo, H.264 QP 24, 570 images, 19,00 s, sans piste audio, `moov` avant `mdat`), `out/boucle-cockpit.webm` (1,06 Mo, VP9 CRF 32), `out/boucle-cockpit-affiche.jpg` (92 Ko). Raccord : images 0 et 569 identiques (SHA-256 des PNG ; MP4 décodé : écart 0 ; WebM décodé : 34/255 au plus sur 48 pixels, comme la boucle d'accueil).

| Point | Storyboard | Rendu | Pourquoi |
|---|---|---|---|
| Barre de fenêtre de P2, P4, P5 | Texte à 30 px | 24 px, barre de 68 px + filet de 2 px, pastilles de 20 px | Exactement la barre de la capture de P3 : la barre ne change plus de taille d'un plan à l'autre |
| P4, sous-titre | Inter 36 sur une ligne, repli sur deux lignes | Deux lignes (« Valeur, versé, plus-value, TRI : » / « tout se met à jour seul ») en y = 196 ; fenêtre en y = 316 | La phrase dépasse 920 px en Inter 36 |
| P4, cases | Cases de 420×208, grille 900×456 | Cases de 435 px de large (15 px de blanc à gauche du filet), hauteurs 148 et 204 (contenu mesuré), grille 900×392 | Les anneaux à 12 px du texte touchaient les étiquettes ; la fenêtre plus courte laisse la place aux deux lignes du sous-titre |
| P5, case du taux | [886, 399, 1201, 476] | [886, 401, 1201, 474] | Coupée sur sa bordure : sinon un liseré des cases voisines dépassait |
| P5, valeurs | « 5,4 % » et la date en x = 250 | x = 270 | L'anneau de la date passait à 6 px du « : » |
| P5, fenêtre | 920×540 | 920×592 (contenu 462 + 2 × 30, barre 70) | Contenu mesuré |
| P6 | Logo en y = 250 | Logo en y = 270, bloc centré verticalement | |
| P2, bande d'ETZ | [65, 962, 1790, 1022] | Ligne entière, y = 960 à 1021 (filets mesurés) | |

**Garde-fous ajoutés à `scripts/extraire-donnees.mjs` (clé `cockpitBoucle` de `donnees.json`) :** titre et formats (`titreHero`), sous-titre de P5 copié de `abstract[2]`, présence des phrases reprises (P1 à P6) et de « Calcul fait sur l'allocation que vous fixez, pas un conseil », date de l'exemple (`DATE_CAPTURES`). L'exemple est **recalculé** avec `cockpit-exemple.ts` (chargé par Node) : 300 € → 14 parts d'ETZ seulement (2e ligne), ETZ seul sous sa cible à -6,7 %, cap des 5 ans au 15/01/2029. Les captures du classeur doivent avoir la même empreinte SHA-256 que `public/produits/`, et les captures du site doivent dater d'après `DATE_CAPTURES`. Au moindre écart, le rendu s'arrête.

---

## 9. Corrections des relectures du 4 octobre 2026 (design et exactitude)

Les tableaux du §8 décrivent le premier rendu ; ce qui suit le remplace là où il diffère. Tailles et contrôles du nouveau rendu : `LISEZMOI.md`, section « Boucle du Cockpit ».

| Plan | Avant | Après | Relecture |
|---|---|---|---|
| P1, titre | « Ce mois-ci, quel ETF acheter ? » | « Ce mois-ci, où va votre versement ? » | Exactitude : « quel ETF acheter » est une demande de conseil, et le Cockpit ne choisit aucun ETF. Source : `abstract[1]` (« il vous dit où verser ») |
| P1, sous-titre | « Et combien de parts, pour rester sur votre allocation ? » (10 mots, lisible 1,5 s) | « Et combien de parts de chaque ETF ? » | Design : trop long pour sa durée. Source : `abstract[1]` |
| P6 → P1 | 13 images de fond pur à la reprise | La question entre à 534, pendant que la fin s'éteint (524 → 536) : 5 images sombres (mesurées sur le MP4 décodé) | Design |
| P5 → P6 | 8 images vides | Le carré du logo apparaît à 458, pendant la sortie de P5 (446 → 460) | Design |
| P2, tableau | Échelle 0,92, barres du poids, cellules de 9 px à 343 | Barres retirées (le texte du poids reste), échelle 1,14 (+24 %), fenêtre en y = 340 | Design |
| P2, accents | Bande 108, anneau 118 | Bande 100, anneau 108 | Design : l'anneau ne restait qu'une seconde |
| P3 (affiche) | Deux anneaux, celui du 300 € domine ; « 14 » est le plus petit texte | Anneau du montant de 196 à 216 seulement ; bande sur la ligne d'ETZ (218) ; anneau du « 14 » (226) ; réponse en grand « → 14 parts d'ETZ » (Inter 600, 60 px, lue dans `donnees.json`) sous la fenêtre ; fenêtre en y = 284 | Design : un seul point d'attention, la réponse saute aux yeux, le bas de l'image n'est plus vide |
| P4, cases | Valeur, Total versé, Plus-value (+28,0 % en vert), Frais ; deux anneaux | Valeur et Total versé (ordre du fichier), Frais centrés dessous ; un anneau, sur Valeur | Design et exactitude : la plus-value était une performance passée réelle de trois ETF nommés, et le chiffre le plus coloré du plan |
| P4, sous-titre | « Valeur, versé, plus-value, TRI : tout se met à jour seul » | « Valeur, versé, frais : recalculés depuis vos achats » | Exactitude : sous une fenêtre .xlsx, « tout se met à jour seul » laissait croire que les cours suivent le marché ; en Excel, ils se saisissent à la main |
| P4, entrée | Cases de 292 à 304 : fenêtre vide 10 images | Cases de 286 à 292, avec la fenêtre (284) | Design |
| P5, accents | Trois anneaux (taux, jauge, cap) | Un anneau, sur la date du cap des 5 ans (404) | Design : trois points d'attention, dont un taux légal |
| Mentions | 12 à 22 images après la fenêtre | Avec la fenêtre : P2 74, P3 166, P4 284, P5 374 | Design et exactitude : aucun montant lisible sans « Exemple pré-rempli » |
| Mentions | « Exemple pré-rempli » | « Exemple pré-rempli, extraits du fichier » (P2, P4, P5), « extrait du fichier » (P3) | Exactitude : les fenêtres au nom du fichier montrent des agencements recomposés |

**Garde-fous (`scripts/extraire-donnees.mjs`).**
- Phrases vérifiées : « il vous dit où verser : combien de parts de chaque ETF acheter » (P1) ; « cases bleues = à remplir — tout le reste est automatique » (sous-titre de P4) remplace « tout se met à jour seul ».
- L'affiche (`cockpit-bureau-fenetre-versement.png`, non versionnée) a été relue à l'œil le 04/10 : 300,00 € ; 14 ETZ ; 291,76 € ; reliquat 8,24 €. Son empreinte SHA-256, et celle de `public/produits/cockpit-v2-versement.png` à ce moment-là, sont inscrites dans `AFFICHE_RELUE`. Si l'une change, le rendu s'arrête. Testé en faussant une empreinte dans une copie du script : il s'arrête.
- `cockpitBoucle.exemple` porte maintenant `montantArrondi` (291,76 €) et `reliquat` (8,24 €), calculés par `versementExemple()`, pour le texte alternatif : 14 parts ne font pas 300 €.

**Non retenu.** Réordonner le scénario (P4, P5, P1, P2, P3, P6), pour que la réponse et le prix arrivent dans les 4 premières secondes : à arbitrer par Maël. L'affiche porte maintenant la réponse en grand, elle se suffit à elle-même.
