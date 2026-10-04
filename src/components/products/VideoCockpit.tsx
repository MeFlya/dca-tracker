import { HeroVideoLecteur } from "@/components/home/HeroVideoLecteur";
import {
  ACHATS_EXEMPLE,
  cinqAnsExemple,
  DATE_CAPTURES,
  lignesExemple,
  PLAFOND_PEA,
  totauxExemple,
  versementExemple,
} from "@/lib/cockpit-exemple";
import { SOCIAL_CHARGES_RATE } from "@/lib/fiscal/pea-cto";
import type { Product } from "@/lib/products";
import { typo } from "@/lib/typo";
import { DANS_LA_VIDEO_COCKPIT, VIDEO_COCKPIT } from "@/lib/video-accueil";
import { ProductVisual } from "./visuels";

// Visuel du bandeau de /produits/template-suivi-dca : la boucle muette du
// Cockpit (décision du 04/10/2026, video-accueil/STORYBOARD-COCKPIT.md §6),
// À LA PLACE de la fenêtre statique « Versement du mois » : l'affiche est ce
// même onglet, recadré et annoté. L'onglet reste en statique, en entier, dans
// la visite (#visite).
//
// Composant SERVEUR, sur le modèle de home/HeroVideo.tsx : l'affiche est une
// vraie <img> dans le HTML ; la vidéo n'a aucune source dans le HTML, le
// lecteur (HeroVideoLecteur, variante « produit », sans version avec le son)
// la pose après le chargement de la page.
//
// N'affecte ni le bouton d'achat, ni le JSON-LD : `imagesDuProduit` lit
// `product.screenshots`, pas ce visuel.

const r1 = (x: number) => Math.round(x * 10) / 10;
const centimes = (x: number) => Math.round(x * 100) / 100;
const pct = (x: number) => r1(x * 100);

function eur(n: number) {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });
}

function dateFr(iso: string, mois: "long" | "2-digit") {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: mois === "long" ? "numeric" : "2-digit",
    month: mois,
    year: "numeric",
    timeZone: "UTC",
  });
}

/** « d'ETZ », « de PE500 ». */
const de = (ticker: string) => (/^[AEIOUYH]/i.test(ticker) ? `d'${ticker}` : `de ${ticker}`);

/**
 * Les chiffres gravés dans la vidéo sont-ils encore ceux du site ? Recalculés
 * depuis cockpit-exemple.ts (l'exemple du fichier livré), products.ts et le
 * barème fiscal. Renvoie la liste des écarts (vide : la vidéo est juste).
 */
function ecartsCockpit(product: Product): string[] {
  const v = DANS_LA_VIDEO_COCKPIT;
  const lignes = lignesExemple();
  const versement = versementExemple(v.versement);
  const totaux = totauxExemple();
  const frais = ACHATS_EXEMPLE.reduce((s, a) => s + a[4], 0);
  const complement = `${v.complement[0]} (${v.complement[1]})`;
  const ecarts: (string | false)[] = [
    product.priceEur !== v.prix && `prix ${v.prix} € dans la vidéo, ${product.priceEur} € en vente`,
    product.titreHero?.principal !== v.titre &&
      `titre « ${v.titre} » dans la vidéo, « ${product.titreHero?.principal} » sur la page`,
    product.titreHero?.complement !== complement &&
      `« ${complement} » dans la vidéo, « ${product.titreHero?.complement} » sur la page`,
    DATE_CAPTURES !== v.dateExemple && `exemple du ${v.dateExemple} dans la vidéo, du ${DATE_CAPTURES} dans le fichier`,
    lignes.map((l) => l.ticker).join() !== v.repartition.map((l) => l.ticker).join() &&
      `ETF ${v.repartition.map((l) => l.ticker).join(", ")} dans la vidéo, ${lignes.map((l) => l.ticker).join(", ")} dans l'exemple`,
    ...v.repartition.map((attendu) => {
      const l = lignes.find((x) => x.ticker === attendu.ticker);
      return (
        (!l || pct(l.poids) !== attendu.poids || pct(l.cible) !== attendu.cible) &&
        `${attendu.ticker} à ${attendu.poids} % (cible ${attendu.cible} %) dans la vidéo, ${
          l ? `${pct(l.poids)} % (cible ${pct(l.cible)} %)` : "absent"
        } dans l'exemple`
      );
    }),
    ...versement.lignes.map(
      (l) =>
        l.parts !== v.parts[l.ticker as keyof typeof v.parts] &&
        `${v.parts[l.ticker as keyof typeof v.parts]} parts ${de(l.ticker)} dans la vidéo, ${l.parts} dans l'exemple`,
    ),
    centimes(totaux.valeur) !== v.valeur && `valeur ${v.valeur} € dans la vidéo, ${centimes(totaux.valeur)} € dans l'exemple`,
    centimes(totaux.investi) !== v.totalVerse &&
      `total versé ${v.totalVerse} € dans la vidéo, ${centimes(totaux.investi)} € dans l'exemple`,
    centimes(frais) !== v.fraisCourtage && `frais ${v.fraisCourtage} € dans la vidéo, ${centimes(frais)} € dans l'exemple`,
    pct(SOCIAL_CHARGES_RATE) !== v.tauxSociauxPct &&
      `prélèvements sociaux ${v.tauxSociauxPct} % dans la vidéo, ${pct(SOCIAL_CHARGES_RATE)} % au barème`,
    pct(totaux.investi / PLAFOND_PEA) !== v.plafondUtilisePct &&
      `plafond utilisé ${v.plafondUtilisePct} % dans la vidéo, ${pct(totaux.investi / PLAFOND_PEA)} % dans l'exemple`,
    cinqAnsExemple() !== v.cap5ans && `cap des 5 ans au ${v.cap5ans} dans la vidéo, au ${cinqAnsExemple()} dans l'exemple`,
  ];
  return ecarts.filter((e): e is string => !!e);
}

