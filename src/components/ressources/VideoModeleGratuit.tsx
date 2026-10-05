import { HeroVideoLecteur } from "@/components/home/HeroVideoLecteur";
import { ACHATS_EXEMPLE, lignesExemple } from "@/lib/cockpit-exemple";
import { MODELE_GRATUIT_SHEETS_COPIE } from "@/lib/ressources-gratuites";
import { typo } from "@/lib/typo";
import { DANS_LA_VIDEO_MODELE, VIDEO_MODELE } from "@/lib/video-accueil";

// Boucle muette du modèle gratuit, sur /suivi-pea-excel (décision du
// 04/10/2026, video-accueil/STORYBOARD-MODELE-GRATUIT.md §6 et §10) : dans
// l'encadré « Deux façons de faire », placée par la grille APRÈS le formulaire
// du haut (une colonne : formulaire, vidéo, Cockpit ; deux colonnes : en
// deuxième rangée, sur toute la largeur). Le formulaire ne bouge sur aucun
// format.
//
// Composant SERVEUR, sur le modèle de products/VideoCockpit.tsx : l'affiche
// est une vraie <img> dans le HTML ; la vidéo n'a aucune source dans le HTML,
// le lecteur (HeroVideoLecteur, variante « article », sans version avec le
// son) la pose après le chargement de la page, quand le cadre est visible.
//
// Sous le premier écran sur téléphone comme sur ordinateur (mesuré le
// 04/10/2026) : affiche en chargement différé, SANS fetchPriority="high" ni
// preload(), pour ne rien prendre au LCP (le texte de l'en-tête).
//
// Elle s'AJOUTE à la page, ne remplace aucun visuel : n'affecte ni le
// formulaire, ni le JSON-LD (les `images` de l'Article sont écrites dans
// page.tsx, pas lues ici).

const centimes = (x: number) => Math.round(x * 100) / 100;

function eur(n: number) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/**
 * Ce que montre la vidéo est-il encore vrai ? Recalculé depuis
 * cockpit-exemple.ts (l'exemple du fichier livré) et ressources-gratuites.ts.
 * Renvoie la liste des écarts (vide : la vidéo est juste).
 */
function ecartsModele(): string[] {
  const v = DANS_LA_VIDEO_MODELE;
  const lignes = lignesExemple();
  const ligneAchat = (a: readonly (string | number)[]) =>
    `${a[0]} ${a[1]} ${a[2]} ${eur(Number(a[3]))} ${eur(Number(a[4]))}`;
  const ecarts: (string | false)[] = [
    v.sheets &&
      !MODELE_GRATUIT_SHEETS_COPIE &&
      "« Excel + Google Sheets » dans la vidéo, mais plus de copie Google Sheets (MODELE_GRATUIT_SHEETS_COPIE vaut null)",
    ...v.journal.map((attendu, i) => {
      const a = ACHATS_EXEMPLE[i];
      const lu = a ? [a[0], a[1], a[2], centimes(a[3]), a[4]] : null;
      return (
        (!lu || ligneAchat(lu) !== ligneAchat(attendu)) &&
        `ligne ${i + 1} du journal « ${ligneAchat(attendu)} » dans la vidéo, ${lu ? `« ${ligneAchat(lu)} »` : "absente"} dans l'exemple`
      );
    }),
    lignes.map((l) => l.ticker).join() !== v.parEtf.map((l) => l.ticker).join() &&
      `ETF ${v.parEtf.map((l) => l.ticker).join(", ")} dans la vidéo, ${lignes.map((l) => l.ticker).join(", ")} dans l'exemple`,
    ...v.parEtf.map((attendu) => {
      const l = lignes.find((x) => x.ticker === attendu.ticker);
      const dit = (p: number, i: number, pru: number) => `${p} parts, ${eur(i)} investis, PRU ${eur(pru)}`;
      return (
        (!l || l.parts !== attendu.parts || centimes(l.investi) !== attendu.investi || centimes(l.pru) !== attendu.pru) &&
        `${attendu.ticker} : ${dit(attendu.parts, attendu.investi, attendu.pru)} dans la vidéo, ${
          l ? dit(l.parts, centimes(l.investi), centimes(l.pru)) : "absent"
        } dans l'exemple`
      );
    }),
  ];
  return ecarts.filter((e): e is string => !!e);
}

export function VideoModeleGratuit({ className }: { className?: string }) {
  const ecarts = ecartsModele();
  if (ecarts.length > 0) {
    // Vidéo périmée : on ne la montre pas (aucun chiffre ni promesse faux à
    // l'écran), sans bloquer le build. Elle ne remplaçait rien : la page
    // redevient celle d'avant la vidéo.
    console.warn(
      `[vidéo du modèle gratuit] PÉRIMÉE, retirée de /suivi-pea-excel : ${ecarts.join(" ; ")}. ` +
        "Refaire le rendu (video-accueil/, npm run rendu -- modele), puis mettre à jour VIDEO_MODELE et DANS_LA_VIDEO_MODELE dans src/lib/video-accueil.ts.",
    );
    return null;
  }

  // Texte accessible : ce que montre la boucle, plan par plan, avec les
  // chiffres RECALCULÉS (jamais écrits à la main).
  const { boucle } = VIDEO_MODELE;
  const pe500 = lignesExemple()[0];
  const description =
    `Animation muette de ${boucle.dureeSecondes} secondes sur l'exemple pré-rempli du modèle gratuit ` +
    "(achats fictifs, cours de clôture réels), avec des extraits du fichier : " +
    "« Combien vous a coûté chaque part ? », frais de courtage compris, ETF par ETF ; " +
    "l'onglet Transactions, une ligne par achat (date, ticker, parts, prix, frais), la colonne des frais entourée ; " +
    "l'onglet Par ETF, avec les parts détenues, le total investi et le PRU de chaque ETF : " +
    `${pe500.ticker}, ${pe500.parts} parts pour ${eur(pe500.investi)}, soit ${eur(pe500.pru)} la part, frais compris ; ` +
    "Excel ou Google Sheets, les mêmes formules de suivi dans les deux : le fichier Excel reste sur votre ordinateur, " +
    "ses cours se saisissent à la main ; la copie Google Sheets va dans votre Drive, ses cours sont automatiques " +
    "avec GOOGLEFINANCE, différés de 20 minutes au plus, tant que la colonne « Cours manuel » reste vide ; " +
    "puis Modèle de suivi PEA, Excel et Google Sheets, avec son mode d'emploi : gratuit, reçu par email.";

  return (
    <figure className={className}>
      <HeroVideoLecteur sources={{ webm: boucle.webm, mp4: boucle.mp4 }} variante="article">
        {/* Pas de next/image : l'affiche doit rester identique au pixel près à
            la première image de la vidéo, sans recompression. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={boucle.affiche}
          width={boucle.largeur}
          height={boucle.hauteur}
          alt={description}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 block h-full w-full object-cover"
        />
      </HeroVideoLecteur>
      {/* Sur deux colonnes, la vidéo passe sous le formulaire ET sous le
          Cockpit : la légende dit qu'elle montre le modèle gratuit. Pas de
          date de cours : la vidéo ne montre aucune valeur de marché. */}
      <figcaption className="mx-auto mt-3 max-w-[480px] text-center text-xs leading-relaxed text-gray-500">
        {typo(
          "Ce que contient le modèle gratuit : le journal des achats et la vue par ETF. " +
            "Exemple pré-rempli (achats fictifs, cours de clôture réels), à remplacer par vos données.",
        )}
      </figcaption>
    </figure>
  );
}
