# Moteur de synthèse et de mixage de la musique de la version complète.
#
# Tout le son est calculé ici, à partir de zéro : oscillateurs, bruit à graine
# fixe, enveloppes, filtres, réverbération par convolution, écho, compression
# latérale (sidechain), compression de bus, saturation et limiteur. Aucun
# échantillon, aucun fichier externe : numpy et scipy seulement.
#
# Trois règles valent pour tout le fichier :
# - rien ne se replie (« repliement » = aliasing). Les oscillateurs ne
#   contiennent aucune harmonique au-dessus de 20 kHz, et ce qui crée des
#   fréquences nouvelles (FM, saturation) est calculé à 192 kHz, puis filtré
#   et ramené à 48 kHz ;
# - aucun claquement. Chaque note monte en au moins 1,5 ms et retombe en au
#   moins 10 ms : `enveloppe` refuse moins, et compte ce qu'on lui demande ;
# - le rendu est reproductible. Chaque tirage aléatoire part d'une graine fixe.
#
# Les fonctions travaillent en secondes et en échantillons. Les temps musicaux
# (1 temps = 0,5 s à 120 BPM) sont l'affaire de composer.py.

from __future__ import annotations

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

FE = 48000  # fréquence d'échantillonnage
SURECH = 4  # facteur de suréchantillonnage (FM, saturation, crête vraie)
FE_SUR = FE * SURECH
F_LIMITE = 20000.0  # aucune harmonique au-dessus : rien ne peut se replier

ATTAQUE_MIN = 0.0015  # s
RELACHE_MIN = 0.010  # s

# Ce que les enveloppes ont réellement servi (relu par analyse.py).
STATS = {"enveloppes": 0, "attaque_min_ms": None, "relache_min_ms": None}


# ─── Unités ──────────────────────────────────────────────────────────────────


def ech(secondes: float) -> int:
    """Secondes → nombre d'échantillons (arrondi)."""
    return int(round(secondes * FE))


def db(valeur):
    """Décibels → facteur d'amplitude."""
    return 10.0 ** (np.asarray(valeur, dtype=float) / 20.0)


def midi_vers_hz(m):
    """Numéro de note MIDI → fréquence (La4 = 69 = 440 Hz, tempérament égal)."""
    return 440.0 * 2.0 ** ((np.asarray(m, dtype=float) - 69.0) / 12.0)


_LETTRES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def note(nom: str) -> int:
    """« C#4 » → 61, « A4 » → 69, « Bb3 » → 58 (notation anglo-saxonne)."""
    lettre, reste, alteration = nom[0].upper(), nom[1:], 0
    while reste and reste[0] in "#b":
        alteration += 1 if reste[0] == "#" else -1
        reste = reste[1:]
    return 12 * (int(reste) + 1) + _LETTRES[lettre] + alteration


def generateur(graine: int) -> np.random.Generator:
    """Générateur aléatoire à graine fixe : même graine, même son."""
    return np.random.default_rng(graine)


# ─── Enveloppes ──────────────────────────────────────────────────────────────


def _noter(attaque: float, relache: float) -> None:
    STATS["enveloppes"] += 1
    a, r = attaque * 1000, relache * 1000
    STATS["attaque_min_ms"] = a if STATS["attaque_min_ms"] is None else min(STATS["attaque_min_ms"], a)
    STATS["relache_min_ms"] = r if STATS["relache_min_ms"] is None else min(STATS["relache_min_ms"], r)


