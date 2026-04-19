"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface Props {
  userEmail: string;
}

export function DeleteAccountButton({ userEmail }: Props) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la suppression.");
        setDeleting(false);
        return;
      }
      // Sign out and redirect home
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez dans quelques secondes.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl border border-red-100 transition-colors"
      >
        <Trash2 size={14} />
        Supprimer mon compte
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-md animate-slide-up">
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Supprimer définitivement votre compte</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Action irréversible.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  Ce qui sera supprimé
                </p>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Votre compte et vos identifiants</li>
                  <li>Votre stratégie sauvegardée</li>
                  <li>Tout l&apos;historique de vos entrées mensuelles</li>
                  <li>Votre abonnement Premium (annulé immédiatement, sans remboursement au prorata)</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Pour confirmer, tapez votre adresse email dans le champ ci-dessous.
              </p>

              <div>
                <label htmlFor="confirm-email" className="block text-xs font-medium text-gray-500 mb-1.5">
                  Votre email : <span className="font-mono text-gray-700">{userEmail}</span>
                </label>
                <input
                  id="confirm-email"
                  type="email"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder={userEmail}
                  className="input-field w-full"
                  autoComplete="off"
                />
              </div>

              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  disabled={deleting}
                  className="btn-secondary flex-1 text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || confirmation.trim().toLowerCase() !== userEmail.toLowerCase()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Suppression…" : "Supprimer définitivement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
