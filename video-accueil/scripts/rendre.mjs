// Rendu des deux vidéos et de leurs fichiers d'accompagnement.
//
// Lancer : npm run rendu                 (tout)
//          npm run rendu -- boucle       (la boucle seule)
//          npm run rendu -- cockpit      (la boucle de la page du Cockpit :
//                                         out/boucle-cockpit.webm, .mp4 et
//                                         out/boucle-cockpit-affiche.jpg)
//          npm run rendu -- complete     (la version complète 16:9 seule)
//          npm run rendu -- carre        (la version carrée avec le son,
//                                         et sa variante musique seule)
//          npm run rendu -- son          (le son seul de la version complète,
//                                         avec et sans bruitages, puis mesures)
//
// Option : --sans-bruitages (avec « complete ») rend la musique seule, sans
// aucun bruitage d'interface, dans out/complete-sans-bruitages.mp4, pour
// comparer avec out/complete.mp4. La prop `bruitages` des compositions
// (src/son/BandeSon.tsx) vaut true par défaut.
//
// Étapes :
//   1. Remotion rend un MASTER sans perte visible (ProRes 422 HQ) dans
//      out/.maitre/ : une seule passe de rendu, coûteuse, par composition.
//   2. L'ffmpeg livré avec Remotion (npx remotion ffmpeg) encode les fichiers
//      pour le web à partir du master :
//        out/boucle.mp4     H.264, sans piste audio, moov en tête (faststart)
//        out/boucle.webm    VP9 en deux passes, sans piste audio
//        out/complete.mp4   H.264 + AAC 160 kb/s, faststart
//        out/complete-carre.mp4               même chaîne, en 1080×1080
//        out/complete-carre-musique-seule.mp4 la même image (flux H.264
//          copié tel quel), avec le son rendu sans bruitages (prop
//          bruitages: false) : pour comparer à l'oreille
//   3. Images fixes : out/poster.jpg (image 0 de la boucle : état final du
//      simulateur ; affichée avant la lecture, et seule à l'écran quand le
//      visiteur demande moins d'animations) et out/complete-poster.jpg
//      (affiche de la version complète, image 75) ; out/complete-carre-poster.jpg
//      (affiche de la version carrée, image 75 : la carte du nom ouverte).
//   4. Vérifications : tailles, faststart, absence de piste audio dans la
//      boucle, dernière image de la boucle identique à l'image 0 (PNG de
//      Remotion ; écart mesuré, en plus, sur les images décodées des fichiers
//      livrés).
//
// Couleurs : rendu en BT.709 (--color-space=bt709) et fichiers étiquetés
// BT.709, plage limitée. Sans étiquette, le navigateur devine la matrice et la
// vidéo ne prend pas exactement les couleurs de l'affiche (écart mesuré dans
// Chrome par la relecture technique du 02/10) : on verrait le passage de
// l'affiche à la vidéo.
//
// Qualité : réglable par variables d'environnement, par exemple
//   QP_BOUCLE_H264=28 CRF_BOUCLE_VP9=42 npm run rendu -- boucle

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { lirePng } from "./png.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const OUT = path.join(RACINE, "out");
const MAITRE = path.join(OUT, ".maitre");

// H.264 de la boucle en QP constant (et non en CRF) : voir le raccord, plus bas.
const QP_BOUCLE_H264 = process.env.QP_BOUCLE_H264 ?? "24";
const CRF_BOUCLE_VP9 = process.env.CRF_BOUCLE_VP9 ?? "32";
const CRF_COMPLETE = process.env.CRF_COMPLETE ?? "20";
const OBJECTIF_BOUCLE = 1.5 * 1024 * 1024; // 1,5 Mo
const OBJECTIF_POSTER = 150 * 1024; // 150 Ko
const OBJECTIF_AFFICHE_COCKPIT = 120 * 1024; // 120 Ko (STORYBOARD-COCKPIT.md §2)

