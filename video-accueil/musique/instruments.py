# Palette d'instruments de la musique de la version complète.
#
# Chaque fonction rend UNE note ou UN coup, à 48 kHz, en mono (tableau (n,))
# ou en stéréo ((2, n)), à partir de formules du moteur (moteur.py). Rien
# n'est enregistré : grosse caisse, clap, charleston, cymbale, basse, nappe,
# piano électrique, cloche, pluck, mélodie, souffles et montées sont tous
# calculés ici.
#
# Les niveaux, panoramiques et envois vers les réverbérations sont réglés dans
# composer.py ; ici, chaque son sort avec une crête voisine de 1 (force = 1).

from __future__ import annotations

import numpy as np

from moteur import (
    FE,
    FE_SUR,
    F_LIMITE,
    SURECH,
    additif,
    biquad,
    bruit_blanc,
    butterworth,
    chaine,
    decimer,
    ech,
    enveloppe,
    filtre_variable,
    filtrer,
    filtrer_note,
    generateur,
    harmoniques_carre,
    harmoniques_scie,
    lire,
    midi_vers_hz,
    nb_harmoniques,
    panoramique,
    phase,
    rampe,
    reponse_passe_bande,
    reponse_passe_bas,
    reponse_passe_haut,
    saturer,
    table,
    _noter,
)


def _normaliser(x: np.ndarray) -> np.ndarray:
    m = np.max(np.abs(x))
    return x / m if m > 0 else x


DEMI_FIN = 0.006  # s : les montées et souffles s'arrêtent en 12 ms, centrées sur la coupe


def _fin_centree(n: int, coupe: int) -> np.ndarray:
    """Facteur d'amplitude d'un son qui s'arrête SUR la coupe : 1 jusqu'à
    6 ms avant, descente en demi-cosinus, 0 à 6 ms après. À la coupe, il est
    exactement à mi-hauteur : le son s'arrête au temps près, sans claquer."""
    d = int(round(DEMI_FIN * FE))
    f = np.ones(n)
    k = 2 * d
    f[coupe - d : coupe + d] = 0.5 + 0.5 * np.cos(np.pi * (np.arange(k) + 0.5) / k)
    f[coupe + d :] = 0.0
    # Pour le décompte des enveloppes : seul l'arrêt (12 ms) est court ; la
    # montée de ces sons dure de 20 ms à plusieurs secondes.
    _noter(0.02, 2 * DEMI_FIN)
    return f


# ─── Batterie ────────────────────────────────────────────────────────────────


def grosse_caisse(force: float = 1.0, graine: int = 1, f_debut: float = 125.0, f_fin: float = 48.0,
                  tau_hauteur: float = 0.040, tau_amp: float = 0.12, duree: float = 0.22, clic: float = 0.22,
                  coup: float = 200.0, tau_coup: float = 0.012, entrainement: float = 1.8) -> np.ndarray:
    """Grosse caisse :
    - corps : sinus dont la hauteur glisse de ~125 à 48 Hz (exponentiellement,
      constante 40 ms), précédé d'un départ bref plus haut (+200 Hz qui
      s'effacent en 12 ms : la « frappe », ~325 Hz au départ, ~110 Hz à
      25 ms, comme une grosse caisse électronique de type 909). Sans elle,
      la grosse caisse perdait 13 dB de sonie sur un petit haut-parleur
      d'ordinateur ou de téléphone (rien sous 200 Hz), contre 7 dB avec ;
    - décroissance d'amplitude de 120 ms : la grosse caisse laisse la place à
      la basse avant le temps suivant ;
    - légère saturation, appliquée avant la décroissance (elle ne doit pas
      rallonger la traîne) : harmoniques audibles sur un petit haut-parleur ;
    - petit clic d'attaque : bruit filtré autour de 2,5 kHz, 3 ms. Mono."""
    env = enveloppe(duree, attaque=0.0015, relache=0.05, declin=tau_amp, maintien=0.0)
    n = len(env)
    t = np.arange(n) / FE
    f = f_fin + (f_debut - f_fin) * np.exp(-t / tau_hauteur) + coup * np.exp(-t / tau_coup)
    corps = saturer(np.sin(2 * np.pi * phase(f)), entrainement) * env
    corps = _normaliser(corps)
    if clic > 0:
        e = enveloppe(0.003, attaque=0.0015, relache=0.012, declin=0.002, maintien=0.0)
        b = bruit_blanc(len(e), graine) * e
        b = filtrer_note(b, chaine(biquad("passe-bande", 2500.0, 0.7), biquad("passe-haut", 600.0)), marge=0.02)
        corps[: len(b)] += clic * _normaliser(b)
    return force * corps


