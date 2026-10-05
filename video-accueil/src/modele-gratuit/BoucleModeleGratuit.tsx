// Boucle muette de la page du modèle gratuit (/suivi-pea-excel) : 1080×1080,
// 30 i/s, 510 images (17 s). Scénario, sources de chaque texte et règles
// d'honnêteté : STORYBOARD-MODELE-GRATUIT.md.
//
// Même mécanique que la boucle du Cockpit (src/cockpit/BoucleCockpit.tsx, non
// modifiée) :
//   - le SCÉNARIO (480 images, numéros du storyboard : P1 à P5), dans lequel
//     sont écrits tous les numéros d'image de ce fichier ;
//   - le FICHIER rendu (510 images) : le scénario, avec un arrêt de 30 images
//     sur l'état final de la vue par ETF, et qui COMMENCE sur cet arrêt.
// L'image 0 du fichier (scénario 255) est l'affiche : « Suivez votre PEA »,
// la pastille « Modèle gratuit · Excel + Google Sheets », la fenêtre Par ETF
// (parts, total investi, PRU), l'anneau sur le PRU de PE500, la réponse en
// grand (« → 44,40 € la part, frais compris ») et la mention.
// La dernière image (509) est le scénario 254 : tout est immobile de 244
// (anneau posé) à 269, les deux images sont identiques (vérifié par
// scripts/rendre.mjs).
//
// Ne montre que ce que le modèle GRATUIT contient : le journal (Transactions)
// et la vue par ETF. Rien du Cockpit payant (versement du mois, tableau de
// bord, PEA), et pas de rappel du Cockpit à la fin (storyboard, P5 : il est à
// côté de la vidéo sur la page).
//
// Aucun chiffre n'est écrit ici : les montants de l'exemple sont les pixels
// des captures (même empreinte que celles du site, et valeurs relues contre
// l'exemple recalculé par scripts/extraire-donnees.mjs) ; le PRU de la
// réponse de l'affiche et le nom du fichier viennent de donnees.json.

import React from "react";
import { AbsoluteFill, Freeze, Img, staticFile, useCurrentFrame } from "remotion";
import { C, EASE, INTER, OMBRE_CARTE, prog } from "../charte";
import { Fond } from "../composants/Fond";
import { LogoMarkAnime } from "../composants/Logo";
import type { Rect, Zone } from "../composants/Capture";
import type { Morceau } from "../composants/Morceaux";
import { Anneau } from "../composants/Accents";
import { Pastille, Revele, styleMention, styleSousTitre, styleTitre } from "../composants/Texte";
import { BARRE_FENETRE } from "../zones-cockpit";
import { CAPTURES_MODELE, JOURNAL, PAR_ETF } from "../zones-modele-gratuit";
import donnees from "../donnees.json";

/** Durée du scénario (storyboard). */
const SCENARIO = 480;
/** Arrêt sur image : à l'image `a` du scénario, l'image est tenue `duree` images. */
const ARRETS = [{ a: 255, duree: 30 }] as const;
/** Position, dans le scénario rallongé de l'arrêt, de l'image 0 du fichier. */
const DEPART = 255;

export const BOUCLE_MODELE_GRATUIT = {
  largeur: 1080,
  hauteur: 1080,
  fps: 30,
  duree: SCENARIO + ARRETS.reduce((s, x) => s + x.duree, 0),
};

/** Image du fichier → image du scénario. */
export function imageScenarioModeleGratuit(f: number): number {
  const n = BOUCLE_MODELE_GRATUIT.duree;
  let x = (((f + DEPART) % n) + n) % n;
  for (const { a, duree } of ARRETS) {
    if (x < a) return x;
    if (x < a + duree) return a;
    x -= duree;
  }
  return x;
}

const M = 80; // marge de sécurité
const L = BOUCLE_MODELE_GRATUIT.largeur;
const LIGNE_MENTION = Math.round(34 * 1.35); // interligne de styleMention(34)
const D = donnees.modeleBoucle;
const SLATE_500 = "#64748b"; // text-slate-500 de la barre de fenêtre (visuels.tsx)
const SLATE_600 = "#475569"; // text-slate-600 des cartes de P4
const SLATE_50 = "#f8fafc";
const RAYON_FENETRE = 16; // même fenêtre que la boucle du Cockpit
const H_BARRE = BARRE_FENETRE.hauteur + BARRE_FENETRE.filet; // 70
const LARGEUR_FENETRE = L - 2 * M; // 920
const Y_FENETRE = 290;

