// Boucle muette de la page du Cockpit DCA (/produits/template-suivi-dca) :
// 1080×1080, 30 i/s, 570 images (19 s). Scénario, sources de chaque texte et
// règles d'honnêteté : STORYBOARD-COCKPIT.md.
//
// Même mécanique que la boucle d'accueil (src/boucle/Boucle.tsx, non modifiée) :
//   - le SCÉNARIO (540 images, numéros du storyboard : P1 à P6), dans lequel
//     sont écrits tous les numéros d'image de ce fichier ;
//   - le FICHIER rendu (570 images) : le scénario, avec un arrêt de 30 images
//     sur l'état final du versement du mois, et qui COMMENCE sur cet arrêt.
// L'image 0 du fichier (scénario 255) est l'affiche : « Où verser ce mois-ci »,
// la fenêtre du classeur, la ligne d'ETZ surlignée, l'anneau sur « 14 », la
// réponse en grand (« → 14 parts d'ETZ ») et les deux mentions.
// La dernière image (569) est le scénario 254 : tout est immobile de 240
// (réponse posée) à 269, les deux images sont identiques (vérifié par
// scripts/rendre.mjs).
//
// Aucun chiffre n'est écrit ici : les montants et pourcentages de l'exemple
// sont les pixels des captures (même empreinte que public/produits/, vérifiée
// par scripts/extraire-donnees.mjs, qui recalcule aussi l'exemple avec le code
// du site) ; le prix, la date de l'exemple et les phrases reprises de la fiche
// viennent de donnees.json.

import React from "react";
import { AbsoluteFill, Freeze, Img, staticFile, useCurrentFrame } from "remotion";
import { C, EASE, INTER, OMBRE_CARTE, prog } from "../charte";
import { Fond } from "../composants/Fond";
import { LogoMarkAnime } from "../composants/Logo";
import type { Rect, Zone } from "../composants/Capture";
import { Morceaux, type Morceau } from "../composants/Morceaux";
import { Anneau, Bande } from "../composants/Accents";
import { Pastille, Revele, styleMention, styleSousTitre, styleTitre } from "../composants/Texte";
import { BARRE_FENETRE, CAPTURES_COCKPIT, FICHIER_CLASSEUR, ONGLET_PEA, REPARTITION, TABLEAU_DE_BORD, VERSEMENT } from "../zones-cockpit";
import donnees from "../donnees.json";

/** Durée du scénario (storyboard). */
const SCENARIO = 540;
/** Arrêt sur image : à l'image `a` du scénario, l'image est tenue `duree` images. */
const ARRETS = [{ a: 255, duree: 30 }] as const;
/** Position, dans le scénario rallongé de l'arrêt, de l'image 0 du fichier. */
const DEPART = 255;

export const BOUCLE_COCKPIT = {
  largeur: 1080,
  hauteur: 1080,
  fps: 30,
  duree: SCENARIO + ARRETS.reduce((s, x) => s + x.duree, 0),
};

/** Image du fichier → image du scénario. */
export function imageScenarioCockpit(f: number): number {
  let x = (((f + DEPART) % BOUCLE_COCKPIT.duree) + BOUCLE_COCKPIT.duree) % BOUCLE_COCKPIT.duree;
  for (const { a, duree } of ARRETS) {
    if (x < a) return x;
    if (x < a + duree) return a;
    x -= duree;
  }
  return x;
}

const M = 80; // marge de sécurité
const L = BOUCLE_COCKPIT.largeur;
const LIGNE_MENTION = Math.round(34 * 1.35); // interligne de styleMention(34)
const D = donnees.cockpitBoucle;
const SLATE_500 = "#64748b"; // text-slate-500 de la barre de fenêtre (visuels.tsx)
const SLATE_50 = "#f8fafc";
const RAYON_FENETRE = 16; // rayon de la fenêtre de P3 (rayonPng 16 à l'échelle 1, comme B4)

// ─── Pièces partagées par P2, P4 et P5 ───────────────────────────────────────

/** Un rectangle d'une capture, à l'échelle k, posé en (left, top). Rien n'est redessiné. */
const Extrait: React.FC<{ fichier: string; l: number; h: number; de: Zone; k: number; left: number; top: number; style?: React.CSSProperties }> = ({
  fichier,
  l,
  h,
  de,
  k,
  left,
  top,
  style,
}) => {
  const [x1, y1, x2, y2] = de;
  return (
    <div style={{ position: "absolute", left, top, width: (x2 - x1) * k, height: (y2 - y1) * k, overflow: "hidden", ...style }}>
      <Img src={staticFile(`captures/${fichier}`)} style={{ position: "absolute", left: -x1 * k, top: -y1 * k, width: l * k, height: h * k, maxWidth: "none" }} />
    </div>
  );
};