def enveloppe(duree: float, attaque: float = 0.002, relache: float = 0.02, declin: float | None = None, maintien: float = 1.0) -> np.ndarray:
    """Enveloppe d'amplitude d'une note tenue `duree` secondes.

    - attaque : montée en demi-cosinus de 0 à 1 (au moins 1,5 ms) ;
    - declin : si donné, décroissance exponentielle (constante de temps en s)
      de 1 vers le niveau `maintien` ;
    - relache : à la fin de la durée tenue, descente en demi-cosinus jusqu'à 0
      (au moins 10 ms). La note dure donc `duree + relache`.

    Le premier et le dernier échantillon valent exactement 0 : la note ne peut
    pas claquer à ses bords.
    """
    if attaque < ATTAQUE_MIN - 1e-9:
        raise ValueError(f"attaque de {attaque * 1000:.2f} ms : 1,5 ms au moins")
    if relache < RELACHE_MIN - 1e-9:
        raise ValueError(f"relâchement de {relache * 1000:.2f} ms : 10 ms au moins")
    _noter(attaque, relache)
    n_tenue = max(1, ech(duree))
    n_rel = max(2, ech(relache))
    n = n_tenue + n_rel
    env = np.ones(n)
    na = max(2, ech(attaque))
    m = min(na, n)
    env[:m] = 0.5 - 0.5 * np.cos(np.pi * np.arange(m) / na)
    if declin is not None:
        t = np.arange(n) / FE
        apres = np.arange(n) >= na
        env[apres] *= maintien + (1.0 - maintien) * np.exp(-(t[apres] - na / FE) / declin)
    env[n_tenue:] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(n_rel) + 1) / n_rel)
    env[0] = 0.0
    env[-1] = 0.0
    return env


def rampe(n: int, montee: bool = True) -> np.ndarray:
    """Demi-cosinus de n échantillons, de 0 à 1 (ou de 1 à 0)."""
    r = 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / max(1, n - 1))
    return r if montee else r[::-1]


# ─── Oscillateurs ────────────────────────────────────────────────────────────


def phase(freq, n: int | None = None, phase0: float = 0.0, fe: int = FE) -> np.ndarray:
    """Phase (en tours) d'un oscillateur. `freq` : fréquence fixe (n requis) ou
    fréquence instantanée, un nombre par échantillon (glissandos, vibrato)."""
    if np.isscalar(freq):
        return phase0 + np.arange(n) * (float(freq) / fe)
    inc = np.asarray(freq, dtype=float) / fe
    ph = np.empty_like(inc)
    ph[0] = 0.0
    np.cumsum(inc[:-1], out=ph[1:])
    return ph + phase0


