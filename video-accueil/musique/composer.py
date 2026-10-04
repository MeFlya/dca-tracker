# La musique de la version complète : partition, arrangement, mixage, mastering.
#
# Lancer : python3 musique/composer.py      (npm run musique : composition + analyse)
#
# Sorties :
#   public/musique.wav           48 kHz, stéréo, 16 bits avec dither TPDF,
#                                exactement 1 440 000 échantillons (30,000 s)
#   out/musique/pistes/*.wav     pistes séparées (batterie, basse, harmonie,
#                                mélodie, effets, retours), 32 bits flottants
#   out/musique/partition.json   toutes les notes et tous les événements,
#                                relus par analyse.py (piano roll, contrôles)
#
# Tout est écrit en TEMPS musicaux, comme la vidéo (STORYBOARD.md, section 5) :
# 120 BPM, 4/4, 1 temps = 0,5 s = 24 000 échantillons, 60 temps. La musique
# suit la grille exacte ; les images de la vidéo en sont au plus à une
# demi-image (src/tempo.ts).
#
# Tonalité : La majeur. Le logo sonore est l'arpège La4 – Do#5 – Mi5 – La5,
# la courbe qui monte d'un DCA : énoncé doucement au logo (sans sa dernière
# note), résolu sur La5 à l'accord final. Les notes de repère de la feuille de
# montage (note-1 à note-4) sont jouées par la musique, à la cloche FM.

from __future__ import annotations

import os
import sys

# Calcul matriciel sur un seul fil : l'ordre des additions ne dépend pas du
# nombre de cœurs, le fichier est identique d'une exécution à l'autre.
for _variable in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS", "VECLIB_MAXIMUM_THREADS"):
    os.environ.setdefault(_variable, "1")
# Pas de dossier __pycache__ dans musique/ : il finirait dans un commit.
sys.dont_write_bytecode = True

import json  # noqa: E402
import time  # noqa: E402
from pathlib import Path  # noqa: E402

import numpy as np  # noqa: E402
from scipy.ndimage import uniform_filter1d  # noqa: E402

import instruments as I  # noqa: E402
import mesures  # noqa: E402
import moteur as M  # noqa: E402
from moteur import FE, Piste, db, ech, note  # noqa: E402

ICI = Path(__file__).resolve().parent
VIDEO = ICI.parent
FICHIER_MUSIQUE = VIDEO / "public" / "musique.wav"
DOSSIER = VIDEO / "out" / "musique"

# ─── Tempo et grille ─────────────────────────────────────────────────────────
TEMPO = 120
SEC_PAR_TEMPS = 60.0 / TEMPO  # 0,5 s
ECH_PAR_TEMPS = 24000  # 0,5 s × 48 000
NB_TEMPS = 60
N = NB_TEMPS * ECH_PAR_TEMPS  # 1 440 000 échantillons

# Coupes de la feuille de montage (début des plans C1 à C9).
COUPES = [0, 6, 12, 24, 32, 38, 42, 50, 56]


def e(temps: float) -> int:
    """Temps musical → échantillon (grille exacte)."""
    return int(round(temps * ECH_PAR_TEMPS))


def sec(temps: float) -> float:
    """Durée en temps → secondes."""
    return temps * SEC_PAR_TEMPS


# ─── Grille d'accords ────────────────────────────────────────────────────────
# Un accord par mesure. Mesures de 4 temps, sauf 0–6 et 6–12 (deux phrases de
# 6 temps), 36–38 et 54–56 (2 temps). Voicings dans le médium, enchaînés par
# notes communes ou par degrés conjoints.
#
# Quand le piano électrique joue (décollages), chaque instrument a son
# registre : le piano tient le bas-médium (Fa#3 à Mi4, les accords syncopés),
# la nappe ne joue que des notes de l'accord que le piano n'a pas, au-dessus
# de lui (Fa#4 à Mi5). Dans la première version, la nappe tenait les mêmes
# notes que le piano, dans la même octave : 65 notes de piano sur 93 à
# l'unisson d'une note de nappe déjà installée, des attaques noyées, et une
# bande de 200 à 400 Hz encombrée (l'harmonie y faisait 55 à 63 % de
# l'énergie). Les notes de nappe évitent aussi, quand c'est possible, la
# hauteur des notes de repère de la mesure (Do#5 à 17,5, Mi5 à 47,5).
#   début, fin, nom, basse, nappe, piano électrique, arpège
GRILLE = [
    (0, 4, "Dmaj9", "D2", "A3 C#4 E4 F#4", None, None),
    (4, 6, "Aadd9", "A1", "A3 B3 C#4 E4", None, None),
    (6, 9, "F#m9", "F#2", "A3 C#4 E4 G#4", "A3 C#4 E4", None),
    (9, 12, "Esus4", "E2", "A3 B3 E4 F#4", "A3 B3 E4", None),
    (12, 16, "Dmaj7", "D2", "F#4 A4 C#5", "F#3 A3 C#4 E4", None),
    (16, 20, "A/C#", "C#2", "A4 E5", "A3 C#4 E4 B4", None),
    (20, 24, "F#m7", "F#2", "F#4 A4", "F#3 A3 C#4 E4", None),
    (24, 28, "E6sus4", "E2", "A3 B3 C#4 E4", None, "C#5 E5 A5 B5"),
    (28, 32, "Dmaj9", "D2", "A3 C#4 E4 F#4", None, "C#5 E5 F#5 A5"),
    (32, 36, "A/C#", "C#2", "A3 C#4 E4 A4", None, "C#5 E5 A5 B5"),
    (36, 38, "Bm7/E", "E2", "A3 B3 D4 F#4", None, "D5 F#5 A5 B5"),
    (38, 40, "F#m9", "F#2", "A3 C#4 E4 G#4", None, None),
    (40, 42, "Esus4", "E2", "A3 B3 E4 F#4", None, None),
    (42, 46, "Dmaj7", "D2", "F#4 A4 C#5", "F#3 A3 C#4 E4", "C#5 E5 F#5 A5"),
    (46, 50, "A/C#", "C#2", "A4 C#5", "A3 C#4 E4 B4", "C#5 E5 A5 B5"),
    # Bm7 sans 9e : le Do#5 du piano frottait d'un demi-ton contre le Ré5 de
    # la nappe et d'une 9e mineure contre le Ré6 de l'arpège, dans le passage
    # qui doit sonner le plus ouvert. Piano et nappe montent ensuite par
    # degrés vers l'accord de Mi (Ré → Mi, Fa# → Sol#, Si tenu).
    (50, 52, "Bm7", "B1", "B4 D5", "B3 D4 F#4 A4", "B4 D5 F#5 A5"),
    (52, 54, "E", "E2", "B4 E5", "B3 E4 G#4", "B4 E5 G#5 B5"),
    (54, 56, "E7sus4", "E2", "D4 E4 A4 B4", None, None),
    # Accord final large : basse La1, piano La3 Si3 Do#4 Mi4 (la couleur
    # add9), nappe au-dessus sur l'accord du logo (La4 Do#5 Mi5), cloche La5.
    (56, 60, "Aadd9", "A1", "A4 C#5 E5", "A3 B3 C#4 E4", None),
]


def accord(temps: float):
    for a in GRILLE:
        if a[0] <= temps < a[1]:
            return a
    return GRILLE[-1]


def hauteurs(voicing: str) -> list[int]:
    return [note(n) for n in voicing.split()]


