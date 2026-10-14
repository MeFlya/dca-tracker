// Garde-fou des fiches ETF v2 (14/10/2026) — appelé à l'import du registre
// (src/data/etf/index.ts), donc à chaque `next build` : une erreur ici casse
// le build, comme le contrôle PUBLIEE_LE de la page des fiches.
//
// Règle du plan (§3.4) : « la construction du site échoue si un chiffre
// publié n'a ni source ni date ». Le contrôle ne fait pas confiance aux types :
// il parcourt la fiche entière et vérifie TOUT objet qui porte une `valeur`.
//
// N'importe que des types (effacés à l'exécution) : se teste avec `node`
// seul, sans dépendance (voir le test dans le compte rendu du 14/10/2026).

import type { DocumentSource, Fait, FicheEtfV2 } from "./types";

export interface ContexteValidation {
  /** Mnémoniques de ETF_LIST : une fiche v2 sans URL /etf/<mnémo> est refusée. */
  catalogue: readonly string[];
  /** Date du build, AAAA-MM-JJ : aucune date ne peut être dans le futur. */
  aujourdhui: string;
  /** Les textes publiés, pour contrôler leur longueur. */
  titre: (f: FicheEtfV2) => string;
  description: (f: FicheEtfV2) => string;
  /**
   * Le calcul « 100 € par mois » publié (textes.ts, dcaAnnuel) et le nombre de
   * mois écoulés depuis le 1er janvier d'une année jusqu'à une date : aucun
   * total versé ne peut dépasser 100 € par mois réellement écoulé.
   */
  dca?: (f: FicheEtfV2) => { depuis: number; totalVerse: number } | null;
  moisDepuis?: (depuis: number, au: string) => number;
  versementMensuel?: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const estDate = (d: unknown): d is string =>
  typeof d === "string" && DATE.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));

/** Faits à gravité haute : il leur faut un recoupement qui concorde (plan §1.7, règle 2). */
const GRAVITE_HAUTE = ["isin", "indice", "replication", "ter", "pea.statut", "pea.preuve"] as const;

function chemin(f: FicheEtfV2, c: string): unknown {
  return c.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], f);
}

function estFait(o: unknown): o is Fait<unknown> {
  return typeof o === "object" && o !== null && !Array.isArray(o) && "valeur" in o;
}

/** Tous les faits d'une fiche, avec leur chemin, à toute profondeur. */
function faits(o: unknown, ou = ""): { ou: string; fait: Fait<unknown> }[] {
  if (Array.isArray(o)) return o.flatMap((x, i) => faits(x, `${ou}[${i}]`));
  if (typeof o !== "object" || o === null) return [];
  if (estFait(o)) return [{ ou, fait: o }];
  return Object.entries(o).flatMap(([k, v]) => faits(v, ou ? `${ou}.${k}` : k));
}

