// Normalisation du français pour la recherche — appliquée à l'index ET à la
// requête, sinon elles ne se rencontrent pas.
//
// Ce que le lecteur tape n'est jamais ce que la page écrit : « frais » contre
// « Frais », « eligible » contre « éligible », « sp500 » contre « S&P 500 »,
// « 150000 » contre « 150 000 € ». Chaque règle ci-dessous répond à un de ces
// écarts ; aucune ne cherche à être un analyseur linguistique complet.
//
// Les mêmes règles servent aussi au surlignage (normaliserAligne) : si les
// deux divergeaient, « S&P 500 » serait trouvé mais jamais surligné, et
// l'extrait ne serait pas centré sur lui (constat mesuré le 28/09/2026 :
// 0 extrait surligné sur 24 pour « S&P 500 »).

/** Accents retirés, minuscules, ligatures dépliées. */
export function replier(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae");
}

/**
 * Une règle de réécriture, appliquée après replier(). `par` reçoit la
 * correspondance (m[0], puis les groupes) et renvoie le texte de remplacement.
 * Une règle `requete` ne s'applique qu'à ce que le lecteur tape.
 */
type Regle = { motif: RegExp; par: (m: string[]) => string; requete?: true };

// Pas de lookbehind (?<!…) : il fait échouer l'analyse du module entier sur
// Safari < 16.4, et la recherche avec lui.
const REGLES: Regle[] = [
  // Espaces insécables (simple et fine) : « 150 000 € » les emploie.
  { motif: /[\u00a0\u202f]/g, par: () => " " },
  // « S&P », « s & p » → « sp ». Mot entier : « fonds & pea » restait
  // collé en « fondspea ».
  { motif: /\bs\s*&\s*p(?![a-z])/g, par: () => "sp" },
  // « sp 500 », « Nasdaq-100 », « Russell 2000 » → un seul terme.
  // `\s*(?:-\s*)?` et non `\s*-?\s*` : la seconde forme, ambiguë sur une
  // suite d'espaces, prenait 2,5 s sur « sp » + 50 000 espaces (constat 46).
  {
    motif: /\b(sp|nasdaq|stoxx|russell|nikkei|cac|ftse|dax)\s*(?:-\s*)?(\d{2,4})\b/g,
    par: (m) => m[1] + m[2],
  },
  // « 500e par mois » → « 500 euros par mois ». Requête seulement : l'index
  // contient des ordinaux (« la 20e année », « 90e percentile ») qui
  // deviendraient des montants. Avant la règle des milliers, sinon
  // « 1 500e » n'est pas fusionné (pas de fin de mot entre 0 et e).
  { motif: /(\d{2,})e\b/g, par: (m) => `${m[1]} euros`, requete: true },
  // « 200eur », « 100euros » → « 200 euros ». Des deux côtés : le site ne
  // l'écrit jamais ainsi, mais le lecteur si (« 200eur » : 0 résultat).
  { motif: /(\d)(?:eur|euros)\b/g, par: (m) => `${m[1]} euros` },
  // Séparateur des milliers : « 150 000 » → « 150000 ». Le nombre doit
  // commencer par 1 à 3 chiffres qui ne suivent ni un chiffre, ni « : », ni
  // « , » : « krach de 2008 112 000 € » donnait 2008112000, « case 2074
  // 372 € » donnait 2074372. Deux cellules de tableau voisines (« 1 500 500 »)
  // restent indiscernables ici : c'est l'index qui doit les séparer.
  {
    motif: /(^|[^\d:,])(\d{1,3}(?:[ .]\d{3})+)\b/g,
    par: (m) => m[1] + m[2].replace(/[ .]/g, ""),
  },
  { motif: /€/g, par: () => " euros " },
  { motif: /\beur\b/g, par: () => "euros" },
];

/**
 * Texte → forme comparable.
 * · « S&P 500 », « s&p500 », « sp 500 » → « sp500 » ; idem Nasdaq-100,
 *   STOXX 600, Russell 2000, Nikkei 400, CAC 40, MSCI…
 * · « 150 000 € » → « 150000 euros » : on cherche un plafond sans espaces.
 * `requete` ajoute les règles propres à ce que le lecteur tape (« 500e »).
 */
export function normaliser(s: string, requete = false): string {
  let n = replier(s);
  for (const r of REGLES) {
    if (r.requete && !requete) continue;
    n = n.replace(r.motif, (...m: string[]) => r.par(m));
  }
  return n;
}

/**
 * normaliser() qui garde, pour chaque caractère du résultat, l'indice du
 * caractère d'origine dont il provient : le surlignage trouve « sp500 » dans
 * le texte normalisé et surligne « S&P 500 » dans le texte affiché.
 * Toujours les règles de l'index (jamais celles de la requête).
 */
