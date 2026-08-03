# Suivi SEO — avant / après daté

Sans ce fichier, on ne saura pas dans 60 jours ce qui a marché. Une ligne par
changement, avec la date, l'état de départ et ce qu'on attend.

**Ne rien mesurer avant le 26 septembre 2026** (60 jours). Google met plusieurs
semaines à recalculer un titre, et lire les chiffres à 15 jours mène à conclure
n'importe quoi.

---

## 28 juillet 2026 — Titres et descriptions des 8 pages cibles

### Le changement structurel, qui vaut plus que les réécritures

Suppression du template `"%s | DCA Tracker"` dans `src/app/layout.tsx`.

Il ajoutait 14 caractères à chaque page, soit près d'un quart du budget
d'affichage de Google. **Six des huit pages cibles étaient tronquées à cause de
lui seul.** Ce n'est pas un changement de titre : le texte visible dans les
résultats reste identique, on cesse simplement de le faire couper.

Effet de bord réglé au passage : 11 pages posaient déjà « — DCA Tracker » dans
leur propre titre et affichaient donc la marque **deux fois**
(`Tarifs — DCA Tracker | DCA Tracker`). Elles gardent leur suffixe, qui est
maintenant le seul.

### Les huit pages

| Page | Position au 28/07 | Titre avant | Titre après | Long. |
|---|---:|---|---|---:|
| `/simulateur` | 7,7 | *inchangé* | *inchangé — seuls la meta et le H1 bougent* | 57 |
| `/comparatif-etf/cw8-vs-wpea` | 10,0 | CW8 vs WPEA (vs DCAM) : le verdict 2026 pour votre PEA | CW8 vs WPEA : WPEA gagne, sauf dans deux cas précis | 51 |
| `/comparatif-etf/wpea-vs-dcam` | 9,2 | WPEA ou DCAM : notre verdict 2026 pour votre PEA | WPEA ou DCAM : égalité technique, un détail décide | 50 |
| `/investir-500-euros-mois-etf` | 6,3 | Investir 500 € par mois en ETF = 260 500 € en 20 ans (simulation) | Investir 500 €/mois en ETF : combien après 10, 20, 30 ans ? | 59 |
| `/comparatif-etf` | 14,8 | Comparatifs ETF 2026 : CW8, WPEA, DCAM, VWCE — verdicts clairs | Comparateur ETF PEA 2026 : CW8, WPEA, DCAM, VWCE | 48 |
| `/meilleurs-etf-debutants` | 10,8 | Meilleur ETF pour débuter en 2026 : un seul suffit (verdict) | Quel ETF choisir pour débuter en 2026 ? Un seul suffit | 54 |
| `/strategie-dca` | 11,7 | Stratégie DCA expliquée : avantages, limites et application ETF | DCA ou tout investir d'un coup ? Ce que disent les chiffres | 59 |
| `/etf-msci-world` | 17,9 | ETF MSCI World : lequel choisir en PEA en 2026 ? | ETF MSCI World en PEA : CW8, WPEA ou DCAM ? (2026) | 50 |

Le format `/investir-500-` a été étendu à `/investir-100-`, `/investir-200-` et
`/investir-300-euros-mois-etf`.

### Ce qu'on attend, page par page

- **`/simulateur`** — titre volontairement intact : il contient déjà la requête,
  le prix et l'argument différenciant. Seule la troncature était en cause. Le H1
  passe de « Projetez votre futur financier » — qui ne contenait ni
  « simulateur », ni « DCA », ni « ETF » — à un H1 qui porte le sujet.
- **`cw8-vs-wpea`** — la page au plus gros gisement (597 impressions sur
  `cw8 vs wpea`, position 19,9). Le `(vs DCAM)` est retiré du titre : il diluait
  le match principal pour capter une requête qui a déjà sa page, et le CTR
  mesuré était de 0,5 %. L'intent DCAM reste couvert par la meta.
- **`/comparatif-etf`** — bascule sur « comparateur », mot sur lequel le site est
  en position 50 et qui ne se substitue pas à « comparatif » dans l'index.
- **`/meilleurs-etf-debutants`** — alignement sur la requête réelle
  (`quel etf choisir pour débuter`), pas sur la formulation interne.