# ─── Motifs ──────────────────────────────────────────────────────────────────

# Cloche FM : logo sonore et notes de repère (temps, note, force). Les repères
# portent le nom de l'effet qu'ils remplacent (src/son/BandeSon.tsx, EFFETS_SANS_MUSIQUE).
CLOCHE = [
    (4.0, "A4", 0.80, "note-1"),  # logo : La4 au moment où le nom se découvre…
    (4.5, "C#5", 0.62, None),  # … Do#5, Mi5 : énoncé doucement, sans sa résolution
    (5.0, "E5", 0.66, None),
    (17.5, "C#5", 0.95, "note-2"),  # le compteur s'arrête sur 97 753 €
    (20.5, "A4", 0.90, "note-1"),  # les trois scénarios s'allument
    (21.5, "C#5", 0.90, "note-2"),
    (22.5, "E5", 0.95, "note-3"),
    (27.0, "A4", 0.90, "note-1"),  # les trois cartes d'ETF montent
    (28.0, "C#5", 0.90, "note-2"),
    (29.0, "E5", 0.95, "note-3"),
    (47.5, "E5", 0.90, "note-3"),  # « ≈ Parts à acheter » (doublé par la mélodie)
    # Logo complet en levée, en crescendo, résolu sur La5 à l'accord final.
    # La force règle aussi la brillance de la cloche (indice de modulation) :
    # la note d'arrivée, la signature de la marque, est la plus forte et la
    # plus brillante. (Dans la première version, la levée était jouée à 0,85
    # à 0,95 et le La5 à 0,60 : la phrase retombait au lieu d'arriver.)
    (54.5, "A4", 0.60, None),
    (55.0, "C#5", 0.70, None),
    (55.5, "E5", 0.80, None),
    (56.0, "A5", 1.00, "note-4"),
]
# Le La5 final est doublé : un pluck à la même hauteur (attaque plus nette,
# plus de fondamental) et une cloche douce à l'octave inférieure (corps).
DOUBLURES_LA5 = [("grimpee", "A5", 0.80), ("cloche", "A4", 0.45)]
# Extinction des cloches de l'accord final (secondes depuis 56 ; constante
# de temps) : 1 s de résonance libre, puis étouffées, à pente constante
# d'environ -35 dB/s. C'est la cloche, la plus longue des voix de l'accord,
# qui dessine la fin : dans la deuxième version provisoire, tenue 3 temps
# puis relâchée en 0,25 s, elle restait presque au même niveau jusqu'à 29,5 s
# puis tombait d'un coup (-7 puis -69 dB/s), comme un fondu tardif.
ETOUFFEMENT_FINAL = (1.0, 0.25)

# Accroche mélodique du second décollage (temps, durée, note, force). Elle
# reprend le logo (La – Do# – Mi), passe par Mi5 au temps 47,5 (repère
# note-3), puis monte par degrés (Fa#5, Sol#5) vers le La5 final.
ACCROCHE = [
    (42.5, 0.5, "A4", 0.85), (43.0, 0.5, "C#5", 0.85), (43.5, 1.0, "E5", 0.95),
    (44.5, 0.5, "F#5", 0.85), (45.0, 0.5, "E5", 0.80), (45.5, 0.75, "C#5", 0.80),
    (46.5, 0.5, "A4", 0.85), (47.0, 0.5, "C#5", 0.85), (47.5, 1.0, "E5", 1.00),
    (48.5, 0.5, "F#5", 0.85), (49.0, 0.5, "E5", 0.80), (49.5, 0.5, "C#5", 0.80),
    (50.0, 2.0, "F#5", 0.90), (52.0, 2.0, "G#5", 0.95),
]

# Première mesure du décollage (12–16) : trois « pings » à contretemps, qui
# répondent aux clics de l'interface (13, 14, 15) en redescendant le logo
# (Mi5, Do#5, La4)…
PINGS = [(13.5, "E5"), (14.5, "C#5"), (15.5, "A4")]
# … puis la montée qui accompagne le compteur (16 → 17,5) : doubles croches
# dans la pentatonique de La, qui « arrivent » sur le Do#5 de la cloche à 17,5.
GRIMPEE = [(16.0, "B3"), (16.25, "C#4"), (16.5, "E4"), (16.75, "F#4"), (17.0, "A4"), (17.25, "B4")]

# Arpège (à partir de 24) : 16 doubles croches par mesure sur les 4 notes de
# l'accord (de la plus grave, 0, à la plus aiguë, 3), accents en 3+3+3+3+2+2.
MOTIF_ARPEGE = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 1, 3, 1]
ACCENTS_ARPEGE = {0, 3, 6, 9, 12, 14}

# Basse : (position dans la mesure, durée, transposition, force).
# A : croches à contretemps, l'octave au 4e temps. B : avec des rebonds à
# l'octave en doubles croches.
BASSE_A = [(0.5, 0.36, 0, 0.95), (1.5, 0.36, 0, 0.85), (2.5, 0.36, 0, 0.90), (3.5, 0.36, 12, 0.80)]
BASSE_B = [(0.5, 0.36, 0, 0.95), (1.5, 0.20, 0, 0.85), (1.75, 0.20, 12, 0.70),
           (2.5, 0.36, 0, 0.90), (3.5, 0.20, 0, 0.85), (3.75, 0.20, 12, 0.70)]

# Piano électrique : accords syncopés (position, durée, force).
PIANO_A = [(0.0, 0.75, 0.72), (1.5, 0.45, 0.58), (2.75, 0.2, 0.50), (3.0, 0.8, 0.62)]
# Mesure 20–24 : les scénarios s'allument à contretemps (20,5 ; 21,5 ; 22,5),
# le piano ne joue que sur les temps 1 et 4 pour leur laisser la place.
PIANO_REPERES = [(0.0, 0.4, 0.60), (3.0, 0.8, 0.55)]
# Mesure 16–20 : le compteur s'arrête à 17,5 (note-2, Do#5). Le piano n'y
# joue pas son accord de contretemps : ses partiels couvraient le Do#5 de la
# cloche, le repère le plus important du plan.
PIANO_COMPTEUR = [(0.0, 0.75, 0.72), (2.75, 0.2, 0.50), (3.0, 0.8, 0.62)]

# Charleston fermé : accents des 16 doubles croches d'une mesure.
ACCENTS_CHARLESTON = [0.55, 0.30, 0.85, 0.35, 0.55, 0.30, 0.85, 0.40, 0.55, 0.30, 0.85, 0.35, 0.55, 0.30, 0.85, 0.45]
ACCENTS_SHAKER = [0.45, 0.80, 0.55, 0.90]
# Swing léger : les doubles croches paires (« e » et « a ») arrivent 8 ms plus
# tard (53,2 %, le balancement discret d'un groove house). C'est un décalage
# voulu et régulier, distinct de l'humanisation (±1,5 ms au hasard). À 3,5 ms
# (51,4 %, première version), il était sous le seuil où l'on entend un swing :
# la grille sonnait droite.
SWING = 0.008  # s
# Le charleston et le shaker se taisent sur les deux dernières doubles
# croches avant les coupes 32 et 50 : le souffle inversé qui y mène a la
# place de s'entendre.
SILENCES_AVANT_SOUFFLE = {31.5, 31.75, 49.5, 49.75}

