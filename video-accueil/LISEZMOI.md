# Vidéo d'accueil de dcatracker.fr

Ce projet est isolé du site. Il a son propre `package.json` et n'ajoute **aucune** dépendance au `package.json` racine. Il est exclu de `tsconfig.json` et de `.vercelignore` (il n'est jamais déployé avec le site). `node_modules/` et `out/` sont aussi exclus de `.gitignore`.

Il produit trois vidéos, fabriquées avec [Remotion](https://www.remotion.dev) : React est rendu image par image, puis encodé par l'ffmpeg livré avec Remotion.

| | Boucle | Version carrée avec le son | Version complète 16:9 |
|---|---|---|---|
| Composition | `Boucle` | `CompleteCarree` | `Complete` |
| Emplacement | Bandeau d'accueil, à droite du titre | Fenêtre ouverte par « Regarder avec le son » (décision de Maël du 03/10 : le carré, « plus pro ») | Remplacée par la version carrée ; gardée comme référence |
| Format | 1080×1080, 30 i/s, 570 images (19 s) | 1080×1080, 30 i/s, 60 temps (30 s à 120 BPM) | 1920×1080, 30 i/s, 60 temps (30 s à 120 BPM) |
| Son | Aucune piste audio | Musique (`public/musique.wav`, composée par `musique/`) et bruitages d'interface : `src/son/BandeSon.tsx`, partagé par les deux versions | Le même |
| Fichiers | `out/boucle.webm` (VP9), `out/boucle.mp4` (H.264), `out/poster.jpg` | `out/complete-carre.mp4` (H.264 + AAC), `out/complete-carre-poster.jpg`, et pour comparer `out/complete-carre-musique-seule.mp4` | `out/complete.mp4` (H.264 + AAC), `out/complete-poster.jpg` |

Le scénario, la charte et la source de chaque texte sont dans `STORYBOARD.md`. Les écarts au storyboard sont listés à la fin de ce fichier.

## Fichiers finaux (boucle : rendu du 04/10/2026 ; version complète : 02/10/2026)

| Fichier | Taille | Détail |
|---|---|---|
| `out/boucle.mp4` | 1,09 Mo (1 142 725 o) | H.264 High 4.0, 1080×1080, yuv420p, BT.709, CRF 23, **sans piste audio**, `moov` avant `mdat` (lecture immédiate), 570 images, 19,00 s |
| `out/boucle.webm` | 0,88 Mo (917 728 o) | VP9 profil 0, deux passes, CRF 32, BT.709, **sans piste audio**, 570 images, 19,00 s |
| `out/poster.jpg` | 87 Ko (88 702 o) | Image 0 de la boucle (titre, compteur arrivé, mention des frais, graphique), identique à la dernière. Sert d'affiche **et** d'image fixe quand le visiteur demande moins d'animations |
| `out/complete.mp4` | 5,82 Mo (6 100 164 o) | H.264 High 4.1, 1920×1080, BT.709, CRF 20 + AAC-LC 160 kb/s 48 kHz, 30,00 s, `moov` en tête |
| `out/complete-poster.jpg` | 66 Ko (67 241 o) | Image 75 de la version complète (carte du nom ouverte) |

Les deux fichiers de la boucle restent sous l'objectif de 1,5 Mo, et l'affiche sous 150 Ko.

**Raccord de la boucle :** la première et la dernière image sont identiques (même empreinte SHA-256), et la reprise tombe au milieu d'un plan fixe : images 567 à 569, puis 0 à 48 du fichier.

**Son de la version complète, sans musique :** −28,6 LUFS intégrés, crête −10,9 dBTP (mesure BS.1770 sur la piste décodée ; l'ffmpeg de Remotion n'a pas le filtre `ebur128`).

**Son avec la musique (03/10/2026, rendu audio seul, `npm run rendu -- son`) :** −15,99 LUFS, crête vraie −1,80 dBTP ; −16,04 LUFS et −1,71 dBTP après encodage AAC 160 kb/s. Détail dans `musique/LISEZMOI.md`, « Intégration et mixage ». `out/complete.mp4` date du 02/10 et n'a pas encore de musique : la vidéo avec le son sera la version carrée.

**Vérifié dans Google Chrome 154**, sur l'aperçu servi en local :
- **Couleurs :** l'image 0 décodée, comparée à l'affiche, s'écarte en moyenne de 0,2 à 0,3 niveau sur 255 par canal (WebM comme MP4). Le passage de l'affiche à la vidéo ne se voit pas.
- **Chargement :** l'affiche est l'élément LCP. `boucle.webm` n'est demandé qu'après l'événement `load`.
- **Moins d'animations :** seule l'affiche est chargée et le bouton pause est caché.
- **Lecture automatique refusée :** l'affiche reste et le bouton propose « Lancer l'animation ».
- **Pause, ouverture de la fenêtre, puis Échap :** la boucle reste en pause.
- **Lecture, ouverture puis fermeture :** la boucle repart.

L'aperçu se trouve dans `apercu.html` (à la racine de `video-accueil/`). Pour l'ouvrir : `python3 -m http.server 8765` depuis `video-accueil/`, puis http://127.0.0.1:8765/apercu.html. Ouvert directement en `file://`, il marche aussi, sauf dans Safari.

## Commandes

Depuis `video-accueil/` :

```sh
npm install                 # une fois
npm run captures            # refait les captures du site en production (Playwright)
npm run donnees             # relit prix, nombres d'ETF, date de vérification → src/donnees.json
npm run sons                # régénère les effets sonores → public/sons/*.wav
npm run studio              # aperçu interactif dans le navigateur (Remotion Studio)
npm run rendu               # rend tout (boucle + version complète + version carrée) → out/
npm run rendu -- boucle     # la boucle seule
npm run rendu -- carre      # la version carrée avec le son, et sa variante musique seule
npm run rendu -- complete   # la version complète 16:9 seule
npm run rendu -- complete --sans-bruitages   # la même, musique seule → out/complete-sans-bruitages.mp4
npm run rendu -- son        # le son seul (WAV), avec et sans bruitages, puis ses mesures → out/musique/
npm run controle            # images de contrôle + 3 planches contact → out/controle/
npm run controle -- CompleteCarree   # celles de la version carrée seulement, et sa planche
npm run verifier            # contrôle TypeScript du projet vidéo
```

À la fin, `npm run rendu` affiche :
- les commandes réellement lancées ;
- les tailles ;
- les étiquettes de couleur ;
- l'ordre des boîtes MP4 (faststart) ;
- le test de raccord de la boucle : dernière image identique à l'image 0.

Ce que fait le script, dans l'ordre :

1. Rendu d'un master ProRes 422 HQ en BT.709 : `npx remotion render src/index.ts Boucle out/.maitre/boucle.mov --codec=prores --prores-profile=hq --image-format=png --color-space=bt709 --muted`.
2. Encodage MP4 : `npx remotion ffmpeg -i …boucle.mov -an -c:v libx264 -preset veryslow -tune animation -crf 23 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -profile:v high -level 4.0 -g 600 -movflags +faststart out/boucle.mp4`.
3. Encodage WebM : `npx remotion ffmpeg … -c:v libvpx-vp9 -b:v 0 -crf 32` en deux passes, avec les mêmes étiquettes BT.709, vers `out/boucle.webm`.
4. Affiche : `npx remotion still src/index.ts Boucle out/poster.jpg --frame=0 --image-format=jpeg --jpeg-quality=80`.
5. Version complète : même chaîne. Le master passe par `--color-space=bt709`, puis l'encodage `-crf 20 … -c:a libfdk_aac -b:a 160k -ar 48000 -movflags +faststart` produit `out/complete.mp4`, et `--frame=75` produit `out/complete-poster.jpg`.

**Réglages sans toucher au code :**
- qualité : `QP_BOUCLE_H264=24 CRF_BOUCLE_VP9=32 CRF_COMPLETE=20 npm run rendu` (la boucle H.264 est en QP constant depuis le 04/10 : raccord identique au bit près) ;
- `GARDER_MAITRES=1` garde les masters dans `out/.maitre/`, pour réencoder sans refaire le rendu.

**Navigateur :** le rendu utilise le Chromium « headless shell » que Playwright a déjà installé pour les captures. S'il manque, Remotion télécharge le sien au premier rendu.

## La musique et les bruitages

La musique est composée et rendue par le code de `musique/` (`npm run musique`, voir `musique/LISEZMOI.md`) : `public/musique.wav`, 30,000 s, 120 BPM, calée sur les 60 temps. Ce fichier est régénérable, donc ignoré par git.

1. `npm run donnees` (lancé par `rendu`, `studio` et `controle`) détecte `public/musique.wav`, ou à défaut `public/musique.mp3`. Il écrit le nom trouvé dans le champ `musique` de `src/donnees.json`, ou `false`.
2. **La bande-son est partagée** : `src/son/BandeSon.tsx` contient la musique et les deux feuilles de bruitages. `Complete` et `CompleteCarree` l'importent de la même façon. Toutes les positions sont en temps musicaux, et la version carrée garde le découpage de `Complete` : le son est identique dans les deux formats.
3. **Sans musique,** la feuille d'origine du storyboard est jouée, notes de repère comprises : rien ne change par rapport au 02/10.
4. **Avec la musique,** il ne reste que 12 bruitages d'interface, de 0 à 40. La musique joue elle-même les notes de repère, l'impact final et les transitions de plan. Les bruitages qui doublaient un accent de la musique, étaient masqués ou tombaient à côté de la grille ont été retirés. Chacun des 12 restants est réglé 6 à 10 dB sous la musique ; tout est mesuré par `musique/mixage.py`.
5. **Pas de fondu** : la musique s'éteint d'elle-même. Un fondu de sécurité porte seulement sur les 3 dernières images.
6. **Volumes** : `VOLUME_MUSIQUE` et `VOLUME_EFFETS` (`src/tempo.ts`) valent 1. Le gain de chaque bruitage est dans sa feuille.
7. **Comparer :**
   - `npm run rendu -- son` écrit `out/musique/mix-complete.wav` et `mix-complete-sans-bruitages.wav`, puis les mesures ;
   - la prop `bruitages: false` (`--props='{"bruitages":false}'`) rend la musique seule.
8. **Pour un autre morceau :** le poser dans `public/`, puis relever son tempo, l'instant de son premier temps et sa tonalité. Lancer ensuite `npm run sons -- --bpm 118 --decalage-ms 120 --tonalite C` : les positions se recalent seules, mais la feuille de bruitages avec musique est à refaire, en la mesurant avec `musique/mixage.py`.
9. La boucle n'a aucun son et ne change pas.

## Licence de Remotion (vérifiée le 02/10/2026)

Le texte a été lu dans `node_modules/remotion/LICENSE.md` (version 4.0.532 installée).
- La **Free License** couvre « an individual » et « a for-profit organization with up to 3 employees ».
- Elle vaut pour un usage commercial ou non.
- Une entreprise individuelle sans salarié y a donc droit, sans démarche.
- Interdit : revendre ou relicencier un dérivé de Remotion lui-même. Cela ne concerne pas ce projet.
- Le même fichier annonce que la licence « will slightly change » avec Remotion 5.0 : la relire avant de passer à la version 5.

**Paquets officiels ajoutés le 04/10/2026** (accord de Maël, dans ce seul projet vidéo, jamais dans le site), en version exacte 4.0.532 (`npm install --save-exact`) :
- **`@remotion/transitions`** : son `package.json` déclare `"license": "UNLICENSED"` et le paquet n'a pas de fichier de licence propre. Il fait partie de Remotion et relève donc de la licence Remotion ci-dessus (`node_modules/remotion/LICENSE.md`) : gratuit pour une entreprise de 3 salariés au plus. Il installe aussi `@remotion/shapes` et `@remotion/paths` (MIT).
- **`@remotion/motion-blur`** : licence MIT (`"license": "MIT"` dans son `package.json`).

Les autres ingrédients :
- **Polices** : Inter et Newsreader, sous licence SIL OFL, chargées par `@remotion/google-fonts` au moment du rendu.
- **Images** : uniquement des captures de dcatracker.fr en production (`public/captures/`, `npm run captures`). Le logo est la copie exacte de `src/components/ui/LogoMark.tsx`.
- **Sons** : calculés par `scripts/generer-sons.mjs` (synthèse PCM, aucun fichier externe).
- **Musique** : synthétisée par le code de `musique/` (numpy et scipy), sans aucun échantillon externe.

## Aucun chiffre recopié à la main

`scripts/extraire-donnees.mjs` est lancé par `npm run rendu`, `studio` et `controle`. À chaque rendu, il relit :
- **dans le code du site :**
  - les frais déduits par défaut par le simulateur : `annualFeesPct` vaut `TER_REFERENCE_SIMULATEUR` (`src/lib/simulation-params.ts`), c'est-à-dire le TER de CW8 dans le catalogue (`src/lib/etf-config.ts`), soit 0,38 % ; les autres défauts du code (200 €/mois, 20 ans, 7 %) doivent être ceux lus en production ;
  - le prix du Cockpit (`src/lib/products.ts`, `priceEur`) ;
  - le prix de Premium (`src/lib/plans.ts` et `src/lib/tarifs-affiches.ts`, recoupés entre eux) ;
  - la pastille de l'accueil (`Hero.tsx`) ;
  - le nombre d'ETF éligibles du catalogue (`etf-config.ts`) et la construction de la liste vérifiée (`etf-pea-verifies.ts`). C'est ce qui justifie « 13 ETF éligibles, dont les 8 du filtre « PEA uniquement » » ;
- **dans `public/captures/textes.json`** (valeurs lues sur le site en production) :
  - 97 753 €, 200 €/mois, 20 ans, 7 %, 48 000 € ;
  - le « Rendement net : 6,62 %/an » du simulateur, qui doit valoir 7 % − les frais du code (recoupement des frais) ; dans les captures faites après le 04/10, aussi la ligne « Rendement net = 7 % − 0,38 % (frais TER) » de ses hypothèses de calcul ;
  - les 3 scénarios ;
  - 19 ETF, et 8 avec le filtre PEA ;
  - 13 ETF éligibles, liste vérifiée le 28 septembre 2026.

**Arrêt en cas de doute :** si le script ne trouve pas une valeur, ou si le code et le site en production divergent, il **s'arrête**. Mieux vaut pas de vidéo qu'un chiffre périmé.

**Rien n'est lu dans la carte de démonstration de l'accueil** (`HeroDemoCard`), que la boucle remplace (04/10/2026) : ni `scripts/captures.mjs` ni `scripts/extraire-donnees.mjs` ne cherchent plus « Montant », « Durée » ou « Tester avec mes chiffres ». Le bandeau d'accueil est capturé d'après son seul titre.

**Avant le rendu final :** relancer `npm run captures`, car l'exemple du Cockpit dépend de la date.

**Le compteur du simulateur** suit la pointe de la courbe pendant qu'elle se trace (`src/courbe.ts`) et s'arrête toujours sur la valeur du site. Le texte « 200 €/mois pendant 20 ans » n'apparaît **qu'une fois le compteur arrivé**.

**Les anneaux** sont posés d'après les positions mesurées en lisant les pixels des PNG du 02/10/2026 (`src/zones.ts`). Si les captures sont refaites et que la mise en page du site a bougé, `npm run controle` le montre tout de suite.

## Corrections après les relectures du 02/10/2026

Chaque point a été vérifié à la source avant d'être appliqué.

**Boucle**
- **Le fichier commence sur le simulateur, plus sur le logo.** L'image 0 sert d'affiche, d'image fixe (moins d'animations) et d'écran figé si la lecture automatique est refusée. Elle montre maintenant « Simulez votre DCA · 97 753 € · 200 €/mois pendant 20 ans · Hypothèse de 7 %/an avant frais, pas une prévision » avec le graphique, au lieu de répéter le logo de l'en-tête.
  - La boucle passe à 19 s : 30 images d'arrêt ont été ajoutées sur ce plan pour qu'il se lise.
  - La carte du nom passe au milieu, entre « Simulez. Comparez. Suivez. » et la question.
  - La dernière image reste identique à l'image 0. La technique : le scénario de 540 images est rejoué à partir de l'image 205 (`imageScenario()` dans `src/boucle/Boucle.tsx`).
