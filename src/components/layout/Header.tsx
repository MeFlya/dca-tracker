"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/LogoMark";
import { UserButton, useUser } from "@clerk/nextjs";
import { GuidesMenu } from "@/components/layout/GuidesMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { BoutonRecherche, RechercheRacine } from "@/components/search/Recherche";

// Note : "Guides" est désormais un mega-menu géré par <GuidesMenu /> et n'est
// plus dans NAV_LINKS. Il est rendu explicitement entre "Comparer les ETF" et
// "Marchés" (desktop) et dans le menu hamburger (mobile).
const NAV_LINKS = [
  { href: "/simulateur",     label: "Simulateur" },
  { href: "/comparer-etf",   label: "Comparer les ETF" },
  { href: "/donnees-marche", label: "Marchés" },
  // Ajouté le 22/08/2026. Le Cockpit à 19 € n'avait AUCUN point d'entrée dans
  // le site : absent de l'en-tête, absent des 28 liens du pied de page, absent
  // de l'accueil. Le seul chemin passait par un bloc en bas de /tarifs intitulé
  // « Pas prêt pour un abonnement ? » — qui définit l'acheteur comme quelqu'un
  // qui a renoncé, et qui n'affiche pas le prix.
  //
  // C'est pourtant l'offre à la friction la plus faible du site : ni compte, ni
  // abonnement, ni carte enregistrée. Elle méritait mieux qu'un lien de repli.
  { href: "/produits",       label: "Ressources" },
  { href: "/tarifs",         label: "Tarifs" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const plan = (user?.publicMetadata?.plan as string | undefined) ?? "free";
  const isPremium = plan === "premium";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="DCATracker, retour à l'accueil"
          >
            <LogoMark size={28} />
            <span className="text-[15px] font-bold tracking-tight text-gray-900">
              DCA<span className="font-normal text-gray-500 ml-1">Tracker</span>
            </span>
          </Link>

          {/* Desktop nav.
              Ordre : Simulateur · Comparer ETF · Guides ▾ (mega-menu) · Marchés · Tarifs
              À partir de lg (1024 px) seulement. Mesuré le 28/09/2026 : logo,
              six entrées et Connexion/S'inscrire occupent 836 px ; entre 768 et
              1023 px la ligne débordait et « S'inscrire » sortait de l'écran.
              En dessous de lg : menu compact + loupe. */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
            {/* Simulateur + Comparer ETF (premiers items du NAV_LINKS) */}
            {NAV_LINKS.slice(0, 2).map((link) => (
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

            {/* Mega-menu Guides — injecté entre Comparer ETF et Marchés */}
            <GuidesMenu />

            {/* Marchés + Tarifs (derniers items du NAV_LINKS) */}
            {NAV_LINKS.slice(2).map((link) => (
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

          {/* Desktop : recherche + CTA + Auth.
              Recherche : loupe seule jusqu'à xl (la navigation occupe la
              place), champ avec raccourci clavier au-delà — sauf pour les
              connectés, qui gardent la loupe à toutes les largeurs.

              Largeurs mesurées le 28/09/2026 (Inter du build, HarfBuzz ;
              constat n° 16). Place disponible : 960 px à lg (1024), 1216 px
              dès xl (max-w-7xl moins lg:px-8, donc aussi à 1440). Logo 125 +
              navigation 594 = 718 ; loupe 35 ; champ large ~205 (kbd de
              largeur fixe) ; gap-3 = 12.
              - Déconnecté : 934 à lg, ~1105 à xl.
              - Connecté gratuit : le champ large + « Passer à Premium »
                faisaient 1278 à xl (deux lignes à toutes les largeurs) et 1120
                à lg (l'avatar sortait de l'écran). Avec la loupe : 1120 à xl ;
                sans « Passer à Premium » sous xl (l'offre reste dans « Tarifs »
                et dans le menu de l'avatar, voir MenuCompte) : 952 à lg.
              - Premium : 952 à lg comme à xl.
              Tout tient ; avec une barre de défilement classique (~15 px de
              moins), seul « Comparer les ETF » peut passer sur deux lignes à
              lg, rien ne déborde. */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <BoutonRecherche variante="icone" />
            ) : (
              <>
                <BoutonRecherche variante="icone" className="xl:hidden" />
                <BoutonRecherche variante="large" className="hidden xl:inline-flex" />
              </>
            )}
            {isLoaded && !isSignedIn && (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Connexion
                </Link>
                <Link href="/sign-up" className="btn-primary text-xs px-4 py-2">
                  S&apos;inscrire
                </Link>
              </>
            )}
            {isLoaded && isSignedIn && (
              <>
                <Link
                  href="/account"
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === "/account"
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  Dashboard
                </Link>
                {!isPremium && (
                  <Link
                    href="/tarifs"
                    className="hidden xl:inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Passer à Premium
                  </Link>
                )}
                <NotificationBell />
                <MenuCompte isPremium={isPremium} />
              </>
            )}
            {/* Placeholder anti-CLS pendant le chargement Clerk. w-44 ≈ largeur
                de l'état signed-out (Connexion + S'inscrire, ~170 px mesurés le
                28/09/2026) — le cas le plus fréquent sur les pages publiques.
                L'ancien w-24 était trop étroit et créait un shift visible à
                l'hydratation (AUDIT P4) ; w-48 était trop large d'une vingtaine
                de pixels, assez pour replier « Comparer les ETF » à 1024 px. */}
            {!isLoaded && <div className="w-44 h-8" />}
          </div>

          {/* Mobile : cloche notifications (si connecté) + hamburger */}
          <div className="lg:hidden flex items-center gap-1">
            <BoutonRecherche variante="icone" />
            {isLoaded && isSignedIn && <NotificationBell />}
            {/* Avatar Clerk : seul accès à la déconnexion et au compte. Il
                n'apparaissait qu'à partir de md, puis de lg — sur téléphone et
                tablette, un connecté ne pouvait pas se déconnecter
                (contre-vérification du 28/09/2026). */}
            {isLoaded && isSignedIn && <MenuCompte isPremium={isPremium} />}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu.
          Ordre identique au desktop : Simulateur · Comparer ETF · Guides ▸ (accordion) · Marchés · Tarifs */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-slide-up">
          {/* Simulateur + Comparer ETF */}
          {NAV_LINKS.slice(0, 2).map((link) => (
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

          {/* Accordion Guides — referme le menu mobile quand l'user navigue */}
          <GuidesMenu mobile onNavigate={() => setMobileOpen(false)} />

          {/* Marchés + Tarifs */}
          {NAV_LINKS.slice(2).map((link) => (
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
          <div className="pt-2 pb-1 space-y-2">
            {isLoaded && !isSignedIn && (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
            {isLoaded && isSignedIn && (
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
      <RechercheRacine />
    </header>
  );
}

/**
 * Avatar du compte, avec « Passer à Premium » dans son menu pour les comptes
 * gratuits : le bouton de l'en-tête n'a de place qu'à partir de xl (voir les
 * largeurs mesurées plus haut) ; dans le menu, l'offre reste accessible à
 * toutes les largeurs, téléphone compris.
 */
function MenuCompte({ isPremium }: { isPremium: boolean }) {
  return (
    <UserButton>
      {!isPremium && (
        <UserButton.MenuItems>
          <UserButton.Link
            label="Passer à Premium"
            labelIcon={<Sparkles size={14} aria-hidden />}
            href="/tarifs"
          />
        </UserButton.MenuItems>
      )}
    </UserButton>
  );
}