- **`/strategie-dca`** — repositionnement, pas réécriture. Les requêtes actuelles
  sont en position 47+. Le titre vise désormais la question réellement posée,
  à laquelle la section `#dca-vs-lump-sum` répond déjà.

### Corrections de chiffres trouvées en passant

Trois metas affichaient un capital **inférieur** à celui que la page elle-même
calcule. Corrigé :

| Page | Meta annonçait | La page affiche |
|---|---|---|
| `/investir-100-euros-mois-etf` | 52 000 € / 28 000 € | **52 100 € / 28 100 €** |
| `/investir-200-euros-mois-etf` | 104 000 € | **104 200 € / 56 200 €** |
| `/investir-300-euros-mois-etf` | 156 000 € / 84 000 € | **156 300 € / 84 300 €** |

Et une promesse non tenue : la meta de `/meilleurs-etf-debutants` annonçait
« les erreurs de débutant à éviter ». **Cette section n'a jamais existé.** La
meta décrit maintenant les sections réelles (5 critères, 4 ETF, 3 étapes).

---

## 28 juillet 2026 — Garde-fou au build

`scripts/check-seo-lengths.mjs`, branché en `postbuild`.

Il lit le **HTML réellement produit**, pas les sources : les titres passent par
des données (`etf-comparisons.ts`, `etf-index-guides.ts`, `backtest-stories.ts`)
et par des `generateMetadata` dynamiques qu'une regex sur les `.tsx` raterait.

- **Bloquant** sur tout `<title>` au-delà de 60 caractères. État actuel : **0**.
- **Signalant** sur les descriptions au-delà de 155. État actuel : **54**,
  héritage d'avant. Faire échouer le build dessus aujourd'hui reviendrait à
  désactiver le test dans la semaine. Basculer `STRICT_DESCRIPTIONS` à `true`
  quand le stock sera résorbé.

```bash
npm run seo:check
```

Neuf titres trop longs ont été raccourcis au passage, hors des 8 pages cibles :
fiches ETF C3M/AEEM/PCEU (gabarit trop verbeux), `/simulateur-retraite`,
`/backtest-depuis-2010`, `/backtest-2022-inflation`, `/allocation-portefeuille`,
`/comparatif/boursorama-bourse`, `/glossaire/replication-synthetique`,
`/glossaire/cto`, `/comparatif-etf/msci-world-vs-sp500`.

**Limite connue** : seules les pages prérendues en statique sont contrôlées
(80 pages). `/simulateur` est rendu à la demande et échappe au test.

---

## À mesurer le 26 septembre 2026

Dans Search Console, pour chacune des 8 pages : position moyenne, impressions,
CTR. Comparer au tableau ci-dessus.

Ce qu'on cherche à distinguer :

- **Le CTR monte à position égale** → les titres font leur travail.
- **La position monte** → autre chose est en cause (autorité, liens), pas les
  titres. Ne pas s'en attribuer le mérite.
- **Rien ne bouge** → le problème est ailleurs, et c'est l'autorité. Ce qui est
  d'ailleurs l'hypothèse de départ sur `/etf-msci-world` (position 17,9) et
  `/comparatif-etf` (position 41 sur `comparatif etf`), où il a été dit dès le
  départ que le titre ne suffirait pas.

---

## ⚠️ Ce que cette mesure ne pourra PAS dire — à lire avant de conclure

**Le site n'a pas le volume pour arbitrer finement, et il vaut mieux le savoir
avant de bâtir un protocole qui prétendrait le faire.**

La meilleure page, `/comparatif-etf/cw8-vs-wpea`, fait **1 258 impressions et
13 clics par trimestre**. À ce volume, **un clic vaut 0,08 point de CTR**, et
l'intervalle de confiance à 95 % autour de son 1 % s'étend d'environ **0,5 % à
1,6 %**. Conséquence directe :

- un effet **fort** (×2 ou ×3 — passer à 2 ou 3 %, soit 25 à 38 clics) sera
  visible sur un trimestre plein ;
- un effet **modéré** (1 % → 1,5 %) ne sera **jamais** détectable à ce volume.

La lecture du 26 septembre ne peut donc répondre qu'à « est-ce que ça a
beaucoup bougé ? », jamais à « est-ce que c'est un peu mieux ? ». Un résultat
nul ne prouvera pas que les titres n'ont rien fait — seulement qu'ils n'ont pas
fait beaucoup. Ne pas conclure « les titres ne servent à rien » sur une absence
d'effet mesurable.

