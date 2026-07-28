import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">

        {/* Legal disclaimer — data-nosnippet : interdit à Google d'utiliser ce
            texte comme extrait/sitelink (il remplaçait les meta descriptions
            des pages dans les résultats de recherche). */}
        <div data-nosnippet className="mb-10 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Avertissement légal :</strong> DCA Tracker est un outil
            pédagogique et informatif. Il ne constitue pas un conseil en
            investissement financier personnalisé. Les simulations sont
            hypothétiques et ne garantissent pas les performances futures. Les
            données de marché peuvent être différées. Investir comporte un
            risque de perte en capital. Consultez un conseiller financier
            agréé avant toute décision d&apos;investissement.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3 hover:opacity-80 transition-opacity">
              <LogoMark size={24} />
              <span className="text-sm font-bold tracking-tight text-gray-900">
                DCA<span className="font-normal text-gray-500 ml-1">Tracker</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Le cockpit DCA long-terme pour investisseurs ETF.
              Simuler, sauvegarder, suivre.
            </p>
          </div>

          {/* Outils */}
          <div>
            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Outils
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/simulateur" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Simulateur DCA
                </Link>
              </li>
              <li>
                <Link href="/backtest" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Backtest historique
                </Link>
              </li>
              <li>
                <Link href="/comparer-etf" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Comparer les ETF
                </Link>
              </li>
              <li>
                <Link href="/donnees-marche" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Données de marché
                </Link>
              </li>
              <li>
                <Link href="/calculateur-fiscal-pea-cto" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Calculateur fiscal PEA/CTO
                </Link>
              </li>
              <li>
                <Link href="/allocation-portefeuille" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Allocation portefeuille
                </Link>
              </li>
              <li>
                <Link href="/comparatif" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Comparatif brokers
                </Link>
              </li>
              <li>
                <Link href="/comparatif-etf" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Comparatifs ETF
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Simulations */}
          <div>
            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Simulations
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/investir-100-euros-mois-etf" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Investir 100€/mois
                </Link>
              </li>
              <li>
                <Link href="/investir-200-euros-mois-etf" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Investir 200€/mois
                </Link>
              </li>
              <li>
                <Link href="/investir-300-euros-mois-etf" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Investir 300€/mois
                </Link>
              </li>
              <li>
                <Link href="/investir-500-euros-mois-etf" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Investir 500€/mois
                </Link>
              </li>
              <li>
                <Link href="/simulateur-retraite" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Simulateur retraite
                </Link>
              </li>
              <li>
                <Link href="/communaute" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Communauté
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Guides
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/meilleurs-etf-debutants" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Meilleurs ETF débutants
                </Link>
              </li>
              <li>
                <Link href="/strategie-dca" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Stratégie DCA
                </Link>
              </li>
              <li>
                <Link href="/interets-composes" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Intérêts composés
                </Link>
              </li>
              <li>
                <Link href="/investir-en-etf" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Investir en ETF
                </Link>
              </li>
              <li>
                <Link href="/pea-ou-cto" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  PEA ou CTO ?
                </Link>
              </li>
              <li>
                <Link href="/guide-5-etf-pea-premium" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  5 ETF Premium pour PEA
                </Link>
              </li>
              <li>
                <Link href="/glossaire" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Glossaire
                </Link>
              </li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              À propos
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/a-propos" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Qui est derrière
                </Link>
              </li>
              <li>
                <Link href="/a-propos#roadmap" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/methodologie" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Méthodologie
                </Link>
              </li>
              <li>
                <Link href="/transparence" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Transparence
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Journal des changements
                </Link>
              </li>
              <li>
                <a href="mailto:hello@dcatracker.fr" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Liens légaux — obligatoires pour un site commercial FR (LCEN, RGPD) */}
        <div className="pt-6 border-t border-gray-200">
          <nav aria-label="Liens légaux" className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
            <Link href="/mentions-legales" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgv" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              CGV
            </Link>
            <Link href="/confidentialite" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              Politique de confidentialité
            </Link>
            {/* Information du consommateur sur les liens affiliés —
                art. L.111-7 Code de la consommation. */}
            <Link href="/transparence" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              Transparence
            </Link>
          </nav>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              © {year} DCA Tracker. Outil éducatif — pas de conseil en investissement.
            </p>
            <p className="text-xs text-gray-500">
              Données de marché potentiellement différées.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
