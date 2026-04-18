import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Legal disclaimer — always visible */}
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📈</span>
              <span className="font-semibold text-gray-900">DCA Tracker</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Simulez et visualisez votre stratégie d&apos;investissement
              progressif.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Outils
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/simulateur"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Simulateur DCA
                </Link>
              </li>
              <li>
                <Link
                  href="/comparer-etf"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Comparer les ETF
                </Link>
              </li>
              <li>
                <Link
                  href="/donnees-marche"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Données de marché
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Informations
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/methodologie"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Méthodologie
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Légal
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-400">
                  Pas de conseil financier
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400">
                  Données indicatives
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {year} DCA Tracker. Outil éducatif — pas de conseil en
            investissement.
          </p>
          <p className="text-xs text-gray-400">
            Données de marché potentiellement différées.
          </p>
        </div>
      </div>
    </footer>
  );
}
