// Blocs des pages Ressources, dans le langage visuel de /tarifs (surtitres,
// cartes `.card`, coche SVG, FAQ, tableau à colonne sombre).
//
// Aucun chiffre écrit ici : prix, nombre de pages, prix barré, durée des
// liens… sont lus dans `products.ts` ou dans le code qui les applique.

import Image from "next/image";
import Link from "next/link";
import { FileText, Mail, Receipt, RefreshCw, RotateCcw, Table2 } from "lucide-react";
import { CaptureZoom } from "./CaptureZoom";
import { FondSombre } from "./FondSombre";
import { ProductBuyButton } from "./ProductBuyButton";
import { Vignette } from "./visuels";
import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { DEFAULT_TTL_DAYS } from "@/lib/download-token";
import { prixSepares, type Capture, type Product } from "@/lib/products";
import { typo } from "@/lib/typo";

/** « 19 € » : espace insécable, le symbole ne passe jamais seul à la ligne. */
export const euros = (n: number) => `${n} €`;

/** « le pack », « le guide », « le Cockpit DCA » : boutons et liens. */
export function nomAvecArticle(product: Product): string {
  if (product.inclut?.length) return "le pack";
  const premiere = product.screenshots?.[0];
  if (premiere && premiere.height > premiere.width) return "le guide";
  return `le ${product.shortName}`;
}

/** Classe du bouton d'achat sur fond sombre (hero, appel final). */
export const BOUTON_ACHAT_SOMBRE =
  "inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3.5 text-base font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-primary-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 sm:w-auto sm:px-8";

// ─── Petits éléments ─────────────────────────────────────────────────────────

