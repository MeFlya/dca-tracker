import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { BOURSO_BROCHURE_DU, BOURSO_MINIMUM_ORDRE_ETF, BROKER_LIST } from "@/lib/brokers";
import { BrokerLogoMark } from "@/components/ui/BrokerLogoMark";
import { InvestCTA } from "@/components/ui/InvestCTA";
import { AffiliationNotice } from "@/components/ui/AffiliationNotice";
import { ComparisonDisclosure } from "@/components/ui/ComparisonDisclosure";
import { TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import {
  coutFraisOrdre,
  fraisOrdrePayes,
  HYPOTHESES_COMPARATIFS,
} from "@/lib/ecart-frais";

const TITLE =
  "Comparatif des meilleurs courtiers pour un DCA ETF en 2026";
const DESCRIPTION =
  "Trade Republic, BoursoBank, Fortuneo : comparaison des courtiers adaptés à un investissement DCA ETF en France. Frais, PEA, mobile, régulation.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/comparatif" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/comparatif",
    type: "website",
  },
};

export default function ComparatifHubPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${siteUrl}/comparatif`,
        }}
      />

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Comparatif brokers</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
        Quel courtier pour un DCA ETF en 2026 ?
      </h1>
      {/* 28/09/2026 : « même 0,2 % de frais en plus peuvent coûter plusieurs
          milliers d'euros » — faux pour des frais d'ordre, les seuls que ces
          courtiers facturent sur un DCA. Montants calculés par le moteur
          (fait BT-33), jamais recopiés.
          29/09/2026 : « la garantie des dépôts » ne départage pas les trois
          (100 000 € partout, EdB ou FGDR) ; l'écart porte sur les titres
          (70 000 € FGDR contre 90 % plafonnés à 20 000 € EdB — faits
          fgdr-plafonds, tr-garantie-titres). Et la phrase doit rester alignée
          sur le critère affiché juste dessous par <ComparisonDisclosure />
          (coût d'un versement récurrent), sinon les deux se contredisent. */}
      <p className="text-lg text-gray-500 leading-relaxed mb-10">
        Le choix du courtier fixe ce que coûte chaque versement. Sur un DCA de{" "}
        {HYPOTHESES_COMPARATIFS.monthlyAmount} € par mois pendant{" "}
        {HYPOTHESES_COMPARATIFS.durationYears} ans, 1 € de frais par ordre
        représente {fraisOrdrePayes(1)} € payés, et environ{" "}
        {coutFraisOrdre(1, TER_REFERENCE_SIMULATEUR)} € de capital en moins à
        l&apos;arrivée (hypothèse de {HYPOTHESES_COMPARATIFS.annualReturnPct} %
        par an) : réel, mais loin des milliers d&apos;euros qu&apos;on lit
        parfois. Ce qui départage vraiment ces trois courtiers, c&apos;est ce
        que coûte, et ce que permet, un versement récurrent : la gratuité ou
        non de l&apos;achat programmé, et le montant minimum par ordre, qui
        peut rendre un petit versement mensuel impossible. Autre différence à
        connaître, la garantie en cas de défaillance du courtier, surtout pour
        les titres : jusqu&apos;à 70 000 € avec le FGDR (BoursoBank,
        Fortuneo), contre 90 % des créances dans la limite de 20 000 € côté
        allemand (Trade Republic). Aucune ne protège contre une baisse des
        marchés.
      </p>

      {/* Obligation D.111-7 II : critère + définition, exhaustivité + nombre,
          référencement payant ou non — AVANT le classement, jamais après. */}
      <ComparisonDisclosure kind="brokers" className="mb-6" />

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold text-gray-500 w-1/3">Courtier</th>
              <th className="px-4 py-3 font-semibold text-gray-500">PEA</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Frais d&apos;ordre</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Épargne auto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {BROKER_LIST.map((b) => (
              <tr key={b.slug} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/comparatif/${b.slug}`}
                    className="font-semibold text-gray-900 hover:text-primary-700 transition-colors"
                  >
                    {b.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{b.tagline}</p>
                </td>
                <td className="px-4 py-3">
                  {b.specs.pea ? (
                    <span className="text-emerald-600 font-semibold">Oui</span>
                  ) : (
                    <span className="text-gray-500">Non</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs leading-relaxed">
                  {b.specs.orderFeesText.split(" · ").map((part, idx) => (
                    <span key={idx} className={idx === 0 ? "" : "block text-[11px] text-emerald-700 font-semibold"}>
                      {idx > 0 && "↳ "}{part}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold ${
                      b.specs.savingsPlan === "Oui"
                        ? "text-emerald-600"
                        : b.specs.savingsPlan === "Partielle"
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    {b.specs.savingsPlan}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed cards */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Les courtiers en détail</h2>
      <div className="space-y-4 mb-10">
        {BROKER_LIST.map((b) => (
          <Link
            key={b.slug}
            href={`/comparatif/${b.slug}`}
            className="group block rounded-2xl border border-gray-100 bg-white p-5 card-hover"
          >
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <div className="flex items-center gap-3">
                <BrokerLogoMark slug={b.slug} height={28} />
                <p className="text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                  {b.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                {b.specs.pea && (
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">PEA</span>
                )}
                {b.specs.cto && (
                  <span className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full font-semibold">CTO</span>
                )}
                {b.specs.assuranceVie && (
                  <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Assurance-vie</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">{b.tagline}</p>
            <p className="text-xs font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
              Lire l&apos;avis complet →
            </p>
          </Link>
        ))}
      </div>

      {/* How to choose */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Comment choisir</h2>
      <div className="space-y-3 mb-10">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            DCA automatique, sans frais d&apos;achat
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Trade Republic</strong> — les plans d&apos;investissement
            programmé en ETF s&apos;exécutent sans frais d&apos;achat, et le PEA
            est proposé depuis le 9 janvier 2025. Banque allemande : garantie
            allemande (EdB), pas le FGDR ; pour les titres, 90 % des créances,
            dans la limite de 20 000 €.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Écosystème complet (banque + bourse + assurance-vie)
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>BoursoBank</strong> (ex-Boursorama) — pour tout centraliser
            dans une banque en ligne française, avec l&apos;assurance-vie Bourso
            Vie. Selon la brochure tarifaire du {BOURSO_BROCHURE_DU} : ordre
            minimum de {BOURSO_MINIMUM_ORDRE_ETF} € sur les ETF, 0 € à
            l&apos;achat sur la gamme Boursomarkets.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Un achat par mois, passé soi-même
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Fortuneo</strong> — en tarif Starter, le premier ordre du
            mois est gratuit jusqu&apos;à 500 €. Pas de plan programmé sur ETF :
            l&apos;achat se fait à la main. Groupe Crédit Mutuel Arkéa, avec PEA,
            compte-titres et assurance-vie.
          </p>
        </div>
      </div>

      {/* Backlinks vers les guides — le hub courtiers doit irriguer le reste
          du site (avant ce bloc, la page était un cul-de-sac : aucun lien
          sortant vers les guides éducatifs).
          data-nosearch sur ce bloc, l'encart simulateur et la mention légale
          (recherche interne, 28/09/2026) : sans titre h2/h3 à eux, ils se
          collaient au passage « Comment choisir » — « PEA ou CTO ? »,
          « Investir comporte un risque » y répondaient à des requêtes sans
          rapport. */}
      <div data-nosearch="" className="mb-10 pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Avant de choisir un courtier
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/pea-ou-cto", label: "PEA ou CTO ?", sub: "L'enveloppe fiscale à choisir avant le courtier" },
            { href: "/strategie-dca", label: "La stratégie DCA", sub: "Investir chaque mois, simplement" },
            { href: "/meilleurs-etf-debutants", label: "Meilleurs ETF débutants", sub: "Quoi acheter une fois le compte ouvert" },
            { href: "/etf-msci-world", label: "ETF MSCI World", sub: "CW8, WPEA, DCAM — lequel choisir" },
          ].map((g) => (
            <Link key={g.href} href={g.href} className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
              <p className="text-sm font-semibold text-gray-900 mb-1">{g.label}</p>
              <p className="text-xs text-gray-500">{g.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div data-nosearch="" className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez votre DCA avant d&apos;ouvrir un compte
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          L&apos;impact des frais se mesure sur 20 ans. Entrez vos paramètres
          et comparez différents niveaux de frais dans le simulateur.
        </p>
        <Link
          href="/simulateur"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* Ne s'affiche que si au moins un partenariat est actif. */}
      <InvestCTA className="mt-10" />

      {/* Legal — mention d'affiliation dérivée de BROKER_CONFIG. */}
      <p data-nosearch="" className="mt-10 text-[11px] text-gray-500 leading-relaxed text-center">
        Ce comparatif est fourni à titre informatif et ne constitue pas un
        conseil en investissement personnalisé. <AffiliationNotice />{" "}
        Investir comporte un risque de perte en capital. Tarifs et conditions à
        vérifier sur les sites officiels avant ouverture de compte.
      </p>
    </div>
  );
}
