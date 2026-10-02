# Captures des produits

Déposer ici les captures d'écran du VRAI fichier, puis renseigner le champ
`screenshots` du produit dans `src/lib/products.ts`. Aucune autre modification
n'est nécessaire — le composant les affiche automatiquement.

⚠️ **Des captures du fichier réel, jamais une maquette.** Ce site vend la
vérifiabilité : un visuel reconstitué qui ne correspondrait pas à ce que
l'acheteur reçoit serait exactement le contraire de l'argument.

Recadrer, encadrer (ombre, fenêtre, pages empilées en CSS) ou composer
plusieurs vraies captures côte à côte : oui. Retoucher un chiffre, effacer
une ligne, recoller deux morceaux d'un même onglet : non.

## Format

- **PNG**, au moins **deux fois la largeur d'affichage** (écrans haute
  densité) : 1 600 px pour une page du guide, 2 000 à 3 800 px pour un onglet
  du classeur (next/image sert ensuite du WebP à la bonne taille)
- Nommer d'après le produit, sa version et ce qu'on voit : `cockpit-v2-pea.png`,
  `guide-v1-1-sommaire.png`
- Renseigner `width` et `height` réels : c'est ce qui évite que la page saute
  au chargement
- Moins de 400 Ko par image : PNG en palette de 256 couleurs, sans perte visible
  sur du texte et des tableaux
- Recadrage = rectangle contigu exact ; la marge autour est du blanc AJOUTÉ,
  jamais du contenu voisin (un bord coupé tombe sur une ligne de la grille)

## Inventaire (1er octobre 2026, Cockpit v2.0 et guide v1.1)

Les noms portent la version capturée (`cockpit-v2-…`, `guide-v1-1-…`) : une
nouvelle version du produit = de nouveaux fichiers, jamais une image remplacée
sous la même adresse (les caches du navigateur et de l'optimiseur d'images
garderaient l'ancienne).

### Guide « Démarrer le DCA en France » — PDF v1.1

Pages rendues le 01/10/2026 avec pymupdf directement depuis le PDF v1.1
livré : `private-assets/raw/guide-demarrer-dca.pdf`, sha1 `50b49f1c…`,
2 601 807 octets (c'est l'empreinte qui fait foi : `private-assets/raw/`
n'est pas versionné, et une copie de travail peut en garder une version
plus ancienne ; le `…-v1.1-BROUILLON.pdf` de `guide-sources/v1.1/` est
identique dans le dépôt principal, pas dans tous les worktrees),
1600 × 2265 px (page A4 de 594,96 × 841,92 pt à 1 600 px de large). On
montre, on ne donne pas le guide. Mêmes numéros de page qu'avec la v1.0 :
le texte des pages 19, 39, 49 et 52 est identique à la v1.0 (relu par
extraction de texte et par différence de pixels, pied de page exclu) ; seuls
leur pied de page (logo du site, « v1.1 »), la couverture et une ligne du
sommaire changent. Les pages 22 et 34 ne sont pas montrées : elles restent à
revérifier après le 5/10/2026 (annonce BoursoBank, `CHANGEMENTS.md`).

| Fichier | Page | Contenu |
| --- | --- | --- |
| `guide-v1-1-couverture.png` | 1 | Couverture aux couleurs du site : « Version 1.1 », mise à jour du 30 septembre 2026, chiffres vérifiés au 28 septembre 2026 |
| `guide-v1-1-sommaire.png` | 2 | Sommaire, parties 1 à 3 (éventail du hero seulement) |
| `guide-v1-1-arbre-enveloppe.png` | 19 | Encadré « Prendre date », arbre de décision n° 1 (votre enveloppe), début de « Et le CTO ? » |
| `guide-v1-1-arbre-enveloppe-extrait.png` | 19 | Extrait lisible, 3 px par point : du titre « Arbre de décision n° 1 » au bas de l'encadré (pixels 122,850 à 1665,2034 du rendu à 3 px/pt, même rectangle et même contenu qu'en v1.0) |
| `guide-v1-1-baisses.png` | 39 | Ouverture du chapitre 12 et tableau des quatre baisses du MSCI World en euros |
| `guide-v1-1-sept-erreurs.png` | 49 | Ouverture « Sept erreurs, classées par ce qu'elles coûtent » et leur tableau chiffré |
| `guide-v1-1-charte.png` | 52 | Annexe A, la charte d'investisseur à remplir |

### Cockpit DCA — classeur Excel v2.0

