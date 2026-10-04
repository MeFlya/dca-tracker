// Réglages de Remotion (CLI : studio, render, still).
// Les paramètres de chaque rendu (codec, qualité) sont dans scripts/rendre.mjs.
import { Config } from "@remotion/cli/config";
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

Config.setOverwriteOutput(true);
// Images intermédiaires en PNG : aucune perte avant l'encodage final.
Config.setVideoImageFormat("png");

// Navigateur : le Chromium « headless shell » déjà installé par Playwright pour
// les captures (npm run captures), s'il est là. Sinon Remotion télécharge le
// sien au premier rendu (Chrome for Testing, depuis les serveurs de Google).
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
if (existsSync(cache)) {
  const dossier = readdirSync(cache)
    .filter((d) => d.startsWith("chromium_headless_shell-"))
    .sort()
    .pop();
  const binaire = dossier && path.join(cache, dossier, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
  if (binaire && existsSync(binaire)) Config.setBrowserExecutable(binaire);
}