def battement(force: float = 1.0) -> np.ndarray:
    """Battement grave discret de l'introduction : une grosse caisse ronde
    (90 → 45 Hz), filtrée sous 500 Hz, avec une frappe brève (+100 Hz qui
    s'effacent en 12 ms) et un soupçon de clic. Filtré sous 220 Hz et sans
    attaque (première version), il disparaissait sur un ordinateur portable
    (34 dB sous le mélange) ; la frappe le rend perceptible, sans dureté."""
    x = grosse_caisse(1.0, f_debut=90.0, f_fin=45.0, tau_hauteur=0.05, tau_amp=0.2, duree=0.32, clic=0.05, coup=100.0, entrainement=1.2)
    x = filtrer_note(x, biquad("passe-bas", 500.0, 0.7))
    return force * _normaliser(x)


def clap(force: float = 1.0, graine: int = 2) -> np.ndarray:
    """Clap : quatre rafales de bruit filtré, à 0 ; 5,5 ; 11 et 17,5 ms (les
    mains ne frappent jamais ensemble, mais un clap serré reste en place sur
    la grosse caisse), puis une petite traîne de pièce décorrélée à gauche et à
    droite. Bande centrée vers 1,5 kHz, léger creux à 3,5 kHz (pas de
    dureté). Stéréo."""
    rng = generateur(graine)
    n = ech(0.45)
    x = np.zeros((2, n))
    for k, (d, a) in enumerate(zip((0.0, 0.0055, 0.011, 0.0175), (0.8, 0.9, 0.75, 1.0))):
        e = enveloppe(0.004, attaque=0.0015, relache=0.010, declin=0.0035, maintien=0.0)
        r = bruit_blanc(len(e), 10 * graine + k) * e * a
        i = ech(d + rng.uniform(-0.0004, 0.0004)) if d > 0 else 0
        x[:, i : i + len(e)] += r
    e = enveloppe(0.17, attaque=0.003, relache=0.05, declin=0.07, maintien=0.0)
    i = ech(0.0175)
    x[:, i : i + len(e)] += 0.5 * bruit_blanc(len(e), 10 * graine + 7, 2) * e
    sos = chaine(biquad("passe-haut", 650.0, 0.7), biquad("cloche", 1500.0, 0.9, 5.0), biquad("cloche", 3500.0, 1.2, -2.0),
                 biquad("passe-bas", 11000.0, 0.7))
    return force * _normaliser(filtrer_note(x, sos))


_SOURCE_CHARLESTON: dict = {}


def _source_charleston() -> np.ndarray:
    """Matière commune des charlestons : six carrés à bande limitée aux
    fréquences de la TR-808 (205 à 800 Hz) mêlés à du bruit, filtrés au-dessus
    de 6,5 kHz : il n'en reste qu'un scintillement métallique."""
    if "x" not in _SOURCE_CHARLESTON:
        n = ech(1.2)
        rng = generateur(77)
        metal = np.zeros(n)
        for f in (205.3, 304.4, 369.6, 522.7, 540.0, 800.0):
            metal += lire(table(harmoniques_carre(nb_harmoniques(f))), phase(f, n, rng.random()))
        src = 0.6 * metal / np.std(metal) + bruit_blanc(n, 78)
        src = filtrer(src, chaine(butterworth("passe-haut", 6500.0, 4), biquad("cloche", 10500.0, 1.0, 3.0),
                                  biquad("passe-bas", 17000.0, 0.7)))
        _SOURCE_CHARLESTON["x"] = src / np.max(np.abs(src[ech(0.05):]))
    return _SOURCE_CHARLESTON["x"]


def charleston(force: float = 1.0, ouvert: bool = False, graine: int = 0) -> np.ndarray:
    """Charleston fermé (décroissance 18 ms) ou ouvert (150 ms). Chaque coup
    prend un morceau différent de la matière commune : deux coups ne sont jamais
    identiques. Mono."""
    src = _source_charleston()
    if ouvert:
        e = enveloppe(0.16, attaque=0.0015, relache=0.04, declin=0.15, maintien=0.0)
    else:
        e = enveloppe(0.025, attaque=0.0015, relache=0.012, declin=0.018, maintien=0.0)
    d = int(generateur(graine).integers(ech(0.05), len(src) - len(e)))
    return force * src[d : d + len(e)] * e


