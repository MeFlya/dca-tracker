import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/ui/JsonLd";
import { StrategyPostIt } from "@/components/about/StrategyPostIt";
import { VisitTracker } from "@/components/analytics/VisitTracker";

const TITLE = "À propos — Maël, investisseur DCA et créateur de DCA Tracker";
const DESCRIPTION =
  "Derrière DCA Tracker, il y a Maël, un investisseur particulier de Lille qui a commencé son DCA en janvier 2025 et a codé l'outil qu'il aurait voulu trouver.";
const CANONICAL = "/a-propos";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "profile",
    // opengraph-image.tsx sibling file auto-populates og:image
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function AboutPage() {
  const siteUrl = "https://dcatracker.fr";

  // Person schema enrichi pour E-E-A-T (YMYL finance) : Google a besoin
  // d'identifier l'auteur réel + ses credentials + ses comptes externes
  // (sameAs) pour traçer l'expertise. C'est crucial pour qu'il accepte
  // d'indexer du contenu finance.
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/a-propos#person`,
    name: "Maël Faleyras",
    givenName: "Maël",
    familyName: "Faleyras",
    jobTitle: "Fondateur",
    description:
      "Investisseur particulier français, créateur de DCA Tracker. Investit en DCA sur ETF depuis janvier 2025.",
    image: `${siteUrl}/team/mael-faleyras.jpg`,
    url: `${siteUrl}/a-propos`,
    email: "hello@dcatracker.fr",
    worksFor: {
      "@type": "Organization",
      name: "DCA Tracker",
      url: siteUrl,
    },
    knowsAbout: [
      "Dollar Cost Averaging",
      "ETF",
      "PEA",
      "Investissement passif long terme",
      "MSCI World",
      "Finance personnelle",
      "Fiscalité française des placements",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lille",
      addressCountry: "FR",
    },
    // sameAs : connecte ce profil aux comptes externes vérifiables.
    // Permet à Google de relier l'auteur à son audience publique
    // (Knowledge Graph + signal d'expertise).
    sameAs: ["https://x.com/mael_invest"],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name: "DCA Tracker",
    url: siteUrl,
    founder: { "@id": `${siteUrl}/a-propos#person` },
    foundingDate: "2025",
    description:
      "Simulateur et tracker DCA ETF pour investisseurs particuliers français. Outil indépendant, bootstrappé, sans affiliation.",
    email: "hello@dcatracker.fr",
  };

  return (
    <>
      <VisitTracker event={{ name: "visit_about" }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'ariane"
          className="flex items-center gap-2 text-sm text-gray-500 mb-8"
        >
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-600" aria-current="page">
            À propos
          </span>
        </nav>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          L&apos;outil que j&apos;aurais voulu trouver en janvier 2025
        </h1>
        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          DCA Tracker n&apos;est pas un produit de fintech. C&apos;est un outil
          codé par Maël, investisseur particulier lillois, qui en avait marre
          des simulateurs américains traduits à la va-vite et des calculettes
          bancaires qui cachent leurs hypothèses.
        </p>

        {/* Post-it — mobile first (above "Qui je suis"), floated right on desktop */}
        <div className="mb-10 md:mb-0 md:float-right md:ml-8 md:-mt-4 md:w-[280px]">
          <StrategyPostIt />
        </div>

        {/* ── Qui je suis ───────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
              QUI JE SUIS
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Visage du fondateur — signal de confiance E-E-A-T (vrai humain
              derrière l'outil). */}
          <div className="flex items-center gap-4 mb-5">
            <Image
              src="/team/mael-faleyras.jpg"
              alt="Maël Faleyras, fondateur de DCA Tracker"
              width={96}
              height={96}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-card shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 leading-tight">Maël Faleyras</p>
              <p className="text-sm text-gray-500 leading-snug">
                Fondateur · Lille · investit en DCA depuis 2025
              </p>
              <a
                href="https://x.com/mael_invest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
              >
                @mael_invest sur X →
              </a>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Salut, moi c&apos;est Maël. Je vis à Lille et j&apos;ai commencé à
            investir en DCA en <strong>janvier 2025</strong>. Avant ça, comme
            beaucoup de Français de mon âge, mon argent dormait entre un Livret A
            et un compte courant qui fondait tranquillement avec l&apos;inflation.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Ma stratégie, aujourd&apos;hui, tient sur un post-it :
          </p>
          <ul className="text-sm text-gray-600 leading-relaxed mb-4 space-y-1.5 list-disc pl-5">
            <li>J&apos;épargne entre la moitié et les deux tiers de mon salaire chaque mois</li>
            <li>L&apos;essentiel part en DCA sur un ETF monde, via PEA</li>
            <li>
              Virement automatique le lendemain du salaire — pour ne pas avoir à
              prendre de décision
            </li>
            <li>Horizon : 20 ans minimum, idéalement 30</li>
            <li>Pas de stock picking, pas de crypto, pas de trading</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed italic">
            C&apos;est ennuyeux. Et c&apos;est fait exprès.
          </p>
        </section>

        {/* Clear float so subsequent sections go full-width */}
        <div className="clear-both" />

        {/* ── Pourquoi j'ai construit DCA Tracker ───────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
              POURQUOI J&apos;AI CONSTRUIT DCA TRACKER
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Je vais être honnête avec toi :{" "}
            <strong>je n&apos;ai pas 10 ans d&apos;expérience en bourse</strong>.
            J&apos;ai un peu plus d&apos;un an de DCA derrière moi au moment où
            j&apos;écris ces lignes. Mais c&apos;est précisément pour ça que
            j&apos;ai construit cet outil — j&apos;avais encore en tête toutes
            les questions que je me posais en démarrant.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Quand j&apos;ai commencé, j&apos;ai cherché un simulateur DCA français
            qui me donne trois choses simples :
          </p>
          <div className="space-y-3 mb-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-700">
                <strong>1. Une projection honnête</strong> — avec plusieurs
                scénarios, pas une seule ligne optimiste à « 7 % garanti ».
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-700">
                <strong>2. Un endroit pour sauvegarder ma stratégie</strong> —
                autre chose qu&apos;un Google Sheets éparpillé entre mon
                téléphone et mon PC.
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-700">
                <strong>
                  3. Un moyen de suivre, mois après mois, ce que j&apos;avais
                  RÉELLEMENT versé
                </strong>{" "}
                par rapport à ce que j&apos;avais PRÉVU. Pour rester discipliné
                quand les marchés flanchent.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Je n&apos;ai rien trouvé. Tous les outils étaient soit des
            simulateurs de banque qui cachent leurs frais, soit des apps
            américaines traduites au Google Translate. J&apos;ai donc commencé à
            coder le mien, d&apos;abord pour moi, puis pour d&apos;autres. Voilà
            DCA Tracker.
          </p>
        </section>

        {/* ── Les trois constats ───────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
              LES TROIS CONSTATS QUI M&apos;ONT FAIT CODER CET OUTIL
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1.5">
                1. Les simulateurs FR existants sont pensés pour rassurer, pas
                pour éduquer.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                La plupart projettent une seule ligne à 6 ou 7 % par an, sans
                jamais parler de volatilité ni d&apos;inflation. Un investisseur
                qui croit à ces chiffres va paniquer au premier -30 % — et il y
                en aura un, mathématiquement, sur 20 ans de DCA.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1.5">
                2. Les outils « pro » sont conçus pour des traders, pas pour des
                investisseurs passifs.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Boursorama, Trade Republic, eToro affichent tous des graphes sur
                1 jour, 1 mois, 1 an. Aucun ne te demande : « montre-moi ma
                trajectoire à 20 ans. » Or c&apos;est précisément la seule vue
                qui compte quand tu fais du DCA.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1.5">
                3. Personne ne suit ce qui a été RÉELLEMENT versé.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                C&apos;est LA différence entre une projection et la réalité.
                Entre « j&apos;ai prévu 300 €/mois » et « j&apos;ai réellement
                versé 300 € ce mois-ci », il y a une réalité que seul un tracker
                mensuel peut objectiver. C&apos;est ce qui m&apos;a fait nommer
                le projet « Tracker » et pas juste « Simulateur ».
              </p>
            </div>
          </div>
        </section>

        {/* ── Ce que DCA Tracker N'EST PAS ─────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
              CE QUE DCA TRACKER N&apos;EST PAS
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Par honnêteté intellectuelle, voilà ce que je ne prétends pas être :
          </p>
          <ul className="text-sm text-gray-600 leading-relaxed space-y-2">
            <li>
              <strong>— Pas un broker</strong> : on ne vend pas d&apos;ETF, on
              t&apos;aide à suivre ta stratégie quel que soit ton courtier.
            </li>
            <li>
              <strong>— Pas un robo-advisor</strong> : on ne gère pas ton
              portefeuille, on te donne les outils pour le faire toi-même.
            </li>
            <li>
              <strong>— Pas un outil pour traders</strong> : rien sur les
              options, la crypto, le day trading. Ce n&apos;est pas un jugement,
              c&apos;est juste pas le sujet.
            </li>
            <li>
              <strong>— Pas un produit « get rich quick »</strong> : la seule
              promesse, c&apos;est que le temps et la discipline, combinés, font
              des miracles. Et ça prend 20 ans.
            </li>
          </ul>
        </section>

        {/* ── Mes engagements ──────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
              MES ENGAGEMENTS
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Tant que je tiendrai ce projet, voilà ce que je ne ferai jamais :
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-gray-700 leading-relaxed">
              <span className="shrink-0 text-loss-dark font-bold" aria-hidden>
                ✗
              </span>
              <span>
                <strong>Je ne vendrai pas tes données.</strong>{" "}
                L&apos;analytics utilise Plausible (anonyme, sans cookies). Ta
                stratégie t&apos;appartient.
              </span>
            </li>
            <li className="flex gap-3 text-sm text-gray-700 leading-relaxed">
              <span className="shrink-0 text-loss-dark font-bold" aria-hidden>
                ✗
              </span>
              <span>
                <strong>Je ne prendrai pas de commission de broker.</strong>{" "}
                Aucun lien d&apos;affiliation sur le site. Si je recommande
                Trade Republic dans le comparatif, c&apos;est parce que leur
                épargne programmée est objectivement le meilleur deal FR, pas
                parce qu&apos;ils me versent quoi que ce soit.
              </span>
            </li>
            <li className="flex gap-3 text-sm text-gray-700 leading-relaxed">
              <span className="shrink-0 text-loss-dark font-bold" aria-hidden>
                ✗
              </span>
              <span>
                <strong>
                  Je ne te donnerai jamais de conseil personnalisé.
                </strong>{" "}
                Je ne suis ni CGP, ni CIF. Pour ça, il y a des professionnels
                agréés AMF.
              </span>
            </li>
            <li className="flex gap-3 text-sm text-gray-700 leading-relaxed">
              <span className="shrink-0 text-gain-dark font-bold" aria-hidden>
                ✓
              </span>
              <span>
                <strong>Je dirai quand je ne sais pas.</strong> Les hypothèses
                du simulateur sont documentées sur la page{" "}
                <Link
                  href="/methodologie"
                  className="text-primary-600 hover:underline font-medium"
                >
                  Méthodologie
                </Link>
                . Si tu repères une erreur, écris-moi, je corrige.
              </span>
            </li>
          </ul>
        </section>

        {/* ── Roadmap (id pour ancre footer) ───────────────────────────── */}
        <section id="roadmap" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
              LA ROADMAP, EN TRANSPARENCE
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            Voilà ce qui est en cours de construction, par ordre de priorité :
          </p>
          <div className="space-y-3">
            {[
              {
                title: "Données de marché en direct",
                body: "Remplacement du mode démo actuel par des cours réels via Yahoo Finance.",
              },
              {
                title: "Simulateur retraite dédié",
                body: "Saisie par âge cible plutôt que durée abstraite, avec intégration de la règle des 4 %.",
              },
              {
                title: "Projection en pouvoir d'achat réel",
                body: "Toggle inflation sur toutes les simulations, pour voir ce que ton capital VAUT réellement dans 20 ans.",
              },
              {
                title: "Sync cross-device",
                body: "Pour que ta stratégie te suive entre PC et mobile, sans passer par un Google Sheets.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-white p-4"
              >
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {item.title}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mt-5">
            Si tu veux voter sur ce qui doit venir en premier, dis-le moi par
            email ou via le bouton « Feedback » sur le site.
          </p>
        </section>

        {/* ── L'équipe ─────────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
              L&apos;ÉQUIPE
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Moi, un clavier, et beaucoup de café.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            DCA Tracker est un projet{" "}
            <strong>indépendant, bootstrappé, sans investisseurs</strong>. La
            roadmap est dictée par les besoins des utilisateurs, pas par un
            pitch deck. Le modèle économique est simple : un abonnement Premium
            à partir de 4,08 €/mois (facturé 49 €/an) qui finance les serveurs,
            les données de marché et mon temps.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Une question, un bug, une suggestion ? Écris-moi à{" "}
            <a
              href="mailto:contact@dcatracker.fr"
              className="text-primary-600 hover:underline font-medium"
            >
              contact@dcatracker.fr
            </a>
            . Je lis tout, je réponds à tout.
          </p>
        </section>

        {/* ── CTA dual ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link
            href="/simulateur"
            className="btn-primary flex-1 justify-center text-base py-3"
          >
            Tester le simulateur →
          </Link>
          <Link
            href="/methodologie"
            className="btn-secondary flex-1 justify-center text-base py-3"
          >
            Lire la méthodologie →
          </Link>
        </div>

        {/* ── Legal disclaimer ─────────────────────────────────────────── */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Avertissement :</strong> DCA Tracker est un outil pédagogique
            et informatif. Il ne constitue pas un conseil en investissement
            financier personnalisé. Les performances passées ne préjugent pas des
            performances futures. Investir comporte un risque de perte en
            capital. Consultez un conseiller en gestion de patrimoine (CGP) ou un
            CIF agréé AMF avant toute décision d&apos;investissement.
          </p>
        </div>
      </div>

      {/* ── JSON-LD ────────────────────────────────────────────────────── */}
      <JsonLd data={personSchema} />
      <JsonLd data={organizationSchema} />
    </>
  );
}
