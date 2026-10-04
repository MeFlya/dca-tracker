# Contrôle objectif de la musique : personne ne peut l'écouter ici, alors on
# la mesure et on la regarde.
#
# Lancer : python3 musique/analyse.py      (après composer.py)
#
# Lit public/musique.wav, out/musique/pistes/*.wav et out/musique/partition.json,
# et écrit dans out/musique/ :
#   rapport.json          toutes les mesures, et le verdict de chaque contrôle
#                         (dont l'équilibre des pistes sur un petit haut-parleur
#                         et les attaques rapprochées de la partition)
#   spectrogramme.png     fréquences en échelle logarithmique, coupes et temps ;
#                         en bas, les aigus des pistes tonales (le repliement
#                         s'y verrait comme des raies qui descendent)
#   sonie.png             sonie à court terme (3 s) et momentanée (400 ms)
#   spectres-pistes.png   spectre moyen de chaque piste séparée
#   piano-roll.png        la partition, les coupes, les effets de la feuille
#                         de montage (src/son/BandeSon.tsx) et les
#                         attaques détectées dans le mélange
#
# Avant de mesurer, chaque instrument de mesure est étalonné sur des signaux
# dont on connaît la réponse : sinus à -20 dBFS (doit lire -20,0 LUFS), sinus à
# 12 kHz dont les échantillons tombent à -3,01 dB de la vraie crête (doit lire
# 0,0 dBTP), clics artificiels glissés dans la musique (le détecteur doit tous
# les trouver, et rien d'autre), note sans attaque (doit être signalée), note
# avec l'attaque de 1,5 ms du moteur et dents de scie (ne doivent pas l'être),
# douze coups et notes posés à des instants connus sur une nappe qui bat (le
# détecteur d'attaques doit tous les dater à 3 ms près, sans en inventer).

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True  # pas de dossier __pycache__ dans musique/ : il finirait dans un commit

import numpy as np  # noqa: E402
from scipy import signal  # noqa: E402
from scipy.io import wavfile  # noqa: E402
from scipy.ndimage import maximum_filter1d, uniform_filter1d  # noqa: E402

import matplotlib  # noqa: E402

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Rectangle  # noqa: E402

import mesures  # noqa: E402
from moteur import FE, enveloppe, note, surechantillonner  # noqa: E402

ICI = Path(__file__).resolve().parent
VIDEO = ICI.parent
FICHIER_MUSIQUE = VIDEO / "public" / "musique.wav"
DOSSIER = VIDEO / "out" / "musique"
PISTES = ["batterie", "basse", "harmonie", "melodie", "effets", "retours"]

ECH_PAR_TEMPS = 24000
NB_TEMPS = 60
N_ATTENDU = NB_TEMPS * ECH_PAR_TEMPS
PLANS = [("C1 logo", 0, 6), ("C2 questions", 6, 12), ("C3 simuler", 12, 24), ("C4 comparer", 24, 32), ("C5 liste PEA", 32, 38),
         ("C6 PEA ou CTO", 38, 42), ("C7 suivre", 42, 50), ("C8 premium", 50, 56), ("C9 fin", 56, 60)]
BANDES = [("sub", 20, 60), ("grave", 60, 200), ("bas-medium", 200, 500), ("medium", 500, 2000), ("presence", 2000, 5000),
          ("aigus", 5000, 10000), ("air", 10000, 20000)]
COULEURS = {"batterie": "#64748b", "basse": "#b45309", "harmonie": "#0f766e", "melodie": "#1d4ed8", "effets": "#7c3aed",
            "retours": "#94a3b8", "mélange": "#0f172a"}


def temps(echantillon) -> float:
    return np.asarray(echantillon) / ECH_PAR_TEMPS


def lire_wav(chemin: Path) -> np.ndarray:
    fe, x = wavfile.read(str(chemin))
    assert fe == FE, f"{chemin.name} : {fe} Hz"
    if x.dtype == np.int16:
        x = x.astype(np.float64) / 32768.0
    return np.asarray(x, dtype=np.float64).T


def r(v, n=2):
    return None if v is None else round(float(v), n)


# ─── Détection des clics ─────────────────────────────────────────────────────


# Passe-haut à 21 kHz (1 023 coefficients, -120 dB sous 20,6 kHz) : il isole
# la « bande de garde » 21–24 kHz, où la musique n'émet presque rien : le
# dither, et l'étalement des attaques les plus raides (cymbales, arrêts des
# montées), jusqu'à -83 dBFS (moteur.py). Le seuil est relatif au niveau
# local de la bande : juste après ces attaques, le détecteur est moins sensible.
_FIR_GARDE = signal.firwin(1023, 21000.0, pass_zero=False, fs=FE, window=("kaiser", 12.0))


def detecter_clics(x: np.ndarray, seuil: float = 10.0, plancher: float = 2e-5) -> list[dict]:
    """Clics = impulsions dans la bande de garde (21 à 24 kHz).

    Tout le morceau est synthétisé sous 20 kHz (oscillateurs à bande limitée,
    bruits filtrés à la source, FM et saturation calculées à 192 kHz puis
    filtrées). Une note qui démarre ou s'arrête en douceur n'émet rien
    au-dessus ; un saut d'échantillon (note coupée net, gain qui saute, bloc
    mal recollé, échantillons manquants), si : son spectre s'étend jusqu'à
    24 kHz. On regarde donc l'enveloppe (transformée de Hilbert) de cette
    bande, et on retient les pointes :
    - au moins `seuil` fois le niveau habituel de la bande avant ET après
      (médianes entre 0,5 et 3 ms de part et d'autre) ;
    - étroites (au plus 32 échantillons, 0,7 ms, au-dessus de la mi-hauteur) :
      les restes du filtrage des sons FM durent plusieurs millisecondes ;
    - au-dessus de `plancher` (2e-5, -94 dBFS, sous le pas de quantification
      d'un fichier 16 bits)."""
    h = signal.fftconvolve(x, _FIR_GARDE, mode="same")
    env = np.abs(signal.hilbert(h))
    moy = uniform_filter1d(env, 289)
    pics = np.flatnonzero((env > 4.0 * moy) & (env > plancher) & (env >= maximum_filter1d(env, 49)))
    clics = []
    for i in pics:
        if i < 200 or i > len(env) - 200:
            continue
        fond = max(float(np.median(env[i - 150 : i - 24])), float(np.median(env[i + 24 : i + 150])), 1e-12)
        if env[i] < seuil * fond or np.sum(env[i - 48 : i + 49] > env[i] / 2) > 32:
            continue
        clics.append(dict(echantillon=int(i), seconde=r(i / FE, 4), temps=r(temps(i), 3), niveau_dbfs=r(20 * np.log10(env[i]), 1),
                          rapport_au_fond_db=r(20 * np.log10(env[i] / fond), 1)))
    return clics


def clics_signal(x: np.ndarray) -> list[dict]:
    """Clics sur chaque canal d'un signal stéréo."""
    tous = []
    for c, nom in enumerate(("gauche", "droite")):
        for k in detecter_clics(x[c]):
            k["canal"] = nom
            tous.append(k)
    return tous


# ─── Attaques ────────────────────────────────────────────────────────────────


def enveloppe_db(x: np.ndarray, fenetre: int = 48) -> np.ndarray:
    """Niveau efficace glissant sur 1 ms, en dB."""
    p = signal.fftconvolve(x**2, np.ones(fenetre) / fenetre, mode="same")
    return 10 * np.log10(np.maximum(p, 1e-14))