- **Comparer :** une seule carte en grand (WPEA), recadrée sur son en-tête et large de 700 px au lieu de 330. Ses trois anneaux suivent le sous-titre : TER (frais), réplication, badge PEA. Les cartes DCAM et CW8 restent derrière, en pile.
- **Suivre :** le défilement s'arrête à x = 30, si bien que la colonne « ETF » (ETZ) et la colonne « ≈ Parts à acheter » (14) sont toutes les deux dans le cadre. L'anneau des parts apparaît à sa taille finale : un bord qui balayait la colonne faisait lire « 1 1 ».
- **Fonction payante signalée :** la fenêtre « Versement du mois » appartient au Cockpit, que le modèle gratuit n'a pas. La boucle affiche maintenant la pastille « Cockpit DCA · 19 €, paiement unique », puis « Exemple pré-rempli ».
- **« 200 €/mois pendant 20 ans »** n'apparaît qu'une fois le compteur arrivé (image 188 du scénario). Avant, il s'affichait sous « 70 409 € ».
- **Tailles des textes :** les mentions passent de 30-31 px à 34 px, les sous-titres de 38 à 40 px. Une fois la vidéo réduite à 343 px sur un téléphone de 375 px, la mention mesure environ 11 px.

**Version complète**
- **C3 :** le compteur arrive au temps 17,5. Le sous-titre « 200 €/mois · 20 ans · 48 000 € versés » n'apparaît qu'à ce moment et reste environ 1,5 s à l'écran. Les trois scénarios sont décalés d'un demi-temps (20,5 → 22,5), et leurs notes avec.
- **C4 :** les anneaux des badges « PEA », illisibles à cette taille, sont supprimés. Les cartes restent en décor ; la barre de filtres porte le message.
- **C5 :** le surtitre devient « Liste vérifiée le 28 septembre 2026 », pour l'accord (« Vérifiée » se rapportait à « 13 ETF »). Une pastille « Dont les 8 du filtre « PEA uniquement » » est ajoutée, car « 8 ETF » puis « 13 ETF » à 4 s d'écart donnaient l'impression que le site se contredisait. C'est vrai : les 13 sont les 8 du catalogue plus 5 fonds hors catalogue (EWLD, GPEA, PE500, SPEA, ESE ; `src/lib/etf-pea-verifies.ts`).
- **C7 :**
  - La capture Transactions sort par le haut au lieu de rester floutée en gris derrière.
  - La fenêtre du Cockpit est centrée verticalement.
  - L'anneau de « 300,00 € » arrive au temps 46,5, celui des parts au temps 47,5, à sa taille finale. Il est tenu environ 0,9 s avant la sortie du plan.
  - Le clic et la note suivent ces nouveaux temps.

