"use client";

// Mega-menu "Guides" intégré au Header.
//
// Pourquoi : avant ce composant, ~15 pages YMYL / outils étaient enterrées
// dans le footer uniquement (1 lien interne sortant → faible PageRank).
// Le mega-menu donne à chacune un 2e point d'entrée depuis le top du site,
// ce qui devrait débloquer une partie des 35 pages "détectée non indexée".
//
// Deux rendus :
//   - Desktop : trigger "Guides ▾" qui ouvre un dropdown 4 colonnes au hover/click.
//   - Mobile  : accordion plié dans le menu hamburger (tap pour expand).
//
// Accessibilité :
//   - Trigger : aria-expanded + aria-haspopup="true"
//   - Menu desktop : role="menu" + aria-labelledby
//   - Items : role="menuitem"
//   - Esc ferme et redonne le focus au trigger
//   - Click outside ferme (desktop)
//   - Tab quitte le menu naturellement

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data structure (source unique pour desktop ET mobile) ────────────────────

interface MenuItem {
  href: string;
  label: string;
  desc?: string;
  /** Mini badge à droite du label (ex: "Nouveau", "Premium"). */
  badge?: { text: string; tone: "new" | "premium" };
}

interface MenuColumn {
  title: string;
  items: MenuItem[];
}

const COLUMNS: MenuColumn[] = [
  {
    title: "Combien investir ?",
    items: [
      { href: "/investir-100-euros-mois-etf", label: "100 €/mois", desc: "Le démarrage à petit pas" },
      { href: "/investir-200-euros-mois-etf", label: "200 €/mois", desc: "Le point d'équilibre populaire" },
      { href: "/investir-300-euros-mois-etf", label: "300 €/mois", desc: "L'allure FIRE 20-25 ans" },
      { href: "/investir-500-euros-mois-etf", label: "500 €/mois", desc: "L'objectif intermédiaire" },
    ],
  },
  {
    title: "Comprendre",
    items: [
      { href: "/strategie-dca", label: "Stratégie DCA", desc: "La méthode du DCA expliquée" },
      { href: "/interets-composes", label: "Intérêts composés", desc: "Le moteur du long terme" },
      { href: "/pea-ou-cto", label: "PEA ou CTO ?", desc: "Le bon choix fiscal" },
      { href: "/methodologie", label: "Méthodologie", desc: "Nos formules + sources" },
    ],
  },
  {
    title: "Choisir un ETF",
    items: [
      {
        href: "/etf-msci-world",
        label: "ETF MSCI World",
        desc: "CW8, WPEA, DCAM — lequel choisir",
        badge: { text: "Top", tone: "new" },
      },
      { href: "/etf-sp500", label: "ETF S&P 500", desc: "ESE, PSP5 en PEA" },
      { href: "/etf-nasdaq", label: "ETF Nasdaq 100", desc: "PUST en PEA" },
      { href: "/meilleurs-etf-debutants", label: "Meilleurs ETF débutants", desc: "La sélection commentée" },
      { href: "/comparatif-etf", label: "Comparatifs ETF", desc: "CW8 vs WPEA, etc." },
    ],
  },
  {
    title: "Outils",
    items: [
      {
        href: "/backtest",
        label: "Backtest historique",
        desc: "DCA sur vraies données 2009-2026",
        badge: { text: "Nouveau", tone: "new" },
      },
      { href: "/allocation-portefeuille", label: "Allocation portefeuille", desc: "Pondérer plusieurs ETF" },
      { href: "/calculateur-fiscal-pea-cto", label: "Calculateur fiscal", desc: "PEA vs CTO chiffré" },
      { href: "/simulateur-retraite", label: "Simulateur retraite", desc: "Objectif FIRE" },
    ],
  },
];

const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: "/comparatif", label: "Comparatif brokers" },
  { href: "/glossaire", label: "Glossaire" },
  { href: "/a-propos", label: "Qui est derrière ?" },
];

// ─── Sub: badge ───────────────────────────────────────────────────────────────

function Badge({ badge }: { badge: NonNullable<MenuItem["badge"]> }) {
  const cls =
    badge.tone === "new"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-primary-100 text-primary-700 border-primary-200";
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border",
        cls,
      )}
    >
      {badge.text}
    </span>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

