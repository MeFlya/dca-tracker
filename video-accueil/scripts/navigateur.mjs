// Le Chromium « headless shell » installé par Playwright (npm run captures),
// s'il existe : évite à Remotion d'en télécharger un second. Même logique que
// remotion.config.ts (qui ne vaut que pour la CLI).
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export function navigateurLocal() {
  const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(cache)) return null;
  const dossier = readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell-")).sort().pop();
  const binaire = dossier && path.join(cache, dossier, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
  return binaire && existsSync(binaire) ? binaire : null;
}