**Fichiers**
- **Couleurs :** rendu et fichiers étiquetés BT.709. Sans étiquette, Chrome devinait la matrice et la vidéo n'avait pas exactement les couleurs de l'affiche (écart relevé par la relecture technique).
- **Image fixe :** `image-fixe.jpg` est supprimée, puisque l'affiche est désormais l'image informative. Une seule image est donc chargée, y compris pour les visiteurs qui demandent moins d'animations.
- **Aperçu :** `apercu.html`, versionné, remplace `out/apercu.html`. Il suit le plan d'intégration ci-dessous : pas d'`autoplay` dans le HTML, sources posées en JS après le chargement, bouton pause lu sur la vidéo, reprise seulement si la boucle tournait.

**Écartés ou laissés à l'intégration**
- Middleware Clerk et cache Vercel : ce sont des fichiers du site, à traiter à l'intégration (voir le plan).

## Version carrée : corrections après les relectures du 03/10/2026

Trois relectures (design, exactitude, son et image) de `CompleteCarree`. Chaque point a été vérifié sur les images de contrôle avant d'être corrigé. La version d'avant est archivée dans `out/archives/complete-carre-avant-finition.mp4`. La musique, la bande-son, les temps des coupes, la Boucle et `Complete` ne changent pas.

**Ce qui se voyait au premier visionnage**
- **C6 « PEA ou CTO ? » :** le paragraphe du calculateur, vu de près, était coupé au milieu des mots. Les deux taux sont maintenant en typographie native (140 px, environ 45 px sur un téléphone) : « PEA de plus de 5 ans · 18,6 % · prélèvements sociaux », puis « Compte-titres (CTO) · 31,4 % · prélèvement forfaitaire unique (PFU) ». Ils sont soulignés sur les clics des temps 39 et 40. Le paragraphe entier arrive ensuite en petit, en bas, comme preuve.
- **C4, pastille « Filtre « PEA uniquement » : 8 ETF » :** elle reste jusqu'à la fin du plan, au-dessus des cartes (C5 la reprend avec « Dont les 8 »).
- **C4, cartes du comparateur :** chacune devient opaque en 2 images, à 6 images d'écart, et l'interrupteur est parti avant la première. On ne lit plus une carte à travers une autre.
- **Avant la fin :** coupe franche de C8 à C9 sur l'impact du temps 56. Premium reste plein jusqu'à l'image 839 et la carte du nom tombe à l'image 840 ; il n'y a plus d'image vide.

