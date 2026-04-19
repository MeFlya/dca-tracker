import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Legal disclaimer */}
        <div className="mb-10 p-4 rounded-xl bg-amber-50 border border-amber-200">
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
              Simulateur d&apos;investissement progressif en ETF.
              Outil éducatif, transparent, gratuit.
            </p>
          </div>

          {/* Outils */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Outils
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/simulateur" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Simulateur DCA
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
                <Link href="/tarifs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Simulations */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Simulations
            </h3>
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
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Guides
            </h3>
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
                <Link href="/glossaire" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Glossaire
                </Link>
              </li>
              <li>
                <Link href="/methodologie" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Méthodologie
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Légal
            </h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-400">Pas de conseil financier</span></li>
              <li><span className="text-sm text-gray-400">Données indicatives</span></li>
              <li><span className="text-sm text-gray-400">Outil éducatif uniquement</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {year} DCA Tracker. Outil éducatif — pas de conseil en investissement.
          </p>
          <p className="text-xs text-gray-400">
            Données de marché potentiellement différées.
          </p>
        </div>
      </div>
    </footer>
  );
}