interface Props {
  /** Si true, rend l'accordion mobile au lieu du dropdown desktop. */
  mobile?: boolean;
  /** Callback à appeler quand l'utilisateur navigue (utile pour fermer le menu mobile parent). */
  onNavigate?: () => void;
}

export function GuidesMenu({ mobile = false, onNavigate }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Active state : surligne le trigger si on est sur une page du mega-menu
  const allHrefs = [
    ...COLUMNS.flatMap((c) => c.items.map((i) => i.href)),
    ...FOOTER_LINKS.map((f) => f.href),
  ];
  const isActive = allHrefs.some(
    (h) => pathname === h || pathname.startsWith(h + "/"),
  );

  // Ferme le menu sur changement de route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc ferme + retourne focus au trigger (desktop)
  useEffect(() => {
    if (!open || mobile) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mobile]);

  // Click outside ferme (desktop seulement — sur mobile l'accordion reste contrôlée par l'user)
  useEffect(() => {
    if (!open || mobile) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, mobile]);

  // ── Mobile : accordion ─────────────────────────────────────────────────────
  if (mobile) {
    return (
      <div className="border-b border-gray-100 last:border-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="guides-mobile-panel"
          className={cn(
            "flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "text-primary-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
          )}
        >
          <span>Guides</span>
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform",
              open ? "rotate-180 text-primary-600" : "text-gray-400",
            )}
            aria-hidden
          />
        </button>
        {open && (
          <div
            id="guides-mobile-panel"
            className="pl-3 pb-3 space-y-4 animate-slide-up"
          >
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 px-3">
                  {col.title}
                </p>
                <ul>
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          setOpen(false);
                          onNavigate?.();
                        }}
                        className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        <span>{item.label}</span>
                        {item.badge && <Badge badge={item.badge} />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3">
              <ul className="flex flex-wrap gap-3 px-3">
                {FOOTER_LINKS.map((f) => (
                  <li key={f.href}>
                    <Link
                      href={f.href}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline"
                    >
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop : trigger + dropdown ────────────────────────────────────────────
  return (
    <div
      className="relative"
      // Hover ouvre/ferme (delay micro pour éviter les flickers en hovering rapide)
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="guides-mega-menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            // Focus le premier item au prochain tick
            setTimeout(() => {
              const first = menuRef.current?.querySelector<HTMLAnchorElement>(
                "a[role='menuitem']",
              );
              first?.focus();
            }, 0);
          }
        }}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          isActive || open
            ? "bg-primary-50 text-primary-700"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
        )}
      >
        Guides
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform",
            open ? "rotate-180" : "",
          )}
          aria-hidden
        />
      </button>

      {open && (
        // Conteneur positionné avec un padding-top (pt-2) TRANSPARENT qui sert
        // de "pont" hoverable entre le trigger et la carte visuelle. Sans ce
        // pont (ex: avec mt-2), la souris traverse un gap vide de 8px → elle
        // sort du wrapper → onMouseLeave ferme le menu avant qu'elle n'atteigne
        // les items. Le pont garde la souris "dans" la zone hoverable.
        <div
          ref={menuRef}
          className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[min(900px,calc(100vw-2rem))]"
        >
          <div
            id="guides-mega-menu"
            role="menu"
            aria-label="Menu Guides"
            className="rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/[0.04] overflow-hidden animate-fade-in"
          >
            <div className="grid grid-cols-4 gap-1 p-4">
              {COLUMNS.map((col) => (
                <div key={col.title} className="px-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
                    {col.title}
                  </p>
                  <ul className="space-y-0.5">
                    {col.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          role="menuitem"
                          className="block px-2 py-1.5 rounded-lg hover:bg-primary-50/60 transition-colors group"
                        >
                          <p className="text-sm font-semibold text-gray-900 leading-tight flex items-center group-hover:text-primary-700 transition-colors">
                            {item.label}
                            {item.badge && <Badge badge={item.badge} />}
                          </p>
                          {item.desc && (
                            <p className="text-xs text-gray-500 leading-snug mt-0.5">
                              {item.desc}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer du mega-menu — liens secondaires */}
            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Aussi
              </span>
              {FOOTER_LINKS.map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  role="menuitem"
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