**Finition**
- **Coupes :** chaque plan sort en 10 images centrées sur le temps de la coupe (de t(n) − 5 à t(n) + 5), et non plus en 14 images qui culminaient 2 images avant. L'en-tête et la capture du plan suivant n'apparaissent qu'à partir de t(n) + 2, quand l'ancien en-tête est à 11 % : deux surtitres ne s'écrivent plus l'un sur l'autre.
- **C1 :** logo de 160 px au lieu de 120 (51 px sur un téléphone), et visible à 35 % dès l'image 0.
- **C3, graphique :** il est recadré sur ses axes et ses courbes, puis centré sous la mention. Il finit à y = 996 au lieu de déborder de 93 px.
- **C3, compteur :** il arrive sur 97 753 € à l'image 263, sur la cloche du temps 17,5, et non 5 images avant. Le balayage s'arrête sur « 20 ans » ; `courbe.ts` n'a pas changé.
- **C3, réglages :** les pastilles arrivent sur les « pings » des demi-temps 13,5, 14,5 et 15,5, et les anneaux restent sur les temps.
- **C3, enchaînements :**
  - pas de chevauchement entre le compteur, le sous-titre et la mention ;
  - le graphique est parti avant que les scénarios entrent ;
  - la fenêtre des scénarios reste centrée sur la carte allumée, et ses bords se fondent dans le blanc : plus de « 753 € » ni de « 3,7 % » tronqués.
- **C4 :** l'interrupteur est affiché à ×1,95, ce qui reste net. Le mot du sous-titre que désigne chaque anneau s'allume : « Frais » (TER, temps 28), « éligibilité PEA » (badge, temps 29, sur la cloche Mi5) et « réplication » (temps 30).
- **C5 :** la bande ISIN précédente s'éteint pendant le défilement. Sur les tics 36 et 37, plus aucune case vide n'est surlignée.
- **C7 :**
  - le journal montre cinq lignes entières ;
  - le panoramique du Cockpit part sur le clap du temps 47 et se resserre (×0,9 → ×1,45) sur « Manque à la cible », « Montant suggéré » et « ≈ Parts à acheter » ;
  - l'anneau des parts (« 14 ») se pose sur la cloche du temps 47,5 ;
  - les bords d'arrivée tombent entre deux colonnes : plus de « 340,19 € » tronqué.
- **C8 :** carte de 880 px au lieu de 816, avec un texte de la liste d'environ 11 px sur un téléphone.
- **C9 :** « dcatracker.fr » passe en blanc, en 40 px, souligné du bleu du logo.

**Exactitude**
- **Risque :** « Pas un conseil en investissement. Investir comporte un risque de perte en capital. » apparaît en fin de vidéo (texte de `Footer.tsx`).
- **Cours figé :** le bloc du cours de la carte WPEA (« 7,13 € +0,93 % · Mis à jour il y a 4 h ») est retiré. La carte est montrée en deux morceaux, l'en-tête puis les caractéristiques, et c'est la même chose pour les deux cartes de la pile.
- **Contexte de 97 753 € :** « 200 €/mois sur 20 ans, frais de l'ETF (0,38 %) déduits » reste sous le chiffre jusqu'à la fin de C3. Pendant les trois scénarios, la mention passe au pluriel : « Hypothèses avant frais, pas des prévisions ».
- **C8 :** « Annulable à tout moment, moyen de paiement requis » s'affiche sous le prix.
- **C7 :** « Exemple pré-rempli » arrive avec la capture.
- **Mentions :** elles passent à 34 px, comme dans la boucle.
- **Nouveaux contrôles de `extraire-donnees.mjs`, qui s'arrête en cas d'écart :**
  - 7,00 − 0,38 doit être égal au « Rendement net : 6,62 %/an » du simulateur ;
  - « annulable à tout moment » doit figurer sur `/tarifs` ;
  - « Un moyen de paiement est requis » doit figurer dans la FAQ de `/tarifs` ;
  - les deux phrases de l'avertissement doivent figurer dans `Footer.tsx`.

**Non retenu**
- Avancer les défilements de C5 d'un demi-temps, pour que la bande WPEA reste plus longtemps : elle quitterait les tics 36 et 37 de la bande-son.
- Garder l'en-tête fixe d'un plan à l'autre (contre l'effet diaporama) : c'est une proposition facultative, laissée à la passe d'effets.
- Refaire la capture Premium plus large, pour éviter les retours à la ligne : ce sera pour une prochaine passe de captures (`scripts/captures.mjs`).

## Version carrée : finition du 04/10/2026

Cette passe suit les bonnes pratiques officielles de Remotion : le skill `remotion-best-practices` 4.0.532 (règles transitions, flou de mouvement, timing, images, effets) et le skill `remotion-saas`. Ce dernier ne s'applique pas ici : il traite du `<Player>` et du rendu sur serveur.

Le principe est la retenue : rester cohérent avec la Boucle. Il n'y a ni glitch, ni aberration chromatique, ni « film burn », ni ondulation, et **aucun texte ni chiffre nouveau**. La musique, la bande-son, les temps des coupes, la Boucle et `Complete` ne changent pas.

Le code est dans `src/carre/Finition.tsx` (nouveau) et `src/carre/CompleteCarree.tsx`. `src/composants/Fond.tsx` reçoit une option `decalage`. Sans elle, le CSS produit est identique : la Boucle et `Complete` ne bougent pas.

**Coupes : `<TransitionSeries>` de `@remotion/transitions`**
- **Plans :** les neuf plans sont des `<TransitionSeries.Sequence>` (avec `premountFor`).
- **Centrage :** chaque transition est centrée sur le temps de la coupe, de t(n) − 5 à t(n) + 5. La moitié du mouvement tombe ainsi sur l'image du temps.
- **Durée :** la somme des plans moins celle des transitions fait exactement 900 images (`debutPlan`, `finPlan`).
- **Horloge :** les plans restent écrits en temps absolus grâce à `HorlogeAbsolue` (un `<Sequence from={-départ}>`).
- **Présentation « glissement »** (API officielle `TransitionPresentation`, courbe ease-in-out du site) :
  - le plan qui sort glisse de 120 px vers la gauche et a disparu à mi-transition ;
  - celui qui entre arrive de 60 px sur la droite et apparaît de 25 à 80 % de la transition.
  - On lit un seul mouvement de caméra. Deux en-têtes ne se croisent qu'à faible opacité, sur l'image du temps.
