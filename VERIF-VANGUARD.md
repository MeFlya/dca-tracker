# Vérification du rapport Vanguard, page par page

Source : Vanguard Research, *Cost averaging: Invest now or temporarily hold your cash?*,
**février 2023** (métadonnées PDF : créé le 24/02/2023). Auteur institutionnel : Vanguard,
aucun auteur nommé sur la page de garde ni en dernière page.
[PDF officiel](https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf)

Texte extrait du PDF et comparé cellule par cellule. Ce document sert de source
unique pour la section Vanguard de `/strategie-dca` : **ne rien y écrire qui ne
figure pas ici.**

---

## ✅ Ce qui est confirmé exactement

**Le chiffre principal — 68 %.** Page 3, verbatim :
> « LS is a better option than CA, outperforming 68% of the time »

**Le cadre**, note de la Figure 2, page 3 : horizon d'un an, étalement sur trois
mois en trois parts égales à un mois d'intervalle, portefeuille **100 % actions**,
**aucun intérêt sur la part non investie**, mesure en fenêtres glissantes.

**Figure 3 — 5ᵉ percentile, 100 % actions, 100 000 $, à un an :**

| | Tout d'un coup | Étalement 3 mois |
|---|---|---|
| 5ᵉ percentile | **82 947 $** | **85 906 $** |

Confirmé au dollar près. Les autres percentiles de la même colonne, pour mémoire :
95ᵉ 139 453 / 131 012 · 75ᵉ 119 063 / 116 286 · 50ᵉ 111 940 / 109 580 ·
25ᵉ 102 070 / 101 531.

**La phrase de nuance**, page 5, verbatim :
> « LS outperforms in all but the worst outcomes (below the 25th percentile) »

**Figure 6 — toutes les valeurs vérifiées**, aucune erreur dans le tableau transmis.

---

## 🔴 Correction 1 — l'observation « en Europe, étaler ne coûte rien » ne tient pas

C'était l'observation présentée comme le contenu propre de la page. Deux
problèmes, chacun suffisant.

**a) Ce n'est pas l'indice de notre audience.** La ligne « Europe » du tableau est
adossée au **MSCI Europe, 1998-2022** — un portefeuille d'actions européennes.
L'audience du site investit en **MSCI World**. Or la Figure 6 contient une
colonne *Global EUR* qui n'était pas dans le tableau transmis, et c'est celle-là
qui nous concerne :

| Étalement | Europe (MSCI Europe) | **Global EUR (MSCI World)** |
|---|---|---|
| 3 mois | 66,5 % | **66,4 %** |
| 4 mois | 66,9 % | **66,8 %** |
| 5 mois | 66,5 % | **67,2 %** |
| 6 mois | 65,4 % | **67,9 %** |

La courbe « Global EUR » **monte**, comme partout ailleurs. La platitude observée
appartient au MSCI Europe, pas au portefeuille d'un investisseur français en ETF
World. *(La colonne Global GBP, également absente du tableau transmis, monte
aussi : 67,8 → 68,9 → 69,7 → 70,8.)*

**b) Le rapport dit explicitement le contraire, comme conclusion générale.**
Page 5, verbatim :
> « the longer the CA horizon—the time it takes to fully invest cash—the greater
> the opportunity cost incurred. Splitting investments across a longer period
> further decreases CA's performance versus LS. »

Publier « étaler sur six mois plutôt que trois n'a jamais rien coûté à un
investisseur européen » comme ligne actionnable reviendrait à contredire la
conclusion explicite du document qu'on cite, à partir d'une ligne qui parle d'un
autre indice. Sur une page dont l'objet est de ne pas citer à la légère, c'est
exactement la faute à ne pas commettre.

---

## 🔴 Correction 2 — le cash rémunéré n'est pas un angle inédit, Vanguard l'a fait

Le brief pose que modéliser la rémunération des liquidités est « le seul endroit
du calcul où on apporte quelque chose que la littérature n'a pas ». Page 5,
verbatim :