# ─── Plan d'ensemble ─────────────────────────────────────────────────────────
#  0–6    C1 logo      nappe qui s'ouvre, scintillement, logo sonore (sans pulsation)
#  6–12   C2 questions pulsation douce (pluck étouffé, battement grave), montée
# 12–24   C3 simuler   1er décollage : batterie, basse, accords syncopés
# 24–32   C4 comparer  variation : arpège avec écho pointé
# 32–36   C5 liste PEA groove allégé ; 36–38 : filtre qui se ferme, descente
# 38–42   C6 PEA/CTO   pause : batterie coupée, accord suspendu ; montée 40–42
# 42–50   C7 suivre    2e décollage, le plus riche : accroche mélodique
# 50–54   C8 premium   élévation : accords plus lumineux ; 54–56 roulement
# 56–60   C9 fin       accord final de La (add9), logo résolu, extinction


# ─── Partition ───────────────────────────────────────────────────────────────


class Partition:
    """Liste de tous les événements (notes, coups, effets), en temps musicaux."""

    def __init__(self):
        self.evenements: list[dict] = []

    def ajouter(self, instrument: str, debut: float, duree: float = 0.0, midi: int | None = None, force: float = 1.0, **params):
        self.evenements.append(dict(instrument=instrument, debut=float(debut), duree=float(duree), midi=midi, force=float(force), **params))


# Humanisation : chaque instrument a son propre tirage (graine fixe).
_HUMAIN: dict[str, np.random.Generator] = {}


def humain(instrument: str, force: float, ecart_force: float = 0.10, ecart_ms: float = 0.0):
    """Force variée de ±10 % et, si demandé, micro-décalage de ±ecart_ms
    (jamais pour la grosse caisse, la basse ni les repères)."""
    if instrument not in _HUMAIN:
        _HUMAIN[instrument] = M.generateur(sum(map(ord, instrument)) * 7919)
    r = _HUMAIN[instrument]
    f = float(np.clip(force * (1.0 + r.uniform(-ecart_force, ecart_force)), 0.05, 1.0))
    d = float(r.uniform(-ecart_ms, ecart_ms)) if ecart_ms else 0.0
    return f, d


def ecrire_harmonie(P: Partition) -> None:
    # Nappe : une note commune à deux accords n'est pas rejouée ; aux
    # décollages (12, 42, 56) et à la pause (38), tout est réattaqué.
    reattaques = {0: 0.6, 4: 0.5, 6: 0.5, 9: 0.5, 12: 0.06, 16: 0.15, 20: 0.15, 24: 0.15, 28: 0.15, 32: 0.2, 36: 0.3,
                  38: 0.6, 40: 0.4, 42: 0.05, 46: 0.12, 50: 0.12, 52: 0.12, 54: 0.15, 56: 0.02}
    franches = {12, 38, 42, 56}
    actives: dict[int, tuple[float, float]] = {}
    for debut, fin, *_ in GRILLE:
        voix = set(hauteurs(accord(debut)[4]))
        for m in list(actives):
            if m not in voix or debut in franches:
                d0, att = actives.pop(m)
                # Une note qui glisse d'un demi-ton vers une note du nouvel
                # accord (Do#5 → Ré5 à 50…) s'efface en 0,12 s : avec le
                # relâchement habituel de 0,6 s, les deux sonneraient ensemble
                # une demi-seconde (seconde mineure).
                voisine = any(abs(m - v) in (1, 13) for v in voix)
                relache = 0.25 if debut in franches else (0.12 if voisine else 0.6)
                P.ajouter("nappe", d0, debut - d0, m, 1.0, attaque=att, relache=relache)
        for m in sorted(voix):
            if m not in actives:
                actives[m] = (debut, reattaques[debut])
    # Accord final : tenu jusqu'à 56,8, puis relâché en 1,2 s. Il s'éteint
    # vers 59,2 et seule la queue de réverbération reste (première version :
    # tenu jusqu'à 57,4 et relâché en 1,8 s, il durait au-delà de la fin du
    # morceau, et c'était le fondu de sortie qui faisait la descente).
    for m, (d0, att) in actives.items():
        P.ajouter("nappe", d0, 56.8 - d0, m, 1.0, attaque=att, relache=1.2)

    # Pulsation douce 6–12 : pluck étouffé en croches sur l'accord, filtre qui
    # s'ouvre et volume qui croît (la tension monte dès 6, pas seulement à
    # partir de 10). Elle continue pendant la première mesure du décollage
    # (12–15,5), filtre ouvert, puis cède la place à la montée du compteur
    # (16) : c'est le fil entre la montée et le décollage.
    for i in range(12):
        t = 6.0 + 0.5 * i
        p = (t - 6.0) / 6.0
        for m in hauteurs(accord(t)[5]):
            f, _ = humain("pulse", (0.25 + 0.85 * p) * (1.0 if i % 2 else 0.85), 0.06)
            P.ajouter("pulse", t, 0.22, m, f, brillance=700.0 * (4500.0 / 700.0) ** p)
    for i in range(8):
        t = 12.0 + 0.5 * i
        for m in hauteurs("A3 C#4 F#4"):
            f, _ = humain("pulse", 0.92 * (1.0 if i % 2 else 0.8) * (1.0 - 0.03 * i), 0.06)
            P.ajouter("pulse", t, 0.2, m, f, brillance=5000.0)

    # Piano électrique : accords syncopés aux décollages (12–24, 42–54).
    for debut, fin, nom, _, _, piano, _ in GRILLE:
        if piano is None or not (12 <= debut < 24 or 42 <= debut < 54):
            continue
        motif = {16: PIANO_COMPTEUR, 20: PIANO_REPERES}.get(debut, PIANO_A)
        for mesure in np.arange(debut, fin, 4):
            for pos, du, v in motif:
                t = mesure + pos
                if t >= fin:
                    continue
                voix = hauteurs(piano)
                for j, m in enumerate(voix):
                    f, _ = humain("piano", v * (1.08 if j == len(voix) - 1 else 1.0), 0.06)
                    P.ajouter("piano", t, min(du, fin - t), m, f)
    # Appui doux sur la coupe 38 (« PEA ou CTO ? ») : un accord de Fa#m en
    # voicing ouvert (fondamentale, 7e, tierce), à peine égrené. Sans lui, le
    # plan s'ouvrait sur le moment le plus creux du morceau : la nappe revient
    # avec une attaque de 0,6 s, et la première attaque n'arrivait qu'à 39.
    for j, m in enumerate(hauteurs("F#3 E4 A4")):
        P.ajouter("piano", 38.0 + j * 0.03, 1.8, m, 0.45 - 0.03 * j)
    # Touches discrètes de la pause (soulignements à 39 et 40) : Mi5 puis Fa#5,
    # une question qui monte.
    P.ajouter("piano", 39.0, 1.0, note("E5"), 0.55)
    P.ajouter("piano", 40.0, 1.0, note("F#5"), 0.60)
    # Accord final, légèrement arpégé (la première note tombe pile sur 56).
    for j, m in enumerate(hauteurs(GRILLE[-1][5])):
        P.ajouter("piano", 56.0 + j * 0.02, 1.6, m, 0.72 - 0.04 * j)