Rendues le 01/10/2026 depuis le classeur v2.0 livré :
`private-assets/raw/template-suivi-dca.xlsx`, sha1 `487c1319…`, 90 411 octets
(identique à `private-assets/raw/cockpit-v2/template-suivi-dca-v2-final.xlsx`
du dépôt principal ; même remarque que pour le guide, l'empreinte fait foi) :
cases de saisie bleues, TRI corrigé, « v2.0 · octobre 2026 », avec
`private-assets/raw/cockpit-v2/outils/captures.py --dpi 230` : chaque zone
devient la zone d'impression d'une COPIE, Microsoft Excel (Mac) l'exporte en
PDF vectoriel à l'échelle 100 %, pymupdf la rastérise, puis l'image est
recadrée sur son contenu avec une marge blanche ajoutée de 14 pt. Le classeur
n'est jamais modifié (sha1 identique avant et après). Toutes les captures sont
à la même échelle, 3,19 px par point (le texte des cellules, en Arial 10, y
fait 32 px) : un même facteur (`largeurVisiteClasseur`) donne partout le même
corps de texte. PNG en palette de 256 couleurs, de 40 à 160 Ko.

**Refaites le 02/10/2026 sur l'exemple aux cours réels**, sous les mêmes noms
(consigne du 02/10/2026 ; la règle « nouvelle version = nouveaux fichiers »
ci-dessus vaut pour une nouvelle version du produit, le classeur reste en
v2.0) : classeur sha1 `638dab57…`, 91 547 octets. Les achats restent fictifs
(mêmes parts, frais de 1,99 €), mais leurs prix sont les clôtures réelles
d'Euronext Paris du 15 du mois ou du jour de bourse suivant, et les cours de
Par ETF celles du 02/10/2026 (sources : `src/lib/cockpit-exemple.ts`). Mêmes
zones, même commande (`--dpi 230`), mêmes dimensions au pixel près ;
`cockpit-v2-frais.png` est identique (onglet indépendant de l'exemple). Les
captures de la veille restent dans l'historique git. Les images optimisées
par next/image peuvent rester en cache quelques heures après le déploiement.

| Fichier | Zone | Contenu |
| --- | --- | --- |
| `cockpit-v2-versement.png` | Versement du mois!A1:J12 | Titre, montant de 300 € (case bleue), tableau des 3 ETF : montant suggéré et parts à acheter (0, 14, 0). Hero du Cockpit, vignette du Pack (hub, appel final), carte « Ce que contient le pack » |
| `cockpit-v2-versement-mobile.png` | Versement du mois!A5:H12 | Recadrage pour les téléphones : du montant à verser à la colonne « Parts à acheter » |
| `cockpit-v2-versement-complet.png` | Versement du mois!A1:J25 | L'onglet entier : tableau avec la ligne TOTAL (291,76 € arrondis, 8,24 € de reliquat), notes de lecture, avertissement. Zoom du hero, visite (avec sa propre légende) |
| `cockpit-v2-dashboard.png` | Dashboard!A1:J24 | Les six indicateurs (dont le TRI annualisé, 17,0 % le 02/10/2026), la répartition par ETF et son camembert. Visite (onglet par défaut), vignette des cartes du Cockpit, hero du Pack, images de partage du Cockpit et du Pack |
| `cockpit-v2-pea.png` | PEA!A1:I27 | Cases de saisie, plafond de versements et sa jauge, ancienneté et compte à rebours des 5 ans, fiscalité estimée (sans les rappels ni l'avertissement) |
| `cockpit-v2-par-etf.png` | Par ETF!A1:O21 | Notes sur les cours, tableau complet : PRU, valeur, plus-value, performance, poids et écart, ligne TOTAL, contrôle des allocations |
| `cockpit-v2-projection.png` | Projection!A1:O35 | Hypothèses, capital à l'horizon, tableau des années 1 à 20 et courbe capital / versements |
| `cockpit-v2-frais.png` | Frais!A1:N29 | Hypothèses, coût des frais à 10, 20 et 30 ans, capital à 30 ans selon le TER et graphique avec et sans frais |

Certaines valeurs dépendent de la date d'ouverture du fichier (TRI, « 32 mois »
du Dashboard, âge du plan, jours avant les 5 ans) : celles des captures sont
celles du 2 octobre 2026 (1er octobre pour la première série), et les
légendes qui citent le TRI sont datées.

Les graphiques d'Excel sont ancrés sur des bords de cellules (Dashboard
H12:I23, Projection F15:O29, Frais G15:N27) : aucune zone ne les coupe.

Le TRI est montré depuis la v2.0 : en v1.3, Excel affichait 0,0 %
(signalement du 01/10/2026, corrigé dans la formule de `Dashboard!B9`).
Le TRI et les autres formules restent à vérifier dans la copie Google Sheets,
qui n'a pas été capturée.

## Images de partage (og:image)

`src/app/produits/[slug]/opengraph-image.tsx` compose, au build, une image
de 1 200 × 630 par page produit : la vraie capture (Dashboard du Cockpit,
couverture du guide, les deux pour le Pack), encadrée sur le fond sombre du
hero, avec le nom et le prix lus dans `products.ts`. Rien à déposer ici :
elle suit les captures déclarées.