def table(amplitudes, phases=None) -> np.ndarray:
    """Une période d'onde à partir de ses harmoniques (k = 1, 2, …), sinus de
    phase nulle par défaut. La table a un point de plus (bouclage) pour la
    lecture interpolée, et au moins 64 points par période de la plus haute
    harmonique : l'erreur d'interpolation reste sous -90 dB."""
    a = np.asarray(amplitudes, dtype=float)
    K = len(a)
    taille = int(max(4096, 2 ** np.ceil(np.log2(64 * K))))
    spectre = np.zeros(taille // 2 + 1, dtype=complex)
    spectre[1 : K + 1] = -0.5j * taille * a
    if phases is not None:
        spectre[1 : K + 1] *= np.exp(1j * np.asarray(phases, dtype=float))
    onde = np.fft.irfft(spectre, taille)
    return np.append(onde, onde[0])


def lire(onde: np.ndarray, ph: np.ndarray) -> np.ndarray:
    """Lit une table à la phase donnée (en tours), avec interpolation linéaire."""
    N = len(onde) - 1
    p = (ph - np.floor(ph)) * N
    i = np.minimum(p.astype(np.int64), N - 1)
    f = p - i
    return onde[i] + f * (onde[i + 1] - onde[i])


def nb_harmoniques(f_max: float, f_limite: float = F_LIMITE) -> int:
    """Nombre d'harmoniques d'une note dont la fréquence monte jusqu'à f_max
    sans qu'aucune ne dépasse f_limite (20 kHz)."""
    return max(1, int(f_limite // f_max))


def harmoniques_scie(K: int) -> np.ndarray:
    """Dents de scie : toutes les harmoniques, en 1/k."""
    return 1.0 / np.arange(1, K + 1)


def harmoniques_carre(K: int) -> np.ndarray:
    """Carré : harmoniques impaires seulement, en 1/k."""
    k = np.arange(1, K + 1)
    return np.where(k % 2 == 1, 1.0 / k, 0.0)


def additif(f0: float, n: int, amplitudes, constantes=None, fe: int = FE) -> np.ndarray:
    """Synthèse additive : somme des harmoniques k·f0, chacune avec son
    amplitude et, si donnée, sa propre décroissance exponentielle (constante de
    temps en s). C'est ce qui fait sonner un « pluck » : les aiguës s'éteignent
    avant le fondamental, comme sur une corde."""
    a = np.asarray(amplitudes, dtype=float)
    K = len(a)
    t = np.arange(n) / fe
    sortie = np.zeros(n)
    pas = max(1, int(3e6 // max(1, n)))  # par paquets d'harmoniques : mémoire bornée
    for d in range(0, K, pas):
        k = np.arange(d + 1, min(K, d + pas) + 1)
        s = np.sin(2.0 * np.pi * f0 * k[:, None] * t[None, :])
        if constantes is not None:
            c = np.asarray(constantes, dtype=float)[d : d + len(k)]
            s *= np.exp(-t[None, :] / c[:, None])
        sortie += a[d : d + len(k)] @ s
    return sortie


# Passe-bas à 19,5 kHz du bruit brut (511 coefficients, -118 dB au moins dès 19,9 kHz).
# Toutes les sources du morceau restent ainsi sous 20 kHz. La bande de 21 à
# 24 kHz ne contient alors presque que le dither, plus deux choses : ce
# qu'y ajouterait un défaut (un saut d'échantillon répand de l'énergie
# jusqu'à 24 kHz), et l'étalement des attaques les plus raides (cymbales en
# 2 ms, arrêts des montées en 12 ms), jusqu'à -83 dBFS, une quinzaine de dB
# au-dessus du dither. analyse.py y cherche les clics par rapport au niveau
# local de la bande : le détecteur reste sûr partout, mais il est moins
# sensible dans les quelques millisecondes qui suivent ces attaques (une
# vérification indépendante par résidu de prédiction linéaire, en relecture,
# n'y a rien trouvé). Le filtre est appliqué AVANT toute enveloppe : une enveloppe mal
# faite resterait visible.
_FIR_BRUIT = signal.firwin(511, 19500.0, fs=FE, window=("kaiser", 12.0))


def bruit_blanc(n: int, graine: int, canaux: int = 1) -> np.ndarray:
    """Bruit blanc gaussien limité à 19,5 kHz, écart type ~1. Forme (n,) ou (canaux, n)."""
    b = generateur(graine).standard_normal((canaux, n + 510))
    b = signal.fftconvolve(b, _FIR_BRUIT[None, :], mode="valid", axes=-1)
    b /= np.std(b)
    return b[0] if canaux == 1 else b


# ─── Suréchantillonnage ──────────────────────────────────────────────────────

# Filtre de décimation : 1 023 coefficients, fenêtre de Kaiser (β = 14). Plat
# jusqu'à 19,5 kHz (-0,3 dB à 20 kHz), au moins -136 dB au-delà de 21,3 kHz.
# Ce qui dépasse la moitié de 48 kHz est supprimé avant de redescendre (rien
# ne se replie), et la bande de 21 à 24 kHz reste vide (analyse.py y cherche
# les clics).
_FIR = signal.firwin(1023, 20400.0, fs=FE_SUR, window=("kaiser", 14.0))


def surechantillonner(x: np.ndarray) -> np.ndarray:
    """48 kHz → 192 kHz (le dernier axe est le temps)."""
    return signal.resample_poly(x, SURECH, 1, axis=-1, window=_FIR)


def decimer(x: np.ndarray) -> np.ndarray:
    """192 kHz → 48 kHz, après filtrage sous 20 kHz."""
    return signal.resample_poly(x, 1, SURECH, axis=-1, window=_FIR)


def saturer(x: np.ndarray, entrainement: float, melange: float = 1.0) -> np.ndarray:
    """Saturation douce (tangente hyperbolique), gain unité pour les petits
    signaux. Calculée à 192 kHz : les harmoniques qu'elle crée au-dessus de
    20 kHz sont filtrées au lieu de se replier dans l'audible."""
    n = x.shape[-1]
    y = np.tanh(entrainement * surechantillonner(x)) / entrainement
    y = decimer(y)[..., :n]
    return melange * y + (1.0 - melange) * x


# ─── Filtres ─────────────────────────────────────────────────────────────────


def biquad(type_: str, f: float, q: float = 0.7071, gain_db: float = 0.0, fe: int = FE) -> np.ndarray:
    """Filtre du second ordre (formules de R. Bristow-Johnson), au format « sos »
    de scipy. Types : passe-bas, passe-haut, passe-bande, cloche, plateau-grave,
    plateau-aigu."""
    w0 = 2.0 * np.pi * f / fe
    cw, sw = np.cos(w0), np.sin(w0)
    alpha = sw / (2.0 * q)
    A = 10.0 ** (gain_db / 40.0)
    if type_ == "passe-bas":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif type_ == "passe-haut":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif type_ == "passe-bande":
        b = [alpha, 0.0, -alpha]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif type_ == "cloche":
        b = [1 + alpha * A, -2 * cw, 1 - alpha * A]
        a = [1 + alpha / A, -2 * cw, 1 - alpha / A]
    elif type_ == "plateau-grave":
        r = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) - (A - 1) * cw + r), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - r)]
        a = [(A + 1) + (A - 1) * cw + r, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - r]
    elif type_ == "plateau-aigu":
        r = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) + (A - 1) * cw + r), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - r)]
        a = [(A + 1) - (A - 1) * cw + r, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - r]
    else:
        raise ValueError(type_)
    b = np.array(b) / a[0]
    a = np.array(a) / a[0]
    return np.array([[b[0], b[1], b[2], 1.0, a[1], a[2]]])


