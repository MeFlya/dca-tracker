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

J'ai vérifié la hausse (LFSS 2026, loi n° 2025-1403 du 30/12/2025) :
prélèvements sociaux **18,6 %** (CSG 10,6 %), PFU **31,4 %**.

**Mais le document reçu simplifie le PEA, et c'est important :** le PEA applique
un **taux historique par millésime** — les gains 2026+ à 18,6 %, ceux de
2018-2025 restent à **17,2 %**. L'assurance-vie et l'immobilier restent aussi à
17,2 %. Un simple remplacement `17,2 → 18,6` dans le site produirait donc des
**chiffres faux** sur le PEA, qui est justement le cœur de l'audience.

À faire confirmer sur **impots.gouv.fr / Légifrance** avant que je code le
barème (surtout pour la rétroactivité 2025 évoquée, que je n'ai pas pu vérifier).
Je livrerai un barème **versionné par année avec tests**, pas des constantes.

### 4. S'inscrire aux programmes d'affiliation (Lot 1)

Rien ne peut avancer côté revenu sans ces identifiants :

| Courtier | Où | À récupérer |
|---|---|---|
| Trade Republic | programme apporteur / Impact | URL affiliée + ID |
| BoursoBank | Awin ou FinanceAds | URL affiliée + ID |
| Fortuneo | Awin / TimeOne | URL affiliée + ID |

⚠️ **Ne pas prendre de programme assurance-vie** (Linxea, Yomoni, Nalo,
Goodvest, Ramify) : ça ferait basculer le site sous la directive distribution
d'assurance et imposerait une immatriculation ORIAS.

Noter aussi le **barème de commission** de chacun (pour la page `/transparence`)
et la **date de vérification** des conditions tarifaires.

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