/** Liste des erreurs d'une fiche (vide si elle est publiable). */
export function erreursFiche(f: FicheEtfV2, ctx: ContexteValidation, toutes: FicheEtfV2[] = []): string[] {
  const e: string[] = [];
  const docs = new Map<string, DocumentSource>();

  for (const d of f.documents) {
    if (docs.has(d.id)) e.push(`document ${d.id} déclaré deux fois`);
    docs.set(d.id, d);
    if (!d.url.startsWith("https://")) e.push(`document ${d.id} : adresse non https (${d.url})`);
    if (!estDate(d.dateDocument) || !estDate(d.releveLe)) e.push(`document ${d.id} : date mal formée`);
    else {
      if (d.dateDocument > d.releveLe) e.push(`document ${d.id} : daté après sa lecture`);
      if (d.releveLe > ctx.aujourdhui) e.push(`document ${d.id} : lu dans le futur (${d.releveLe})`);
    }
  }

  for (const { ou, fait } of faits(f)) {
    const ici = `${f.mnemo}.${ou}`;
    if (fait.valeur === null || fait.valeur === undefined || fait.valeur === "") e.push(`${ici} : valeur vide`);
    if (!fait.source) e.push(`${ici} : fait sans source`);
    else if (!docs.has(fait.source)) e.push(`${ici} : source « ${fait.source} » absente des documents de la fiche`);
    if (!estDate(fait.dateValeur)) e.push(`${ici} : fait sans date de valeur (ou date mal formée)`);
    if (!estDate(fait.releveLe)) e.push(`${ici} : fait sans date de relevé (ou date mal formée)`);
    if (estDate(fait.dateValeur) && estDate(fait.releveLe)) {
      if (fait.dateValeur > fait.releveLe) e.push(`${ici} : valeur datée après son relevé`);
      if (fait.releveLe > ctx.aujourdhui) e.push(`${ici} : relevé dans le futur (${fait.releveLe})`);
    }
    if (!Array.isArray(fait.recoupements)) e.push(`${ici} : recoupements absents`);
    // Un document que le lecteur ne peut pas ouvrir (données de l'émetteur hors
    // page) : il lui faut un recoupement concordant, qu'il peut ouvrir.
    if (docs.get(fait.source)?.consultable === false && !fait.recoupements?.some((r) => r.concorde)) {
      e.push(`${ici} : source non consultable (${fait.source}) sans recoupement concordant que le lecteur peut ouvrir`);
    }
    for (const r of fait.recoupements ?? []) {
      if (!r.url || !r.libelle || !estDate(r.releveLe)) e.push(`${ici} : recoupement « ${r.libelle} » incomplet`);
    }
  }

  for (const c of GRAVITE_HAUTE) {
    const fait = chemin(f, c) as Fait<unknown> | undefined;
    if (!fait?.recoupements?.some((r) => r.concorde)) {
      e.push(`${f.mnemo}.${c} : fait à gravité haute sans recoupement concordant (règle des deux sources)`);
    }
  }
  if (!f.pea.preuve.citation) e.push(`${f.mnemo}.pea.preuve : la ligne qui tranche doit être citée mot pour mot`);

  if (!(f.ter.valeur > 0)) e.push(`${f.mnemo}.ter : frais nuls ou négatifs`);
  if (f.ter.source && docs.get(f.ter.source)?.type !== "dic") e.push(`${f.mnemo}.ter : la source des frais doit être le DIC`);

  // Encours : portée obligatoire ; identique au centime à celui d'un autre fonds
  // du registre = anomalie (cas réel de l'API Amundi, plan §3.4). Les parts
  // d'un même fonds partagent un encours de fonds : elles se déclarent dans
  // autresParts et ne sont pas comparées entre elles.
  if (f.encours.fonds.portee !== "fonds") e.push(`${f.mnemo}.encours.fonds : portée « fonds » obligatoire`);
  if (f.encours.part && f.encours.part.portee !== "part") e.push(`${f.mnemo}.encours.part : portée « part » obligatoire`);
  const soeurs = new Set(f.autresParts.map((p) => p.valeur.mnemo));
  for (const autre of toutes) {
    if (autre.mnemo === f.mnemo || soeurs.has(autre.mnemo)) continue;
    if (autre.encours.fonds.valeur === f.encours.fonds.valeur) {
      e.push(`${f.mnemo}.encours.fonds : identique à celui de ${autre.mnemo} (${f.encours.fonds.valeur} M EUR) — anomalie à vérifier`);
    }
  }

  // Un bloc = une source et une date.
  const ch = f.chiffres;
  if (!estDate(ch.au)) e.push(`${f.mnemo}.chiffres.au : date mal formée`);
  if (!docs.has(ch.source)) e.push(`${f.mnemo}.chiffres.source : absente des documents`);
  for (const [k, v] of Object.entries(ch)) {
    if (!estFait(v)) continue;
    if (v.dateValeur !== ch.au) e.push(`${f.mnemo}.chiffres.${k} : daté du ${v.dateValeur}, le bloc l'est du ${ch.au}`);
    if (v.source !== ch.source) e.push(`${f.mnemo}.chiffres.${k} : autre source que le bloc (${v.source})`);
  }
  if (f.encours.fonds.dateValeur !== ch.au && f.encours.fonds.source === ch.source) {
    e.push(`${f.mnemo}.encours.fonds : même document que le bloc des chiffres, autre date`);
  }
  if ((ch.paysIndice?.valeur.length ?? 0) > 3 || (ch.secteursIndice?.valeur.length ?? 0) > 3) {
    e.push(`${f.mnemo}.chiffres : plus de 3 pays ou secteurs (licence MSCI : agrégats seulement)`);
  }

  // Années civiles : jamais une année incomplète (lancement en cours d'année).
  const debut = (f.dates.premiereVl ?? f.dates.creationPart).valeur;
  const premiereAnneeComplete = Number(debut.slice(0, 4)) + (debut.endsWith("-01-01") ? 0 : 1);
  for (const p of ch.perfCalendaires.valeur) {
    if (p.annee < premiereAnneeComplete) e.push(`${f.mnemo} : année ${p.annee} incomplète (historique depuis le ${debut})`);
    if (p.annee >= Number(ch.au.slice(0, 4))) e.push(`${f.mnemo} : année ${p.annee} pas encore close au ${ch.au}`);
  }
  if (ch.ecartImprime) {
    for (const p of [...ch.perfCalendaires.valeur, ...ch.perfCumulees.valeur]) {
      if (p.ecart === undefined) e.push(`${f.mnemo} : écart imprimé par l'émetteur mais absent (${JSON.stringify(p)})`);
    }
  }

  if (!ctx.catalogue.includes(f.mnemo)) e.push(`${f.mnemo} : absent de ETF_LIST, la fiche n'aurait pas d'adresse`);
  if (/\d/.test(f.nomCourt)) {
    // « Nasdaq-100 » est un nom d'indice, pas un chiffre publié.
    if (!/Nasdaq-100/.test(f.nomCourt)) e.push(`${f.mnemo}.nomCourt : pas de chiffre dans le nom court`);
  }
  for (const p of [...f.pointsAConnaitre, ...f.notesPerformances]) {
    if (/\d+(,\d+)?\s*%/.test(p)) e.push(`${f.mnemo} : pourcentage écrit à la main dans « ${p.slice(0, 50)}… »`);
  }
  for (const c of f.changements) {
    if (!docs.has(c.source)) e.push(`${f.mnemo} : changement du ${c.date} sans source déclarée`);
    if (!estDate(c.date) || c.date > ctx.aujourdhui) e.push(`${f.mnemo} : changement mal daté (${c.date})`);
  }

  if (ctx.dca && ctx.moisDepuis && ctx.versementMensuel) {
    const d = ctx.dca(f);
    if (d) {
      const plafond = ctx.moisDepuis(d.depuis, ch.au) * ctx.versementMensuel;
      if (d.totalVerse > plafond) {
        e.push(`${f.mnemo} : « 100 € par mois » compte ${d.totalVerse} € versés pour ${plafond} € de mois écoulés au ${ch.au}`);
      }
    }
  }

  const titre = ctx.titre(f);
  if (titre.length > 60) e.push(`${f.mnemo} : title de ${titre.length} caractères (> 60) : « ${titre} »`);
  const desc = ctx.description(f);
  if (desc.length > 155) e.push(`${f.mnemo} : meta description de ${desc.length} caractères (> 155)`);

  if (!estDate(f.relueLe) || f.relueLe > ctx.aujourdhui) e.push(`${f.mnemo}.relueLe : date absente ou future`);
  return e;
}

/** Lève une erreur (donc casse le build) si une fiche du registre n'est pas publiable. */
export function validerFiches(fiches: FicheEtfV2[], ctx: ContexteValidation): void {
  const erreurs = fiches.flatMap((f) => erreursFiche(f, ctx, fiches));
  if (erreurs.length > 0) {
    throw new Error(
      `Fiches ETF v2 : ${erreurs.length} erreur(s), build arrêté plutôt que publier un chiffre sans source ni date.\n  · ` +
        erreurs.join("\n  · "),
    );
  }
}
