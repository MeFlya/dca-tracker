import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorClient } from "./CalculatorClient";
import { DEFAULTS_CALCULATEUR } from "./defaults";
import { JsonLd } from "@/components/ui/JsonLd";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { runSimulation } from "@/lib/simulator";
import {
  computeFiscalComparison,
  formatFiscalEur,
  PFU_RATE,
  SOCIAL_CHARGES_RATE,
  TAUX_VERIFIES_LE,
  tauxAffiche,
} from "@/lib/fiscal/pea-cto";
import { ecartFiscal, impotCTO, impotPEA } from "@/lib/impot-affiche";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";
import { ETF_LIST } from "@/lib/etf-config";

const TITLE = "Calculateur fiscal PEA vs CTO — Comparez l'impôt sur vos ETF";
const DESCRIPTION =
  "Combien d'impôt sur votre DCA ETF en PEA ou en CTO ? Calculateur instantané : règle des 5 ans, plafond 150 000 €, PFU 31,4 %, prélèvements sociaux. Gratuit, sans inscription.";
const CANONICAL = "/calculateur-fiscal-pea-cto";

// ─── Taux affichés : lus dans le moteur, jamais écrits (30/09/2026) ─────────
//
// Relevé du 29/09/2026 : les assistants IA citent sur cette question des
// pages qui donnent les taux dès le titre (« 31,4 % ou 18,6 % »). La nôtre
// donnait le premier taux au 225e mot. La réponse ouvre désormais la page, et
// chaque taux vient de fiscal/pea-cto.ts : la prochaine loi de finances la
// mettra à jour toute seule. L'année affichée est celle de la vérification
// (TAUX_VERIFIES_LE), pas l'année en cours : on ne date pas un taux qu'on n'a
// pas relu.
const PS = tauxAffiche(SOCIAL_CHARGES_RATE); // « 18,6 »
const PFU = tauxAffiche(PFU_RATE); // « 31,4 »
const IR = tauxAffiche(PFU_RATE - SOCIAL_CHARGES_RATE); // « 12,8 »
const ANNEE_TAUX = TAUX_VERIFIES_LE.slice(0, 4);
const DATE_TAUX = dateEnToutesLettres(TAUX_VERIFIES_LE);

/** Plus-values types du tableau d'écart. Des hypothèses, pas des résultats : l'impôt, lui, est calculé. */
const PLUS_VALUES_TYPES = [10_000, 25_000, 50_000, 100_000];

