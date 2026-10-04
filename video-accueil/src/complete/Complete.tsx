// Version complète, avec le son : 1920×1080, 30 i/s, 60 temps (30 s à 120 BPM).
// Scénario : STORYBOARD.md, section 5 (C1 à C9). Toutes les positions sont en
// temps musicaux, t(n) (src/tempo.ts) : changer le tempo recale tout.
// Le son (musique et bruitages) est dans src/son/BandeSon.tsx, partagé avec la
// version carrée ; la prop `bruitages` (true par défaut) le transmet.
//
// Mise en page : textes dans la colonne de gauche (x de 120 à ~820), captures à
// droite. Surtitres Inter 600 en capitales (primary-300), titres Newsreader
// 700, sous-titres Inter 500 (slate-300), mentions Inter (slate-400).

import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { anim, C, EASE, prog } from "../charte";
import { Fond } from "../composants/Fond";
import { CarteNom, geometrieCarte } from "../composants/Logo";
import { Capture } from "../composants/Capture";
import { Anneau, Bande, Marqueur, Soulignement, trajet, type Pose } from "../composants/Accents";
import { Compteur, Pastille, Revele, styleMention, styleSousTitre, styleSurtitre, styleTitre } from "../composants/Texte";
import { CAPTURES, Z } from "../zones";
import { HYPOTHESE_AFFICHEE, pointe } from "../courbe";
import { DUREE_COMPLETE, t } from "../tempo";
import { BandeSon, type BandeSonProps } from "../son/BandeSon";
import donnees from "../donnees.json";

export const COMPLETE = { largeur: 1920, hauteur: 1080, fps: 30, duree: DUREE_COMPLETE };
const G = 120; // marge gauche
// Titres : 84 px (96 px au storyboard) pour que « Comparez 19 ETF » ou « Simulez
// votre DCA » tiennent sur une ligne dans la colonne de gauche.
const TITRE = 84;
const D = donnees;
const A = D.affichage;
const S = D.simulateur;

// ─── Bornes des plans (en images) ────────────────────────────────────────────
const P = {
  c1: [t(0), t(6) - 1],
  c2: [t(6), t(12) - 1],
  c3: [t(12), t(24) - 1],
  c4: [t(24), t(32) - 1],
  c5: [t(32), t(38) - 1],
  c6: [t(38), t(42) - 1],
  c7: [t(42), t(50) - 1],
  c8: [t(50), t(56) - 1],
  c9: [t(56), DUREE_COMPLETE - 1],
} as const;

/** Un plan : visible entre ses bornes ; il sort en 14 images (glisse à gauche et
 * s'efface), à cheval sur le début du plan suivant pour qu'aucune image ne reste vide. */
const Plan: React.FC<{ f: number; bornes: readonly [number, number]; chevauche?: boolean; children: React.ReactNode }> = ({
  f,
  bornes,
  chevauche = true,
  children,
}) => {
  const [de, a] = bornes;
  // Avant la fin (C9), le plan est sorti à temps : la carte du nom arrive seule.
  const fin = chevauche ? a + 6 : a;
  if (f < de || f > fin) return null;
  const s = prog(f, fin - 14, fin, EASE.inOut);
  return <AbsoluteFill style={{ opacity: 1 - s, transform: `translateX(${-80 * s}px)` }}>{children}</AbsoluteFill>;
};

