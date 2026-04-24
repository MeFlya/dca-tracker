// Testimonials section — displayed on homepage + /tarifs.
//
// TODO(founder): demander 3-5 témoignages à Lucas, Nadia, et aux premiers
// utilisateurs Premium qui ont loggué ≥ 6 mois. Prompt recommandé :
//   "En 2 phrases : qu'est-ce que DCA Tracker t'a permis de faire que tu
//    n'arrivais pas à faire avant ? Tu peux parler de clarté, discipline,
//    confiance dans ta stratégie — pas besoin de parler de features."
//
// Tant que TESTIMONIALS est vide, la section ne s'affiche pas (aucun
// dummy content, on veut pas de fake). Ajoute les vrais témoignages dans
// la constante ci-dessous et la section apparaîtra automatiquement.

type Testimonial = {
  /** Prénom ou prénom + initiale (ex: "Lucas G.") */
  name: string;
  /** Ex: "Investisseur DCA depuis 2022", "Développeur" */
  role: string;
  /** 1-3 phrases max — contenu prioritaire, pas du remplissage */
  quote: string;
  /** Optionnel — chemin vers photo dans /public (ex: "/testimonials/lucas.jpg") */
  photoUrl?: string;
  /** Optionnel — localisation : "Paris", "Lyon", "Bordeaux"... */
  location?: string;
};

const TESTIMONIALS: Testimonial[] = [
  // Example commenté — ne pas publier tel quel :
  // {
  //   name: "Lucas G.",
  //   role: "Investisseur DCA depuis 2022",
  //   location: "Lyon",
  //   quote:
  //     "Avant DCA Tracker, je savais pas si je me tenais vraiment à ma stratégie. Maintenant je vois mois par mois si je suis à jour, et ça change tout sur la discipline.",
  // },
];

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Ils utilisent DCA Tracker
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Ce que les investisseurs en disent
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Des retours authentiques d&apos;investisseurs particuliers
            français qui utilisent l&apos;outil au quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card-sm"
            >
              {/* Quote */}
              <svg
                aria-hidden
                className="w-5 h-5 text-primary-400 mb-3"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M3 6.5C3 4.567 4.567 3 6.5 3V5A1.5 1.5 0 0 0 5 6.5V7h1.5A1.5 1.5 0 0 1 8 8.5v2A1.5 1.5 0 0 1 6.5 12h-2A1.5 1.5 0 0 1 3 10.5v-4zm6.5 0C9.5 4.567 11.067 3 13 3v2a1.5 1.5 0 0 0-1.5 1.5V7H13a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 13 12h-2a1.5 1.5 0 0 1-1.5-1.5v-4z" />
              </svg>
              <blockquote className="text-sm text-gray-700 leading-relaxed mb-5">
                « {t.quote} »
              </blockquote>

              {/* Author */}
              <figcaption className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {t.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photoUrl}
                    alt={t.name}
                    width={40}
                    height={40}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm shrink-0"
                    aria-hidden
                  >
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">
                    {t.role}
                    {t.location && <> · {t.location}</>}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