def butterworth(type_: str, f, ordre: int, fe: int = FE) -> np.ndarray:
    """Filtre de Butterworth (passe-bas, passe-haut, passe-bande) au format sos."""
    btype = {"passe-bas": "lowpass", "passe-haut": "highpass", "passe-bande": "bandpass"}[type_]
    return signal.butter(ordre, f, btype=btype, fs=fe, output="sos")


def chaine(*sos: np.ndarray) -> np.ndarray:
    """Met plusieurs filtres bout à bout."""
    return np.vstack(sos)


def filtrer(x: np.ndarray, sos: np.ndarray) -> np.ndarray:
    """Applique un filtre (le dernier axe est le temps)."""
    return signal.sosfilt(sos, x, axis=-1)


def filtrer_note(x: np.ndarray, sos: np.ndarray, marge: float = 0.05) -> np.ndarray:
    """Filtre une note isolée sans couper la traîne du filtre : on ajoute
    `marge` secondes de silence avant de filtrer (la traîne a la place de
    s'éteindre), puis on referme les 10 dernières ms en douceur. Le résultat
    est plus long que l'entrée de `marge`."""
    m = ech(marge)
    y = filtrer(np.pad(x, [(0, 0)] * (x.ndim - 1) + [(0, m)]), sos)
    k = ech(0.01)
    y[..., -k:] *= rampe(k, montee=False)
    return y


def reponse_passe_bas(f, fc, ordre: int = 2, resonance_db: float = 0.0, largeur_oct: float = 0.35):
    """Gain d'un passe-bas « analogique » idéal (Butterworth d'ordre donné,
    6 dB par octave et par ordre), avec une bosse de résonance optionnelle
    centrée sur la coupure. Sert aux spectres des oscillateurs et aux filtres
    qui bougent (`filtre_variable`)."""
    x = np.asarray(f, dtype=float) / fc
    h = 1.0 / np.sqrt(1.0 + x ** (2 * ordre))
    if resonance_db:
        h = h * db(resonance_db * np.exp(-0.5 * (np.log2(np.maximum(x, 1e-9)) / largeur_oct) ** 2))
    return h


def reponse_passe_haut(f, fc, ordre: int = 2):
    x = fc / np.maximum(np.asarray(f, dtype=float), 1e-9)
    return 1.0 / np.sqrt(1.0 + x ** (2 * ordre))


def reponse_passe_bande(f, fc, q: float = 1.0):
    x = np.maximum(np.asarray(f, dtype=float), 1e-9) / fc
    return 1.0 / np.sqrt(1.0 + (q * (x - 1.0 / x)) ** 2)


_TFCT: dict = {}


def _tfct(n_fft: int, saut: int) -> signal.ShortTimeFFT:
    cle = (n_fft, saut)
    if cle not in _TFCT:
        _TFCT[cle] = signal.ShortTimeFFT(signal.windows.hann(n_fft, sym=False), saut, fs=FE)
    return _TFCT[cle]


