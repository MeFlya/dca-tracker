export interface FAQItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "Qu'est-ce que le DCA (Dollar Cost Averaging) ?",
    a: "Le DCA (investissement progressif) consiste à investir une somme fixe à intervalles réguliers (par exemple 200 € par mois) indépendamment des conditions de marché. Cette approche réduit l'impact de la volatilité : vous achetez plus de parts quand le marché baisse, moins quand il monte. Sur le long terme, cela lisse votre prix d'achat moyen et discipline votre épargne.",
  },
  {
    q: "Comment fonctionne le simulateur ETF ?",
    a: "Le simulateur utilise la formule de capitalisation mensuelle des intérêts composés. Vous entrez un versement mensuel, une durée, un rendement annuel attendu et des frais. Le calcul applique le rendement net (rendement brut moins frais) sur chaque mois en tenant compte de vos nouvelles contributions. Les hypothèses sont expliquées en détail sur la page Méthodologie.",
  },
  {
    q: "Ce site propose-t-il des conseils financiers ?",
    a: "Non. DCA Tracker est un outil éducatif et informatif. Les simulations sont hypothétiques et ne constituent pas une recommandation d'investissement personnalisée. Les performances passées ne préjugent pas des performances futures. Pour tout projet d'investissement, consultez un conseiller en gestion de patrimoine (CGP) ou un conseiller en investissements financiers (CIF) agréé AMF.",
  },
  {
    q: "Les données de marché sont-elles en temps réel ?",
    a: "Non, les données de marché affichées sont différées (généralement fin de journée sur le plan gratuit). Chaque donnée indique clairement sa source et son horodatage. En mode démo (sans clé API configurée), les valeurs affichées sont illustratives et ne correspondent pas aux prix réels du marché.",
  },
  {
    q: "Qu'est-ce qu'un ETF et pourquoi choisir cette approche ?",
    a: "Un ETF (Exchange Traded Fund) est un fonds coté en bourse qui réplique un indice de marché (comme le MSCI World ou le S&P 500). Les ETF offrent une diversification instantanée sur des centaines ou milliers d'entreprises, avec des frais souvent très bas (0,1 % à 0,4 % par an). Combinés à une stratégie DCA, ils constituent une approche simple et documentée pour l'investissement à long terme.",
  },
  {
    q: "Mes données sont-elles collectées ?",
    a: "Non. DCA Tracker ne collecte aucune donnée personnelle. Les simulations se font entièrement dans votre navigateur. Aucun compte, aucune inscription, aucun stockage de vos paramètres sur nos serveurs.",
  },
];
