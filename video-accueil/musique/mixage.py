# Mixage de la bande-son : musique + bruitages d'interface. Personne ne peut
# l'écouter ici, alors on le mesure.
#
# Lancer (depuis video-accueil/) :
#   npm run donnees
#   npx remotion render src/index.ts Complete out/musique/mix-complete.wav --codec=wav
#   python3 musique/mixage.py
# ou simplement : npm run rendu -- son (rend, puis lance ce script).
#
# Options :
#   --rendu <wav>     rendu Remotion à contrôler (défaut : out/musique/mix-complete.wav,
#                     ignoré s'il n'existe pas : on ne mesure alors que le modèle)
#   --feuille sans    évalue la feuille d'origine (EFFETS_SANS_MUSIQUE, sans les
#                     notes ni l'impact) posée sur la musique : c'est l'état des
#                     lieux qui justifie chaque retrait
#   --sortie <json>   défaut : out/musique/mixage.json (feuille avec musique)
#
# Lit :
#   src/son/BandeSon.tsx   feuilles EFFETS_AVEC_MUSIQUE et EFFETS_SANS_MUSIQUE
#   src/tempo.ts           VOLUME_MUSIQUE, VOLUME_EFFETS, et t(n) = round(n × 15)
#   public/musique.wav, public/sons/*.wav, out/musique/partition.json
#
# 1. Modèle : le mélange attendu, construit comme Remotion le fait (mesuré sur
#    un rendu le 03/10) : chaque son part au début de son image, retardé d'un
#    nombre ENTIER de millisecondes (adelay, arrondi), les sons mono sont
#    recopiés sur les deux canaux à -3 dB (ffmpeg -ac 2), puis tout est
#    additionné sans normalisation (amix normalize=0).
# 2. Pour chaque bruitage, mesuré contre la musique au même instant :
#    - niveau relatif : énergie pondérée K du bruitage contre celle de la
#      musique, sur la durée utile du bruitage (enveloppe à moins de 20 dB de
#      sa crête), mais au moins 100 ms (l'oreille intègre l'énergie d'un son
#      court sur 100 à 200 ms). Cible : 6 à 10 dB sous la musique ;
#    - émergence : meilleur tiers d'octave (63 Hz à 16 kHz) sur la durée utile.
#      En dessous de +3 dB, le bruitage est masqué ;
#    - accents semblables de la musique au même instant (±35 ms) : clap et
#      caisse claire de force 0,5 au moins pour un clic, un tic ou un pop (les
#      premières frappes d'un roulement, de force 0,25 à 0,36, sont relevées à
#      part) ; souffle, montée, cymbale inversée ou descente en cours, ou
#      cymbale et impact à ±150 ms de sa crête, pour un whoosh. Un whoosh
#      double une transition quand les souffles de la musique (piste
#      out/musique/pistes/effets.wav) sont à moins de 6 dB de lui dans ses
#      propres bandes ;
#    - écart à la note de la musique la plus proche (swing et micro-décalages
#      compris) : entre 8 et 40 ms d'une frappe, on entend deux coups.
# 3. Si un rendu existe : écart rendu − modèle (le calage et les gains de
#    chaque bruitage sont retrouvés par moindres carrés), sonie intégrée, crête
#    vraie, clics, sonie par plan, fin du fichier.

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True  # pas de dossier __pycache__ dans musique/

import numpy as np  # noqa: E402
from scipy import signal  # noqa: E402
from scipy.io import wavfile  # noqa: E402

import matplotlib  # noqa: E402

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Patch  # noqa: E402

import mesures  # noqa: E402
from analyse import PLANS, detecter_clics  # noqa: E402
from moteur import FE  # noqa: E402

ICI = Path(__file__).resolve().parent
VIDEO = ICI.parent
DOSSIER = VIDEO / "out" / "musique"
ET = 24000  # échantillons par temps (120 BPM)
FPS = 30
MONO_VERS_STEREO = 1 / np.sqrt(2)  # ffmpeg -ac 2 (mesuré : 0,7071 sur chaque canal)