def filtre_variable(x: np.ndarray, gain, n_fft: int = 2048, saut: int = 256, t0: float = 0.0) -> np.ndarray:
    """Filtre dont la réponse change dans le temps (balayages, ouvertures).

    Le son est découpé en tranches de 43 ms qui se recouvrent (tous les
    5,3 ms) ; chaque tranche est multipliée par la réponse voulue à cet
    instant, puis tout est recollé. `gain(f, t)` reçoit les fréquences (F,) et
    les instants (T,) en secondes (décalés de t0) et rend un tableau (F, T).
    Sans modification, la reconstruction est exacte (erreur ~1e-15)."""
    tf = _tfct(n_fft, saut)
    n = x.shape[-1]
    S = tf.stft(x)
    G = gain(tf.f, tf.t(n) + t0)
    return tf.istft(S * G, k1=n)


# ─── Espace stéréo ───────────────────────────────────────────────────────────


def panoramique(x: np.ndarray, pan) -> np.ndarray:
    """Place un son mono entre gauche (-1) et droite (+1), loi à puissance
    constante (-3 dB au centre). `pan` peut varier dans le temps."""
    a = (np.clip(pan, -1.0, 1.0) + 1.0) * np.pi / 4.0
    return np.stack([np.cos(a) * x, np.sin(a) * x])


def stereo(x: np.ndarray) -> np.ndarray:
    """Mono → stéréo centré (-3 dB par côté), stéréo inchangé."""
    return panoramique(x, 0.0) if x.ndim == 1 else x


# ─── Pistes ──────────────────────────────────────────────────────────────────


class Piste:
    """Un tampon stéréo de la durée du morceau, où l'on dépose des sons."""

    def __init__(self, nom: str, n: int):
        self.nom = nom
        self.x = np.zeros((2, n))

    def ajouter(self, son: np.ndarray, debut: int, gain: float = 1.0, pan: float | None = None) -> None:
        """Dépose `son` (mono ou stéréo) à l'échantillon `debut`. Un son mono est
        placé au centre, ou à `pan`. Ce qui dépasse la fin du morceau est coupé
        (seules les queues de la fin sont concernées : le fondu final les éteint)."""
        s = panoramique(son, pan) if son.ndim == 1 and pan is not None else stereo(son)
        n = self.x.shape[1]
        a, b = debut, debut + s.shape[1]
        sa, sb = 0, s.shape[1]
        if a < 0:
            sa, a = -a, 0
        if b > n:
            sb -= b - n
            b = n
        if b > a:
            self.x[:, a:b] += gain * s[:, sa:sb]


# ─── Réverbération et écho ───────────────────────────────────────────────────


def reponse_reverb(duree: float, tr_grave: float, tr_aigu: float, predelai: float, graine: int,
                   f_grave: float = 500.0, f_aigu: float = 10000.0, montee: float = 0.015, reflexions: int = 8) -> np.ndarray:
    """Réponse impulsionnelle stéréo d'une salle imaginaire, (2, n).

    - bruit blanc différent à gauche et à droite (canaux décorrélés : largeur) ;
    - chaque fréquence s'éteint à sa vitesse : temps de réverbération (-60 dB)
      `tr_grave` sous f_grave, `tr_aigu` au-dessus de f_aigu, interpolé entre
      les deux (les aigus meurent plus vite, comme dans une vraie salle) ;
    - quelques réflexions précoces discrètes dans les 60 premières ms ;
    - pré-délai, puis montée douce de la queue.
    Énergie ramenée à 1 par canal : le niveau se règle à l'envoi."""
    rng = generateur(graine)
    n = ech(duree)
    # Bruit plein spectre : une réponse impulsionnelle n'ajoute aucune fréquence
    # au son qu'elle traite (le résultat ne contient que celles de l'envoi).
    b = rng.standard_normal((2, n))

    def tr(f):
        x = np.clip((np.log(np.maximum(f, 1.0)) - np.log(f_grave)) / (np.log(f_aigu) - np.log(f_grave)), 0.0, 1.0)
        return tr_grave * (tr_aigu / tr_grave) ** x

    def gain(f, t):
        return 10.0 ** (-3.0 * np.maximum(t, 0.0)[None, :] / tr(f)[:, None])

    queue = filtre_variable(b, gain, n_fft=1024, saut=128)
    nm = ech(montee)
    queue[:, :nm] *= rampe(nm)
    for c in range(2):
        for _ in range(reflexions):
            d = rng.uniform(0.003, 0.06)
            g = rng.uniform(2.0, 5.0) * (1.0 - d / 0.08) * rng.choice([-1.0, 1.0])
            queue[c, ech(d)] += g
    queue[:, -ech(0.05):] *= rampe(ech(0.05), montee=False)
    ri = np.zeros((2, n + ech(predelai)))
    ri[:, ech(predelai):] = queue
    return ri / np.sqrt(np.sum(ri**2, axis=1, keepdims=True))


