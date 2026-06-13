import Link from "next/link";
import { Check, X, ExternalLink, Smartphone, Shield, Euro } from "lucide-react";
import type { BrokerData } from "@/lib/brokers";
import { BROKER_LIST } from "@/lib/brokers";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BrokerLogoMark } from "@/components/ui/BrokerLogoMark";

function MobileRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`inline-block w-1.5 h-3 rounded-sm ${n <= rating ? "bg-primary-500" : "bg-gray-200"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
      <Check size={14} strokeWidth={2.5} /> Oui
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-500">
      <X size={14} /> Non
    </span>
  );
}

export function BrokerPage({ broker }: { broker: BrokerData }) {
  const siteUrl = "https://dcatracker.fr";
  const canonical = `/comparatif/${broker.slug}`;
  const otherBrokers = BROKER_LIST.filter((b) => b.slug !== broker.slug);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Le schema Article est émis par ArticleByline (author Person Maël +
          datePublished/dateModified — E-E-A-T) au lieu de l'ancien JsonLd
          Article anonyme (author Organization, sans dates). */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: broker.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/comparatif" className="hover:text-gray-600 transition-colors">Comparatif brokers</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">{broker.shortName ?? broker.name}</span>
      </nav>

      {/* Hero — logo officiel du courtier à gauche du titre (usage nominatif,
          cf BrokerLogoMark.tsx). */}
      <div className="flex items-start gap-4 mb-8">
        <BrokerLogoMark slug={broker.slug} height={44} className="mt-2" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent-700 uppercase tracking-widest mb-2">
            Avis courtier DCA
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {broker.name} pour un DCA ETF
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            {broker.tagline}
          </p>
        </div>
      </div>

      <ArticleByline
        publishedAt="2026-04-19"
        updatedAt="2026-06-10"
        readingMinutes={6}
        url={canonical}
        headline={broker.metaTitle}
        description={broker.metaDescription}
      />

      <p className="text-base text-gray-700 leading-relaxed mb-10">
        {broker.heroIntro}
      </p>

      {/* Specs table */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Caractéristiques clés
      </h2>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden mb-10">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-3 text-gray-500 w-1/2">PEA</td>
              <td className="px-4 py-3"><YesNo value={broker.specs.pea} /></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500">CTO</td>
              <td className="px-4 py-3"><YesNo value={broker.specs.cto} /></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500">Assurance-vie</td>
              <td className="px-4 py-3"><YesNo value={broker.specs.assuranceVie} /></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500">Frais de tenue de compte</td>
              <td className="px-4 py-3 text-gray-900 font-medium">{broker.specs.custodyFees}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500">Frais d&apos;ordre</td>
              <td className="px-4 py-3 text-gray-900 font-medium">{broker.specs.orderFeesText}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500">Épargne programmée ETF gratuite</td>
              <td className="px-4 py-3 text-gray-900 font-medium">{broker.specs.savingsPlan}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500">Dépôt minimum</td>
              <td className="px-4 py-3 text-gray-900 font-medium">{broker.specs.minDeposit}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500 inline-flex items-center gap-1.5"><Shield size={14} />Régulation</td>
              <td className="px-4 py-3 text-gray-900">{broker.specs.regulation}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-500 inline-flex items-center gap-1.5"><Smartphone size={14} />Expérience mobile</td>
              <td className="px-4 py-3"><MobileRating rating={broker.specs.mobile} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pros / Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
            Points forts
          </p>
          <ul className="space-y-2">
            {broker.pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-900 leading-relaxed">
                <Check size={14} strokeWidth={2.5} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">
            Points faibles
          </p>
          <ul className="space-y-2">
            {broker.cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-orange-900 leading-relaxed">
                <X size={14} strokeWidth={2.5} className="text-orange-500 mt-0.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DCA fit */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {broker.dcaFitTitle}
      </h2>
      <p className="text-base text-gray-700 leading-relaxed mb-6">
        {broker.dcaFitBody}
      </p>

      <div className="rounded-xl bg-primary-50/40 border border-primary-100 px-5 py-4 mb-10 flex items-start gap-3">
        <Euro size={18} className="text-primary-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
            Exemple de frais pour un DCA de 200 €/mois
          </p>
          <p className="text-sm text-primary-900 leading-relaxed">
            {broker.feeExample}
          </p>
        </div>
      </div>

      {/* Best for / Not ideal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Adapté pour
          </p>
          <ul className="space-y-1.5">
            {broker.bestFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-emerald-600 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Moins adapté pour
          </p>
          <ul className="space-y-1.5">
            {broker.notIdealFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-500 leading-relaxed">
                <span className="text-gray-500 mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
      <div className="space-y-3 mb-10">
        {broker.faq.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-gray-100 bg-white p-4 open:bg-gray-50/50"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-900">{q}</span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* CTA block */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center mb-10">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez votre DCA avant de choisir
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Voyez l&apos;impact concret des frais sur votre capital final. Entrez
          votre montant mensuel et comparez plusieurs hypothèses en 60 secondes.
        </p>
        <Link
          href="/simulateur?monthly=200&years=20&return=7&fees=0.3"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* External link */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 mb-10">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Site officiel
        </p>
        <a
          href={broker.homepageUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          {broker.homepageUrl.replace(/^https?:\/\//, "")}
          <ExternalLink size={14} />
        </a>
        <p className="text-xs text-gray-500 mt-1">
          Tarifs et conditions susceptibles d&apos;évoluer. Vérifiez toujours sur
          le site officiel avant d&apos;ouvrir un compte.
        </p>
      </div>

      {/* Other brokers */}
      <div className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Comparer avec d&apos;autres courtiers
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherBrokers.map((b) => (
            <Link
              key={b.slug}
              href={`/comparatif/${b.slug}`}
              className="rounded-xl border border-gray-100 bg-white p-4 card-hover flex items-start gap-3"
            >
              <BrokerLogoMark slug={b.slug} height={28} className="mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1">{b.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{b.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Guides — la fiche courtier irrigue les guides éducatifs (avant ce
          bloc, seule la navigation vers les autres courtiers existait :
          cul-de-sac vers le reste du site). */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Préparer votre DCA chez {broker.name}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/pea-ou-cto", label: "PEA ou CTO ?", sub: "Quelle enveloppe ouvrir chez ce courtier" },
            { href: "/etf-msci-world", label: "ETF MSCI World", sub: "CW8, WPEA, DCAM — quoi acheter en premier" },
            { href: "/strategie-dca", label: "La stratégie DCA", sub: "La méthode des versements mensuels" },
            { href: "/simulateur", label: "Simulateur DCA", sub: "Projetez vos versements avant d'ouvrir" },
          ].map((g) => (
            <Link key={g.href} href={g.href} className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
              <p className="text-sm font-semibold text-gray-900 mb-1">{g.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{g.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Legal */}
      <p className="mt-10 text-[11px] text-gray-500 leading-relaxed">
        Cet article est fourni à titre informatif et ne constitue pas un conseil
        en investissement personnalisé. DCA Tracker n&apos;est pas affilié à{" "}
        {broker.name}. Les informations présentées ont été vérifiées à la date de
        publication mais peuvent évoluer — consultez le site officiel du courtier
        pour les conditions tarifaires à jour.
      </p>
    </article>
  );
}