/** En-tête de la colonne de gauche : surtitre, titre (une ou deux lignes), sous-titre. */
const EnTete: React.FC<{ debut: number; surtitre?: string; titre: React.ReactNode; lignes?: 1 | 2; sousTitre?: React.ReactNode; largeur?: number }> = ({
  debut,
  surtitre,
  titre,
  lignes = 1,
  sousTitre,
  largeur = 720,
}) => (
  <>
    {surtitre ? (
      <Revele debut={debut} style={{ left: G, top: 150 }}>
        <span style={styleSurtitre(26)}>{surtitre}</span>
      </Revele>
    ) : null}
    <Revele debut={debut + 3} flou={8} style={{ left: G, top: 192, width: lignes === 1 ? undefined : largeur }}>
      <h2 style={{ ...styleTitre(TITRE), whiteSpace: lignes === 1 ? "nowrap" : undefined }}>{titre}</h2>
    </Revele>
    {sousTitre ? (
      <Revele debut={debut + 7} style={{ left: G, top: 192 + TITRE * 1.08 * lignes + 26, width: largeur }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>{sousTitre}</p>
      </Revele>
    ) : null}
  </>
);

// ─── C1 : logo, puis la carte du nom s'ouvre ─────────────────────────────────
const L1 = 150;
const CARTE1 = { cx: 960, cy: 500 };
function carteC1(f: number) {
  const ouverture = anim(f, t(3.33), t(4.67), 0, 1, EASE.inOut);
  // La carte s'efface sur place (sans monter : la première question s'écrit au-dessus).
  const sortie = prog(f, t(6) - 4, t(6) + 8, EASE.inOut);
  return { ouverture, sortie, cy: CARTE1.cy };
}

const Ouverture: React.FC<{ f: number }> = ({ f }) => {
  if (f > t(6) + 8) return null;
  const { ouverture, sortie, cy } = carteC1(f);
  const apparition = prog(f, 0, 12, EASE.expo);
  const g = geometrieCarte(L1, 1);
  return (
    <AbsoluteFill style={{ opacity: 1 - sortie, transform: `scale(${1 - 0.06 * sortie})` }}>
      <div style={{ position: "absolute", inset: 0, opacity: apparition, transform: `scale(${0.8 + 0.2 * apparition})`, transformOrigin: `${CARTE1.cx}px ${CARTE1.cy}px` }}>
        <CarteNom
          cx={CARTE1.cx}
          cy={cy}
          logo={L1}
          ouverture={ouverture}
          serrage={1 - ouverture}
          opaciteNom={prog(f, t(3.8), t(4.8))}
          logoAnime={{
            trace: anim(f, 8, 38, 0, 1, EASE.inOut),
            point: anim(f, t(3), t(3) + 8, 0, 1, EASE.expo),
          }}
        />
      </div>
      <Revele debut={t(4)} style={{ left: 0, width: COMPLETE.largeur, top: CARTE1.cy + g.hauteur / 2 + 56, textAlign: "center" }}>
        <span style={styleSurtitre(28)}>{D.pastilleAccueil}</span>
      </Revele>
    </AbsoluteFill>
  );
};

// ─── C2 : les questions ──────────────────────────────────────────────────────
const QUESTIONS = ["Combien peut valoir votre DCA ?", "Quels ETF, avec quels frais ?", "Comment le suivre ?"];
const Q_TOP = [250, 390, 530];
const Q_X = 190;
const puceQuestion = (i: number) => ({ x: G + 26, y: Q_TOP[i] + 52 });

const Questions: React.FC<{ f: number }> = ({ f }) => {
  // La courbe du logo, agrandie, traverse le bas de l'image (comme dans la boucle).
  const pt = (x: number, y: number) => ({ x: G + ((x - 5) / 17) * 1680, y: 1000 - ((21 - y) / 14.5) * 300 });
  const [a, b, c, d, e] = [pt(5, 21), pt(9, 21), pt(13, 15), pt(17, 9), pt(22, 6.5)];
  const trace = anim(f, t(6) + 4, t(6) + 40, 0, 1, EASE.inOut);
  return (
    <Plan f={f} bornes={P.c2}>
      <svg width={COMPLETE.largeur} height={COMPLETE.hauteur} style={{ position: "absolute", inset: 0 }}>
        {trace > 0 ? (
          <path
            d={`M${a.x} ${a.y} Q${b.x} ${b.y} ${c.x} ${c.y} Q${d.x} ${d.y} ${e.x} ${e.y}`}
            stroke="white"
            strokeOpacity={0.9}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - trace}
          />
        ) : null}
      </svg>
      {QUESTIONS.map((q, i) => (
        <Revele key={q} debut={t(6 + i)} duree={10} flou={6} style={{ left: Q_X, top: Q_TOP[i] }}>
          {/* La question en cours reste blanche, les précédentes passent au second plan. */}
          <p style={{ ...styleTitre(88), opacity: i < 2 ? anim(f, t(7 + i), t(7 + i) + 8, 1, 0.42) : 1 }}>{q}</p>
        </Revele>
      ))}
    </Plan>
  );
};