/** Zone du PNG d'origine → position dans une recomposition (morceaux posés à l'échelle k). */
function versRecomposition(morceaux: Morceau[], k: number, dx = 0, dy = 0) {
  return (zone: Zone): Rect => {
    const cx = (zone[0] + zone[2]) / 2;
    const cy = (zone[1] + zone[3]) / 2;
    const m = morceaux.find((p) => cx >= p.de[0] && cx <= p.de[2] && cy >= p.de[1] && cy <= p.de[3]);
    if (!m) throw new Error(`BoucleCockpit : la zone [${zone.join(", ")}] n'est dans aucun morceau`);
    return {
      left: dx + (m.x + zone[0] - m.de[0]) * k,
      top: dy + (m.y + zone[1] - m.de[1]) * k,
      width: (zone[2] - zone[0]) * k,
      height: (zone[3] - zone[1]) * k,
    };
  };
}

/**
 * Fenêtre du classeur : barre de `Fenetre` (visuels.tsx du site), à la taille
 * de celle que montre la capture de P3, puis le contenu sur fond blanc. Même
 * halo, même ombre, mêmes coins que la fenêtre de P3 (<Morceaux>). Les
 * accents (anneaux) sont posés au-dessus, hors du cadre qui coupe le contenu,
 * pour que leur halo ne soit pas rogné. Leur origine est le haut du contenu.
 */
const FenetreClasseur: React.FC<{
  onglet: string;
  largeur: number;
  hauteurContenu: number;
  style?: React.CSSProperties;
  contenu: React.ReactNode;
  accents?: React.ReactNode;
}> = ({ onglet, largeur, hauteurContenu, style, contenu, accents }) => {
  const hBarre = BARRE_FENETRE.hauteur + BARRE_FENETRE.filet;
  const hauteur = hBarre + hauteurContenu;
  return (
    <div style={{ position: "absolute", width: largeur, height: hauteur, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: -14,
          borderRadius: RAYON_FENETRE * 1.5,
          background: "linear-gradient(to bottom right, rgba(59,130,246,0.30), rgba(129,140,248,0.20), rgba(56,189,248,0.20))",
          filter: "blur(40px)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, borderRadius: RAYON_FENETRE, overflow: "hidden", background: C.blanc, boxShadow: OMBRE_CARTE }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: largeur,
            height: BARRE_FENETRE.hauteur,
            background: SLATE_50,
            borderBottom: `${BARRE_FENETRE.filet}px solid ${C.slate200}`,
            boxSizing: "content-box",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ position: "absolute", left: BARRE_FENETRE.pastilles + 32 * i, top: BARRE_FENETRE.hauteur / 2 - 10, width: 20, height: 20, borderRadius: 10, background: C.slate300 }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: BARRE_FENETRE.texte,
              top: 0,
              height: BARRE_FENETRE.hauteur,
              display: "flex",
              alignItems: "center",
              fontFamily: INTER,
              fontWeight: 500,
              fontSize: BARRE_FENETRE.taille,
              color: SLATE_500,
              whiteSpace: "nowrap",
            }}
          >
            {FICHIER_CLASSEUR}
            <span style={{ color: C.slate400 }}>&nbsp;·&nbsp;{onglet}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, top: hBarre, width: largeur, height: hauteurContenu }}>{contenu}</div>
      </div>
      {accents ? <div style={{ position: "absolute", left: 0, top: hBarre, width: largeur, height: hauteurContenu }}>{accents}</div> : null}
    </div>
  );
};

/** Entrée d'une fenêtre (P2, P4, P5) : opacité sur 10 images, montée de 90 px en ease-out-expo. */
const entreeFenetre = (f: number, debut: number): React.CSSProperties => ({
  opacity: prog(f, debut, debut + 10),
  transform: `translateY(${(1 - prog(f, debut, debut + 26, EASE.expo)) * 90}px)`,
});

/** Sortie glissée (P2, P4, P5) : −80 px et fondu. */
const sortieGlissee = (f: number, debut: number): React.CSSProperties => {
  const s = prog(f, debut, debut + 14, EASE.inOut);
  return { transform: `translateX(${-80 * s}px)`, opacity: 1 - s };
};