def shaker(force: float = 1.0, graine: int = 0) -> np.ndarray:
    """Shaker : bruit dans une bande de 3 à 9 kHz, attaque plus molle (4 ms)
    que le charleston, décroissance 25 ms. Mono."""
    e = enveloppe(0.03, attaque=0.004, relache=0.025, declin=0.025, maintien=0.0)
    b = bruit_blanc(len(e), 500 + graine) * e
    b = filtrer_note(b, chaine(biquad("passe-bande", 6500.0, 0.9), butterworth("passe-haut", 3000.0, 2)), marge=0.02)
    return force * _normaliser(b)


def _matiere_cymbale(n: int, graine: int, decalage: float) -> np.ndarray:
    """Partiels métalliques d'une cymbale : cinq paires FM à rapports non
    entiers (spectre inharmonique), indice qui retombe. Calculé à 192 kHz."""
    n4 = n * SURECH
    t = np.arange(n4) / FE_SUR
    rng = generateur(graine)
    x = np.zeros(n4)
    indice = 3.0 * np.exp(-t / 0.25) + 0.8
    for fc, r in ((3150.0, 1.47), (4230.0, 1.31), (5370.0, 1.62), (6890.0, 1.39), (8430.0, 1.53)):
        fc *= decalage
        x += np.sin(2 * np.pi * fc * t + indice * np.sin(2 * np.pi * fc * r * t + 2 * np.pi * rng.random()) + 2 * np.pi * rng.random())
    return decimer(x)[:n]


def cymbale(force: float = 1.0, duree: float = 3.0, graine: int = 0, sans_attaque: bool = False, tau: float = 1.1) -> np.ndarray:
    """Cymbale crash : bruit (gauche et droite décorrélés) et partiels
    métalliques FM, décroissance en deux temps (éclat de 120 ms, puis nappe de
    constante `tau`, 1,1 s d'ordinaire), passe-haut à 700 Hz. Stéréo.

    `sans_attaque` : enveloppe qui part de 1 (sert à la cymbale inversée,
    dont ce point devient le milieu du son)."""
    n = ech(duree)
    t = np.arange(n) / FE
    decroissance = 0.55 * np.exp(-t / 0.12) + 0.45 * np.exp(-t / tau)
    b = bruit_blanc(n, 900 + graine, 2)
    b = filtrer(b, chaine(butterworth("passe-haut", 700.0, 2), biquad("cloche", 7000.0, 0.7, 4.0), biquad("passe-bas", 15000.0, 0.7)))
    m = np.stack([_matiere_cymbale(n, 910 + graine, 1.0), _matiere_cymbale(n, 920 + graine, 1.004)])
    m = filtrer(m, butterworth("passe-haut", 1000.0, 2))
    x = (0.8 * b / np.std(b) + 0.35 * m / np.std(m)) * decroissance
    if sans_attaque:
        k = ech(0.06)
        x[:, -k:] *= rampe(k, montee=False)
        return force * x / np.max(np.abs(x))
    e = enveloppe(duree - 0.06, attaque=0.002, relache=0.06)[:n]
    return force * _normaliser(x * e)


def caisse_claire(force: float = 1.0, hauteur: float = 1.0, graine: int = 0, longueur: float = 1.0) -> np.ndarray:
    """Caisse claire des roulements : deux modes de peau (190 et 327 Hz, qui
    montent avec `hauteur`) et un timbre de bruit entre 1 et 11 kHz.
    `longueur` < 1 raccourcit le coup (roulements rapides). Stéréo léger."""
    e_ton = enveloppe(0.05 * longueur, attaque=0.0015, relache=0.02, declin=0.04, maintien=0.0)
    e_b = enveloppe(0.09 * longueur, attaque=0.0015, relache=0.03, declin=0.06 * longueur, maintien=0.0)
    n = max(len(e_ton), len(e_b))
    t = np.arange(n) / FE
    f = 190.0 * hauteur * (1 + 0.15 * np.exp(-t / 0.01))
    ton = np.sin(2 * np.pi * phase(f)) + 0.5 * np.sin(2 * np.pi * phase(f * 1.72))
    ton[: len(e_ton)] *= e_ton
    ton[len(e_ton):] = 0.0
    b = bruit_blanc(n, 600 + graine, 2)
    b[:, : len(e_b)] *= e_b
    b[:, len(e_b):] = 0.0
    b = filtrer_note(b, chaine(butterworth("passe-haut", 1000.0, 2), biquad("cloche", 3500.0, 0.8, 2.0), biquad("passe-bas", 11000.0, 0.7)), marge=0.03)
    x = b.copy()
    x[:, :n] += 0.9 * ton
    return force * _normaliser(x)


# ─── Transitions ─────────────────────────────────────────────────────────────


