# Audit des promesses de `/tarifs` — promesse → code → état

28 juillet 2026. Les 23 lignes du comparatif vérifiées une par une contre le
code, chaque manque allégué soumis à un agent chargé de le réfuter.

**Résultat : 0 promesse totalement absente, 11 partielles, 12 conformes.**

C'est meilleur que ce que je craignais sur le plan légal. Mais l'audit a sorti
un problème plus grave que les promesses : **le produit payant est calculé puis
envoyé au navigateur de tout le monde, et simplement masqué en CSS.**

---

## 🔴 Le vrai sujet : le paywall n'en est pas un

`src/components/simulator/MonteCarloChart.tsx:238`

```tsx
<div className={isPremium ? "" : "blur-sm pointer-events-none select-none"}>
```

Le calcul Monte Carlo tourne pour tous les visiteurs, le résultat part dans le
HTML, et il est flouté par une classe CSS. Retirer la classe dans les outils de
développement suffit. Idem pour la comparaison A vs B.

Pire : **`/upgrade` est une page publique** qui appelle `runMonteCarlo()` et
affiche les vraies valeurs de la stratégie saisie par le visiteur — 10ᵉ
percentile, 90ᵉ percentile, probabilité d'être en plus-value.

| Fonctionnalité Premium | Verrou réel |
|---|---|
| Récap fiscal annuel | ✅ **serveur** — `recap-fiscal/page.tsx:19-26`, `redirect()` si plan ≠ premium |
| Backtest historique | ✅ **serveur** — `backtest/page.tsx:46-47`, `getUserSubscription()` dans un Server Component |
| Suivi de stratégie | ✅ **serveur** — `/account(.*)` protégé par le middleware |
| **Monte Carlo** | 🔴 **CSS uniquement** — calculé pour tous, flouté |
| **Comparaison A vs B** | 🔴 **CSS uniquement** — les deux simulations calculées pour tous |
| **Simulations sauvegardées** | 🔴 **client uniquement** — `localStorage`, plan lu via `useUser()` |
| **Export PDF** | 🔴 **client uniquement** — plan lu dans le navigateur |

Trois verrous sur sept sont réels. Les quatre autres sont décoratifs.

**Ça ne coûte presque rien aujourd'hui** — le site a peu de visiteurs. Ça coûtera
exactement au moment où le trafic arrivera, c'est-à-dire au moment où
l'abonnement doit commencer à rapporter. À traiter avant toute campagne, pas
après.

**Correctif requis** : ne pas calculer côté client ce qui est vendu. Monte Carlo
et A/B doivent passer par une route d'API qui vérifie le plan côté serveur, et
`/upgrade` doit montrer un exemple à valeurs fixes, pas la stratégie réelle du
visiteur.

---

## Les 23 lignes

### ✅ Conformes (12)

| Ligne | Preuve |
|---|---|
| Suivi de stratégie mois après mois | verrou serveur, fonctionnalité complète |
| Insights automatiques (réel vs projection) | implémenté |
| Streak de mois consécutifs | implémenté |
| Calculateur fiscal PEA vs CTO | public, conforme (annoncé gratuit) |
| Comparaison net après impôt sur 30 ans | public, conforme |
| Simulation DCA mensuelle | public, conforme |
| 3 scénarios (conservateur/base/optimiste) | rendus pour tous, conforme |
| Intégration TER automatique | sans compte, conforme |
| Accès à tous les ETF | aucun ETF réservé, conforme |
| Lien de partage de simulation | conforme |
| Guides PEA / CTO / fiscalité | routes publiques, conforme |
| Fiches ETF détaillées | 12 des 14 ETF ont une fiche ; JPNK et C3M n'en ont pas |

### 🟠 Corrigées aujourd'hui (7)

| Ligne | Ce qui n'allait pas | Correctif |
|---|---|---|
| **Export PDF** — « Gratuit : Filigrané » | Un utilisateur gratuit n'obtenait **aucun PDF** : `ExportPDFButton` redirigeait vers `/upgrade` sans rien générer. Le filigrane existait pourtant déjà dans `pdf-export.ts:360`, jamais activé. | Le plan gratuit reçoit désormais le PDF **filigrané**. La promesse devient vraie, et un PDF qui circule vaut mieux qu'une redirection. |
| **Support par email** — Premium uniquement | La même adresse `hello@dcatracker.fr` est offerte à tous dans le pied de page de chaque page. Un abonné payait pour ce que tout le monde a. | Passé en gratuit **et** Premium. |
| **Données de marché (~15 min)** | Le cache est à 3 600 s, soit **60 minutes** (`cache.ts:44`). Le chiffre ne correspondait à aucune constante. | « Données de marché (différées) » — vrai, et ne rote pas si le TTL change. |
| **Durée jusqu'à 30 ans** | Le code autorise **40 ans** (`simulation-params.ts:19`). Écart en faveur du client, mais faux quand même. | Corrigé à 40 ans. |
| **Récap fiscal (cases 2042 et 2074 calculées)** | « Calculées » survendait : l'utilisateur doit cocher « J'ai vendu » puis saisir lui-même le montant brut cédé et le capital investi. | « Montants des cases 2042 et 2074 ». |
| **Suivi année par année des plus-values** | Ce qui est suivi est la plus-value **latente** — la page elle-même écrit « non taxable tant que pas vendu ». En fiscalité, « plus-value » désigne la plus-value réalisée. | « Plus-value latente ». |
| **FAQ : « et un export en CSV »** | N'existe nulle part dans le code. | Retiré. |

