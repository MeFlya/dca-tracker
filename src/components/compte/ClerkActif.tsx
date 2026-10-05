"use client";

// Le seul <ClerkProvider> du site, chargé à la demande par IlotClerk.
//
// Il est monté À CÔTÉ du contenu, pas autour : le monter plus tard autour de
// l'en-tête et de la page les aurait démontés puis remontés (état perdu,
// effets et mesures d'audience rejoués). Le contenu lit donc l'état du compte
// dans etat-compte.ts, que PontClerk tient à jour, et les composants Clerk
// (menu du compte, connexion, inscription) sont rendus ici, par des portails,
// dans les emplacements que les pages réservent (EmplacementClerk). Rendus
// sous ce provider, ils en reçoivent le contexte comme avant.
//
// Un seul provider à la fois : @clerk/react lève une erreur s'il en trouve
// deux montés ensemble. D'où un îlot unique à la racine plutôt qu'un provider
// par groupe de routes plus un autre pour l'en-tête.

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ClerkProvider, SignIn, SignUp, UserButton, useClerk, useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { clerkAppearance, clerkLocalization } from "@/lib/clerk-appearance";
import {
  enregistrerClerk,
  publierEtatClerk,
  useWidgetsClerk,
  type WidgetClerk,
} from "./etat-compte";

export default function ClerkActif() {
  return (
    <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
      <PontClerk />
      <Widgets />
    </ClerkProvider>
  );
}

/** Recopie l'état de Clerk dans etat-compte.ts, une fois Clerk chargé. */
function PontClerk() {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();
  const plan = (user?.publicMetadata?.plan as string | undefined) ?? "free";

  useEffect(() => {
    // Tant que Clerk n'a pas répondu, on garde l'état lu dans le cookie : un
    // visiteur non connecté sur /sign-in voit « Connexion » dans l'en-tête dès
    // l'hydratation, il ne doit pas repasser par l'emplacement vide.
    if (!isLoaded) return;
    publierEtatClerk({ isLoaded: true, isSignedIn: Boolean(isSignedIn), plan });
    enregistrerClerk(clerk);
  }, [isLoaded, isSignedIn, plan, clerk]);

  return null;
}

function Widgets() {
  const widgets = useWidgetsClerk();
  return widgets.map(({ id, noeud, widget }) => createPortal(<Widget widget={widget} />, noeud, id));
}

function Widget({ widget }: { widget: WidgetClerk }) {
  switch (widget.type) {
    case "menu-compte":
      return <MenuCompte isPremium={widget.isPremium} />;
    case "sign-in":
      return (
        <SignIn signUpUrl={widget.signUpUrl} fallbackRedirectUrl={widget.fallbackRedirectUrl} />
      );
    case "sign-up":
      return (
        <SignUp signInUrl={widget.signInUrl} fallbackRedirectUrl={widget.fallbackRedirectUrl} />
      );
  }
}

/**
 * Avatar du compte, avec « Passer à Premium » dans son menu pour les comptes
 * gratuits : le bouton de l'en-tête n'a de place qu'à partir de xl (voir les
 * largeurs mesurées dans Header.tsx) ; dans le menu, l'offre reste accessible
 * à toutes les largeurs, téléphone compris.
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