# Bandes d'un quart d'octave, de 40 Hz à 16 kHz (37 bandes).
_CENTRES = 40.0 * 2.0 ** (np.arange(int(np.log2(16000.0 / 40.0) * 4) + 1) / 4)


def montees_par_bande(x: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Montées de niveau, bande par bande. Spectre sur 21 ms, tous les 2 ms,
    regroupé en bandes d'un quart d'octave et passé en logarithme ; dans
    chaque bande, la hausse depuis 8 ms plus tôt, comptée par rapport au plus
    fort de la bande et de ses deux voisines (une note qui glisse ou qui vibre
    ne passe pas pour une attaque : méthode « SuperFlux »). Une hausse de 0,5
    vaut environ +10 dB. Rend (mono, instants des tranches en s, niveaux,
    hausses), niveaux et hausses en (bandes, tranches)."""
    mono = 0.5 * (x[0] + x[1])
    n_fft, saut, retard = 1024, 96, 4
    tf = signal.ShortTimeFFT(np.hanning(n_fft), saut, fs=FE)
    S = np.abs(tf.stft(mono.astype(np.float32)))
    W = np.zeros((len(_CENTRES), len(tf.f)))
    for i, c in enumerate(_CENTRES):
        m = (tf.f >= c / 2 ** 0.125) & (tf.f < c * 2 ** 0.125)
        if not m.any():
            m[np.argmin(np.abs(tf.f - c))] = True
        W[i, m] = 1.0 / m.sum()
    L = np.log10(1.0 + 1000.0 * (W @ S))
    # Référence : le plus fort de la bande et de ses voisines sur les 30 ms
    # qui précèdent (15 tranches). Un battement retombe aussitôt et ne dépasse
    # pas ce maximum ; une attaque, qui sort d'un creux, si.
    reference = maximum_filter1d(maximum_filter1d(L, 3, axis=0), 15, axis=1, origin=7)
    D = np.zeros_like(L)
    D[:, retard:] = np.maximum(L[:, retard:] - reference[:, :-retard], 0.0)
    return mono, tf.t(len(mono)), L, D


# Spectre court pour dater les attaques : 5,3 ms, tous les 0,5 ms.
_TF_COURT = signal.ShortTimeFFT(np.hanning(256), 24, fs=FE)


def instant_precis(mono: np.ndarray, c: int, bandes) -> int | None:
    """Datation fine d'une attaque repérée vers l'échantillon c, dans les
    seules bandes où elle monte vraiment (`bandes`, indices de _CENTRES) :
    ce qui sonnait déjà ailleurs (une cloche qui résonne, une nappe qui bat)
    ne la brouille pas.

    - Bandes au-dessus de 400 Hz : amplitude de ces bandes sur un spectre
      court (5,3 ms, tous les 0,5 ms ; sans la raie continue, qui capterait la
      fondamentale des notes graves) ;
    - attaque purement grave (grosse caisse, basse) : enveloppe du signal
      filtré sous 400 Hz (transformée de Hilbert, filtrage à phase nulle).
    Puis instant où cette amplitude franchit la mi-hauteur entre le plancher
    (médiane de -35 à -15 ms) et la crête (de -10 à +20 ms), interpolé."""
    a0, a1 = c - int(0.04 * FE), c + int(0.03 * FE)
    if a0 < 0 or a1 > len(mono):
        return None
    seg = mono[a0:a1]
    hautes = [b for b in bandes if _CENTRES[b] >= 400.0]
    if hautes:
        S = np.abs(_TF_COURT.stft(seg)) ** 2
        tt = _TF_COURT.t(a1 - a0) - (c - a0) / FE  # instants relatifs à c (s)
        f = _TF_COURT.f
        masque = np.zeros(len(f), dtype=bool)
        for b in hautes:
            m = (f >= _CENTRES[b] / 2 ** 0.125) & (f < _CENTRES[b] * 2 ** 0.125)
            masque[m if m.any() else np.argmin(np.abs(f - _CENTRES[b]))] = True
        masque[0] = False
        A = np.sqrt(S[masque].sum(axis=0))
    elif len(bandes):
        y = signal.sosfiltfilt(signal.butter(4, 400.0, "lowpass", fs=FE, output="sos"), seg)
        A = np.convolve(np.abs(signal.hilbert(y)), np.ones(48) / 48, mode="same")
        tt = (np.arange(len(seg)) - (c - a0)) / FE
    else:
        return None
    avant, apres = (tt >= -0.035) & (tt <= -0.015), (tt >= -0.010) & (tt <= 0.020)
    plancher = float(np.median(A[avant]))
    i_crete = int(np.flatnonzero(apres)[np.argmax(A[apres])])
    if A[i_crete] < 2.0 * plancher or A[i_crete] <= 0.0:
        return None  # rien qui monte nettement dans ces bandes : pas d'instant fiable
    seuil = 0.5 * (plancher + float(A[i_crete]))
    zone = np.flatnonzero((tt >= -0.015) & (np.arange(len(tt)) <= i_crete) & (A >= seuil))
    if not len(zone):
        return None
    i = int(zone[0])
    if i > 0 and A[i] > A[i - 1]:  # interpolation linéaire entre deux tranches
        frac = (seuil - A[i - 1]) / (A[i] - A[i - 1])
        t_x = tt[i - 1] + float(np.clip(frac, 0.0, 1.0)) * (tt[i] - tt[i - 1])
    else:
        t_x = tt[i]
    return c + int(round(t_x * FE))


def detecter_attaques(x: np.ndarray, montee: float = 0.5, nb_bandes: int = 4) -> list[int]:
    """Attaques nettes : instants où au moins 4 bandes montent ensemble d'au
    moins 10 dB au-dessus de leur maximum des 30 ms précédentes (maximum
    local sur ±30 ms). Ce qui enfle lentement (nappe, souffles, montées,
    compression latérale qui relâche) et les battements des voix désaccordées
    n'y arrivent pas ; un coup de batterie, une note pincée, une cloche, si.

    Le détecteur est volontairement exigeant : une attaque couverte par un
    son plus fort peut lui échapper, mais celles qu'il garde sont sûres, et
    leurs écarts à la grille veulent dire quelque chose. (Un flux spectral à
    seuil bas, essayé d'abord, prenait les battements de la nappe pour des
    attaques : la moitié de ses détections ne correspondaient à aucune note.)
    Il est étalonné à chaque analyse (`etalonner_attaques`).

    Datation fine : `instant_precis`, dans les bandes qui montent d'au moins
    10 dB."""
    mono, t, L, D = montees_par_bande(x)
    force = (D >= montee).sum(axis=0) + 1e-3 * D.sum(axis=0)  # nombre de bandes, départagé par l'ampleur
    pics = np.flatnonzero((force == maximum_filter1d(force, 31, mode="nearest")) & (force >= nb_bandes))
    instants = []
    for p in pics:
        s = instant_precis(mono, int(round(t[p] * FE)), np.flatnonzero(D[:, p] >= montee))
        if s is not None:
            instants.append(s)
    return sorted(set(instants))


def evenements_partition(partition: dict, instruments=None) -> tuple[np.ndarray, list[str]]:
    """Départs des notes et des coups de la partition (en temps, micro-décalages
    compris), éventuellement limités à certains instruments."""
    evs = sorted((ev["debut"] + ev.get("decalage_ms", 0.0) / 500.0, ev["instrument"]) for ev in partition["evenements"]
                 if instruments is None or ev["instrument"] in instruments)
    return np.array([e[0] for e in evs]), [e[1] for e in evs]


def bilan_attaques(instants, partition: dict, instruments=None, liste: bool = False) -> dict:
    """Rapproche chaque attaque détectée de la note la plus proche de la
    partition (appariée si l'écart est d'au plus 15 ms), du temps le plus
    proche et de la double croche la plus proche."""
    ev_t, ev_ins = evenements_partition(partition, instruments)
    lignes, ecarts = [], []
    for s in instants:
        tps = s / ECH_PAR_TEMPS
        j = int(np.argmin(np.abs(ev_t - tps)))
        e_ev = (tps - ev_t[j]) * 500.0
        if abs(e_ev) <= 15.0:
            ecarts.append(e_ev)
        dc = round(tps * 4) / 4
        lignes.append(dict(seconde=r(s / FE, 4), temps=r(tps, 3), temps_le_plus_proche=int(round(tps)), ecart_ms=r((tps - round(tps)) * 500, 1),
                           double_croche=dc, ecart_double_croche_ms=r((tps - dc) * 500, 1), note_la_plus_proche=ev_ins[j], ecart_note_ms=r(e_ev, 1)))
    e = np.array(ecarts)
    dc = np.array([abs(l["ecart_double_croche_ms"]) for l in lignes])
    bilan = dict(nombre=len(lignes), appariees_a_15_ms=len(e), part_appariee_pct=r(100 * len(e) / max(1, len(lignes)), 1),
                 ecart_note_median_ms=r(np.median(e), 2) if len(e) else None,
                 ecart_note_abs_p95_ms=r(np.percentile(np.abs(e), 95), 2) if len(e) else None,
                 ecart_double_croche_abs_median_ms=r(np.median(dc), 2) if len(dc) else None)
    if liste:
        bilan["liste"] = lignes
    return bilan


# ─── Repères et transitions ──────────────────────────────────────────────────


def bande(x: np.ndarray, bas: float | None, haut: float | None, ordre: int = 4) -> np.ndarray:
    """Bande de fréquences d'un signal stéréo (somme des canaux), filtrage à
    phase nulle : la mesure n'ajoute aucun retard."""
    mono = 0.5 * (x[0] + x[1])
    if bas and haut:
        sos = signal.butter(ordre, [bas, haut], "bandpass", fs=FE, output="sos")
    elif bas:
        sos = signal.butter(ordre, bas, "highpass", fs=FE, output="sos")
    else:
        sos = signal.butter(ordre, haut, "lowpass", fs=FE, output="sos")
    return signal.sosfiltfilt(sos, mono)


def _morceau(x: np.ndarray, centre: int, demi: int) -> tuple[np.ndarray, int]:
    a = max(0, centre - demi)
    return x[:, a : centre + demi], a


def attaque_enveloppe(env: np.ndarray, c: int, avant: tuple[int, int], apres: int) -> int | None:
    """Passage à mi-hauteur (en amplitude) entre le plancher qui précède c
    (médiane sur `avant` = (début, fin) en échantillons avant c) et la crête
    qui suit (dans `apres` échantillons). Rend l'échantillon, ou None."""
    plancher = float(np.median(env[c - avant[0] : c - avant[1]]))
    crete_i = c + int(np.argmax(env[c : c + apres]))
    crete = float(env[crete_i])
    if crete < 2.0 * plancher:
        return None
    moitie = 0.5 * (crete + plancher)
    debut = c - avant[1]
    i = np.flatnonzero(env[debut : crete_i + 1] >= moitie)
    return debut + int(i[0]) if len(i) else None


def mesurer_reperes(partition: dict, pistes: dict) -> list[dict]:
    """Chaque note de repère et chaque transition, comparée à son temps.

    - Notes de repère : piste mélodie, bande d'un quart de ton de part et
      d'autre de la note (les notes voisines sont écartées de plus de 80 dB),
      enveloppe d'amplitude (transformée de Hilbert), instant où elle monte le
      plus vite (voir plus bas).
    - Impacts : grave de la piste effets (< 400 Hz) ; cymbales : aigus de la
      piste batterie (> 4 kHz) ; passage à mi-hauteur entre le fond qui
      précède et la crête qui suit (l'enveloppe d'un bruit fluctue trop pour
      qu'on se fie à sa pente).
    - Montées, souffles et cymbales inversés : instant où ils sont retombés à
      mi-hauteur (ils s'arrêtent sur la coupe) dans les aigus de la piste effets.
    - Descente (36 → 38) : instant où elle est à -40 dB sous sa crête.
    Tous les filtres sont à phase nulle. Pour les notes de repère, l'attaque
    est l'instant où l'enveloppe monte le plus vite : le filtre étroit, à
    phase nulle, étale la montée symétriquement autour de cet instant."""
    out = []
    demi = int(0.6 * FE)
    for rep in partition["reperes"]:
        f0 = 440.0 * 2 ** ((rep["midi"] - 69) / 12)
        c = int(round(rep["temps"] * ECH_PAR_TEMPS))
        seg, a = _morceau(pistes["melodie"], c, demi)
        y = bande(seg, f0 / 2 ** (1 / 24), f0 * 2 ** (1 / 24))
        env = np.abs(signal.hilbert(y))
        k = c - a
        fenetre = slice(k - int(0.04 * FE), k + int(0.04 * FE))
        pente = np.gradient(env)[fenetre]
        mes = a + k - int(0.04 * FE) + int(np.argmax(pente))
        out.append(dict(type="note de repère", effet=rep["effet"], note=rep["note"], temps=rep["temps"], mesure="montée la plus raide",
                        mesure_temps=r(temps(mes), 4) if mes is not None else None,
                        ecart_ms=r((mes - c) / FE * 1000, 2) if mes is not None else None))
    vus = set()
    for tr in partition["transitions"]:
        cle = (tr["type"], tr["temps"])
        if cle in vus:
            continue
        vus.add(cle)
        c = int(round(tr["temps"] * ECH_PAR_TEMPS))
        mes = None
        if tr["type"] in ("impact", "cymbale"):
            piste, bas, haut = ("effets", None, 400.0) if tr["type"] == "impact" else ("batterie", 4000.0, None)
            seg, a = _morceau(pistes[piste], c, demi)
            y = bande(seg, bas, haut)
            env = signal.fftconvolve(np.abs(signal.hilbert(y)), np.ones(48) / 48, mode="same")
            m = attaque_enveloppe(env, c - a, (int(0.06 * FE), int(0.015 * FE)), int(0.08 * FE))
            mes = None if m is None else m + a
            quoi = "attaque (mi-hauteur)"
        elif tr["type"] == "descente":
            d = int(round(tr["debut"] * ECH_PAR_TEMPS))
            env = enveloppe_db(bande(pistes["effets"][:, d : c + int(0.2 * FE)], 150.0, 2000.0), 480)
            i = np.flatnonzero(env > np.max(env) - 40.0)
            mes = d + int(i[-1]) if len(i) else None
            quoi = "passage sous -40 dB"
        else:
            seg, a = _morceau(pistes["effets"], c, demi)
            env = 10 ** (enveloppe_db(bande(seg, 4000.0, None), 96) / 20)
            k = c - a
            niveau = float(np.median(env[k - int(0.03 * FE) : k - int(0.01 * FE)]))
            i = np.flatnonzero(env[k - int(0.01 * FE) : k + int(0.03 * FE)] < 0.5 * niveau)
            mes = a + k - int(0.01 * FE) + int(i[0]) if len(i) else None
            quoi = "arrêt (mi-hauteur)"
        out.append(dict(type=tr["type"], mesure=quoi, temps=tr["temps"], mesure_temps=r(temps(mes), 4) if mes is not None else None,
                        ecart_ms=r((mes - c) / FE * 1000, 2) if mes is not None else None))
    return out


def lire_effets_montage() -> list[tuple[float, str]]:
    """Effets de la feuille de montage d'origine, relus dans src/son/BandeSon.tsx
    (tableau EFFETS_SANS_MUSIQUE, notes de repère comprises) : (temps, son).
    Les tics du compteur sont placés tous les 0,2 temps à partir de 16. La
    feuille jouée avec la musique (EFFETS_AVEC_MUSIQUE) est mesurée par
    mixage.py."""
    texte = (VIDEO / "src" / "son" / "BandeSon.tsx").read_text(encoding="utf-8")
    i = texte.index("export const EFFETS_SANS_MUSIQUE")
    bloc = texte[i : texte.index("\n];", i)]
    effets = [(float(m[1]), m[2]) for m in re.finditer(r'\{\s*temps:\s*([\d.]+)\s*,\s*son:\s*"([\w-]+)"', bloc)]
    m = re.search(r"length:\s*(\d+).*?temps:\s*([\d.]+)\s*\+\s*([\d.]+)\s*\*\s*i,\s*son:\s*\"([\w-]+)\"", bloc, re.S)
    if m:
        effets += [(float(m[2]) + float(m[3]) * k, m[4]) for k in range(int(m[1]))]
    return sorted(effets)


# ─── Mesures générales ───────────────────────────────────────────────────────


def correlation(x: np.ndarray) -> float:
    g, d = x[0] - x[0].mean(), x[1] - x[1].mean()
    den = np.sqrt(np.sum(g * g) * np.sum(d * d))
    return float(np.sum(g * d) / den) if den > 0 else 1.0


def energie_bandes(x: np.ndarray) -> dict:
    mono = 0.5 * (x[0] + x[1])
    f, p = signal.welch(mono, FE, nperseg=8192)
    total = np.sum(p[(f >= 20) & (f <= 20000)])
    return {nom: dict(part_pct=r(100 * np.sum(p[(f >= a) & (f < b)]) / total, 2), db=r(10 * np.log10(np.sum(p[(f >= a) & (f < b)]) / total + 1e-20), 1))
            for nom, a, b in BANDES}


def etalonnage() -> dict:
    """Vérifie les instruments de mesure sur des signaux connus."""
    t = np.arange(10 * FE) / FE
    s = 0.1 * np.sin(2 * np.pi * 997 * t)
    sinus = np.stack([s, s])
    lufs = mesures.sonie_integree(sinus)
    lufs_porte = mesures.sonie_integree(np.concatenate([sinus, np.zeros_like(sinus)], axis=1))
    k = np.arange(FE)
    s12 = np.sin(np.pi / 2 * k + np.pi / 4) * signal.windows.tukey(FE, 0.1)  # fondus : pas de bord abrupt
    tp12 = mesures.crete_vraie_db(np.stack([s12, s12]))
    ce12 = mesures.crete_echantillon_db(np.stack([s12, s12])[:, FE // 4 : 3 * FE // 4])
    court = mesures.sonie_fenetre(sinus, [5.0], 3.0)[0]
    return dict(
        sinus_997Hz_moins20dBFS=dict(attendu=-20.0, mesure=r(lufs, 3), ok=bool(abs(lufs + 20.0) < 0.1)),
        meme_sinus_suivi_de_silence=dict(attendu=-20.0, mesure=r(lufs_porte, 3), ok=bool(abs(lufs_porte + 20.0) < 0.1)),
        court_terme_du_sinus=dict(attendu=-20.0, mesure=r(court, 3), ok=bool(abs(court + 20.0) < 0.1)),
        sinus_12kHz_crete_vraie=dict(attendu_dbtp=0.0, mesure_dbtp=r(tp12, 3), crete_echantillon_dbfs=r(ce12, 3), ok=bool(abs(tp12) < 0.1 and abs(ce12 + 3.01) < 0.05)),
    )


def etalonner_detecteur(x: np.ndarray) -> dict:
    """Le détecteur doit trouver des clics connus, et seulement eux.

    Dans une copie de la musique : une impulsion d'un échantillon à -40 dBFS
    dans l'introduction, une marche de 0,005 (-46 dBFS, un gain qui saute)
    pendant la pause, 20 échantillons supprimés sous l'accord final (un bloc
    mal recollé). Puis deux notes isolées de La4 à -14 dBFS : l'une sans
    attaque (elle démarre à mi-crête, donc par un saut : doit être signalée),
    l'autre avec l'attaque de 1,5 ms du moteur (ne doit pas l'être). Enfin un
    piège : 2 s de dents de scie à bande limitée (220 Hz), dont les fronts
    raides ne sont pas des clics."""
    y = x.copy()
    poses = [int(2.3 * ECH_PAR_TEMPS) + 17, int(39.4 * ECH_PAR_TEMPS) + 5, int(57.2 * ECH_PAR_TEMPS) + 11]
    y[:, poses[0]] += 0.01
    y[:, poses[1]:] += 0.005
    y = np.concatenate([y[:, : poses[2]], y[:, poses[2] + 20 :], np.zeros((2, 20))], axis=1)
    trouves = detecter_clics(y[0])
    vus = [p for p in poses if any(abs(k["echantillon"] - p) <= 48 for k in trouves)]
    faux = [k for k in trouves if all(abs(k["echantillon"] - p) > 48 for p in poses)]
    t = np.arange(FE) / FE
    note_brute = np.zeros(2 * FE)
    note_brute[FE // 2 : FE // 2 + FE] = 0.2 * np.sin(2 * np.pi * 440 * t + np.pi / 2) * np.exp(-t / 0.3)
    note_douce = np.zeros(2 * FE)
    env = enveloppe(0.9, attaque=0.0015, relache=0.1)
    note_douce[FE // 2 : FE // 2 + len(env)] = 0.2 * np.sin(2 * np.pi * 440 * np.arange(len(env)) / FE + np.pi / 2) * env
    t2 = np.arange(2 * FE) / FE
    k = np.arange(1, int(20000 // 220) + 1)
    scie = 0.3 * np.sum(np.sin(2 * np.pi * 220 * k[:, None] * t2[None, :]) / k[:, None], axis=0) * signal.windows.tukey(len(t2), 0.05)
    brute, douce, piege = len(detecter_clics(note_brute)), len(detecter_clics(note_douce)), len(detecter_clics(scie))
    return dict(injectes_dans_la_musique=len(poses), trouves=len(vus), fausses_alertes=len(faux),
                note_sans_attaque_signalee=bool(brute >= 1), note_attaque_1_5ms_signalee=bool(douce > 0), dents_de_scie_signalees=piege,
                ok=bool(len(vus) == len(poses) and not faux and brute >= 1 and douce == 0 and piege == 0))


def etalonner_attaques() -> dict:
    """Le détecteur d'attaques sur un signal connu : douze coups et notes des
    vrais instruments du morceau (grosse caisse, clap, charleston, pluck,
    cloche, piano électrique), posés à des instants connus sur une nappe de
    quatre notes tenue 7,5 s, dont les sept voix désaccordées battent (le
    piège des fausses attaques). Il doit les trouver toutes, entre -1 et
    +3 ms de leur départ, et rien d'autre."""
    import instruments as I

    x = np.zeros((2, 8 * FE))
    for m in (note("A3"), note("C#4"), note("E4"), note("F#4")):
        fond = I.nappe(m, 7.5, 0.4, 0.3, m)
        x[:, : fond.shape[1]] += 0.06 * fond
    poses = [(0.5, I.grosse_caisse(1.0, 1)), (0.875, I.charleston(1.0, False, 2)), (1.25, I.clap(1.0, 3)),
             (1.75, I.pluck(note("E5"), 0.1, 1.0, brillance=5000.0, tau=0.22, raideur=0.55)), (2.25, I.cloche(note("C#5"), 0.9, 1.0)),
             (2.875, I.piano_fm(note("C#4"), 0.4, 0.7)), (3.5, I.grosse_caisse(0.9, 4)), (3.75, I.charleston(0.8, True, 5)),
             (4.25, I.pluck(note("A4"), 0.1, 0.8, brillance=5000.0, tau=0.22, raideur=0.55)), (4.875, I.cloche(note("A4"), 0.9, 1.0)),
             (5.5, I.clap(0.9, 6)), (6.25, I.piano_fm(note("E4"), 0.4, 0.7))]
    for t, son in poses:
        s = son if son.ndim == 2 else np.stack([son, son])
        i = int(round(t * FE))
        x[:, i : i + s.shape[1]] += 0.25 * s / np.max(np.abs(s))
    trouves = np.array(detecter_attaques(x)) / FE
    vrais = np.array([t for t, _ in poses])
    ecarts = [float((trouves[np.argmin(np.abs(trouves - v))] - v) * 1000) if len(trouves) else None for v in vrais]
    justes = [e for e in ecarts if e is not None and -1.0 <= e <= 3.0]
    faux = [float(v) for v in trouves if np.min(np.abs(vrais - v)) > 0.015]
    return dict(poses=len(poses), trouvees_a_moins_de_3_ms=len(justes), ecarts_ms=[r(e, 2) for e in ecarts], fausses_attaques=len(faux),
                ok=bool(len(justes) == len(poses) and not faux))


# ─── Images ──────────────────────────────────────────────────────────────────


def lignes_coupes(ax, partition, haut=True, couleur="white"):
    for c in partition["coupes"]:
        ax.axvline(c, color=couleur, lw=1.2, alpha=0.9)
    for t in range(0, NB_TEMPS + 1):
        ax.axvline(t, color=couleur, lw=0.4, alpha=0.18, ls=":")
    if haut:
        for nom, a, b in PLANS:
            ax.text((a + b) / 2, 1.005, nom, transform=ax.get_xaxis_transform(), ha="center", va="bottom", fontsize=9, color="#0f172a")


def image_spectrogramme(x: np.ndarray, pistes: dict, partition: dict, chemin: Path) -> None:
    fig, axes = plt.subplots(2, 1, figsize=(24, 13), gridspec_kw=dict(height_ratios=[3, 1.4]), constrained_layout=True)
    mono = 0.5 * (x[0] + x[1])
    f, t, S = signal.spectrogram(mono, FE, window="hann", nperseg=4096, noverlap=4096 - 512, mode="magnitude", scaling="spectrum")
    garde = f >= 20
    S_db = 20 * np.log10(np.maximum(S[garde] * 2, 1e-10))
    ax = axes[0]
    im = ax.pcolormesh(t / 0.5, f[garde], S_db, shading="auto", cmap="magma", vmin=-110, vmax=-10, rasterized=True)
    ax.set_yscale("log")
    ax.set_ylim(25, 22000)
    ax.set_yticks([30, 60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000])
    ax.set_yticklabels(["30", "60", "120", "250", "500", "1k", "2k", "4k", "8k", "16k"])
    ax.set_ylabel("Hz (échelle log)")
    ax.set_xlim(0, NB_TEMPS)
    ax.set_xticks(range(0, NB_TEMPS + 1, 2))
    ax.set_xlabel("temps (1 temps = 0,5 s)")
    lignes_coupes(ax, partition)
    fig.colorbar(im, ax=ax, label="dBFS", pad=0.005)
    ax.set_title("Spectrogramme du mélange (fenêtre 85 ms, pas 10,7 ms) — traits blancs : coupes ; pointillés : temps", loc="left")
    # Aigus des pistes tonales seules (basse + harmonie + mélodie) : sans
    # batterie ni souffles, tout repliement y apparaîtrait comme une raie.
    tonal = pistes["basse"] + pistes["harmonie"] + pistes["melodie"]
    m2 = 0.5 * (tonal[0] + tonal[1])
    f2, t2, S2 = signal.spectrogram(m2, FE, window="hann", nperseg=2048, noverlap=2048 - 256, mode="magnitude", scaling="spectrum")
    garde2 = f2 >= 6000
    ax = axes[1]
    im2 = ax.pcolormesh(t2 / 0.5, f2[garde2] / 1000, 20 * np.log10(np.maximum(S2[garde2] * 2, 1e-10)), shading="auto", cmap="magma",
                        vmin=-130, vmax=-40, rasterized=True)
    ax.set_ylim(6, 24)
    ax.set_ylabel("kHz (linéaire)")
    ax.set_xlim(0, NB_TEMPS)
    ax.set_xticks(range(0, NB_TEMPS + 1, 2))
    ax.set_xlabel("temps")
    lignes_coupes(ax, partition, haut=False)
    ax.axhline(20, color="#22d3ee", lw=0.8, ls="--")
    ax.text(0.3, 20.3, "20 kHz : aucune harmonique au-dessus", color="#22d3ee", fontsize=9)
    fig.colorbar(im2, ax=ax, label="dBFS", pad=0.005)
    ax.set_title("Aigus (6 à 24 kHz) des pistes tonales seules : basse + harmonie + mélodie (pas de batterie ni de souffle)", loc="left")
    fig.savefig(chemin, dpi=100)
    plt.close(fig)


def image_sonie(courbes: dict, integree: float, partition: dict, crete_par_demi_temps, chemin: Path) -> None:
    fig, axes = plt.subplots(2, 1, figsize=(22, 10), gridspec_kw=dict(height_ratios=[3, 1.2]), sharex=True, constrained_layout=True)
    ax = axes[0]
    tt = np.array(courbes["temps"])
    ax.plot(tt, courbes["momentanee"], color="#93c5fd", lw=1.2, label="momentanée (400 ms)")
    ax.plot(tt, courbes["court_terme"], color="#1d4ed8", lw=2.4, label="court terme (3 s)")
    ax.axhline(integree, color="#0f172a", lw=1.2, ls="--", label=f"intégrée : {integree:.2f} LUFS")
    ax.axhspan(-22, -20, xmin=0, xmax=12 / NB_TEMPS, color="#fde68a", alpha=0.5, label="cible intro : -22 à -20 LUFS-S")
    ax.set_ylim(-40, -8)
    ax.set_ylabel("LUFS")
    ax.grid(axis="y", alpha=0.3)
    lignes_coupes(ax, partition, couleur="#475569")
    ax.legend(loc="lower right")
    ax.set_title("Sonie (BS.1770-4) évaluée à chaque demi-temps ; fenêtres glissantes qui se terminent à l'instant indiqué", loc="left")
    ax = axes[1]
    ax.step(np.arange(len(crete_par_demi_temps)) * 0.5, crete_par_demi_temps, where="post", color="#7c3aed", lw=1.4, label="crête vraie par demi-temps")
    ax.axhline(-1.5, color="#dc2626", lw=1.0, ls="--", label="limite -1,5 dBTP")
    ax.set_ylim(-60, 0)
    ax.set_ylabel("dBTP")
    ax.set_xlabel("temps (1 temps = 0,5 s)")
    ax.set_xlim(0, NB_TEMPS)
    ax.set_xticks(range(0, NB_TEMPS + 1, 2))
    ax.grid(axis="y", alpha=0.3)
    lignes_coupes(ax, partition, haut=False, couleur="#475569")
    ax.legend(loc="lower left")
    fig.savefig(chemin, dpi=100)
    plt.close(fig)


def spectre_lisse(x: np.ndarray):
    mono = 0.5 * (x[0] + x[1])
    f, p = signal.welch(mono, FE, nperseg=16384)
    centres = np.geomspace(20, 20000, 180)
    lisse = []
    for c in centres:
        m = (f >= c / 2 ** (1 / 12)) & (f < c * 2 ** (1 / 12))
        lisse.append(np.mean(p[m]) if m.any() else np.nan)
    return centres, 10 * np.log10(np.maximum(np.array(lisse), 1e-20))


def image_spectres(x: np.ndarray, pistes: dict, chemin: Path) -> None:
    fig, ax = plt.subplots(figsize=(16, 8), constrained_layout=True)
    f, p = spectre_lisse(x)
    ax.plot(f, p, color=COULEURS["mélange"], lw=2.6, label="mélange")
    for nom in PISTES:
        f, p = spectre_lisse(pistes[nom])
        ax.plot(f, p, color=COULEURS[nom], lw=1.6, label=nom)
    ax.set_xscale("log")
    ax.set_xlim(20, 20000)
    ax.set_ylim(-140, -25)
    ax.set_xticks([20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000])
    ax.set_xticklabels(["20", "50", "100", "200", "500", "1k", "2k", "5k", "10k", "20k"])
    for _, a, b in BANDES:
        ax.axvline(a, color="#cbd5e1", lw=0.8)
    for nom, a, b in BANDES:
        ax.text(np.sqrt(a * b), -27, nom, ha="center", va="top", fontsize=9, color="#475569")
    ax.set_xlabel("Hz")
    ax.set_ylabel("densité spectrale moyenne (dB, lissage 1/6 d'octave)")
    ax.grid(alpha=0.3)
    ax.legend(loc="lower left")
    ax.set_title("Spectre moyen de chaque piste séparée (sur les 30 s)", loc="left")
    fig.savefig(chemin, dpi=100)
    plt.close(fig)


def image_piano_roll(partition: dict, effets_montage, attaques: list[dict], chemin: Path) -> None:
    couleurs = {"nappe": "#99f6e4", "piano": "#0f766e", "pulse": "#14b8a6", "basse": "#b45309", "basse_tenue": "#f59e0b",
                "cloche": "#1d4ed8", "lead": "#be185d", "arpege": "#93c5fd", "grimpee": "#2563eb", "etincelle": "#c4b5fd"}
    fig, ax = plt.subplots(figsize=(26, 12), constrained_layout=True)
    batterie = {"grosse_caisse": 22, "battement": 22, "clap": 21, "caisse_claire": 20, "charleston": 19, "shaker": 18, "cymbale": 17}
    effets_mus = {"impact": 15, "montee": 14, "cymbale_inversee": 13, "souffle_inverse": 12, "descente": 11, "air": 10}
    for ev in partition["evenements"]:
        ins = ev["instrument"]
        if ins in couleurs and ev["midi"] is not None:
            rep = ev.get("repere")
            ax.add_patch(Rectangle((ev["debut"], ev["midi"] - 0.4), max(0.08, ev["duree"]), 0.8, facecolor=couleurs[ins],
                                   edgecolor="#0f172a" if rep else "none", lw=1.5 if rep else 0, alpha=0.95 if ins != "nappe" else 0.6))
            if rep:
                ax.text(ev["debut"], ev["midi"] + 0.8, rep, fontsize=8, color="#1d4ed8", ha="left", va="bottom", fontweight="bold")
        elif ins in batterie:
            y = batterie[ins]
            ax.plot([ev["debut"], ev["debut"]], [y - 0.35 * ev["force"], y + 0.35 * ev["force"]], color="#475569", lw=1.2)
        elif ins in effets_mus:
            y = effets_mus[ins]
            ax.add_patch(Rectangle((ev["debut"], y - 0.3), max(0.1, ev["duree"]), 0.6, facecolor="#7c3aed", alpha=0.55))
    for nom, y in list(batterie.items()) + list(effets_mus.items()):
        ax.text(-0.3, y, nom.replace("_", " "), ha="right", va="center", fontsize=8, color="#475569")
    # Effets de la feuille de montage (src/son/BandeSon.tsx) : en haut.
    y0 = 96
    rangs = {"note-1": 0, "note-2": 0, "note-3": 0, "note-4": 0, "impact-doux": 1, "pop": 1, "clic": 2, "tic": 3, "whoosh-court": 4, "whoosh-doux": 4}
    for t, son in effets_montage:
        y = y0 + rangs.get(son, 5)
        remplace = son.startswith("note-") or son == "impact-doux"
        ax.plot(t, y, marker="v", color="#dc2626" if remplace else "#64748b", ms=7)
    for nom, k in (("notes de repère (jouées par la musique)", 0), ("pop, impact-doux", 1), ("clic", 2), ("tic", 3), ("souffles", 4)):
        ax.text(-0.3, y0 + k, nom, ha="right", va="center", fontsize=8, color="#dc2626" if k == 0 else "#475569")
    # Attaques détectées dans le mélange (analyse.py) : vertes si elles tombent
    # à 5 ms au plus d'une note de la partition, rouges sinon.
    for a in attaques:
        juste = abs(a["ecart_note_ms"]) <= 5.0
        ax.plot(a["temps"], y0 + 5, marker="|", color="#16a34a" if juste else "#dc2626", ms=9, mew=1.6)
    ax.text(-0.3, y0 + 5, "attaques détectées (vert : ≤ 5 ms d'une note)", ha="right", va="center", fontsize=8, color="#16a34a")
    for g in partition["grille"]:
        ax.text((g["debut"] + g["fin"]) / 2, 89.5, g["nom"], ha="center", va="center", fontsize=10, color="#0f172a", fontweight="bold")
        ax.axvline(g["debut"], ymin=0, ymax=1, color="#cbd5e1", lw=0.6)
    for c in partition["coupes"]:
        ax.axvline(c, color="#dc2626", lw=1.2, alpha=0.7)
    for nom, a, b in PLANS:
        ax.text((a + b) / 2, 103.4, nom, ha="center", va="bottom", fontsize=10, color="#dc2626")
    noms = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    # Hauteurs jusqu'à La6 (93) : au-dessus, les rangées des effets.
    ticks = [m for m in range(24, 94) if m % 12 in (9, 1, 4)] + [m for m in range(24, 94) if m % 12 == 0]
    ax.set_yticks(ticks)
    ax.set_yticklabels([f"{noms[m % 12]}{m // 12 - 1}" for m in ticks], fontsize=8)
    ax.set_ylim(9, 105)
    ax.set_xlim(-6, NB_TEMPS + 0.5)
    ax.set_xticks(range(0, NB_TEMPS + 1, 2))
    ax.set_xlabel("temps (1 temps = 0,5 s)")
    ax.grid(axis="x", alpha=0.25)
    handles = [Rectangle((0, 0), 1, 1, color=c) for c in couleurs.values()]
    ax.legend(handles, list(couleurs.keys()), loc="lower right", ncol=5, fontsize=9)
    ax.set_title("Partition : notes (hauteur MIDI), batterie et effets musicaux en bas, accords, coupes (rouge) et effets de la feuille de montage en haut", loc="left")
    fig.savefig(chemin, dpi=90)
    plt.close(fig)


# ─── Programme ───────────────────────────────────────────────────────────────


def main() -> int:
    x = lire_wav(FICHIER_MUSIQUE)
    fe, brut = wavfile.read(str(FICHIER_MUSIQUE))
    pistes = {nom: lire_wav(DOSSIER / "pistes" / f"{nom}.wav") for nom in PISTES}
    partition = json.loads((DOSSIER / "partition.json").read_text(encoding="utf-8"))
    effets_montage = lire_effets_montage()

    etal = etalonnage()
    etal["detecteur_de_clics"] = etalonner_detecteur(x)
    etal["detecteur_d_attaques"] = etalonner_attaques()

    integree = mesures.sonie_integree(x)
    lra = mesures.plage_sonie(x)
    tp = mesures.crete_vraie_db(x)
    ce = mesures.crete_echantillon_db(x)
    instants = np.arange(1, 2 * NB_TEMPS + 1) * 0.25  # chaque demi-temps (s)
    court = mesures.sonie_fenetre(x, instants, 3.0)
    moment = mesures.sonie_fenetre(x, instants, 0.4)
    courbes = dict(temps=[r(v / 0.5, 2) for v in instants], court_terme=[r(v) for v in court], momentanee=[r(v) for v in moment])

    # Crête vraie par demi-temps (pour l'image).
    sur = np.abs(surechantillonner(x)).max(axis=0)
    pas = ECH_PAR_TEMPS // 2 * 4
    crete_dt = [20 * np.log10(np.max(sur[i : i + pas]) + 1e-12) for i in range(0, len(sur) - pas + 1, pas)]

    # Sonie par plan (sonie intégrée du plan seul, avec portes).
    plans = []
    for nom, a, b in PLANS:
        seg = x[:, int(a * ECH_PAR_TEMPS) : int(b * ECH_PAR_TEMPS)]
        sel = (np.array(courbes["temps"]) > a + 0.25) & (np.array(courbes["temps"]) <= b)
        plans.append(dict(plan=nom, temps=[a, b], sonie_lufs=r(mesures.sonie_integree(seg)),
                          court_terme_moyen=r(np.mean(np.array(court)[sel])), court_terme_max=r(np.max(np.array(court)[sel])),
                          crete_vraie_dbtp=r(mesures.crete_vraie_db(seg)), correlation=r(correlation(seg), 3)))

    # Équilibre des pistes pendant les décollages (12–24 et 42–54).
    zones = [(12, 24), (42, 54)]
    def segs(y):
        return np.concatenate([y[:, a * ECH_PAR_TEMPS : b * ECH_PAR_TEMPS] for a, b in zones], axis=1)
    l_mix = mesures.sonie_integree(segs(x))
    equilibre = {nom: r(mesures.sonie_integree(segs(pistes[nom])) - l_mix, 1) for nom in PISTES}

    # Écoute sur un petit haut-parleur (ordinateur portable, téléphone), qui
    # ne rend rien sous 200 Hz (passe-haut du 4e ordre) : même équilibre,
    # mesuré à travers ce filtre. La grosse caisse et la basse y perdent le
    # plus ; elles doivent rester audibles.
    hp200 = signal.butter(4, 200.0, "highpass", fs=FE, output="sos")
    l_petit = mesures.sonie_integree(signal.sosfilt(hp200, segs(x), axis=-1))
    petit_hp = dict(perte_du_melange_db=r(l_mix - l_petit, 1),
                    equilibre_pistes_decollages_lu={nom: r(mesures.sonie_integree(signal.sosfilt(hp200, segs(pistes[nom]), axis=-1)) - l_petit, 1)
                                                     for nom in PISTES})

    # Stéréo, continu, bandes.
    sous120 = signal.sosfiltfilt(signal.butter(4, 120.0, "lowpass", fs=FE, output="sos"), x, axis=-1)
    stereo = dict(correlation_globale=r(correlation(x), 3), correlation_sous_120Hz=r(correlation(sous120), 4),
                  difference_g_d_sous_120Hz_db=r(20 * np.log10(np.std(sous120[0] - sous120[1]) / (np.std(sous120[0] + sous120[1]) + 1e-20) + 1e-20), 1))
    continu = dict(gauche=float(f"{np.mean(x[0]):.2e}"), droite=float(f"{np.mean(x[1]):.2e}"), dbfs=r(20 * np.log10(max(abs(np.mean(x[0])), abs(np.mean(x[1])), 1e-12)), 1))
    bandes = energie_bandes(x)

    # Clics : mélange, puis chaque piste.
    clics = dict(melange=clics_signal(x))
    for nom in PISTES:
        clics[nom] = clics_signal(pistes[nom])
    bords = dict(premier_echantillon=[int(v) for v in brut[0]], dernier_echantillon=[int(v) for v in brut[-1]])

    # Attaques : dans le mélange (liste complète), puis dans chaque piste
    # tonale ou rythmique seule, où moins de choses se masquent (bilan).
    instants_melange = detecter_attaques(x)
    attaques = dict(melange=bilan_attaques(instants_melange, partition, liste=True))
    attaques["pistes"] = {nom: bilan_attaques(detecter_attaques(pistes[nom]), partition, partition["bus"][nom])
                          for nom in ("batterie", "basse", "harmonie", "melodie")}
    attaques["pistes"]["harmonie"]["remarque"] = (
        "Piste d'harmonie : nappe, piano électrique et pulsation mêlés. La nappe tient l'accord sans interruption "
        "(depuis la deuxième version, au-dessus du piano et non plus à l'unisson) : les accords du piano n'y montent "
        "que de quelques dB, et le détecteur, qui exige +10 dB, en manque une partie. Ce n'est pas un retard du "
        "piano : sur sa piste seule (diagnostic du 03/10/2026), chaque accord part à l'échantillon près.")

    reperes = mesurer_reperes(partition, pistes)

    # Notes de repère : sont-elles des sons de l'accord en cours ?
    def classes(g):
        voix = " ".join(v for v in (g["nappe"], g["piano"] or "", g["basse"]) if v).split()
        return {note(n) % 12 for n in voix}

    harmonie_reperes = []
    for rep in partition["reperes"]:
        g = next(g for g in partition["grille"] if g["debut"] <= rep["temps"] < g["fin"])
        harmonie_reperes.append(dict(temps=rep["temps"], note=rep["note"], accord=g["nom"], son_de_l_accord=bool(rep["midi"] % 12 in classes(g))))

    # Humanisation : décalage aléatoire de chaque coup par rapport à la grille.
    # Le swing (retard voulu et régulier des doubles croches paires, noté
    # `swing_ms` dans la partition) n'est pas de l'humanisation : il est
    # retiré du décalage avant le contrôle des 5 ms, et relevé à part.
    humanisation = {}
    for ev in partition["evenements"]:
        if "decalage_ms" in ev:
            h = humanisation.setdefault(ev["instrument"], dict(coups=0, decalage_max_ms=0.0))
            h["coups"] += 1
            h["decalage_max_ms"] = r(max(h["decalage_max_ms"], abs(ev["decalage_ms"] - ev.get("swing_ms", 0.0))), 2)
            if ev.get("swing_ms"):
                h["swing_ms"] = r(ev["swing_ms"], 2)
    for ev in partition["evenements"]:
        if ev["instrument"] == "grosse_caisse":
            h = humanisation.setdefault("grosse_caisse", dict(coups=0, decalage_max_ms=0.0))
            h["coups"] += 1

    # Queue finale : niveau autour du temps 59,8, rapporté à la crête du morceau.
    c = int(59.8 * ECH_PAR_TEMPS)
    fen = x[:, c - FE // 40 : c + FE // 40]
    pic_global = np.max(np.abs(x))
    queue = dict(temps=59.8, crete_locale_db=r(20 * np.log10(np.max(np.abs(fen)) / pic_global + 1e-20), 1),
                 efficace_locale_db=r(20 * np.log10(np.sqrt(np.mean(fen**2)) / pic_global + 1e-20), 1),
                 momentanee_lufs=r(mesures.sonie_fenetre(x, [59.8 * 0.5], 0.4)[0], 1))

    # Contrôles.
    clics_total = sum(len(v) for v in clics.values())
    reperes_ok = [rp for rp in reperes if rp["ecart_ms"] is not None and (abs(rp["ecart_ms"]) <= 5.0 or (rp["type"] == "descente" and rp["ecart_ms"] <= 5.0))]
    intro = [v for t, v in zip(courbes["temps"], court) if 6.0 <= t <= 9.0]
    st = dict(zip(courbes["temps"], court))
    pause = [v for t, v in zip(courbes["temps"], moment) if 39.0 <= t <= 41.0]
    decollages = [v for t, v in zip(courbes["temps"], court) if 15 <= t <= 24 or 45 <= t <= 56]
    controles = {
        "format_48kHz_stereo_16bits_1440000_echantillons": bool(fe == FE and brut.ndim == 2 and brut.shape == (N_ATTENDU, 2) and brut.dtype == np.int16),
        "etalonnage_des_mesures": bool(all(v["ok"] for v in etal.values())),
        "aucun_clic": bool(clics_total == 0),
        "crete_vraie_max_-1.5_dBTP": bool(tp <= -1.5),
        "sonie_-16_LUFS_a_1_pres": bool(abs(integree + 16.0) <= 1.0),
        "reperes_et_transitions_a_5_ms": bool(len(reperes_ok) == len(reperes)),
        "notes_de_repere_dans_l_accord": bool(all(h["son_de_l_accord"] for h in harmonie_reperes)),
        "queue_finale_sous_-40_dB_a_59.8": bool(queue["crete_locale_db"] <= -40.0),
        "aucune_coupure_seche_en_fin": bool(max(abs(int(v)) for v in brut[-1]) <= 2),
        "intro_entre_-22.5_et_-19.5_LUFS_S_(temps_6_a_9)": bool(min(intro) >= -22.5 and max(intro) <= -19.5),
        "la_montee_6_12_monte_(+1.5_LU)": bool(st[12.0] >= st[7.0] + 1.5),
        "second_decollage_au_moins_aussi_fort_que_le_premier": bool(plans[6]["sonie_lufs"] >= plans[2]["sonie_lufs"] - 0.2),
        "pause_plus_basse_que_les_decollages": bool(np.mean(pause) < np.mean(decollages) - 3.0),
        "graves_mono_sous_120Hz": bool(stereo["correlation_sous_120Hz"] >= 0.98),
        "attaques_minimales_respectees": bool(partition["enveloppes"]["attaque_min_ms"] >= 1.5 and partition["enveloppes"]["relache_min_ms"] >= 10.0),
        "continu_negligeable": bool(continu["dbfs"] < -60.0),
        "attaques_du_melange_sur_les_notes_(95_%_appariees,_mediane_2_ms,_p95_5_ms)": bool(
            attaques["melange"]["part_appariee_pct"] >= 95.0 and abs(attaques["melange"]["ecart_note_median_ms"]) <= 2.0
            and attaques["melange"]["ecart_note_abs_p95_ms"] <= 5.0),
        "humanisation_max_5_ms_et_grosse_caisse_exacte": bool(all(h["decalage_max_ms"] <= 5.0 for h in humanisation.values())
                                                              and humanisation.get("grosse_caisse", {}).get("decalage_max_ms", 0.0) == 0.0),
    }

    ecarts = [abs(rp["ecart_ms"]) for rp in reperes if rp["ecart_ms"] is not None and rp["type"] != "descente"]
    resume = dict(sonie_integree_lufs=r(integree), plage_lra_lu=r(lra, 1), crete_vraie_dbtp=r(tp), crete_echantillon_dbfs=r(ce),
                  correlation=stereo["correlation_globale"], correlation_sous_120Hz=stereo["correlation_sous_120Hz"], clics=clics_total,
                  ecart_max_reperes_et_transitions_ms=r(max(ecarts), 2), queue_a_59_8_db=queue["crete_locale_db"],
                  controles_reussis=f"{sum(controles.values())}/{len(controles)}")
    rapport = dict(
        fichier=str(FICHIER_MUSIQUE.relative_to(VIDEO)), format=dict(frequence=fe, canaux=int(brut.shape[1]), echantillons=int(brut.shape[0]),
                                                                     duree_s=r(brut.shape[0] / fe, 4), type=str(brut.dtype)),
        resume=resume, controles=controles, etalonnage=etal,
        sonie=dict(integree_lufs=r(integree), plage_lra_lu=r(lra, 1), crete_vraie_dbtp=r(tp), crete_echantillon_dbfs=r(ce), par_plan=plans,
                   equilibre_pistes_decollages_lu=equilibre, petit_haut_parleur_sous_200Hz_coupes=petit_hp),
        stereo=stereo, continu=continu, bandes=bandes,
        clics=dict(total=clics_total, par_signal={k: len(v) for k, v in clics.items()}, liste=clics, bords_du_fichier=bords),
        enveloppes=partition["enveloppes"], humanisation=humanisation, mixage=partition.get("mixage"),
        reperes_et_transitions=reperes, notes_de_repere_et_accords=harmonie_reperes,
        queue_finale=queue,
        attaques=attaques,
        effets_feuille_de_montage=[dict(temps=r(t, 3), son=s, joue_par_la_musique=bool(s.startswith("note-") or s == "impact-doux")) for t, s in effets_montage],
        courbes_sonie=courbes,
    )
    DOSSIER.mkdir(parents=True, exist_ok=True)
    (DOSSIER / "rapport.json").write_text(json.dumps(rapport, ensure_ascii=False, indent=1), encoding="utf-8")

    image_spectrogramme(x, pistes, partition, DOSSIER / "spectrogramme.png")
    image_sonie(courbes, integree, partition, crete_dt, DOSSIER / "sonie.png")
    image_spectres(x, pistes, DOSSIER / "spectres-pistes.png")
    image_piano_roll(partition, effets_montage, attaques["melange"]["liste"], DOSSIER / "piano-roll.png")

    print(f"Sonie intégrée {integree:.2f} LUFS, LRA {lra:.1f} LU, crête vraie {tp:.2f} dBTP, crête échantillon {ce:.2f} dBFS")
    print(f"Corrélation {stereo['correlation_globale']}, sous 120 Hz {stereo['correlation_sous_120Hz']} ; clics : {clics_total} ; queue à 59,8 : {queue['crete_locale_db']} dB")
    for nom, ok in controles.items():
        print(f"  {'OK    ' if ok else 'ÉCHEC '} {nom}")
    print("✓ out/musique/rapport.json, spectrogramme.png, sonie.png, spectres-pistes.png, piano-roll.png")
    return 0 if all(controles.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
