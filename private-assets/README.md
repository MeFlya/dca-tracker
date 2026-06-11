# private-assets — fichiers produits (paiement unique)

Fichiers livrés aux acheteurs via /api/products/download (token signé).
HORS de /public : jamais servis statiquement.

Déposer ici (noms EXACTS, cf. PRODUCT_FILES dans la route download) :
- guide-demarrer-dca.pdf      → Guide « Démarrer le DCA en France »
- template-suivi-dca.xlsx     → Template de suivi DCA & PEA

⚠️ Si un fichier dépasse ~20 Mo, basculer vers Vercel Blob (limite de
taille du bundle serverless) — me demander.