const options = process.argv.slice(2).filter((a) => a.startsWith("--"));
const quoi = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "tout";
for (const o of options) if (o !== "--sans-bruitages") throw new Error(`Option inconnue : ${o}`);
const sansBruitages = options.includes("--sans-bruitages");
// La boucle est muette : --sans-bruitages ne la concerne pas, et ne la refait jamais.
const faireBoucle = (quoi === "tout" || quoi === "boucle") && !sansBruitages;
const faireCockpit = (quoi === "tout" || quoi === "cockpit") && !sansBruitages;
const faireComplete = quoi === "tout" || quoi === "complete";
const faireSon = quoi === "son";
// La version carrée produit toujours ses deux fichiers (avec et sans
// bruitages) : --sans-bruitages ne la concerne pas.
const faireCarre = (quoi === "tout" && !sansBruitages) || quoi === "carre";
if (!faireBoucle && !faireCockpit && !faireComplete && !faireSon && !faireCarre)
  throw new Error(`À rendre : tout, boucle, cockpit, complete, carre ou son (reçu : ${quoi})`);
/** Props des compositions sonores : musique seule si --sans-bruitages. */
const PROPS_SANS_BRUITAGES = `--props=${JSON.stringify({ bruitages: false })}`;

const commandes = [];
function lancer(args, { silencieux = false } = {}) {
  const ligne = ["npx", ...args].join(" ");
  commandes.push(ligne);
  console.log(`\n$ ${ligne}`);
  const r = spawnSync("npx", args, { cwd: RACINE, stdio: silencieux ? "pipe" : "inherit", encoding: "utf8" });
  if (r.status !== 0) {
    if (silencieux) console.error(r.stderr);
    throw new Error(`Échec : ${ligne}`);
  }
  return r;
}
const ffmpeg = (args) => lancer(["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", ...args]);
const BT709 = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];
const rel = (p) => path.relative(RACINE, p);
const ko = (o) => `${(o / 1024).toFixed(0)} Ko`;
const mo = (o) => `${(o / 1024 / 1024).toFixed(2)} Mo`;

/** Ordre des boîtes MP4 de premier niveau (moov avant mdat = faststart). */
async function boitesMp4(fichier) {
  const b = await readFile(fichier);
  const boites = [];
  let p = 0;
  while (p + 8 <= b.length) {
    let taille = b.readUInt32BE(p);
    const type = b.toString("latin1", p + 4, p + 8);
    if (taille === 1) taille = Number(b.readBigUInt64BE(p + 8));
    if (taille === 0) taille = b.length - p;
    boites.push(type);
    p += taille;
  }
  return boites;
}

/** « video/h264 (bt709, tv) », « audio/aac ». */
const decrire = (x) => `${x.codec_type}/${x.codec_name}${x.codec_type === "video" ? ` (${x.color_space ?? "?"}, ${x.color_range ?? "?"})` : ""}`;

function pistes(fichier) {
  const r = lancer(["remotion", "ffprobe", "-hide_banner", "-loglevel", "error", "-show_entries", "stream=codec_type,codec_name,width,height,pix_fmt,color_space,color_primaries,color_transfer,color_range,sample_rate,bit_rate:format=duration,bit_rate", "-of", "json", fichier], { silencieux: true });
  return JSON.parse(r.stdout);
}

await mkdir(MAITRE, { recursive: true });
const bilan = [];

/**
 * Une boucle muette (Boucle de l'accueil, BoucleCockpit de la page du
 * Cockpit) : master ProRes, MP4 H.264 en QP constant, WebM VP9 en deux passes,
 * affiche (image 0), et contrôle du raccord. Mêmes réglages pour les deux.
 */