def ecrire_basse(P: Partition) -> None:
    # Bourdon de l'introduction (D2 → A1 → F#2 → E2), tenu et discret.
    for debut, fin, attaque, rel, force in ((0.0, 4.0, 0.8, 0.4, 0.55), (4.0, 6.0, 0.4, 0.4, 0.6), (6.0, 9.0, 0.3, 0.3, 0.55), (9.0, 12.0, 0.3, 0.05, 0.8)):
        P.ajouter("basse_tenue", debut, fin - debut, note(accord(debut)[3]), force, attaque=attaque, relache=rel)
    # Groove : basse à contretemps.
    for debut, fin, nom, b, *_ in GRILLE:
        if 12 <= debut < 24:
            motif, k = BASSE_A, 1.0
        elif 24 <= debut < 32 or 42 <= debut < 54:
            motif, k = BASSE_B, 1.0
        elif 32 <= debut < 36:
            motif, k = BASSE_A, 0.85
        else:
            continue
        for mesure in np.arange(debut, fin, 4):
            for pos, du, tr, v in motif:
                if mesure + pos < fin:
                    P.ajouter("basse", mesure + pos, du, note(b) + tr, v * k)
    # Transition 36–38 et pause : basse tenue, qui s'éteint puis revient. Le
    # Mi2 de 36 est éteint à 38 ; le Fa#2 de la pause attaque franchement sur
    # la coupe (4 ms, comme à 56) puis se pose sur un palier, sous la nappe.
    P.ajouter("basse_tenue", 36.0, 1.4, note("E2"), 0.75, attaque=0.004, relache=0.3)
    P.ajouter("basse_tenue", 38.0, 2.0, note("F#2"), 0.70, attaque=0.004, relache=0.3, declin=0.6, maintien=0.55)
    P.ajouter("basse_tenue", 40.0, 2.0, note("E2"), 0.75, attaque=0.3, relache=0.03)
    # Roulement 54–56 : deux croches qui poussent vers la fin, sans couvrir
    # l'accord final (première version : 0,85 et 0,95).
    P.ajouter("basse", 54.5, 0.36, note("E2"), 0.80)
    P.ajouter("basse", 55.5, 0.36, note("E2"), 0.85)
    # Accord final : La1 tenu, qui s'éteint naturellement.
    P.ajouter("basse_tenue", 56.0, 0.3, note("A1"), 1.0, attaque=0.004, relache=1.6, declin=1.1)
    P.ajouter("basse", 56.0, 0.5, note("A1"), 0.8)


def ecrire_batterie(P: Partition) -> None:
    # Battement grave discret 6–12 (un coup par temps), en crescendo net : il
    # porte la tension qui monte dès 6.
    for i, t in enumerate(range(6, 12)):
        P.ajouter("battement", t, force=0.40 + 0.08 * i)
    # Grosse caisse : chaque temps des décollages, et l'accord final (jamais
    # de décalage). Le temps 55, dernier de la montée, est adouci : l'élan ne
    # doit pas couvrir l'arrivée.
    debuts_mesure = {12, 16, 20, 24, 28, 32, 42, 46, 50, 54, 56}
    for t in list(range(12, 37)) + list(range(42, 57)):
        force = 1.0 if t in debuts_mesure else 0.94
        if t == 36:
            force = 0.85
        if t == 55:
            force = 0.80
        P.ajouter("grosse_caisse", t, force=force)
    # Clap sur les temps 2 et 4 (temps impairs : toutes les mesures commencent
    # sur un temps pair), plus léger dans le passage allégé 32–36, plus appuyé
    # au second décollage, où l'accroche et l'arpège occupent sa bande.
    for t in list(range(13, 36, 2)) + list(range(43, 54, 2)):
        f, d = humain("clap", 0.70 if 32 < t < 36 else 0.92, 0.06, 1.5)
        P.ajouter("clap", t, force=f, decalage_ms=d, gain_db=4.5 if t > 42 else 0.0)
    # Charleston fermé en doubles croches (accents, swing léger) ; ouvert à
    # contretemps dans les décollages et dans la variation 24–32 (le groove ne
    # retombe pas quand l'arpège entre) ; allégé (croches à contretemps) en
    # 32–36.
    for zone in ((12, 32), (42, 54)):
        for k in range(int((zone[1] - zone[0]) * 4)):
            t = zone[0] + k / 4
            if t in SILENCES_AVANT_SOUFFLE:
                continue
            pas = k % 16
            ouvert = (12 <= t < 32 or 42 <= t < 54) and pas % 4 == 2
            if ouvert:
                f, d = humain("charleston_ouvert", 0.75, 0.08, 1.5)
                P.ajouter("charleston", t, force=f, decalage_ms=d, ouvert=True)
                continue
            f, d = humain("charleston", ACCENTS_CHARLESTON[pas], 0.10, 1.5)
            sw = SWING * 1000 if pas % 2 else 0.0
            P.ajouter("charleston", t, force=f, decalage_ms=d + sw, swing_ms=sw)
    for k in range(4):
        f, d = humain("charleston", 0.80, 0.10, 1.5)
        P.ajouter("charleston", 32.5 + k, force=f, decalage_ms=d)
    # Shaker en doubles croches (à droite).
    for zone, (f0, f1) in (((9, 12), (0.25, 0.8)), ((12, 24), (0.6, 0.6)), ((24, 36), (0.8, 0.8)), ((42, 54), (0.85, 0.85))):
        for k in range(int((zone[1] - zone[0]) * 4)):
            t = zone[0] + k / 4
            if t in SILENCES_AVANT_SOUFFLE:
                continue
            p = (t - zone[0]) / (zone[1] - zone[0])
            f, d = humain("shaker", ACCENTS_SHAKER[k % 4] * (f0 + (f1 - f0) * p), 0.10, 1.5)
            sw = SWING * 1000 if k % 2 else 0.0
            P.ajouter("shaker", t, force=f, decalage_ms=d + sw, swing_ms=sw)
    # Cymbales : décollages (12, 42) et accord final (56) à pleine force,
    # changement d'accord à 46, plus légères à 24 et 50. Celle de l'accord
    # final s'éteint plus vite (nappe de 0,7 s au lieu de 1,1 s) : sa traîne
    # aiguë était ce qui restait le plus tard, au-dessus de l'accord éteint.
    for t, f, du, tau in ((12, 1.0, 3.0, 1.1), (24, 0.5, 2.5, 1.1), (42, 1.0, 3.0, 1.1), (46, 0.85, 3.0, 1.1), (50, 0.55, 2.5, 1.1),
                          (56, 1.0, 3.5, 0.7)):
        P.ajouter("cymbale", t, force=f, longueur=du, tau=tau)
    # Roulements de caisse claire qui accélèrent (noires, croches, doubles,
    # triples croches) jusqu'à la coupe, crescendo et hauteur qui monte
    # (début, positions, force de départ, durée sur laquelle se calcule le
    # crescendo). Celui de 54 s'arrête une double croche avant l'accord
    # final : ce petit silence fait ressortir l'arrivée.
    roulements = [(8.0, [0, 1, 2, 2.5, 3, 3.25, 3.5, 3.625, 3.75, 3.875], 0.25, 4.0),
                  (40.0, [0, 0.5, 1.0, 1.25, 1.5, 1.625, 1.75, 1.875], 0.30, 2.0),
                  (54.0, [0, 0.5, 1.0, 1.25, 1.5, 1.625], 0.35, 2.0)]
    for debut, positions, f0, total in roulements:
        for j, pos in enumerate(positions):
            p = pos / total
            ecart = positions[j + 1] - pos if j + 1 < len(positions) else 0.125
            f, d = humain("caisse_claire", f0 + (0.95 - f0) * p**1.3, 0.05, 2.0)
            P.ajouter("caisse_claire", debut + pos, force=f, decalage_ms=d, hauteur=1.0 + 0.25 * p, longueur=min(1.0, 0.4 + ecart))
    # Petit appel avant la variation de 24.
    for t, f in ((23.5, 0.35), (23.75, 0.5)):
        P.ajouter("caisse_claire", t, force=f, hauteur=1.1, longueur=0.6)