def impact(force: float = 1.0, duree: float = 2.2, graine: int = 0) -> np.ndarray:
    """Impact des décollages : grondement grave (sinus de 68 à 31 Hz,
    décroissance 550 ms), coup de poing (sinus 160 → 50 Hz, 25 ms), souffle
    large (bruit 200 Hz – 3 kHz). Le grave est mono ; le souffle, stéréo."""
    e = enveloppe(duree, attaque=0.003, relache=0.10, declin=0.55, maintien=0.0)
    n = len(e)
    t = np.arange(n) / FE
    sub = np.sin(2 * np.pi * phase(31.0 + 37.0 * np.exp(-t / 0.35))) * e
    e2 = enveloppe(0.10, attaque=0.0015, relache=0.03, declin=0.05, maintien=0.0)
    coup = np.zeros(n)
    t2 = np.arange(len(e2)) / FE
    coup[: len(e2)] = np.sin(2 * np.pi * phase(50.0 + 110.0 * np.exp(-t2 / 0.025))) * e2
    grave = saturer(sub + 0.8 * coup, 1.5)
    e3 = enveloppe(0.45, attaque=0.002, relache=0.12, declin=0.18, maintien=0.0)
    s = bruit_blanc(len(e3), 700 + graine, 2) * e3
    s = filtrer_note(s, chaine(biquad("passe-haut", 200.0, 0.7), biquad("passe-bas", 3000.0, 0.7)))
    x = panoramique(_normaliser(grave), 0.0)
    m = min(n, s.shape[1])
    x[:, :m] += 0.22 * _normaliser(s)[:, :m]
    return force * x


def montee(duree: float, graine: int, f_debut: float = 350.0, f_fin: float = 9000.0, q: float = 1.2,
           exposant: float = 1.6) -> np.ndarray:
    """Montée (riser) : bruit stéréo dans un passe-bande dont le centre monte
    exponentiellement de f_debut à f_fin, volume qui croît jusqu'à la coupe,
    placée à `duree` ; arrêt centré sur la coupe (voir `_fin_centree`)."""
    n = ech(duree + DEMI_FIN) + 1
    b = bruit_blanc(n, 800 + graine, 2)

    def gain(f, t):
        p = np.clip(t / duree, 0.0, 1.0)
        fc = f_debut * (f_fin / f_debut) ** p
        return reponse_passe_bande(f[:, None], fc[None, :], q) * reponse_passe_haut(f[:, None], 150.0, 2)

    x = filtre_variable(b, gain)
    t = np.arange(n) / FE
    amp = np.clip(t / duree, 0.0, 1.0) ** exposant * _fin_centree(n, ech(duree))
    x = x * amp
    return x / np.max(np.abs(x[:, ech(duree) - ech(0.05) : ech(duree) - ech(DEMI_FIN)]))


def souffle_inverse(duree: float, graine: int, tau: float = 0.35, f_debut: float = 600.0, f_fin: float = 7000.0) -> np.ndarray:
    """Souffle inversé : comme une réverbération jouée à l'envers. Le bruit
    enfle exponentiellement (constante `tau`) et s'éclaircit jusqu'à la coupe,
    placée à `duree`, où il s'arrête (arrêt centré sur la coupe). Stéréo."""
    n = ech(duree + DEMI_FIN) + 1
    nf = ech(duree)
    b = bruit_blanc(n, 1000 + graine, 2)

    def gain(f, t):
        p = np.clip(t / duree, 0.0, 1.0)
        fc = f_debut * (f_fin / f_debut) ** (p**1.5)
        return reponse_passe_bas(f[:, None], fc[None, :], 2) * reponse_passe_haut(f[:, None], 250.0, 2)

    x = filtre_variable(b, gain)
    t = np.arange(n) / FE
    env = np.exp(-np.maximum(duree - t, 0.0) / tau) * _fin_centree(n, nf)
    env[:ech(0.02)] *= rampe(ech(0.02))
    x = x * env
    return x / np.max(np.abs(x[:, nf - ech(0.03) : nf - ech(DEMI_FIN)]))


def cymbale_inversee(duree: float, graine: int) -> np.ndarray:
    """Cymbale inversée : la cymbale jouée à l'envers, d'un seul tenant ; son
    éclat d'origine tombe 6 ms après la coupe, et l'arrêt centré sur la coupe
    l'efface. (Un raccord en miroir autour de la coupe cassait la pente de
    l'onde : un petit clic, trouvé par analyse.py.) Stéréo."""
    c = cymbale(1.0, duree + 0.2, graine, sans_attaque=True)
    nf, nr = ech(duree), ech(DEMI_FIN) + 1
    x = c[:, : nf + nr][:, ::-1].copy()
    x *= _fin_centree(x.shape[1], nf)
    k = ech(0.05)
    x[:, :k] *= rampe(k)
    return x / np.max(np.abs(x))