## ⚠️ Et une condition sans laquelle la mesure ne vaut rien

**Une moyenne sur une fenêtre n'a de sens que si l'objet mesuré est resté
stable sur toute la fenêtre.**

Règle apprise en s'y faisant prendre le 2 août 2026 : un relevé Search Console
sur 90 jours a été lu comme le verdict de l'extrait de `cw8-vs-wpea`, alors que
son `<title>` avait changé **deux fois** pendant la fenêtre — le 2 juin puis le
29 juillet. Le « 1 % » mesurait donc majoritairement un titre remplacé depuis,
et la conclusion qu'on en tirait (« l'extrait est mauvais, réécrivons-le »)
aurait détruit la mesure en cours pour corriger un problème déjà corrigé.

Avant toute lecture : **vérifier la date du dernier changement de titre et de
meta**, et ne comparer que des fenêtres où ils n'ont pas bougé. Search Console
sait comparer deux périodes — s'en servir.

C'est la raison de l'embargo, et elle est plus forte qu'elle n'en avait l'air :
chaque changement de titre remet le compteur à zéro. Le titre de `cw8-vs-wpea`
a déjà bougé le 02/06 et le 29/07, et sa meta le 02/08 (correction d'un chiffre
faux, non négociable). **La fenêtre exploitable commence donc au 2 août 2026,
pas au 29 juillet.**

## ⚠️ Une position moyenne de page ne décrit aucune requête réelle

Troisième piège de la même famille, trouvé le 2 août au niveau des requêtes.

La page `/comparatif-etf/cw8-vs-wpea` affiche une position moyenne de **9,7**.
Mais la requête qui porte la moitié de ses impressions — « cw8 vs wpea »,
658 impressions sur 90 jours — est en position **19,7**. Page 2. La moyenne de
la page est pondérée sur des dizaines de requêtes, dont beaucoup sont minuscules
et bien classées ; elle ne décrit aucune requête réelle.

Conséquence : le CTR de 0,6 % sur cette requête n'a rien d'anormal, c'est ce
qu'on attend en position 19,7. **Ce n'est pas un extrait à réécrire, c'est un
classement à gagner** — contenu, maillage, liens entrants. Toujours descendre
au niveau requête avant de conclure sur une page.

Corollaire pour le 26 septembre : lire les positions **par requête**, pas par
page. Une page peut progresser en moyenne en reculant sur sa requête
principale.

## 🔴 Un facteur de confusion introduit par le lot 3 lui-même

**À lire avant toute conclusion le 26 septembre.**

Le commit du 29/07 a réécrit le titre de `/etf-msci-world` :

```
avant : ETF MSCI World : lequel choisir en PEA en 2026 ?
après : ETF MSCI World en PEA : CW8, WPEA ou DCAM ? (2026)
```

L'ancien ciblait l'intention propre de la page (« etf msci world », « quel etf
msci world »). Le nouveau place « CW8, WPEA ou DCAM ? » dans le titre —
c'est-à-dire **la requête que `/comparatif-etf/cw8-vs-wpea` vise**. Trois pages
du site nomment désormais CW8 et WPEA dans leur `<title>` : le duel, ce guide,
et le hub `/comparatif-etf`.

Ce qu'on peut affirmer et ce qu'on ne peut pas :

- **La collision existe depuis le 29/07 et n'existait pas avant.** Vérifiable
  dans le diff.
- **Elle n'explique PAS la position 19,7 observée**, qui porte sur une fenêtre
  antérieure au changement. Les deux pages étaient déjà autour de la position 19.
- **Elle contamine en revanche la lecture du 26 septembre** : si les deux pages
  se disputent la même grappe, aucun des deux effets de titre ne sera lisible
  isolément. Ne pas attribuer à un titre ce qui pourrait venir de la collision.

Le maillage, lui, est déjà correct : `/etf-msci-world` pointe vers le duel avec
l'ancre « CW8 vs WPEA : le comparatif détaillé », et le hub avec « CW8 vs WPEA ».
Le seul levier restant est le titre — donc une décision qui s'oppose à
l'embargo, et qui doit être prise en connaissance de cause plutôt que subie.
