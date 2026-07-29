// Page de désinscription.
//
// ⚠️ CORRECTIF D'UN BUG RÉEL, repéré en production. La version précédente
// déduisait son état d'un paramètre `?etat=` posé par la route :
//
//     const ok = etat !== "invalid";
//
// Donc en l'ABSENCE de ce paramètre — visite directe, lien copié à moitié,
// paramètre supprimé par un client mail — la page affichait « C'est fait »
// alors que rien n'avait été fait. Un utilisateur croyait être désinscrit, les
// emails continuaient, et le clic suivant était « spam » : exactement la
// chaîne que ce chantier existait pour empêcher.
//
// Règle qui en découle, et qui vaut au-delà de cette page :
// AFFICHER UN SUCCÈS EXIGE LA PREUVE DU SUCCÈS. L'absence de preuve du
// contraire n'en est pas une.
//
// La page vérifie donc elle-même le token et distingue quatre états. Elle ne
// désinscrit pas au chargement : les scanners de liens des messageries
// d'entreprise suivent tous les liens d'un email, et un GET qui mute
// désinscrirait des gens qui n'ont jamais cliqué. Le bouton natif de Gmail
// (RFC 8058) couvre déjà le cas sans friction, en POST.

import type { Metadata } from "next";
import Link from "next/link";
import { verifyUnsubscribeToken } from "@/lib/email-preferences";

export const metadata: Metadata = {
  title: "Désinscription — DCA Tracker",
  description: "Gérer les emails que vous recevez de DCA Tracker.",
  robots: { index: false, follow: false },
};

const CONTACT = "hello@dcatracker.fr";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-20">
      <div className="rounded-2xl border border-gray-100 bg-white p-8">
        {children}
        <div className="mt-6 pt-5 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">
          <p>
            Un problème, ou une désinscription qui ne passe pas ? Écrivez à{" "}
            <a
              href={`mailto:${CONTACT}?subject=D%C3%A9sinscription`}
              className="text-primary-600 hover:underline font-medium"
            >
              {CONTACT}
            </a>{" "}
            et je vous retire de la liste à la main, sans discussion.
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

export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; fait?: string }>;
}) {
  const { token, fait } = await searchParams;

  // ─── Retour du formulaire de confirmation ─────────────────────────────────
  if (fait === "1") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">C&apos;est fait.</h1>
        <p className="text-gray-600 leading-relaxed mb-4">
          Vous ne recevrez plus les emails de suivi mensuel, de relance ni
          d&apos;accompagnement. Ça prend effet immédiatement.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Continueront de vous parvenir uniquement les messages liés à votre
          compte ou à une commande : confirmation d&apos;abonnement, fin
          d&apos;essai avant prélèvement, livraison d&apos;un produit acheté. Ne
          pas vous prévenir d&apos;un prélèvement à venir serait pire qu&apos;un
          email de trop.
        </p>
      </Shell>
    );
  }

  if (fait === "0") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Ça n&apos;a pas fonctionné
        </h1>
        <p className="text-gray-600 leading-relaxed">
          La désinscription n&apos;a pas pu être enregistrée — c&apos;est un
          problème de mon côté, pas du vôtre. Écrivez-moi à l&apos;adresse
          ci-dessous et je m&apos;en occupe manuellement.
        </p>
      </Shell>
    );
  }

  // ─── Aucun token ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Aucun lien de désinscription détecté
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Cette page se consulte depuis le lien en bas de l&apos;un de mes
          emails. Vous êtes probablement arrivé ici directement, ou le lien a
          été tronqué en chemin.{" "}
          <strong className="text-gray-900">Rien n&apos;a été modifié.</strong>
        </p>
      </Shell>
    );
  }

  // ─── Token présent mais invalide ──────────────────────────────────────────
  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Ce lien n&apos;est pas valide
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Il a pu être coupé par votre logiciel de messagerie ou modifié en
          route.{" "}
          <strong className="text-gray-900">
            Vous n&apos;êtes pas désinscrit
          </strong>{" "}
          — je préfère vous le dire plutôt que de vous laisser le croire.
        </p>
      </Shell>
    );
  }

  // ─── Token valide : on demande une confirmation ───────────────────────────
  return (
    <Shell>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Se désinscrire des emails
      </h1>
      <p className="text-gray-600 leading-relaxed mb-2">
        Confirmez pour ne plus recevoir le suivi mensuel, les relances et les
        emails d&apos;accompagnement à l&apos;adresse :
      </p>
      <p className="text-gray-900 font-medium mb-6 break-all">{email}</p>

      <form method="POST" action="/api/email/unsubscribe">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="via" value="form" />
        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          Confirmer la désinscription
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        Ce clic supplémentaire existe pour une raison précise : les logiciels de
        sécurité de certaines messageries ouvrent automatiquement tous les liens
        d&apos;un email. Sans confirmation, ils vous désinscriraient sans que
        vous ayez rien demandé.
      </p>
    </Shell>
  );
}