def descente(duree: float, graine: int, f_debut: float = 9000.0, f_fin: float = 250.0) -> np.ndarray:
    """Descente (downlifter) : bruit dont le passe-bas se ferme de 9 kHz à
    250 Hz pendant que le volume retombe, avec un sinus qui chute de 700 à
    70 Hz. Stéréo."""
    rel = 0.03
    n = ech(duree + rel)
    b = bruit_blanc(n, 1100 + graine, 2)

    def gain(f, t):
        p = np.clip(t / duree, 0.0, 1.0)
        fc = f_debut * (f_fin / f_debut) ** p
        return reponse_passe_bas(f[:, None], fc[None, :], 2) * reponse_passe_haut(f[:, None], 150.0, 2)

    x = filtre_variable(b, gain)
    t = np.arange(n) / FE
    p = np.clip(t / duree, 0.0, 1.0)
    chute = np.sin(2 * np.pi * phase(700.0 * (70.0 / 700.0) ** p))
    env = enveloppe(duree, attaque=0.02, relache=rel)[:n] * (1.0 - p) ** 1.6
    x = (x / np.std(x) + 0.35 * chute) * env
    return x / np.max(np.abs(x))


def air(duree: float, graine: int, attaque: float = 1.5, relache: float = 1.5) -> np.ndarray:
    """Air : souffle très doux entre 5 et 14 kHz, qui ondule lentement. Stéréo."""
    e = enveloppe(duree, attaque=attaque, relache=relache)
    n = len(e)
    b = bruit_blanc(n, 1200 + graine, 2)
    b = filtrer(b, chaine(butterworth("passe-haut", 5000.0, 2), butterworth("passe-bas", 14000.0, 2)))
    t = np.arange(n) / FE
    return b / np.std(b) * e * (1.0 + 0.3 * np.sin(2 * np.pi * 0.21 * t))


# ─── Basse ───────────────────────────────────────────────────────────────────


def basse(midi: float, duree: float, force: float = 1.0, brillance: float = 1500.0, part_medium: float = 1.0,
          entrainement: float = 2.2, brillance_attaque: float | None = None, tau_brillance: float = 0.07) -> np.ndarray:
    """Basse en deux couches, mono :
    - sous-basse : un sinus pur sur le fondamental (c'est lui qu'on sent) ;
    - couche médium : dents de scie sans leur fondamental, filtrées vers
      `brillance` puis saturées, et passe-haut à 110 Hz. C'est elle qu'on
      entend sur un haut-parleur d'ordinateur ou de téléphone. Elle suit la
      phase de la sous-basse (son front raide tombe quand le sinus passe par
      zéro en montant) et n'a pas de fondamental : les deux couches ne peuvent
      pas s'annuler.
    Avec `brillance_attaque`, le filtre de la couche médium s'ouvre à cette
    fréquence à l'attaque, puis se referme vers `brillance` (constante
    `tau_brillance`) : chaque note commence par un petit « pincement »
    brillant qui la détache sur un petit haut-parleur, sans rendre la tenue
    plus brillante. (Fondu entre deux tables lues à la même phase : aucun
    saut dans l'onde.)
    Le grain aigu d'une dent de scie tient dans son front raide, une fois par
    période. Partie de la phase 0, la note commençait sur ce front, étouffé
    par l'attaque : le grain n'arrivait qu'une période plus tard (14 ms pour
    un Ré2, 18 ms pour un La1), et sur un petit haut-parleur la note semblait
    en retard (mesuré par analyse.py). Les deux couches partent donc un peu
    avant ce point : le premier front tombe 4 ms après le début de la note,
    juste après l'attaque de 3 ms."""
    f0 = float(midi_vers_hz(midi))
    env = enveloppe(duree, attaque=0.003, relache=0.035)
    n = len(env)
    ph = phase(f0, n, phase0=1.0 - 0.004 * f0)  # phase entière (le front) à 4 ms
    sub = np.sin(2 * np.pi * ph) * env
    K = min(150, nb_harmoniques(f0))
    k = np.arange(1, K + 1)
    a = harmoniques_scie(K) * reponse_passe_bas(k * f0, brillance, 2, resonance_db=3.0)
    a[0] = 0.0
    env_med = enveloppe(duree, attaque=0.003, relache=0.035, declin=0.25, maintien=0.65)
    sombre = lire(table(a), ph)
    # Niveau de référence : celui de la tenue (table sombre). L'attaque plus
    # brillante peut dépasser un peu ; la saturation qui suit l'arrondit.
    ref = np.max(np.abs(sombre * env_med))
    if brillance_attaque:
        a2 = harmoniques_scie(K) * reponse_passe_bas(k * f0, brillance_attaque, 2, resonance_db=3.0)
        a2[0] = 0.0
        b = np.exp(-np.arange(n) / FE / tau_brillance)
        med = (b * lire(table(a2), ph) + (1.0 - b) * sombre) * env_med
    else:
        med = sombre * env_med
    med = saturer(med / ref, entrainement)
    med = filtrer_note(med, chaine(butterworth("passe-haut", 110.0, 4), biquad("passe-bas", 3500.0, 0.7)), marge=0.04)
    x = np.zeros(len(med))
    x[:n] = sub
    x += part_medium * _normaliser(med)
    return force * x


