import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle } from "@/components/ui/LegalArticle";

const TITLE = "Politique de confidentialité — DCA Tracker";
const DESCRIPTION =
  "Politique de confidentialité de DCA Tracker : collecte et traitement de vos données personnelles, finalités, durée de conservation, droits RGPD, sous-traitants, transferts hors UE.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: false },
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav aria-label="Fil d'ariane" className="mb-6 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-900 underline-offset-2 hover:underline">Accueil</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-700">Politique de confidentialité</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Politique de confidentialité
      </h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 29 avril 2026</p>

      <LegalArticle>

      <section>
        <h2>1. Préambule</h2>
        <p>
          La présente politique de confidentialité décrit la manière dont
          <strong> DCA Tracker</strong> (ci-après « nous ») collecte, utilise et
          protège vos données personnelles dans le cadre de l&apos;utilisation
          du site dcatracker.fr (ci-après « le Service »).
        </p>
        <p>
          Elle s&apos;applique conformément au{" "}
          <strong>Règlement (UE) 2016/679 (RGPD)</strong> et à la loi française
          n° 78-17 du 6 janvier 1978 modifiée (« Informatique et Libertés »).
        </p>
      </section>

      <section>
        <h2>2. Responsable du traitement</h2>
        <p>
          Le responsable du traitement est l&apos;éditeur du Site tel
          qu&apos;identifié dans les{" "}
          <Link href="/mentions-legales">mentions légales</Link>.
        </p>
        <p>
          Pour toute question relative à vos données personnelles :{" "}
          <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a>.
        </p>
      </section>

      <section>
        <h2>3. Données collectées</h2>
        <p>Nous collectons les catégories de données suivantes :</p>

        <h3>3.1 Données de compte</h3>
        <ul>
          <li>adresse email, prénom, nom (via Clerk lors de l&apos;inscription) ;</li>
          <li>
            mot de passe (haché par Clerk — DCA Tracker n&apos;y a jamais accès
            en clair) ;
          </li>
          <li>identifiant utilisateur unique (Clerk).</li>
        </ul>

        <h3>3.2 Données de simulation et de stratégie</h3>
        <ul>
          <li>
            paramètres de simulation : montant mensuel, durée, rendement
            cible, frais ;
          </li>
          <li>
            stratégie sauvegardée et entrées mensuelles (montant versé,
            valeur de portefeuille déclarée) — uniquement pour les abonnés
            Premium ;
          </li>
          <li>simulations sauvegardées (jusqu&apos;à 10 par compte Premium).</li>
        </ul>

        <h3>3.3 Données de paiement</h3>
        <ul>
          <li>
            informations bancaires (numéro de carte, etc.) :{" "}
            <strong>jamais collectées par DCA Tracker</strong> — gérées
            directement par Stripe (norme PCI-DSS) ;
          </li>
          <li>identifiant client Stripe, statut d&apos;abonnement, dates de période.</li>
        </ul>

        <h3>3.4 Données techniques</h3>
        <ul>
          <li>
            mesure d&apos;audience anonyme via{" "}
            <strong>Plausible Analytics</strong> (page consultée, pays, navigateur,
            sans identifiant individuel ni cookie) ;
          </li>
          <li>journaux serveur (logs d&apos;erreur, requêtes API) — conservés 30 jours.</li>
        </ul>

        <h3>3.5 Email d&apos;inscription à la newsletter (lead magnet)</h3>
        <ul>
          <li>
            adresse email collectée via les formulaires de capture (homepage,
            simulateur) — utilisée pour vous envoyer la cheat sheet « 5 ETF
            Premium pour PEA » et, le cas échéant, des emails ponctuels liés
            au produit.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Finalités et bases légales</h2>
        <table>
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale (RGPD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Création et gestion du compte utilisateur</td>
              <td>Exécution du contrat (art. 6.1.b)</td>
            </tr>
            <tr>
              <td>Fourniture des fonctionnalités gratuites et payantes du Service</td>
              <td>Exécution du contrat (art. 6.1.b)</td>
            </tr>
            <tr>
              <td>Traitement des paiements et facturation</td>
              <td>Exécution du contrat + obligation légale (art. 6.1.b et c)</td>
            </tr>
            <tr>
              <td>Envoi des emails transactionnels (confirmation, suivi mensuel, rappel essai)</td>
              <td>Exécution du contrat (art. 6.1.b)</td>
            </tr>
            <tr>
              <td>Envoi de la cheat sheet et emails produit (lead magnet)</td>
              <td>Consentement explicite (art. 6.1.a) — désinscription en 1 clic</td>
            </tr>
            <tr>
              <td>Mesure d&apos;audience anonyme (Plausible)</td>
              <td>Intérêt légitime (art. 6.1.f) — aucun cookie, aucun identifiant</td>
            </tr>
            <tr>
              <td>Sécurité, prévention de la fraude, journaux d&apos;erreur</td>
              <td>Intérêt légitime (art. 6.1.f)</td>
            </tr>
            <tr>
              <td>Respect des obligations comptables (factures)</td>
              <td>Obligation légale (art. 6.1.c)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>5. Durées de conservation</h2>
        <ul>
          <li>
            <strong>Données de compte :</strong> conservées tant que le compte
            est actif. Suppression à la demande de l&apos;utilisateur ou après
            3 ans d&apos;inactivité (avec notification préalable par email).
          </li>
          <li>
            <strong>Données de stratégie et historique :</strong> conservées
            tant que le compte existe (pour permettre la réactivation post-résiliation).
          </li>
          <li>
            <strong>Factures et données comptables :</strong> 10 ans
            (obligation légale — article L.123-22 du Code de commerce).
          </li>
          <li>
            <strong>Logs serveur :</strong> 30 jours.
          </li>
          <li>
            <strong>Email d&apos;inscription newsletter :</strong> jusqu&apos;à
            désinscription par l&apos;utilisateur.
          </li>
          <li>
            <strong>Données de mesure d&apos;audience (Plausible) :</strong>{" "}
            agrégées et anonymes — conservées sans limite spécifique.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Sous-traitants et transferts hors UE</h2>
        <p>
          DCA Tracker fait appel aux sous-traitants suivants pour le
          fonctionnement du Service. Tous sont soumis à des engagements
          contractuels conformes au RGPD (clauses contractuelles types lorsque
          le transfert se fait hors UE) :
        </p>
        <table>
          <thead>
            <tr>
              <th>Prestataire</th>
              <th>Rôle</th>
              <th>Localisation</th>
              <th>Cadre du transfert</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel Inc.</td>
              <td>Hébergement et infrastructure</td>
              <td>États-Unis</td>
              <td>Clauses contractuelles types (CCT) + DPF</td>
            </tr>
            <tr>
              <td>Clerk Inc.</td>
              <td>Authentification et gestion des comptes</td>
              <td>États-Unis</td>
              <td>Clauses contractuelles types (CCT) + DPF</td>
            </tr>
            <tr>
              <td>Stripe Inc.</td>
              <td>Traitement des paiements</td>
              <td>Irlande (EU) + États-Unis</td>
              <td>Clauses contractuelles types (CCT) + DPF</td>
            </tr>
            <tr>
              <td>Resend (Resend Inc.)</td>
              <td>Envoi des emails transactionnels et newsletter</td>
              <td>États-Unis</td>
              <td>Clauses contractuelles types (CCT) + DPF</td>
            </tr>
            <tr>
              <td>Plausible Insights OÜ</td>
              <td>Mesure d&apos;audience anonyme</td>
              <td>Estonie (UE)</td>
              <td>Pas de transfert hors UE</td>
            </tr>
            <tr>
              <td>Twelve Data Inc.</td>
              <td>Données de marché financier (cours ETF)</td>
              <td>États-Unis</td>
              <td>
                Aucune donnée personnelle transférée — uniquement des
                requêtes de cours publics
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>DPF</strong> = Data Privacy Framework UE-États-Unis (cadre de
          protection des données adopté par décision d&apos;adéquation de la
          Commission européenne du 10 juillet 2023).
        </p>
      </section>

      <section>
        <h2>7. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez des droits suivants sur vos
          données :
        </p>
        <ul>
          <li>
            <strong>Droit d&apos;accès</strong> (art. 15) — obtenir une copie
            des données vous concernant ;
          </li>
          <li>
            <strong>Droit de rectification</strong> (art. 16) — corriger des
            données inexactes ;
          </li>
          <li>
            <strong>Droit à l&apos;effacement</strong> (art. 17) — supprimer
            votre compte et l&apos;ensemble de vos données ;
          </li>
          <li>
            <strong>Droit à la limitation</strong> (art. 18) — restreindre
            certains traitements ;
          </li>
          <li>
            <strong>Droit à la portabilité</strong> (art. 20) — récupérer vos
            données dans un format structuré (export disponible depuis votre
            espace compte) ;
          </li>
          <li>
            <strong>Droit d&apos;opposition</strong> (art. 21) — vous opposer à
            un traitement fondé sur l&apos;intérêt légitime ;
          </li>
          <li>
            <strong>Droit de retirer votre consentement</strong> à tout moment
            pour les traitements fondés sur le consentement (newsletter) ;
          </li>
          <li>
            <strong>Droit de définir des directives post-mortem</strong> sur le
            sort de vos données après votre décès.
          </li>
        </ul>
        <p>
          <strong>Comment exercer vos droits :</strong>
        </p>
        <ul>
          <li>
            Depuis votre <Link href="/account/settings">espace compte</Link>{" "}
            (export, suppression).
          </li>
          <li>
            Par email à{" "}
            <a href="mailto:hello@dcatracker.fr">hello@dcatracker.fr</a> avec
            une copie d&apos;une pièce d&apos;identité si nécessaire à la
            vérification de votre identité.
          </li>
        </ul>
        <p>
          Nous nous engageons à répondre dans un délai d&apos;un mois maximum.
        </p>
      </section>

      <section>
        <h2>8. Cookies et traceurs</h2>
        <p>
          DCA Tracker n&apos;utilise <strong>aucun cookie de traçage publicitaire
          ou de profilage</strong>.
        </p>
        <p>
          La mesure d&apos;audience est assurée par <strong>Plausible Analytics</strong>,
          une solution européenne (Estonie) qui ne dépose aucun cookie, ne
          collecte aucune donnée personnelle identifiante et est exemptée du
          consentement préalable selon les recommandations de la CNIL.
        </p>
        <p>
          Seuls des cookies strictement nécessaires au fonctionnement du
          Service peuvent être déposés (session d&apos;authentification Clerk,
          maintien du panier de paiement Stripe). Ces cookies ne nécessitent
          pas de consentement (article 82 de la loi Informatique et Libertés).
        </p>
      </section>

      <section>
        <h2>9. Sécurité</h2>
        <p>
          Nous mettons en œuvre les mesures techniques et organisationnelles
          appropriées pour protéger vos données :
        </p>
        <ul>
          <li>chiffrement TLS 1.2+ en transit (HTTPS forcé sur tout le Site) ;</li>
          <li>
            stockage des mots de passe haché chez Clerk (jamais en clair) ;
          </li>
          <li>aucune donnée bancaire stockée — déléguée à Stripe (PCI-DSS) ;</li>
          <li>accès aux données restreints au strict nécessaire ;</li>
          <li>
            sauvegardes régulières et redondance assurées par les sous-traitants
            d&apos;hébergement (Vercel, Clerk).
          </li>
        </ul>
        <p>
          En cas de violation de données susceptible d&apos;engendrer un risque
          élevé pour vos droits et libertés, nous vous notifierons et
          informerons la CNIL dans les conditions prévues aux articles 33 et 34
          du RGPD.
        </p>
      </section>

      <section>
        <h2>10. Réclamation auprès de la CNIL</h2>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez
          introduire une réclamation auprès de la <strong>Commission Nationale
          de l&apos;Informatique et des Libertés (CNIL)</strong> :
        </p>
        <p>
          CNIL — 3 Place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07{" "}
          <br />
          <a
            href="https://www.cnil.fr/fr/plaintes"
            target="_blank"
            rel="noopener noreferrer"
          >
            cnil.fr/fr/plaintes
          </a>
        </p>
      </section>

      <section>
        <h2>11. Modification de la politique</h2>
        <p>
          Nous pouvons modifier cette politique à tout moment. Toute
          modification substantielle sera notifiée par email aux utilisateurs
          enregistrés. La date de dernière mise à jour est indiquée en haut du
          document.
        </p>
      </section>
      </LegalArticle>
    </div>
  );
}
