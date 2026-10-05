# Boucle du modèle gratuit : scénario, storyboard et emplacement

Version 1, 4 octobre 2026. **Rendue le 04/10** (composition `BoucleModeleGratuit`, voir §9 pour les écarts du rendu au storyboard) ; pas encore intégrée au site.

**Demande de Maël (04/10) :** « go pour la boucle du modèle gratuit ».

**Décision proposée :** une boucle muette et carrée de **17,0 s** pour `/suivi-pea-excel`. Son rôle est de montrer ce qu'on reçoit, puis d'amener au formulaire. Elle garde le langage des deux boucles en ligne :
- une idée par plan ;
- de grandes fenêtres recadrées serré ;
- Newsreader et Inter, bleu #1d4ed8, anneaux, fond sombre ;
- un raccord parfait.

Les règles de `STORYBOARD.md` (§2 et §3 : charte, lisibilité, marges de 80 px) et les corrections de `STORYBOARD-COCKPIT.md` §9 s'appliquent ici. Ce sont celles-ci :
- aucune plus-value mise en avant ;
- une mention dès qu'un montant est lisible, posée **avec** la fenêtre ;
- « extrait du fichier » quand la fenêtre est recomposée ;
- un seul point d'attention par plan ;
- jamais « tout se met à jour seul » sous un fichier Excel.

**Maquettes statiques** dans `out/maquettes-modele-gratuit/` (ignoré par git) :
- les fichiers `pN-*-1080.png`, `-480.png` et `-343.png`, puis `planche-343.png` (les six états, dans l'ordre du fichier) et `planche-480-cles.png` (affiche et journal) ;
- le script `maquette.mjs` : HTML avec Inter et Newsreader de Google Fonts, rendu par le Chromium de Playwright.

Elles utilisent les **vraies captures**, recadrées aux zones données ci-dessous. Elles valident l'encombrement et la lisibilité, pas le mouvement.

---

## 1. Ce que le modèle gratuit contient vraiment (la seule matière autorisée)

Sources lues le 04/10 :
- la page (`src/app/suivi-pea-excel/page.tsx`) ;
- le formulaire (`ModeleGratuitForm.tsx`) et l'email (`src/lib/emails/modele-gratuit.ts`) ;
- `src/lib/ressources-gratuites.ts` et `src/lib/cockpit-exemple.ts` ;
- le fichier livré, ouvert avec openpyxl : `private-assets/raw/modele-gratuit/modele-suivi-pea-gratuit-openpyxl.xlsx` et sa source Google Sheets. Ils ont trois onglets, « Mode d'emploi », « Transactions » et « Par ETF ».

| Fait | Phrase source |
|---|---|
| Contenu | Page, « Deux façons de faire » : « Le journal des achats et la vue par ETF (PRU frais inclus, valeur, plus-value, poids), en Excel et Google Sheets ». Page, §9 : « le journal et la vue par ETF du Cockpit, avec son mode d'emploi ». Mode d'emploi B3 : « Le journal de vos achats et la vue par ETF : PRU frais inclus, valeur, plus-value, poids. » |
| Journal | Page, §3 : « Une ligne par achat : la date, le ticker de l'ETF, le nombre de parts, le prix unitaire et les frais ». Mode d'emploi B12 : « date, ticker, parts, prix, frais ». Mode d'emploi B15 : « Case bleue = à remplir par vous » |
| PRU | FAQ : « le PRU, qui dit ce que chaque part vous a réellement coûté ». Mode d'emploi B24 : « Les frais de courtage sont inclus dans votre PRU » |
| Excel / Sheets | Tableau du §8 de la page : « Dans un fichier, sur votre ordinateur » / « Dans votre Google Drive » ; « Saisis à la main dans nos fichiers » / « Automatiques avec GOOGLEFINANCE […] tant que la colonne du cours manuel reste vide » ; formules : « Les mêmes ». Email : « « Copier » crée votre exemplaire dans votre Drive » |
| Gratuit, par email | Formulaire : « Fichier Excel et copie Google Sheets, par email » ; bouton « Recevoir le modèle ». L'email contient « Télécharger le fichier Excel » (lien valable 30 jours) et « Copier la version Google Sheets » |
| Nom du fichier | `downloadName` de `modele-gratuit-xlsx` (route `/api/products/download`) : « Modele-suivi-PEA_dcatracker.xlsx » |
| Exemple | Achats **fictifs**, cours **réels**. Les prix des achats sont les clôtures d'Euronext Paris du 15 du mois ; les cours de Par ETF sont les clôtures du `DATE_CAPTURES`, le 2026-10-02 (`cockpit-exemple.ts`, et mode d'emploi B25) |

### Captures retenues

| Capture | Ce que c'est | Contrôle |
|---|---|---|
| `public/ressources/modele-suivi-pea-transactions.png` (1882×1301) | Onglet Transactions **du modèle gratuit**, aux cours réels (02/10 21:18) | Même SHA-1 que `private-assets/raw/modele-gratuit/captures/modele-transactions.png`. Lignes lues à l'œil le 04/10 : elles concordent avec les 7 premiers `ACHATS_EXEMPLE` (15/01/2024 PE500 4 × 35,70 € + 1,99 €, etc.) |
| `video-accueil/public/captures/classeur/cockpit-v2-par-etf.png` (3698×1319) | Onglet Par ETF du Cockpit v2.0, aux cours du 02/10 | Le script de construction du modèle gratuit garde Par ETF « intact ». Le fichier gratuit, ouvert le 04/10, a les mêmes ETF et les mêmes cours manuels (56,73 €, 20,84 €, 37,22 €). La page légende cette capture « L'onglet Par ETF (Cockpit et modèle gratuit) » |

### Captures écartées, et pourquoi

| Capture | Raison |
|---|---|
| `private-assets/raw/modele-gratuit/rendu/*.png` (01/10 21:50) | Ancien exemple **fictif** : PE500 à 44,23 €, valeur 8 119,91 €. C'est le cours faux daté d'un vrai jour que la page signale (en-tête de `page.tsx`, 01/10) |
| `private-assets/raw/modele-gratuit/captures/modele-mode-emploi.png` (01/10 19:08) | Texte périmé. Son point 1 dit encore « TER et cours. Tout est dans les cases bleues », réécrit depuis (B6 et B11) parce qu'il faisait figer les cours dans Google Sheets. Pour montrer le mode d'emploi, il faudrait d'abord une capture neuve du fichier actuel. Il est donc seulement **nommé** (P5) |
| Dashboard, Versement du mois, PEA, Projection, Frais | Onglets du Cockpit payant, absents du modèle gratuit |
| Colonnes Plus-value et Perf. de Par ETF (« +1 245,56 € », « +27,8 % » en vert) | Même décision que pour le Cockpit (§9, P4) : c'est une performance passée réelle de trois ETF nommés, et le chiffre le plus coloré de l'image. La plus-value est seulement **nommée** dans le sous-titre de l'affiche |
| Ligne TOTAL de Par ETF | Sept lignes vides la séparent du tableau, et elle ajoute deux montants sans rien apprendre |

