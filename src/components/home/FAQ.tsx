import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq-data";

// ─── <details>/<summary>, pas un accordéon React (28/09/2026) ───────────────
// Les questions étaient des <button> et chaque réponse n'était rendue qu'à
// l'ouverture (état React) : le HTML ne contenait aucune réponse. La recherche
// interne, qui lit le HTML pré-rendu, ne trouvait donc jamais l'accueil pour
// « Mes données sont-elles collectées ? ». Avec <details>, les réponses sont
// dans le HTML, chaque question devient un passage avec sa propre ancre, et
// <AncresTitres /> sait ouvrir la question visée.
//
// Même apparence et même comportement qu'avant :
// - name="faq-accueil" garde une seule question ouverte à la fois (accordéon
//   exclusif natif ; un navigateur qui l'ignore en laisse simplement
//   plusieurs ouvertes) ;
// - le « + / − » est dessiné en CSS (::after) : un nœud texte dans <summary>
//   se retrouverait dans le titre du passage indexé (« … collectées ? + ») ;
// - clavier (Tab, Entrée, Espace) et état replié/déplié exposé aux lecteurs
//   d'écran sont natifs au <summary> ; plus besoin d'aria-expanded ni de JS.
// Le fondu de la réponse passe par group-open : il rejoue à chaque ouverture
// quel que soit le mode de masquage du navigateur, et motion-safe le coupe
// comme la règle prefers-reduced-motion de globals.css coupait animate-fade-in.
export function FAQ() {
  return (
    <section id="faq" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-gray-600">
            Les réponses aux questions les plus courantes sur le DCA, les ETF
            et cet outil.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} name="faq-accueil" className="group/faq py-5">
              <summary className="w-full text-left flex items-start justify-between gap-4 group cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-medium text-gray-900 text-sm leading-relaxed">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 w-5 h-5 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs transition-colors mt-0.5 after:content-['+'] group-open/faq:after:content-['−']"
                />
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed motion-safe:group-open/faq:animate-fade-in">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        {/* Lien discret "Qui est derrière DCA Tracker ?" inline sous la FAQ,
            en remplacement de la bande slate-50 dédiée qui doublonnait
            la TrustSection juste au-dessus.
            data-nosearch : sans titre à lui, ce lien se collerait au passage
            de la dernière question de la FAQ. */}
        <div data-nosearch="" className="mt-10 text-center">
          <Link
            href="/a-propos"
            className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-600 transition-colors"
          >
            → Qui est derrière DCA Tracker ?
          </Link>
        </div>
      </div>
    </section>
  );
}