CIBLE_RELATIF = (-10.0, -6.0)
SEUIL_EMERGENCE = 3.0
SEMBLABLES_COURTS = {"clap", "caisse_claire"}
FORCE_ACCENT = 0.5  # en dessous, la première frappe d'un roulement : pas un accent
FRAPPES = {"grosse_caisse", "battement", "clap", "caisse_claire", "charleston", "shaker"}
SANS_ATTAQUE = {"nappe", "basse_tenue", "air", "montee", "souffle_inverse", "cymbale_inversee", "descente"}
SOUFFLES_MUSIQUE = {"montee", "souffle_inverse", "cymbale_inversee", "descente"}


def r(v, n=1):
    return None if v is None else round(float(v), n)


# ─── Lecture des sources ─────────────────────────────────────────────────────


def lire_wav(chemin: Path) -> np.ndarray:
    fe, x = wavfile.read(str(chemin))
    assert fe == FE, f"{chemin} : {fe} Hz"
    x = x.astype(np.float64) / 32768.0 if x.dtype == np.int16 else x.astype(np.float64)
    return x[:, None].T if x.ndim == 1 else x.T  # (canaux, n)


def lire_feuille(nom: str) -> list[dict]:
    """Une feuille de BandeSon.tsx : [{temps, son, gain_db}]."""
    texte = (VIDEO / "src" / "son" / "BandeSon.tsx").read_text(encoding="utf-8")
    i = texte.index(f"export const {nom}: Effet[] = [")
    bloc = texte[i : texte.index("\n];", i)]
    bloc = "\n".join(l.split("//")[0] for l in bloc.splitlines())  # sans les commentaires
    effets = []
    for m in re.finditer(r'\{\s*temps:\s*([\d.]+)\s*,\s*son:\s*"([\w-]+)"\s*(?:,\s*gainDb:\s*(-?[\d.]+)\s*)?\}', bloc):
        effets.append(dict(temps=float(m[1]), son=m[2], gain_db=float(m[3] or 0)))
    # Série (compteur) : Array.from({ length: n }, (_, i) => ({ temps: a + p * i, son, gainDb: -(g * i) / k }))
    for m in re.finditer(r'length:\s*(\d+)\s*\}.*?temps:\s*([\d.]+)\s*\+\s*([\d.]+)\s*\*\s*i,\s*son:\s*"([\w-]+)"'
                         r'(?:\s*as Son)?(?:,\s*gainDb:\s*-\((\d+)\s*\*\s*i\)\s*/\s*(\d+))?', bloc, re.S):
        for k in range(int(m[1])):
            g = -(float(m[5]) * k) / float(m[6]) if m[5] else 0.0
            effets.append(dict(temps=float(m[2]) + float(m[3]) * k, son=m[4], gain_db=g))
    return sorted(effets, key=lambda e: e["temps"])


def lire_volumes() -> dict:
    texte = (VIDEO / "src" / "tempo.ts").read_text(encoding="utf-8")
    return {n: float(re.search(rf"export const {n}\s*=\s*([\d.]+)", texte)[1]) for n in ("VOLUME_MUSIQUE", "VOLUME_EFFETS")}


def image(temps: float) -> int:
    """src/tempo.ts : t(n) = Math.round(n × 15) (arrondi au-dessus pour ,5)."""
    return int(np.floor(temps * 15 + 0.5 + 1e-9))