### 🟠 Restantes, hors périmètre de ce lot (2)

| Ligne | État |
|---|---|
| **Backtest « données réelles MSCI World »** | Ce n'est pas l'indice mais un proxy, l'ETF **IWDA.AS** coté en euros. C'est déjà déclaré dans le JSON et **affiché sur la page** (`backtest/page.tsx:151`), donc l'utilisateur n'est pas trompé — mais la ligne du comparatif, elle, ne le dit pas. À arbitrer : préciser « via l'ETF IWDA » dans le comparatif, ou laisser. |
| **Email mensuel personnalisé** | 🟠 Voir ci-dessous — c'est le point le plus rentable du lot. |

---

## 🟠 L'email mensuel : la fonctionnalité qui justifie l'abonnement ne récapitule rien

C'est la première ligne du comparatif, celle qui porte le caractère récurrent de
l'abonnement. Elle mérite son propre paragraphe parce que le diagnostic est
précis et le correctif contenu.

**Ce qui marche.** L'email part bien le 1ᵉʳ de chaque mois à 9 h
(`vercel.json`), la route est protégée, les comptes gratuits sont exclus, et le
contenu dépend de la stratégie de l'abonné — mois calculé depuis son
`startMonth`, son versement mensuel, son rendement cible. Il n'est donc pas
identique pour tout le monde.

**Ce qui ne marche pas.** Dans `api/cron/monthly-update/route.ts`, les entrées
de l'utilisateur sont récupérées **ligne 54 puis jamais utilisées**. Le chiffre
mis en avant est étiqueté « Valeur théorique ce mois » : c'est la projection.
La valeur réelle du portefeuille, les versements saisis et l'écart réel vs
projection — c'est-à-dire le produit — n'apparaissent nulle part.

> **Un abonné qui a saisi 12 mois reçoit exactement le même email qu'un abonné
> qui n'a jamais rien saisi**, à paramètres de stratégie identiques.

Et la FAQ de la même page parle d'un « email récapitulatif ». Il ne récapitule
rien de ce que l'utilisateur a saisi.

**Pourquoi c'est le meilleur rapport effort/rendement du lot** : le moteur
existe déjà. `computeInsights()` dans `src/lib/strategy-insights.ts` calcule
déjà le total investi, la valeur réelle du portefeuille, le gain, le score de
discipline, le meilleur et le pire mois, l'avance ou le retard sur la
projection. Il est importé par le tableau de bord — **jamais par le cron**. Ce
n'est pas une capacité manquante, c'est un câblage oublié.

La preuve que la donnée était accessible : le cron voisin `missed-month`, lui,
lit bien les entrées et calcule le streak.

**Correctif** : importer `computeInsights` dans le cron, élargir la signature de
`sendMonthlyUpdate` (qui n'accepte aujourd'hui que `theoreticalValue`), et
afficher le réel à côté du théorique.

**Trouvé au passage, et à traiter avec** : les emails ne contiennent **aucun
lien de désinscription**, et aucun réglage de préférences n'existe dans
`/account/settings`. C'est une obligation pour de l'email non transactionnel, et
c'est aussi ce qui protège la réputation d'expéditeur du domaine.

### Ma correction sur `ETAT-DES-LIEUX.md`

J'y avais écrit que cet email « n'utilise jamais les données réelles ».
J'ai ensuite voulu me corriger en écrivant que je m'étais trompé. **Les deux
formulations étaient imprécises.** L'exact : l'email utilise les paramètres de
stratégie de l'abonné, mais **jamais ses versements enregistrés**. Ma phrase
d'origine était donc substantiellement juste, et mon auto-correction était
excessive.

---

## Autre trouvaille : les taux fiscaux périmés étaient aussi sur la page de vente

La FAQ de `/tarifs` annonçait « les prélèvements applicables (**PFU 30 % ou
17,2 %** selon durée de détention) ». Ce sont les taux d'avant la LFSS 2026.

Les taux sont retirés de cette phrase en attendant le barème versionné : la
réponse dit maintenant « selon l'enveloppe et la durée de détention », ce qui
reste vrai quel que soit le taux. Les **79 autres occurrences** dans le reste du
site sont cartographiées dans `A-FAIRE-MANUELLEMENT.md` et relèvent du lot
fiscal.

---

## Ce qui reste à faire, par ordre de rendement

1. **Verrouiller côté serveur Monte Carlo, A/B, PDF et simulations
   sauvegardées.** C'est ce qui décide si l'abonnement est vendable quand le
   trafic arrivera.
2. **Rendre `/upgrade` non calculant** — exemple à valeurs fixes.
3. **Structurer `BrokerSpecs` en nombres** — condition de conformité D.111-7 III
   *et* déblocage du « combien votre DCA coûte chez chacun ».
4. **Barème fiscal versionné par année**, avec la date d'ouverture du PEA en
   entrée, et reprise des 79 occurrences en dur.