def ecrire_melodie(P: Partition) -> None:
    for t, n, f, effet in CLOCHE:
        # Logo de l'introduction : énoncé doucement. Son La4 n'est tenu que
        # 1,6 temps : tenu 2,6 temps, il sonnait encore quand la nappe de
        # Fa#m9 fait entrer Sol#4 à 6, une seconde mineure sur la première
        # coupe. Do#5 et Mi5 sont des notes de Fa#m9 : ils gardent leurs
        # 2,6 temps. Accord final : la cloche résonne librement 1 s, puis
        # elle est étouffée (ETOUFFEMENT_FINAL) et s'éteint d'elle-même avant
        # la fin du morceau.
        douceur = 0.6 if t < 6 else 1.0
        duree = 1.6 if t < 4.5 else (3.6 if t >= 56 else 2.6)
        # Les repères des décollages (12 à 56) gardent la même attaque, mais
        # leur corps s'éteint en 1,2 s au lieu de 1,9 s : tenues 1,5 s avec
        # réverbération, leurs fondamentales (La4, Do#5, Mi5) faisaient une
        # bosse de +6 dB à 500 Hz dans le spectre du morceau. Le logo de
        # l'introduction et le La5 final gardent leur longue résonance.
        tau = 1.2 if 12 <= t < 56 else 1.9
        if t >= 56:
            P.ajouter("cloche", t, duree, note(n), f * douceur, repere=effet, tau=tau, etouffement=ETOUFFEMENT_FINAL)
        else:
            P.ajouter("cloche", t, duree, note(n), f * douceur, repere=effet, tau=tau)
    for ins, n, f in DOUBLURES_LA5:
        if ins == "cloche":
            P.ajouter(ins, 56.0, 3.6, note(n), f, etouffement=ETOUFFEMENT_FINAL)
        else:
            P.ajouter(ins, 56.0, 0.5, note(n), f)
    for t, n in PINGS:
        P.ajouter("grimpee", t, 0.25, note(n), 0.8)
    for j, (t, n) in enumerate(GRIMPEE):
        P.ajouter("grimpee", t, 0.2, note(n), 0.5 + 0.07 * j)
    for t, du, n, f in ACCROCHE:
        P.ajouter("lead", t, du, note(n), f)
    # Arpège : 24–37,5 (il s'éteint avec le filtre), puis 42–54, plus discret.
    for debut, fin, nom, _, _, _, arp in GRILLE:
        if arp is None or not (24 <= debut < 38 or 42 <= debut < 54):
            continue
        # Au second décollage, l'arpège passe une octave au-dessus de la mélodie
        # (scintillement) au lieu de la croiser.
        cellule = [m + (12 if debut >= 42 else 0) for m in hauteurs(arp)]
        origine = 24 if debut < 38 else 42
        for k in range(int((fin - debut) * 4)):
            t = debut + k / 4
            if 37.5 <= t < 42:
                break
            pas = int(round((t - origine) * 4)) % 16
            f, _ = humain("arpege", 1.0 if pas in ACCENTS_ARPEGE else 0.62, 0.08)
            P.ajouter("arpege", t, 0.2, cellule[MOTIF_ARPEGE[pas]], f)
    # Scintillement de l'introduction : étincelles aiguës dans la pentatonique
    # de La, tirées au hasard (graine fixe), plus denses au milieu du logo.
    r = M.generateur(4242)
    penta = [note(n) for n in ("A5", "B5", "C#6", "E6", "F#6", "A6")]
    for k in range(2, 44):
        t = k / 4
        densite = 0.55 * np.sin(np.pi * min(1.0, t / 11.0)) + 0.1
        if r.random() < densite:
            P.ajouter("etincelle", t, 0.5, int(r.choice(penta)), float(r.uniform(0.3, 0.65)), pan=float(r.uniform(-0.7, 0.7)))
    for k, (t, n) in enumerate(((56.5, "E6"), (57.0, "A6"), (57.75, "C#6"))):
        P.ajouter("etincelle", t, 0.5, note(n), 0.45 - 0.08 * k, pan=(-0.5, 0.5, 0.0)[k])


def ecrire_effets(P: Partition) -> None:
    P.ajouter("air", 0.0, 12.0, force=1.0, attaque=1.0, relache=1.5)
    P.ajouter("air", 38.0, 4.0, force=0.8, attaque=0.8, relache=0.5)
    # Souffles inversés et montées : leur crête tombe PILE sur la coupe. Ceux
    # de 24, 32 et 50 doivent dépasser le charleston, le shaker et l'arpège
    # qui jouent en même temps (dans la première version, ils restaient 0,5 à
    # 8 dB dessous dans chaque bande d'aigus : aucune transition audible). Le
    # souffle de 6 garde sa force : plus discret (0,40, essayé), il ne
    # dépassait plus assez l'air de l'introduction pour s'arrêter net sur la
    # coupe (8 ms d'écart mesuré au lieu de 4).
    P.ajouter("souffle_inverse", 4.5, 1.5, force=0.55, tau=0.30)
    P.ajouter("montee", 8.0, 4.0, force=1.0)
    P.ajouter("cymbale_inversee", 10.0, 2.0, force=0.9)
    P.ajouter("cymbale_inversee", 22.75, 1.25, force=0.9)
    P.ajouter("souffle_inverse", 31.0, 1.0, force=1.6, tau=0.22)
    P.ajouter("descente", 36.0, 2.0, force=1.0)
    P.ajouter("montee", 40.0, 2.0, force=0.9)
    P.ajouter("cymbale_inversee", 40.5, 1.5, force=1.0)
    P.ajouter("souffle_inverse", 49.0, 1.0, force=1.5, tau=0.22)
    # Montée vers l'accord final : elle mène à l'arrivée sans la couvrir.
    P.ajouter("montee", 54.0, 2.0, force=0.65)
    P.ajouter("cymbale_inversee", 54.5, 1.5, force=0.6)
    # Impacts : les deux décollages et l'accord final, qui porte seul la fin
    # (l'effet impact-doux de la feuille de montage sera retiré).
    # L'impact final dure 3,6 temps : son grondement a fini de décroître quand
    # il est relâché (à 3 temps, il était encore coupé net à -39 dBFS).
    for t, f, du in ((12, 0.85, 1.2), (42, 1.0, 1.2), (56, 1.0, 3.6)):
        P.ajouter("impact", t, du, force=f)


# ─── Automations (temps, valeur) ─────────────────────────────────────────────

# Coupure du passe-bas de la nappe (Hz) : elle s'ouvre au logo, se ferme à la
# descente 36–38, se rouvre pendant la montée 40–42, plus lumineuse à 50.
NAPPE_COUPURE = [(0, 420), (6, 2400), (11.9, 6000), (12, 8500), (35.9, 8500), (38, 650), (38.1, 1300), (40, 1700),
                 (41.9, 8500), (49.9, 8500), (50, 11000), (56, 11000), (57, 7000), (60, 2500)]