async function rendreBoucle({ id, nom, affiche, objectifAffiche }) {
  const maitre = path.join(MAITRE, `${nom}.mov`);
  lancer(["remotion", "render", "src/index.ts", id, maitre, "--codec=prores", "--prores-profile=hq", "--image-format=png", "--color-space=bt709", "--muted"]);

  // Raccord (relecture de fidélité du 04/10) : avec -g 600, tout le fichier
  // était un seul groupe d'images ; décodée, la dernière image (prédite)
  // différait de l'image 0 (image clé) de 66/255 sur les bords des textes,
  // et le texte « se raffermissait » à chaque tour.
  // H.264 : la dernière image est forcée en image clé, et le codage passe en
  // QP constant 24. Deux images clés de même contenu, au même QP, sans
  // adaptation au contenu à venir (le CRF en a une, mbtree) : elles sortent
  // identiques au bit près (écart décodé 0). Même qualité que le CRF 23
  // (PSNR 38,7 / 39,0 / 37,4 dB contre 38,6 / 39,2 / 37,9 sur les images 0,
  // 135 et 235), 1,29 Mo au lieu de 1,07 Mo.
  // VP9 : inchangé. L'image clé forcée seule l'aggrave (écart moyen 2,03
  // contre 1,24, maximum 72 contre 25 : le filtrage des images clés regarde
  // les images suivantes) ; la qualité fixe sans alt-ref le règle, mais perd
  // 1,5 à 2 dB à taille égale. L'écart du WebM (25/255 sur une quarantaine de
  // pixels) est laissé tel quel. Mesures du 04/10, master de la boucle.
  const nbImages = Number(
    lancer(["remotion", "ffprobe", "-hide_banner", "-loglevel", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames", "-of", "csv=p=0", maitre], { silencieux: true }).stdout.trim()
  );
  if (!(nbImages > 1)) throw new Error(`Nombre d'images du master illisible (${nbImages})`);
  const derniere = nbImages - 1;

  // H.264 : profil High, yuv420p (lecture partout, iOS compris), moov en tête.
  const mp4 = path.join(OUT, `${nom}.mp4`);
  ffmpeg(["-i", maitre, "-an", "-c:v", "libx264", "-preset", "veryslow", "-tune", "animation", "-qp", QP_BOUCLE_H264,
    "-pix_fmt", "yuv420p", ...BT709, "-profile:v", "high", "-level", "4.0", "-g", "600",
    "-force_key_frames", `expr:eq(n,0)+eq(n,${derniere})`, "-movflags", "+faststart", mp4]);

  // VP9 en deux passes (qualité constante, -b:v 0).
  const webm = path.join(OUT, `${nom}.webm`);
  const journal = path.join(MAITRE, `vp9-${nom}`);
  ffmpeg(["-i", maitre, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", CRF_BOUCLE_VP9, "-pix_fmt", "yuv420p", ...BT709, "-row-mt", "1",
    "-deadline", "good", "-cpu-used", "1", "-g", "600", "-pass", "1", "-passlogfile", journal, "-f", "null", "-"]);
  ffmpeg(["-i", maitre, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", CRF_BOUCLE_VP9, "-pix_fmt", "yuv420p", ...BT709, "-row-mt", "1",
    "-deadline", "good", "-cpu-used", "1", "-g", "600", "-auto-alt-ref", "1", "-lag-in-frames", "25", "-pass", "2", "-passlogfile", journal, webm]);

  // Affiche : l'image 0 (titre, compteur arrivé, graphique ; identique à la
  // dernière). Elle sert aussi d'image fixe pour prefers-reduced-motion.
  const poster = path.join(OUT, affiche);
  lancer(["remotion", "still", "src/index.ts", id, poster, "--frame=0", "--image-format=jpeg", "--jpeg-quality=80"]);
  if (id === "Boucle") await rm(path.join(OUT, "image-fixe.jpg"), { force: true }); // ancienne image fixe : c'est désormais l'affiche

  // La boucle se referme-t-elle sans à-coup ? Première et dernière images, en PNG.
  const i0 = path.join(MAITRE, `${nom}-premiere.png`);
  const i539 = path.join(MAITRE, `${nom}-derniere.png`);
  lancer(["remotion", "still", "src/index.ts", id, i0, "--frame=0", "--image-format=png"]);
  lancer(["remotion", "still", "src/index.ts", id, i539, "--frame=-1", "--image-format=png"]);
  const h = async (f) => createHash("sha256").update(await readFile(f)).digest("hex");
  let raccord;
  if ((await h(i0)) === (await h(i539))) raccord = "première et dernière images identiques (même empreinte SHA-256)";
  else {
    const a = lirePng(i0), b = lirePng(i539);
    let ecarts = 0, max = 0;
    for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
      const p = a.get(x, y), q = b.get(x, y);
      const d = Math.max(...p.map((v, i) => Math.abs(v - q[i])));
      if (d > 0) ecarts++;
      max = Math.max(max, d);
    }
    raccord = `première et dernière images DIFFÉRENTES : ${ecarts} pixels, écart maximal ${max}/255`;
  }

  // Le raccord tel que le navigateur le joue : images 0 et dernière DÉCODÉES
  // des fichiers livrés (le contrôle ci-dessus ne regarde que les PNG de
  // Remotion). Attendu : 0 pour le MP4 ; environ 25/255 pour le WebM.
  async function raccordDecode(fichier) {
    // (L'ffmpeg de Remotion n'a pas le filtre select : trim pour la dernière.)
    const motif = path.join(MAITRE, `raccord-${nom}-${path.extname(fichier).slice(1)}-%d.png`);
    const [p0, pN] = [motif.replace("%d", "0"), motif.replace("%d", String(derniere))];
    ffmpeg(["-i", fichier, "-frames:v", "1", "-pix_fmt", "rgb24", p0]);
    ffmpeg(["-i", fichier, "-vf", `trim=start_frame=${derniere}`, "-frames:v", "1", "-pix_fmt", "rgb24", pN]);
    const a = lirePng(p0), b = lirePng(pN);
    let max = 0, somme = 0, au16 = 0;
    for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
      const p = a.get(x, y), q = b.get(x, y);
      const d = Math.max(...p.map((v, i) => Math.abs(v - q[i])));
      somme += d;
      if (d > 16) au16++;
      max = Math.max(max, d);
    }
    return `${rel(fichier)} décodé, images 0 et ${derniere} : écart maximal ${max}/255, moyen ${(somme / a.w / a.h).toFixed(2)}, ${au16} pixels au-delà de 16`;
  }
  const raccordMp4 = await raccordDecode(mp4), raccordWebm = await raccordDecode(webm);

  // L'affiche JPEG face à l'image 0 du MP4, décodés tous deux par ffmpeg :
  // écart moyen par canal. Mesure du 04/10 : 2,2 à 2,6 niveaux pour la
  // boucle d'accueil comme pour celle du Cockpit (biais d'environ −2 propre au
  // décodage de ffmpeg ; dans Chrome, la relecture du 02/10 mesurait 0,2 à
  // 0,3). Sert à repérer une affiche qui ne serait pas l'image 0.
  {
    const p0 = path.join(MAITRE, `raccord-${nom}-mp4-0.png`);
    const affichePng = path.join(MAITRE, `${nom}-affiche.png`);
    ffmpeg(["-i", poster, "-pix_fmt", "rgb24", affichePng]);
    const a = lirePng(p0), b = lirePng(affichePng);
    const somme = [0, 0, 0];
    for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
      const p = a.get(x, y), q = b.get(x, y);
      for (let i = 0; i < 3; i++) somme[i] += Math.abs(p[i] - q[i]);
    }
    const moyennes = somme.map((v) => (v / a.w / a.h).toFixed(2));
    bilan.push(`Affiche ${rel(poster)} face à l'image 0 décodée de ${rel(mp4)} : écart moyen par canal ${moyennes.join(" / ")} (attendu : environ 2,5 avec ffmpeg)`);
  }

  const sMp4 = (await stat(mp4)).size, sWebm = (await stat(webm)).size, sPoster = (await stat(poster)).size;
  const infoMp4 = pistes(mp4), infoWebm = pistes(webm);
  bilan.push(
    `${rel(mp4)} : ${mo(sMp4)} ${sMp4 <= OBJECTIF_BOUCLE ? "(objectif 1,5 Mo tenu)" : "(AU-DESSUS de 1,5 Mo)"} — QP ${QP_BOUCLE_H264}, pistes : ${infoMp4.streams.map(decrire).join(", ")}, boîtes : ${(await boitesMp4(mp4)).join(" > ")}`,
    `${rel(webm)} : ${mo(sWebm)} ${sWebm <= OBJECTIF_BOUCLE ? "(objectif 1,5 Mo tenu)" : "(AU-DESSUS de 1,5 Mo)"} — CRF ${CRF_BOUCLE_VP9}, pistes : ${infoWebm.streams.map(decrire).join(", ")}`,
    `${rel(poster)} : ${ko(sPoster)} ${sPoster <= objectifAffiche ? `(objectif ${ko(objectifAffiche)} tenu)` : `(AU-DESSUS de ${ko(objectifAffiche)})`}`,
    `Raccord de ${id} : ${raccord}`,
    `Raccord décodé : ${raccordMp4}`,
    `Raccord décodé : ${raccordWebm}`
  );
}

