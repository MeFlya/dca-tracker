"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/LogoMark";

const NAV_LINKS = [
  { href: "/simulateur",      label: "Simulateur" },
  { href: "/comparer-etf",   label: "Comparer les ETF" },
  { href: "/investir-en-etf", label: "Guides" },
  { href: "/donnees-marche", label: "Marchés" },
  { href: "/tarifs",          label: "Tarifs" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="DCA Tracker — accueil"
          >
            <LogoMark size={28} />
            <span className="text-[15px] font-bold tracking-tight text-gray-900">
              DCA<span className="font-normal text-gray-500 ml-1">Tracker</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/simulateur" className="btn-primary text-xs px-4 py-2">
              Démarrer la simulation
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <>
                <span className="block w-5 h-0.5 bg-current rotate-45 translate-y-1.5" />
                <span className="block w-5 h-0.5 bg-current -rotate-45" />
              </>
            ) : (
              <>
                <span className="block w-5 h-0.5 bg-current mb-1" />
                <span className="block w-5 h-0.5 bg-current mb-1" />
                <span className="block w-4 h-0.5 bg-current" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* Extra guide link visible on mobile */}
          <Link
            href="/pea-ou-cto"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            PEA ou CTO ?
          </Link>
          <div className="pt-2 pb-1">
            <Link
              href="/simulateur"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full justify-center"
            >
              Démarrer la simulation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
