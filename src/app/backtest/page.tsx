// /backtest — Page Premium : "ce qu'aurait DONNÉ votre DCA dans la vraie vie".
//
// Différence avec /simulateur : le simulateur projette à partir d'un rendement
// THÉORIQUE constant (6-7 %/an). Cette page utilise des données HISTORIQUES
// RÉELLES du MSCI World (proxy IWDA.AS EUR) → on voit les vrais creux COVID,
// 2022, 2018, etc.
//
// Pourquoi Premium : c'est la seule feature intrinsèquement RÉCURRENTE
// (on revient à chaque doute, chaque krach, chaque ajustement de stratégie),
// ce qui justifie l'abonnement vs un achat ponctuel.
//
// SEO : on tient à indexer cette page car le mot-clé "backtest DCA" est très
// peu adressé en FR. Mais le contenu sera "teaser" pour les non-Premium
// (formulaire visible mais grisé + CTA upgrade).

import type { Metadata } from "next";
import Link from "next/link";
import { getUserSubscription, isPremium } from "@/lib/subscription";
import { getAvailableRange, getDatasetMeta } from "@/lib/backtest";
import { BacktestClient } from "./BacktestClient";

const TITLE = "Backtest DCA historique MSCI World — ce qu'aurait donné votre stratégie";
const DESCRIPTION =
  "Reconstituez ce qu'un DCA mensuel sur le MSCI World aurait donné depuis 2009. Données historiques réelles en EUR : COVID 2020, inflation 2022, etc. TRI calculé, drawdown affiché. Feature Premium.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/backtest" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/backtest",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function BacktestPage() {
  // Subscription côté serveur — l'isPremium ne fuite jamais dans le HTML
  // public à part le boolean. Pas de PII.
  const sub = await getUserSubscription();
  const premium = isPremium(sub.plan);

  const range = getAvailableRange();
  const meta = getDatasetMeta();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'ariane"
          className="flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <Link href="/simulateur" className="hover:text-gray-700 transition-colors">
            Simulateur
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-700" aria-current="page">
            Backtest historique
          </span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="inline-flex items-center bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              Premium
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Backtest historique
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
            Ce qu&apos;aurait <em className="not-italic text-primary-700">vraiment</em> donné votre DCA
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Le simulateur classique projette à partir d&apos;un rendement
            théorique constant. Ici on utilise les <strong>vrais cours du
            MSCI World en EUR</strong> depuis {range.min.slice(0, 4)} —
            avec tous les creux que vous auriez traversés (COVID, inflation
            2022, etc.).
          </p>
        </header>

        {/* Le client component gère tout : inputs, calcul, graphique, paywall. */}
        <BacktestClient
          isPremium={premium}
          minMonth={range.min}
          maxMonth={range.max}
        />

        {/* Disclaimer / méthodo */}
        <section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            Méthodologie & limites
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
            <li>
              <strong>Source des données :</strong> {meta.source}. Récupéré le{" "}
              {meta.fetchedAt}.
            </li>
            <li>
              <strong>Hypothèse :</strong> achat le dernier jour de chaque mois
              au cours de clôture. Pas de frais de courtage modélisés.
            </li>
            <li>
              <strong>Ne tient PAS compte :</strong> du TER de l&apos;ETF (≈
              0,20 %/an), de la fiscalité (PFU/PS), de l&apos;impact des
              dividendes en cas d&apos;ETF distribuant (IWDA est capitalisant
              donc déjà inclus dans le cours).
            </li>
            <li>
              <strong>Drawdown :</strong> calculé sur la valeur du portefeuille
              DCA, pas sur l&apos;indice brut. Le DCA amortit le drawdown grâce
              à l&apos;effet moyennage — donc votre vraie perte papier est
              toujours plus douce qu&apos;une lecture brute de l&apos;indice.
            </li>
            <li>
              <strong>Performances passées :</strong> ne préjugent en rien des
              performances futures. Outil pédagogique uniquement, pas de
              conseil en investissement.{" "}
              <Link
                href="/methodologie"
                className="underline hover:text-gray-900 transition-colors"
              >
                Méthodologie détaillée
              </Link>
              .
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