// ─── Pièces (copies de celles de BoucleCockpit, qui ne les exporte pas) ──────

/** Un rectangle d'une capture, à l'échelle k, posé en (left, top). Rien n'est redessiné. */
const Extrait: React.FC<{ fichier: string; l: number; h: number; de: Zone; k: number; left: number; top: number }> = ({ fichier, l, h, de, k, left, top }) => {
  const [x1, y1, x2, y2] = de;
  return (
    <div style={{ position: "absolute", left, top, width: (x2 - x1) * k, height: (y2 - y1) * k, overflow: "hidden" }}>
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
    if (!m) throw new Error(`BoucleModeleGratuit : la zone [${zone.join(", ")}] n'est dans aucun morceau`);
    return {
      left: dx + (m.x + zone[0] - m.de[0]) * k,
      top: dy + (m.y + zone[1] - m.de[1]) * k,
      width: (zone[2] - zone[0]) * k,
      height: (zone[3] - zone[1]) * k,
    };
  };
}

/**
 * Fenêtre du classeur : barre de `Fenetre` (visuels.tsx du site), avec le nom
 * réel du fichier livré (« Modele-suivi-PEA_dcatracker.xlsx », lu dans la
 * route de téléchargement), puis le contenu sur fond blanc. Même halo, même
 * ombre, mêmes coins que les fenêtres de la boucle du Cockpit. Les accents
 * sont posés au-dessus, hors du cadre qui coupe le contenu.
 */
const FenetreClasseur: React.FC<{
  onglet: string;
  hauteurContenu: number;
  style?: React.CSSProperties;
  contenu: React.ReactNode;
  accents?: React.ReactNode;
}> = ({ onglet, hauteurContenu, style, contenu, accents }) => {
  const largeur = LARGEUR_FENETRE;
  return (
    <div style={{ position: "absolute", width: largeur, height: H_BARRE + hauteurContenu, ...style }}>
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
            {D.fichier}
            <span style={{ color: C.slate400 }}>&nbsp;·&nbsp;{onglet}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, top: H_BARRE, width: largeur, height: hauteurContenu }}>{contenu}</div>
      </div>
      {accents ? <div style={{ position: "absolute", left: 0, top: H_BARRE, width: largeur, height: hauteurContenu }}>{accents}</div> : null}
    </div>
  );
};

/** Entrée d'une fenêtre : opacité sur 10 images, montée de 90 px en ease-out-expo. */
const entreeFenetre = (f: number, debut: number): React.CSSProperties => ({
  opacity: prog(f, debut, debut + 10),
  transform: `translateY(${(1 - prog(f, debut, debut + 26, EASE.expo)) * 90}px)`,
});

/** Sortie glissée : −80 px et fondu. */
const sortieGlissee = (f: number, debut: number): React.CSSProperties => {
  const s = prog(f, debut, debut + 14, EASE.inOut);
  return { transform: `translateX(${-80 * s}px)`, opacity: 1 - s };
};

const Titre: React.FC<{ debut: number; children: React.ReactNode }> = ({ debut, children }) => (
  <Revele debut={debut} flou={6} style={{ left: M, top: 92 }}>
    <h2 style={{ ...styleTitre(84), whiteSpace: "nowrap" }}>{children}</h2>
  </Revele>
);

const SousTitre: React.FC<{ debut: number; taille: number; children: React.ReactNode }> = ({ debut, taille, children }) => (
  <Revele debut={debut} style={{ left: M, top: 200, width: L - 2 * M }}>
    <p style={{ ...styleSousTitre(taille), margin: 0 }}>{children}</p>
  </Revele>
);

const Mention: React.FC<{ debut: number; top: number; children: React.ReactNode }> = ({ debut, top, children }) => (
  <Revele debut={debut} style={{ left: M, top, width: L - 2 * M }}>
    <p style={{ ...styleMention(34), margin: 0, whiteSpace: "nowrap" }}>{children}</p>
  </Revele>
);

