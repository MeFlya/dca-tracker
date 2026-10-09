import { getProduct, type ProductId } from "@/lib/products";
import { LienRenvoiProduit } from "@/components/products/LienRenvoiProduit";

/**
 * Renvoi de fin d'article vers un produit en paiement unique.
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
 *
 * ─── Deux produits, depuis le 29/09/2026 ────────────────────────────────────
 *
 * Le composant ne savait renvoyer qu'au Cockpit : le guide « Démarrer le DCA
 * en France », mis en vente ce jour-là, n'était lié depuis aucune page de
 * contenu. La fin de phrase propre à chaque produit (ce qu'il est, son format)
 * vit désormais dans le champ `renvoi` de products.ts, à côté du prix.
 * `produit` vaut le Cockpit par défaut : les deux renvois existants rendent
 * le même texte qu'avant, mot pour mot (seule l'espace avant « € » est
 * devenue insécable, pour que le prix ne se coupe plus en fin de ligne).
 *
 * Une page = un produit au plus. Deux renvois sur la même page, c'est une
 * page de vente qui ne dit pas son nom.
 *
 * Exception datée du 09/10/2026 : les comparatifs ETF portent le renvoi du
 * guide ET, dans le bloc « Après le choix » (ETFComparisonPage.tsx), une
 * phrase sans bouton sur le Cockpit. L'appel principal de ce bloc est le
 * modèle gratuit ; le Cockpit n'y est qu'une mention secondaire, jamais un
 * second RenvoiProduit.
 */
export function RenvoiProduit({
  contexte,
  produit: produitId = "template-suivi-dca",
  className = "mt-12",
}: {
  contexte: string;
  produit?: ProductId;
  /**
   * Marges seulement. `mt-12` convient en fin d'article ; au milieu d'une
   * page, entre deux blocs qui n'ont pas de marge haute, passer plutôt une
   * marge basse.
   */
  className?: string;
}) {
  const produit = getProduct(produitId);
  if (!produit?.renvoi) return null;
  const { avantLien, lien, role, format } = produit.renvoi;

  return (
    <aside data-nosearch="" className={`${className} border-l-2 border-primary-200 pl-5 py-1`}>
      <p className="text-[15px] text-gray-600 leading-relaxed">
        {contexte}{" "}
        {avantLien && <>{avantLien}{" "}</>}
        <LienRenvoiProduit
          href={`/produits/${produit.slug}`}
          produitId={produit.id}
          className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 transition-colors"
        >
          {lien ?? produit.shortName}
        </LienRenvoiProduit>{" "}
        {role} — {produit.priceEur}&nbsp;€, paiement unique, {format}.
      </p>
    </aside>
  );
}
