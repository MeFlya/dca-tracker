import Link from "next/link";
import { getProduct } from "@/lib/products";

/**
 * Renvoi de fin d'article vers le Cockpit DCA.
 *
 * ─── Pourquoi ce composant existe ───────────────────────────────────────────
 *
 * Search Console, 90 jours : 253 clics sur le site entier, dont **zéro** sur la
 * page qui vend le produit, et 3 sur une page commerciale quelconque. Le
 * produit était en vente, visible, avec une page complète — et le seul chemin
 * qui y menait passait par la barre de navigation.
 *
 * On ne rate pas la conversion de visiteurs qu'on n'a jamais eus. Ce composant
 * est la réponse à ça : un renvoi dans le fil du texte, sur les pages qui
 * reçoivent réellement des clics.
 *
 * ─── Ce qu'il n'est pas ─────────────────────────────────────────────────────
 *
 * Pas une bannière. Une phrase, à l'endroit où le lecteur vient de finir de
 * lire — et elle doit parler de CE QU'IL VIENT DE LIRE, pas du produit. D'où
 * `contexte` : chaque page écrit sa propre accroche, et une page sans accroche
 * juste ne pose pas de renvoi.
 *
 * ⚠️ Le prix ne s'écrit pas à la main. Il vient de products.ts, qui est aussi
 * ce qui alimente la page de vente : si l'un bouge, l'autre suit. Six endroits
 * du site portent encore un « 19 € » en dur — ce composant n'en sera pas le
 * septième.
 *
 * ⚠️ Aucune recommandation personnalisée. On décrit ce que fait un fichier,
 * jamais ce que le lecteur devrait faire de son argent : le site n'a pas le
 * statut CIF, et cette limite tient aussi dans une phrase de vente.
 */
export function RenvoiProduit({ contexte }: { contexte: string }) {
  const produit = getProduct("template-suivi-dca");
  if (!produit) return null;

  return (
    <aside className="mt-12 border-l-2 border-primary-200 pl-5 py-1">
      <p className="text-[15px] text-gray-600 leading-relaxed">
        {contexte}{" "}
        <Link
          href={`/produits/${produit.slug}`}
          className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 transition-colors"
        >
          {produit.shortName}
        </Link>{" "}
        est le classeur qu&apos;on utilise pour ça — {produit.priceEur} €,
        paiement unique, Excel et Google&nbsp;Sheets.
      </p>
    </aside>
  );
}