// ─── P1 : la question (−4 → 69) ──────────────────────────────────────────────
// Sources : FAQ de la page (« le PRU, qui dit ce que chaque part vous a
// réellement coûté ») et « le PRU inclut les frais de courtage » (§9). C'est
// une question : elle n'affirme rien.
//
// Reprise P5 → P1 (même mécanique que la boucle du Cockpit) : la question
// commence AVANT la fin du scénario (t0 = −4, soit l'image 476) et se
// superpose aux dernières images de la fin, qui s'éteint de 466 à 478. Elle
// est donc rendue deux fois : t0 = −4 au début du scénario, t0 = 476 à sa fin
// (mêmes états de part et d'autre de 479 → 0). Le storyboard la faisait
// entrer à 4 : 9 images sans texte lisible à la reprise (images de contrôle
// décodées du premier rendu).
const Question: React.FC<{ t0: number }> = ({ t0 }) => (
  <>
    <Revele debut={t0} sortie={t0 + 60} flou={6} style={{ left: M, width: L - 2 * M, top: 300, textAlign: "center" }}>
      <h1 style={styleTitre(88)}>
        Combien vous a coûté
        <br />
        chaque part&#8239;?
      </h1>
    </Revele>
    <Revele debut={t0 + 6} sortie={t0 + 60} style={{ left: M, width: L - 2 * M, top: 560, textAlign: "center" }}>
      <p style={{ ...styleSousTitre(40), margin: 0 }}>Frais de courtage compris, ETF par ETF</p>
    </Revele>
  </>
);

// ─── P2 : le journal des achats (66 → 164) ───────────────────────────────────
const P2 = (() => {
  const dx = Math.round((LARGEUR_FENETRE - JOURNAL.largeurPng * JOURNAL.k) / 2);
  const hauteurContenu = JOURNAL.hauteurPng * JOURNAL.k;
  return { dx, hauteurContenu, bas: Y_FENETRE + H_BARRE + hauteurContenu };
})();

const Journal: React.FC<{ f: number }> = ({ f }) => {
  const c = CAPTURES_MODELE.transactions;
  const k = JOURNAL.k;
  const z = versRecomposition(JOURNAL.morceaux, k, P2.dx, 0);
  const h = P2.hauteurContenu;
  // La 7e ligne se fond dans le blanc : le journal continue (1 000 lignes).
  const masque = `linear-gradient(to bottom, #000 ${h - JOURNAL.fondu}px, transparent ${h}px)`;
  return (
    <AbsoluteFill style={sortieGlissee(f, 150)}>
      <Titre debut={66}>Une ligne par achat</Titre>
      <SousTitre debut={70} taille={40}>
        Date, ticker, parts, prix, frais
      </SousTitre>
      <FenetreClasseur
        onglet="Transactions"
        hauteurContenu={h}
        style={{ left: M, top: Y_FENETRE, ...entreeFenetre(f, 68) }}
        contenu={
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: masque, maskImage: masque }}>
            {JOURNAL.morceaux.map((m, i) => (
              <Extrait key={i} {...c} de={m.de} k={k} left={P2.dx + m.x * k} top={m.y * k} />
            ))}
          </div>
        }
        accents={
          // La colonne des frais, pas une cellule (relecture design du 04/10) :
          // elle reprend le dernier mot du sous-titre et le « Frais de
          // courtage compris » de P1, et mène au PRU frais compris de P3. Un
          // seul point d'attention (plus de bande sur la 1re ligne), posé à
          // 100 et immobile jusqu'à la sortie (150) : 42 images, comme
          // l'anneau de P2 du Cockpit.
          <Anneau rect={z(JOURNAL.frais)} debut={100} couleur={C.bleu} epaisseur={4} marge={6} rayon={14} />
        }
      />
      {/* La mention arrive avec la fenêtre : aucun montant sans elle. */}
      <Mention debut={68} top={P2.bas + 34}>
        Exemple pré-rempli, extrait du fichier&nbsp;:
      </Mention>
      <Mention debut={70} top={P2.bas + 34 + LIGNE_MENTION}>
        achats fictifs, cours de clôture réels
      </Mention>
    </AbsoluteFill>
  );
};