# Niveau de la nappe (dB) : crescendo dans la montée, en retrait sous le
# groove, devant pendant la pause ; à l'accord final, elle sonne pleinement
# (c'est l'accord du logo, au-dessus du piano) et s'éteint d'elle-même.
NAPPE_NIVEAU = [(0, 0.2), (6, -0.8), (8, 0.5), (10, 3.0), (11.9, 3.5), (12.05, -1.5), (23.9, -1.5), (24.05, -2), (35.9, -2), (37.9, -6), (38.05, 1), (41.9, 2), (42.05, -1),
                (49.9, -1), (50.05, 0), (53.9, 0), (54.05, 1), (55.9, 1), (56.05, 0), (60, 0)]
# Brillance de l'arpège (Hz) et niveau (dB). Il entre devant à 24 (c'est la
# nouvelle couche de la variation, qui doit élever l'énergie au lieu de la
# faire baisser), puis se range peu à peu.
ARPEGE_BRILLANCE = [(24, 5000), (31.9, 5000), (32.1, 2800), (36, 2800), (37.5, 600), (42, 5000), (54, 6000)]
ARPEGE_NIVEAU = [(24, 2.5), (28, 1.5), (32, 0.5), (32.1, -2), (36, -3), (37.5, -9), (42, -7), (54, -6)]
# Retours de réverbération et d'écho à la fin : à partir de 58,6, quand le
# son direct de l'accord final est presque éteint, leur queue décroît plus
# vite (-30 dB à 60). Le morceau s'éteint ainsi de lui-même ; le fondu de
# sortie ne sert plus qu'aux 0,25 dernières secondes.
RETOURS_FIN = [(0, 0.0), (58.6, 0.0), (60, -30.0)]
# Part des creux d'égalisation de la nappe (400 Hz) et de la cloche (520 Hz)
# (0 : son plein, 1 : creux entier) : seulement quand la basse du groove joue
# (12–36, 42–56), où le bas-médium est encombré. Dans l'introduction, la
# pause et l'accord final, la nappe est presque seule dans ce registre : creusée,
# elle faisait perdre 1,2 dB à l'introduction.
CREUX_GROOVE = [(0, 0.0), (11.9, 0.0), (12, 1.0), (36, 1.0), (38, 0.0), (41.9, 0.0), (42, 1.0), (55.9, 1.0), (56, 0.0), (60, 0.0)]


def lire_automation(points, temps: float, expo: bool = False) -> float:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    if expo:
        return float(np.exp(np.interp(temps, xs, np.log(ys))))
    return float(np.interp(temps, xs, ys))


def courbe_automation(points, expo: bool = False, lissage: float = 0.02) -> np.ndarray:
    """Automation sur tout le morceau, lissée sur 20 ms : un changement de
    niveau, même brusque dans la liste, ne peut pas créer de claquement."""
    t = np.arange(N) / ECH_PAR_TEMPS
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    c = np.exp(np.interp(t, xs, np.log(ys))) if expo else np.interp(t, xs, ys)
    return uniform_filter1d(c, size=ech(lissage), mode="nearest")


# ─── Mixage ──────────────────────────────────────────────────────────────────

# Niveau de chaque instrument (facteur appliqué à chaque note).
NIVEAU = {
    "grosse_caisse": 0.50, "battement": 0.24, "clap": 0.40, "charleston": 0.30, "charleston_ouvert": 0.17,
    "shaker": 0.11, "cymbale": 0.16, "caisse_claire": 0.24,
    "basse": 0.31, "basse_tenue": 0.078,
    "nappe": 0.11, "piano": 0.135, "pulse": 0.075,
    "cloche": 0.17, "grimpee": 0.11, "lead": 0.17, "arpege": 0.075, "etincelle": 0.04,
    "impact": 0.38, "montee": 0.10, "souffle_inverse": 0.075, "cymbale_inversee": 0.11, "descente": 0.09, "air": 0.004,
}
# Envois vers la réverbération longue, la courte et l'écho pointé (facteurs).
ENVOIS = {
    "clap": (0.0, 0.35, 0.0), "caisse_claire": (0.15, 0.30, 0.0), "charleston": (0.0, 0.12, 0.0), "cymbale": (0.10, 0.0, 0.0),
    "nappe": (0.30, 0.0, 0.0), "piano": (0.25, 0.0, 0.10), "pulse": (0.22, 0.0, 0.16),
    "cloche": (0.40, 0.0, 0.30), "grimpee": (0.25, 0.0, 0.25), "lead": (0.25, 0.0, 0.16), "arpege": (0.25, 0.0, 0.40),
    "etincelle": (0.70, 0.0, 0.40), "souffle_inverse": (0.10, 0.0, 0.0), "montee": (0.08, 0.0, 0.0), "impact": (0.06, 0.0, 0.0),
}
# Bus de chaque instrument (les pistes séparées).
BUS = {
    "batterie": ["grosse_caisse", "battement", "clap", "charleston", "shaker", "cymbale", "caisse_claire"],
    "basse": ["basse", "basse_tenue"],
    "harmonie": ["nappe", "piano", "pulse"],
    "melodie": ["cloche", "grimpee", "lead", "arpege", "etincelle"],
    "effets": ["impact", "montee", "souffle_inverse", "cymbale_inversee", "descente", "air"],
}
# Compression latérale (dB au plus fort d'un coup de grosse caisse).
DUCKING_DB = {"basse": 5.0, "nappe": 6.0, "piano": 3.5, "pulse": 3.0, "retours": 5.0}


def rendre_evenement(ev: dict):
    """Son d'un événement et sa position de départ (échantillon)."""
    ins, t, du, m, f = ev["instrument"], ev["debut"], ev["duree"], ev["midi"], ev["force"]
    graine = int(round(t * 1000)) + (m or 0) * 7
    pan = ev.get("pan")
    if ins == "grosse_caisse":
        son = I.grosse_caisse(f, graine)
    elif ins == "battement":
        son = I.battement(f)
    elif ins == "clap":
        son = I.clap(f, graine) * db(ev.get("gain_db", 0.0))
    elif ins == "charleston":
        son, pan = I.charleston(f, ev.get("ouvert", False), graine), (-0.25 if ev.get("ouvert") else -0.15)
        if ev.get("ouvert"):
            son = son * (NIVEAU["charleston_ouvert"] / NIVEAU["charleston"])
    elif ins == "shaker":
        son, pan = I.shaker(f, graine), 0.35
    elif ins == "cymbale":
        son = I.cymbale(f, ev.get("longueur", 3.0), graine, tau=ev.get("tau", 1.1))
    elif ins == "caisse_claire":
        son = I.caisse_claire(f, ev.get("hauteur", 1.0), graine, ev.get("longueur", 1.0))
    elif ins == "basse":
        # Couche médium plus forte (×1,8, +5 dB), plus brillante (2,2 kHz) et
        # pincée à l'attaque (filtre ouvert à 5 kHz qui se referme en 70 ms) :
        # c'est elle qu'on entend sur un ordinateur portable ou un téléphone.
        # Au second décollage (42–54), l'accroche, l'arpège et le clap occupent
        # 0,6 à 2,4 kHz : la couche médium y est encore un peu plus forte
        # (×2,6). Pas dans la montée 54–56 : l'élan ne doit pas couvrir l'accord final.
        son = I.basse(m, sec(du), f, brillance=2200.0, part_medium=2.6 if 42 <= t < 54 else 1.8, brillance_attaque=5000.0)
    elif ins == "basse_tenue":
        son = f * I.basse_tenue(m, sec(du), ev["attaque"], ev["relache"], ev.get("declin"), ev.get("maintien", 0.0))
    elif ins == "nappe":
        son = I.nappe(m, sec(du), ev["attaque"], ev["relache"], graine)
    elif ins == "piano":
        son = I.piano_fm(m, sec(du), f)
    elif ins == "pulse":
        son = I.pluck(m, sec(du), f, brillance=ev["brillance"], tau=0.12, raideur=0.8, largeur_=0.2)
    elif ins == "cloche":
        son = I.cloche(m, f, sec(du), ev.get("tau", 1.9), ev.get("etouffement"))
    elif ins == "grimpee":
        son = I.pluck(m, sec(du), f, brillance=3500.0, tau=0.25, raideur=0.5)
    elif ins == "arpege":
        son = I.pluck(m, sec(du), f, brillance=lire_automation(ARPEGE_BRILLANCE, t, expo=True), tau=0.22, raideur=0.55)
        son = son * db(lire_automation(ARPEGE_NIVEAU, t))
    elif ins == "etincelle":
        son = I.etincelle(m, f)
    elif ins == "impact":
        son = I.impact(f, sec(du), graine)
    elif ins == "montee":
        son = f * I.montee(sec(du), graine)
    elif ins == "souffle_inverse":
        son = f * I.souffle_inverse(sec(du), graine, tau=ev.get("tau", 0.35))
    elif ins == "cymbale_inversee":
        son = f * I.cymbale_inversee(sec(du), graine)
    elif ins == "descente":
        son = f * I.descente(sec(du), graine)
    elif ins == "air":
        son = f * I.air(sec(du), graine, ev["attaque"], ev["relache"])
    else:
        raise ValueError(ins)
    return (son, pan), e(t) + ech(ev.get("decalage_ms", 0.0) / 1000.0)