// ─── C3 : simuler ────────────────────────────────────────────────────────────
const PARAM = { x: 1180, y: 150, largeur: 560 };
const GRAPH = { x: 1000, y: 150, largeur: 800 };
const kGraph = GRAPH.largeur / CAPTURES.graphique.l;
const SCEN = { x: G, y: 640, largeur: 820 };
// Le compteur part au 16e temps et arrive au 17e et demi (FIN_C3).
const FIN_C3 = t(17.5);
const balayageC3 = (f: number) => prog(f, t(16) + 2, FIN_C3, Easing.bezier(0.45, 0, 0.2, 1));
function pointeC3(f: number) {
  const g = Z.graphique;
  const xBord = g.trace[0] + (g.trace[2] - g.trace[0]) * balayageC3(f);
  const p = pointe(xBord);
  return { xBord, compteur: p.compteur, ecran: { x: GRAPH.x + p.x * kGraph, y: GRAPH.y + p.y * kGraph } };
}

const Simuler: React.FC<{ f: number }> = ({ f }) => {
  const m5 = t(16);
  // Mesure 6 (les trois scénarios) : un demi-temps plus tard, pour laisser
  // lire « 200 €/mois · 20 ans · 48 000 € versés » sous la valeur arrivée.
  const m6 = t(20.5);
  const entreeParam = prog(f, t(12), t(12) + 20, EASE.expo);
  const sortieParam = prog(f, m5 - 6, m5 + 6, EASE.inOut);
  const bout = pointeC3(f);
  const valeur = f >= FIN_C3 ? S.valeurFinale : bout.compteur;
  const parametres = [
    { debut: t(13), texte: A.versementMensuel, zone: Z.parametres.versement },
    { debut: t(14), texte: `${S.dureeAns} ans`, zone: Z.parametres.duree },
    { debut: t(15), texte: `${HYPOTHESE_AFFICHEE} %/an avant frais`, zone: Z.parametres.rendement },
  ];
  return (
    <Plan f={f} bornes={P.c3}>
      <EnTete debut={t(12)} surtitre="Simulateur · gratuit, sans inscription" titre="Simulez votre DCA" />
      {/* Mesure 4 : les trois réglages, repris en pastilles à gauche. */}
      <div style={{ position: "absolute", left: G, top: 326, display: "flex", gap: 14 }}>
        {parametres.map((p) => {
          const o = prog(f, p.debut, p.debut + 10) * (1 - prog(f, m5 - 6, m5 + 4));
          return o > 0 ? (
            <div key={p.texte} style={{ opacity: o, transform: `translateY(${(1 - prog(f, p.debut, p.debut + 12)) * 16}px)` }}>
              <Pastille taille={30}>{p.texte}</Pastille>
            </div>
          ) : null;
        })}
      </div>
      {f < m5 + 8 ? (
        <Capture
          {...CAPTURES.parametres}
          recadrage={Z.parametres.recadrage}
          largeur={PARAM.largeur}
          style={{
            left: PARAM.x,
            top: PARAM.y,
            opacity: prog(f, t(12), t(12) + 8) * (1 - sortieParam),
            transform: `translateX(${(1 - entreeParam) * 160 + sortieParam * 200}px)`,
          }}
        >
          {(z) =>
            parametres.map((p, i) => (
              <Anneau key={i} rect={z(p.zone)} debut={p.debut} fin={p.debut + 12} couleur={C.bleu} epaisseur={4} marge={6} rayon={14} />
            ))
          }
        </Capture>
      ) : null}
      {/* Mesure 5 : le compteur et le graphique. */}
      <Revele debut={m5} duree={8} montee={16} style={{ left: G - 6, top: 320 }}>
        <Compteur valeur={valeur} taille={168} />
      </Revele>
      {/* N'apparaît qu'une fois le compteur arrivé : à côté d'une valeur
          intermédiaire, « 20 ans » serait faux (relecture d'exactitude du 02/10). */}
      <Revele debut={FIN_C3} duree={10} sortie={m6 - 6} dureeSortie={8} style={{ left: G, top: 520 }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>
          {A.versementMensuel} · {S.dureeAns}&nbsp;ans · {A.capitalVerse} versés
        </p>
      </Revele>
      <Revele debut={m6} style={{ left: G, top: 520 }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>
          3 scénarios&nbsp;: {S.tauxScenarios[0]}, {S.tauxScenarios[1]} et {S.tauxScenarios[2]}&nbsp;%/an avant frais
        </p>
      </Revele>
      <Revele debut={m5 + 8} style={{ left: G, top: 990, width: 1680 }}>
        <p style={{ ...styleMention(30), margin: 0 }}>
          Hypothèse de {HYPOTHESE_AFFICHEE}&nbsp;%/an avant frais, pas une prévision. Frais de l&apos;ETF ({S.fraisDefaut}) déduits.
        </p>
      </Revele>
      {f >= m5 - 2 ? (
        <Capture
          {...CAPTURES.graphique}
          largeur={GRAPH.largeur}
          style={{ left: GRAPH.x, top: GRAPH.y, opacity: prog(f, m5 + 2, m5 + 10), transform: `scale(${0.98 + 0.02 * prog(f, m5, m5 + 16, EASE.expo)})` }}
        >
          {(z) => {
            const [, y1, x2, y2] = Z.graphique.trace;
            return f < FIN_C3 ? <div style={{ position: "absolute", ...z([bout.xBord, y1, x2, y2]), background: C.blanc }} /> : null;
          }}
        </Capture>
      ) : null}
      {/* Mesure 6 : les trois scénarios. */}
      {f >= m6 - 6 ? (
        <Capture
          {...CAPTURES.scenarios}
          largeur={SCEN.largeur}
          marge={18}
          rayonPng={0}
          halo={false}
          style={{
            left: SCEN.x - 18,
            top: SCEN.y,
            opacity: prog(f, m6 - 6, m6 + 4),
            transform: `translateY(${(1 - prog(f, m6 - 6, m6 + 14, EASE.expo)) * 60}px)`,
          }}
        >
          {(z) =>
            [Z.scenarios.conservateur, Z.scenarios.base, Z.scenarios.optimiste].map((zone, i) => (
              <Anneau key={i} rect={z(zone)} debut={t(20.5 + i)} fin={t(21.5 + i) - 2} couleur={C.bleu300} epaisseur={4} marge={4} rayon={16} />
            ))
          }
        </Capture>
      ) : null}
    </Plan>
  );
};

// ─── C4 : comparer ───────────────────────────────────────────────────────────
const FILTRE = { x: 980, y: 150, largeur: 820, marge: 14 };
const LARGEUR_CARTE = 320;
// Les cartes sont un décor : à cette taille, leur badge « PEA » fait ~18×9 px
// dans la fenêtre du site ; c'est la barre de filtres qui porte le message.
const CARTES = [
  { cle: "carteWpea", x: 900, y: 330, entree: t(27) },
  { cle: "carteDcam", x: 1190, y: 380, entree: t(28) },
  { cle: "carteCw8", x: 1480, y: 430, entree: t(29) },
] as const;

const Comparer: React.FC<{ f: number }> = ({ f }) => {
  const entreeFiltre = prog(f, t(24), t(25), EASE.expo);
  // Bascule franche, comme sur le site : un fondu superposerait « 19 » et « 8 ».
  const bascule = f >= t(26) ? 1 : 0;
  const filtre = (cle: "filtres" | "filtresPea", opacite: number, avecAnneaux: boolean) => (
    <Capture
      {...CAPTURES[cle]}
      recadrage={Z.filtres.recadrage}
      largeur={FILTRE.largeur}
      marge={FILTRE.marge}
      fondCarte="#f8fafc"
      rayonPng={0}
      halo={false}
      style={{ left: FILTRE.x - FILTRE.marge, top: FILTRE.y, opacity: opacite * entreeFiltre, transform: `translateY(${(1 - entreeFiltre) * -40}px)` }}
    >
      {avecAnneaux
        ? (z) => (
            <>
              <Anneau rect={z(Z.filtres.interrupteur)} debut={t(26)} fin={t(28)} couleur={C.bleu} epaisseur={3} marge={6} rayon={30} />
              <Anneau rect={z(Z.filtres.compteur)} debut={t(26) + 4} fin={t(28)} couleur={C.bleu} epaisseur={3} marge={8} rayon={12} />
            </>
          )
        : undefined}
    </Capture>
  );
  return (
    <Plan f={f} bornes={P.c4}>
      <EnTete debut={t(24)} surtitre="Comparateur" titre={`Comparez ${D.comparateur.nbEtf} ETF`} sousTitre="Frais, réplication, ISIN, éligibilité PEA" />
      <Revele debut={t(26) + 2} style={{ left: G, top: 440 }}>
        <Pastille taille={28}>
          Filtre «&nbsp;PEA uniquement&nbsp;»&nbsp;: {D.comparateur.nbEtfFiltrePea}&nbsp;ETF
        </Pastille>
      </Revele>
      {/* L'état « PEA uniquement » (vraie capture) se fond par-dessus l'état initial. */}
      {filtre("filtres", 1, false)}
      {bascule > 0 ? filtre("filtresPea", bascule, true) : null}
      {CARTES.map((c) => {
        const e = prog(f, c.entree, c.entree + 24, EASE.expo);
        return e > 0 ? (
          <Capture
            key={c.cle}
            {...CAPTURES[c.cle]}
            largeur={LARGEUR_CARTE}
            style={{ left: c.x, top: c.y, opacity: prog(f, c.entree, c.entree + 8), transform: `translateY(${(1 - e) * 60}px)` }}
          />
        ) : null;
      })}
    </Plan>
  );
};

// ─── C5 : la liste PEA vérifiée ──────────────────────────────────────────────
const ListePea: React.FC<{ f: number }> = ({ f }) => {
  const e = prog(f, t(32), t(33), EASE.expo);
  return (
    <Plan f={f} bornes={P.c5}>
      <EnTete
        debut={t(32)}
        surtitre={`Liste vérifiée le ${D.listePea.dateVerif}`}
        titre={
          <>
            {D.listePea.nbEtf}&nbsp;ETF éligibles
            <br />
            au PEA
          </>
        }
        lignes={2}
        sousTitre="Vérifiés un par un, avec leur ISIN et leurs frais"
        largeur={640}
      />
      {/* Le plan d'avant montre « 8 ETF » (filtre du comparateur) : sans ce
          lien, 8 puis 13 donneraient l'impression que le site se contredit.
          Les 13 sont les 8 du catalogue plus 5 fonds hors catalogue
          (src/lib/etf-pea-verifies.ts du site, ETF_PEA_VERIFIES). */}
      <Revele debut={t(33)} style={{ left: G, top: 540 }}>
        <Pastille taille={28}>
          Dont les {D.comparateur.nbEtfFiltrePea} du filtre «&nbsp;PEA uniquement&nbsp;»
        </Pastille>
      </Revele>
      <Capture
        {...CAPTURES.listePea}
        recadrage={Z.listePea.recadrage}
        largeur={960}
        rayonPng={28}
        style={{ left: 860, top: 200, opacity: prog(f, t(32), t(32) + 8), transform: `translateY(${(1 - e) * 80}px)` }}
      >
        {(z) =>
          Z.listePea.lignes.map(([y1, y2], i) => (
            <Bande
              key={i}
              rect={z([Z.listePea.isin[0], y1 + 10, Z.listePea.isin[2], y2 - 10])}
              debut={t(34 + i)}
              fin={i < 3 ? t(35 + i) - 2 : undefined}
            />
          ))
        }
      </Capture>
    </Plan>
  );
};

// ─── C6 : PEA ou CTO ─────────────────────────────────────────────────────────
const PeaCto: React.FC<{ f: number }> = ({ f }) => {
  const e = prog(f, t(38), t(39), EASE.expo);
  const zoom = 1 + 0.05 * prog(f, t(38), t(42), (x) => x);
  return (
    <Plan f={f} bornes={P.c6}>
      <EnTete debut={t(38)} titre={"PEA ou CTO\u00a0?"} sousTitre={"Le calculateur fiscal compare l'impôt"} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "1340px 540px" }}>
        <Capture
          {...CAPTURES.taux}
          recadrage={Z.taux.recadrage}
          largeur={920}
          marge={32}
          rayonPng={0}
          style={{ left: 850, top: 410, opacity: prog(f, t(38), t(38) + 8), transform: `translateY(${(1 - e) * 60}px)` }}
        >
          {(z) => (
            <>
              <Soulignement rect={z(Z.taux.pea)} debut={t(39)} />
              <Soulignement rect={z(Z.taux.cto)} debut={t(40)} />
            </>
          )}
        </Capture>
      </div>
    </Plan>
  );
};