// ─── P3 : la vue par ETF, l'AFFICHE (160 → 284) ──────────────────────────────
// Mise en page (relecture design du 04/10) : la pastille « Modèle gratuit ·
// Excel + Google Sheets » prend la place du sous-titre, qui annonçait
// « valeur, plus-value, poids » sans les montrer ; la fenêtre est un peu plus
// grande (échelle 1,05), et la réponse à la question de P1 s'écrit en grand
// dessous, comme « → 14 parts d'ETZ » sur l'affiche du Cockpit.
/** Hauteur d'une Pastille d'Inter 36 : ligne 1,2, padding 0,45 em, bordure 1,5 px. */
const H_PASTILLE_36 = Math.round(36 * 1.2 + 2 * 36 * 0.45 + 3);
/** Ligne de réponse (Inter 600, interligne 1,2). */
const TAILLE_REPONSE = 60;
const H_REPONSE = Math.round(TAILLE_REPONSE * 1.2);

const P3 = (() => {
  const k = PAR_ETF.k;
  const pad = 16;
  const dx = (LARGEUR_FENETRE - PAR_ETF.largeurPng * k) / 2;
  const hauteurContenu = Math.round(pad + PAR_ETF.hauteurPng * k + pad);
  const top = 200 + H_PASTILLE_36 + 26; // 304
  const bas = top + H_BARRE + hauteurContenu;
  const reponse = bas + 26;
  return { k, pad, dx, top, hauteurContenu, bas, reponse, mention: reponse + H_REPONSE + 14 };
})();

/** La réponse, en grand, dans le bleu clair de celle du Cockpit. */
const Reponse: React.FC<{ debut: number; top: number; centre?: boolean; children: React.ReactNode }> = ({ debut, top, centre, children }) => (
  <Revele debut={debut} style={centre ? { left: 0, width: L, top, textAlign: "center" } : { left: M, width: L - 2 * M, top }}>
    <p style={{ fontFamily: INTER, fontWeight: 600, fontSize: TAILLE_REPONSE, lineHeight: 1.2, color: C.blanc, margin: 0, whiteSpace: "nowrap" }}>
      →&nbsp;<span style={{ color: C.bleu300 }}>{children}</span>
    </p>
  </Revele>
);

const ParEtf: React.FC<{ f: number }> = ({ f }) => {
  const c = CAPTURES_MODELE.parEtf;
  const { k, pad, dx } = P3;
  const z = versRecomposition(PAR_ETF.morceaux, k, dx, pad);
  const sortie = prog(f, 270, 284, EASE.inOut);
  const entree = prog(f, 164, 190, EASE.expo);
  // Les calculs apparaissent : un cache blanc (le fond des cellules calculées)
  // couvre Parts détenues, Total investi et PRU, sous leur en-tête, puis se
  // retire de haut en bas. On découvre les pixels de la capture, rien n'est
  // redessiné.
  const decouvert = prog(f, 196, 214, EASE.quart);
  const [cx1, cy1, cx2, cy2] = PAR_ETF.valeurs;
  const hautCache = cy1 + (cy2 - cy1) * decouvert;
  return (
    <AbsoluteFill style={{ opacity: 1 - sortie, transform: `scale(${1 - 0.08 * sortie})` }}>
      {/* Titre à 160 (162 au storyboard) : il entre pendant la fin de la
          sortie de P2, sans laisser 6 images vides. */}
      <Titre debut={160}>Suivez votre PEA</Titre>
      {/* Ce que l'on reçoit : l'affiche le dit à elle seule. */}
      <Revele debut={166} style={{ left: M, top: 200 }}>
        <Pastille taille={36}>Modèle gratuit · Excel + Google Sheets</Pastille>
      </Revele>
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <FenetreClasseur
          onglet="Par ETF"
          hauteurContenu={P3.hauteurContenu}
          style={{
            left: M,
            top: P3.top,
            opacity: prog(f, 164, 175),
            transform: `translateY(${(1 - entree) * 90}px) rotateX(${8 * (1 - entree)}deg)`,
            transformOrigin: "50% 100%",
          }}
          contenu={
            <>
              {PAR_ETF.morceaux.map((m, i) => (
                <Extrait key={i} {...c} de={m.de} k={k} left={dx + m.x * k} top={pad + m.y * k} />
              ))}
              {hautCache < cy2 ? <div style={{ position: "absolute", ...z([cx1, hautCache, cx2, cy2]), background: C.blanc }} /> : null}
            </>
          }
          accents={
            // À sa taille finale, sans balayage (relecture de B4 de l'accueil).
            <Anneau rect={z(PAR_ETF.pruPe500)} debut={222} couleur={C.bleu} epaisseur={4} marge={4} rayon={12} />
          }
        />
      </div>
      {/* La réponse à la question de P1, posée avec l'anneau. Le PRU vient de
          donnees.json (recalculé par extraire-donnees.mjs avec le code du
          site, et égal au pixel entouré) ; « frais compris » est la phrase de
          la page (§4 : « soit un PRU de 44,40 €, frais compris »). L'anneau
          dit de quel ETF il s'agit. */}
      <Reponse debut={226} top={P3.reponse}>
        {D.exemple.pruPe500} la part, frais compris
      </Reponse>
      <Mention debut={164} top={P3.mention}>
        Exemple pré-rempli, extrait du fichier&nbsp;:
      </Mention>
      <Mention debut={166} top={P3.mention + LIGNE_MENTION}>
        achats fictifs, cours de clôture réels
      </Mention>
    </AbsoluteFill>
  );
};