if (faireBoucle) await rendreBoucle({ id: "Boucle", nom: "boucle", affiche: "poster.jpg", objectifAffiche: OBJECTIF_POSTER });
// Boucle de la page du Cockpit (STORYBOARD-COCKPIT.md) : affiche visée sous 120 Ko.
if (faireCockpit) await rendreBoucle({ id: "BoucleCockpit", nom: "boucle-cockpit", affiche: "boucle-cockpit-affiche.jpg", objectifAffiche: OBJECTIF_AFFICHE_COCKPIT });

if (faireComplete) {
  const suffixe = sansBruitages ? "-sans-bruitages" : "";
  const maitre = path.join(MAITRE, `complete${suffixe}.mov`);
  lancer(["remotion", "render", "src/index.ts", "Complete", maitre, "--codec=prores", "--prores-profile=hq", "--image-format=png", "--color-space=bt709",
    ...(sansBruitages ? [PROPS_SANS_BRUITAGES] : [])]);
  const mp4 = path.join(OUT, `complete${suffixe}.mp4`);
  ffmpeg(["-i", maitre, "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", CRF_COMPLETE, "-pix_fmt", "yuv420p", ...BT709,
    "-profile:v", "high", "-level", "4.1", "-c:a", "libfdk_aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", mp4]);
  // Affiche de la fenêtre : la carte du nom ouverte (image t(5) à 120 BPM).
  // La variante sans bruitages a la même image : l'affiche n'est pas refaite.
  if (!sansBruitages) {
    const posterComplete = path.join(OUT, "complete-poster.jpg");
    lancer(["remotion", "still", "src/index.ts", "Complete", posterComplete, "--frame=75", "--image-format=jpeg", "--jpeg-quality=82"]);
    bilan.push(`${rel(posterComplete)} : ${ko((await stat(posterComplete)).size)}`);
  }
  const s = (await stat(mp4)).size;
  const info = pistes(mp4);
  bilan.push(
    `${rel(mp4)} : ${mo(s)} — CRF ${CRF_COMPLETE}, durée ${Number(info.format.duration).toFixed(2)} s, pistes : ${info.streams.map(decrire).join(", ")}, boîtes : ${(await boitesMp4(mp4)).join(" > ")}`
  );
}