- **Entrées des plans :** l'en-tête et les captures du plan suivant partent à t(n) − 2 (`APRES_COUPE`), pendant le glissement. L'image du milieu n'est plus vide.
- **C1 → C2 :** fondu enchaîné complet sur 12 images, la carte du nom reculant à ×0,94. La première question part à t(6) − 2.
- **C8 → C9 :** la coupe franche sur l'impact du temps 56 est gardée.
- **Petits réglages :**
  - C4 : le filtre entre à t(24) − 2 ;
  - C6 : le libellé du PEA suit le sous-titre d'une image, pour que l'en-tête se lise de haut en bas.

**Flou de mouvement : `<CameraMotionBlur>` de `@remotion/motion-blur`**
- **Fenêtres :** seulement sur les images listées dans `FLOU` :
  - les coupes glissées (t(n) − 5 à t(n) + 6 : 8 échantillons, 180°) ;
  - la coupe C1 → C2 (6 échantillons) ;
  - les deux glissements des scénarios de C3 (16 échantillons, 90°) ;
  - la montée des cartes de C4, jusqu'à t(28) − 1 ;
  - les défilements de C5 (12 échantillons, 120°) ;
  - l'arrivée du Cockpit (10 échantillons, 120°) et son panoramique en C7 (16 échantillons, 90°).
- **Obturation :** à 180° sur les panoramiques très rapides, les traînées étaient trop longues et l'on voyait les copies. D'où 90° et 120° sur ces fenêtres.
- **Ce qui reste net :** ce qui ne bouge pas pendant une fenêtre (titres, compteur arrivé, mentions). Aucune fenêtre ne couvre un instant de lecture : le compteur qui défile, les anneaux (TER au temps 28, carte Base au temps 21,5, parts au temps 47,5) et les bandes ISIN sont hors fenêtre.
- **Recentrage :** les échantillons de `<CameraMotionBlur>` tombent entre f + 0,5 et f + 0,92. Sur les coupes, l'image t(n) − 1 montrait déjà le plan suivant. Un `<Sequence from={1}>` les ramène entre f − 0,5 et f − 0,08 (10 ms de retard au plus).
- **Non retenu :** `<HtmlInCanvasMotionBlur>`. Il demande le HTML-in-canvas de Chrome (version 149 ou plus, drapeau dans l'aperçu), non vérifié avec le Chromium de Playwright. `<CameraMotionBlur>` marche partout.

**Profondeur, avec retenue**
- **Ombre :** une ombre portée longue et diffuse (`OMBRE_PROFONDE`) passe sous l'ombre douce du site, sur les cartes et les captures (sauf l'interrupteur de C4, sur fond gris clair).
- **Perspective (C4) :** les trois cartes du comparateur se posent en se redressant (10° → 0, perspective de 1 400 px). Une fois posées, elles sont planes.
- **Parallaxe :** pendant chaque coupe glissée, la trame de points du fond se décale de 24 px, contre 120 + 60 px pour le contenu. Elle est périodique : aucun raccord.
- **Reflet :** un seul, sur la carte Premium pendant qu'elle se pose (images 752 à 766, 12 % de blanc au plus). Il est sorti de la carte quand la première ligne s'allume.

**Fichiers (rendu du 04/10/2026, `npm run rendu -- carre`, environ 7 min)**

| Fichier | Taille | Détail |
|---|---|---|
| `out/complete-carre.mp4` | 4,84 Mo (5 076 027 o) | 900 images, 30,00 s, 1080×1080, H.264 High BT.709, CRF 20 + AAC 160 kb/s, `moov` en tête |
| `out/complete-carre-musique-seule.mp4` | 4,84 Mo (5 076 027 o) | Même flux vidéo, musique sans bruitages |
| `out/complete-carre-poster.jpg` | 52 Ko (52 849 o) | Image 75 (carte du nom) |
| `out/archives/complete-carre-avant-finition.mp4` | 4,47 Mo (4 685 390 o) | Version du 03/10, avant les relectures et la finition, pour comparer |
| `out/controle/_avant-apres.png` | 3,5 Mo | 10 instants : l'archive à gauche, le nouveau rendu à droite |
| `out/controle/_planche-completecarree.png` | | 52 images ; s'ajoutent le milieu d'une coupe (180), les flous (320, 708) et le reflet (760) |

**Mesures (sur les vidéos décodées)**
- **Son :** identique à l'archive, échantillon par échantillon (écart maximal 0 après décodage). Avec les bruitages : −16,04 LUFS et −1,71 dBTP. Musique seule : −16,05 LUFS et −1,71 dBTP.
- **Format :** 900 images, 30,00 s, 1080×1080, 30 i/s.
- **Coupes :** écart type de la luminance aux images t(n) − 1, t(n) et t(n) + 1. Le fond seul est vers 6.

| Coupe (image) | Avant (archive) | Après |
|---|---|---|
| C1 → C2 (90) | 69 / 63 / 53 | 70 / 52 / 35 |
| C2 → C3 (180) | 13 / 9 / 46 | 20 / 22 / 71 |
| C3 → C4 (360) | 35 / 20 / 12 | 65 / 25 / 45 |
| C4 → C5 (480) | 36 / 20 / 49 | 65 / 30 / 72 |
| C5 → C6 (570) | 35 / 20 / 50 | 66 / 18 / 10 |
| C6 → C7 (630) | 34 / 20 / 50 | 56 / 27 / 70 |
| C7 → C8 (750) | 35 / 20 / 15 | 63 / 16 / 18 |
| C8 → C9 (840) | 6 / 6 / 38 | 52 / 71 / 73 |

