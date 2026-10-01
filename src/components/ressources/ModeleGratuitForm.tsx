"use client";

// Formulaire du modèle de suivi PEA gratuit (/suivi-pea-excel).
//
// Même route que la cheat sheet (/api/subscribe), avec `ressource` : la liste
// d'inscrits et la désinscription sont les mêmes.
//
// 01/10/2026 : la phrase sous le bouton disait « Ensuite, des emails
// occasionnels » — l'inscription à la liste allait avec le fichier, sans
// choix possible (constat #19). Le fichier part maintenant sur simple demande ;
// les emails occasionnels sont une case à part, NON cochée par défaut, envoyée
// en `newsletter: true/false`. Plus un champ pot de miel (CHAMP_POT_DE_MIEL),
// hors écran, que seuls les robots remplissent.

import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { CHAMP_POT_DE_MIEL, MODELE_GRATUIT_SHEETS_COPIE } from "@/lib/ressources-gratuites";

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
  const [newsletter, setNewsletter] = useState(false);
  const champ = useRef<HTMLInputElement>(null);
  const piege = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({
          email,
          source,
          ressource: "modele-suivi-pea",
          newsletter,
          [CHAMP_POT_DE_MIEL]: piege.current?.value ?? "",
        }),
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
      <form onSubmit={envoyer} noValidate>
        <div className="flex flex-col gap-2 sm:flex-row">
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
        </div>
        <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-sm leading-snug text-gray-600">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            disabled={etat === "envoi"}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary-600"
          />
          <span>
            Recevoir aussi les emails occasionnels de DCA Tracker sur le suivi d&apos;un PEA
            (désinscription en un clic)
          </span>
        </label>
        {/* Pot de miel : invisible et hors tabulation pour une personne. */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
        >
          <label>
            Site web (laisser vide)
            <input ref={piege} type="text" name={CHAMP_POT_DE_MIEL} tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
      </form>
      {etat === "erreur" && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {erreur}
        </p>
      )}
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        {MODELE_GRATUIT_SHEETS_COPIE ? "Fichier Excel et copie Google Sheets" : "Fichier Excel"}, par
        email. Si la case n&apos;est pas cochée, votre adresse ne sert qu&apos;à cet envoi.{" "}
        <a href="/confidentialite" className="underline underline-offset-2 hover:text-gray-700">
          Confidentialité
        </a>
      </p>
    </div>
  );
}