const Titre: React.FC<{ debut: number; children: React.ReactNode }> = ({ debut, children }) => (
  <Revele debut={debut} flou={6} style={{ left: M, top: 92 }}>
    <h2 style={{ ...styleTitre(84), whiteSpace: "nowrap" }}>{children}</h2>
  </Revele>
);

const SousTitre: React.FC<{ debut: number; taille: number; top?: number; children: React.ReactNode }> = ({ debut, taille, top = 200, children }) => (
  <Revele debut={debut} style={{ left: M, top, width: L - 2 * M }}>
    <p style={{ ...styleSousTitre(taille), margin: 0 }}>{children}</p>
  </Revele>
);

const Mention: React.FC<{ debut: number; top: number; children: React.ReactNode }> = ({ debut, top, children }) => (
  <Revele debut={debut} style={{ left: M, top, width: L - 2 * M }}>
    <p style={{ ...styleMention(34), margin: 0, whiteSpace: "nowrap" }}>{children}</p>
  </Revele>
);

// ─── P1 : la question (0 → 74) ───────────────────────────────────────────────
// Sources : abstract[1] (« il vous dit où verser : combien de parts de chaque
// ETF acheter »). Pas « Combien investir ce mois-ci ? » : le Cockpit ne décide
// pas du montant, c'est vous qui le saisissez. Pas non plus « quel ETF
// acheter ? » (première version) : c'est la question de conseil que le site
// refuse ailleurs, et le Cockpit ne choisit aucun ETF, il répartit votre
// versement entre VOS ETF.
//
// Reprise P6 → P1 : la question commence AVANT la fin du scénario (t0 = −6,
// soit l'image 534) et se superpose aux dernières images de la fin, qui
// s'éteint de 524 à 536. Elle est donc rendue deux fois : t0 = −6 au début du
// scénario, t0 = 534 à sa fin (mêmes états de part et d'autre de 539 → 0).
// Il reste 5 images sombres, comme entre les autres plans (5 au plus à
// l'accueil) ; il y en avait 13.
const Question: React.FC<{ t0: number }> = ({ t0 }) => (
  <>
    <Revele debut={t0} sortie={t0 + 68} flou={6} style={{ left: M, width: L - 2 * M, top: 310, textAlign: "center" }}>
      <h1 style={styleTitre(88)}>
        Ce mois-ci, où va
        <br />
        votre versement&nbsp;?
      </h1>
    </Revele>
    <Revele debut={t0 + 8} sortie={t0 + 68} style={{ left: M, width: L - 2 * M, top: 550, textAlign: "center" }}>
      <p style={{ ...styleSousTitre(40), margin: 0 }}>Et combien de parts de chaque ETF&nbsp;?</p>
    </Revele>
  </>
);

// ─── P2 : la répartition face à la cible (70 → 164) ──────────────────────────
const P2 = (() => {
  const { k, largeurPng, hauteurPng, morceaux } = REPARTITION;
  const largeur = 920;
  const dx = (largeur - largeurPng * k) / 2; // 32 px de chaque côté
  const dy = 24;
  const hauteurContenu = Math.round(dy + hauteurPng * k + dy);
  const y = 340;
  return { k, largeur, dx, dy, hauteurContenu, y, bas: y + BARRE_FENETRE.hauteur + BARRE_FENETRE.filet + hauteurContenu, morceaux };
})();

const Repartition: React.FC<{ f: number }> = ({ f }) => {
  const c = CAPTURES_COCKPIT.dashboard;
  const z = versRecomposition(P2.morceaux, P2.k, P2.dx, P2.dy);
  const ligne = REPARTITION.ligneEtz;
  // La ligne d'ETZ traverse les trois morceaux : la bande va d'un bord à l'autre du tableau.
  const bande: Rect = { left: P2.dx, top: P2.dy + (ligne.y1 - 797) * P2.k, width: REPARTITION.largeurPng * P2.k, height: (ligne.y2 - ligne.y1) * P2.k };
  return (
    <AbsoluteFill style={sortieGlissee(f, 150)}>
      <Titre debut={72}>Votre répartition</Titre>
      <SousTitre debut={76} taille={40}>
        Poids réel, cible et écart, ETF par ETF
      </SousTitre>
      <FenetreClasseur
        onglet="Dashboard"
        largeur={P2.largeur}
        hauteurContenu={P2.hauteurContenu}
        style={{ left: (L - P2.largeur) / 2, top: P2.y, ...entreeFenetre(f, 74) }}
        contenu={P2.morceaux.map((m, i) => (
          <Extrait key={i} {...c} de={m.de} k={P2.k} left={P2.dx + m.x * P2.k} top={P2.dy + m.y * P2.k} />
        ))}
        accents={
          <>
            <Bande rect={bande} debut={100} repos={0.55} marge={0} rayon={6} />
            <Anneau rect={z(REPARTITION.ecartEtz)} debut={108} couleur={C.bleu} epaisseur={4} marge={8} rayon={12} />
          </>
        }
      />
      {/* La mention arrive avec la fenêtre : aucun chiffre sans elle. */}
      <Mention debut={74} top={P2.bas + 36}>
        Exemple pré-rempli, extraits du fichier&nbsp;:
      </Mention>
      <Mention debut={76} top={P2.bas + 36 + LIGNE_MENTION}>
        achats fictifs, cours du {D.dateExemple}
      </Mention>
    </AbsoluteFill>
  );
};