def basse_tenue(midi: float, duree: float, attaque: float, relache: float, declin: float | None = None,
                maintien: float = 0.0) -> np.ndarray:
    """Basse tenue (bourdon de l'introduction, de la pause et de la fin) :
    sinus et harmoniques 2, 3 et 4 (0,5 ; 0,3 ; 0,15). Le fondamental (55 à
    92 Hz) se sent sur de bonnes enceintes ; les harmoniques (110 à 370 Hz)
    font entendre la note sur un ordinateur portable ou un téléphone, qui ne
    rendent rien sous 150–200 Hz. (Avec 0,12 et 0,04, première version, la
    basse de l'introduction et de la pause y était 28 à 33 dB sous le
    mélange : elle n'existait qu'au casque.) Avec `declin`, la note décroît
    vers le palier `maintien` après son attaque. Mono."""
    f0 = float(midi_vers_hz(midi))
    env = enveloppe(duree, attaque=attaque, relache=relache, declin=declin, maintien=maintien if declin else 1.0)
    ph = 2 * np.pi * phase(f0, len(env))
    return (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + 0.15 * np.sin(4 * ph)) * env


# ─── Harmonie ────────────────────────────────────────────────────────────────

DESACCORD_CENTS = (-19.0, -11.5, -4.5, 0.0, 4.5, 11.5, 19.0)
GAINS_VOIX = (0.62, 0.72, 0.85, 1.0, 0.85, 0.72, 0.62)
PANS_VOIX = (-0.85, 0.65, -0.4, 0.0, 0.4, -0.65, 0.85)


def nappe(midi: float, duree: float, attaque: float, relache: float, graine: int, ecart: float = 1.0) -> np.ndarray:
    """Nappe « supersaw » : sept dents de scie à bande limitée, désaccordées de
    ±19 cents au plus, phases de départ tirées au hasard (graine fixe), chacune
    avec une très lente dérive de hauteur (±1,5 cent, comme un synthétiseur
    analogique), réparties de gauche à droite. Le filtrage (passe-haut et
    ouverture du passe-bas) se fait sur le bus, dans composer.py. Stéréo."""
    f0 = float(midi_vers_hz(midi))
    env = enveloppe(duree, attaque=attaque, relache=relache)
    n = len(env)
    rng = generateur(graine)
    f_max = f0 * 2 ** (max(DESACCORD_CENTS) * ecart / 1200) * 1.001
    onde = table(harmoniques_scie(nb_harmoniques(f_max, 15000.0)))
    t = np.arange(n) / FE
    x = np.zeros((2, n))
    for c, g, p in zip(DESACCORD_CENTS, GAINS_VOIX, PANS_VOIX):
        derive = 1.0 + 0.0009 * np.sin(2 * np.pi * (0.13 + 0.07 * rng.random()) * t + 2 * np.pi * rng.random())
        f = f0 * 2 ** (c * ecart / 1200) * derive
        x += panoramique(g * lire(onde, phase(f, phase0=rng.random())), p)
    return x * env / sum(GAINS_VOIX)


def piano_fm(midi: float, duree: float, force: float = 0.8, relache: float = 0.09) -> np.ndarray:
    """Piano électrique FM, dans l'esprit des Rhodes du DX7 :
    - corps : porteuse et modulante à la même fréquence, indice qui retombe
      (le son s'adoucit après l'attaque) ;
    - « tine » : modulante à 14 fois la fréquence, très brève (le tintement
      métallique du marteau) ;
    plus on frappe fort, plus l'indice est haut (plus brillant). Calcul à
    192 kHz, filtré et ramené à 48 kHz : aucune bande latérale ne se replie.
    Mono (le trémolo stéréo est appliqué sur le bus)."""
    f0 = float(midi_vers_hz(midi))
    env = enveloppe(duree, attaque=0.002, relache=relache)
    n = len(env)
    t = np.arange(n * SURECH) / FE_SUR
    ph = 2 * np.pi * f0 * t
    corps = np.sin(ph + force * (1.5 * np.exp(-t / 0.30) + 0.35) * np.sin(ph))
    tine = np.sin(ph + force * 1.6 * np.exp(-t / 0.018) * np.sin(14.0 * ph))
    tau = 1.7 * (220.0 / f0) ** 0.3
    x = 0.85 * corps * np.exp(-t / tau) + 0.30 * tine * np.exp(-t / 0.4)
    return force * decimer(x)[:n] * env