def reponse_echo(retard: float, retour: float, repetitions: int, passe_bas: float = 5000.0, passe_haut: float = 250.0,
                 ping_pong: bool = True) -> np.ndarray:
    """Réponse impulsionnelle d'un écho (2, n) : répétitions tous les `retard`
    secondes, chacune `retour` fois plus faible et un peu plus sombre que la
    précédente (filtre dans la boucle, comme un écho à bande). En ping-pong,
    elles alternent gauche et droite."""
    n_ret = ech(retard)
    L = 4096
    ri = np.zeros((2, n_ret * repetitions + L))
    sos = chaine(biquad("passe-bas", passe_bas, 0.6), biquad("passe-haut", passe_haut, 0.6))
    h = np.zeros(L)
    h[0] = 1.0
    for i in range(1, repetitions + 1):
        h = filtrer(h, sos)
        d = i * n_ret
        if ping_pong:
            ri[(i - 1) % 2, d : d + L] += retour ** (i - 1) * h
        else:
            ri[:, d : d + L] += retour ** (i - 1) * h
    return ri


def convoluer(x: np.ndarray, ri: np.ndarray) -> np.ndarray:
    """Envoi stéréo → retour stéréo : la somme gauche + droite est convoluée
    avec la réponse de chaque canal (calcul par FFT). Même durée que l'envoi."""
    n = x.shape[-1]
    m = 0.5 * (x[0] + x[1])
    return np.stack([signal.fftconvolve(m, ri[c])[:n] for c in range(2)])


# ─── Dynamique ───────────────────────────────────────────────────────────────


def courbe_ducking(n: int, declencheurs, profondeur_db: float, attaque: float = 0.004, maintien: float = 0.02,
                   relache: float = 0.24, anticipation: float = 0.002) -> np.ndarray:
    """Compression latérale déclenchée par la grosse caisse : à chaque coup
    (position en échantillons, force de 0 à 1), le gain descend de
    `profondeur_db × force` en `attaque`, reste bas `maintien`, puis remonte en
    demi-cosinus sur `relache` (courbe douce, sans cassure). La descente
    commence `anticipation` avant le coup, comme un compresseur à anticipation.
    Rend le gain (facteur) par échantillon."""
    na, nm, nr = ech(attaque), ech(maintien), ech(relache)
    forme = np.concatenate([rampe(na), np.ones(nm), 0.5 + 0.5 * np.cos(np.pi * (np.arange(nr) + 1) / nr)])
    reduction = np.zeros(n)
    for pos, force in declencheurs:
        a = int(pos) - ech(anticipation)
        seg = forme * (force * profondeur_db)
        sa = max(0, -a)
        a2, b2 = max(0, a), min(n, a + len(forme))
        if b2 > a2:
            reduction[a2:b2] = np.maximum(reduction[a2:b2], seg[sa : sa + (b2 - a2)])
    return db(-reduction)


