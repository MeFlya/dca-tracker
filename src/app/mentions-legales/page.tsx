import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle } from "@/components/ui/LegalArticle";

const TITLE = "Mentions légales — DCA Tracker";
const DESCRIPTION =
  "Mentions légales de DCA Tracker : éditeur, hébergement, propriété intellectuelle, contact.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: false },
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav aria-label="Fil d'ariane" className="mb-6 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-900 underline-offset-2 hover:underline">Accueil</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-700">Mentions légales</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions légales</h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 29 avril 2026</p>

      <LegalArticle>

      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          Le site <strong>dcatracker.fr</strong> (ci-après « le Site ») est édité par :
        </p>
        <ul>
          <li>
            <strong>Éditeur :</strong> Maël Faleyras
          </li>
          <li>
            <strong>Nom commercial :</strong> DCA Tracker
          </li>
          <li>
            <strong>Statut juridique :</strong> Entrepreneur individuel sous
            le régime de la micro-entreprise
          </li>
          <li>
            <strong>SIREN :</strong> 105&nbsp;002&nbsp;703
          </li>
          <li>
            <strong>SIRET (établissement principal) :</strong> 10500270300012
          </li>
          <li>
            <strong>Code APE :</strong> 5829C (Édition de logiciels applicatifs)
          </li>
          <li>
            <strong>TVA :</strong> non applicable, article 293 B du Code
            général des impôts (franchise en base de TVA)
          </li>
          <li>
            <strong>Adresse du siège :</strong> 266 rue Nationale,
            59800 Lille
          </li>
          <li>
            <strong>Email de contact :</strong>{" "}
            <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a>
          </li>
          <li>
            <strong>Directeur de la publication :</strong> Maël Faleyras
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Hébergement</h2>
        <p>Le Site est hébergé par :</p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong>
          </li>
          <li>440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis</li>
          <li>
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              vercel.com
            </a>
          </li>
        </ul>
        <p>
          Les données personnelles des utilisateurs sont stockées par les
          sous-traitants de DCA Tracker (Clerk, Stripe, Resend) — voir la{" "}
          <Link href="/confidentialite">Politique de confidentialité</Link>.
        </p>
      </section>

      <section>
        <h2>3. Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble du Site (textes, graphismes, logo, icônes, code source,
          mise en page) est la propriété exclusive de l&apos;éditeur et est
          protégé par les lois françaises et internationales relatives à la
          propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, ou
          exploitation totale ou partielle des contenus du Site, par quelque
          procédé que ce soit, sans autorisation écrite préalable, est interdite
          et constitue une contrefaçon (articles L. 335-2 et suivants du Code de
          la propriété intellectuelle).
        </p>
      </section>

      <section>
        <h2>4. Données personnelles</h2>
        <p>
          Le traitement de vos données personnelles est encadré par le Règlement
          Général sur la Protection des Données (RGPD) et la loi française
          Informatique et Libertés. Pour le détail des finalités, bases légales,
          durées de conservation et modalités d&apos;exercice de vos droits,
          consultez la{" "}
          <Link href="/confidentialite">Politique de confidentialité</Link>.
        </p>
        <p>
          <strong>Délégué à la protection des données (DPO) :</strong> non
          désigné — DCA Tracker n&apos;y est pas tenu compte tenu de la nature
          et du volume des traitements. Pour toute question relative à vos
          données, contactez :{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a>.
        </p>
      </section>

      <section>
        <h2>5. Cookies et traceurs</h2>
        <p>
          Le Site utilise <strong>Plausible Analytics</strong> pour mesurer son
          audience. Plausible est une solution de mesure d&apos;audience{" "}
          <strong>respectueuse de la vie privée</strong> qui ne dépose
          <strong> aucun cookie</strong>, ne collecte aucune donnée personnelle
          identifiante et est conforme au RGPD sans nécessité de consentement
          préalable (avis CNIL).
        </p>
        <p>
          Aucun autre cookie de traçage publicitaire ou de profilage n&apos;est
          utilisé.
        </p>
      </section>

      <section>
        <h2>6. Liens externes</h2>
        <p>
          Le Site peut contenir des liens vers des sites tiers (courtiers,
          ressources éducatives). DCA Tracker n&apos;exerce aucun contrôle sur
          le contenu de ces sites et décline toute responsabilité quant à leur
          fonctionnement, leur contenu ou les conséquences de leur consultation.
        </p>
        <p>
          Lorsqu&apos;un lien est <strong>affilié</strong> (DCA Tracker peut
          percevoir une commission si vous ouvrez un compte via ce lien),
          la mention « lien affilié » est systématiquement affichée à proximité
          immédiate du lien, conformément à l&apos;article L.111-7 du Code de la
          consommation.
        </p>
      </section>

      <section>
        <h2>7. Avertissement — pas de conseil en investissement</h2>
        <p>
          DCA Tracker est un <strong>outil pédagogique et informatif</strong>.
          Il ne constitue pas un conseil en investissement financier
          personnalisé au sens de l&apos;article L.541-1 du Code monétaire et
          financier.
        </p>
        <p>
          Les simulations sont hypothétiques et ne garantissent pas les
          performances futures. Les données de marché peuvent être différées.
          Investir comporte un risque de perte en capital. Avant toute décision
          d&apos;investissement, consultez un conseiller financier agréé (CGP,
          CIF) ou votre établissement bancaire.
        </p>
      </section>

      <section>
        <h2>8. Loi applicable et juridiction compétente</h2>
        <p>
          Les présentes mentions légales sont régies par le droit français. En
          cas de litige et à défaut d&apos;accord amiable, les tribunaux
          français compétents seront seuls saisis.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Pour toute question relative au Site, vous pouvez écrire à :{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a>.
        </p>
      </section>
      </LegalArticle>
    </div>
  );
}