- **Images presque vides** (écart type sous 9) : 14 avant, 2 après. Ce sont les images 0 et 1, où le logo est à 35 %, comme voulu.
- **C6 :** la valeur basse après la coupe vient du plan lui-même : du texte sur fond sombre, sans capture. Le titre « PEA ou CTO ? » y est lisible dès l'image 571.
- **Lisibilité à 343 px** (taille d'un téléphone), sur la vidéo finale, aux instants de lecture : images 263, 330, 345, 440, 545, 605, 722, 815 et 880. Tous les chiffres sont nets, et aucun de ces instants n'est dans une fenêtre de flou.
- **Contrôles :** `npm run verifier` passe. `out/boucle.mp4`, `out/boucle.webm`, `out/poster.jpg` et `public/musique.wav` n'ont pas changé.

**Non retenu**
- **En-tête fixe d'un plan à l'autre** (proposé contre l'effet diaporama) : le glissement unique des coupes répond au même besoin sans réécrire les neuf en-têtes.

## Boucle : retouches du 04/10/2026

Quatre retouches demandées par les relectures d'exactitude et de design, faites comme dans la version carrée. Le caractère de la boucle ne change pas : même scénario, mêmes numéros d'image, même rythme, mêmes couleurs, 570 images (19 s), et la dernière image reste identique à l'image 0. `Complete`, `CompleteCarree`, la musique et la bande-son ne sont pas touchés.

La version d'avant est archivée dans `out/archives/` : `boucle-avant-retouches.mp4` (1 278 741 o), `boucle-avant-retouches.webm` (1 069 212 o) et `poster-avant-retouches.jpg` (85 752 o).

1. **Cours figé (Comparer).** La carte WPEA montrait « 7,13 € +0,93 % · Mis à jour il y a 4 h », un cours du jour de la capture présenté comme frais. Elle est montrée en deux morceaux de la capture : l'en-tête (nom, fonds, indice, badge PEA), puis les caractéristiques (TER, réplication, distribution, ISIN). Le bloc du cours est retiré, et les deux cartes de la pile sont découpées de la même façon. Plus courte, la carte passe de 700 à 780 px de large ; la pile descend de 20 px. Les trois anneaux (TER, réplication, badge PEA) sont posés sur les mêmes pixels de la capture qu'avant (`src/zones.ts` inchangé).
2. **Frais (Simuler, donc aussi l'affiche).** Sous « Hypothèse de 7 %/an avant frais, pas une prévision », une deuxième ligne : « Frais de l'ETF (0,38 %) déduits », en 34 px, comme la première. 0,38 % vient de `src/donnees.json` (`simulateur.fraisDefaut`). La ligne arrive 4 images après la première (scénario 138) : elle est vraie aussi pour les valeurs intermédiaires du compteur. Pour lui laisser la place, le graphique descend de 46 px et passe de 700 à 660 px de large (bord droit inchangé, axe des années toujours dans le cadre) ; le marqueur suit, sa position étant calculée sur le graphique.
3. **Cockpit lisible (Suivre).** Le tableau entier, réduit à 1 240 px, faisait des textes d'environ 5 px sur un téléphone. La fenêtre est recomposée à partir de la capture, sans rien redessiner :
   - « Montant à verser ce mois-ci : » puis la case « 300,00 € » ;
   - trois colonnes du tableau : « ETF », « Montant suggéré (€) », « ≈ Parts à acheter » (PE500 0,00 € 0 ; ETZ 300,00 € 14 ; PAEEM 0,00 € 0).
   - Entre « ETF » et « Montant suggéré », une bande vide du tableau (fond d'en-tête et filets, aucun texte) est étirée pour que le tableau ait la largeur de la ligne du montant.
   - La fenêtre fait 880 px de large (×1,21) : les textes du tableau font environ 34 px dans le rendu 1080 et 11 px à 343 px. Elle glisse de 40 px vers la marge au lieu de 50. Les anneaux du montant et des parts gardent leurs images (scénario 380 et 395).
   - La capture n'a aucune mention de fraîcheur (« Mis à jour… »).
4. **Chaîne de rendu indépendante de `HeroDemoCard`.** Voir « Aucun chiffre recopié à la main ». `scripts/captures.mjs` ne lit plus la carte de démonstration (captures `accueil-*-carte-demo*.png` et les 12 combinaisons de `textes.accueil.carte_demo` retirées). Il lit à la place les hypothèses de calcul du simulateur (bloc replié, lu sans clic). `scripts/extraire-donnees.mjs` lit les frais dans le code du site et les recoupe avec le simulateur en production. `npm run captures` n'a pas été relancé : les captures du 02/10 restent valables. Vérifications :
   - sur le `textes.json` existant et le code du site : `src/donnees.json` est identique à celui d'avant, à la date de génération près (`fraisDefaut` : « 0,38 % ») ;
   - sur une copie modifiée du site, le script s'arrête dans chacun de ces cas : TER de CW8 à 0,20 %, défaut des frais écrit en dur, versement par défaut à 100 €, référence passée à WPEA, simulateur en production qui déduirait 0,20 %, bloc des hypothèses illisible ;
   - la page /simulateur servie en production contient bien « Rendement net = 7 % − 0,38 % (frais TER) = 6,62 %/an » dans son HTML.

Le découpage des captures est fait par `src/composants/Morceaux.tsx` (nouveau) : une capture recomposée de rectangles du PNG d'origine, avec le même halo, la même ombre et les mêmes coins que `<Capture>`. Sa fonction `z()` convertit les zones de `src/zones.ts`, si bien que les anneaux ne bougent pas sur la capture.

**Fichiers (rendu du 04/10/2026, `npm run rendu -- boucle`)**

| Fichier | Taille | Détail |
|---|---|---|
| `out/boucle.mp4` | 1,09 Mo (1 142 725 o), avant 1,22 Mo | H.264 High 4.0, BT.709 (tv), aucune piste audio, `ftyp > moov > free > mdat` (faststart), 570 images, 19,00 s |
| `out/boucle.webm` | 0,88 Mo (917 728 o), avant 1,02 Mo | VP9, deux passes, BT.709 (tv), aucune piste audio, 570 images, 19,00 s |
| `out/poster.jpg` | 87 Ko (88 702 o) | Image 0 |
| `out/controle/_planche-boucle.png` | | Les 22 images de contrôle (`npm run controle -- Boucle`) |
| `out/controle/_avant-apres-boucle.png` | | 8 instants décodés des deux MP4 (archive à gauche, nouveau rendu à droite) : images 0, 530, 555 (Simuler), 100, 135 (Comparer), 180, 210, 235 (Suivre) |
| `out/controle/_scenes-retouchees-343.png` | | Images 0, 555, 100, 135, 210 et 235 du nouveau MP4, réduites à 343 px |

**Contrôles :** `npm run verifier` passe. Raccord : la première et la dernière image ont la même empreinte SHA-256. Les deux vidéos restent sous 1,5 Mo, l'affiche sous 150 Ko. `tsconfig.tsbuildinfo` (racine du site) n'a pas bougé.

## Boucle : corrections des relectures du 04/10/2026 (seconde passe)

Les relectures de fidélité et d'exactitude de la passe précédente ont été vérifiées une à une ; toutes ont été retenues. Ce qui suit remplace, là où ils diffèrent, les points 2 et 3 de la section précédente. La version de la première passe est archivée : `out/archives/boucle-retouches-1.mp4`, `boucle-retouches-1.webm`, `poster-retouches-1.jpg`.

1. **Frais nommés (Simuler, donc l'affiche).** La ligne devient « Frais de l'ETF CW8 (0,38 %/an) déduits ». Sans le nom, on prenait ces frais pour ceux de la carte WPEA du plan suivant, où l'anneau entoure « TER : 0,20 % » ; « /an » s'aligne sur « 7 %/an » juste au-dessus. CW8 vient de `src/donnees.json` (`simulateur.etfFrais`, nouveau : le symbole que `TER_REFERENCE_SIMULATEUR` désigne dans `etf-config.ts`, lu par `extraire-donnees.mjs`), 0,38 % de `simulateur.fraisDefaut`. `Complete` et `CompleteCarree` gardent « Frais de l'ETF (0,38 %) déduits » : à aligner plus tard, avec l'accord de Maël.
2. **Badge « Données différées » retiré (Comparer).** Il qualifiait le cours, retiré à la passe précédente. Il est caché par du blanc (le fond de la carte), sur des rectangles mesurés pixel par pixel sur chacun des trois PNG (`caches` dans `CARTES`) : aucun pixel hors du badge n'est couvert, la pastille « Actions monde développé », qui le chevauche, reste entière (il reste quelques pixels gris très clair dans ses coins arrondis, invisibles à 343 px).
3. **Pile de Comparer plus bas de 25 px** (y = 327, 351, 375) : le bas de la carte WPEA passe d'environ 877 à 902 px, il ne reste plus 200 px vides en bas du cadre. Les anneaux suivent (`z()`).
4. **Cockpit (Suivre) : de nouveau un classeur, net, posé à temps.**
   - La barre de fenêtre de la capture revient en tête (pastilles, « Cockpit-DCA-PEA_dcatracker.xlsx · Versement du mois », filet) : sa partie vide (x = 1000 à 1012) est étirée sur toute la largeur, son contenu posé dessus à partir de x = 24, pour éviter le coin arrondi et le bord sombre de la capture.
   - Échelle 1 (au lieu de ×1,21) : le texte n'est plus agrandi, donc net comme le reste. La ligne du montant est reprise telle quelle (libellé, blanc, case), la fenêtre va d'une marge à l'autre (x = 80 à 999, 919 × 506 px). Textes du tableau : 28 px (capitales de 20 px) dans le rendu 1080, environ 9 px à 343 px, lisibles sur la planche à 343 px.
   - Le glissement (40 px) se fait par `transform: translateX` (au lieu de `left`, qui avançait par à-coups d'un pixel) et se termine en scénario 375, avant le premier anneau (380) : pendant les anneaux, la fenêtre est alignée sur le titre et immobile.
   - « Exemple pré-rempli » devient « Exemple pré-rempli, extrait du tableau » : 3 colonnes sur 10, la bande du milieu étirée. Chiffres et libellés restent ceux de la capture.
5. **Raccord des fichiers livrés.** Avec `-g 600`, tout le fichier est un seul groupe d'images : décodée, la dernière image (prédite) différait de l'image 0 (image clé) de 66/255 sur les bords des textes, et le texte « se raffermissait » à chaque tour (déjà le cas avant les retouches). Essais sur le master du 04/10 :
   - forcer seulement une image clé sur la dernière image (proposition de la relecture) **aggrave** l'écart, en H.264 comme en VP9 (maximum 72/255, deux images clés codées séparément) : abandonné ;
   - **H.264 retenu** : image clé forcée sur la première et la dernière image (`-force_key_frames`) et QP constant 24 au lieu du CRF 23. Les deux images clés sortent identiques au bit près (écart décodé 0), à qualité égale (PSNR 38,7 / 39,0 / 37,4 dB contre 38,6 / 39,2 / 37,9 aux images 0, 135 et 235), pour 1,29 Mo au lieu de 1,07 Mo (sous l'objectif de 1,5 Mo) ;
   - VP9 laissé tel quel : la qualité fixe sans alt-ref donne aussi un écart nul, mais perd 1,5 à 2 dB à taille égale. Son écart est faible (25/255 sur une quarantaine de pixels).
   - `scripts/rendre.mjs` mesure désormais, en plus de l'empreinte des PNG, l'écart entre les images 0 et 569 **décodées** de `boucle.mp4` et `boucle.webm`.
6. **Documentation.** `STORYBOARD.md` : `HeroDemoCard` marquée « historique, plus lue depuis le 04/10 », source de la mention des frais corrigée, question de l'emplacement marquée tranchée ; même chose ci-dessous dans « À décider par Maël ».

**Fichiers (rendu du 04/10/2026, seconde passe, `npm run rendu -- boucle`) : ce sont eux qu'il faut intégrer** (nom versionné à changer, par exemple `boucle-v2`).

| Fichier | Taille | Détail |
|---|---|---|
| `out/boucle.mp4` | 1,29 Mo (1 350 799 o) | H.264 High 4.0, **QP 24** constant, images clés 0 et 569, BT.709 (tv), aucune piste audio, `ftyp > moov > free > mdat`, 570 images, 19,00 s |
| `out/boucle.webm` | 0,89 Mo (938 421 o) | VP9 deux passes, CRF 32, BT.709 (tv), aucune piste audio, 570 images, 19,00 s |
| `out/poster.jpg` | 88 Ko (89 986 o) | Image 0 |
| `out/controle/_planche-boucle.png` | | Les 22 images de contrôle |
| `out/controle/_avant-apres-boucle.png` | | 11 instants décodés des MP4 (archive d'avant les retouches à gauche, nouveau rendu à droite) : 0, 530, 555, 100, 135, 180, 190, 200, 210, 235, 250 |
| `out/controle/_scenes-retouchees-343.png` | | Images 0, 555, 100, 135, 210 et 235 du nouveau MP4, réduites à 343 px |

**Contrôles :** `npm run verifier` passe. Raccord : PNG de Remotion identiques (SHA-256) ; images 0 et 569 décodées identiques dans `boucle.mp4` (écart 0) ; écart maximal 27/255 sur 41 pixels dans `boucle.webm`. Les deux vidéos restent sous 1,5 Mo, l'affiche sous 150 Ko. `tsconfig.tsbuildinfo` n'a pas bougé.

## Plan d'intégration (après validation de Maël)

1. **Fichiers.**
   - Copier `out/boucle.webm`, `out/boucle.mp4`, `out/poster.jpg`, `out/complete.mp4` et `out/complete-poster.jpg` dans `public/video/` du site.
   - Leur donner un nom versionné (`boucle-v1.webm`, etc.) : à chaque nouveau rendu, changer de nom plutôt que d'écraser.
   - Ne pas les passer par `next/image` : l'affiche doit rester identique au pixel près à la première image de la vidéo.
2. **Middleware** (`src/middleware.ts`, `config.matcher`, ligne 48) : ajouter `mp4|webm|mp3` à la liste des extensions exclues. Sinon le middleware Clerk tourne à chaque requête vidéo, y compris chaque requête partielle (Range). La relecture technique l'a vérifié : `.webm` et `.mp4` le déclenchent, `.jpg` non.
3. **Cache.** Vercel sert `public/` avec `max-age=0, must-revalidate`. Ajouter dans `next.config` (fonction `headers()`) une règle `source: "/video/:path*"` avec `Cache-Control: public, max-age=31536000, immutable`. C'est possible parce que les noms sont versionnés.
4. **Bandeau** (`src/components/home/Hero.tsx`, colonne de droite) : reprendre le comportement d'`apercu.html` dans un petit composant client.
   - **Affiche :** l'`<img>` de l'affiche est rendue **côté serveur**, avec `width={1080} height={1080}`, `fetchPriority="high"`, un ratio carré et un `alt` qui dit ce qu'elle montre. Ajouter `<link rel="preload" as="image" fetchpriority="high">`, ou `ReactDOM.preload`. C'est l'élément LCP : pas de `next/dynamic` avec `ssr:false` autour d'elle.
   - **Vidéo :** la `<video muted loop playsinline preload="none">` n'a **ni `autoplay` ni `<source>`** dans le HTML. Les sources (WebM d'abord, puis MP4) sont posées en JS après `load`, quand le cadre est visible (`IntersectionObserver`), seulement si `prefers-reduced-motion` n'est pas actif et si `navigator.connection.saveData` est faux. La vidéo ne devient visible qu'à l'événement `playing`.
   - **Bouton pause** (WCAG 2.2.2) : son état est lu sur `video.paused`. Si `play()` est refusé, il propose « Lancer l'animation ». La boucle s'arrête hors de l'écran et ne repart jamais d'elle-même si le visiteur l'a mise en pause.
   - **« Regarder avec le son »** ouvre un `<dialog>`. La source et l'affiche de `complete.mp4` ne sont posées qu'à l'ouverture. Échap et « Fermer » l'arrêtent. À la fermeture, la boucle ne reprend que si elle tournait à l'ouverture.
5. **Contrôles avant mise en ligne.**
   - `npm run build` (par Maël ou dans la CI : interdit dans ce lot).
   - Lighthouse mobile sur `/` : le LCP doit rester l'affiche, sans régression.
   - Test sur un iPhone en mode économie d'énergie : l'affiche reste et le bouton propose « lancer ».
   - Test avec « réduire les animations » : aucune requête vidéo.
   - Vérifier qu'aucune requête `.mp4`/`.webm` ne passe par le middleware.

## À décider par Maël

- ~~**La boucle remplace-t-elle la carte de démonstration interactive (`HeroDemoCard`)**~~ *Tranché le 04/10/2026 : oui, colonne de droite du bandeau (`<HeroVideo />`, `src/components/home/Hero.tsx`).*
- **Le prix du Cockpit dans la boucle.** La pastille « Cockpit DCA · 19 €, paiement unique » est la correction la plus honnête : la fenêtre montrée est payante. L'autre option serait de montrer l'onglet Transactions, commun au modèle gratuit, mais il est moins parlant.
- **Durée de la boucle : 19 s** (dans la fourchette 15-20 s), contre 18 s auparavant, pour laisser lire l'état final du simulateur.
- **Les bruitages avec la musique :** les 12 gardés, ou la musique seule ? Comparer `out/musique/mix-complete.wav` et `mix-complete-sans-bruitages.wav` (`npm run rendu -- son`).
- **Le format carré 1080×1080** de la boucle (voir les écarts ci-dessous).

## Organisation

```
apercu.html                    aperçu local du bandeau et de la fenêtre (modèle d'intégration)
scripts/extraire-donnees.mjs   chiffres relus dans le code et sur le site → src/donnees.json
scripts/generer-sons.mjs       effets sonores (synthèse PCM) → public/sons/*.wav
scripts/rendre.mjs             rendus, encodages, vérifications
scripts/images-controle.mjs    images fixes de contrôle et planches contact
scripts/captures.mjs           captures du site en production
src/charte.ts                  couleurs, polices, courbes de mouvement du site
src/zones.ts                   zones mesurées sur les captures
src/courbe.ts                  courbe « Base » du simulateur (marqueur et compteur)
src/tempo.ts                   calage sur la musique (BPM, décalage, volumes)
src/son/BandeSon.tsx           bande-son partagée : musique et feuilles de bruitages (avec et sans musique)
musique/                       musique synthétisée (composer.py), contrôles (analyse.py), mixage (mixage.py)
src/composants/                logo (copie exacte de LogoMark.tsx), fond, captures, accents, textes
src/composants/Morceaux.tsx    capture recomposée de morceaux (carte d'ETF sans cours, Cockpit sur 3 colonnes)
src/boucle/Boucle.tsx          la boucle (B0 à B5 du storyboard, et le départ du fichier)
src/carre/CompleteCarree.tsx   la version carrée avec le son (C1 à C9, mêmes temps que Complete)
src/carre/Finition.tsx         sa finition : transition « glissement », flou de mouvement, reflet
src/complete/Complete.tsx      la version complète 16:9 (C1 à C9)
src/Mesure.tsx, src/Planche.tsx  outillage : mesure du nom, planche contact
```

**Numéros d'image de la boucle.** Le code de `Boucle.tsx` est écrit avec les numéros du **scénario** (storyboard, 540 images). Les images de contrôle et `--frame` utilisent ceux du **fichier** (570 images) : l'image 0 du fichier correspond à l'image 205 du scénario, et l'image 365 du fichier à l'image 0 du scénario. Le tableau en tête de `scripts/images-controle.mjs` donne les deux.

## Écarts au storyboard (à valider par Maël)

- **Boucle carrée, 1080×1080**, comme le prévoit le storyboard (section 3). La consigne de rendu parlait de 1280×720, mais la colonne de droite du bandeau fait environ 480 px de large : en 16:9, la vidéo n'y ferait que 270 px de haut et les titres seraient illisibles.
- **Départ du fichier sur le simulateur, et 19 s au lieu de 18 s.** Voir « Corrections » : l'affiche est l'image 205 du scénario, comme le storyboard le proposait (image 200).
- **Le point blanc du logo** ne sert de fil conducteur qu'au début. Dans la boucle, il devient la pointe de la courbe du simulateur ; dans la version complète, la puce des questions puis la pointe de la courbe. Posé à côté des anneaux sur les captures, il se lisait comme un bouton de l'interface.
- **B3 :** une carte en grand et deux en pile, au lieu de trois en éventail.
- **B4 :** la fenêtre du Cockpit est réduite, depuis le 04/10, à la ligne du montant et à trois colonnes (ETF, montant suggéré, parts à acheter), sur 880 px de large, pour être lisible sur un téléphone. Elle porte la pastille du prix et son anneau des parts apparaît sans balayage.
- **Titres de la version complète en 84 px** (96 au storyboard) : « Comparez 19 ETF » et « Simulez votre DCA » tiennent ainsi sur une ligne sans toucher les captures.
- **Ajouts factuels dans la version complète :**
  - les trois réglages du simulateur en pastilles ;
  - « Filtre « PEA uniquement » : 8 ETF » en C4 et « Dont les 8 du filtre « PEA uniquement » » en C5 ;
  - la bascule du filtre est franche : un fondu superposait « 19 » et « 8 », ce qui se lisait « 18 ».
- **Phrase des scénarios** raccourcie en « 3 scénarios : 5, 7 et 9 %/an avant frais » : la version longue débordait sur le graphique.
- **Emplacements :** le script s'appelle `scripts/generer-sons.mjs` et les sons sont dans `public/sons/` (le storyboard disait `scripts/sons.mjs` et `public/sfx/`).