def rendre(P: Partition) -> dict[str, np.ndarray]:
    """Calcule chaque instrument sur sa propre piste (stéréo, durée du morceau)."""
    pistes = {nom: Piste(nom, N) for bus in BUS.values() for nom in bus}
    for ev in P.evenements:
        if ev["instrument"] == "lead":
            continue
        (son, pan), debut = rendre_evenement(ev)
        pistes[ev["instrument"]].ajouter(son, debut, NIVEAU[ev["instrument"]], pan)
    # L'accroche est une phrase liée : un seul oscillateur continu (portamento
    # entre les notes, vibrato sur les notes longues).
    lead = [ev for ev in P.evenements if ev["instrument"] == "lead"]
    t0 = lead[0]["debut"]
    phrase = [(sec(ev["debut"] - t0), sec(ev["duree"]), ev["midi"], ev["force"]) for ev in lead]
    pistes["lead"].ajouter(I.phrase_lead(phrase), e(t0), NIVEAU["lead"])
    return {nom: p.x for nom, p in pistes.items()}


def declencheurs_ducking(P: Partition):
    """Coups qui déclenchent la compression latérale : grosse caisse,
    battement de l'introduction (légèrement) et impacts (plus fort)."""
    d = [(e(ev["debut"]), ev["force"]) for ev in P.evenements if ev["instrument"] == "grosse_caisse"]
    d += [(e(ev["debut"]), 1.3) for ev in P.evenements if ev["instrument"] == "impact"]
    d += [(e(ev["debut"]), 0.35 * ev["force"]) for ev in P.evenements if ev["instrument"] == "battement"]
    return d


def creux_variable(x: np.ndarray, filtre, points) -> np.ndarray:
    """Applique `filtre` (un creux d'égalisation) en proportion d'une
    automation (0 : signal intact, 1 : filtré). Les passages se font sous un
    impact ou pendant la descente, et sont lissés (courbe_automation)."""
    return x + courbe_automation(points) * (M.filtrer(x, filtre) - x)


def mixer(P: Partition, pistes: dict[str, np.ndarray]) -> dict[str, np.ndarray]:
    """Traitements par instrument, envois, retours, compression latérale.
    Rend les six bus (les pistes séparées), avant le mastering."""
    sc = declencheurs_ducking(P)
    duck = {nom: M.courbe_ducking(N, sc, p) for nom, p in DUCKING_DB.items()}

    # Nappe : passe-haut 180 Hz (pas de boue), léger creux à 400 Hz quand la
    # basse du groove joue (la place de ses harmoniques), passe-bas qui
    # s'ouvre et se ferme (automation), niveau, compression latérale.
    x = M.filtrer(pistes["nappe"], M.butterworth("passe-haut", 180.0, 2))
    x = creux_variable(x, M.biquad("cloche", 400.0, 1.0, -2.5), CREUX_GROOVE)
    x = M.filtre_variable(x, lambda f, t: M.reponse_passe_bas(f[:, None], np.exp(np.interp(t / SEC_PAR_TEMPS,
                          [p[0] for p in NAPPE_COUPURE], np.log([p[1] for p in NAPPE_COUPURE])))[None, :], 2, resonance_db=1.5))
    x = M.filtrer(x, M.biquad("cloche", 3000.0, 1.0, -2.0))
    pistes["nappe"] = x * db(courbe_automation(NAPPE_NIVEAU))

    # Piano électrique : passe-haut 200 Hz (il tient seul le bas-médium des
    # décollages, sans l'épaissir), trémolo stéréo (croches, ±25 %).
    p = M.filtrer(pistes["piano"], M.butterworth("passe-haut", 200.0, 2))
    mono = p[0] + p[1]
    t = np.arange(N) / FE
    pistes["piano"] = M.panoramique(mono / np.sqrt(2.0), 0.25 * np.sin(2 * np.pi * 4.0 * t))
    pistes["pulse"] = M.filtrer(pistes["pulse"], M.butterworth("passe-haut", 160.0, 2))
    for nom in ("arpege", "grimpee"):
        pistes[nom] = M.filtrer(pistes[nom], M.butterworth("passe-haut", 220.0, 2))
    # Accroche : léger creux à 1,5 kHz, la bande où le clap a son corps.
    pistes["lead"] = M.filtrer(pistes["lead"], M.chaine(M.butterworth("passe-haut", 220.0, 2), M.biquad("cloche", 1500.0, 1.4, -2.0)))
    # Cloche : léger creux de 1,5 dB vers 520 Hz pendant le groove, avec la
    # tenue plus courte des repères (ecrire_melodie), contre la bosse de
    # 500 Hz. Plus profond (2,5 dB, essayé), il retirait autant à l'émergence
    # des repères.
    pistes["cloche"] = M.filtrer(pistes["cloche"], M.butterworth("passe-haut", 150.0, 2))
    pistes["cloche"] = creux_variable(pistes["cloche"], M.biquad("cloche", 520.0, 1.2, -1.5), CREUX_GROOVE)

    # Envois (avant compression latérale) et retours.
    envoi = {k: np.zeros((2, N)) for k in ("longue", "courte", "echo")}
    for nom, (lg, ct, ec) in ENVOIS.items():
        envoi["longue"] += lg * pistes[nom]
        envoi["courte"] += ct * pistes[nom]
        envoi["echo"] += ec * pistes[nom]
    ri_longue = M.reponse_reverb(3.6, 2.9, 1.1, 0.028, graine=31)
    ri_courte = M.reponse_reverb(1.0, 0.75, 0.35, 0.015, graine=32, reflexions=10)
    ri_echo = M.reponse_echo(sec(0.75), 0.42, 7, passe_bas=4500.0, passe_haut=300.0)
    echo = M.convoluer(envoi["echo"], ri_echo)
    retour_longue = M.convoluer(envoi["longue"] + 0.30 * echo, ri_longue)
    retour_courte = M.convoluer(envoi["courte"], ri_courte)
    filtre_retour = M.chaine(M.butterworth("passe-haut", 200.0, 2), M.butterworth("passe-bas", 8000.0, 2))
    retours = M.filtrer(retour_longue + 0.8 * retour_courte, filtre_retour) + M.filtrer(echo, M.butterworth("passe-haut", 250.0, 2))

    # Compression latérale déclenchée par la grosse caisse ; extinction plus
    # rapide de la queue des retours à la fin (RETOURS_FIN).
    pistes["basse"] = pistes["basse"] * duck["basse"]
    pistes["nappe"] = pistes["nappe"] * duck["nappe"]
    pistes["piano"] = pistes["piano"] * duck["piano"]
    pistes["pulse"] = pistes["pulse"] * duck["pulse"]
    retours = retours * duck["retours"] * db(courbe_automation(RETOURS_FIN))

    # Les graves restent mono : grosse caisse, basse et impacts sont mono, et
    # tout ce qui est stéréo (nappe, retours…) est coupé sous 150–250 Hz.
    bus = {nom: sum(pistes[i] for i in membres) for nom, membres in BUS.items()}
    bus["retours"] = retours
    return bus


