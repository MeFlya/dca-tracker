# À faire manuellement — actions qui nécessitent Maël

Mis à jour : 28 juillet 2026, après le Lot 0.
Classé par urgence. Ce que je ne peux pas faire depuis le code.

---

## 🔴 URGENT — avant / au moment du merge du Lot 0

### 1. Définir `CRON_SECRET` sur Vercel

**Sans ça, les emails automatiques s'arrêtent.** Les 5 routes cron sont passées
en *fail-closed* : si la variable est absente, elles répondent `503` au lieu de
s'exécuter. C'est volontaire (elles étaient jusqu'ici **publiquement
déclenchables par n'importe qui**), mais ça impose de poser la variable.

1. Générer un secret : `openssl rand -hex 32`
2. Vercel → projet `dca-tracker` → Settings → Environment Variables
3. Nom `CRON_SECRET`, valeur = le secret, cocher **Production** (+ Preview)
4. Redéployer

Vercel envoie automatiquement l'en-tête `Authorization: Bearer <CRON_SECRET>`
sur ses appels cron, donc rien d'autre à configurer côté code.

**Vérification après déploiement** — doit répondre `401` ou `503`, jamais `200` :
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dcatracker.fr/api/cron/monthly-update
```

### 2. Vérifier qu'aucun email de masse n'est parti pendant la faille

Les crons ont été ouverts pendant une durée indéterminée. Dans le dashboard
**Resend → Logs**, contrôler qu'il n'y a pas eu d'envois anormaux (volume ou
horaires inattendus). Si oui, il faudra surveiller la réputation d'expéditeur.

---

## 🟠 IMPORTANT — décisions et vérifications

### 3. Confirmer les taux fiscaux 2026 auprès d'une source officielle

La hausse est vérifiée (LFSS 2026, loi n° 2025-1403 du 30/12/2025) :
prélèvements sociaux **18,6 %** (CSG 10,6 %), PFU **31,4 %**.

**Correction de ce que j'avais écrit ici le 28/07 :** j'affirmais que les gains
PEA de 2018-2025 restaient à 17,2 % via un taux historique. **C'est faux.** Les
taux historiques ont été supprimés par la LFSS 2018 (art. 8, V) pour tous les
faits générateurs postérieurs au 01/01/2018. Règle réelle :

- **PEA ouvert à partir du 01/01/2018** → aucun taux historique. Le taux en
  vigueur au retrait s'applique à **la totalité du gain**. C'est le cas
  majoritaire de l'audience (PEA ouverts pendant le boom ETF 2023-2025).
- **PEA ouvert avant 2018** → clause de sauvegarde sur la seule fraction
  acquise avant le 01/01/2018 (et, si le plan avait moins de 5 ans à cette
  date, jusqu'à son 5ᵉ anniversaire).

Ma règle initiale aurait **sous-estimé l'impôt** de la majorité des lecteurs —
l'erreur la plus dangereuse dans un module vendu. Reste à faire confirmer sur
Légifrance avant codage : la rétroactivité 2025 sur les plus-values mobilières,
et le traitement de la fraction 2018→5ᵉ anniversaire d'un plan pré-2018.

Le moteur aura besoin de la **date d'ouverture du PEA** en paramètre d'entrée,
et d'un barème **versionné par année avec tests**, pas de constantes.

**Cartographie faite le 28/07, à garder pour ce lot.** Le moteur EST centralisé
(`SOCIAL_CHARGES_RATE = 0.172` et `PFU_RATE = 0.30` dans
`src/lib/fiscal/pea-cto.ts`, dont `recap.ts` dérive correctement ses libellés).
**Mais 79 lignes réparties dans 15 fichiers répètent les taux à la main** dans
la copie éditoriale :

| Fichier | Occurrences |
|---|---:|
| `src/lib/etf-comparisons.ts` | 13 |
| `src/lib/glossary-terms.ts` | 12 |
| `src/app/calculateur-fiscal-pea-cto/page.tsx` | 8 |
| `src/app/pea-ou-cto/page.tsx` | 7 |
| `src/lib/fiscal/recap.ts` | 6 |
| `src/lib/fiscal/pea-cto.ts` | 5 |
| … 9 autres fichiers | 28 |

Conséquence : **modifier les deux constantes corrigerait le calculateur en
laissant tout le contenu faux.** Le lot fiscal doit donc traiter les deux, et
idéalement faire dériver la copie des constantes partout où c'est possible.

### 4. S'inscrire aux programmes d'affiliation (Lot 1)

✅ **Le SIRET existe déjà** (`10500270300012`, publié dans les mentions
légales). Il n'y a donc aucun prérequis administratif bloquant — j'avais repris
à tort cette alerte sans vérifier le dépôt.

Ordre de priorité retenu :

| Courtier | Plateforme | Pourquoi |
|---|---|---|
| **Trade Republic** | Impact.com | PEA + plans DCA ETF — c'est le sujet du site |
| **Fortuneo** | TimeOne (programme 1325) | seul du lot à commissionner réellement du PEA/CTO ; barème négociable via `timeone@isoskele.fr` |
| **LYNX Broker** | programme direct | seul barème public : 70 € minimum par lead, cookie 30 j |

⚠️ **BoursoBank écarté** (Awin 6992) : leur programme rémunère l'ouverture d'un
**compte bancaire**, pas la Bourse. Un lien payé 80 € sur une page qui analyse
leur offre Bourse crée un désalignement entre ce qui est recommandé et ce qui
est rémunéré. À reconsidérer seulement si une page dédiée à leur offre bancaire
existe un jour.

⚠️ **Ne jamais prendre** : assurance-vie (Linxea, Yomoni, Nalo, Goodvest,
Ramify → immatriculation ORIAS) ni CFD (XTB, Trading 212 → périmètre pénalement
encadré de l'art. L.533-12-7 CMF).

Pour chaque programme accepté, noter le **barème de commission** et sa **date de
vérification** : ils sont publiés sur `/transparence`. Si le barème n'est pas
public, laisser vide — la page écrit « barème non public », ce qui est plus
crédible qu'un chiffre inventé.

### 4 bis. TVA intracommunautaire — à régler AVANT la première commission

Sous franchise en base (art. 293 B CGI), un micro-entrepreneur qui vend une
prestation de services à une entreprise établie dans un autre État membre de
l'UE doit en principe demander un **numéro de TVA intracommunautaire** et
déposer une **Déclaration Européenne de Services**, même sans facturer de TVA.

Awin, TimeOne et Impact.com ne relèvent pas du même régime selon leur pays
d'établissement. **À faire trancher par le SIE avant d'encaisser la première
commission**, pas après — c'est typiquement le sujet qu'on découvre trop tard.

### 4 ter. Ajouter une activité secondaire au SIRET

Le code APE actuel est **5829C — Édition de logiciels applicatifs**. Une
commission d'affiliation est une mise à disposition d'espace publicitaire,
juridiquement autre chose.

Ce n'est pas illégal et **ça ne change rien au régime fiscal** (les deux sont du
BIC prestations de services : même abattement de 50 %, mêmes cotisations).
Mais ajouter `6312Z — Portails Internet` ou `7311Z — Régie publicitaire` est
gratuit et prend dix minutes sur le guichet INPI. Quand tu auras un moment,
pas avant les candidatures.

### 4 quater. Vérifier que `hello@dcatracker.fr` est bien relevée

Le site utilisait deux adresses. `contact@` a été supprimée partout au profit de
`hello@`, qui est aussi l'expéditeur Resend et l'adresse des CGV. **Vérifier que
cette boîte est réellement relevée** : le site invite à y signaler les erreurs
et y promet les remboursements sous 14 jours.

### 5. Créer une Audience Resend

Le code d'ajout de contact existe déjà mais ne s'exécute jamais faute de
variable. Sans liste, impossible d'annoncer un changement de prix, le récap
fiscal, ou quoi que ce soit.

1. Resend → Audiences → créer « DCA Tracker »
2. Copier l'ID
3. Vercel → variable `RESEND_AUDIENCE_ID`

### 6. Créer les objectifs Plausible

Les événements sont maintenant émis, mais Plausible ne les compte comme
conversions que s'ils sont déclarés en *goals* : `invest_cta_click`,
`email_signup`, `start_trial`, `complete_payment`, `product_checkout_click`,
`product_purchase`.

Plausible → Site Settings → Goals → Add goal → Custom event.

### 7. Search Console

- Renvoyer le sitemap (il n'a pas été relu depuis le 20 avril — les `lastmod`
  sont des constantes figées au 10 juin, correction prévue au Lot 3).
- Demander l'indexation de `/simulateur` : son nouveau title du 7 juillet n'est
  toujours pas pris en compte.

### 8. Vérifier l'archivage de `/a-propos` avant de réécrire l'engagement

Avant de modifier la puce « je ne prendrai jamais de commission », vérifier si
la page est capturée sur [web.archive.org](https://web.archive.org). Le repo
étant public, le diff sera de toute façon traçable — d'où le changelog daté
prévu au Lot 1.

---

## 🟡 À PLANIFIER

### 9. Base de données

Décision prise (Postgres managé, Neon ou Supabase). À créer et à provisionner
avant le module fiscal. **Correction de mon estimation** : le plafond Clerk est
atteint vers **51 mois (~4,2 ans)**, pas 12 — la raison de migrer n'est donc pas
l'urgence du plafond mais la **persistance du module fiscal** (report des
moins-values sur 10 ans, historique des cessions, PMP pluriannuel).

### 10. Corriger les promesses de `/tarifs` avant toute hausse de prix

Trois affirmations actuellement fausses sur une page de vente (risque
L.121-2 sur les pratiques commerciales trompeuses) :
- « synthèse PDF » → c'est un `window.print()`
- « export CSV » → n'existe pas du tout
- « emails personnalisés » → l'email mensuel n'utilise jamais les données réelles

Soit on livre (Lot 2), soit on retire la mention en attendant. **Ne pas laisser
en l'état pendant une campagne.**

### 11. Le fichier `dcatracker-produit-et-prix.md` ne m'est pas parvenu

Il est cité comme référence obligatoire pour le périmètre du module fiscal
(CTO chez courtier étranger, FIFO vs PMP, change ligne par ligne, formulaire
3916-bis). Me le transmettre avant le développement du Lot 5.
