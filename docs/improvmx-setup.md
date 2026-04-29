# Configuration ImprovMX — recevoir les emails envoyés à `hello@dcatracker.fr`

ImprovMX est un service gratuit de **forwarding d'email**. Il permet de recevoir
sur ta boîte Gmail perso tous les emails envoyés à `hello@dcatracker.fr` (et
optionnellement `contact@`, `support@`, etc.) sans avoir à payer Google Workspace.

**Combien ça coûte :** gratuit jusqu'à 10 alias et 25 emails / jour. Largement
suffisant pour démarrer.

---

## Étape 1 — Créer un compte ImprovMX

1. Va sur https://improvmx.com/
2. Clique sur **"Add your domain"**
3. Renseigne `dcatracker.fr`
4. Choisis **Free plan**
5. Crée ton compte avec ton email perso (`mael.faleyras@gmail.com`)

---

## Étape 2 — Configurer les enregistrements MX dans Vercel

ImprovMX va te demander d'ajouter **2 enregistrements MX** dans le DNS du
domaine. Comme `dcatracker.fr` est géré par Vercel DNS :

1. Va sur https://vercel.com/dashboard
2. Clique sur ton projet → onglet **Domains** → `dcatracker.fr`
3. Trouve la section **DNS Records** (ou clique sur "Manage DNS")
4. Ajoute les **deux enregistrements MX suivants** :

   | Type | Name | Value                   | Priority | TTL  |
   | ---- | ---- | ----------------------- | -------- | ---- |
   | MX   | `@`  | `mx1.improvmx.com`      | 10       | 3600 |
   | MX   | `@`  | `mx2.improvmx.com`      | 20       | 3600 |

5. Sauvegarde.

> ⚠️ **Important** : ne SUPPRIME PAS les enregistrements existants pour `_resend`,
> `dmarc`, `dkim`, `spf` ou `_acme-challenge`. Tu n'ajoutes que les MX, le reste
> doit rester intact (Resend continue d'envoyer les emails sortants comme avant).

---

## Étape 3 — Ajouter un enregistrement SPF (recommandé)

Pour que les emails forwardés par ImprovMX ne tombent pas en spam, ajoute (ou
mets à jour) l'enregistrement TXT SPF :

| Type | Name | Value                                                                                  | TTL  |
| ---- | ---- | -------------------------------------------------------------------------------------- | ---- |
| TXT  | `@`  | `v=spf1 include:spf.improvmx.com include:amazonses.com ~all`                           | 3600 |

> Si tu as déjà un enregistrement SPF (probable, à cause de Resend), **ne crée
> pas un deuxième TXT SPF** — édite l'existant et ajoute `include:spf.improvmx.com`
> au milieu (avant `~all`). Avoir deux SPF distincts casse l'authentification.

---

## Étape 4 — Configurer les alias dans ImprovMX

Une fois les MX propagés (peut prendre 5–60 min, ImprovMX te le confirme dans
le dashboard) :

1. Retourne sur https://app.improvmx.com/
2. Sur la ligne `dcatracker.fr`, clique sur **Add an alias**
3. Ajoute par exemple :

   | Alias       | Forward to              |
   | ----------- | ----------------------- |
   | `hello`     | `mael.faleyras@gmail.com` |
   | `contact`   | `mael.faleyras@gmail.com` |
   | `support`   | `mael.faleyras@gmail.com` |
   | `*`         | `mael.faleyras@gmail.com` |

   Le `*` (catch-all) capture tout email envoyé à n'importe quelle adresse
   `@dcatracker.fr`.

4. Vérifie en t'envoyant un mail test à `hello@dcatracker.fr` depuis une autre
   boîte → tu dois le recevoir dans Gmail dans la minute.

---

## Étape 5 (optionnel) — Répondre depuis Gmail EN TANT QUE `hello@dcatracker.fr`

Par défaut, si tu réponds depuis Gmail, l'expéditeur visible sera ton adresse
perso. Pour répondre comme `hello@dcatracker.fr` :

### Option A — SMTP Resend (gratuit, recommandé)

1. Dans Resend → **API Keys** → crée une clé "Gmail SMTP" (scope: send)
2. Dans Gmail → **Paramètres** → **Comptes et importation** → **Envoyer des
   emails en tant que** → **Ajouter une autre adresse email**
3. Renseigne :
   - Nom : `DCA Tracker`
   - Adresse : `hello@dcatracker.fr`
   - Décoche "Le traiter comme un alias"
4. Étape suivante (SMTP) :
   - Serveur SMTP : `smtp.resend.com`
   - Port : `465`
   - Nom d'utilisateur : `resend`
   - Mot de passe : la clé API Resend que tu viens de créer
   - Type : **TLS / SSL**
5. Gmail t'envoie un code de confirmation à `hello@dcatracker.fr` → tu le
   reçois sur ta boîte perso (grâce à ImprovMX) → tu colles le code dans Gmail.

À partir de là, tu peux choisir l'expéditeur quand tu rédiges un mail dans
Gmail.

### Option B — SMTP ImprovMX (payant à 9 $/mois)

ImprovMX propose aussi du SMTP sortant, mais c'est payant. L'option A via
Resend est gratuite et utilise déjà l'infrastructure email existante du site.

---

## Test final

Envoie un mail à `hello@dcatracker.fr` depuis une autre adresse (Gmail
personnelle, par exemple). Tu dois :

- ✅ Le recevoir dans `mael.faleyras@gmail.com` en moins d'une minute
- ✅ Pouvoir y répondre depuis Gmail avec `hello@dcatracker.fr` comme expéditeur
- ✅ Le destinataire reçoit ta réponse comme venant de `hello@dcatracker.fr`

Si l'un des points ne fonctionne pas → vérifier dans l'ordre : DNS MX
(propagation), alias ImprovMX, SPF (cause typique des spams).
