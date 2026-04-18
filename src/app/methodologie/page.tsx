import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE = "Méthodologie — Formules et hypothèses du simulateur DCA";
const DESCRIPTION =
  "Transparence totale sur les calculs du simulateur DCA : formule de capitalisation mensuelle, déduction des frais (TER), correction de l'inflation et construction des 3 scénarios. Aucune boîte noire.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/methodologie" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/methodologie",
    type: "article",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Méthodologie DCA Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Formules et hypothèses du simulateur DCA expliquées : capitalisation mensuelle, frais, inflation, 3 scénarios. Aucune boîte noire.",
  },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

function Formula({ label, formula }: { label: string; formula: string }) {
  return (
    <div className="my-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
        {label}
      </p>
      <code className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
        {formula}
      </code>
    </div>
  );
}

export default function MethodologiePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <a href="/" className="hover:text-gray-600 transition-colors">Accueil</a>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Méthodologie</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Méthodologie & sources
      </h1>
      <p className="text-lg text-gray-500 mb-12">
        Transparence totale sur les formules, les hypothèses et les sources de
        données utilisées. Pas de boîte noire.
      </p>

      <Section title="Comment fonctionne le simulateur DCA ?">
        <p>
          Le simulateur calcule la valeur future d&apos;un portefeuille alimenté
          par des versements mensuels réguliers (Dollar Cost Averaging), en
          appliquant la capitalisation mensuelle des intérêts composés.
        </p>
        <p>
          Chaque mois, le versement mensuel est ajouté au portefeuille en début
          de période, puis l&apos;ensemble capitalise au taux mensuel net.
        </p>

        <Formula
          label="Taux mensuel net"
          formula={`r_mensuel = (1 + rendement_net_annuel / 100) ^ (1 / 12) - 1

où rendement_net_annuel = rendement_brut_annuel - frais_annuels (TER)`}
        />

        <Formula
          label="Boucle de calcul (n = durée en mois)"
          formula={`Pour chaque mois m de 1 à n :
  valeur[m] = (valeur[m-1] + versement_mensuel) × (1 + r_mensuel)`}
        />

        <p>
          Cette approche est mathématiquement équivalente à la formule de valeur
          future d&apos;une rente (annuity), mais la boucle explicite permet
          d&apos;exporter des données point par point pour le graphique.
        </p>
      </Section>

      <Section title="Hypothèses importantes">
        <ul className="space-y-3 list-none">
          {[
            "Le rendement annuel est constant sur toute la durée du placement. En réalité, les marchés sont volatils : certaines années peuvent afficher des pertes importantes.",
            "Les frais (TER) sont déduits du rendement annuel brut avant conversion en taux mensuel. Les frais de courtage ou d'entrée ne sont pas modélisés.",
            "Le versement mensuel est supposé constant et effectué en début de mois.",
            "Aucun événement de marché (krachs, crises) n'est modélisé. La simulation ne capture pas la volatilité réelle.",
            "La valeur réelle (corrigée de l'inflation) est calculée en divisant la valeur finale par (1 + inflation)^années, ce qui suppose une inflation annuelle constante.",
          ].map((h, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold mt-0.5">
                !
              </span>
              <span className="text-sm">{h}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Scénarios conservateur, base, optimiste">
        <p>
          Pour illustrer l&apos;incertitude des projections, le simulateur
          calcule trois scénarios en faisant varier le rendement annuel brut
          autour de la valeur saisie par l&apos;utilisateur :
        </p>
        <Formula
          label="Scénarios"
          formula={`Conservateur : rendement_brut - 2 %
Base        : rendement_brut (votre saisie)
Optimiste   : rendement_brut + 2 %`}
        />
        <p>
          Cette fourchette de ±2 points est une convention pédagogique simple.
          Elle ne représente pas la distribution statistique réelle des
          rendements, qui peut être bien plus large sur les marchés actions.
        </p>
      </Section>

      <Section title="Données de marché">
        <p>
          Les données de marché (cours des ETF) sont récupérées via une API
          externe configurée côté serveur. Selon le plan utilisé :
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Mode démo (sans clé API) :</strong> des valeurs illustratives
            sont affichées. Elles ne correspondent pas à des cours réels.
          </li>
          <li>
            <strong>Alpha Vantage (plan gratuit) :</strong> données de fin de
            journée (end-of-day), différées. Non adaptées au trading actif.
          </li>
          <li>
            <strong>Fournisseurs premium :</strong> d&apos;autres providers
            peuvent être branchés (Financial Modeling Prep, Twelve Data, etc.)
            en changeant la variable d&apos;environnement{" "}
            <code className="font-mono text-xs bg-gray-100 px-1 rounded">
              MARKET_DATA_PROVIDER
            </code>
            .
          </li>
        </ul>
        <p>
          Le source et l&apos;horodatage de chaque donnée sont toujours affichés
          sur le site. Nous ne fabriquons jamais de prix.
        </p>
      </Section>

      <Section title="Ce que ce site n'est pas">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <ul className="space-y-2 text-sm text-amber-800">
            <li>❌ Pas un conseiller en investissement financier (CIF)</li>
            <li>❌ Pas un broker ou plateforme d&apos;exécution d&apos;ordres</li>
            <li>❌ Pas une garantie de rendement</li>
            <li>❌ Pas un service réglementé par l&apos;AMF</li>
          </ul>
        </div>
        <p className="text-sm mt-4">
          DCA Tracker est un outil éducatif. Pour toute décision
          d&apos;investissement, consultez un conseiller en gestion de patrimoine
          (CGP) ou un conseiller en investissements financiers (CIF) agréé par
          l&apos;AMF.
        </p>
      </Section>

      <Section title="Performances passées">
        <p className="font-medium text-gray-800">
          Les performances passées ne préjugent pas des performances futures.
        </p>
        <p className="text-sm">
          Les rendements historiques utilisés comme référence (ex. ~7 %/an pour
          le MSCI World sur 30 ans, dividendes réinvestis, en USD) sont
          documentés mais ne garantissent en rien que ces rendements se
          reproduiront à l&apos;avenir. Les marchés peuvent sous-performer
          pendant des décennies.
        </p>
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Méthodologie — Formules et hypothèses du simulateur DCA",
          description: DESCRIPTION,
          url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr"}/methodologie`,
          inLanguage: "fr-FR",
          publisher: {
            "@type": "Organization",
            name: "DCA Tracker",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr",
          },
          about: {
            "@type": "Thing",
            name: "Dollar Cost Averaging",
            description: "Stratégie d'investissement progressif par versements réguliers",
          },
        }}
      />
    </div>
  );
}