export function Coche({ ton = "clair" }: { ton?: "clair" | "sombre" }) {
  return (
    <svg
      className={`mt-0.5 h-4 w-4 shrink-0 ${ton === "sombre" ? "text-emerald-400" : "text-gain"}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Tiret() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EnTeteBloc({
  surtitre,
  titre,
  sousTitre,
}: {
  surtitre?: string;
  titre: string;
  sousTitre?: React.ReactNode;
}) {
  return (
    <div className="mb-10 text-center">
      {surtitre && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-700">{surtitre}</p>
      )}
      <h2 className="text-balance text-2xl font-bold text-gray-900 md:text-3xl">{titre}</h2>
      {sousTitre && <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-gray-600">{sousTitre}</p>}
    </div>
  );
}

// ─── Chiffres clés (hero, fond sombre) ───────────────────────────────────────

export function ChiffresCles({ product }: { product: Product }) {
  if (!product.chiffresCles.length) return null;
  return (
    <div>
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
        {product.chiffresCles.map((c) => (
          <li key={c.libelle} className="bg-slate-950/90 px-4 py-5 text-center">
            <span className="block font-display text-2xl font-bold tabular-nums text-white md:text-3xl">
              {c.valeur}
            </span>
            <span className="mt-1 block text-xs leading-snug text-slate-400">{typo(c.libelle)}</span>
          </li>
        ))}
      </ul>
      {product.chiffresClesNote && (
        <p className="mt-3 text-center text-xs text-slate-500">{typo(product.chiffresClesNote)}</p>
      )}
    </div>
  );
}

// ─── Guide : feuilleter de vraies pages ──────────────────────────────────────

/**
 * Un extrait lisible en grand (rectangle contigu d'une page, le zoom ouvre la
 * page entière), puis les pages entières en grille. Le sommaire n'y est pas :
 * il est déjà sur la page en HTML.
 */
export function Feuilleter({ pages }: { pages: Capture[] }) {
  const extrait = pages.find((p) => p.extrait);
  const entieres = pages.filter((p) => !p.extrait && !p.horsFeuilleter);
  if (!extrait && !entieres.length) return null;
  return (
    <div className="mx-auto max-w-5xl">
      {extrait && (
        <figure className="mx-auto mb-12 max-w-3xl">
          <PageZoom page={extrait} sizes="(max-width: 768px) calc(100vw - 32px), 768px" />
          <figcaption className="mt-3 text-sm leading-snug text-gray-500">
            <span className="font-semibold tabular-nums text-gray-700">{extrait.repere}</span>
            {extrait.titre && <> · {typo(extrait.titre)}</>}
            <span className="text-gray-400"> · extrait, tel que dans le PDF</span>
          </figcaption>
        </figure>
      )}
      {entieres.length > 0 && (
        <>
          <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto overscroll-x-contain px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0">
            {entieres.map((p) => (
              <li key={p.src} className="w-[72%] shrink-0 snap-start sm:w-[280px] lg:w-auto">
                <figure>
                  <PageZoom
                    page={p}
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 280px, 320px"
                    className="card-hover"
                  />
                  <figcaption className="mt-3 text-xs leading-snug text-gray-500">
                    <span className="font-semibold tabular-nums text-gray-700">{p.repere}</span>
                    {p.titre && <> · {typo(p.titre)}</>}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p data-nosearch="" className="mt-2 text-xs text-gray-500 lg:hidden" aria-hidden>
            Faites glisser pour voir les autres pages.
          </p>
        </>
      )}
    </div>
  );
}

/** Une page (ou un extrait) du guide, cadrée, qui s'agrandit au clic. */
function PageZoom({ page, sizes, className = "" }: { page: Capture; sizes: string; className?: string }) {
  const cible = page.complete ?? page;
  return (
    <CaptureZoom
      src={cible.src}
      width={cible.width}
      height={cible.height}
      alt={cible.alt}
      type="page"
      libelle={`${page.titre ?? "page"} (${page.repere})`}
      cadre={`overflow-hidden rounded-[3px] bg-white shadow-card-lg ring-1 ring-slate-200 ${className}`}
    >
      <Image
        src={page.src}
        alt={page.alt}
        width={page.width}
        height={page.height}
        sizes={sizes}
        className="block h-auto w-full"
      />
    </CaptureZoom>
  );
}

// ─── Guide : le sommaire réel, fusionné avec `contents` ──────────────────────

const normaliser = (s: string) => s.replace(/\s+[·—–]\s+/g, " · ").trim().toLowerCase();

type Rangee = {
  titre: string;
  detail?: string;
  parties: NonNullable<Product["sommaire"]>;
  orpheline?: boolean;
};

/**
 * Une rangée par partie du sommaire, avec à gauche le résumé de la partie
 * (`contents`). Les parties consécutives sans résumé propre (« Les 7 erreurs
 * les plus chères », « Annexes ») forment une seule rangée, qui reçoit le
 * résumé restant (« Les 7 erreurs et les annexes ») : aucun texte de
 * `contents` ne disparaît, aucun n'est répété.
 */
export function Sommaire({ product }: { product: Product }) {
  const parties = product.sommaire ?? [];
  if (!parties.length) return null;

  const restants = [...product.contents];
  const rangees: Rangee[] = [];
  for (const partie of parties) {
    const i = restants.findIndex((c) => normaliser(c.title) === normaliser(partie.partie));
    if (i >= 0) {
      const [resume] = restants.splice(i, 1);
      rangees.push({ titre: partie.partie, detail: resume.detail, parties: [partie] });
      continue;
    }
    const derniere = rangees[rangees.length - 1];
    if (derniere?.orpheline) derniere.parties.push(partie);
    else rangees.push({ titre: partie.partie, parties: [partie], orpheline: true });
  }
  for (const r of rangees) {
    if (!r.orpheline) continue;
    const resume = restants.shift();
    if (resume) {
      r.titre = resume.title;
      r.detail = resume.detail;
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {rangees.map((r) => (
        <div key={r.titre} className="grid gap-4 border-t border-slate-200/70 py-6 md:grid-cols-[240px_1fr] md:gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{r.titre}</h3>
            {r.detail && <p className="mt-2 text-sm leading-relaxed text-gray-600">{typo(r.detail)}</p>}
          </div>
          <div>
            {r.parties.map((partie) => (
              <div key={partie.partie}>
                {(r.parties.length > 1 || partie.partie !== r.titre) && (
                  <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {partie.partie}
                  </p>
                )}
                <ol className="divide-y divide-slate-100">
                  {partie.entrees.map((e) => (
                    <li key={e.titre} className="grid grid-cols-[2rem_1fr_auto] gap-3 py-3">
                      <span className="text-sm font-semibold tabular-nums text-primary-700">{e.repere}</span>
                      <span className="min-w-0">
                        <span className="block font-display text-base font-semibold leading-snug text-gray-900">
                          {typo(e.titre)}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">{typo(e.resume)}</span>
                      </span>
                      <span className="text-sm tabular-nums text-gray-400">
                        <span className="sr-only">page </span>
                        {e.page}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Ce que vous obtenez / Pour qui ──────────────────────────────────────────

export function ListeFeatures({ features }: { features: string[] }) {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/70 bg-slate-50/60 p-6 shadow-card sm:p-8">
      <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700">
            <Coche />
            <span>{typo(f)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PourQui({ product }: { product: Product }) {
  return (
    <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
      <div className="card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">C&apos;est pour vous si</p>
        <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
          {product.forWho.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Coche />
              <span className="leading-relaxed">{typo(f)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Passez votre chemin si</p>
        <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
          {product.notForWho.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Tiret />
              <span className="leading-relaxed">{typo(f)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Comparatif « eux / nous » : tableau sur desktop, cartes sur mobile ──────

export function Comparatif({ comparison }: { comparison: NonNullable<Product["comparison"]> }) {
  const { intro, themLabel, usLabel, rows } = comparison;
  return (
    <div className="mx-auto max-w-4xl">
      <p className="mx-auto mb-8 max-w-2xl text-center leading-relaxed text-gray-600">{typo(intro)}</p>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-1/2 border-b border-slate-200 bg-white px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                {themLabel}
              </th>
              <th scope="col" className="w-1/2 border-b border-slate-950 bg-slate-950 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-primary-400" aria-hidden />
                  {usLabel}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.us} className="border-b border-slate-200/70 last:border-b-0">
                <td className="px-5 py-4 align-top leading-relaxed text-gray-500">
                  <span className="flex items-start gap-2.5">
                    <Tiret />
                    {typo(r.them)}
                  </span>
                </td>
                <td className="bg-slate-950/5 px-5 py-4 align-top leading-relaxed text-gray-800">
                  <span className="flex items-start gap-2.5">
                    <Coche />
                    {typo(r.us)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Sous 640 px : une seule carte, la légende une fois en tête, une
          rangée par point. data-nosearch : le tableau porte déjà ce texte
          pour la recherche interne. */}
      <div data-nosearch="" className="card overflow-hidden sm:hidden">
        <div className="grid grid-cols-2 border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider">
          <p className="px-4 py-2.5 text-gray-500">{themLabel}</p>
          <p className="bg-slate-950 px-4 py-2.5 text-white">{usLabel}</p>
        </div>
        <ul className="divide-y divide-slate-200/70">
          {rows.map((r) => (
            <li key={r.us} className="grid grid-cols-2 text-[13px] leading-snug">
              <p className="px-4 py-3 text-gray-500">{typo(r.them)}</p>
              <p className="bg-slate-950/5 px-4 py-3 text-gray-800">{typo(r.us)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Après le paiement ───────────────────────────────────────────────────────

/**
 * Comment les mises à jour arrivent, dit une fois et pareil pour les trois
 * ressources (CGV, article 6 : « Les mises à jour des fichiers sont
 * incluses ») : rien ne se met à jour tout seul, la nouvelle version est
 * envoyée sur demande.
 */
function texteMisesAJour(product?: Product): string {
  const commun = "Chaque nouvelle version, datée, vous est envoyée sur simple demande depuis votre email d'achat.";
  const cockpit = product?.deliverables.some((d) => d.sheetsCopy) ?? true;
  return cockpit
    ? `${commun} Pour le Cockpit DCA : le nouveau fichier Excel et un lien de copie Google Sheets à jour.`
    : commun;
}

export function ApresPaiement({ product }: { product?: Product }) {
  const cartes = [
    {
      Icone: Mail,
      titre: "Livraison immédiate",
      texte: `Lien de téléchargement sur la page de confirmation et par email. Liens valables ${DEFAULT_TTL_DAYS} jours, régénérés sur simple demande.`,
    },
    { Icone: Receipt, titre: "Facture automatique", texte: "Envoyée par email après le paiement." },
    {
      Icone: RotateCcw,
      titre: "Satisfait ou remboursé 14\u00a0jours",
      texte: "Un email à hello@dcatracker.fr suffit, sans justification à fournir.",
    },
    { Icone: RefreshCw, titre: "Mises à jour incluses", texte: typo(texteMisesAJour(product)) },
  ];

  return (
    <div data-nosearch="" className="mx-auto max-w-5xl">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cartes.map(({ Icone, titre, texte }) => (
          <li key={titre} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5">
            <Icone size={18} className="text-primary-700" aria-hidden />
            <p className="mt-3 text-sm font-bold text-gray-900">{titre}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{texte}</p>
          </li>
        ))}
      </ul>

      {product && (
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <p className="text-sm font-semibold text-gray-900">Vous recevez&nbsp;:</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {product.deliverables.map((d) => {
              const Icone = d.fileKey === "guide-pdf" ? FileText : Table2;
              return (
                <li
                  key={d.label}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-card"
                >
                  <Icone size={14} className="text-primary-700" aria-hidden />
                  {d.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-gray-500">
        Pas de compte à créer sur le site&nbsp;: le paiement se fait sur la page
        sécurisée de Stripe, qui vous demande votre email pour la livraison.
      </p>
      <PaymentBadge />
    </div>
  );
}

// ─── Méthode et auteur ───────────────────────────────────────────────────────

export function BlocAuteur({ product }: { product: Product }) {
  const annexeSources = product.sommaire
    ?.flatMap((p) => p.entrees)
    .find((e) => e.repere === "S");
  return (
    <div data-nosearch="" className="card mx-auto flex max-w-3xl flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
      <Image
        src="/team/mael-faleyras.jpg"
        alt="Maël Faleyras, fondateur de DCA Tracker"
        width={96}
        height={96}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-card"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Qui fait cette ressource</p>
        <p className="mt-2 font-semibold text-gray-900">Maël Faleyras</p>
        <p className="text-sm text-gray-500">Fondateur · Lille · investit en DCA depuis 2025</p>
        {product.dateVerification && annexeSources && (
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Chaque chiffre du guide renvoie à sa source, vérifiée au {product.dateVerification}&nbsp;:
            les sources et leurs dates de vérification sont réunies en annexe&nbsp;{annexeSources.repere},
            p.&nbsp;{annexeSources.page}.
          </p>
        )}
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
          <Link href="/a-propos" className="group text-primary-700 hover:text-primary-800">
            Qui fait DCA Tracker <span className="arrow-nudge">→</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Appel final (remplace le bandeau bleu) ──────────────────────────────────

export function AppelFinal({ product, available }: { product: Product; available: boolean }) {
  const separes = prixSepares(product);
  return (
    <div
      id="achat-final"
      className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-slate-950 px-5 py-10 ring-1 ring-primary-500/30 sm:px-12 sm:py-12"
    >
      <FondSombre maille={20} halos={false} />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64"
        style={{ backgroundImage: "radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%)" }}
      />
      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">{product.shortName}</h2>
          <p className="mt-2 leading-relaxed text-slate-300">
            <span className="font-semibold text-white tabular-nums">{euros(product.priceEur)}</span>
            {separes !== null && (
              <>
                {" "}au lieu de <s className="tabular-nums">{euros(separes)}</s> en achats séparés
              </>
            )}
            {" "}· paiement unique · satisfait ou remboursé 14&nbsp;jours
          </p>
          <div className="mt-6">
            <ProductBuyButton
              productId={product.id}
              priceEur={product.priceEur}
              available={available}
              ton="sombre"
              note={null}
              libelle={`Acheter ${nomAvecArticle(product)}`}
              className={BOUTON_ACHAT_SOMBRE}
            />
          </div>
        </div>
        <div
          aria-hidden
          className="relative hidden aspect-[16/11] w-[280px] overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 ring-1 ring-white/10 md:block"
        >
          <Vignette product={product} fond="sombre" />
        </div>
      </div>
    </div>
  );
}

// ─── FAQ (style /tarifs) ─────────────────────────────────────────────────────

export function Faq({ faq }: { faq: Product["faq"] }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Questions fréquentes</h2>
      <div className="space-y-4">
        {faq.map(({ q, a }) => (
          <details key={q} className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
              {typo(q)}
              <span aria-hidden className="shrink-0 text-gray-500 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="border-t border-gray-50 px-5 pb-4 pt-1 text-sm leading-relaxed text-gray-600">{typo(a)}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