// ─── P4 : Excel ou Google Sheets (280 → 385) ─────────────────────────────────
// Pas de capture ni de logo (aucun logo emprunté) : deux cartes de texte,
// dans le style des cartes du site. Pas d'anneau : mettre en avant les cours
// automatiques de Sheets survendrait une fonction soumise à condition.
const Carte: React.FC<{ f: number; debut: number; left: number; nom: string; lignes: [string, string][] }> = ({ f, debut, left, nom, lignes }) => (
  <div
    style={{
      position: "absolute",
      left,
      top: 300,
      width: 440,
      height: 400,
      boxSizing: "border-box",
      padding: 36,
      borderRadius: 24,
      background: C.blanc,
      boxShadow: OMBRE_CARTE,
      opacity: prog(f, debut, debut + 10),
      transform: `translateY(${(1 - prog(f, debut, debut + 14, EASE.quart)) * 26}px)`,
    }}
  >
    <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 44, lineHeight: 1.2, color: C.gris900, margin: 0 }}>{nom}</p>
    {lignes.map(([debutLigne, fin]) => (
      <p key={debutLigne} style={{ fontFamily: INTER, fontWeight: 400, fontSize: 36, lineHeight: 1.3, color: SLATE_600, margin: "38px 0 0" }}>
        {debutLigne}
        <br />
        <span style={{ fontWeight: 600, color: C.gris900 }}>{fin}</span>
      </p>
    ))}
  </div>
);

// Sortie à 371 (360 au storyboard, 356 au premier rendu) : P4, le plan le
// plus dense, restait lisible en entier 1,9 s seulement ; P5 gagne 15 images
// de moins de tenue (relecture design du 04/10).
//
// Textes (relecture d'exactitude du 04/10) :
//   - les cartes parlent de NOS fichiers, pas des logiciels : « Fichier
//     Excel », « ses cours, saisis à la main » (page, §8 : « Saisis à la main
//     dans nos fichiers […] Excel pour Microsoft 365 a un type de données
//     Actions, mais nos formules n'en dépendent pas ») ;
//   - « automatiques* » porte le différé de la page (« différés de 20 min au
//     plus ») et sa condition (colonne « Cours manuel » vide) ;
//   - le sous-titre garde le « de suivi » de la page (« Les formules du suivi
//     sont les mêmes dans les deux ») : la colonne « Cours auto (Sheets) »
//     n'a sa formule que dans la copie Sheets.
const ExcelOuSheets: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={sortieGlissee(f, 371)}>
    <Titre debut={280}>Excel ou Google Sheets</Titre>
    <SousTitre debut={284} taille={38}>
      Les mêmes formules de suivi dans les deux
    </SousTitre>
    <Carte
      f={f}
      debut={286}
      left={M}
      nom="Fichier Excel"
      lignes={[
        ["Il reste", "sur votre ordinateur"],
        ["Ses cours,", "saisis à la main"],
      ]}
    />
    <Carte
      f={f}
      debut={290}
      left={L - M - 440}
      nom="Google Sheets"
      lignes={[
        ["Une copie,", "dans votre Drive"],
        ["Ses cours,", "automatiques*"],
      ]}
    />
    {/* Le différé et la condition, écrits dans la page (§4, §8, FAQ), l'email
        et le mode d'emploi : le cours manuel, s'il est rempli, passe devant
        le cours automatique. */}
    <Mention debut={294} top={740}>
      *&nbsp;avec GOOGLEFINANCE, différés de 20&nbsp;min au plus,
    </Mention>
    <Mention debut={296} top={740 + LIGNE_MENTION}>
      tant que la colonne «&nbsp;Cours manuel&nbsp;» reste vide
    </Mention>
  </AbsoluteFill>
);

