"use client";

// Formulaire du modèle de suivi PEA gratuit (/suivi-pea-excel).
//
// Même route que la cheat sheet (/api/subscribe), avec `ressource` : l'email
// envoyé, la liste d'inscrits et la désinscription sont les mêmes. La phrase
// sous le bouton dit ce qui se passe ensuite — le fichier, puis des emails
// occasionnels — parce que c'est ce à quoi la personne consent.

import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { MODELE_GRATUIT_SHEETS_COPIE } from "@/lib/ressources-gratuites";

type Etat = "attente" | "envoi" | "envoye" | "erreur";

export function ModeleGratuitForm({
  source,
  id,
  className,
}: {
  /** Emplacement du formulaire dans la page (attribution). */
  source: string;
  /** Identifiant unique du champ email, s'il y a plusieurs formulaires. */
  id: string;
  className?: string;
}) {
  const [etat, setEtat] = useState<Etat>("attente");
  const [erreur, setErreur] = useState("");
  const champ = useRef<HTMLInputElement>(null);

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = champ.current?.value.trim() ?? "";
    if (!email || etat === "envoi") return;
    setEtat("envoi");
    setErreur("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, ressource: "modele-suivi-pea" }),
      });
      const data: { success?: boolean; error?: string } = await res.json();
      if (!res.ok || !data.success) {
        setErreur(data.error ?? "Une erreur est survenue. Réessayez.");
        setEtat("erreur");
        return;
      }
      setEtat("envoye");
      track({ name: "email_signup", props: { source } });
    } catch {
      setErreur("Impossible de se connecter. Réessayez dans un instant.");
      setEtat("erreur");
    }
  }

  if (etat === "envoye") {
    return (
      <div
        role="status"
        className={cn("rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm", className)}
      >
        <p className="font-semibold text-emerald-900">C&apos;est parti&nbsp;: vérifiez votre boîte mail.</p>
        <p className="mt-0.5 text-emerald-800">
          Le lien arrive dans les deux minutes. Pas reçu&nbsp;? Regardez dans les spams ou l&apos;onglet «&nbsp;Promotions&nbsp;».
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={envoyer} noValidate className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={id} className="sr-only">
          Votre adresse email
        </label>
        <input
          ref={champ}
          id={id}
          type="email"
          required
          autoComplete="email"
          placeholder="votre@email.fr"
          disabled={etat === "envoi"}
          className="input-field flex-1 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={etat === "envoi"}
          className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {etat === "envoi" ? "Envoi…" : "Recevoir le modèle"}
        </button>
      </form>
      {etat === "erreur" && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {erreur}
        </p>
      )}
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        {MODELE_GRATUIT_SHEETS_COPIE ? "Fichier Excel et copie Google Sheets" : "Fichier Excel"}, par
        email. Ensuite, des emails occasionnels sur le suivi d&apos;un PEA&nbsp;; désinscription en
        un clic.{" "}
        <a href="/confidentialite" className="underline underline-offset-2 hover:text-gray-700">
          Confidentialité
        </a>
      </p>
    </div>
  );
}
