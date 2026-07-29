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