def debut_echantillon(img: int) -> int:
    """Remotion : adelay en millisecondes entières ((img / 30 s) × 1000, toFixed(0))."""
    return int(np.floor(img * 1000 / FPS + 0.5)) * (FE // 1000)


def gabarit(son: str, cache={}) -> np.ndarray:
    if son not in cache:
        x = lire_wav(VIDEO / "public" / "sons" / f"{son}.wav")
        cache[son] = np.vstack([x[0], x[0]]) * MONO_VERS_STEREO if x.shape[0] == 1 else x
    return cache[son]


# ─── Outils de mesure ────────────────────────────────────────────────────────


def tiers_octave(x: np.ndarray, f0: float) -> np.ndarray:
    sos = signal.butter(3, [f0 / 2 ** (1 / 6), min(f0 * 2 ** (1 / 6), 0.45 * FE)], "bandpass", fs=FE, output="sos")
    return signal.sosfiltfilt(sos, x, axis=-1)


CENTRES = [f for f in 1000 * 2 ** (np.arange(-15, 15) / 3) if 60 < f < 17000]


def duree_utile(x: np.ndarray) -> int:
    """Nombre d'échantillons depuis le début jusqu'au dernier instant où
    l'enveloppe (efficace sur 1 ms) est à moins de 20 dB de sa crête."""
    m = np.mean(x, axis=0)
    e = 10 * np.log10(np.convolve(m**2, np.ones(48) / 48, "same") + 1e-16)
    return int(np.nonzero(e > e.max() - 20)[0][-1]) + 1


# ─── Mesures d'un bruitage contre la musique ─────────────────────────────────


def evenements_musique(partition: dict) -> list[dict]:
    """Attaques de la partition, en ms, swing et micro-décalages compris."""
    out = []
    for ev in partition["evenements"]:
        if ev["instrument"] in SANS_ATTAQUE:
            continue
        ms = ev["debut"] * 500.0 + ev.get("decalage_ms", 0.0) + ev.get("swing_ms", 0.0)
        out.append(dict(instrument=ev["instrument"], debut=ev["debut"], ms=ms, force=ev.get("force", 1.0)))
    return out


PISTE_EFFETS_MUSIQUE = lire_wav(DOSSIER / "pistes" / "effets.wav")


def mesurer_effet(e: dict, musique: np.ndarray, partition: dict, attaques: list[dict]) -> dict:
    img = image(e["temps"])
    d = debut_echantillon(img)
    x = gabarit(e["son"]) * 10 ** (e["gain_db"] / 20) * e["volume_effets"]
    fin = duree_utile(x)
    w = max(fin, int(0.1 * FE))
    pad = int(0.1 * FE)
    a = max(0, d - pad)
    # Contexte autour du bruitage (évite les effets de bord des filtres).
    ctx_m = musique[:, a : d + w + pad]
    ctx_e = np.zeros_like(ctx_m)
    n = min(x.shape[1], ctx_e.shape[1] - (d - a))
    ctx_e[:, d - a : d - a + n] = x[:, :n]
    zone = slice(d - a, d - a + fin)
    zone_w = slice(d - a, d - a + w)
    # Niveau relatif (pondéré K, ≥ 100 ms).
    ym, ye = mesures.ponderation_k(ctx_m), mesures.ponderation_k(ctx_e)
    em = np.sum(np.mean(ym[:, zone_w] ** 2, axis=-1))
    ee = np.sum(np.mean(ye[:, zone_w] ** 2, axis=-1))
    relatif = 10 * np.log10(ee / em)
    # Émergence par tiers d'octave, sur la durée utile, dans les bandes où le
    # bruitage a de l'énergie (à moins de 20 dB de sa bande la plus forte : un
    # reste infime de bruitage dans une bande où la musique se tait n'est pas
    # une émergence).
    mm, me = np.mean(ctx_m, axis=0), np.mean(ctx_e, axis=0)
    Em = np.array([np.mean(tiers_octave(mm, f0)[zone] ** 2) for f0 in CENTRES]) + 1e-16
    Ee = np.array([np.mean(tiers_octave(me, f0)[zone] ** 2) for f0 in CENTRES]) + 1e-16
    utiles = Ee >= Ee.max() / 100
    rap = np.where(utiles, 10 * np.log10(Ee / Em), -np.inf)
    j = int(np.argmax(rap))
    # Pour un whoosh : niveau des souffles de la musique (piste « effets » :
    # montées, souffles et cymbales inversées, descente) dans les bandes utiles
    # du whoosh, par rapport à lui. Au-dessus de -6 dB, les deux souffles se
    # recouvrent : le whoosh double une transition de la musique.
    souffle_musique = None
    if e["son"].startswith("whoosh"):
        ctx_s = PISTE_EFFETS_MUSIQUE[:, a : d + w + pad] * e["volume_musique"]
        ms_ = np.mean(ctx_s, axis=0)
        Es = np.array([np.mean(tiers_octave(ms_, f0)[zone] ** 2) if u else 0.0 for f0, u in zip(CENTRES, utiles)]) + 1e-16
        souffle_musique = 10 * np.log10(Es[utiles].sum() / Ee[utiles].sum())
    # Accents semblables et note la plus proche.
    t_ms = d / FE * 1000.0
    if e["son"].startswith("whoosh"):
        crete = d + int(np.argmax(np.convolve(np.mean(x, 0) ** 2, np.ones(480), "same")))
        crete_temps = crete / ET
        semblables = [f"{tr['type']} {tr.get('debut', tr['temps'])}→{tr['temps']}" for tr in partition["transitions"]
                      if tr["type"] in SOUFFLES_MUSIQUE and tr.get("debut", tr["temps"]) - 0.05 <= crete_temps <= tr["temps"] + 0.25]
        semblables += [f"{tr['type']} {tr['temps']}" for tr in partition["transitions"]
                       if tr["type"] in ("cymbale", "impact") and abs(tr["temps"] - crete_temps) * 500 <= 150]
        douces = []
    else:
        crete_temps = None
        voisines = [v for v in attaques if v["instrument"] in SEMBLABLES_COURTS and abs(v["ms"] - t_ms) <= 35]
        semblables = [f"{v['instrument']}@{v['debut']} (force {v['force']:.2f})" for v in voisines if v["force"] >= FORCE_ACCENT]
        douces = [f"{v['instrument']}@{v['debut']} (force {v['force']:.2f})" for v in voisines if v["force"] < FORCE_ACCENT]
    proche = min(attaques, key=lambda v: abs(v["ms"] - t_ms))
    frappes = [v for v in attaques if v["instrument"] in FRAPPES]
    proche_frappe = min(frappes, key=lambda v: abs(v["ms"] - t_ms)) if frappes else None
    ecart_frappe = proche_frappe["ms"] - t_ms if proche_frappe else None
    return dict(
        temps=e["temps"], son=e["son"], gain_db=r(e["gain_db"], 2), image=img, debut_ms=r(t_ms, 2),
        ecart_au_temps_ms=r(t_ms - e["temps"] * 500, 2),
        duree_utile_ms=r(fin / FE * 1000, 0),
        niveau_relatif_db=r(relatif), emergence_db=r(rap[j]), bande_hz=int(round(CENTRES[j])),
        crete_whoosh_temps=r(crete_temps, 2), souffles_musique_db=r(souffle_musique),
        double_une_transition=bool(souffle_musique is not None and souffle_musique > -6.0),
        accents_semblables=semblables, frappes_douces_au_meme_instant=douces,
        note_proche=f"{proche['instrument']}@{proche['debut']} ({proche['ms'] - t_ms:+.1f} ms)",
        frappe_proche=f"{proche_frappe['instrument']}@{proche_frappe['debut']} ({ecart_frappe:+.1f} ms)" if proche_frappe else None,
        conflit=bool(souffle_musique > -6.0) if souffle_musique is not None else bool(semblables),
        decale=bool(ecart_frappe is not None and 8.0 < abs(ecart_frappe) < 40.0 and not e["son"].startswith("whoosh")),
        dans_la_cible=bool(CIBLE_RELATIF[0] - 0.5 <= relatif <= CIBLE_RELATIF[1] + 0.5),
        audible=bool(rap[j] >= SEUIL_EMERGENCE),
    )


# ─── Modèle et rendu ─────────────────────────────────────────────────────────


def piste_effets(feuille: list[dict], n: int) -> np.ndarray:
    y = np.zeros((2, n))
    for e in feuille:
        d = debut_echantillon(image(e["temps"]))
        x = gabarit(e["son"]) * 10 ** (e["gain_db"] / 20) * e["volume_effets"]
        k = min(x.shape[1], n - d)
        y[:, d : d + k] += x[:, :k]
    return y


def controler_rendu(rendu: np.ndarray, musique_brute: np.ndarray, feuille: list[dict], vol: dict) -> dict:
    n = musique_brute.shape[1]
    extra = rendu.shape[1] - n
    rendu_n = rendu[:, :n]
    effets = piste_effets(feuille, n)
    # Gain réel de la musique : moindres carrés, hors des bruitages et du fondu de sécurité.
    masque = np.ones(n, bool)
    masque[np.any(effets != 0, axis=0)] = False
    masque[-int(0.2 * FE) :] = False
    y, m = rendu_n[:, masque].ravel(), musique_brute[:, masque].ravel()
    g_mus = float(np.dot(y, m) / np.dot(m, m))
    # Le volume de la musique suit une fonction (fondu de sécurité) : Remotion la
    # rend en paliers d'une image. On applique les mêmes paliers au modèle.
    paliers = np.ones(n)
    duree_img = int(round(n / FE * FPS))
    for f in range(duree_img - 4, duree_img):
        v = float(np.clip((f - (duree_img - 4)) / 3, 0, 1))
        a = int(round((f - 0.5) / FPS * FE))
        paliers[max(0, a) :] = 1 - v
    modele = musique_brute * g_mus * paliers + effets
    ecart = rendu_n - modele
    hors_fin = slice(0, n - int(0.2 * FE))
    # Chaque bruitage : décalage et gain retrouvés dans (rendu − modèle + ce bruitage).
    par_effet = []
    M = 64
    ecart_pad = np.pad(ecart, ((0, 0), (M, M)))
    for e in feuille:
        d = debut_echantillon(image(e["temps"]))
        x = gabarit(e["son"]) * 10 ** (e["gain_db"] / 20) * e["volume_effets"]
        L = min(x.shape[1], n - d)
        # rendu − modèle + ce bruitage : ce bruitage tel que Remotion l'a posé.
        base = ecart_pad[:, d : d + L + 2 * M].copy()
        base[:, M : M + L] += x[:, :L]
        meilleur = None
        for lag in range(-48, 49):
            cible = base[:, M + lag : M + lag + L]
            g = float(np.sum(cible * x[:, :L]) / np.sum(x[:, :L] ** 2))
            res = float(np.sum((cible - g * x[:, :L]) ** 2))
            if meilleur is None or res < meilleur[0]:
                meilleur = (res, lag, g)
        res, lag, g = meilleur
        par_effet.append(dict(temps=e["temps"], son=e["son"], decalage_echantillons=lag, gain_mesure_sur_attendu_db=r(20 * np.log10(abs(g) + 1e-12), 2),
                              residu_db=r(10 * np.log10(res / np.sum(x[:, :L] ** 2) + 1e-16), 1)))
    # Clics : toute impulsion du rendu doit être l'attaque d'un bruitage (le clic
    # a 2 ms de bruit blanc : c'est voulu) ou exister déjà dans la musique.
    debuts = [debut_echantillon(image(e["temps"])) for e in feuille]
    clics = []
    for c in range(2):
        for k in detecter_clics(rendu_n[c]):
            pres = min((abs(k["echantillon"] - d) for d in debuts), default=10**9)
            k["canal"] = ("gauche", "droite")[c]
            k["attaque_d_un_bruitage"] = bool(pres <= 0.004 * FE)
            clics.append(k)
    clics_musique = sum(len(detecter_clics(musique_brute[c])) for c in range(2))
    integree = mesures.sonie_integree(rendu)
    plans = []
    for nom, a, b in PLANS:
        s = slice(a * ET, b * ET)
        plans.append(dict(plan=nom, melange_lufs=r(mesures.sonie_integree(rendu_n[:, s])),
                          musique_seule_lufs=r(mesures.sonie_integree(musique_brute[:, s] * g_mus))))
    fin = rendu_n[:, -int(0.5 * FE) :]
    return dict(
        echantillons=int(rendu.shape[1]), echantillons_en_plus=int(extra),
        gain_musique=r(g_mus, 5), gain_musique_attendu=vol["VOLUME_MUSIQUE"],
        ecart_rendu_modele_max_dbfs=r(20 * np.log10(np.max(np.abs(ecart[:, hors_fin])) + 1e-16)),
        ecart_rendu_modele_fin_max_dbfs=r(20 * np.log10(np.max(np.abs(ecart[:, -int(0.2 * FE) :])) + 1e-16)),
        sonie_integree_lufs=r(integree, 2), crete_vraie_dbtp=r(mesures.crete_vraie_db(rendu), 2),
        crete_echantillon_dbfs=r(mesures.crete_echantillon_db(rendu), 2), plage_sonie_lu=r(mesures.plage_sonie(rendu)),
        musique_seule=dict(sonie_integree_lufs=r(mesures.sonie_integree(musique_brute * g_mus), 2),
                           crete_vraie_dbtp=r(mesures.crete_vraie_db(musique_brute * g_mus), 2)),
        clics_hors_attaques=[k for k in clics if not k["attaque_d_un_bruitage"]],
        nb_impulsions_attaques_de_bruitages=sum(k["attaque_d_un_bruitage"] for k in clics),
        clics_dans_la_musique_source=clics_musique,
        par_effet=par_effet, plans=plans,
        fin=dict(dernier_echantillon=[int(round(v * 32768)) for v in rendu[:, -1]],
                 niveau_derniere_demi_seconde_dbfs=r(20 * np.log10(np.sqrt(np.mean(fin**2)) + 1e-16))),
    )


# ─── Image ───────────────────────────────────────────────────────────────────


def image_mixage(musique: np.ndarray, effets: np.ndarray, mesures_effets: list[dict], partition: dict, titre: str, chemin: Path) -> None:
    inst = np.arange(0.05, 30.0, 0.01)
    lm = mesures.sonie_fenetre(musique, inst, 0.1)
    le = mesures.sonie_fenetre(effets, inst, 0.1)
    fig, (ax, bx) = plt.subplots(2, 1, figsize=(22, 10), constrained_layout=True, gridspec_kw=dict(height_ratios=[3, 2]))
    ax.plot(inst * 2, lm, color="#1d4ed8", lw=1, label="musique (sonie sur 100 ms)")
    ax.plot(inst * 2, np.where(le > -70, le, np.nan), color="#dc2626", lw=1.2, label="bruitages seuls (sonie sur 100 ms)")
    for c in partition["coupes"]:
        ax.axvline(c, color="#94a3b8", lw=0.8)
    for nom, a, b in PLANS:
        ax.text((a + b) / 2, -10.5, nom, ha="center", fontsize=9, color="#475569")
    ax.set_ylim(-60, -8)
    ax.set_xlim(-1, 60)
    ax.set_ylabel("LUFS (fenêtre de 100 ms)")
    ax.set_xticks(range(0, 61, 2))
    ax.grid(alpha=0.25)
    ax.legend(loc="lower right")
    ax.set_title(titre, loc="left")
    xs = [m["temps"] for m in mesures_effets]
    couleurs = ["#16a34a" if (m["dans_la_cible"] and m["audible"] and not m["conflit"] and not m["decale"]) else "#dc2626" for m in mesures_effets]
    bx.axhspan(*CIBLE_RELATIF, color="#bbf7d0", alpha=0.6, label="cible du niveau relatif (6 à 10 dB sous la musique)")
    rouge = Patch(color="#dc2626", label="rouge : hors cible, masqué, décalé, ou accent semblable de la musique au même instant")
    bx.bar(xs, [m["niveau_relatif_db"] for m in mesures_effets], width=0.25, color=couleurs, label="niveau relatif (pondéré K, ≥ 100 ms)")
    bx.scatter(xs, [m["emergence_db"] for m in mesures_effets], marker="^", color="#0f172a", zorder=3, label="émergence (meilleur tiers d'octave)")
    bx.axhline(SEUIL_EMERGENCE, color="#0f172a", lw=0.8, ls="--")
    for m in mesures_effets:
        bx.text(m["temps"], min(m["niveau_relatif_db"], 0) - 2.5, f"{m['son']}\n{m['temps']:g}", ha="center", va="top", fontsize=7, rotation=90)
    bx.axhline(0, color="#475569", lw=0.6)
    bx.set_xlim(-1, 60)
    bx.set_ylim(-40, 40)
    bx.set_xticks(range(0, 61, 2))
    bx.set_xlabel("temps (1 temps = 0,5 s)")
    bx.set_ylabel("dB")
    bx.grid(alpha=0.25)
    poignees, etiquettes = bx.get_legend_handles_labels()
    bx.legend(poignees + [rouge], etiquettes + [rouge.get_label()], loc="upper right", fontsize=8)
    fig.savefig(chemin, dpi=80)
    plt.close(fig)


# ─── Programme ───────────────────────────────────────────────────────────────


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--rendu", default=str(DOSSIER / "mix-complete.wav"))
    p.add_argument("--feuille", choices=("avec", "sans"), default="avec")
    p.add_argument("--sortie", default=None)
    args = p.parse_args()

    vol = lire_volumes()
    partition = json.loads((DOSSIER / "partition.json").read_text(encoding="utf-8"))
    attaques = evenements_musique(partition)
    brute = lire_wav(VIDEO / "public" / "musique.wav")
    if args.feuille == "avec":
        feuille = lire_feuille("EFFETS_AVEC_MUSIQUE")
    else:
        feuille = [e for e in lire_feuille("EFFETS_SANS_MUSIQUE") if not (e["son"].startswith("note-") or e["son"] == "impact-doux")]
    for e in feuille:
        e["volume_effets"] = vol["VOLUME_EFFETS"]
        e["volume_musique"] = vol["VOLUME_MUSIQUE"]
    musique = brute * vol["VOLUME_MUSIQUE"]
    res = dict(feuille=args.feuille, volumes=vol, cibles=dict(niveau_relatif_db=CIBLE_RELATIF, emergence_min_db=SEUIL_EMERGENCE),
               effets=[mesurer_effet(e, musique, partition, attaques) for e in feuille])
    effets = piste_effets(feuille, brute.shape[1])
    modele = musique + effets
    res["modele"] = dict(sonie_integree_lufs=r(mesures.sonie_integree(modele), 2), crete_vraie_dbtp=r(mesures.crete_vraie_db(modele), 2),
                         musique_seule_lufs=r(mesures.sonie_integree(musique), 2), musique_seule_crete_vraie_dbtp=r(mesures.crete_vraie_db(musique), 2))
    rendu = Path(args.rendu)
    if args.feuille == "avec" and rendu.exists():
        res["rendu"] = dict(fichier=str(rendu.relative_to(VIDEO)) if rendu.is_relative_to(VIDEO) else str(rendu),
                            **controler_rendu(lire_wav(rendu), brute, feuille, vol))
    sortie = Path(args.sortie) if args.sortie else DOSSIER / ("mixage.json" if args.feuille == "avec" else "mixage-feuille-origine.json")
    sortie.write_text(json.dumps(res, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    titre = ("Bruitages retenus avec la musique" if args.feuille == "avec" else "Feuille d'origine (sans notes ni impact) posée sur la musique") + \
        f" — VOLUME_MUSIQUE {vol['VOLUME_MUSIQUE']}, VOLUME_EFFETS {vol['VOLUME_EFFETS']}"
    image_mixage(musique, effets, res["effets"], partition, titre, sortie.with_suffix(".png"))

    # Résumé lisible.
    print(f"{'temps':>6} {'son':<13} {'gain':>5} {'relatif':>8} {'émerg.':>7} {'bande':>6}  accents semblables / frappe proche")
    for m in res["effets"]:
        drapeaux = ("" if m["dans_la_cible"] else " [hors cible]") + ("" if m["audible"] else " [masqué]") + (" [décalé]" if m["decale"] else "")
        souffle = "" if m["souffles_musique_db"] is None else f" souffles musique {m['souffles_musique_db']:+.1f} dB"
        souffle += "".join(f" (frappe douce : {v})" for v in m["frappes_douces_au_meme_instant"])
        drapeaux += " [doublé]" if m["double_une_transition"] else ""
        drapeaux += " [accent semblable]" if (m["conflit"] and not m["son"].startswith("whoosh")) else ""
        print(f"{m['temps']:>6g} {m['son']:<13} {m['gain_db']:>5g} {m['niveau_relatif_db']:>8} {m['emergence_db']:>7} {m['bande_hz']:>6}  "
              f"{', '.join(m['accents_semblables']) or '—'} / {m['frappe_proche']}{souffle}{drapeaux}")
    print("modèle :", res["modele"])
    if "rendu" in res:
        rr = {k: v for k, v in res["rendu"].items() if k not in ("par_effet", "plans")}
        print("rendu :", json.dumps(rr, ensure_ascii=False))
        print("calage (décalage en échantillons, écart de gain en dB) :",
              ", ".join(f"{e['temps']:g}:{e['decalage_echantillons']}/{e['gain_mesure_sur_attendu_db']:+.2f}" for e in res["rendu"]["par_effet"]))
        print("plans :", ", ".join(f"{p['plan']} {p['melange_lufs']} ({p['musique_seule_lufs']})" for p in res["rendu"]["plans"]))
    print(f"→ {sortie.relative_to(VIDEO)} et {sortie.with_suffix('.png').relative_to(VIDEO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
