# Musique de la version complète

30,000 s en La majeur, à 120 BPM et en 4/4, calée sur les 60 temps de la composition « Complete » (`src/complete/Complete.tsx`) et de la version carrée, qui partagent la même bande-son (`src/son/BandeSon.tsx`). C'est de l'électro mélodique lumineuse, dans l'esprit des vidéos de lancement de produit : nappe large, piano électrique, basse ronde, batterie souple et une cloche qui porte le logo sonore (La4, Do#5, Mi5, La5, la courbe qui monte d'un DCA).

**Droits : musique 100 % synthétisée par code (numpy et scipy), aucun échantillon externe, propriété de l'éditeur du site.** Rien ne vient de GarageBand, des Apple Loops ou d'une banque DLS. Aucun fichier son n'est lu.

## Fichiers

| Fichier | Rôle |
|---|---|
| `moteur.py` | Synthèse et mixage. Il contient :<br>– des oscillateurs à bande limitée (tables additives jusqu'à 20 kHz, FM et saturation calculées à 192 kHz puis filtrées) ;<br>– du bruit à graine fixe et des enveloppes (attaque d'au moins 1,5 ms, relâchement d'au moins 10 ms, vérifiés) ;<br>– des filtres fixes et variables ;<br>– deux réverbérations par convolution (réponses stéréo synthétiques) et un écho ;<br>– la compression latérale, le compresseur de bus et un limiteur à crête vraie ;<br>– l'écriture en WAV 16 bits avec un dither TPDF. |
| `instruments.py` | La palette. Chaque fonction rend une note ou un coup. |
| `composer.py` | La partition, en temps musicaux : grille d'accords, motifs, automations. Il fait aussi l'arrangement, le mixage et le mastering. Il écrit `public/musique.wav`, les pistes séparées et `out/musique/partition.json`. |
| `mesures.py` | Les mesures de niveau, communes au mastering et au contrôle :<br>– sonie BS.1770-4 (portes à -70 et -10) ;<br>– court terme sur 3 s et momentanée sur 400 ms ;<br>– plage de sonie (LRA) ;<br>– crête vraie en suréchantillonnage ×4. |
| `analyse.py` | Les contrôles et les images de `out/musique/`. Il étalonne d'abord ses mesures sur des signaux connus (sinus, clics injectés, attaques posées à des instants connus). |
| `mixage.py` | Le mélange musique + bruitages d'interface, tel que Remotion le rend : niveau et émergence de chaque bruitage, accents de la musique au même instant, calage, sonie, crête vraie et clics du rendu (voir « Intégration et mixage »). |

## Relancer

```sh
npm run musique     # depuis video-accueil/ : composer.py puis analyse.py, 1 min environ
```

La commande écrit :

- `public/musique.wav` : 48 kHz, stéréo, 16 bits, exactement 1 440 000 échantillons ;
- `out/musique/pistes/*.wav` : six pistes en 32 bits flottants (batterie, basse, harmonie, mélodie, effets, retours de réverbération). Leur somme donne le morceau, hormis la saturation du bus ;
- dans `out/musique/` : `partition.json`, `rapport.json`, `spectrogramme.png`, `sonie.png`, `spectres-pistes.png` et `piano-roll.png`.

`out/musique/comparaison-v1-v2.png` (sonie, écoute simulée sur ordinateur portable, fin du morceau) a été tracé une fois, lors de la révision du 03/10/2026 ; `npm run musique` ne le refait pas.

`analyse.py` sort avec le code 1 si un contrôle échoue. Le rendu est identique d'une exécution à l'autre : les graines sont fixes et le calcul tourne sur un seul fil (empreintes MD5 comparées).

## Grille et arrangement

| Temps | Plan | Accords | Ce qui se passe |
|---|---|---|---|
| 0–6 | C1 logo | Dmaj9, Aadd9 (4) | La nappe s'ouvre (filtre de 420 Hz à 2,4 kHz) sur un bourdon grave, avec des étincelles et de l'air. La cloche énonce doucement le logo sans le résoudre : La4 (4, note-1), Do#5, Mi5. Un souffle inversé mène à 6. |
| 6–12 | C2 questions | F#m9, Esus4 (9) | Pulsation douce : pluck étouffé en croches dont le filtre s'ouvre, battement grave sur chaque temps, shaker à partir de 9. La montée (8 → 12), le roulement qui accélère et la cymbale inversée (10 → 12) finissent pile sur 12. |
| 12–24 | C3 simuler | Dmaj7, A/C#, F#m7 | Premier décollage : impact et cymbale, grosse caisse sur chaque temps, clap sur 2 et 4, charleston en doubles croches (ouvert sur les contretemps), basse à contretemps, piano électrique syncopé.<br>– « Pings » à 13,5, 14,5 et 15,5, en réponse aux clics.<br>– Montée en doubles croches qui arrive sur Do#5 à 17,5 (note-2).<br>– Scénarios à 20,5, 21,5 et 22,5 : La4, Do#5, Mi5. |
| 24–32 | C4 comparer | E6sus4, Dmaj9 | Variation : arpège pluck en doubles croches, avec un écho pointé de 0,375 s. Les cartes à 27, 28 et 29 sonnent La4, Do#5, Mi5. |
| 32–38 | C5 liste PEA | A/C#, Bm7/E (36) | Le groove s'allège (clap plus doux, charleston en croches). De 36 à 38, le filtre se ferme et une descente mène à la coupe ; la grosse caisse s'arrête après 36. |
| 38–42 | C6 PEA ou CTO | F#m9, Esus4 (40) | Pause : batterie coupée, accord suspendu, basse tenue qui attaque sur la coupe. Un accord de piano doux (Fa#3, Mi4, La4) marque 38, puis le piano joue Mi5 à 39 et Fa#5 à 40. Montée, roulement et cymbale inversée mènent à 42. |
| 42–50 | C7 suivre | Dmaj7, A/C# (46) | Second décollage, le plus riche : une accroche mélodique reprend le logo, l'arpège joue une octave au-dessus. Cymbale et changement d'accord à 46. Mi5 à 47,5 (note-3, doublé par l'accroche). |
| 50–56 | C8 premium | Bm7, E (52), E7sus4 (54) | Accords plus lumineux, l'accroche monte de Fa#5 à Sol#5. De 54 à 56 : roulement, montée, logo complet en levée. |
| 56–60 | C9 fin | Aadd9 | Accord final large, le moment le plus fort de la fin : grosse caisse, impact et cymbale à pleine force, basse La1, piano légèrement arpégé, nappe sur l'accord du logo, et la cloche La5 (note-4, doublée d'un pluck La5 et d'une cloche La4) qui résout le logo. Un silence d'une double croche dans le roulement précède l'accord. La cloche résonne librement 1 s, puis elle est étouffée et s'éteint à pente constante ; la nappe est relâchée vers 59,2 et la queue des retours décroît plus vite après 58,6. Un fondu de 0,25 s (59,5 à 60) garantit seulement le silence au dernier échantillon. |

La musique joue elle-même les effets note-1 à note-4 et impact-doux, à la cloche FM, avec réverbération et écho : aux temps 4, 17,5, 20,5 à 22,5, 27 à 29, 47,5 et 56. Chaque note de repère appartient à l'accord en cours.

## Palette

- **Batterie :**
  - grosse caisse : sinus qui glisse de 125 à 48 Hz, frappe de +200 Hz qui s'efface en 12 ms pour les petits haut-parleurs, clic, saturation légère ;
  - clap : quatre rafales de bruit et une traîne ;
  - charleston fermé et ouvert ;
  - shaker, cymbale (bruit et partiels FM), caisse claire des roulements ;
  - humanisation : force variée de ±10 %, décalages aléatoires de ±1,5 ms, jamais sur la grosse caisse ;
  - swing léger : les doubles croches paires du charleston et du shaker arrivent 8 ms plus tard (53,2 %). C'est un décalage voulu, noté à part dans la partition (`swing_ms`) et exclu du contrôle des 5 ms ;
  - battement de l'introduction : grosse caisse ronde avec une frappe brève, audible sur un ordinateur portable.
- **Basse :** sous-basse sinus, plus une couche médium (dents de scie sans fondamental, filtrée vers 2,2 kHz, avec un « pincement » à 5 kHz qui se referme en 70 ms, puis saturée) qu'on entend sur un téléphone. Elle est plus forte au second décollage (×2,6 au lieu de ×1,8), où l'accroche et l'arpège occupent le médium. Bourdon tenu dans l'introduction et la pause : sinus et harmoniques 2 à 4, pour qu'on l'entende aussi sur un petit haut-parleur.
- **Harmonie :** nappe supersaw (7 voix désaccordées de ±19 cents, en stéréo), piano électrique FM de type Rhodes, pluck étouffé de la pulsation. Aux décollages, le piano tient le bas-médium et la nappe joue au-dessus les notes de l'accord que le piano n'a pas (jamais à l'unisson).
- **Mélodie :** cloche FM (partiels harmoniques, léger battement), accroche (dents de scie et carré, avec portamento et vibrato), arpège pluck additif, étincelles.
- **Transitions :** montées, souffles et cymbales inversés qui s'arrêtent sur la coupe, impacts, descente.
- **Mixage :**
  - réverbération longue (2,9 s dans le grave, 1,1 s dans l'aigu, pré-délai 28 ms) et courte (0,75 s, pré-délai 15 ms) ;
  - écho pointé en ping-pong ;
  - retours filtrés entre 200 Hz et 8 kHz ;
  - compression latérale déclenchée par la grosse caisse (de -3 à -6 dB) ;
  - graves en mono.
- **Mastering :**
  - égalisation douce ;
  - compression de bus 2:1 (1 à 2 dB de réduction aux décollages) ;
  - saturation à -40 dB sous le signal ;
  - limiteur à crête vraie (plafond -1,8 dBTP), qui retire au plus 0,5 dB sur quelques crêtes du second décollage (temps 47,5).

## Mesures (rapport.json du 03/10/2026, version 2, 18 contrôles sur 18)

| Mesure | v1 | v2 | Objectif |
|---|---|---|---|
| Sonie intégrée | -15,98 LUFS | -16,00 LUFS | -16 ± 0,5 |
| Crête vraie (×4) / échantillon | -2,12 dBTP / -2,20 dBFS | -1,80 dBTP / -1,80 dBFS | ≤ -1,5 dBTP |
| Plage de sonie (LRA, approximative) | 5,5 LU | 5,4 LU | |
| Sonie par plan (C1 à C9, LUFS) | -21,2 · -19,1 · -15,0 · -15,0 · -18,3 · -19,8 · -14,5 · -14,5 · -16,9 | -21,4 · -18,4 · -15,5 · -15,1 · -18,2 · -19,8 · -14,3 · -14,7 · -16,1 | arc |
| Court terme, temps 6 à 9 | de -21,4 à -20,0 LUFS | de -21,6 à -19,9 LUFS | -22,5 à -19,5 |
| Clics (mélange et 6 pistes) | 0 | 0 | 0 |
| Notes de repère / transitions | 2,9 ms / 3,6 ms au plus | 2,6 ms / 3,6 ms au plus | ≤ 5 ms |
| Attaques du mélange | 49, écart médian +0,3 ms, 95 % sous 1,4 ms | 57, écart médian +0,4 ms, 95 % sous 1,7 ms | |
| Accords du piano retrouvés sur la piste d'harmonie | 62,5 % | 85 % | |
| Queue au temps 59,8 | -45,2 dB sous la crête | -46,4 dB | ≤ -40 dB |
| Corrélation G/D (globale / sous 120 Hz) | 0,862 / 1,000 | 0,881 / 1,000 | graves mono |
| Énergie par bande (sub, grave, bas-médium, médium, présence, aigus, air) | 9,7 · 37,7 · 22,7 · 25,9 · 1,9 · 1,3 · 0,8 % | 10,0 · 40,7 · 23,2 · 21,6 · 2,2 · 1,4 · 0,9 % | |
| Petit haut-parleur (rien sous 200 Hz), décollages | batterie -7,0 LU, basse -13,4 LU sous le mélange | batterie -5,8 LU, basse -7,5 LU | audibles |

## Versions

- **v1** (MD5 `db62dc99…`, archivée dans `out/musique/archives/musique-v1-db62dc99.wav`) : la première version, celle que Maël a aimée.
- **v2** (MD5 `a8411ed6…`, archivée dans `out/musique/archives/musique-v2-a8411ed6.wav`, identique à `public/musique.wav`) : mêmes grille, sections, timbres, tempo et tonalité. Elle corrige les défauts relevés par trois relectures (calage, mixage, musicalité) :
  - **accord final** : il n'avait pas d'impact (-14,5 dBFS sur 10 ms, contre -11,3 au temps 55). Grosse caisse ajoutée à 56, impact et cymbale à pleine force, montée 54–56 adoucie, silence d'une double croche avant l'accord. Maintenant -8,5 dBFS à 56 contre -12,7 à 55, +3,5 dB d'efficace sur 400 ms ; la sonie momentanée culmine à 56,5 ;
  - **résolution du logo** : levée en crescendo (0,60 → 0,80), La5 à pleine force, doublé d'un pluck La5 et d'une cloche La4. Sa fondamentale dépasse celle du Mi5 de la levée de 5,8 dB (v1 : -0,7 dB) ;
  - **piano et nappe** : plus d'unisson (65 notes de piano sur 93 en v1, 1 sur 91 en v2). Part de l'harmonie dans 200–400 Hz aux décollages : 30 à 36 % au lieu de 55 à 63 % ;
  - **Bm7 (50–52)** : piano sans 9e (Si3 Ré4 Fa#4 La4) ; le Do#5 qui frottait contre Ré5 est 29 dB sous lui (v1 : 5 dB au-dessus) ;
  - **souffles inversés de 24, 32 et 50** : renforcés, et charleston et shaker se taisent sur les deux doubles croches qui précèdent 32 et 50. Émergence de +3,4, +7,4 et +5,0 dB (v1 : -0,3, -5,0, -7,5 dB) ;
  - **basse sur petit haut-parleur** : couche médium plus forte et plus brillante. Sur ordinateur portable simulé, -7,1 et -7,7 LU sous le mélange aux deux décollages (v1 : -11,1 et -14,2) ;
  - **graves de l'introduction et de la pause** : basse tenue avec harmoniques 2 à 4, battement avec une frappe. Sur ordinateur portable, la basse tenue passe de -33 à -19 LU (introduction) et de -28 à -17 LU (pause) sous le mélange ;
  - **fin** : une extinction et non plus un fondu. La pente passe progressivement de -14 dB/s à -30 dB/s environ (v1 : -9 dB/s, puis le fondu de 58,4 à 60 faisait la descente) ;
  - **corrections mineures** : appui doux sur la coupe 38 ; La4 du logo de l'introduction raccourci (il frottait contre le Sol#4 de 6) ; swing audible (8 ms) ; variation de 24 qui ne retombe plus (charleston ouvert, arpège devant) ; crescendo de la pulsation 6–12 ; clap plus présent au second décollage ; creux d'égalisation contre la bosse de 500 Hz (+4,4 dB au lieu de +6,4 par rapport à une pente de -4,5 dB/oct) ; premier échantillon à 0 sur les deux canaux.

## Intégration et mixage (03/10/2026)

**Branchement.**
- `scripts/extraire-donnees.mjs` cherche `public/musique.wav`, puis `public/musique.mp3`. Le champ `musique` de `src/donnees.json` vaut le nom du fichier trouvé, ou `false`.
- La bande-son est un module partagé, `src/son/BandeSon.tsx`. Elle charge ce fichier (`staticFile`) et pose les bruitages en temps musicaux, `t(n)`. `Complete` l'importe, et la version carrée l'importera telle quelle : le son est identique, quel que soit le format.
- La musique est jouée à `VOLUME_MUSIQUE = 1` (`src/tempo.ts`) : elle sort du mastering à -16 LUFS et -1,8 dBTP.
- Le double fondu est supprimé. La musique s'éteint d'elle-même ; il ne reste qu'un fondu de sécurité sur les 3 dernières images (897 à 899), sans effet mesurable ici (la musique y est déjà vers -45 dBFS, et son dernier échantillon vaut 0).
- Sans musique dans `public/`, rien ne change : la feuille d'origine (`EFFETS_SANS_MUSIQUE`, notes et impact compris) est jouée comme avant.

**Feuille de bruitages avec la musique** (`EFFETS_AVEC_MUSIQUE`).
- Méthode : chaque bruitage de la feuille d'origine a été mesuré sur la musique v2, avec `python3 musique/mixage.py --feuille sans` (résultats dans `out/musique/mixage-feuille-origine.json` et `.png`).
- Règle : un bruitage reste s'il ne tombe pas au même instant qu'un accent semblable de la musique, s'il est calé sur elle et s'il n'est pas masqué. Il est alors réglé 6 à 10 dB sous elle.
- **Retirés : 35 sur 47, dont les 11 que la musique joue elle-même.**
  - note-1 à note-4 et impact-doux : la cloche et l'impact de la musique les jouent.
  - Les 8 tics du compteur (16 à 17,4), toutes les 3 images : seul celui de 16 tombe sur une note. Cinq tombent à 40-50 ms de la double croche la plus proche et un à 8 ms : on entend deux coups. Celui de 17 est masqué par le clap. La grimpée de la musique joue déjà le défilement.
  - Les whooshes de 11,2, 23,33, 24, 31,33, 42, 46 et 55,33. Leur émergence va de -2,6 à +1,0 dB : ils sont masqués. Ceux de 11,2, 23,33, 42 et 55,33 sont en plus recouverts par les souffles de la musique (à -1,6, -5,4, -3,0 et -5,2 dB d'eux dans leurs bandes).
  - Les clics de 13 et 15 et les tics de 35, 51 et 53 : le clap tombe au même instant, et ils émergent de -6,9 à +4,0 dB. Le clic de 14 et les tics de 52 et 54 resteraient seuls entre deux claps : au milieu du groove, ils se liraient comme une percussion de plus. Ils sont donc retirés aussi : la grosse caisse marque déjà chaque temps. Les « pings » de 13,5, 14,5 et 15,5 répondent désormais aux anneaux eux-mêmes.
  - Le clic de 46,5 : un bruitage ne peut partir qu'au début d'une image. À l'image 698, il tombe 16,7 ms après le shaker du contretemps, et il émerge de 1,8 dB seulement. La cymbale de 46 et la cloche de 47,5 portent ce plan.
  - **Du temps 42 à la fin, la musique porte donc seule le montage**, sans aucun bruitage.
- **Gardés : 12.** Ils sont listés ci-dessous avec leur gain, puis les mesures sur le rendu Remotion (`out/musique/mixage.json`) :
  - niveau relatif : énergie pondérée K du bruitage contre celle de la musique, sur sa durée utile, au moins 100 ms ;
  - émergence : meilleur tiers d'octave ;
  - la note la plus proche de la musique.

| Temps | Son | Gain | Niveau relatif | Émergence | Musique au même instant |
|---|---|---|---|---|---|
| 0 | whoosh-doux | -9,5 dB | -7,8 dB | +20,3 dB | début de la nappe ; souffles de la musique à -21,5 dB |
| 3 | pop | -6,5 dB | -7,9 dB | +5,0 dB | nappe seule |
| 6, 7, 8 | clic | +5 dB | -7,7 / -8,2 / -9,4 dB | +14,3 / +16,3 / +15,9 dB | battement grave sur le temps (0 ms) |
| 26 | clic | +10 dB | -8,3 dB | +17,5 dB | grosse caisse (0 ms), pas de clap |
| 34 | clic | +10 dB | -8,1 dB | +21,0 dB | grosse caisse (0 ms) |
| 36 | tic | +18 dB | -8,3 dB | +22,3 dB | dernière grosse caisse avant la descente |
| 37 | tic | +8 dB | -8,0 dB | +26,6 dB | descente, sans frappe |
| 37,33 | whoosh-court | -7,5 dB | -8,2 dB | +24,6 dB | fin de la descente (déjà 15 dB sous son départ, fermée sous 850 Hz) ; souffles de la musique à -27,3 dB |
| 39, 40 | clic | +5 dB | -8,2 / -8,0 dB | +20,9 / +12,8 dB | pause ; piano à 39 |

- Deux frappes douces restent au même instant :
  - à 8 et à 40, la première frappe d'un roulement de caisse claire (force 0,25 et 0,31) ;
  - ce ne sont pas des accents : le clic les domine (+15,9 et +12,8 dB), et les deux attaques coïncident à 1 ms près, donc on n'entend qu'un seul coup.
- Les gains vont de -9,5 à +18 dB, car les sons de `public/sons/` ont été écrits pour une vidéo sans musique : le tic dure 15 ms, à -24 dBFS. Même à +18 dB, la crête du tic de 36 reste à -9 dBFS par canal.

**Mesures du rendu** (`npm run rendu -- son` : `out/musique/mix-complete.wav`, rendu par Remotion, puis `mixage.py`).
- **Niveau :** sonie intégrée -15,99 LUFS, crête vraie -1,80 dBTP, crête échantillon -1,80 dBFS, LRA 5,3 LU. Musique seule : -16,00 LUFS et -1,80 dBTP. Les bruitages n'ajoutent donc rien aux crêtes.
- **Après un encodage AAC-LC 160 kb/s** (même réglage que `complete.mp4`, ffmpeg de Remotion), puis décodage : -16,04 LUFS, crête -1,71 dBTP, aucun décalage.
- **Calage et gains :** le rendu ne s'écarte du modèle que de -90,3 dBFS au plus (hors 0,2 dernière seconde : -58,6 dBFS, à cause du fondu de sécurité par paliers d'image). Chaque bruitage est retrouvé à 0 échantillon de sa place, avec 0,00 dB d'écart de gain.
- **Placement :** chaque bruitage part au début de son image, à la milliseconde près (l'`adelay` de Remotion est arrondi à la ms) ; les sons mono sont recopiés sur les deux canaux à -3 dB. Le seul bruitage hors d'un temps entier, celui de 37,33, part à 18,667 s (image 560, au moment où le plan C5 commence à sortir), soit 37⅓ temps à 0,3 ms près.
- **Clics :** 0 hors des attaques voulues. Le détecteur de `analyse.py` signale 2 impulsions, au début des clics (2 ms de bruit blanc, par construction).
- **Fin :** dernier échantillon à 0 sur les deux canaux, -41 dBFS efficaces sur la dernière demi-seconde.
- **Longueur :** le WAV a 16 échantillons de plus que 30 s (0,3 ms), parce que l'`adelay` de 37,33 est arrondi à la ms supérieure. C'est sans effet.
- **Sonie par plan (C1 à C9), mélange puis musique seule :** -21,3 (-21,4) · -18,4 (-18,4) · -15,5 (-15,5) · -15,0 (-15,1) · -18,1 (-18,2) · -19,7 (-19,7) · -14,3 (-14,3) · -14,7 (-14,7) · -16,1 (-16,1) LUFS.

**Comparer avec et sans bruitages.** La prop `bruitages` (true par défaut) de `Complete` passe à `BandeSon`.
- `npm run rendu -- son` écrit `out/musique/mix-complete.wav` et `out/musique/mix-complete-sans-bruitages.wav`, deux WAV à écouter l'un après l'autre (une minute en tout).
- `npm run rendu -- complete --sans-bruitages` rend la vidéo dans `out/complete-sans-bruitages.mp4`. La boucle et l'affiche ne sont pas touchées.