export function VideoCockpit({ product, avecVisite }: { product: Product; avecVisite: boolean }) {
  const ecarts = ecartsCockpit(product);
  if (ecarts.length > 0) {
    // Vidéo périmée : on ne la montre pas (aucun chiffre faux à l'écran), sans
    // bloquer le build. La page garde son visuel d'avant la vidéo, inchangé.
    console.warn(
      `[vidéo du Cockpit] PÉRIMÉE, fenêtre statique « Versement du mois » affichée à sa place : ${ecarts.join(" ; ")}. ` +
        "Refaire le rendu (video-accueil/, npm run rendu -- cockpit), puis mettre à jour VIDEO_COCKPIT et DANS_LA_VIDEO_COCKPIT dans src/lib/video-accueil.ts.",
    );
    return <ProductVisual product={product} />;
  }

  // Texte accessible : ce que montre la boucle, plan par plan, avec les
  // chiffres RECALCULÉS (jamais écrits à la main). 300 € ne font pas
  // exactement 14 parts : le montant investi et le reliquat sont dits.
  const { boucle } = VIDEO_COCKPIT;
  const versement = versementExemple(DANS_LA_VIDEO_COCKPIT.versement);
  const achetes = versement.lignes.filter((l) => l.parts > 0);
  const sousCible = lignesExemple().filter((l) => l.ecart < 0);
  const ecart = (x: number) =>
    `${(x * 100).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "always" })} %`;
  const dateExemple = dateFr(DATE_CAPTURES, "long");

  const description =
    `Animation muette de ${boucle.dureeSecondes} secondes sur l'exemple pré-rempli du ${product.shortName} ` +
    `(achats fictifs, cours de clôture du ${dateExemple}), avec des extraits du fichier : ` +
    `la répartition par ETF face à l'allocation cible (${sousCible
      .map((l) => `${l.ticker} sous sa cible, écart de ${ecart(l.ecart)}`)
      .join(", ")}) ; ` +
    `le versement du mois, ${eur(DANS_LA_VIDEO_COCKPIT.versement)} à verser, répartis en parts entières : ` +
    `${achetes.map((l) => `${l.parts} parts ${de(l.ticker)} (${eur(centimes(l.arrondi))})`).join(", ")}, ` +
    `reliquat de ${eur(centimes(versement.reliquat))}, aucune part des autres ETF ; ` +
    `le tableau de bord (valeur du portefeuille, total versé, frais de courtage) ; ` +
    `l'onglet PEA (prélèvements sociaux, plafond de versements, cap des 5 ans au ${dateFr(cinqAnsExemple(), "2-digit")}) ; ` +
    `puis ${product.shortName}, ${eur(product.priceEur)}, paiement unique. ` +
    `Calcul sur l'allocation que vous fixez, pas un conseil.`;

  // Pas de preload() ici : l'indication passe dans les données de navigation
  // de Next, et chaque lien préchargé vers cette page téléchargeait l'affiche
  // (100 Ko, priorité haute) depuis d'autres pages. La balise <img> ci-dessous,
  // rendue côté serveur avec fetchPriority="high", est découverte tout aussi tôt.

  return (
    <figure>
      <HeroVideoLecteur sources={{ webm: boucle.webm, mp4: boucle.mp4 }} variante="produit">
        {/* Pas de next/image : l'affiche doit rester identique au pixel près à
            la première image de la vidéo, sans recompression. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={boucle.affiche}
          width={boucle.largeur}
          height={boucle.hauteur}
          alt={description}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 block h-full w-full object-cover"
        />
      </HeroVideoLecteur>
      <figcaption className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-slate-300">
        {typo(
          `Exemple pré-rempli (achats fictifs, cours réels du ${dateExemple}). ` +
            "Calcul sur l'allocation que vous fixez, pas un conseil.",
        )}
        {avecVisite && (
          <>
            {" "}
            <a
              href="#visite"
              className="whitespace-nowrap font-medium text-primary-300 underline-offset-4 transition-colors duration-150 hover:text-primary-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Voir les onglets du fichier <span aria-hidden>↓</span>
            </a>
          </>
        )}
      </figcaption>
    </figure>
  );
}