if (faireCarre) {
  // Version carrée avec le son (décision de Maël du 03/10) : même chaîne que
  // la version complète. Master ProRes avec la piste audio en PCM, puis
  // H.264 CRF 20 + AAC-LC 160 kb/s 48 kHz, BT.709, moov en tête.
  const maitre = path.join(MAITRE, "complete-carre.mov");
  lancer(["remotion", "render", "src/index.ts", "CompleteCarree", maitre, "--codec=prores", "--prores-profile=hq", "--image-format=png", "--color-space=bt709"]);
  const mp4 = path.join(OUT, "complete-carre.mp4");
  ffmpeg(["-i", maitre, "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", CRF_COMPLETE, "-pix_fmt", "yuv420p", ...BT709,
    "-profile:v", "high", "-level", "4.1", "-c:a", "libfdk_aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", mp4]);
  const poster = path.join(OUT, "complete-carre-poster.jpg");
  lancer(["remotion", "still", "src/index.ts", "CompleteCarree", poster, "--frame=75", "--image-format=jpeg", "--jpeg-quality=82"]);

  // Musique seule : l'image ne dépend pas de la prop `bruitages`, on ne la
  // rend donc pas deux fois. Seul le son est rendu (WAV), puis posé sur le
  // flux H.264 de complete-carre.mp4, copié sans réencodage.
  const wavSeule = path.join(MAITRE, "complete-carre-musique-seule.wav");
  lancer(["remotion", "render", "src/index.ts", "CompleteCarree", wavSeule, "--codec=wav", PROPS_SANS_BRUITAGES]);
  const mp4Seule = path.join(OUT, "complete-carre-musique-seule.mp4");
  ffmpeg(["-i", mp4, "-i", wavSeule, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
    "-c:a", "libfdk_aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", mp4Seule]);

  for (const f of [mp4, mp4Seule]) {
    const info = pistes(f);
    bilan.push(
      `${rel(f)} : ${mo((await stat(f)).size)} — CRF ${CRF_COMPLETE}, durée ${Number(info.format.duration).toFixed(2)} s, pistes : ${info.streams.map((x) => `${decrire(x)}${x.width ? ` ${x.width}×${x.height}` : ""}`).join(", ")}, boîtes : ${(await boitesMp4(f)).join(" > ")}`
    );
  }
  bilan.push(`${rel(poster)} : ${ko((await stat(poster)).size)}`);
}