def cloche(midi: float, force: float = 1.0, duree: float = 2.6, tau_corps: float = 1.9,
           etouffement: tuple[float, float] | None = None) -> np.ndarray:
    """Cloche FM du logo sonore et des notes de repère :
    - corps : FM 1:1 à indice qui retombe (attaque brillante, tenue douce) ;
    - éclat : FM 1:3, dont les partiels (2, 4, 5 et 7 fois la fréquence) sont
      des harmoniques de la note : ils se fondent dans le son au lieu de
      s'entendre comme une seconde note. (Un rapport 1:3,5 donnait des
      partiels à 2,5 et 4,5 fois la fréquence : justes sur La et Mi, mais
      Mi# et Ré# sur le Do#5 de note-2, hors de La majeur.) La modulante est
      désaccordée de 0,07 % : ces partiels battent lentement (environ 1 Hz)
      avec ceux du corps, le scintillement d'une vraie cloche. Il s'éteint en
      0,7 s ;
    - tintement : partiel pur deux octaves au-dessus, 0,2 s.
    Attaque 1,5 ms (franche), extinction naturelle : le corps décroît avec la
    constante `tau_corps` (1,9 s pour le logo, plus courte pour les repères
    des décollages, voir composer.py). Calcul à 192 kHz. Mono.

    `etouffement` (instant, constante), en secondes depuis l'attaque : à
    partir de cet instant, la cloche est étouffée (comme une main posée
    dessus) et s'éteint en exponentielle, à pente constante en dB (8,7 dB
    par constante de temps). Sert à l'accord final : le son s'éteint de
    lui-même avant la fin du morceau, sans fondu."""
    f0 = float(midi_vers_hz(midi))
    env = enveloppe(duree, attaque=0.0015, relache=0.25)
    n = len(env)
    t = np.arange(n * SURECH) / FE_SUR
    ph = 2 * np.pi * f0 * t
    corps = np.sin(ph + (0.9 * force * np.exp(-t / 0.35) + 0.12) * np.sin(ph)) * np.exp(-t / tau_corps)
    eclat = 0.45 * np.sin(ph + 2.2 * force * np.exp(-t / 0.13) * np.sin(3.0 * 1.0007 * ph)) * np.exp(-t / 0.75)
    tintement = 0.10 * force * np.sin(4.0 * ph) * np.exp(-t / 0.22)
    if etouffement is not None:
        debut, tau_e = etouffement
        env = env * np.exp(-np.maximum(np.arange(n) / FE - debut, 0.0) / tau_e)
    return force * decimer(corps + eclat + tintement)[:n] * env


# ─── Mélodie ─────────────────────────────────────────────────────────────────


def pluck(midi: float, duree: float, force: float = 1.0, brillance: float = 3000.0, tau: float = 0.35,
          raideur: float = 0.45, largeur_: float = 0.3, desaccord: float = 7.0, relache: float = 0.03) -> np.ndarray:
    """Pluck additif : harmoniques en 1/k (dents de scie) passées dans un
    passe-bas à `brillance` Hz ; chaque harmonique s'éteint d'autant plus vite
    qu'elle est aiguë (`raideur`), comme une corde pincée. Stéréo compatible
    mono : milieu = la note, côtés = la même note désaccordée de 7 cents
    (gauche + droite = la note seule, sans battement)."""
    f0 = float(midi_vers_hz(midi))
    env = enveloppe(duree, attaque=0.0015, relache=relache)
    n = len(env)
    fc = brillance * (0.6 + 0.4 * force)
    K = nb_harmoniques(f0 * 2 ** (desaccord / 1200), min(F_LIMITE, 6.0 * fc))
    k = np.arange(1, K + 1)
    a = harmoniques_scie(K) * reponse_passe_bas(k * f0, fc, 2)
    taus = tau / (1.0 + raideur * (k - 1))
    m = additif(f0, n, a, taus)
    s = largeur_ * additif(f0 * 2 ** (desaccord / 1200), n, a, taus)
    return force * np.stack([m + s, m - s]) * env