> « We also added cash interest to our analysis to determine how that changes the
> outcome. Even assuming reasonable interest for the amount left in cash, as
> proxied by the 3-month U.S. Treasury bill rate, our results are similar: **LS
> outperforms the 3-month CA strategy 65% of the time** for an all-equity
> portfolio. We also varied the cash interest rate to find that, unsurprisingly,
> as cash interest increases, LS's advantage diminishes, all other things being
> equal. »

Donc : 68 % sans rémunération, **65 % avec**. L'effet est réel mais modeste, et
il est déjà publié.

**Ce qui reste réellement original, et qui est plus étroit mais défendable :**
Vanguard rémunère au **bon du Trésor américain à 3 mois**. L'argent en attente
d'un épargnant français est sur un **Livret A** ou un fonds monétaire en euros —
autre devise, autre taux, autre trajectoire depuis 2022. Personne n'a publié le
calcul avec le taux qui concerne cette audience. C'est une revendication tenable ;
« la littérature ne l'a pas fait » ne l'est pas.

---

## 🟠 Correction 3 — la période n'est pas 1976-2022 pour l'euro

Le cadre transmis indique « MSCI World 1976-2022 ». C'est exact pour l'USD et le
GBP. Note de la Figure 6 :

> « for global returns, the MSCI World Index, 1976–2022 (for USD and GBP) and
> **1998–2022 (for EUR)** »

La série en euros commence en **1998**. À écrire tel quel : sur une page destinée
à des investisseurs français, annoncer 46 ans de recul quand la série qui les
concerne en couvre 24 serait exactement le genre d'imprécision qu'on reproche
aux autres.

---

## ➕ Trouvé au passage, vérifié, et utile

**Figure 2, page 3** — deux chiffres qui manquaient et qui nuancent bien :
- le tout-d'un-coup bat le cash **70 %** du temps ;
- **l'étalement bat le cash 69 % du temps.** C'est l'argument à opposer à qui
  hésite entre étaler et attendre : étaler reste très largement meilleur que ne
  rien faire.

**Page 5** — l'écart en euros, chiffré :
- portefeuille 60/40 : valeur finale moyenne 107 453 $ en étalement contre
  109 360 $ d'un coup, soit **1,8 % de plus** ;
- à la médiane, en 100 % actions, le tout-d'un-coup donne **2,2 % de plus** ;
  en 40/60, **1,2 % de plus**. Plus la part actions est élevée, plus l'écart se
  creuse — le rapport l'explique par la prime de risque perdue pendant les mois
  passés en liquidités.

**Page 5** — pourquoi l'horizon de mesure ne change pas le classement :
> « Because the asset allocations of the CA and LS portfolios are identical at the
> end of the CA period, the portfolio with more assets at that point will stay
> ahead forever »

C'est la réponse à « et si on mesurait à cinq ans ? » : le classement ne bouge
pas, seul l'écart en euros grandit.

**Page 6** — le volet simulation : 10 000 scénarios, cas de base 60/40 avec 0 %
d'intérêt sur les liquidités, et le constat que le tout-d'un-coup subit des
baisses plus profondes dans les pires environnements.

---

## Règles pour la rédaction

1. **Garder les dollars.** L'étude est en dollars ; convertir serait une invention.
2. **Ne jamais mélanger ces pourcentages avec nos futurs calculs.** Deux questions
   différentes : fréquence sur trois mois de déploiement chez eux, conséquence à
   une date donnée chez nous. Deux sections, deux sources, et une phrase qui dit
   que ce ne sont pas les mêmes chiffres.
3. **Citer la ligne « Global EUR », pas la ligne « Europe »**, chaque fois qu'on
   parle de l'audience du site.
4. **Écrire le cadre en entier** : 100 % actions, étalement sur trois mois, mesure
   à un an, liquidités non rémunérées, MSCI World en euros depuis 1998. C'est
   l'omission de ce cadre qui rend la version actuelle de la page critiquable.