def fondu_sortie() -> np.ndarray:
    """Facteur appliqué au mélange : le premier échantillon part de zéro
    (montée de 2 ms) et un fondu en cosinus couvre les 0,25 dernières
    secondes (temps 59,5 à 60). L'accord final s'est déjà éteint de lui-même
    (cloches étouffées à partir de 57, nappe relâchée vers 59,2,
    retours accélérés à partir de 58,6) : ce fondu
    garantit seulement qu'il ne reste rien au dernier échantillon. (Dans la
    première version, il durait de 58,4 à 60 et faisait l'essentiel de la
    descente, avec une pente qui passait brusquement de -9 à -48 dB/s.)"""
    fondu = np.ones(N)
    a, b = e(59.5), N
    fondu[a:b] = 0.5 + 0.5 * np.cos(np.pi * np.arange(b - a) / (b - a - 1))
    fondu[:ech(0.002)] *= M.rampe(ech(0.002))
    return fondu


def masteriser(somme: np.ndarray):
    """Égalisation douce, compression de bus 2:1 à attaque lente, saturation
    légère, limiteur à crête vraie, sonie -16 LUFS. Rend (signal, gain
    linéaire appliqué par échantillon, égalisation) pour reporter le même
    traitement sur les pistes séparées."""
    eq = M.chaine(M.butterworth("passe-haut", 25.0, 2), M.biquad("plateau-grave", 100.0, 0.7, -2.0), M.biquad("cloche", 3500.0, 0.8, 1.5),
                  M.biquad("plateau-aigu", 6000.0, 0.7, 3.0))
    x = M.filtrer(somme, eq)
    g0 = float(db(-19.0 - mesures.sonie_integree(x)))
    x = x * g0
    x, g_comp = M.compresseur(x, seuil_db=-17.0, ratio=2.0, attaque=0.03, relache=0.25, genou_db=6.0)
    x = M.saturer(x, 1.25, melange=0.6)
    gain = 1.0
    for _ in range(6):
        y, g_lim = M.limiteur(x * gain, plafond_dbtp=-1.8)
        l = mesures.sonie_integree(y)
        if abs(l + 16.0) < 0.02:
            break
        gain *= float(db(-16.0 - l))
    fondu = fondu_sortie()
    y = y * fondu
    return y, g0 * g_comp * gain * g_lim * fondu, eq


def partition_json(P: Partition, mesures_finales: dict) -> dict:
    reperes = [dict(temps=t, note=n, midi=note(n), effet=eff) for t, n, _, eff in CLOCHE if eff]
    transitions = []
    for ev in P.evenements:
        if ev["instrument"] in ("impact", "cymbale"):
            transitions.append(dict(type=ev["instrument"], temps=ev["debut"]))
        elif ev["instrument"] in ("montee", "souffle_inverse", "cymbale_inversee"):
            transitions.append(dict(type=ev["instrument"], debut=ev["debut"], temps=ev["debut"] + ev["duree"]))
        elif ev["instrument"] == "descente":
            transitions.append(dict(type="descente", debut=ev["debut"], temps=ev["debut"] + ev["duree"]))
    return dict(
        tempo=TEMPO, fe=FE, echantillons_par_temps=ECH_PAR_TEMPS, nb_temps=NB_TEMPS, coupes=COUPES,
        grille=[dict(debut=a[0], fin=a[1], nom=a[2], basse=a[3], nappe=a[4], piano=a[5], arpege=a[6]) for a in GRILLE],
        evenements=P.evenements, reperes=reperes, transitions=sorted(transitions, key=lambda d: d["temps"]),
        bus=BUS, enveloppes=dict(M.STATS), mastering=mesures_finales,
        mixage=dict(niveaux=NIVEAU, envois_longue_courte_echo=ENVOIS, compression_laterale_db=DUCKING_DB, swing_ms=SWING * 1000,
                    reverb_longue=dict(tr60_grave_s=2.9, tr60_aigu_s=1.1, predelai_ms=28), reverb_courte=dict(tr60_grave_s=0.75, tr60_aigu_s=0.35, predelai_ms=15),
                    echo=dict(retard_temps=0.75, retard_s=sec(0.75), retour=0.42, ping_pong=True)),
    )


def main() -> None:
    debut = time.time()
    P = Partition()
    ecrire_harmonie(P)
    ecrire_basse(P)
    ecrire_batterie(P)
    ecrire_melodie(P)
    ecrire_effets(P)
    print(f"Partition : {len(P.evenements)} événements")

    pistes = rendre(P)
    print(f"Rendu des instruments : {time.time() - debut:.1f} s")
    bus = mixer(P, pistes)
    print(f"Mixage : {time.time() - debut:.1f} s")

    somme = sum(bus.values())
    final, gain, eq = masteriser(somme)
    lufs = mesures.sonie_integree(final)
    tp = mesures.crete_vraie_db(final)
    print(f"Mastering : {lufs:.2f} LUFS, crête vraie {tp:.2f} dBTP ({time.time() - debut:.1f} s)")

    FICHIER_MUSIQUE.parent.mkdir(parents=True, exist_ok=True)
    (DOSSIER / "pistes").mkdir(parents=True, exist_ok=True)
    M.ecrire_wav_16(FICHIER_MUSIQUE, final, graine=2026)
    # Pistes séparées : même égalisation et même gain que le mélange final
    # (compression, limiteur, fondu), sans la saturation ni le dither ; leur
    # somme est le morceau à la saturation près.
    for nom, x in bus.items():
        M.ecrire_wav_flottant(DOSSIER / "pistes" / f"{nom}.wav", M.filtrer(x, eq) * gain)
    with open(DOSSIER / "partition.json", "w", encoding="utf-8") as f:
        json.dump(partition_json(P, dict(sonie_lufs=round(lufs, 2), crete_vraie_dbtp=round(tp, 2))), f, ensure_ascii=False, indent=1)
    print(f"✓ {FICHIER_MUSIQUE.relative_to(VIDEO)} ({N} échantillons, {N / FE:.3f} s) et out/musique/ en {time.time() - debut:.1f} s")


if __name__ == "__main__":
    sys.exit(main())
