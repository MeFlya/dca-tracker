import Link from "next/link";
import { preload } from "react-dom";
import { DANS_LA_VIDEO, VIDEO_ACCUEIL } from "@/lib/video-accueil";
import { runSimulation, formatEur } from "@/lib/simulator";
import { ETF_LIST, TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import { PRODUCTS } from "@/lib/products";
import { HeroVideoLecteur } from "./HeroVideoLecteur";

// Colonne de droite du bandeau d'accueil : la boucle de démonstration
// (décision du 04/10/2026, elle remplace HeroDemoCard, gardée dans le code).
//
// Composant SERVEUR : l'affiche est une vraie <img> dans le HTML, avec ses
// dimensions (aucun décalage de mise en page). Tout ce qui bouge (vidéo,
// bouton pause, fenêtre avec le son) est dans <HeroVideoLecteur />, qui reçoit
// l'affiche en enfant.

/**
 * Réglages de l'exemple montré par la vidéo : ceux du simulateur par défaut
 * (simulation-params.ts), frais de référence compris.
 */
const EXEMPLE = { monthlyAmount: 200, durationYears: 20, annualReturnPct: 7 };

/** Formate un pourcentage à la française : 0.38 → « 0,38 ». */
function pct(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

export function HeroVideo() {
  const { base } = runSimulation({
    ...EXEMPLE,
    annualFeesPct: TER_REFERENCE_SIMULATEUR,
  });
  const prixCockpit = PRODUCTS["template-suivi-dca"].priceEur;

  // Les chiffres gravés dans la vidéo sont-ils encore ceux du site ? Sinon la
  // vidéo est périmée : on ne la montre pas (aucun chiffre faux à l'écran),
  // sans pour autant bloquer le build du site entier. Le bandeau affiche une
  // carte statique calculée en direct, jusqu'au prochain rendu. (Pas
  // HeroDemoCard : importer ce composant client, même sans l'afficher,
  // ajoute son code au JavaScript de chaque visite de l'accueil.)
  const ecarts = [
    base.finalValue !== DANS_LA_VIDEO.montantFinal &&
      `montant final ${DANS_LA_VIDEO.montantFinal} € dans la vidéo, ${base.finalValue} € au simulateur`,
    TER_REFERENCE_SIMULATEUR !== DANS_LA_VIDEO.fraisPct &&
      `frais ${DANS_LA_VIDEO.fraisPct} % dans la vidéo, ${TER_REFERENCE_SIMULATEUR} % au simulateur`,
    ETF_LIST.length !== DANS_LA_VIDEO.nbEtf &&
      `${DANS_LA_VIDEO.nbEtf} ETF dans la vidéo, ${ETF_LIST.length} au comparateur`,
    prixCockpit !== DANS_LA_VIDEO.prixCockpit &&
      `Cockpit à ${DANS_LA_VIDEO.prixCockpit} € dans la vidéo, ${prixCockpit} € en vente`,
  ].filter(Boolean);
  if (ecarts.length > 0) {
    console.warn(
      `[vidéo d'accueil] PÉRIMÉE, carte de secours affichée à sa place : ${ecarts.join(" ; ")}. ` +
        "Refaire le rendu (video-accueil/), puis mettre à jour src/lib/video-accueil.ts.",
    );
    return <CarteDeSecours valeurFinale={base.finalValue} />;
  }

  // Ce que montre la boucle, avec les mots de l'image : « 7 %/an avant
  // frais » est l'hypothèse de marché, le montant est calculé frais de l'ETF
  // déduits. Le Cockpit est payant, la boucle le dit : le texte aussi.
  const description =
    `Démonstration de DCA Tracker : le simulateur (${formatEur(base.finalValue)} pour ` +
    `${EXEMPLE.monthlyAmount} €/mois pendant ${EXEMPLE.durationYears} ans, hypothèse de ` +
    `${EXEMPLE.annualReturnPct} %/an avant frais, frais de l'ETF CW8 (${pct(TER_REFERENCE_SIMULATEUR)} %/an) ` +
    `déduits, pas une prévision), le comparateur de ${ETF_LIST.length} ETF, puis le Cockpit DCA ` +
    `(${prixCockpit} €, paiement unique ; exemple pré-rempli).`;

  // Équivalent textuel de la version avec le son : musique et bruitages,
  // aucune voix, toute l'information est écrite à l'image.
  const descriptionAvecSon =
    `Vidéo sans commentaire parlé (musique seule). Elle montre le simulateur ` +
    `(${formatEur(base.finalValue)} pour ${EXEMPLE.monthlyAmount} €/mois pendant ` +
    `${EXEMPLE.durationYears} ans, frais de l'ETF CW8 (${pct(TER_REFERENCE_SIMULATEUR)} %/an) déduits, ` +
    `hypothèses avant frais, pas des prévisions), le comparateur de ${ETF_LIST.length} ETF et son ` +
    `filtre PEA, la liste des ETF éligibles au PEA, l'impôt sur les gains en PEA ou en ` +
    `compte-titres, le suivi dans un tableur (modèle gratuit, puis Cockpit DCA à ${prixCockpit} €, ` +
    `exemple pré-rempli), puis l'offre Premium. Pas un conseil en ` +
    `investissement ; investir comporte un risque de perte en capital.`;

  const { affiche, largeur, hauteur } = VIDEO_ACCUEIL.boucle;
  // Précharge dans le <head>, en priorité haute, SUR ORDINATEUR SEULEMENT :
  // c'est là que l'affiche est l'élément LCP. Sur téléphone elle est sous les
  // boutons, souvent sous la ligne de flottaison : la priorité haute y ferait
  // concurrence au CSS et aux polices, le navigateur la relève lui-même quand
  // l'image entre dans l'écran. (1024 px = le point « lg » de Tailwind, où le
  // bandeau passe sur deux colonnes.)
  preload(affiche, { as: "image", fetchPriority: "high", media: "(min-width: 1024px)" });

  return (
    <HeroVideoLecteur descriptionAvecSon={descriptionAvecSon}>
      {/* Pas de next/image : l'affiche doit rester identique au pixel près à
          la première image de la vidéo, sans recompression. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={affiche}
        width={largeur}
        height={hauteur}
        alt={description}
        decoding="async"
        className="absolute inset-0 block w-full h-full object-cover"
      />
    </HeroVideoLecteur>
  );
}

/** Remplace la vidéo quand elle est périmée : le même exemple, en texte. */
function CarteDeSecours({ valeurFinale }: { valeurFinale: number }) {
  const frais = pct(TER_REFERENCE_SIMULATEUR);
  return (
    <div className="relative w-full max-w-md lg:max-w-[480px] rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card-lg">
      <p className="text-sm text-gray-500">
        {EXEMPLE.monthlyAmount} €/mois pendant {EXEMPLE.durationYears} ans
      </p>
      <p className="mt-1 text-4xl font-bold tabular-nums text-gray-900">{formatEur(valeurFinale)}</p>
      <p className="mt-2 text-sm text-gray-500">
        Hypothèse de {EXEMPLE.annualReturnPct} %/an avant frais, frais de l&apos;ETF ({frais} %)
        déduits, pas une prévision.
      </p>
      <Link
        href={`/simulateur?monthly=${EXEMPLE.monthlyAmount}&years=${EXEMPLE.durationYears}&return=${EXEMPLE.annualReturnPct}&fees=${TER_REFERENCE_SIMULATEUR}`}
        className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-50 py-2.5 text-sm font-semibold text-primary-700 transition-colors duration-150 hover:bg-primary-100"
      >
        Tester avec mes chiffres <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