if (faireSon) {
  // Le son seul (WAV 48 kHz) : rapide (une vingtaine de secondes par rendu), et
  // c'est ce que musique/mixage.py contrôle. La version sans bruitages sert à
  // comparer à l'oreille.
  await mkdir(path.join(OUT, "musique"), { recursive: true });
  const avec = path.join(OUT, "musique", "mix-complete.wav");
  const sans = path.join(OUT, "musique", "mix-complete-sans-bruitages.wav");
  lancer(["remotion", "render", "src/index.ts", "Complete", avec, "--codec=wav"]);
  lancer(["remotion", "render", "src/index.ts", "Complete", sans, "--codec=wav", PROPS_SANS_BRUITAGES]);
  const ligne = `python3 musique/mixage.py --rendu ${rel(avec)}`;
  commandes.push(ligne);
  console.log(`\n$ ${ligne}`);
  const r = spawnSync("python3", ["musique/mixage.py", "--rendu", avec], { cwd: RACINE, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`Échec : ${ligne}`);
  bilan.push(`${rel(avec)} et ${rel(sans)} : mesures dans out/musique/mixage.json et mixage.png`);
}

console.log("\n─── Commandes lancées ───");
for (const c of commandes) console.log(c);
console.log("\n─── Bilan ───");
for (const l of bilan) console.log(l);
if (process.env.GARDER_MAITRES !== "1") {
  await rm(MAITRE, { recursive: true, force: true });
  console.log("(masters ProRes supprimés ; GARDER_MAITRES=1 pour les garder)");
}