// ─── C7 : suivre dans un tableur ─────────────────────────────────────────────
// La fenêtre se centre verticalement : la capture Transactions est sortie par le haut.
const FEN = { x: 780, y: 343, largeur: 1040 };
const Tableur: React.FC<{ f: number }> = ({ f }) => {
  const eTr = prog(f, t(42), t(42) + 20, EASE.expo);
  // La capture Transactions sort par le haut quand la fenêtre du Cockpit arrive.
  const sortieTr = prog(f, t(46) - 2, t(46) + 10, EASE.inOut);
  const eFen = prog(f, t(46), t(46) + 22, EASE.expo);
  return (
    <Plan f={f} bornes={P.c7}>
      <EnTete debut={t(42)} surtitre="Excel et Google Sheets" titre="Suivez votre PEA" />
      <Revele debut={t(42) + 10} sortie={t(46) + 1} dureeSortie={8} style={{ left: G, top: 340 }}>
        <Pastille taille={26}>Modèle gratuit&nbsp;: journal des achats et vue par ETF</Pastille>
      </Revele>
      <Revele debut={t(46) + 10} style={{ left: G, top: 340 }}>
        <Pastille taille={26}>
          Cockpit DCA · {A.cockpitPrix}, paiement unique
        </Pastille>
      </Revele>
      <Revele debut={t(46) + 14} style={{ left: G, top: 420 }}>
        <p style={{ ...styleSousTitre(40), margin: 0 }}>
          Le versement du mois,
          <br />
          en parts entières
        </p>
      </Revele>
      <Revele debut={t(47)} style={{ left: G, top: 990 }}>
        <p style={{ ...styleMention(30), margin: 0 }}>Calcul sur l&apos;allocation que vous fixez, pas un conseil</p>
      </Revele>
      {sortieTr < 1 ? (
      <Capture
        {...CAPTURES.transactions}
        largeur={800}
        marge={18}
        rayonPng={0}
        style={{
          left: 980,
          top: 150,
          opacity: prog(f, t(42), t(42) + 8) * (1 - sortieTr),
          transform: `translateY(${(1 - eTr) * 100 - 140 * sortieTr}px)`,
        }}
      />
      ) : null}
      {f >= t(46) ? (
        <Capture
          {...CAPTURES.versement}
          largeur={FEN.largeur}
          rayonPng={26}
          style={{ left: FEN.x, top: FEN.y, opacity: prog(f, t(46), t(46) + 8), transform: `translateX(${(1 - eFen) * 520}px)` }}
        >
          {(z) => (
            <>
              <Anneau rect={z(Z.versement.montant)} debut={t(46.5)} repos={0.55} couleur={C.bleu} epaisseur={4} marge={2} rayon={10} />
              {/* À sa taille finale, sans bord qui balaie les chiffres ; tenu
                  de t(47.5) à la sortie du plan (~0,9 s). */}
              <Anneau rect={z(Z.versement.colonneParts)} debut={t(47.5)} couleur={C.bleu} epaisseur={4} marge={4} rayon={12} />
            </>
          )}
        </Capture>
      ) : null}
    </Plan>
  );
};

