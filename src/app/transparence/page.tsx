// Page /transparence — obligation d'information sur les liens affiliés
// (art. L.111-7 Code de la consommation + LCEN), et surtout argument de vente.
//
// ⚠️ Tout ce qui concerne les partenariats est LU DEPUIS BROKER_CONFIG. Ne pas
// écrire ici la liste des partenaires ni leurs rémunérations en dur : la page
// deviendrait fausse au premier changement de config, ce qui est exactement le
// risque qu'elle est censée couvrir.

import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import {
  BROKER_CONFIG,
  isBrokerCTAActive,
  type BrokerPartner,
} from "@/lib/broker-config";

const TITLE = "Transparence : comment DCA Tracker gagne de l'argent";
const DESCRIPTION =
  "D'où vient l'argent de DCA Tracker, ce que change un lien affilié, ce que ça ne change pas, et ce que je refuse de vendre. Liste des partenariats et rémunérations.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/transparence" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/transparence",
    type: "article",
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

export default function TransparencePage() {
  const active = isBrokerCTAActive();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8"
      >
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Accueil
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">
          Transparence
        </span>
      </nav>

      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "https://dcatracker.fr" },
          { name: "Transparence", url: "https://dcatracker.fr/transparence" },
        ]}
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Comment ce site gagne de l&apos;argent
      </h1>
      <p className="text-lg text-gray-600 leading-relaxed mb-10">
        Un comparateur qui ne dit pas comment il est payé n&apos;est pas un
        comparateur, c&apos;est une publicité. Cette page dit d&apos;où vient
        chaque euro, ce que ça change pour vous, et ce que je refuse de vendre.
      </p>

      <Section title="D'où vient l'argent">
        <p>
          Deux sources aujourd&apos;hui, une troisième en préparation.
        </p>
        <ol className="space-y-3 list-decimal pl-5">
          <li>
            <strong>L&apos;abonnement Premium.</strong> C&apos;est la source
            principale, et de loin celle que je préfère : quand vous me payez
            directement, mes intérêts et les vôtres pointent dans la même
            direction. Le détail est sur la{" "}
            <Link href="/tarifs" className="text-primary-600 hover:underline">
              page tarifs
            </Link>
            .
          </li>
          <li>
            <strong>Les produits en achat unique</strong> (cockpit de suivi,
            guides). Vous payez une fois, vous gardez le fichier.
          </li>
          <li>
            <strong>Les liens affiliés vers des courtiers.</strong>{" "}
            {active ? (
              <>Activés — le détail est juste en dessous.</>
            ) : (
              <>
                <span className="font-semibold text-gray-900">
                  Aucun n&apos;est actif à ce jour.
                </span>{" "}
                Aucun courtier ne me verse quoi que ce soit au moment où vous
                lisez cette ligne. C&apos;est amené à changer, et cette page
                sera mise à jour le jour même — cf. le{" "}
                <Link
                  href="/changelog"
                  className="text-primary-600 hover:underline"
                >
                  journal des changements
                </Link>
                .
              </>
            )}
          </li>
        </ol>
        <p>
          Ce que je ne fais pas : pas de publicité display, pas de vente de
          données, pas de contenu sponsorisé déguisé en article, pas de
          newsletter louée à un tiers.
        </p>
      </Section>

      <Section title={active ? "Mes partenariats" : "L'affiliation, quand elle arrivera"}>
        {active ? (
          <>
            <p>
              Voici la liste complète, avec ce que chaque programme me verse.
              Quand un barème n&apos;est pas public, je l&apos;écris — je
              préfère ça à un ordre de grandeur inventé.
            </p>
            <PartnerTable partners={BROKER_CONFIG.partners} />
          </>
        ) : (
          <>
            <p>
              Un lien affilié, c&apos;est un lien qui identifie que vous venez
              de chez moi. Si vous ouvrez un compte, le courtier me verse une
              commission. <strong>Vous, vous payez exactement le même prix</strong>{" "}
              — la commission sort du budget marketing du courtier, pas de votre
              poche.
            </p>
            <p>
              Je l&apos;écris au futur parce que ce n&apos;est pas encore en
              place. Dès que ça le sera, cette page listera chaque partenaire et
              chaque rémunération, et la mention « lien affilié » apparaîtra{" "}
              <em>au-dessus</em> du lien concerné, pas en petit en bas de page.
            </p>
          </>
        )}
      </Section>

      <Section title="Ce que ça ne change pas">
        <p>
          C&apos;est la partie qui compte, parce que c&apos;est celle sur
          laquelle vous n&apos;avez que ma parole — et le code source pour la
          vérifier.
        </p>
        <ul className="space-y-3">
          {[
            [
              "Le classement n'est pas à vendre.",
              "L'ordre des courtiers dans le comparatif dépend de leur pertinence pour un DCA en ETF. Un courtier qui ne me verse rien peut arriver premier, et un partenaire peut arriver dernier.",
            ],
            [
              "Les courtiers non partenaires restent présentés.",
              "Les retirer du comparatif serait le moyen le plus simple de le truquer sans mentir. Ils restent, avec les mêmes critères et le même niveau de détail.",
            ],
            [
              "Les chiffres ne bougent pas.",
              "Frais, TER, conditions tarifaires : ce sont des faits vérifiables, datés, et repris des sites officiels. Un partenariat ne rend pas un courtier moins cher.",
            ],
            [
              "Vous gardez toujours un lien direct.",
              "Sur chaque fiche courtier, le lien « Site officiel » reste non affilié. Si vous préférez ne pas passer par moi, c'est à un clic.",
            ],
          ].map(([strong, rest]) => (
            <li key={strong} className="flex gap-3">
              <span className="shrink-0 text-primary-600 font-bold" aria-hidden>
                ✓
              </span>
              <span>
                <strong className="text-gray-900">{strong}</strong> {rest}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Ce que je refuse">
        <p>
          Il y a de l&apos;argent que je pourrais prendre et que je ne prendrai
          pas. Deux fois pour des raisons légales, deux fois par choix.
        </p>
        <ul className="space-y-3">
          {[
            [
              "Pas d'affiliation assurance-vie.",
              "C'est pourtant le créneau le plus lucratif de la finance en ligne. Mais distribuer de l'assurance-vie relève de la directive distribution d'assurance et imposerait une immatriculation ORIAS. Je ne suis pas immatriculé, donc je n'y touche pas.",
            ],
            [
              "Pas de CFD, pas de forex, pas d'options binaires.",
              "Ces produits font perdre de l'argent à la grande majorité des particuliers, et leur promotion est pénalement encadrée. Ce qui exclut de fait certains courtiers très généreux en commissions.",
            ],
            [
              "Pas de conseil personnalisé.",
              "Je ne suis ni CGP ni CIF. Je peux vous montrer des chiffres, des formules et des comparaisons ; je ne peux pas vous dire quoi acheter, et je ne le ferai pas.",
            ],
            [
              "Pas de recommandation que je ne suivrais pas moi-même.",
              "Le filtre est simple : si je ne mettrais pas mon propre argent chez ce courtier, il n'est pas dans le comparatif, quelle que soit la commission.",
            ],
          ].map(([strong, rest]) => (
            <li key={strong} className="flex gap-3">
              <span className="shrink-0 text-loss-dark font-bold" aria-hidden>
                ✗
              </span>
              <span>
                <strong className="text-gray-900">{strong}</strong> {rest}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Ce que vous pouvez vérifier vous-même">
        <p>
          Les promesses de transparence ne valent que si elles sont
          contrôlables. Trois moyens :
        </p>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="shrink-0 text-gray-400 font-bold" aria-hidden>
              →
            </span>
            <span>
              <strong className="text-gray-900">Le code est public.</strong> La
              configuration des partenariats est un fichier lisible du dépôt, et
              son historique montre exactement quand chaque partenaire a été
              ajouté.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 text-gray-400 font-bold" aria-hidden>
              →
            </span>
            <span>
              <strong className="text-gray-900">
                Les changements sont datés.
              </strong>{" "}
              Y compris les changements d&apos;engagement, y compris ceux qui ne
              m&apos;arrangent pas —{" "}
              <Link
                href="/changelog"
                className="text-primary-600 hover:underline"
              >
                journal des changements
              </Link>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 text-gray-400 font-bold" aria-hidden>
              →
            </span>
            <span>
              <strong className="text-gray-900">
                Les calculs sont documentés.
              </strong>{" "}
              Formules, hypothèses et sources sont sur la page{" "}
              <Link
                href="/methodologie"
                className="text-primary-600 hover:underline"
              >
                méthodologie
              </Link>
              .
            </span>
          </li>
        </ul>
      </Section>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600 leading-relaxed">
        <p>
          Une question sur un partenariat, un doute sur une recommandation, un
          chiffre qui vous paraît faux ? Écrivez-moi à{" "}
          <a
            href="mailto:contact@dcatracker.fr"
            className="text-primary-600 hover:underline font-medium"
          >
            contact@dcatracker.fr
          </a>
          . Les corrections factuelles sont appliquées et créditées.
        </p>
      </div>

      <p className="mt-8 text-[11px] text-gray-500 leading-relaxed">
        DCA Tracker est un outil d&apos;information et de simulation. Il ne
        constitue pas un conseil en investissement personnalisé au sens de
        l&apos;article L.321-1 du Code monétaire et financier. Investir comporte
        un risque de perte en capital. Les performances passées ne préjugent pas
        des performances futures.
      </p>
    </div>
  );
}

// ─── Tableau des partenaires ──────────────────────────────────────────────────

function PartnerTable({ partners }: { partners: BrokerPartner[] }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <table className="w-full text-sm border-collapse min-w-[520px]">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="py-2 pr-4 font-semibold text-gray-900">Courtier</th>
            <th className="py-2 pr-4 font-semibold text-gray-900">
              Plateforme
            </th>
            <th className="py-2 font-semibold text-gray-900">
              Ce que je perçois
            </th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 align-top">
              <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
              <td className="py-3 pr-4 text-gray-600">{p.network ?? "—"}</td>
              <td className="py-3 text-gray-600">
                {p.commission ? (
                  <>
                    {p.commission}
                    {p.commissionVerifiedOn && (
                      <span className="block text-xs text-gray-400 mt-0.5">
                        vérifié en {formatMonth(p.commissionVerifiedOn)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">
                    Barème non public
                    <span className="block text-xs text-gray-400 mt-0.5">
                      le programme interdit d&apos;en publier le détail
                    </span>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "2026-07" → "juillet 2026". Format figé, aucune dépendance à la locale du serveur. */
function formatMonth(yyyyMm: string): string {
  const MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const [year, month] = yyyyMm.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : yyyyMm;
}
