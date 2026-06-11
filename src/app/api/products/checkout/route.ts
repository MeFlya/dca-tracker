// Checkout Stripe pour les PRODUITS DIGITAUX (paiement unique).
//
// Différences volontaires avec le checkout abonnement (/api/stripe/checkout) :
// - mode: "payment" (one-time), pas de trial
// - PAS d'authentification requise : exiger un compte pour un PDF à 19 €
//   tuerait la conversion. Si l'utilisateur EST connecté (Clerk), on
//   réutilise son customer Stripe pour regrouper ses factures.
// - invoice_creation activé : Stripe génère et envoie la facture
//   automatiquement (obligation micro-entreprise — penser à configurer
//   SIREN + mention « TVA non applicable, art. 293 B du CGI » dans
//   Dashboard → Settings → Invoice template).
// - metadata.productId : utilisé par le webhook pour déclencher la
//   livraison par email (le webhook abo ignore ces sessions car elles
//   n'ont pas de session.subscription).

export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProduct, getProductPriceId } from "@/lib/products";
import { log } from "@/lib/logger";

export async function POST(req: Request) {
  const { productId } = (await req.json()) as { productId?: string };
  const product = productId ? getProduct(productId) : null;
  if (!product) {
    return NextResponse.json({ error: "Produit inconnu" }, { status: 400 });
  }

  const priceId = getProductPriceId(product);
  if (!priceId) {
    return NextResponse.json(
      { error: "Ce produit n'est pas encore disponible à l'achat." },
      { status: 409 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  // Customer existant si connecté (regroupe les factures), sinon checkout
  // invité — Stripe collecte l'email sur la page de paiement.
  let customerId: string | undefined;
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const priv = user?.privateMetadata as Record<string, unknown> | undefined;
      customerId = (priv?.stripeCustomerId as string) || undefined;
    }
  } catch {
    // Pas de session Clerk — checkout invité, comportement normal.
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(customerId ? { customer: customerId } : { customer_creation: "always" }),
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/produits/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/produits/${product.slug}`,
    metadata: { productId: product.id },
    invoice_creation: {
      enabled: true,
      invoice_data: { metadata: { productId: product.id } },
    },
    allow_promotion_codes: true,
    locale: "fr",
    // Information précontractuelle (art. L221-5 / L221-28 13° C. conso.) :
    // contenu numérique livré immédiatement → le paiement vaut demande
    // d'exécution immédiate et renonciation au droit de rétractation légal.
    // La garantie commerciale 14 jours (CGV) reste plus protectrice.
    custom_text: {
      submit: {
        message:
          "Produit numérique livré immédiatement par email : en payant, vous demandez l'exécution immédiate et renoncez à votre droit légal de rétractation (art. L221-28 du Code de la consommation). Vous restez couvert par notre garantie « satisfait ou remboursé » de 14 jours.",
      },
    },
  });

  log.event("products/checkout", "session_created", {
    productId: product.id,
    session: session.id,
    guest: !customerId,
  });

  return NextResponse.json({ url: session.url });
}
