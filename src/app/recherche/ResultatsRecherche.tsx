"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { chargerMoteur, type Moteur } from "@/lib/search/moteur";
import { PAGES_SUGGEREES, RECHERCHES_EXEMPLES } from "@/lib/search/suggestions";
import { LONGUEUR_MAX_REQUETE } from "@/lib/search/limites";
import { Extrait } from "@/components/search/Extrait";

const ID_CHAMP = "champ-recherche";

/**
 * Formulaire de /recherche, rendu côté serveur, hors de la limite Suspense
 * (voir page.tsx). next/form : GET /recherche?q=… sans JavaScript, navigation
 * côté client avec. Champ non contrôlé : le serveur le rend vide (la page est
 * statique, elle ne connaît pas l'URL) et <ResultatsRecherche /> le remplit
 * depuis l'URL une fois chargé.
 */
export function FormulaireRecherche() {
  const router = useRouter();
  return (
    <Form
      action="/recherche"
      replace
      scroll={false}
      prefetch={false}
      role="search"
      onSubmit={(e) => {
        const champ = e.currentTarget.elements.namedItem("q");
        if (!(champ instanceof HTMLInputElement)) return;
        const v = champ.value.trim();
        if (!v) {
          e.preventDefault();
          router.replace("/recherche", { scroll: false });
          return;
        }
        champ.value = v;
      }}
      className="mb-8 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100"
    >
      <Search size={18} className="shrink-0 text-gray-400" aria-hidden />
      <input
        id={ID_CHAMP}
        name="q"
        type="search"
        defaultValue=""
        maxLength={LONGUEUR_MAX_REQUETE}
        placeholder="ETF, frais, PEA, courtier, ISIN…"
        aria-label="Rechercher sur le site"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent py-1 text-base text-gray-900 outline-none placeholder:text-gray-400"
      />
      <button type="submit" className="btn-primary px-4 py-2 text-xs">
        Rechercher
      </button>
    </Form>
  );
}

/**
 * Résultats complets : jusqu'à 30 pages, chacune avec ses trois passages les
 * plus pertinents. Rendu côté client (useSearchParams) ; le formulaire, lui,
 * est dans le HTML.
 */
export function ResultatsRecherche() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const [moteur, setMoteur] = useState<Moteur | null>(null);
  const [erreur, setErreur] = useState(false);
  const premierPassage = useRef(true);

  // Le champ suit l'URL (arrivée par un lien, exemple cliqué, retour arrière).
  // Au premier passage seulement, on ne remplace pas ce que le lecteur a déjà
  // pu taper dans le champ pré-rendu avant la fin du chargement.
  useEffect(() => {
    const champ = document.getElementById(ID_CHAMP);
    if (!(champ instanceof HTMLInputElement)) return;
    const premier = premierPassage.current;
    premierPassage.current = false;
    if (premier && champ.value) return;
    champ.value = q;
  }, [q]);

  useEffect(() => {
    let annule = false;
    chargerMoteur()
      .then((m) => !annule && setMoteur(m))
      .catch(() => !annule && setErreur(true));
    return () => {
      annule = true;
    };
  }, []);

  const resultats = useMemo(() => (moteur && q ? moteur.rechercher(q, 30) : []), [moteur, q]);

  return (
    <>
      {erreur && (
        <p className="text-sm text-gray-600">
          La recherche n&apos;a pas pu se charger. Vérifiez votre connexion puis rechargez la page.
        </p>
      )}

      {!q && (
        <section aria-label="Pages suggérées">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Les plus consultées
          </p>
          <ul className="mb-8 grid gap-2 sm:grid-cols-2">
            {PAGES_SUGGEREES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="block rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:border-primary-200 hover:bg-primary-50"
                >
                  <span className="block text-sm font-semibold text-gray-900">{p.titre}</span>
                  <span className="block text-xs text-gray-500">{p.sousTitre}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Exemples />
        </section>
      )}

      {q && moteur && (
        <p className="mb-5 text-sm text-gray-500" aria-live="polite">
          {resultats.length === 0
            ? `Aucun résultat pour « ${q} ».`
            : `${resultats.length}${resultats.length === 30 ? "+" : ""} page${resultats.length > 1 ? "s" : ""} pour « ${q} »`}
        </p>
      )}

      {q && !moteur && !erreur && <p className="text-sm text-gray-500">Recherche en cours…</p>}

      {q && moteur && resultats.length === 0 && (
        <div className="text-sm text-gray-600">
          <p className="mb-6">
            Essayez un mot plus court ou plus courant : un ticker (WPEA), un courtier, un terme
            (plafond, frais, fiscalité).
          </p>
          <Exemples />
        </div>
      )}

      {resultats.length > 0 && (
        <ol className="space-y-7">
          {resultats.map((r) => (
            <li key={r.page.u}>
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">{r.page.c}</span>
                <span className="truncate">dcatracker.fr{r.page.u === "/" ? "" : r.page.u}</span>
              </div>
              <Link
                href={r.page.u}
                className="text-lg font-semibold leading-snug text-primary-700 hover:underline"
              >
                {r.page.t}
              </Link>
              <ul className="mt-2 space-y-2.5">
                {r.passages.map((p) => (
                  <li key={p.href + p.titre}>
                    {p.titre ? (
                      <Link
                        href={p.href}
                        className="group inline-flex items-start gap-1 text-sm font-medium text-gray-900 hover:text-primary-700"
                      >
                        <ArrowRight
                          size={13}
                          className="mt-1 shrink-0 text-gray-400 group-hover:text-primary-600"
                          aria-hidden
                        />
                        {p.titre}
                      </Link>
                    ) : null}
                    {p.extrait.length > 0 && (
                      <p className={p.titre ? "pl-[18px] text-sm leading-relaxed text-gray-600" : "text-sm leading-relaxed text-gray-600"}>
                        <Extrait morceaux={p.extrait} />
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function Exemples() {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Essayez</p>
      <div className="flex flex-wrap gap-2">
        {RECHERCHES_EXEMPLES.map((ex) => (
          <Link
            key={ex}
            href={`/recherche?q=${encodeURIComponent(ex)}`}
            scroll={false}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          >
            {ex}
          </Link>
        ))}
      </div>
    </div>
  );
}