def etincelle(midi: float, force: float = 1.0) -> np.ndarray:
    """Étincelle du scintillement : note aiguë très courte, sinus et deux
    partiels qui s'éteignent vite. Mono."""
    f0 = float(midi_vers_hz(midi))
    env = enveloppe(0.5, attaque=0.002, relache=0.15)
    a = np.array([1.0, 0.22, 0.07])
    a[f0 * np.arange(1, 4) > F_LIMITE] = 0.0
    return force * additif(f0, len(env), a, [0.45, 0.22, 0.11]) * env


def phrase_lead(notes, glisse: float = 0.035, vibrato_cents: float = 12.0, vitesse_vibrato: float = 5.3,
                desaccord: float = 8.0, largeur_: float = 0.25) -> np.ndarray:
    """Mélodie de l'accroche, rendue d'un seul tenant (un oscillateur continu
    pour toute la phrase) :
    - `notes` : liste de (début s, durée s, midi, force), le début étant
      relatif à la première note ;
    - deux notes liées glissent l'une vers l'autre (portamento exponentiel de
      35 ms) ;
    - vibrato léger (±12 cents, 5,3 Hz) qui s'installe sur les notes longues ;
    - timbre : dents de scie + un peu de carré, dont la brillance retombe
      après chaque attaque (fondu entre une table claire et une table sombre
      lues à la même phase) ;
    - largeur : une seconde voix désaccordée de 8 cents, en côtés seulement
      (compatible mono). Stéréo."""
    fin = max(d + du for d, du, _, _ in notes)
    rel = 0.09
    n = ech(fin + rel) + 1
    t = np.arange(n) / FE
    hauteur = np.full(n, float(notes[0][2]))
    brillance = np.zeros(n)
    amp = np.zeros(n)
    vib = np.zeros(n)
    precedente = None
    for d, du, m, v in notes:
        i = ech(d)
        if precedente is not None and abs(precedente[0] + precedente[1] - d) < 0.002:
            dt = t[i:] - d
            hauteur[i:] = m + (precedente[2] - m) * np.exp(-dt / (glisse / 3.0))
        else:
            hauteur[i:] = m
        e = enveloppe(du, attaque=0.004, relache=rel, declin=0.35, maintien=0.78) * v
        j = min(n, i + len(e))
        amp[i:j] = np.maximum(amp[i:j], e[: j - i])
        dt = t[i:j] - d
        brillance[i:j] = np.maximum(brillance[i:j], (0.3 + 0.7 * v * np.exp(-dt / 0.28)) * (e[: j - i] > 0))
        if du >= 0.6:
            prof = np.clip((dt - 0.18) / 0.3, 0.0, 1.0) * (dt < du)
            vib[i:j] = np.maximum(vib[i:j], prof)
        precedente = (d, du, m)
    # Le timbre et la profondeur du vibrato changent à chaque note : lissés sur
    # 3 ms, ils ne peuvent pas créer de saut dans l'onde (analyse.py en
    # trouvait un, de -66 dBFS, au début de chaque note liée).
    lisse = np.hanning(ech(0.003) + 2)[1:-1]
    lisse /= lisse.sum()
    brillance = np.convolve(brillance, lisse, mode="same")
    vib = np.convolve(vib, lisse, mode="same")
    hauteur += vib * (vibrato_cents / 100.0) * np.sin(2 * np.pi * vitesse_vibrato * t)
    f = midi_vers_hz(hauteur)
    K = nb_harmoniques(float(f.max()) * 2 ** (desaccord / 1200))
    k = np.arange(1, K + 1)
    spectre = harmoniques_scie(K) + 0.35 * harmoniques_carre(K)
    # Une seule table pour toute la phrase : le filtrage qu'elle contient suit
    # la note (comme un filtre « à suivi de clavier »), calé sur la hauteur
    # médiane de la phrase.
    f_ref = float(np.median(midi_vers_hz([m for _, _, m, _ in notes])))
    claire = table(spectre * reponse_passe_bas(k * f_ref, 6000.0, 2))
    sombre = table(spectre * reponse_passe_bas(k * f_ref, 1800.0, 2))
    ph = phase(f)
    m = brillance * lire(claire, ph) + (1.0 - brillance) * lire(sombre, ph)
    ph2 = phase(f * 2 ** (desaccord / 1200), phase0=0.37)
    s = largeur_ * (brillance * lire(claire, ph2) + (1.0 - brillance) * lire(sombre, ph2))
    x = np.stack([m + s, m - s]) * amp
    return x / np.max(np.abs(x))