/** 10000 → « 10 000 », séparateur des montants du site. */
const milliers = (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

// Exemple concret : le calcul par défaut du calculateur, par le même moteur.
const EXEMPLE_SIM = runSimulation(DEFAULTS_CALCULATEUR).base;
const EXEMPLE = computeFiscalComparison({
  totalInvested: EXEMPLE_SIM.totalInvested,
  finalValue: EXEMPLE_SIM.finalValue,
  holdingYears: DEFAULTS_CALCULATEUR.durationYears,
});
const EXEMPLE_TER = DEFAULTS_CALCULATEUR.annualFeesPct.toLocaleString("fr-FR", { minimumFractionDigits: 2 });
/**
 * Le fonds dont les frais servent de valeur de départ, nommé seulement s'il
 * correspond (30/09/2026). La phrase écrivait « ceux de CW8 » en dur : le jour
 * où la valeur de départ ne serait plus le TER de CW8, elle deviendrait fausse
 * sans que rien ne casse. Même règle que l'introduction du simulateur.
 */
const FONDS_EXEMPLE = ETF_LIST.find(
  (e) => e.displaySymbol === "CW8" && e.ter === DEFAULTS_CALCULATEUR.annualFeesPct,
);
/** Écart en % de net, au format du calculateur (CalculatorClient) : une décimale, virgule. */
const EXEMPLE_ECART_PCT = EXEMPLE.peaAdvantagePct.toLocaleString("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
};

const FAQ = [
  {
    q: "PEA ou CTO : lequel paie le moins d'impôts ?",
    // 30/09/2026 : taux et écart lus dans le moteur (l'écart « environ 6 400 € »
    // était écrit à la main) ; « le compte à privilégier » décrivait un choix
    // à la place du lecteur — la phrase dit ce que coûte chaque enveloppe.
    a: `Sur un investissement en ETF détenu plus de 5 ans, le PEA coûte moins d'impôt\u00a0: ${PS}\u00a0% de prélèvements sociaux seulement, contre ${PFU}\u00a0% de PFU sur un CTO. Sur 50\u00a0000\u00a0€ de plus-values, l'écart est de ${ecartFiscal(50_000)}\u00a0€ d'impôt. Cet avantage vaut dans la limite du plafond de versements du PEA (150\u00a0000\u00a0€), et pour les seuls titres éligibles.`,
  },
  {
    q: "Comment fonctionne la règle des 5 ans du PEA ?",
    // 29/09/2026 (FISC-PEA-05, service-public F2385 et F22449, BOFiP) : la
    // page affirmait l'inverse de la règle — « le compteur démarre à
    // l'ouverture, pas au premier versement ». La date d'ouverture fiscale EST
    // celle du premier versement ; un PEA ouvert sans versement ne prend pas
    // date. /investir-200-euros-mois-etf disait déjà la bonne règle.
    // 30/09/2026 : « il est conseillé d'ouvrir un PEA tôt » était un conseil ;
    // la phrase décrit l'effet d'une ouverture précoce (fait FISC-PEA-05).
    a: "Tant que le plan a moins de 5 ans, un retrait entraîne en principe sa clôture, et le gain est imposé à 31,4 % (12,8 % d'impôt sur le revenu + 18,6 % de prélèvements sociaux), comme sur un CTO. Une fois les 5 ans passés, le gain n'est plus soumis à l'impôt sur le revenu : un retrait ne supporte que les prélèvements sociaux (18,6 %). Le délai de 5 ans part de la date du premier versement, pas de la signature du contrat : un PEA ouvert tôt, avec une petite somme, «\u00a0prend date\u00a0» même si le reste n'est investi que plus tard. La loi ne fixe pas de versement minimum ; certains courtiers en demandent un à l'ouverture.",
  },
  {
    q: "Quel est le plafond de versement du PEA ?",
    a: "Le plafond de versement du PEA classique est de 150 000 € (300 000 € pour un couple marié/pacsé avec deux PEA). Ce plafond concerne les versements cumulés, pas la valorisation du portefeuille. Vous pouvez avoir un PEA qui vaut 400 000 € avec 150 000 € versés — la valorisation au-delà du plafond reste autorisée et fiscalement avantageuse.",
  },
  {
    q: "Que faire quand on dépasse le plafond du PEA ?",
    // 29/09/2026 (fait FISC-PEA-02, BOFiP + service-public) : « plafond séparé
    // de 225 000 € » était faux. 225 000 € est le plafond CUMULÉ PEA + PEA-PME :
    // avec 150 000 € déjà versés sur le PEA, il reste 75 000 € pour le PEA-PME.
    // 30/09/2026 : « Le CTO est le choix le plus simple » et « la combinaison
    // optimale » tranchaient à la place du lecteur ; la réponse décrit les
    // options et ce que fait le calculateur.
    a: "Une fois le plafond de 150 000 € atteint, vos versements supplémentaires doivent aller sur un autre compte. Le CTO n'a pas de plafond. Le PEA-PME est une autre option, dont le plafond est commun avec le PEA : 225 000 € de versements au total sur les deux plans, soit 75 000 € de plus une fois le PEA rempli, avec un choix d'ETF éligibles plus restreint. L'assurance-vie en est une troisième (cadre fiscal différent, frais plus élevés). Quand vos versements dépassent 150 000 €, notre calculateur affiche aussi le résultat d'un PEA rempli jusqu'au plafond, complété par un CTO.",
  },
  {
    q: "Quelle différence entre PFU et option pour l'IR ?",
    // 29/09/2026 (FISC-CTO-02, service-public F2613 et F21618) : « ce qui est
    // rare » n'était pas sourcé ; l'option est surtout GLOBALE, ce que la
    // réponse ne disait pas.
    a: "Le PFU (Prélèvement Forfaitaire Unique) à 31,4 % est appliqué par défaut aux plus-values et dividendes d'un compte-titres. Vous pouvez opter à la place pour le barème progressif de l'impôt sur le revenu (+ 18,6 % de prélèvements sociaux). Selon service-public, c'est en général plus favorable si vous êtes non imposable ou dans la tranche à 11 %. Attention : l'option est globale, elle s'applique à tous vos revenus de capitaux mobiliers et plus-values de l'année, et se coche case 2OP de la déclaration. Notre calculateur applique le PFU à 31,4 %, le régime par défaut.",
  },
  {
    q: "Les ETF World comme CW8 ou VWCE sont-ils éligibles au PEA ?",
    // 28/09/2026 (table de vérité ETF) : « Oui pour les ETF synthétiques »
    // laissait croire qu'un swap suffit — 500, ANX et AEEM sont des swaps
    // Amundi NON éligibles. WPEA et DCAM (0,20 %) ajoutés à côté de CW8.
    a: "CW8 (Amundi MSCI World Swap, 0,38 %) oui, comme WPEA et DCAM (0,20 %), qui suivent le même indice : ils détiennent des actions européennes et reçoivent la performance du MSCI World par un swap. Mais un swap ne rend pas éligible à lui seul : l'Amundi S&P 500 Swap (500), l'Amundi Nasdaq-100 Swap (ANX) et l'Amundi MSCI Emerging Markets Swap (AEEM) ne le sont pas. VWCE (Vanguard FTSE All-World) n'est PAS éligible PEA : réplication physique sur des actions majoritairement hors UE, il se loge en CTO. Le statut PEA se vérifie ETF par ETF, sur son document d'information clé.",
  },
  {
    q: "Cette simulation tient-elle compte des dividendes ?",
    a: "Notre calculateur modélise les ETF capitalisants (CW8, VWCE, IWDA). Les dividendes y sont automatiquement réinvestis dans le fonds — vous ne les recevez pas en cash, donc aucun événement fiscal pendant la durée de détention. Pour des ETF distribuants (qui versent des dividendes en cash), la fiscalité serait différente : sur CTO, les dividendes seraient taxés annuellement à 31,4 % PFU. Sur PEA, ils restent exonérés tant qu'ils ne sont pas retirés.",
  },
];

export default function CalculateurFiscalPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    // Wrapper bg-white opaque pour stopper le leak AmbientBackground.
    // Page de calcul = analytique/lecture, fond calme et lisible.
    <div className="bg-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Calculateur fiscal PEA vs CTO",
          url: `${siteUrl}${CANONICAL}`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web browser",
          inLanguage: "fr-FR",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
          description:
            "Comparez l'impôt sur vos plus-values ETF en PEA vs CTO. Règle des 5 ans, plafond 150 000 €, PFU 31,4 % vs prélèvements sociaux 18,6 %.",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'ariane"
          className="flex items-center gap-2 text-sm text-gray-500 mb-3"
        >
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-700" aria-current="page">
            Calculateur fiscal PEA vs CTO
          </span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Calculateur fiscal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            PEA ou CTO : combien d&apos;impôt sur votre DCA ETF ?
          </h1>

          {/* Article + auteur + dateModified (30/09/2026) : la page n'avait
              que WebApplication et FAQPage, sans date ni signature. */}
          <ArticleByline
            publishedAt="2026-04-28"
            updatedAt="2026-09-30"
            url={CANONICAL}
            headline={TITLE}
            description={DESCRIPTION}
            className="mb-5"
          />

          {/* La réponse d'abord (30/09/2026) : les deux taux dans la première
              phrase, puis leur date de vérification et leurs sources. */}
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl">
            En {ANNEE_TAUX}, un gain retiré d&apos;un <strong>PEA de plus de 5 ans</strong>{" "}
            ne supporte que les prélèvements sociaux, <strong>{PS}&nbsp;%</strong>. Sur un{" "}
            <strong>compte-titres (CTO)</strong>, une plus-value paie le prélèvement forfaitaire
            unique (PFU) de <strong>{PFU}&nbsp;%</strong>&nbsp;: {IR}&nbsp;% d&apos;impôt sur le
            revenu et {PS}&nbsp;% de prélèvements sociaux. L&apos;écart est donc de {IR}&nbsp;points
            sur chaque euro de gain.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mt-2">
            Taux vérifiés le {DATE_TAUX} sur{" "}
            <a
              href="https://www.service-public.gouv.fr/particuliers/vosdroits/F21618"
              target="_blank"
              rel="noopener"
              className="underline underline-offset-2 hover:text-gray-700"
            >
              service-public.gouv.fr (plus-values sur valeurs mobilières)
            </a>
            ,{" "}
            <a
              href="https://www.service-public.gouv.fr/particuliers/vosdroits/F2329"
              target="_blank"
              rel="noopener"
              className="underline underline-offset-2 hover:text-gray-700"
            >
              service-public.gouv.fr (prélèvements sociaux)
            </a>{" "}
            et{" "}
            <a
              href="https://www.impots.gouv.fr/particulier/questions/jai-un-plan-depargne-en-actions-pea-les-retraits-sont-ils-imposables"
              target="_blank"
              rel="noopener"
              className="underline underline-offset-2 hover:text-gray-700"
            >
              impots.gouv.fr (retraits d&apos;un PEA)
            </a>
            .
          </p>
          <p className="text-base text-gray-600 leading-relaxed max-w-2xl mt-4">
            Entrez votre stratégie d&apos;investissement, on calcule en temps
            réel le net après impôt sur PEA et sur CTO — règle des 5 ans,
            plafond 150 000 €, PFU et prélèvements sociaux compris.
          </p>
          {/* 29/09/2026 : remarque d'un conseiller (CIF) lecteur du site — une
              comparaison fiscale ne suffit pas à choisir une enveloppe. Il a
              raison, et la page ne le disait pas. */}
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mt-3">
            Ce calcul compare l&apos;impôt, rien d&apos;autre. Le choix d&apos;une
            enveloppe dépend aussi de ce que vous voulez y loger (un PEA
            n&apos;accepte que des titres éligibles, dans la limite de ses
            plafonds), de votre horizon et de votre besoin de disponibilité :
            ces critères sont détaillés dans notre{" "}
            <Link href="/pea-ou-cto" className="text-primary-700 underline underline-offset-2">
              guide PEA ou CTO
            </Link>
            .
          </p>
        </header>

        {/* Calculator */}
        <CalculatorClient />

        {/* SEO content + FAQ */}
        <section className="mt-20 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comprendre la fiscalité PEA vs CTO en 60 secondes
            </h2>

            {/* Tableau d'écart (30/09/2026) : quatre plus-values types, l'impôt
                calculé par impot-affiche.ts sur les taux du moteur. Trois
                colonnes de montants : il tient à 375 px dans son conteneur. */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/70 mb-3">
              <table className="w-full text-xs sm:text-sm">
                <caption className="sr-only">
                  Impôt dû sur une plus-value selon l&apos;enveloppe, taux {ANNEE_TAUX}
                </caption>
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="text-left px-2.5 sm:px-4 py-3 font-semibold text-gray-600">Plus-value</th>
                    <th scope="col" className="text-right px-2.5 sm:px-4 py-3 font-semibold text-gray-600">
                      PEA de plus de 5&nbsp;ans ({PS}&nbsp;%)
                    </th>
                    <th scope="col" className="text-right px-2.5 sm:px-4 py-3 font-semibold text-gray-600">
                      CTO (PFU {PFU}&nbsp;%)
                    </th>
                    <th scope="col" className="text-right px-2.5 sm:px-4 py-3 font-semibold text-gray-600">Écart</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PLUS_VALUES_TYPES.map((gain) => (
                    <tr key={gain}>
                      <th scope="row" className="text-left px-2.5 sm:px-4 py-3 font-medium text-gray-900 tabular-nums whitespace-nowrap">
                        {milliers(gain)}&nbsp;€
                      </th>
                      <td className="text-right px-2.5 sm:px-4 py-3 text-gray-700 tabular-nums whitespace-nowrap">
                        {impotPEA(gain)}&nbsp;€
                      </td>
                      <td className="text-right px-2.5 sm:px-4 py-3 text-gray-700 tabular-nums whitespace-nowrap">
                        {impotCTO(gain)}&nbsp;€
                      </td>
                      <td className="text-right px-2.5 sm:px-4 py-3 font-semibold text-primary-700 tabular-nums whitespace-nowrap">
                        {ecartFiscal(gain)}&nbsp;€
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Impôt dû sur la plus-value, taux {ANNEE_TAUX} vérifiés le {DATE_TAUX}. CTO au PFU, sans
              l&apos;option pour le barème de l&apos;impôt sur le revenu. PEA de plus de 5&nbsp;ans&nbsp;:
              un plan ouvert avant 2018 garde d&apos;anciens taux sur la part du gain acquise avant cette
              date et, s&apos;il avait moins de 5&nbsp;ans au 1er&nbsp;janvier 2018, sur le gain de ses
              5&nbsp;premières années. Ce qui a changé en 2026, et depuis quand selon le type de
              revenu&nbsp;:{" "}
              {/* Lien vers /fiscalite-pea-cto-2026 (30/09/2026). */}
              <Link href="/fiscalite-pea-cto-2026" className="underline underline-offset-2 hover:text-gray-700">
                fiscalité du PEA et du CTO en 2026
              </Link>
              .
            </p>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Quand vous vendez vos ETF en plus-value, l&apos;État prélève
                une part de votre gain. Le taux dépend du compte sur lequel
                vous avez investi : <strong>PEA</strong> ou{" "}
                <strong>CTO (Compte-Titres Ordinaire)</strong>. Sur un horizon
                long-terme (≥ 5 ans), la différence est{" "}
                <strong>significative</strong>.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  {/* 30/09/2026 : « le compte fiscalement le plus avantageux »
                      (superlatif) → la comparaison, chiffrée juste au-dessus. */}
                  <strong>PEA après 5 ans</strong> : seuls les prélèvements
                  sociaux s&apos;appliquent (18,6 %). Sur un DCA en ETF de long
                  terme, c&apos;est ce qui le rend moins imposé que le CTO.
                </li>
                <li>
                  <strong>PEA avant 5 ans</strong> : si vous clôturez avant
                  les 5 ans, vous payez le PFU complet à 31,4 %. Dans ce cas, le
                  PEA n&apos;a plus d&apos;intérêt fiscal par rapport au CTO.
                </li>
                <li>
                  {/* 29/09/2026 (FISC-PS-02) : 18,6 % est le TOTAL des
                      prélèvements sociaux (CSG 10,6 % + CRDS 0,5 % +
                      prélèvement de solidarité 7,5 %), pas la CSG seule. */}
                  <strong>CTO</strong> : PFU de 31,4 % (12,8 % d&apos;impôt sur
                  le revenu + 18,6 % de prélèvements sociaux) sur toutes les
                  plus-values, peu importe la durée de détention.
                </li>
                <li>
                  <strong>Plafond PEA : 150 000 €</strong> de versements (pas
                  de la valeur du portefeuille). Au-delà, l&apos;excédent va
                  forcément en CTO.
                </li>
              </ul>
            </div>
          </div>

          {/* Exemple concret — CALCULÉ depuis le 30/09/2026. Il était écrit à
              la main (102 000 €, 54 000 € de gains, 6 912 € d'écart), sans
              frais, alors que le calculateur s'ouvre avec 0,38 % de frais et
              affichait un autre écart : deux réponses à une même question. Il
              reprend désormais les valeurs de départ du calculateur. */}
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Exemple concret</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {DEFAULTS_CALCULATEUR.monthlyAmount}&nbsp;€/mois ×{" "}
              {DEFAULTS_CALCULATEUR.durationYears}&nbsp;ans ={" "}
              {formatFiscalEur(EXEMPLE.pea.totalInvested)} versés. À{" "}
              {DEFAULTS_CALCULATEUR.annualReturnPct}&nbsp;%/an avant frais, avec{" "}
              {EXEMPLE_TER}&nbsp;% de frais annuels (
              {FONDS_EXEMPLE ? `ceux de ${FONDS_EXEMPLE.displaySymbol}, ` : ""}valeur de départ du
              calculateur), le portefeuille atteint{" "}
              <strong>{formatFiscalEur(EXEMPLE.pea.grossFinalValue)}</strong>, soit{" "}
              <strong>{formatFiscalEur(EXEMPLE.pea.capitalGain)} de plus-values</strong>.
            </p>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>
                <strong>En PEA</strong> (≥ 5 ans) : {formatFiscalEur(EXEMPLE.pea.capitalGain)} × {PS}&nbsp;% ={" "}
                <strong>{formatFiscalEur(EXEMPLE.pea.taxDue)}</strong> d&apos;impôt → net{" "}
                <strong>{formatFiscalEur(EXEMPLE.pea.netFinalValue)}</strong>
              </li>
              <li>
                <strong>En CTO</strong> : {formatFiscalEur(EXEMPLE.cto.capitalGain)} × {PFU}&nbsp;% ={" "}
                <strong>{formatFiscalEur(EXEMPLE.cto.taxDue)}</strong> d&apos;impôt → net{" "}
                <strong>{formatFiscalEur(EXEMPLE.cto.netFinalValue)}</strong>
              </li>
              <li className="pt-1.5 border-t border-slate-200/70 mt-1.5 font-semibold text-primary-700">
                → Avantage PEA : <strong>+{formatFiscalEur(EXEMPLE.peaAdvantageEur)}</strong> (+
                {EXEMPLE_ECART_PCT}&nbsp;% de net)
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-2xl border border-slate-200/70 bg-white shadow-card overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-slate-50 transition-colors list-none">
                    {q}
                    <span className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <div className="px-5 pb-4 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-50">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Internal linking + disclaimer */}
          <div data-nosearch="" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/simulateur"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Étape suivante
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                Simuler votre DCA en détail →
              </p>
              <p className="text-sm text-gray-600">
                3 scénarios sur 30 ans, intérêts composés, choix d&apos;ETF.
              </p>
            </Link>
            <Link
              href="/pea-ou-cto"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Pour aller plus loin
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                PEA ou CTO : guide complet →
              </p>
              <p className="text-sm text-gray-600">
                Frais, plafond, ETF éligibles, cas pratiques.
              </p>
            </Link>
          </div>

          <Disclaimer />
        </section>
      </div>
    </div>
  );
}
