# private-assets — fichiers produits (paiement unique)

Fichiers livrés aux acheteurs via /api/products/download (token signé).
HORS de /public : jamais servis statiquement.

⚠️ **Le repo GitHub est PUBLIC** → les fichiers payants ne sont JAMAIS
commités en clair. Seuls les `.enc` (AES-256-GCM) sont commités ; la clé
est dérivée de `DOWNLOAD_TOKEN_SECRET` (env — même valeur en local et sur
Vercel, sinon la prod ne peut pas déchiffrer).

## Workflow (à chaque nouveau fichier ou mise à jour)

1. Déposer l'original dans `private-assets/raw/` (gitignoré) avec le nom EXACT :
   - `raw/template-suivi-dca.xlsx` → Cockpit DCA (Excel)
   - `raw/guide-demarrer-dca.pdf`  → Guide « Démarrer le DCA en France »
2. `npm run assets:encrypt` → génère les `.enc` ici (self-check intégré)
3. Committer les `.enc`

L'acheteur reçoit le fichier sous son nom public (« Cockpit-DCA-PEA_dcatracker.xlsx »,
cf. PRODUCT_FILES dans la route download) — le déchiffrement est invisible pour lui.

⚠️ **Rotation de DOWNLOAD_TOKEN_SECRET** : le même secret signe les liens ET
chiffre les fichiers. Si vous le changez (ex. lien fuité), faire dans le même
mouvement : nouvelle valeur sur Vercel → `npm run assets:encrypt` → committer
les .enc → redéployer. Sinon : 503 pour tous les acheteurs.

⚠️ Si un fichier dépasse ~20 Mo, basculer vers Vercel Blob (limite de
taille du bundle serverless) — me demander.