### Écarts avec la commande

| Proposé dans la commande | Retenu | Pourquoi |
|---|---|---|
| « Vous suivez votre PEA dans un carnet ? » | « Combien vous a coûté chaque part ? » | Le « carnet » ne vient d'aucune source et suppose une pratique du lecteur. La question retenue vient de la FAQ de la page, et le modèle y répond (P3, PRU) |
| Vue par ETF avec la plus-value latente, qualifiée | PRU, total investi et valeur ; plus-value nommée, pas chiffrée | Voir ci-dessus (cohérence avec le Cockpit §9) |
| « Excel 365 Stocks selon la page » | Excel : « les cours, saisis à la main » | La page dit qu'Excel pour Microsoft 365 a un type Actions, mais que **nos formules n'en dépendent pas**. Écrire « automatique » pour Excel serait faux pour ce fichier |
| Fin avec un clin d'œil éventuel au Cockpit (19 €) | Aucun | Voir P5 |

---

## 2. Format

| | Boucle du modèle gratuit |
|---|---|
| Composition | `BoucleModeleGratuit` (`src/modele-gratuit/BoucleModeleGratuit.tsx`, zones dans `src/zones-modele-gratuit.ts`). `Boucle`, `BoucleCockpit`, `Complete`, `CompleteCarree`, la musique et la bande-son ne sont pas touchés : seuls `Racine.tsx` (une `<Composition>` de plus), `rendre.mjs`, `images-controle.mjs` et `extraire-donnees.mjs` gagnent une entrée |
| Taille | 1080×1080, 30 i/s |
| Durée | Scénario de **480 images** (P1 à P5), plus un **arrêt de 30 images** sur l'affiche, soit **510 images (17,0 s)** dans le fichier |
| Son | Aucune piste audio, et pas de version avec le son (§6) |
| Sorties | `out/boucle-modele-gratuit.webm` (VP9), `out/boucle-modele-gratuit.mp4` (H.264, QP constant comme les deux autres), `out/boucle-modele-gratuit-affiche.jpg` (`npm run rendu -- modele`) |
| Objectifs | Moins de 1,5 Mo par fichier vidéo ; affiche sous 120 Ko |

**Raccord : même mécanique que `BoucleCockpit`.**
- Réglages : `ARRETS = [{ a: 255, duree: 30 }]` et `DEPART = 255`.
- L'image 0 du fichier est l'image 255 du scénario, l'état final de la vue par ETF : c'est **l'affiche**.
- La dernière image du fichier (509) est l'image 254 du scénario.
- **Tout est immobile de 244 à 269 :** le dernier anneau (222) est posé à 244, puisque `etat()` d'`Accents.tsx` finit à début + 22.
- Les images 0 et 509 sont donc identiques. `rendre.mjs` le prouve (même SHA-256).
- Ordre vu par le visiteur au premier tour : l'affiche (le produit), Excel ou Sheets, la fin (« Gratuit · reçu par email »), puis la question, le journal, et de nouveau la vue par ETF.

**Lisibilité (mesurée au pixel sur les captures le 04/10).**
- La hauteur des capitales des chiffres sert de mesure.
  - **Transactions :** 20 px à l'échelle 1, soit un corps d'environ 28 px. C'est le seuil : cette capture n'est **jamais réduite**.
  - **Par ETF :** 23 px à l'échelle 1, soit un corps d'environ 32 px (« les cellules du classeur font 32 px », §2 du storyboard du Cockpit). À l'échelle 0,95, cela donne environ 30 px.
- Seule la barre de fenêtre (24 px, copie du composant `Fenetre`) est plus petite. C'est la même exception que pour le Cockpit, déjà relue.
- Titres en Newsreader 84 à 92 ; sous-titres en Inter 38 à 42, slate-300 ; mentions en Inter 34, slate-400 ; pastille en Inter 36.

**Barre de fenêtre :** celle de `BARRE_FENETRE` (`zones-cockpit.ts`, à recopier dans `zones-modele.ts`). Elle porte le nom réel du fichier livré, « Modele-suivi-PEA_dcatracker.xlsx », puis « · Transactions » ou « · Par ETF ».

---

## 3. Le scénario, plan par plan

Les numéros d'image sont ceux du **scénario**. Mouvements de la charte :
- entrées en `ease-out-expo` ; montée de 26 px pour les textes, de 90 px pour les fenêtres ; décalage de 4 images dans une série ;
- sorties : glissement de −80 px avec un fondu ; l'affiche (P3), elle, recule (échelle 1 → 0,92) ;
- aucun rebond, aucun compteur, aucun montant qui défile ;
- pas de point blanc (marqueur) sur une capture.

### P1. La question (images 0 à 69, 2,3 s)

- **Texte :**
  - « **Combien vous a coûté chaque part ?** » : Newsreader 88, blanc, centré, sur deux lignes (« Combien vous a coûté » / « chaque part ? »), haut du bloc en y = 300.
  - En y = 560 : « **Frais de courtage compris, ETF par ETF** », Inter 40, slate-300, centré.
- **Sources :** FAQ (« ce que chaque part vous a réellement coûté ») et mode d'emploi B24 (« Les frais de courtage sont inclus dans votre PRU »). C'est une question : elle n'affirme rien.
- **Mouvement :** titre de 4 à 16 (`Revele`, flou 6) ; sous-titre à 10 ; sortie de 56 à 68.
- **Anneaux :** aucun. **Mention :** aucune (aucun montant).
- **Maquette :** `p1-question-*.png`.

### P2. Le journal des achats (images 66 à 164, 3,3 s)

- **Texte :**
  - « **Une ligne par achat** » : Newsreader 84, en (80 ; 72).
  - « **Date, ticker, parts, prix, frais** » : Inter 40, slate-300, en y = 190. Ce sont les mots du mode d'emploi B12 ; la page dit la même chose en toutes lettres (§3).