// ─── C8 : Premium ────────────────────────────────────────────────────────────
const Premium: React.FC<{ f: number }> = ({ f }) => {
  const e = prog(f, t(50), t(50) + 18, EASE.expo);
  return (
    <Plan f={f} bornes={P.c8} chevauche={false}>
      <EnTete
        debut={t(50)}
        surtitre={`Premium · ${D.premium.essaiJours} jours d'essai gratuit`}
        titre={
          <>
            Le suivi mensuel,
            <br />
            en ligne
          </>
        }
        lignes={2}
        sousTitre="Monte Carlo, backtest depuis 2008, récap fiscal annuel"
        largeur={760}
      />
      <Revele debut={t(52)} style={{ left: G, top: 610 }}>
        <p style={{ ...styleSousTitre(52), color: C.blanc, fontWeight: 700, margin: 0 }}>
          {A.premiumMensuel} <span style={{ color: C.slate400, fontWeight: 500 }}>ou</span> {A.premiumAnnuel}
        </p>
      </Revele>
      <Capture
        {...CAPTURES.premium}
        largeur={600}
        marge={28}
        fondCarte={C.fond}
        bordure="1px solid rgba(255,255,255,0.10)"
        rayonPng={0}
        style={{ left: 1150, top: 170, opacity: prog(f, t(50), t(50) + 8), transform: `translateY(${(1 - e) * 80}px)` }}
      >
        {(z) =>
          Z.premium.lignes.map((zone, i) => (
            <Bande key={i} rect={z(zone)} debut={t(51 + i)} couleur="rgba(59,130,246,0.14)" bord="rgba(96,165,250,0.35)" marge={4} rayon={12} />
          ))
        }
      </Capture>
    </Plan>
  );
};

