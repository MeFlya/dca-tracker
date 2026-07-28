// Mention d'affiliation en pied d'article — DÉRIVÉE DE LA CONFIG.
//
// Pourquoi un composant plutôt qu'une phrase écrite dans chaque page : les
// pages disaient « DCA Tracker n'est pas affilié à X » en dur. C'était exact
// tant qu'aucun partenariat n'existait, mais le jour de l'activation il aurait
// fallu penser à modifier chaque page — et une seule oubliée transforme une
// mention légale en pratique commerciale trompeuse (art. L.121-2 Code conso).
//
// Ici la phrase se déduit de BROKER_CONFIG. Les deux états ne peuvent pas
// diverger, et l'activation de l'affiliation ne demande aucune relecture
// éditoriale.
//
// ⚠️ Ceci est la mention de PIED DE PAGE, une divulgation de contexte. Elle ne
// remplace pas <AffiliateDisclaimer />, qui doit apparaître juste AVANT le lien
// cliquable (art. L.111-7). Les deux coexistent, elles ne jouent pas le même rôle.

import Link from "next/link";
import { getPartnerForBroker, isBrokerCTAActive } from "@/lib/broker-config";

interface Props {
  /**
   * Fiche courtier de la page courante, si la page porte sur un courtier
   * précis. Omettre sur une page qui en présente plusieurs (hub comparatif) :
   * la formulation collective est alors utilisée.
   */
  broker?: { slug: string; name: string };
  className?: string;
}

export function AffiliationNotice({ broker, className }: Props) {
  return (
    <span className={className}>
      {broker ? <SingleBroker broker={broker} /> : <ManyBrokers />}
    </span>
  );
}

function SingleBroker({ broker }: { broker: { slug: string; name: string } }) {
  const partner = getPartnerForBroker(broker.slug);

  if (!partner) {
    // Soit l'affiliation est inactive, soit ce courtier n'en fait pas partie.
    // Dans les deux cas l'affirmation est vraie, et elle a de la valeur : elle
    // dit au lecteur que l'analyse qu'il vient de lire n'est pas rémunérée.
    return <>DCA Tracker n&apos;est pas affilié à {broker.name}.</>;
  }

  return (
    <>
      DCA Tracker est partenaire de {broker.name} et peut percevoir une
      commission si vous ouvrez un compte via les liens de cette page. Cela ne
      change rien au coût pour vous et n&apos;a pas influencé cette analyse —{" "}
      <TransparenceLink />.
    </>
  );
}

function ManyBrokers() {
  if (!isBrokerCTAActive()) {
    return <>DCA Tracker n&apos;est affilié à aucun des courtiers présentés.</>;
  }

  return (
    <>
      Certains des courtiers présentés sont des partenaires rémunérés,
      d&apos;autres non, et les deux sont comparés selon les mêmes critères. La
      liste exacte et le détail des rémunérations sont publics —{" "}
      <TransparenceLink />.
    </>
  );
}

function TransparenceLink() {
  return (
    <Link href="/transparence" className="underline hover:text-gray-700">
      voir la page transparence
    </Link>
  );
}
