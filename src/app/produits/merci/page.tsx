// Page de confirmation d'achat produit — /produits/merci?session_id=...
//
// Vérifie la session Stripe CÔTÉ SERVEUR (payment_status === "paid") avant
// d'afficher quoi que ce soit : impossible d'accéder aux liens en devinant
// l'URL. Les liens affichés sont les mêmes tokens signés que ceux envoyés
// par email (le webhook) — l'email reste le canal de référence (les gens
// ferment l'onglet).

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, Mail } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";
import { createDownloadToken } from "@/lib/download-token";
import { VisitTracker } from "@/components/analytics/VisitTracker";

export const metadata: Metadata = {
  title: "Merci pour votre achat — DCA Tracker",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function MerciPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let state:
    | { ok: true; productName: string; productId: string; email: string; links: { label: string; url: string }[] }
    | { ok: false } = { ok: false };

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const productId = session.metadata?.productId;
      const product = productId ? getProduct(productId) : null;
      const email = session.customer_details?.email ?? "";

      if (session.payment_status === "paid" && product) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";
        const sheetsUrl = process.env.GOOGLE_SHEETS_TEMPLATE_COPY_URL;
        const links = product.deliverables.flatMap((d) => {
          if (d.fileKey) {
            const token = createDownloadToken(d.fileKey, email);
            return [{ label: d.label, url: `${siteUrl}/api/products/download?token=${token}` }];
          }
          if (d.sheetsCopy && sheetsUrl) return [{ label: d.label, url: sheetsUrl }];
          return [];
        });
        state = { ok: true, productName: product.name, productId: product.id, email, links };
      }
    } catch {
      // session inconnue/invalide → état générique ci-dessous
    }
  }

  if (!state.ok) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Commande introuvable
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          Nous ne retrouvons pas cette session de paiement. Si vous venez
          d&apos;acheter, vérifiez votre boîte mail — vos liens de
          téléchargement y arrivent dans la minute. Sinon, écrivez-nous à{" "}
          <a href="mailto:hello@dcatracker.fr" className="text-primary-700 font-medium hover:underline">
            hello@dcatracker.fr
          </a>
          .
        </p>
        <Link href="/produits" className="btn-primary text-sm px-5 py-2.5 inline-flex">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <VisitTracker
        event={{ name: "product_purchase", props: { product_id: state.productId } }}
      />

      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={26} className="text-emerald-600" aria-hidden />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Merci pour votre achat 🎉
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>{state.productName}</strong> est à vous. Vos fichiers sont
          disponibles ci-dessous — et un email récapitulatif vient de partir
          {state.email ? ` à ${state.email}` : ""}.
        </p>
      </div>

      {/* Liens de téléchargement */}
      <div className="space-y-3 mb-8">
        {state.links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 card-hover"
          >
            <div className="shrink-0 w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700">
              <Download size={16} aria-hidden />
            </div>
            <span className="text-sm font-semibold text-gray-900">{l.label}</span>
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 mb-10">
        <div className="flex items-start gap-3">
          <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" aria-hidden />
          <p className="text-xs text-gray-600 leading-relaxed">
            Les liens de téléchargement sont valables 7 jours (régénérables en
            répondant à l&apos;email de livraison). Votre <strong>facture</strong>{" "}
            vous est envoyée séparément par Stripe. Un souci ?{" "}
            <a href="mailto:hello@dcatracker.fr" className="underline hover:text-gray-900">
              hello@dcatracker.fr
            </a>
          </p>
        </div>
      </div>

      {/* Upsell doux — l'acheteur d'un produit est le meilleur prospect du SaaS */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center">
        <p className="text-sm font-bold text-gray-900 mb-2">
          Envie d&apos;un suivi qui se remplit tout seul ?
        </p>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          L&apos;app DCA Tracker automatise ce que votre fichier fait à la
          main — suivi mensuel guidé, Monte Carlo, backtest sur données
          réelles, récap fiscal.
        </p>
        <Link href="/simulateur" className="btn-primary text-sm px-5 py-2.5 inline-flex">
          Essayer le simulateur (gratuit) →
        </Link>
      </div>
    </div>
  );
}
