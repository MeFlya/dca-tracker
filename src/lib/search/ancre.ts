// Ancre d'un titre calculée depuis son texte : « Quel est le plafond du PEA ? »
// → « quel-est-le-plafond-du-pea ».
//
// ⚠️ Même calcul que ancre() dans scripts/build-search-index.mjs, qui écrit ces
// ancres dans l'index de recherche. Si l'une change sans l'autre, les liens de
// la recherche ouvrent la bonne page mais plus le bon passage.
export function ancre(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** Texte d'un titre tel que l'index le lit : sans la flèche des FAQ. */
export function texteTitre(el: Element): string {
  return (el.textContent ?? "").replace(/[▾▸▴►▼▲›»]/g, " ").replace(/\s+/g, " ").trim();
}
