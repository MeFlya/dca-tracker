"use client";

// Filtres de /etf-eligibles-pea (liste complète, 28/10/2026).
//
// La liste est rendue côté serveur, en entier : 128 lignes lisibles sans
// JavaScript, par un robot comme par un lecteur, avec leurs ancres
// (#fonds-cw8). Ce composant ne reçoit PAS les données : il masque ou montre
// les lignes déjà dans la page, d'après leurs attributs data-* (data-cat,
// groupe ; data-em, émetteur ; data-lev, levier ; data-dev, devise) et leur
// texte (mnémonique, nom, indice, ISIN), lu une fois puis gardé en data-q. Rien n'est envoyé deux fois au navigateur, et aucune
// dépendance.
//
// display: none en style plutôt que l'attribut hidden : les classes de mise
// en page des lignes (block, sm:table-row) l'emporteraient sur [hidden].
//
// 14/10/2026 : 12 groupes sont repliés dans un <details> au chargement. Un
// filtre actif ouvre ceux où il trouve une ligne (sinon « 3 lignes
// affichées » ne montrerait que des titres) ; quand plus aucun filtre n'est
// actif, il referme ceux qu'il a ouverts, et seulement ceux-là : un groupe
// ouvert par le lecteur ou par une ancre (#monetaire) le reste.
//
// 14/10/2026 (relecture « lecteur sur téléphone ») : qui tapait VWCE, IWDA ou
// AEEM n'apprenait jamais que le fonds n'est pas éligible (« Aucune ligne ne
// correspond », ou PAEEM pour AEEM). Le mnémonique ou l'ISIN exact d'un des
// fonds non éligibles de la page fait afficher une phrase qui le dit, avec un
// lien vers sa carte ; une recherche sans résultat renvoie vers la section.
// Un mnémonique fait seulement de chiffres (500) ne compte que tapé seul :
// « S&P 500 » cherche l'indice, pas ce fonds.

import { useEffect, useId, useState } from "react";
import { normaliserRecherche } from "@/lib/liste-pea/recherche";

interface Props {
  groupes: { id: string; titre: string; n: number }[];
  emetteurs: { nom: string; n: number }[];
  total: number;
  /** Fonds non éligibles de la page, avec l'ancre de leur carte (#hors-pea-aeem). */
  horsPea: { symbole: string; isin: string; nom: string; ancre: string }[];
}

