// Page de confirmation après clic sur le lien de désinscription.
//
// Volontairement sobre et sans tentative de rétention : proposer « êtes-vous
// sûr ? » à quelqu'un qui vient de cliquer pour partir est le meilleur moyen de
// le faire cliquer sur « spam » à la place. La désinscription est déjà
// enregistrée quand cette page s'affiche.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Désinscription — DCA Tracker",
  description: "Vous ne recevrez plus les emails de suivi de DCA Tracker.",
  robots: { index: false, follow: false },
};

export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ etat?: string }>;
}) {
  const { etat } = await searchParams;
  const ok = etat !== "invalid";

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-20">
      <div className="rounded-2xl border border-gray-100 bg-white p-8">
        {ok ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              C&apos;est fait.
            </h1>
            <p className="text-gray-600 leading-relaxed mb-4">
              Vous ne recevrez plus les emails de suivi mensuel, de relance ni
              d&apos;accompagnement. Ça prend effet immédiatement.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Continueront de vous parvenir uniquement les messages liés à votre
              compte ou à une commande : confirmation d&apos;abonnement, fin
              d&apos;essai avant prélèvement, livraison d&apos;un produit acheté.
              Ne pas vous prévenir d&apos;un prélèvement à venir serait pire
              qu&apos;un email de trop.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Ce lien n&apos;est pas valide
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              Il a pu être tronqué par votre logiciel de messagerie. Écrivez-moi
              à{" "}
              <a
                href="mailto:hello@dcatracker.fr?subject=D%C3%A9sinscription"
                className="text-primary-600 hover:underline font-medium"
              >
                hello@dcatracker.fr
              </a>{" "}
              et je vous retire de la liste à la main, sans discussion.
            </p>
          </>
        )}

        <div className="pt-5 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">
          <p>
            Si vous partez à cause de quelque chose qui n&apos;allait pas, un mot
            à{" "}
            <a
              href="mailto:hello@dcatracker.fr"
              className="text-primary-600 hover:underline"
            >
              hello@dcatracker.fr
            </a>{" "}
            m&apos;aiderait vraiment. Aucune obligation.
          </p>
          <p className="mt-4">
            <Link href="/" className="text-primary-600 hover:underline">
              Retour à l&apos;accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
