import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle } from "@/components/ui/LegalArticle";

const TITLE = "Conditions Générales de Vente — DCA Tracker";
const DESCRIPTION =
  "CGV de DCA Tracker : abonnement Premium, essai gratuit 7 jours, produits numériques en paiement unique, droit de rétractation, résiliation, prix, TVA.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cgv" },
  robots: { index: true, follow: false },
};

export default function CGVPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav aria-label="Fil d'ariane" className="mb-6 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-900 underline-offset-2 hover:underline">Accueil</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-700">Conditions Générales de Vente</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Conditions Générales de Vente (CGV)
      </h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 11 juin 2026</p>

      <LegalArticle>

      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales de Vente (« CGV ») régissent les
          modalités de souscription et d&apos;utilisation des abonnements
          payants au service <strong>DCA Tracker</strong>, ainsi que
          l&apos;achat des <strong>produits numériques en paiement unique</strong>{" "}
          (article 6), accessibles sur le site dcatracker.fr (ci-après « le
          Service »), édité par{" "}
          <strong>Maël Faleyras</strong>, entrepreneur individuel sous le
          régime de la micro-entreprise (SIREN 105&nbsp;002&nbsp;703) — voir
          les <Link href="/mentions-legales">mentions légales</Link>.
        </p>
        <p>
          Toute souscription à un abonnement Premium emporte acceptation pleine
          et entière des présentes CGV.
        </p>
      </section>

      <section>
        <h2>2. Description du Service</h2>
        <p>DCA Tracker propose deux niveaux d&apos;accès :</p>
        <ul>
          <li>
            <strong>Plan Gratuit :</strong> simulateur DCA, comparateur
            d&apos;ETF, calculateur fiscal PEA vs CTO, guides éducatifs.
            Accessible sans création de compte ni paiement.
          </li>
          <li>
            <strong>Plan Premium :</strong> en supplément du plan gratuit —
            sauvegarde et suivi mensuel de stratégie, récap fiscal annuel
            (cases 2042 et 2074 calculées), analyse Monte Carlo (1 000
            scénarios), comparaison A vs B, export PDF sans filigrane,
            simulations sauvegardées (10 emplacements), support par email.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Tarifs et modalités de facturation</h2>
        <p>
          Le Plan Premium est proposé selon deux formules d&apos;abonnement :
        </p>
        <ul>
          <li>
            <strong>Mensuel :</strong> 4,90 € par mois, facturé tous les
            mois.
          </li>
          <li>
            <strong>Annuel :</strong> 49 € par an, facturé annuellement
            (soit l&apos;équivalent de 4,08 €/mois — économie de 17 %).
          </li>
        </ul>
        <p>
          Tous les prix sont indiqués <strong>en euros</strong>. La{" "}
          <strong>TVA n&apos;est pas applicable</strong> au titre de
          l&apos;article 293 B du Code général des impôts (franchise en base
          de TVA applicable à l&apos;éditeur, micro-entrepreneur) : les prix
          affichés sont les prix nets définitifs, aucune taxe n&apos;est
          ajoutée ni récupérable. Les prix peuvent évoluer ; toute
          modification sera notifiée par email au moins 30 jours avant entrée
          en vigueur. Les abonnements en cours conservent leur tarif
          jusqu&apos;à leur prochain renouvellement.
        </p>
        <p>
          Le paiement s&apos;effectue par carte bancaire via le prestataire de
          paiement <strong>Stripe</strong>. DCA Tracker ne stocke aucune donnée
          bancaire. Stripe est conforme à la norme PCI-DSS.
        </p>
      </section>

      <section>
        <h2>4. Essai gratuit de 7 jours</h2>
        <p>
          Tout nouvel abonné bénéficie d&apos;un <strong>essai gratuit de 7
          jours</strong> à compter de la souscription. Pendant cette période :
        </p>
        <ul>
          <li>L&apos;ensemble des fonctionnalités Premium est accessible.</li>
          <li>
            Aucun montant n&apos;est prélevé sur votre moyen de paiement durant
            les 7 premiers jours.
          </li>
          <li>
            Un moyen de paiement est requis lors de l&apos;activation de
            l&apos;essai pour permettre la transition automatique vers
            l&apos;abonnement payant à l&apos;issue de la période.
          </li>
          <li>
            Vous pouvez <strong>annuler à tout moment</strong> avant la fin du
            7e jour depuis votre espace compte ou via le portail de facturation
            Stripe ; aucun montant ne sera alors prélevé.
          </li>
          <li>
            Un email de rappel est envoyé environ 2 jours avant la fin de
            l&apos;essai, indiquant la date et le montant du prochain
            prélèvement.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Droit de rétractation</h2>
        <p>
          Conformément à l&apos;article L.221-18 du Code de la consommation,
          vous disposez d&apos;un <strong>droit de rétractation de 14 jours</strong>{" "}
          à compter de la conclusion du contrat (souscription de l&apos;abonnement).
        </p>
        <p>
          <strong>Renonciation au droit de rétractation :</strong> en
          souscrivant à l&apos;abonnement et en accédant immédiatement aux
          fonctionnalités Premium dès la fin de l&apos;essai gratuit, vous
          demandez expressément l&apos;exécution immédiate du Service et
          renoncez à votre droit de rétractation pour la part du Service déjà
          exécutée (article L.221-28 13° du Code de la consommation).
        </p>
        <p>
          Pour exercer votre droit de rétractation dans les conditions ci-dessus,
          envoyez un email à{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a> en
          précisant votre nom, l&apos;email associé à votre compte et votre
          intention de vous rétracter.
        </p>
      </section>

      <section>
        <h2>6. Produits numériques en paiement unique</h2>
        <p>
          En complément des abonnements, DCA Tracker propose des{" "}
          <strong>produits numériques vendus en paiement unique</strong>{" "}
          (fichiers de suivi, guides — voir la page{" "}
          <Link href="/produits">/produits</Link>) : prix TTC affiché sur
          chaque fiche produit (TVA non applicable, article 293 B du CGI),
          paiement par carte via Stripe, sans création de compte obligatoire.
          La livraison est immédiate, par email, sous forme de liens de
          téléchargement valables 7 jours (régénérés sur simple demande à{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a>). La
          facture est envoyée automatiquement par email. Les mises à jour des
          fichiers sont incluses.
        </p>
        <p>
          <strong>Droit de rétractation :</strong> conformément à
          l&apos;article L.221-28 13° du Code de la consommation, en procédant
          au paiement vous demandez expressément l&apos;exécution immédiate du
          contrat (fourniture du contenu numérique) et reconnaissez perdre
          votre droit légal de rétractation une fois la livraison effectuée.
          Cette information est rappelée sur la page de paiement.
        </p>
        <p>
          <strong>Garantie commerciale « satisfait ou remboursé » :</strong>{" "}
          indépendamment de ce qui précède, chaque produit en paiement unique
          bénéficie d&apos;une garantie de <strong>14 jours</strong> à compter
          de l&apos;achat : un email à{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a> suffit
          pour obtenir un remboursement intégral, sans justification à
          fournir. Cette garantie commerciale s&apos;ajoute aux droits légaux
          et leur est plus favorable.
        </p>
        <p>
          Les produits sont destinés à un usage personnel. Leur revente,
          partage public ou redistribution est interdit.
        </p>
      </section>

      <section>
        <h2>7. Résiliation</h2>
        <p>
          Vous pouvez résilier votre abonnement à tout moment :
        </p>
        <ul>
          <li>
            Depuis votre espace <Link href="/account">compte</Link> en cliquant
            sur « Gérer mon abonnement » (portail Stripe).
          </li>
          <li>
            Par email à{" "}
            <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a>.
          </li>
        </ul>
        <p>
          <strong>Effet de la résiliation :</strong>
        </p>
        <ul>
          <li>
            <strong>Abonnement mensuel :</strong> l&apos;accès Premium reste
            actif jusqu&apos;à la fin de la période payée en cours. Aucun
            remboursement prorata n&apos;est effectué.
          </li>
          <li>
            <strong>Abonnement annuel :</strong> l&apos;accès Premium reste
            actif jusqu&apos;à la fin de la période annuelle en cours. Aucun
            remboursement prorata n&apos;est effectué (sauf en cas
            d&apos;exercice du droit de rétractation dans les 14 jours, voir
            article 5).
          </li>
        </ul>
        <p>
          Vos données (stratégie, historique de versements, simulations
          sauvegardées) sont conservées même après résiliation. Vous pouvez
          réactiver votre abonnement à tout moment et retrouver votre
          historique intact.
        </p>
      </section>

      <section>
        <h2>8. Suspension et résiliation par DCA Tracker</h2>
        <p>
          DCA Tracker se réserve le droit de suspendre ou résilier un compte
          en cas de :
        </p>
        <ul>
          <li>défaut de paiement persistant après relance,</li>
          <li>fraude, usurpation d&apos;identité ou usage abusif du Service,</li>
          <li>
            non-respect des présentes CGV ou de la loi applicable.
          </li>
        </ul>
        <p>
          En cas de suspension non liée à une fraude, l&apos;utilisateur est
          informé par email et dispose d&apos;un délai raisonnable pour
          régulariser sa situation.
        </p>
      </section>

      <section>
        <h2>9. Disponibilité du Service</h2>
        <p>
          DCA Tracker met tout en œuvre pour assurer un accès continu au
          Service. Toutefois, l&apos;éditeur ne peut garantir une disponibilité
          de 100 % et se réserve le droit d&apos;effectuer des opérations de
          maintenance pouvant entraîner une indisponibilité temporaire.
        </p>
        <p>
          Aucun engagement de niveau de service (SLA) n&apos;est associé au
          plan Premium dans sa version actuelle. Une indemnisation pourra être
          accordée à titre commercial en cas d&apos;indisponibilité prolongée
          (au-delà de 72 heures consécutives).
        </p>
      </section>

      <section>
        <h2>10. Limitation de responsabilité</h2>
        <p>
          DCA Tracker est un <strong>outil pédagogique</strong> qui projette
          des scénarios hypothétiques. Il ne constitue pas un conseil en
          investissement personnalisé. Les calculs (rendements, fiscalité)
          sont fournis à titre indicatif sur la base d&apos;hypothèses
          documentées.
        </p>
        <p>
          La responsabilité de DCA Tracker ne saurait être engagée :
        </p>
        <ul>
          <li>
            pour des décisions d&apos;investissement prises sur la base des
            simulations,
          </li>
          <li>
            pour des erreurs dans les déclarations fiscales basées sur le
            récap fiscal annuel (qui reste une <strong>aide à la
            déclaration</strong>, pas un document fiscal officiel),
          </li>
          <li>pour les performances réelles des marchés,</li>
          <li>
            pour les contenus et services proposés par les sites tiers liés
            depuis DCA Tracker (courtiers notamment).
          </li>
        </ul>
        <p>
          La responsabilité de DCA Tracker est, en toute hypothèse, plafonnée
          au montant des sommes effectivement versées par l&apos;utilisateur
          au titre des 12 derniers mois.
        </p>
      </section>

      <section>
        <h2>11. Données personnelles</h2>
        <p>
          Les modalités de traitement de vos données personnelles sont
          détaillées dans la{" "}
          <Link href="/confidentialite">Politique de confidentialité</Link>.
        </p>
      </section>

      <section>
        <h2>12. Modification des CGV</h2>
        <p>
          DCA Tracker se réserve le droit de modifier les présentes CGV à tout
          moment. Toute modification substantielle sera notifiée par email aux
          abonnés actifs au moins 30 jours avant entrée en vigueur. La
          poursuite de l&apos;utilisation du Service après cette période vaut
          acceptation des nouvelles CGV.
        </p>
      </section>

      <section>
        <h2>13. Loi applicable et règlement des litiges</h2>
        <p>
          Les présentes CGV sont soumises au <strong>droit français</strong>.
        </p>
        <p>
          En cas de litige, vous pouvez contacter DCA Tracker à{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a> pour
          rechercher une solution amiable.
        </p>
        <p>
          Conformément à l&apos;article L.612-1 du Code de la consommation,
          vous avez la possibilité de recourir gratuitement à un médiateur de
          la consommation en vue d&apos;une résolution amiable. La plateforme
          européenne de règlement en ligne des litiges est accessible à
          l&apos;adresse :{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </p>
        <p>
          À défaut d&apos;accord amiable, les tribunaux français seront seuls
          compétents. Les consommateurs domiciliés dans l&apos;Union européenne
          conservent le bénéfice des dispositions impératives de la loi de leur
          pays de résidence.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          Pour toute question relative aux présentes CGV :{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a>.
        </p>
      </section>
      </LegalArticle>
    </div>
  );
}
