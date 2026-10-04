# Mesures de niveau, partagées par le mastering (composer.py) et par le
# contrôle (analyse.py) : c'est le même instrument de mesure qui règle le
# niveau et qui le vérifie. analyse.py l'étalonne d'abord sur des signaux dont
# on connaît la réponse exacte.
#
# - Sonie selon la recommandation UIT-R BS.1770-4 : pondération K (deux
#   filtres de la norme, coefficients pour 48 kHz), blocs de 400 ms tous les
#   100 ms, porte absolue à -70 LUFS et porte relative à -10 LU.
# - Sonie à court terme (fenêtre de 3 s) et momentanée (400 ms), au sens de
#   l'EBU R 128 : fenêtre glissante qui SE TERMINE à l'instant donné.
# - Plage de sonie (LRA, EBU Tech 3342), approximative sur 30 s.
# - Crête vraie : signal suréchantillonné ×4 (même filtre que le moteur).

from __future__ import annotations

import numpy as np
from scipy import signal

from moteur import FE, surechantillonner

# Pondération K, coefficients de la norme à 48 kHz.
_K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def ponderation_k(x: np.ndarray) -> np.ndarray:
    """Filtre de pondération K (le dernier axe est le temps)."""
    y = signal.lfilter(_K1[0], _K1[1], x, axis=-1)
    return signal.lfilter(_K2[0], _K2[1], y, axis=-1)


def _cumul(x: np.ndarray) -> np.ndarray:
    """Somme cumulée de la puissance pondérée K, canaux additionnés (G = 1
    pour gauche et droite)."""
    y = ponderation_k(np.atleast_2d(x))
    p = np.sum(y**2, axis=0)
    c = np.zeros(len(p) + 1)
    np.cumsum(p, out=c[1:])
    return c


def _sonie(z):
    return -0.691 + 10.0 * np.log10(np.maximum(z, 1e-20))


def sonie_integree(x: np.ndarray) -> float:
    """Sonie intégrée en LUFS (BS.1770-4, avec portes)."""
    c = _cumul(x)
    n = len(c) - 1
    L, pas = int(0.4 * FE), int(0.1 * FE)
    debuts = np.arange(0, n - L + 1, pas)
    z = (c[debuts + L] - c[debuts]) / L
    l = _sonie(z)
    garde = l > -70.0
    if not garde.any():
        return float("-inf")
    seuil = _sonie(np.mean(z[garde])) - 10.0
    garde &= l > seuil
    return float(_sonie(np.mean(z[garde])))


def sonie_fenetre(x: np.ndarray, instants_s, duree: float) -> np.ndarray:
    """Sonie (LUFS) d'une fenêtre de `duree` secondes se terminant à chaque
    instant donné. Au début du morceau, la fenêtre est tronquée (on mesure ce
    qui existe déjà, comme un sonomètre que l'on vient d'allumer)."""
    c = _cumul(x)
    n = len(c) - 1
    fins = np.clip(np.round(np.asarray(instants_s) * FE).astype(int), 1, n)
    debuts = np.maximum(0, fins - int(round(duree * FE)))
    z = (c[fins] - c[debuts]) / np.maximum(1, fins - debuts)
    return _sonie(z)


def plage_sonie(x: np.ndarray) -> float:
    """Plage de sonie (LRA, EBU Tech 3342) : écart entre les centiles 10 et
    95 des sonies à court terme (3 s, tous les 100 ms), portes à -70 LUFS et
    à -20 LU sous leur moyenne énergétique. Sur 30 s, c'est une approximation."""
    c = _cumul(x)
    n = len(c) - 1
    L, pas = 3 * FE, int(0.1 * FE)
    debuts = np.arange(0, n - L + 1, pas)
    z = (c[debuts + L] - c[debuts]) / L
    l = _sonie(z)
    garde = l > -70.0
    seuil = _sonie(np.mean(z[garde])) - 20.0
    v = l[garde & (l > seuil)]
    return float(np.percentile(v, 95) - np.percentile(v, 10))


def crete_vraie_db(x: np.ndarray) -> float:
    """Crête vraie en dBTP (suréchantillonnage ×4, filtre de 511 coefficients)."""
    return float(20.0 * np.log10(np.max(np.abs(surechantillonner(x))) + 1e-20))


def crete_echantillon_db(x: np.ndarray) -> float:
    """Crête échantillon en dBFS."""
    return float(20.0 * np.log10(np.max(np.abs(x)) + 1e-20))