- **Mention**, posée avec la fenêtre (Inter 34, slate-400, à 34 px sous la fenêtre) : « **Exemple pré-rempli, extrait du fichier :** » / « **achats fictifs, cours de clôture réels** ».
- **Capture :** `modele-suivi-pea-transactions.png`, échelle **1**, recomposée en cinq morceaux : les cinq colonnes que l'on saisit (cases bleues). « Montant total » et « Note » sont retirés : ils ne tiennent pas dans 920 px à l'échelle 1, et le total revient en P3 sous la forme du « Total investi ».

  | Morceau | Zone du PNG [x1, x2] | Position x |
  |---|---|---|
  | Date | [58, 226] | 0 |
  | ETF (ticker) | [242, 398] | 168 |
  | Parts achetées | [486, 673] | 324 |
  | Prix unitaire (€) | [722, 924] | 511 |
  | Frais (€) | [960, 1089] | 713 |

  - **Hauteur :** de y = 376 à 810. L'en-tête va de 376 à 460 (filet en 459), puis sept lignes de 50 px : trois achats en janvier, trois en février, et PE500 le 15/03/2024.
  - **Fondu :** la septième ligne se fond dans le blanc sur ses 70 derniers px, pour dire que le journal continue (1 000 lignes sont prévues, mode d'emploi B23).
  - **Mise en page :** largeur 842 px, centrée dans la fenêtre (39 px de chaque côté). Fenêtre de 920×504 (barre de 70 comprise), posée en (80 ; 290).
  - **Pas de panoramique :** essayé en maquette avec « Montant total », 1 031 px. Une date coupée au bord (« 024 ») et l'anneau collé au bord droit ; abandonné.
- **Accents :**
  - `Bande` sur la première ligne (y = 460 à 509, toute la largeur de la recomposition) à 104, `repos` 0,55 ;
  - `Anneau` sur ses frais, « 1,99 € » (texte en [1004, 475, 1081, 499] ; zone [1000, 471, 1085, 503], marge 8), à 116. **Pourquoi les frais :** ils mènent au « PRU frais inclus » de P3 et répondent à la question de P1.
- **Mouvement :**
  - fenêtre de 68 à 94 (opacité de 68 à 78, montée de 90 px), mention en même temps ;
  - titre à 66, sous-titre à 70 ;
  - sortie de 150 à 164.
- **Maquettes :** `p2-journal-debut-*.png` (sans accent) et `p2-journal-fin-*.png` (bande et anneau).

### P3. La vue par ETF : l'AFFICHE (images 160 à 284, 4,1 s, plus l'arrêt de 30 images à 255)

- **Texte :**
  - « **Suivez votre PEA** » : Newsreader 84, en (80 ; 72). Vient du H1, « Suivre votre PEA dans Excel ou Google Sheets ».
  - « **PRU frais inclus, valeur, plus-value, poids** » : Inter 38, slate-300, en y = 190. C'est le texte de la page (« Deux façons de faire ») et du mode d'emploi B3, **copié** par le script et non retapé.
- **Pastille** (`Pastille`, Inter 36), à 40 px sous la fenêtre : « **Modèle gratuit · Excel + Google Sheets** ». C'est elle qui fait dire à l'affiche, à elle seule, ce que l'on reçoit. Même place que la pastille « Cockpit DCA · 19 €, paiement unique » du plan B4 de l'accueil.
- **Mention**, posée avec la fenêtre (Inter 34, slate-400, deux lignes sous la pastille) : « **Exemple pré-rempli, extrait du fichier :** » / « **achats fictifs, cours de clôture du 2 octobre 2026** ». La date est tirée de `DATE_CAPTURES`. Le « Valeur actuelle (€) » de l'en-tête est ainsi daté, jamais présenté comme un cours du jour.
- **Capture :** `classeur/cockpit-v2-par-etf.png`, échelle **0,95**, deux morceaux :

  | Morceau | Zone du PNG [x1, x2] | Position x |
  |---|---|---|
  | Ticker | [40, 220] | 0 |
  | Total investi, PRU, Valeur actuelle | [2100, 2875] | 180 (× 0,95) |

  - **Hauteur :** de y = 396 à 686 (en-tête, puis PE500, ETZ, PAEEM).
  - **Ce qui est retiré :** le nom de l'ETF (le ticker suffit), l'allocation cible, le TER, les trois colonnes de cours, les parts, la plus-value, la perf., le poids et l'écart.
  - **Mise en page :** largeur 907 px, fenêtre de 920×394 (barre 70, marges blanches de 24 px en haut et en bas), posée en (80 ; 290).
- **Mouvement et accents :**
  - 164 → 190 : la fenêtre monte (opacité de 164 à 175, montée de 90 px, `rotateX` de 8° à 0°, origine en bas, comme B4). Titre à 162, sous-titre à 166, mention à 164, pastille à 190.
  - 196 → 214 : **les calculs apparaissent.** Un cache blanc (fond des cellules calculées) couvre les valeurs de Total investi, PRU et Valeur, sous leur en-tête, puis se retire de haut en bas (`ease-out-quart`).
    - Zone du cache : de x = 2100 à 2875, de y = 490 à 686 dans le PNG.
    - Rien n'est redessiné : on découvre les pixels de la capture.
    - C'est la phrase de l'onglet (ligne 2 de Par ETF) : « PRU, valeur et performance se calculent seuls ».
  - 222 : `Anneau` sur le PRU de PE500, « 44,40 € » (texte en [2435, 512, 2547, 535] ; zone [2425, 503, 2557, 544], marge 4), à sa taille finale, sans balayage.
  - Repos de 244 à 269 : tout est immobile. L'arrêt de 30 images à 255 donne l'affiche.
  - 270 → 284 : la fenêtre recule (échelle 1 → 0,92, opacité → 0).
- **L'affiche, à elle seule** (maquette `p3-par-etf-affiche-1080.png`) :
  - elle dit « suivre son PEA », « modèle gratuit », « Excel + Google Sheets » ;
  - elle montre le vrai fichier et ce qu'il calcule (le PRU frais inclus) ;
  - elle porte la mention « Exemple pré-rempli » datée ;
  - elle ne montre aucune plus-value chiffrée.
  - Lisible à 343 px : `p3-par-etf-affiche-343.png`.

### P4. Excel ou Google Sheets (images 280 à 374, 3,1 s)

- **Texte :**
  - « **Excel ou Google Sheets** » : Newsreader 84, en (80 ; 72). Titre du §8 de la page.
  - « **Les mêmes formules dans les deux** » : Inter 38, slate-300, en y = 190. Source : la FAQ (« Les formules du suivi sont les mêmes dans les deux ») et le tableau du §8.
- **Deux cartes blanches**, rounded 24, padding 36, de 440×400, en (80 ; 300) et (560 ; 300). Nom en Inter 700 44 gray-900 ; lignes en Inter 36, slate-600, la fin en 600 gray-900.
  - **Excel :** « Le fichier, **sur votre ordinateur** » ; « Les cours, **saisis à la main** ».
  - **Google Sheets :** « Une copie, **dans votre Drive** » ; « Les cours, **automatiques*** ».
- **Mention** en y = 740 : « **\* avec GOOGLEFINANCE, tant que la colonne** » / « **« Cours manuel » reste vide** ». C'est la condition écrite dans l'email, la page et le mode d'emploi (B11, B20) : le cours manuel, s'il est rempli, passe devant le cours automatique.
- **Pas de capture :** la note de Par ETF qui le dit (ligne 4) fait 24 px, et la colonne « Cours auto (Sheets) » est vide sur une capture faite dans Excel. Les cartes sont du texte, dans le style des cartes du site, sans logo de Microsoft ni de Google : aucun logo inventé ni emprunté.
- **Anneaux :** aucun. Mettre en avant les cours automatiques de Sheets reviendrait à survendre une fonction soumise à condition.
- **Mouvement :** titre à 280, sous-titre à 284, cartes à 286 et 290 (montée de 26 px), mention à 294 ; sortie de 360 à 374.
- **Maquette :** `p4-excel-sheets-*.png`.

### P5. Fin (images 370 à 479, 3,7 s)

- **Visuel :**
  - LogoMark 112 px centré, haut en y = 230 (`LogoMarkAnime` : le carré dès 368, pendant la sortie de P4, puis le trait et le point jusqu'à 386) ;
  - « **Modèle de suivi PEA** » : Newsreader 92, blanc, centré, en y = 385 ;
  - « **Excel + Google Sheets,** » / « **avec son mode d'emploi** » : Inter 42, slate-300, deux lignes centrées, en y = 525 ;
  - pastille « **Gratuit · reçu par email** » (Inter 36), centrée, en y = 700.
- **Sources :**
  - « mode d'emploi » : page §9 (« avec son mode d'emploi ») ;
  - « Gratuit » : page (« modèle gratuit ») ;
  - « reçu par email » : formulaire (« Fichier Excel et copie Google Sheets, par email »).
- **Mouvement :**
  - titre à 376, sous-titre à 380 et 384, pastille à 390 ;
  - tenue jusqu'à 464 ;
  - fondu de 464 à 476 (opacité 0 dès 476). P1 entre à 4 au tour suivant : 8 images sombres au plus, à mesurer sur le MP4 décodé comme pour le Cockpit.
- **Pas de clin d'œil au Cockpit, et pourquoi :**
  - sur la page, le Cockpit est **juste à côté** de la vidéo (§6) : à droite sur ordinateur, juste en dessous sur téléphone ;
  - le mode d'emploi (B27 à B29, « Ce que ce modèle ne fait pas ») et l'email le présentent déjà ;
  - finir la boucle gratuite sur un prix ferait de sa dernière image une offre payante.
  - **Option, si Maël le veut :** une ligne Inter 32, slate-400, en y = 800, « Version complète : Cockpit DCA, 19 € ». Le prix serait lu dans `priceEur`. Non recommandé.
- **Maquette :** `p5-fin-*.png`.

### Résumé du minutage

| Plan | Images du scénario | Durée | Image clé |
|---|---|---|---|
| P1 La question | 0 – 69 | 2,3 s | |
| P2 Le journal | 66 – 164 | 3,3 s | anneau des frais « 1,99 € » (116) |
| P3 Par ETF | 160 – 284 | 4,1 s + 1 s d'arrêt | **affiche = image 255** |
| P4 Excel ou Sheets | 280 – 374 | 3,1 s | |
| P5 Fin | 370 – 479 | 3,7 s | |
| **Fichier** | 510 images | **17,0 s** | image 0 = 509 = affiche |

Fil : la question (combien m'a coûté chaque part, frais compris) ; ce qu'on saisit (une ligne par achat, frais compris) ; ce que le fichier calcule (le PRU frais inclus) ; où il tourne (Excel ou Sheets) ; ce qu'on reçoit (gratuit, par email).

---

## 4. Honnêteté : contrôle plan par plan

| Règle | Comment elle est tenue |
|---|---|
| « Exemple pré-rempli » dès qu'un montant est lisible | P2 et P3 (affiche comprise), posé avec la fenêtre. P1, P4 et P5 n'ont aucun montant |
| Aucune performance mise en avant | Plus-value et perf. retirées de la capture ; aucun anneau sur une valeur ; aucun TRI. La plus-value est seulement nommée (sous-titre de P3) |
| Aucun cours figé présenté comme actuel | « Valeur actuelle » daté par la mention (« cours de clôture du 2 octobre 2026 ») ; les dates du journal (2024) sont visibles |
| Aucune promesse que la page ne fait pas | Excel : cours saisis à la main (nos formules ne lisent pas le type Actions). Sheets : « automatiques » avec la condition de la colonne F. Aucun TRI, versement du mois ni PEA : ils ne sont pas dans le modèle gratuit |
| « Gratuit » et « par email » | Formulaire et email : fichier Excel (lien valable 30 jours) et copie Google Sheets, par email. La boucle ne dit pas « immédiat » ni « sans inscription » |
| Aucun chiffre écrit à la main | Date, PRU de l'affiche (pour le texte alternatif) et phrases viennent de `donnees.json` (§5) |
| Pas de conseil | Les ETF de l'exemple sont ceux du jeu de démonstration. Aucun « acheter », aucune allocation montrée (colonne « Allocation cible » retirée) |

---

## 5. Données : ce que `scripts/extraire-donnees.mjs` doit ajouter (clé `modeleBoucle`)

Le script **s'arrête** si une valeur manque ou diverge.

1. **`dateExemple` :** `DATE_CAPTURES` mis en forme (« 2 octobre 2026 »).
2. **Sheets existe :** `MODELE_GRATUIT_SHEETS_COPIE` doit être non nul dans `ressources-gratuites.ts`. S'il passe à `null`, la page et l'email ne parlent plus de Sheets, et la boucle (pastille, P4, P5) deviendrait fausse.
3. **Phrases, vérifiées et copiées :**

   | Fichier | Phrases |
   |---|---|
   | `page.tsx` | « PRU frais inclus, valeur, plus-value, poids » (copiée en sous-titre de P3) ; « Une ligne par achat » ; « la date, le ticker de l'ETF, le nombre de parts, le prix unitaire et les frais » ; « ce que chaque part vous a réellement coûté » ; « Dans un fichier, sur votre ordinateur » ; « Dans votre Google Drive » ; « Saisis à la main dans nos fichiers » ; « tant que la colonne du cours manuel reste vide » ; « Les formules du suivi sont les mêmes dans les deux » ; « avec son mode d'emploi » ; « L'onglet Par ETF (Cockpit et modèle gratuit) » (écrit `L&apos;onglet` dans le JSX) ; `capture("cockpit-v2-par-etf.png")` |
   | `ModeleGratuitForm.tsx` | « Fichier Excel et copie Google Sheets », « par » / « email » |
   | `emails/modele-gratuit.ts` | « Cours manuel », « reste vide » |
   | `api/products/download/route.ts` | `downloadName: "Modele-suivi-PEA_dcatracker.xlsx"` (barre de fenêtre) |
4. **Captures :**
   - SHA-256 de la copie `video-accueil/public/captures/modele/modele-suivi-pea-transactions.png` égal à celui de `../public/ressources/modele-suivi-pea-transactions.png` ;
   - SHA-256 de `classeur/cockpit-v2-par-etf.png` égal à celui de `../public/produits/cockpit-v2-par-etf.png` ;
   - les deux empreintes inscrites dans une liste `CAPTURES_RELUES`, comme `AFFICHE_RELUE` pour le Cockpit, **après relecture à l'œil**. Si l'exemple est régénéré, le rendu s'arrête au lieu de montrer un ancien exemple.
5. **Exemple recalculé** avec `cockpit-exemple.ts` (chargé par Node, comme pour le Cockpit) :
   - tickers PE500, ETZ et PAEEM, dans cet ordre ;
   - PRU de PE500 = 44,40 € à l'arrondi ;
   - premier achat : 15/01/2024, PE500, 4 parts, 1,99 € de frais.

   Ces valeurs vont dans `modeleBoucle.exemple`, pour le texte alternatif et pour le garde-fou côté site.

**Garde-fou côté site,** sur le modèle de `DANS_LA_VIDEO_COCKPIT` :
- `src/lib/video-accueil.ts` reçoit `VIDEO_MODELE` (`/video/modele-<sha8>.webm|mp4`, `/video/modele-affiche-<sha8>.jpg`) et `DANS_LA_VIDEO_MODELE = { dateExemple, sheets: true, pruPe500, fichier }`.
- Au build, au moindre écart (`DATE_CAPTURES`, `MODELE_GRATUIT_SHEETS_COPIE` devenu `null`, PRU, nom du fichier), la vidéo **n'est pas rendue**. Elle ne remplace aucun visuel (§6) : la page redevient simplement celle d'aujourd'hui. Un avertissement est écrit dans le journal du build.

---

## 6. Emplacement sur la page

### État actuel

Mesuré en production le 04/10 (Playwright, `https://dcatracker.fr/suivi-pea-excel`) :

| | Téléphone 390×844 | Ordinateur 1440×900 |
|---|---|---|
| En-tête (H1 + sous-titre) | 236 → ~740 | 228 → ~700 |
| Encadré « Deux façons de faire » | 850 → 1490 | 605 → 1006 |
| Champ email du haut / bouton « Recevoir le modèle » | 1046 / **1096 → 1136** | 805 / **805 → 847** |
| Première image de la page (journal, §3) | 4 089 | 2 540 |
| Formulaire du bas (§9) | 10 729 | 8 031 |

**Constat :**
- **Sur téléphone, le formulaire n'est déjà pas dans le premier écran** : son bouton est à 1 096 px, pour un écran de 844 px. L'en-tête occupe tout le premier écran. Aucune place pour la vidéo ne peut l'y faire entrer ; la contrainte devient donc « ne pas le repousser **davantage** ».
- **Sur ordinateur, il y est** (bouton à 805–847 px). Rien ne doit passer au-dessus de lui.
- **Aucun visuel statique n'est redondant près du formulaire :** il n'y en a aucun avant 2 540 px. La capture Transactions du §3 n'est pas redondante :
  - elle illustre l'article, en entier et avec sa légende détaillée ;
  - elle figure dans les `images` de l'Article (JSON-LD émis par `ArticleByline`), qui ne doit pas changer.
- La vidéo est donc un **ajout**, et non un remplacement comme pour le Cockpit.

### Les options

| | (a) Au-dessus de l'encadré | (b) Dans la colonne gratuite, au-dessus du formulaire | (c) Dans l'encadré, **après** le formulaire (recommandé) | (d) Près du formulaire du bas (§9) |
|---|---|---|---|---|
| Bouton du haut, téléphone | 1 096 → ~1 480 | 1 096 → ~1 470 | **inchangé** | inchangé |
| Bouton du haut, ordinateur | 805 → ~1 310 : **sort du premier écran** | 805 → ~1 140 : **sort du premier écran** | **inchangé** | inchangé |
| Taille de la vidéo | 480 | 316 px sur ordinateur : sous la taille de 343 px vérifiée | 358 px sur téléphone, 480 sur ordinateur | 480 |
| Vue par qui | Tous | Tous | Tous ceux qui voient le formulaire du haut | Ceux qui ont lu 8 000 à 10 000 px |

### Recommandation : (c), une seule vidéo dans l'encadré « Deux façons de faire », placée par la grille

- **Ordre dans le code,** dans `<div className="grid gap-6 sm:grid-cols-2">` :
  1. la colonne gratuite (`#modele-gratuit` : titre, texte, `ModeleGratuitForm`), inchangée ;
  2. **la vidéo** : `<figure className="sm:col-span-2 sm:order-last">` ;
  3. la colonne du Cockpit, inchangée.
- **Téléphone (une colonne) :** formulaire, vidéo, Cockpit.
  - La vidéo vient juste sous la case à cocher et la ligne « Fichier Excel et copie Google Sheets, par email ». Elle occupe ~1 294 → 1 652 (358 px), puis sa légende.
  - Le formulaire ne bouge pas. Au deuxième écran (844 → 1 688), on voit ensemble le titre de l'encadré, le formulaire et la presque totalité de la vidéo.
  - Le Cockpit descend d'environ 420 px, ce qui va dans le sens voulu : il est le complément, pas l'appel principal.
- **Ordinateur (deux colonnes) :** la vidéo passe en deuxième rangée, sur toute la largeur de l'encadré, centrée, `max-w-[480px]`.
  - Formulaire et Cockpit restent côte à côte en première rangée : bouton toujours à 805 px, dans le premier écran.
  - La vidéo commence vers 1 006 px, juste sous le pli. Le haut de l'affiche (« Suivez votre PEA ») se devine à 900 px.
- **Légende** (`figcaption`, `text-xs text-gray-500`, comme les légendes de la page), centrée sous la vidéo : « **Ce que contient le modèle gratuit : le journal des achats et la vue par ETF. Exemple pré-rempli (achats fictifs, cours de clôture du 2 octobre 2026).** » La date vient de `DATE_CAPTURES`. Sur ordinateur, la légende lève l'ambiguïté : la vidéo, sous les deux colonnes, montre le modèle gratuit et non le Cockpit.
- **Lecteur :** `HeroVideoLecteur`, avec une **nouvelle variante `article`**. Les variantes `accueil` et `produit` restent inchangées.
  - `conteneur` : « relative mx-auto w-full max-w-[480px] » ;
  - `cadre` : « relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-950 shadow-card-lg ring-1 ring-slate-900/10 » ;
  - `coinBouton` : « right-3 bottom-3 ». Le coin bas-droit (x ≥ 900, y ≥ 940 dans l'image 1080) est vide sur les cinq plans des maquettes ; le haut-droit, lui, est pris par le titre de P4 (jusqu'à x ≈ 956). À vérifier sur les images de contrôle.
  - Pas de version avec le son (`avecSon` absent). Elle n'existe pas pour ce produit, et celle de l'accueil parle d'autre chose.
- **Affiche et performance :** la vidéo est sous le premier écran sur les deux formats. Donc :
  - l'affiche est une `<img>` rendue par le serveur avec `width`/`height` 1080, `loading="lazy"` et `decoding="async"`, **sans** `fetchPriority="high"` et sans `preload()` ;
  - le LCP reste le texte de l'en-tête ;
  - le lecteur ne pose déjà les sources qu'après `load` et quand le cadre est visible (IntersectionObserver).
- **Texte alternatif** (`aria-label` de la figure), avec ses chiffres lus dans `cockpit-exemple.ts` : « Animation muette de 17 secondes sur l'exemple pré-rempli du modèle gratuit : le journal des achats, une ligne par achat (date, ticker, parts, prix, frais) ; la vue par ETF avec le PRU frais inclus (44,40 € pour PE500 dans l'exemple) ; Excel ou Google Sheets ; puis Modèle de suivi PEA, gratuit, reçu par email. »
- **Ce qui ne bouge pas :**
  - `ModeleGratuitForm`, `/api/subscribe`, les emails et les URL ;
  - le JSON-LD : FAQPage, Article de `ArticleByline` (dont ses `images`) et BreadcrumbList. **À vérifier après intégration :** diff du JSON-LD de la page construite, avant et après ;
  - le formulaire du bas et le `RenvoiProduit`.
- **Écarté :**
  - une deuxième copie de la vidéo près du formulaire du bas (§9) : double poids, pour peu de lecteurs ;
  - un lien « Recevoir le modèle ↑ » sous la vidéo : sur téléphone, le formulaire est juste au-dessus, et sur ordinateur, à côté.

---

## 7. Preuves à fournir au rendu (personne ne peut regarder la vidéo en mouvement)

1. `npm run controle -- BoucleModeleGratuit` :
   - images 0, 30, 104, 116, 200, 222, 255, 300, 400, 470, 478 et 509 ;
   - plus une planche contact.
2. Images 0 et 509 identiques (SHA-256). Affiche JPEG comparée à l'image 0 décodée : écart moyen de moins de 1 niveau.
3. Chaque image clé réduite à **343 px** et **480 px**, puis regardée :
   - « 1,99 € », « 44,40 € » et les mentions sont lisibles ;
   - aucun anneau ne coupe un chiffre ;
   - le bouton du lecteur (bas-droit) ne couvre rien.
4. Tailles : WebM et MP4 sous 1,5 Mo, affiche sous 120 Ko.
5. Après intégration :
   - `npm run build`, puis `npx next start -p 30xx` en arrière-plan ;
   - captures Playwright à 390×844 et 1440×900 : bouton « Recevoir le modèle » à **la même position qu'aujourd'hui** (1 096 et 805 px, à quelques px près), vidéo sous le formulaire, aucun décalage de mise en page ;
   - LCP inchangé (l'affiche est en `lazy`) ;
   - JSON-LD identique avant et après ;
   - serveur arrêté par son PID ; `tsconfig.tsbuildinfo` restauré s'il a bougé.

---

## 8. À décider par Maël

1. **Plus-value dans l'image :** retirée, et depuis la relecture du 04/10 (§10), **plus déductible non plus** : « Valeur actuelle » a été remplacée par « Parts détenues ». À côté de « Total investi », elle laissait lire +27,8 % pour PE500. Pour revenir en arrière, il suffit de changer le second morceau de `PAR_ETF` dans `zones-modele-gratuit.ts` et la ligne correspondante de `LU_SUR_LES_CAPTURES`. Ce serait alors la colonne en euros seulement, sans le %, sans anneau, sous la mention datée.
2. **Clin d'œil au Cockpit à la fin** (toujours ouvert, rien n'est ajouté) : non recommandé (P5). Possible en une ligne discrète, avec un prix lu dans `priceEur`.
3. **Titre de l'affiche** (toujours ouvert) : « Suivez votre PEA » reprend le H1 de la page. Le plan B4 de la boucle d'accueil (Cockpit) a le même titre ; la pastille « Modèle gratuit » les distingue. Autre choix : « Votre PEA, ETF par ETF ».

---

## 9. Premier rendu (04/10/2026) : écarts au storyboard et preuves

**Fichiers** (`out/`, ignoré par git) : `boucle-modele-gratuit.mp4` 1,21 Mo (1 270 868 o, H.264 QP 24, BT.709, sans piste audio, `moov` avant `mdat`) ; `boucle-modele-gratuit.webm` 0,90 Mo (947 082 o, VP9 CRF 32, deux passes) ; `boucle-modele-gratuit-affiche.jpg` 103 Ko (105 784 o, image 0). 510 images, 17,0 s.

**Raccord.** PNG de Remotion des images 0 et 509 identiques (SHA-256) ; MP4 décodé : écart 0 ; WebM décodé : 20/255 au plus, 17 pixels au-delà de 16 (même ordre que les deux autres boucles). Affiche face à l'image 0 décodée : écart moyen par canal 2,66 / 2,48 / 2,69 (biais de décodage de ffmpeg, comme pour le Cockpit).

**Écarts au storyboard, tous décidés sur les images de contrôle :**

| Storyboard | Rendu | Pourquoi |
|---|---|---|
| Titres en (80 ; 72), sous-titres en y = 190 | (80 ; 92) et y = 200 | Mêmes composants `Titre` et `SousTitre` que la boucle du Cockpit (Newsreader 700) : les deux boucles ont la même mise en page |
| Journal de y = 376 à 810, cinq morceaux | De y = 355 (20 px du blanc du fichier au-dessus de l'en-tête) à 810 ; six morceaux, chaque colonne gardant le blanc qui la sépare de la suivante (celui de la cellule ETF est posé à part) | Dans la maquette, deux séparateurs de colonnes manquaient sur cinq. Largeur 870 px au lieu de 842 |
| Anneau des frais : zone [1000, 471, 1085, 503], marge 8 | Zone [996, 469, 1088, 505], marge 6 | À marge 4 (premier essai), le bord touchait le « € » ; il y a maintenant 12 à 14 px d'air |
| Cache des calculs de y = 490 à 686 | De 493 à 686 | Le filet de l'en-tête (490-492) reste visible pendant que les valeurs se découvrent |
| Morceau Ticker [40, 220] | [48, 221] | Commence au bord du tableau (8 px de blanc en moins), garde le séparateur 219-220 |
| P1 entre à 4, la fin s'éteint de 464 à 476 | P1 entre dès 476 du tour précédent (rendue deux fois, comme la question du Cockpit), la fin s'éteint de 466 à 478 | Au premier rendu, 9 images sans texte lisible à la reprise ; il en reste 5 |
| Titre de P3 à 162, sous-titre à 166 | 160 et 164 | 6 images vides entre P2 et P3 ; il en reste 4 |
| Sortie de P4 de 360 à 374 ; carré du logo dès 368 ; titre de la fin à 376 | Sortie de 356 à 370 ; carré dès 366 ; titre à 371 | Image de contrôle 145 du premier rendu : le carré se posait sur la carte Google Sheets encore visible. Il y avait aussi 12 images sans texte ; il en reste 9, dont 6 avec le carré bleu posé (le Cockpit en a 8 au même endroit) |

**Images sans texte lisible** (MP4 décodé, réduit à 480 px, moins de 0,1 % de pixels de luminance > 120) : 53-56 (P3 → P4), 139-147 (P4 → fin, carré du logo dès 142), 248-252 (reprise), 318-322 (P1 → P2), 413-416 (P2 → P3).

**Preuves.**
- `out/controle/_planche-bouclemodelegratuit.png` et `out/controle/bouclemodelegratuit-NNNN.png` : 31 images de Remotion (liste commentée dans `scripts/images-controle.mjs`).
- `out/controle/decode-modele-gratuit/` : les 31 mêmes images, **décodées du MP4 livré**, réduites à 343 et 480 px (`343/`, `480/`), et leurs planches `_planche-343.png`, `_planche-480.png`. Relues à 343 px : « 1,99 € », « 44,40 € », toutes les lignes du journal, les deux mentions et la condition « Cours manuel » sont lisibles ; aucun anneau ne coupe un chiffre ; le coin bas-droit (bouton du lecteur) est vide sur les cinq plans.
- Garde-fous de `scripts/extraire-donnees.mjs` (clé `modeleBoucle` de `donnees.json`) : copie Sheets non nulle, 19 phrases de la page, du formulaire et de l'email, nom du fichier livré, empreintes des deux captures (égales à celles du site et à celles relues), sept lignes du journal et trois lignes de Par ETF recalculées par `cockpit-exemple.ts` et comparées à ce que montrent les captures.

**Pas encore fait :** l'intégration à la page (§6) et le garde-fou côté site (§5, `VIDEO_MODELE`, `DANS_LA_VIDEO_MODELE`).

---

## 10. Corrections après les relectures design et exactitude (04/10/2026)

Les §3 à §5 décrivent le storyboard d'origine, et le §9 le premier rendu. Ce qui suit **remplace** les deux sur les points cités. Tout se trouve dans `src/modele-gratuit/BoucleModeleGratuit.tsx`, `src/zones-modele-gratuit.ts` et `scripts/extraire-donnees.mjs`.

| Relecture | Constat | Correction |
|---|---|---|
| Design (important) | L'anneau de l'affiche entourait « 44,40 € » sans dire ce que c'était, alors que la question de P1 restait sans réponse. Le sous-titre « PRU frais inclus, valeur, plus-value, poids » annonçait deux grandeurs absentes de l'image | Le sous-titre est remplacé par la pastille « Modèle gratuit · Excel + Google Sheets », en y = 200 (entrée à 166). Sous la fenêtre, une réponse en Inter 600 60, dans le bleu clair (`bleu300`) de « → 14 parts d'ETZ » du Cockpit : **« → 44,40 € la part, frais compris »** (entrée à 226, avec l'anneau). Le montant vient de `donnees.json` (`modeleBoucle.exemple.pruPe500`). « frais compris » est la phrase de la page (§4 : « soit un PRU de 44,40 €, frais compris »). L'anneau désigne l'ETF. La mention remonte en y ≈ 825-917 |
| Exactitude (mineur, traité) | Total investi et Valeur actuelle, côte à côte, laissaient lire la plus-value de chaque ETF (+27,8 %, +17,5 %, +42,6 %) sur l'image la plus vue | Le second morceau de Par ETF devient [1920, 394, 2575, 686] : **Parts détenues, Total investi, PRU**. Les coupes sont nettes : pixels identiques sur toute la hauteur de x = 1900 à 1945 et de 2550 à 2595. Échelle 0,95 → 1,05 (largeur 869 px), marges blanches 24 → 16 px, fenêtre en y = 304. L'image montre maintenant le calcul que la vidéo annonce : 4 484,17 € pour 101 parts, soit 44,40 €. Comme aucune valeur de marché n'est affichée, la mention de P3 n'a plus besoin de date : « achats fictifs, cours de clôture réels », comme en P2 |
| Design (important) | Fin : « Gratuit · reçu par email » était l'élément le plus petit, dans une mise en page identique à celle du Cockpit, où seule la pastille distinguait les deux produits | La pastille est remplacée par la réponse **« → Gratuit, reçu par email »** (Inter 600 60, `bleu300`, centrée, entrée à 398). Le bloc logo → réponse est centré verticalement (y = 279 → 801) ; le coin bas-droit reste vide (luminance maximale de 43 sur les 510 images décodées, fond seul) |
| Design (important) | P2 : l'anneau désignait un « 1,99 € » identique sur les sept lignes, et restait immobile 0,9 s | Un seul anneau, autour de **la colonne « Frais (€) »**, de l'en-tête à la 6e ligne : zone [976, 392, 1090, 756], marge 6, entrée à 100. La bande sur la 1re ligne est retirée. L'anneau reste immobile de 108 à 150, soit 42 images, comme celui de P2 du Cockpit. Son bord gauche est à 21 px du « € » des prix ; son bord bas, à 13 px du texte de la 7e ligne |
| Design (important) | P4, le plan le plus dense, n'était lisible en entier que 1,9 s ; P5 restait 2,4 s pour 15 mots | La sortie de P4 passe de 356 à **371** (→ 385). P4 reste lisible en entier de l'image 75 à 147 du fichier (2,4 s). La fin commence plus tard : carré du logo à 383, titre à 384, lignes à 388 et 392, réponse à 398. Le fondu reste de 466 à 478, et la durée totale ne change pas |
| Design (mineur) | Le carré du logo se posait sur la carte Google Sheets encore visible (images 142-143) | Le carré entre à 383, 12 images après le début de la sortie de P4, au lieu de 10. Sur le MP4 décodé, à l'image 159, la luminance moyenne est de 42,6 pour le carré et de 5,1 pour la zone de la carte, soit celle du fond (5,0) : la carte est éteinte. À l'image 158, le carré n'a pas encore commencé |
| Exactitude (important) | La carte « Excel — Les cours, saisis à la main » laissait croire qu'Excel ne sait pas récupérer de cours, alors que la page dit « dans nos fichiers » | Cartes **« Fichier Excel »** (« Il reste sur votre ordinateur », « Ses cours, saisis à la main ») et « Google Sheets » (« Une copie, dans votre Drive », « Ses cours, automatiques* »). « Ses » rattache les cours au fichier livré, pas au logiciel. « Copie Google Sheets » ne tenait pas dans les 368 px de la carte en Inter 700 44 |
| Exactitude (important) | « automatiques* » donnait la condition, mais pas le différé | Mention sur deux lignes : « \* avec GOOGLEFINANCE, différés de 20 min au plus, » / « tant que la colonne « Cours manuel » reste vide » |
| Exactitude (mineur) | « Les mêmes formules dans les deux » était plus large que la page : la colonne « Cours auto (Sheets) » est vide dans le .xlsx | « Les mêmes formules **de suivi** dans les deux », d'après la page (« Les formules du suivi sont les mêmes dans les deux ») |
| Exactitude (mineur) | Le garde-fou ne reliait pas « extrait du fichier » au fichier réellement envoyé | `MODELE_LIVRE_RELU` : empreinte SHA-256 de `private-assets/modele-suivi-pea-gratuit.enc` (8d2d6c0f…9623, commit dd0c363). Le rendu s'arrête si elle change, avec un message qui dit quoi relire (Transactions!A9:E15, Par ETF!H9:J11) |

**Garde-fous ajoutés ou modifiés** (`scripts/extraire-donnees.mjs`) :
- phrases exigées dans la page :
  - « mais nos formules n'en dépendent pas » ;
  - « Automatiques avec GOOGLEFINANCE, différés de 20 min au plus » ;
  - « Le PRU est le total investi divisé par les parts » ;
  - `soit un PRU de <strong …>{eur(PE500.pru)}</strong>, frais compris` ;
  - `const PE500 = LIGNES[0];` ;
  - « (PRU frais inclus, » ;
- la 1re ligne de l'exemple recalculé doit être PE500 ;
- `LU_SUR_LES_CAPTURES.parEtf` relit les parts au lieu de la valeur : « PE500 101 4 484,17 44,40 », etc. ;
- empreinte du modèle livré ;
- le sous-titre copié (`sousTitreAffiche`) est retiré de `donnees.json`.

**Rendu final** (`npm run rendu -- modele`, 04/10) :
- `boucle-modele-gratuit.mp4` : 1,24 Mo (1 298 469 o) ;
- `boucle-modele-gratuit.webm` : 0,91 Mo (955 095 o) ;
- `boucle-modele-gratuit-affiche.jpg` : 104 Ko (106 805 o).

**Raccord :**
- PNG des images 0 et 509 : identiques ;
- MP4 décodé : écart 0 ;
- WebM décodé : 18/255 au plus, 14 pixels au-delà de 16 ;
- affiche face à l'image 0 décodée : 2,69 / 2,50 / 2,71.

**Images sans texte lisible** (MP4 décodé, réduit à 480 px, moins de 0,1 % de pixels de luminance > 120) :
- 53-56 (P3 → P4) ;
- **154-161** (P4 → fin, avec le carré du logo dès 159 ; il y en avait 139-147 au premier rendu, et 154-165 avec le titre de la fin à 388) ;
- 248-252 (reprise) ;
- 318-322 (P1 → P2) ;
- 413-416 (P2 → P3).

**Preuves :**
- `out/controle/_planche-bouclemodelegratuit.png` et ses 37 images ;
- `out/controle/decode-modele-gratuit/343/`, `480/`, `_planche-343.png` et `_planche-480.png` : les mêmes 37 images, décodées du MP4 livré.

Relues à 343 px, ces images montrent :
- l'affiche : pastille, « 101 », « 4 484,17 € », « 44,40 € » entouré, réponse et mention ;
- P2 : la colonne Frais entourée, aucun chiffre coupé ;
- P4 : les deux cartes et la note sur deux lignes ;
- la fin : « → Gratuit, reçu par email ».