// ─── C9 : fin ────────────────────────────────────────────────────────────────
const Fin: React.FC<{ f: number }> = ({ f }) => {
  if (f < P.c9[0]) return null;
  const e = prog(f, t(56), t(56) + 8, EASE.expo);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: prog(f, t(56), t(56) + 6) }}>
        <CarteNom cx={960} cy={540} logo={120} echelle={0.96 + 0.04 * e} />
      </div>
      <Revele debut={t(56) + 6} style={{ left: 0, width: COMPLETE.largeur, top: 300, textAlign: "center" }}>
        <p style={styleTitre(72)}>Simulez. Comparez. Suivez.</p>
      </Revele>
      <Revele debut={t(56) + 12} style={{ left: 0, width: COMPLETE.largeur, top: 690, textAlign: "center" }}>
        <p style={{ ...styleSousTitre(36), margin: 0 }}>Simulateur gratuit, sans inscription</p>
      </Revele>
      <Revele debut={t(56) + 16} style={{ left: 0, width: COMPLETE.largeur, top: 960, textAlign: "center" }}>
        <p style={{ ...styleMention(30), margin: 0 }}>dcatracker.fr</p>
      </Revele>
    </AbsoluteFill>
  );
};

// ─── Marqueur (le point blanc du logo) ───────────────────────────────────────
const POSES: Pose[] = [
  // C2 : devant la question en cours.
  { de: t(6) + 2, a: t(6) + 2, pos: () => puceQuestion(0), o: 0 },
  { de: t(6) + 8, a: t(6) + 12, pos: () => puceQuestion(0) },
  { de: t(7) + 2, a: t(7) + 12, pos: () => puceQuestion(1) },
  { de: t(8) + 2, a: t(11) + 1, pos: () => puceQuestion(2) },
  { de: t(12) - 1, a: t(12) - 1, pos: () => ({ x: puceQuestion(2).x - 80, y: puceQuestion(2).y }), o: 0 },
  // C3 : la pointe de la courbe « Base », pendant qu'elle se trace.
  { de: t(16) - 2, a: t(16) - 2, pos: (f) => pointeC3(f).ecran, o: 0 },
  { de: t(16) + 4, a: t(23) + 3, pos: (f) => pointeC3(f).ecran },
  { de: t(24) - 1, a: t(24) - 1, pos: (f) => ({ x: pointeC3(f).ecran.x - 80, y: pointeC3(f).ecran.y }), o: 0 },
];

export const Complete: React.FC<BandeSonProps> = ({ bruitages = true }) => {
  const f = useCurrentFrame();
  const m = trajet(POSES, f, 14);
  return (
    <AbsoluteFill>
      <Fond largeur={COMPLETE.largeur} pasPoints={40} rayonPoint={1.4} />
      <Ouverture f={f} />
      <Questions f={f} />
      <Simuler f={f} />
      <Comparer f={f} />
      <ListePea f={f} />
      <PeaCto f={f} />
      <Tableur f={f} />
      <Premium f={f} />
      <Fin f={f} />
      <Marqueur {...m} />
      <BandeSon bruitages={bruitages} />
    </AbsoluteFill>
  );
};
