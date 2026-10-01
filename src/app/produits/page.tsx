// Hub /produits — les produits digitaux en paiement unique.
// Positionnement : capte les "non" au SaaS (les gens qui veulent du
// Excel/PDF sans abonnement). Lien discret depuis le bas de /tarifs.
//
// Refonte du 01/10/2026 : vitrine dans la grammaire de /tarifs (section
// sombre opaque puis section blanche), cartes avec de VRAIES vignettes du
// produit et ses chiffres clés. Retirés : le badge « Meilleure valeur »
// (superlatif autoproclamé), la phrase « Beaucoup commencent par le
// template… » (aucune base) et le « 4,90 €/mois » écrit à la main.
// Inchangés : metadata, JSON-LD CollectionPage, URL, texte du H1.
//
// Relecture du 01/10/2026 : retiré « TVA incluse » (faux : le vendeur est en
// franchise de TVA, art. 293 B du CGI, voir CGV et mentions légales) et le
// mini-point « Paiement unique » (le H1 le dit déjà).
//
// Relecture DA du 01/10/2026 : « Ressources » se lisait trois fois de suite
// (fil d'Ariane, surtitre, H1) et « Satisfait ou remboursé 14 jours » trois
// fois dans le premier écran et demi : retirés du surtitre et de la ligne
// sous les cartes (restent le mini-point et la carte « Après le paiement »).
// Le fil d'Ariane visible a désormais son BreadcrumbList, comme les pages
// produit. Le <title> garde « Produits — … » (invariant du cahier, § 7.4) :
// le passer à « Ressources » touche au référencement, c'est à Maël de trancher.

import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { JsonLd } from "@/components/ui/JsonLd";
import { ApresPaiement, EnTeteBloc } from "@/components/products/blocs";
import { FondSombre } from "@/components/products/FondSombre";
import { ProductCard } from "@/components/products/ProductCard";
import { PRODUCT_LIST } from "@/lib/products";
import { PREMIUM_ESSAI_JOURS, PREMIUM_PRIX_MENSUEL_EUR } from "@/lib/plans";

const TITLE = "Produits — Cockpit DCA (suivi PEA) & guide pour démarrer";
const DESCRIPTION =
  "Nos ressources en paiement unique, sans abonnement : le Cockpit DCA (tableau de bord Excel/Google Sheets pour piloter votre PEA), le guide PDF pour démarrer le DCA en France, et le pack complet. Livraison immédiate, facture automatique.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/produits" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/produits",
    type: "website",
    siteName: "DCA Tracker",
  },
};

const prixMensuel = `${PREMIUM_PRIX_MENSUEL_EUR.toFixed(2).replace(".", ",")} €/mois`;

export default function ProduitsHubPage() {
  const siteUrl = "https://dcatracker.fr";
  const unitaires = PRODUCT_LIST.filter((p) => !p.inclut?.length);
  const packs = PRODUCT_LIST.filter((p) => p.inclut?.length);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${siteUrl}/produits`,
        }}
      />
      <BreadcrumbSchema items={[{ name: "Accueil", url: `${siteUrl}/` }, { name: "Ressources" }]} />

      {/* ── Vitrine, fond sombre opaque (masque le fond du layout) ── */}
      <section className="relative overflow-hidden bg-slate-950 pb-16 pt-10 md:pb-20 md:pt-12">
        <FondSombre />

        <div className="relative mx-auto mb-12 max-w-2xl px-4 text-center sm:px-6">
          <nav
            aria-label="Fil d'ariane"
            className="mb-6 flex items-center justify-center gap-2 text-sm text-slate-400 md:mb-8"
          >
            <Link href="/" className="transition-colors hover:text-slate-200">Accueil</Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200" aria-current="page">Ressources</span>
          </nav>
          <h1 className="mb-4 text-balance text-3xl font-bold leading-tight text-white md:text-4xl">
            Ressources en paiement unique
          </h1>
          <p className="mb-6 text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            Pas d&apos;abonnement, pas de compte requis&nbsp;: vous achetez, vous
            recevez vos fichiers par email, <strong className="text-white">ils sont à vous</strong>.
            Mises à jour incluses.
          </p>
          <div className="hidden flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:flex">
            {["Livraison immédiate par email", "Satisfait ou remboursé 14\u00a0jours"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-slate-300">
                <span className="h-1 w-1 rounded-full bg-primary-400" aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {unitaires.map((p, i) => (
            <ProductCard key={p.id} product={p} variante="sombre" priority={i < 2} />
          ))}
          {packs.map((p) => (
            <div key={p.id} className="mt-4 md:col-span-2">
              <ProductCard product={p} variante="sombre" misEnAvant />
            </div>
          ))}
        </div>

        <p className="relative mt-8 px-4 text-center text-xs text-slate-400">
          Prix net · TVA non applicable, art.&nbsp;293&nbsp;B du CGI
        </p>
      </section>

      {/* ── Lecture, fond blanc opaque. -mb-12 : recouvre la marge haute du
          pied de page, où le fond du layout réapparaissait. ── */}
      <section className="relative -mb-12 bg-white pb-28 pt-16 md:pb-32 md:pt-20">
        <div className="px-4 sm:px-6">
          <EnTeteBloc
            titre="Après le paiement"
            sousTitre="Les mêmes conditions pour les trois ressources."
          />
          <ApresPaiement />
        </div>

        <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card sm:p-8">
            <h2 className="mb-3 text-xl font-bold text-gray-900">Quelle différence avec l&apos;application&nbsp;?</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Ces produits sont autonomes&nbsp;: un fichier que vous possédez, sans
              abonnement. L&apos;app{" "}
              <Link href="/tarifs" className="underline hover:text-gray-900">
                DCA Tracker Premium
              </Link>{" "}
              automatise le suivi (saisie guidée, Monte Carlo, backtest, récap
              fiscal) pour {prixMensuel}, avec {PREMIUM_ESSAI_JOURS}&nbsp;jours d&apos;essai.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