export function FiltresListePea({ groupes, emetteurs, total, horsPea }: Props) {
  const id = useId();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [em, setEm] = useState("");
  const [sansLevier, setSansLevier] = useState(false);
  const [euros, setEuros] = useState(false);
  const [visibles, setVisibles] = useState(total);

  useEffect(() => {
    const filtre = Boolean(q || cat || em || sansLevier || euros);
    const mots = normaliserRecherche(q).split(/\s+/).filter(Boolean);
    let n = 0;
    const lignes = document.querySelectorAll<HTMLElement>("[data-ligne]");
    lignes.forEach((el) => {
      const d = el.dataset;
      // Texte cherché, lu une fois dans la ligne : mnémonique, nom, émetteur,
      // indice (paragraphes de la 1re cellule) et ISIN — pas le détail de la preuve.
      if (d.q === undefined) {
        const morceaux = el.querySelectorAll(":scope > td:first-child > p, :scope > td > .i");
        d.q = normaliserRecherche(Array.from(morceaux, (m) => m.textContent ?? "").join(" "));
      }
      const ok =
        (!cat || d.cat === cat) &&
        (!em || d.em === em) &&
        (!sansLevier || d.lev !== "1") &&
        (!euros || d.dev === "EUR") &&
        mots.every((m) => (d.q ?? "").includes(m));
      el.style.display = ok ? "" : "none";
      if (ok) n++;
    });
    document.querySelectorAll<HTMLElement>("[data-groupe]").forEach((g) => {
      const une = Array.from(g.querySelectorAll<HTMLElement>("[data-ligne]")).some((el) => el.style.display !== "none");
      g.style.display = une ? "" : "none";
      if (!(g instanceof HTMLDetailsElement)) return;
      if (filtre && une && !g.open) {
        g.open = true;
        g.dataset.ouvertParFiltre = "1";
      } else if (!filtre && g.dataset.ouvertParFiltre) {
        g.open = false;
        delete g.dataset.ouvertParFiltre;
      }
    });
    setVisibles(n);
  }, [q, cat, em, sansLevier, euros]);

  const actif = Boolean(q || cat || em || sansLevier || euros);
  const motsSaisis = normaliserRecherche(q).split(/\s+/).filter(Boolean);
  const horsPeaCites = horsPea.filter((h) =>
    motsSaisis.some(
      (m) =>
        m === normaliserRecherche(h.isin) ||
        (m === normaliserRecherche(h.symbole) && (motsSaisis.length === 1 || /[a-z]/.test(m))),
    ),
  );
  const reinitialiser = () => {
    setQ("");
    setCat("");
    setEm("");
    setSansLevier(false);
    setEuros(false);
  };

  const champ =
    // text-base sous 640 px : Safari iOS agrandit la page au toucher d'un
    // champ écrit en moins de 16 px (relecture du 14/10/2026).
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base sm:text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";

  return (
    <div role="search" aria-label="Filtrer la liste" className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor={`${id}-q`} className="block text-xs font-semibold text-gray-600 mb-1">
            Mnémonique, ISIN ou nom
          </label>
          <input
            id={`${id}-q`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="CW8, FR0011871128, Nasdaq…"
            autoComplete="off"
            spellCheck={false}
            className={champ}
          />
        </div>
        <div>
          <label htmlFor={`${id}-cat`} className="block text-xs font-semibold text-gray-600 mb-1">
            Indice ou catégorie
          </label>
          <select id={`${id}-cat`} value={cat} onChange={(e) => setCat(e.target.value)} className={champ}>
            <option value="">Toutes ({total})</option>
            {groupes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.titre} ({g.n})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-em`} className="block text-xs font-semibold text-gray-600 mb-1">
            Émetteur
          </label>
          <select id={`${id}-em`} value={em} onChange={(e) => setEm(e.target.value)} className={champ}>
            <option value="">Tous</option>
            {emetteurs.map((e) => (
              <option key={e.nom} value={e.nom}>
                {e.nom} ({e.n})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-700">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sansLevier}
            onChange={(e) => setSansLevier(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Masquer les ETF à effet de levier ou inverses
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={euros}
            onChange={(e) => setEuros(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Cotées en euros seulement
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <p aria-live="polite">
          {visibles === total
            ? `${total} lignes affichées.`
            : visibles === 0
              ? "Aucune ligne ne correspond."
              : `${visibles} ${visibles > 1 ? "lignes affichées" : "ligne affichée"} sur ${total}.`}
        </p>
        {actif && (
          <button type="button" onClick={reinitialiser} className="font-semibold text-primary-700 hover:underline">
            Tout afficher
          </button>
        )}
      </div>
      <div aria-live="polite" className="text-sm text-gray-700 leading-relaxed">
        {horsPeaCites.map((h) => (
          <p key={h.symbole} className="mt-2">
            <strong className="font-semibold text-gray-900">{h.symbole}</strong>
            {` (${h.nom}, ISIN ${h.isin}) n'est pas éligible au PEA\u00a0: `}
            <a href={`#${h.ancre}`} className="font-semibold text-primary-700 hover:underline">
              voir pourquoi
            </a>
            .
          </p>
        ))}
        {visibles === 0 && horsPeaCites.length === 0 && (
          <p className="mt-2">
            Voir aussi{" "}
            <a href="#non-eligibles" className="font-semibold text-primary-700 hover:underline">
              {`les ${horsPea.length} fonds qui ne sont pas éligibles au PEA`}
            </a>
            , après la liste.
          </p>
        )}
      </div>
    </div>
  );
}