// ─── P5 : fin (383 → 479) ────────────────────────────────────────────────────
const LOGO = 112;
// Bloc logo → réponse : 112 + 43 + titre + lignes + réponse = 522 px de haut,
// centré verticalement (279 → 801) ; le coin bas-droit reste vide.
const Y5 = 279;

// Le carré du logo apparaît à 383, 12 images après le début de la sortie de
// P4 (371 → 385) : les cartes sont alors éteintes, le carré ne se pose plus
// sur la carte Google Sheets (relecture design du 04/10, images 142-143 du
// fichier). Puis le trait et le point ; le titre entre à 384, avec le carré
// (à 388, deuxième rendu : 12 images sans texte entre P4 et la fin ; il en
// reste 8, comme dans la boucle du Cockpit). La fin s'éteint de 466 à 478,
// pendant que la question entre (voir Question).
//
// La dernière ligne est la réponse « → Gratuit, reçu par email », dans le
// bleu clair de la réponse de l'affiche, et non une pastille : la fin du
// Cockpit se termine sur une pastille de prix, et seule cette pastille
// distinguait l'offre gratuite de l'offre payante.
const Fin: React.FC<{ f: number }> = ({ f }) => {
  const sortie = prog(f, 466, 478, EASE.inOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - sortie, transform: `translateY(${-12 * sortie}px)` }}>
      <div style={{ position: "absolute", left: (L - LOGO) / 2, top: Y5, width: LOGO, height: LOGO }}>
        <LogoMarkAnime size={LOGO} carre={prog(f, 383, 389)} trace={prog(f, 387, 397, EASE.inOut)} point={prog(f, 395, 401, EASE.expo)} />
      </div>
      <Revele debut={384} flou={6} style={{ left: 0, width: L, top: Y5 + 155, textAlign: "center" }}>
        <p style={styleTitre(92)}>Modèle de suivi PEA</p>
      </Revele>
      {["Excel + Google Sheets,", "avec son mode d’emploi"].map((ligne, i) => (
        <Revele key={ligne} debut={388 + 4 * i} style={{ left: 0, width: L, top: Y5 + 295 + 56 * i, textAlign: "center" }}>
          <p style={{ ...styleSousTitre(42), margin: 0 }}>{ligne}</p>
        </Revele>
      ))}
      <Reponse debut={398} top={Y5 + 450} centre>
        Gratuit, reçu par email
      </Reponse>
    </AbsoluteFill>
  );
};

/** Le scénario, image par image (numéros du storyboard). */
const Scenario: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fond largeur={L} pasPoints={48} rayonPoint={1.6} />
      {f < 70 ? <Question t0={-4} /> : null}
      {f >= 470 ? <Question t0={SCENARIO - 4} /> : null}
      {f >= 66 && f < 166 ? <Journal f={f} /> : null}
      {f >= 160 && f < 286 ? <ParEtf f={f} /> : null}
      {f >= 280 && f < 386 ? <ExcelOuSheets f={f} /> : null}
      {f >= 380 ? <Fin f={f} /> : null}
    </AbsoluteFill>
  );
};

/** Le fichier : le scénario, avec son arrêt, commencé sur l'affiche. */
export const BoucleModeleGratuit: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={imageScenarioModeleGratuit(f)}>
      <Scenario />
    </Freeze>
  );
};