export function normaliserAligne(s: string): { norm: string; orig: number[] } {
  let norm = "";
  let orig: number[] = [];
  for (let i = 0; i < s.length; ) {
    const code = s.charCodeAt(i);
    let c: string;
    let r: string;
    if (code < 128) {
      c = s[i];
      r = code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : c;
    } else {
      c = String.fromCodePoint(s.codePointAt(i)!);
      r = repliCaractere(c);
    }
    for (let k = 0; k < r.length; k++) orig.push(i);
    norm += r;
    i += c.length;
  }
  for (const regle of REGLES) {
    if (!regle.requete) ({ norm, orig } = remplacerAligne(norm, orig, regle));
  }
  return { norm, orig };
}

const REPLIS = new Map<string, string>();
function repliCaractere(c: string): string {
  let r = REPLIS.get(c);
  if (r === undefined) {
    r = replier(c);
    REPLIS.set(c, r);
  }
  return r;
}

/**
 * Applique une règle en suivant les indices. Chaque caractère du
 * remplacement est rattaché au caractère identique suivant de la
 * correspondance (« 150 000 » → « 150000 » : chaque chiffre garde le sien) ;
 * un caractère ajouté (« € » → « euros ») est rattaché au caractère courant.
 */
function remplacerAligne(
  norm: string,
  orig: number[],
  regle: Regle,
): { norm: string; orig: number[] } {
  let sortie = "";
  const o: number[] = [];
  let curseur = 0;
  for (const m of norm.matchAll(regle.motif)) {
    const debut = m.index ?? 0;
    const source = m[0];
    const remplacement = regle.par(m);
    sortie += norm.slice(curseur, debut);
    for (let k = curseur; k < debut; k++) o.push(orig[k]);
    let j = 0;
    for (let k = 0; k < remplacement.length; k++) {
      const trouve = source.indexOf(remplacement[k], j);
      if (trouve >= 0) {
        o.push(orig[debut + trouve]);
        j = trouve + 1;
      } else {
        o.push(orig[debut + Math.min(j, source.length - 1)]);
      }
    }
    sortie += remplacement;
    curseur = debut + source.length;
  }
  if (curseur === 0) return { norm, orig };
  sortie += norm.slice(curseur);
  for (let k = curseur; k < norm.length; k++) o.push(orig[k]);
  return { norm: sortie, orig: o };
}

// Mots vides : ils matcheraient partout et, combinés en ET, feraient échouer
// « quel etf pour debuter » sur toutes les pages qui n'écrivent pas « quel ».
const VIDES = new Set(
  (
    "a au aux avec ce ces cet cette comment d dans de des du elle en est et etre " +
    "faut il ils je l la le les leur leurs ma me mes mon ne nous on ou par pas " +
    "peut pour quel quelle quelles quels qu que qui sa se ses son sont sur ta te " +
    "tes ton tu un une vos votre vous y j m n s t c"
  ).split(" "),
);

/** Découpe en termes (règles de l'index). */
export function decouper(s: string): string[] {
  return normaliser(s).split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Terme → forme indexée, ou null pour l'ignorer.
 * Pluriel léger : « frais » et « frai », « ETFs » et « ETF », « plafonds » et
 * « plafond » deviennent le même terme. Appliqué des deux côtés, l'erreur
 * éventuelle (« cours » → « cour ») est sans effet sur la correspondance
 * exacte ; pour la complétion, le moteur part de la forme tapée (voir
 * analyserRequete).
 */
export function traiterTerme(t: string): string | null {
  if (VIDES.has(t)) return null;
  if (t.length > 3 && /[a-z][sx]$/.test(t)) return t.slice(0, -1);
  return t;
}

/** Un terme de requête : la forme indexée et la forme tapée (normalisée). */
export type TermeRequete = { terme: string; brut: string };

/**
 * Termes utiles d'une requête, dans l'ordre, sans doublon. `brut` garde la
 * forme tapée avant le retrait du pluriel : la complétion du dernier mot en
 * part (« cours » se complète en « course », pas en « courtier » comme
 * « cour » le faisait — constat 2).
 */
export function analyserRequete(q: string): TermeRequete[] {
  const vus = new Set<string>();
  const out: TermeRequete[] = [];
  for (const brut of normaliser(q, true).split(/[^a-z0-9]+/)) {
    if (!brut) continue;
    const terme = traiterTerme(brut);
    if (!terme || vus.has(terme)) continue;
    vus.add(terme);
    out.push({ terme, brut });
  }
  return out;
}

/** Termes utiles d'une requête, dans l'ordre. */
export function termesRequete(q: string): string[] {
  return analyserRequete(q).map((t) => t.terme);
}