// ─── P3 : le versement du mois, l'AFFICHE (160 → 284) ────────────────────────
const FEN_Y = 284;
const basVersement = FEN_Y + VERSEMENT.hauteurPng;
/** Ligne de réponse sous la fenêtre (Inter 60, interligne 1,2). */
const REPONSE = { taille: 60, top: basVersement + 26 };
const basReponse = REPONSE.top + Math.round(REPONSE.taille * 1.2);

/** Rectangle de la ligne d'ETZ dans la recomposition (deux morceaux). */
function ligneEtz(z: (zone: Zone) => Rect): Rect {
  const a = z(VERSEMENT.ligneEtzEtf);
  const b = z(VERSEMENT.ligneEtzParts);
  return { left: a.left, top: a.top, width: b.left + b.width - a.left, height: a.height };
}

const Versement: React.FC<{ f: number }> = ({ f }) => {
  const sortie = prog(f, 270, 284, EASE.inOut);
  const entree = prog(f, 164, 190, EASE.expo);
  // Le calcul apparaît : un cache blanc (le fond des lignes) couvre les valeurs
  // des deux colonnes vertes et se retire de haut en bas. On découvre les
  // pixels de la capture, rien n'est redessiné.
  const decouvert = prog(f, 208, 226, EASE.quart);
  const [cx1, cy1, cx2, cy2] = VERSEMENT.valeurs;
  const hautCache = cy1 + (cy2 - cy1) * decouvert;
  return (
    <AbsoluteFill style={{ opacity: 1 - sortie, transform: `scale(${1 - 0.08 * sortie})` }}>
      <Titre debut={162}>Où verser ce mois-ci</Titre>
      <SousTitre debut={166} taille={38}>
        En parts entières, vers votre allocation cible
      </SousTitre>
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <Morceaux
          {...CAPTURES_COCKPIT.versement}
          morceaux={VERSEMENT.morceaux}
          largeurPng={VERSEMENT.largeurPng}
          hauteurPng={VERSEMENT.hauteurPng}
          largeur={VERSEMENT.largeurPng}
          rayonPng={RAYON_FENETRE}
          style={{
            left: M,
            top: FEN_Y,
            opacity: prog(f, 164, 175),
            transform: `translateY(${(1 - entree) * 90}px) rotateX(${8 * (1 - entree)}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          {(z) => (
            <>
              {/* La ligne d'ETZ, d'un bord à l'autre du tableau (même réglage
                  que la bande de P2), sous le cache : elle se découvre avec
                  les valeurs. */}
              <Bande rect={ligneEtz(z)} debut={218} repos={0.55} marge={0} rayon={6} />
              {hautCache < cy2 ? <div style={{ position: "absolute", ...z([cx1, hautCache, cx2, cy2]), background: C.blanc }} /> : null}
              {/* Le montant saisi : entouré le temps de la saisie, puis l'anneau
                  s'efface pour que la réponse (le « 14 ») soit le seul point
                  d'attention de l'affiche. */}
              <Anneau rect={z(VERSEMENT.montant)} debut={196} fin={216} couleur={C.bleu} epaisseur={4} marge={2} rayon={10} />
              {/* À sa taille finale, sans balayage : un bord qui passait sur le
                  « 14 » le faisait lire « 1 1 » (relecture de B4, 04/10). */}
              <Anneau rect={z(VERSEMENT.partsEtz)} debut={226} couleur={C.bleu} epaisseur={4} marge={4} rayon={12} />
            </>
          )}
        </Morceaux>
      </div>
      {/* La réponse, en grand : lue dans donnees.json (recalculée par
          extraire-donnees.mjs avec le code du site), jamais écrite ici. */}
      <Revele debut={226} style={{ left: M, top: REPONSE.top, width: L - 2 * M }}>
        <p style={{ fontFamily: INTER, fontWeight: 600, fontSize: REPONSE.taille, lineHeight: 1.2, color: C.blanc, margin: 0, whiteSpace: "nowrap" }}>
          →&nbsp;<span style={{ color: C.bleu300 }}>{D.exemple.parts}&nbsp;parts d&apos;{D.exemple.etf}</span>
        </p>
      </Revele>
      <Mention debut={166} top={basReponse + 14}>
        Exemple pré-rempli, extrait du fichier
      </Mention>
      <Mention debut={170} top={basReponse + 14 + LIGNE_MENTION}>
        Calcul sur l&apos;allocation que vous fixez, pas un conseil
      </Mention>
    </AbsoluteFill>
  );
};

// ─── P4 : le tableau de bord (280 → 374) ─────────────────────────────────────
const P4 = (() => {
  const largeur = 920;
  const dx = (largeur - TABLEAU_DE_BORD.largeurPng) / 2; // 10
  const dy = 24;
  const hauteurContenu = dy + TABLEAU_DE_BORD.hauteurPng + dy;
  const y = 316;
  return { largeur, dx, dy, hauteurContenu, y, bas: y + BARRE_FENETRE.hauteur + BARRE_FENETRE.filet + hauteurContenu };
})();

const TableauDeBord: React.FC<{ f: number }> = ({ f }) => {
  const c = CAPTURES_COCKPIT.dashboard;
  const cases = TABLEAU_DE_BORD.cases;
  const z = versRecomposition(cases, 1, P4.dx, P4.dy);
  return (
    <AbsoluteFill style={sortieGlissee(f, 360)}>
      <Titre debut={282}>Le tableau de bord</Titre>
      {/* Pas « tout se met à jour seul » (première version) : sous une
          fenêtre .xlsx, on comprenait que les cours suivent le marché, alors
          qu'en Excel ils se saisissent à la main (FAQ de la fiche). Le classeur
          dit « Tout se met à jour automatiquement depuis les onglets
          Transactions et Par ETF » : c'est le sens retenu, vrai dans les deux
          formats. Les trois cases sont celles que nomme features[0]. */}
      <SousTitre debut={286} taille={38}>
        Valeur, versé, frais&nbsp;: recalculés depuis vos achats
      </SousTitre>
      <FenetreClasseur
        onglet="Dashboard"
        largeur={P4.largeur}
        hauteurContenu={P4.hauteurContenu}
        style={{ left: M, top: P4.y, ...entreeFenetre(f, 284) }}
        contenu={cases.map((m, i) => {
          // Les cases arrivent avec la fenêtre (284) : pas de carte vide.
          const debut = 286 + 3 * i;
          return (
            <Extrait
              key={i}
              {...c}
              de={m.de}
              k={1}
              left={P4.dx + m.x}
              top={P4.dy + m.y}
              style={{ opacity: prog(f, debut, debut + 10), transform: `translateY(${(1 - prog(f, debut, debut + 14, EASE.quart)) * 26}px)` }}
            />
          );
        })}
        accents={
          <>
            {/* Un seul anneau : deux anneaux posés ensemble sur la valeur et
                le versé désignaient leur écart, c'est-à-dire la plus-value. */}
            <Anneau rect={z(TABLEAU_DE_BORD.valeur)} debut={316} couleur={C.bleu} epaisseur={4} marge={12} rayon={12} />
          </>
        }
      />
      <Mention debut={284} top={P4.bas + 34}>
        Exemple pré-rempli, extraits du fichier&nbsp;:
      </Mention>
      <Mention debut={286} top={P4.bas + 34 + LIGNE_MENTION}>
        achats fictifs, cours de clôture du {D.dateExemple}
      </Mention>
    </AbsoluteFill>
  );
};

// ─── P5 : pensé pour le PEA (370 → 460) ──────────────────────────────────────
const P5 = (() => {
  const largeur = 920;
  const dx = 10;
  const dy = 30;
  const hauteurContenu = dy + ONGLET_PEA.hauteurPng + dy;
  const y = 286;
  return { largeur, dx, dy, hauteurContenu, y, bas: y + BARRE_FENETRE.hauteur + BARRE_FENETRE.filet + hauteurContenu };
})();

const OngletPea: React.FC<{ f: number }> = ({ f }) => {
  const c = CAPTURES_COCKPIT.pea;
  const z = versRecomposition(ONGLET_PEA.morceaux, 1, P5.dx, P5.dy);
  return (
    <AbsoluteFill style={sortieGlissee(f, 446)}>
      <Titre debut={372}>Pensé pour le PEA</Titre>
      {/* Copié de la fiche (abstract[2]) par extraire-donnees.mjs. */}
      <SousTitre debut={376} taille={38}>
        {D.sousTitrePea}
      </SousTitre>
      <FenetreClasseur
        onglet="PEA"
        largeur={P5.largeur}
        hauteurContenu={P5.hauteurContenu}
        style={{ left: M, top: P5.y, ...entreeFenetre(f, 374) }}
        contenu={ONGLET_PEA.morceaux.map((m, i) => (
          <Extrait key={i} {...c} de={m.de} k={1} left={P5.dx + m.x} top={P5.dy + m.y} />
        ))}
        accents={
          <>
            {/* Un seul anneau, sur ce que le Cockpit calcule pour vous : la
                date du cap des 5 ans (le taux est un taux légal, la case
                bleue le signale déjà comme une saisie). */}
            <Anneau rect={z(ONGLET_PEA.cap)} debut={404} couleur={C.bleu} epaisseur={4} marge={16} rayon={14} />
          </>
        }
      />
      <Mention debut={374} top={P5.bas + 30}>
        Exemple pré-rempli, extraits du fichier
      </Mention>
    </AbsoluteFill>
  );
};

// ─── P6 : fin (460 → 539) ────────────────────────────────────────────────────
const LOGO = 112;
const Y6 = 270; // haut du logo ; le bloc (logo → pastille) est centré verticalement

// Le carré du logo apparaît à la fin de la sortie de P5 (446 → 460 ; à 458,
// la fenêtre n'est presque plus visible : le carré ne se pose pas sur elle), et la fin
// s'éteint de 524 à 536, pendant que la question entre (voir Question) : plus
// de noir d'une demi-seconde entre P5 et P6, ni à la reprise.
const Fin: React.FC<{ f: number }> = ({ f }) => {
  const sortie = prog(f, 524, 536, EASE.inOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - sortie, transform: `translateY(${-12 * sortie}px)` }}>
      <div style={{ position: "absolute", left: (L - LOGO) / 2, top: Y6, width: LOGO, height: LOGO }}>
        <LogoMarkAnime
          size={LOGO}
          carre={prog(f, 458, 464)}
          trace={prog(f, 462, 472, EASE.inOut)}
          point={prog(f, 470, 476, EASE.expo)}
        />
      </div>
      <Revele debut={466} flou={6} style={{ left: 0, width: L, top: Y6 + 154, textAlign: "center" }}>
        <p style={styleTitre(104)}>{D.titre}</p>
      </Revele>
      {D.complement.map((ligne, i) => (
        <Revele key={ligne} debut={470 + 4 * i} style={{ left: 0, width: L, top: Y6 + 294 + 60 * i, textAlign: "center" }}>
          <p style={{ ...styleSousTitre(44), margin: 0 }}>{ligne}</p>
        </Revele>
      ))}
      <Revele debut={480} style={{ left: 0, width: L, top: Y6 + 464, textAlign: "center" }}>
        <Pastille taille={36}>{D.pastille}</Pastille>
      </Revele>
    </AbsoluteFill>
  );
};

/** Le scénario, image par image (numéros du storyboard). */
const Scenario: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fond largeur={L} pasPoints={48} rayonPoint={1.6} />
      {f < 76 ? <Question t0={-6} /> : null}
      {f >= 530 ? <Question t0={SCENARIO - 6} /> : null}
      {f >= 70 && f < 166 ? <Repartition f={f} /> : null}
      {f >= 160 && f < 286 ? <Versement f={f} /> : null}
      {f >= 280 && f < 376 ? <TableauDeBord f={f} /> : null}
      {f >= 370 && f < 466 ? <OngletPea f={f} /> : null}
      {f >= 452 ? <Fin f={f} /> : null}
    </AbsoluteFill>
  );
};

/** Le fichier : le scénario, avec son arrêt, commencé sur l'affiche. */
export const BoucleCockpit: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={imageScenarioCockpit(f)}>
      <Scenario />
    </Freeze>
  );
};