def compresseur(x: np.ndarray, seuil_db: float, ratio: float, attaque: float = 0.03, relache: float = 0.25,
                genou_db: float = 6.0) -> tuple[np.ndarray, np.ndarray]:
    """Compresseur de bus (stéréo lié). Détecteur : niveau efficace sur 10 ms ;
    au-dessus du seuil, le dépassement est divisé par `ratio` (genou doux) ;
    le gain suit avec une attaque et un relâchement exponentiels, calculés
    toutes les millisecondes puis interpolés. Rend (signal, gain)."""
    n = x.shape[-1]
    bloc = 48
    ms = uniform_filter1d(np.mean(x**2, axis=0), size=ech(0.01), mode="nearest")
    niveau = 10.0 * np.log10(ms[::bloc] + 1e-12) + 3.01  # niveau efficace → équivalent crête d'un sinus
    d = niveau - seuil_db
    red = np.where(d <= -genou_db / 2, 0.0,
                   np.where(d >= genou_db / 2, d * (1 - 1 / ratio), (1 - 1 / ratio) * (d + genou_db / 2) ** 2 / (2 * genou_db)))
    ka = np.exp(-bloc / (attaque * FE))
    kr = np.exp(-bloc / (relache * FE))
    lisse = np.empty_like(red)
    g = 0.0
    for i, r in enumerate(red):
        k = ka if r > g else kr
        g = k * g + (1 - k) * r
        lisse[i] = g
    gain = db(-np.interp(np.arange(n), np.arange(len(lisse)) * bloc, lisse))
    return x * gain, gain


def enveloppe_crete_vraie(x: np.ndarray) -> np.ndarray:
    """Crête « vraie » de chaque échantillon : maximum des deux canaux,
    suréchantillonnés ×4 (les crêtes entre deux échantillons comptent)."""
    n = x.shape[-1]
    sur = np.abs(surechantillonner(x)).max(axis=0)[: n * SURECH]
    return np.maximum(sur.reshape(n, SURECH).max(axis=1), np.abs(x).max(axis=0))


def _gain_lisse(cible: np.ndarray, demi: int) -> np.ndarray:
    """Gain le plus haut possible qui reste partout sous `cible`, lissé :
    minimum glissant sur 2·demi+1 échantillons, puis moyenne pondérée (fenêtre
    de Hann) de même largeur. Chaque point lissé est une moyenne de valeurs
    toutes inférieures à la cible en ce point : la cible est respectée."""
    largeur_ = 2 * demi + 1
    m = minimum_filter1d(cible, size=largeur_, mode="nearest")
    w = np.hanning(largeur_ + 2)[1:-1]
    w /= w.sum()
    return np.convolve(np.pad(m, demi, mode="edge"), w, mode="valid")


def limiteur(x: np.ndarray, plafond_dbtp: float = -1.8) -> tuple[np.ndarray, np.ndarray]:
    """Limiteur à anticipation, sur la crête vraie. Deux étages : un lent
    (±25 ms, transparent) qui fait l'essentiel, puis un rapide (±1,5 ms) pour
    ce qui dépasse encore. Le gain descend AVANT la crête (le calcul voit
    l'avenir) : aucune crête ne passe et rien n'est écrêté. Rend (signal, gain)."""
    plafond = float(db(plafond_dbtp))
    gain_total = np.ones(x.shape[-1])
    y = x
    for demi in (ech(0.025), ech(0.0015)):
        tp = enveloppe_crete_vraie(y)
        cible = np.minimum(1.0, plafond / np.maximum(tp, 1e-12))
        if cible.min() >= 1.0:
            continue
        g = _gain_lisse(cible, demi)
        y = y * g
        gain_total *= g
    return y, gain_total


# ─── Écriture ────────────────────────────────────────────────────────────────


def ecrire_wav_16(chemin, x: np.ndarray, graine: int) -> None:
    """WAV PCM 16 bits stéréo, avec un dither TPDF (bruit triangulaire de
    ±1 pas de quantification) : la réduction à 16 bits ne crée pas de
    distorsion sur les queues de réverbération. Le premier et le dernier
    échantillon valent exactement 0 sur les deux canaux (le dither, ajouté
    après la montée de 2 ms, pouvait y laisser ±1 pas)."""
    from scipy.io import wavfile

    rng = generateur(graine)
    pas = 1.0 / 32768.0
    d = (rng.random(x.shape) - rng.random(x.shape)) * pas
    y = np.clip(np.round((x + d) * 32768.0), -32768, 32767).astype("<i2")
    y[:, 0] = 0
    y[:, -1] = 0
    wavfile.write(str(chemin), FE, y.T.copy())


def ecrire_wav_flottant(chemin, x: np.ndarray) -> None:
    """WAV 32 bits flottants (pistes d'analyse : aucune quantification)."""
    from scipy.io import wavfile

    wavfile.write(str(chemin), FE, np.ascontiguousarray(x.T, dtype=np.float32))
