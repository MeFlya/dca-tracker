// ⚠️ Tous les envois passent par sendEmail() (./dispatch) : c'est là que
// la désinscription est respectée et que le pied de page obligatoire est
// ajouté. Ne jamais rappeler resend.emails.send directement ici.
import { sendEmail } from "./dispatch";
import { resend } from "@/lib/resend-client";
import { formatEur, runSimulation } from "@/lib/simulator";
import {
  ESSAI_JOURS,
  PREMIUM_ANNUEL_EUR,
  economieAnnuellePct,
  prixAnnuel,
  prixAnnuelParMois,
  prixMensuel,
} from "@/lib/tarifs-affiches";
import { paramsFromSearch } from "@/lib/simulation-params";
import { PFU_RATE, SOCIAL_CHARGES_RATE } from "@/lib/fiscal/pea-cto";
import {
  ecartFiscal,
  impotCTO,
  impotPEA,
  netApresCTO,
  netApresPEA,
} from "@/lib/impot-affiche";


export async function sendSubscriptionConfirmed(
  email: string,
  firstName: string,
) {
  await sendEmail({
    kind: "transactional",
    to: email,
    subject: "Votre abonnement Premium est actif — commencez par le Monte Carlo",
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Votre abonnement Premium est actif</h1>
  <p style="color:#6b7280;margin-bottom:16px">Bonjour ${firstName},</p>
  <p>Merci pour votre confiance. Votre plan <strong>Premium</strong> est actif sur <a href="https://dcatracker.fr" style="color:#2563eb">dcatracker.fr</a>.</p>

  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:24px 0">
    <p style="margin:0 0 12px 0;font-weight:700;color:#1e40af;font-size:15px">Votre fonctionnalité phare : le Monte Carlo</p>
    <p style="margin:0 0 12px 0;color:#1e3a8a;font-size:14px;line-height:1.5">
      Simulez <strong>1 000 scénarios de marché</strong> pour voir la distribution réelle de vos résultats possibles — pas juste une ligne optimiste.
    </p>
    <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Lancer l'analyse Monte Carlo →</a>
  </div>

  <p style="font-weight:600;color:#374151;margin-bottom:8px">Tout ce que Premium vous débloque :</p>
  <ul style="color:#4b5563;padding-left:20px;line-height:1.8;font-size:14px">
    <li>Monte Carlo (1 000 scénarios)</li>
    <li>Suivi mensuel de stratégie et insights</li>
    <li>Comparaison A/B de deux stratégies</li>
    <li>Simulations sauvegardées illimitées</li>
    <li>Export PDF sans filigrane</li>
  </ul>

  <p style="margin-top:32px;color:#9ca3af;font-size:12px">Gérez votre abonnement depuis <a href="https://dcatracker.fr/account" style="color:#6b7280">votre espace compte</a>. Pas d'engagement, annulation à tout moment.</p>
</body>
</html>`,
  });
}

export async function sendOnboardingDay1(
  email: string,
  firstName: string,
) {
  await sendEmail({
    to: email,
    subject: "Avez-vous essayé le Monte Carlo ? (guide rapide)",
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:20px;font-weight:700;margin-bottom:8px">Bonjour ${firstName}, avez-vous essayé le Monte Carlo ?</h1>
  <p style="color:#6b7280;font-size:14px">
    C'est la fonctionnalité Premium la plus puissante — voici comment en tirer le maximum en 2 minutes.
  </p>

  <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #e2e8f0">
    <p style="font-weight:700;margin:0 0 12px 0;color:#0f172a">Comment utiliser le Monte Carlo :</p>
    <ol style="padding-left:20px;color:#334155;font-size:14px;line-height:2">
      <li>Rendez-vous sur <a href="https://dcatracker.fr/simulateur" style="color:#2563eb">dcatracker.fr/simulateur</a></li>
      <li>Entrez votre montant mensuel, durée et rendement cible</li>
      <li>Faites défiler jusqu'à la section <strong>Analyse Monte Carlo</strong></li>
      <li>Lisez les 4 indicateurs : pire cas, médiane, meilleur cas, probabilité de plus-value</li>
    </ol>
  </div>

  <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #bbf7d0">
    <p style="margin:0;font-size:14px;color:#15803d">
      <strong>Astuce :</strong> comparez le pire cas (10e percentile) avec votre capital investi. Si le pire cas reste positif sur 20 ans, c'est un signal fort de résilience de votre stratégie.
    </p>
  </div>

  <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
    Ouvrir le simulateur →
  </a>

  <p style="margin-top:32px;color:#9ca3af;font-size:12px">
    Vous recevez cet email car vous êtes abonné à DCA Tracker Premium.<br>
    <a href="https://dcatracker.fr/account" style="color:#9ca3af">Gérer mon abonnement</a>
  </p>
</body>
</html>`,
  });
}

export async function sendSubscriptionCancelled(
  email: string,
  firstName: string
) {
  await sendEmail({
    kind: "transactional",
    to: email,
    subject: "Votre abonnement DCA Tracker a été annulé",
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Abonnement annulé</h1>
  <p style="color:#6b7280">Bonjour ${firstName},</p>
  <p>Votre abonnement DCA Tracker a bien été annulé. Vous conservez l'accès jusqu'à la fin de la période payée.</p>
  <p>Le plan Gratuit reste disponible sans limitation — simulateur, guides et comparaison ETF restent complets.</p>
  <a href="https://dcatracker.fr/tarifs" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Voir les tarifs</a>
  <p style="margin-top:32px;color:#9ca3af;font-size:12px">Une question ? Répondez à cet email.</p>
</body>
</html>`,
  });
}

// ─── Win-back sequence ────────────────────────────────────────────────────────
//
// Séquence post-annulation : récupérer 5-15 % des churns avec 2 emails ciblés.
// - J+7 : check-in honnête, demande de feedback, rappel des données préservées
// - J+30 : pitch "ce qui a changé depuis ton départ" + offre soft de réactivation
//
// Déclenchement : cron quotidien /api/cron/winback-emails qui scanne les users
// avec canceledAt set et winBackJ7Sent/J30Sent = false.

/** J+7 — Ton honnête, demande feedback. Pas de pitch. */
export async function sendWinBackJ7(email: string, firstName: string) {
  const SITE_URL = "https://dcatracker.fr";
  await sendEmail({
    to: email,
    subject: "Une semaine sans Premium — comment ça se passe ?",
    html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="color:#6b7280;margin-bottom:4px;font-size:14px">Une semaine après votre annulation</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 20px 0;line-height:1.3">
    Bonjour ${firstName}, comment ça se passe ?
  </h1>

  <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
    Une semaine s'est écoulée depuis votre annulation. Je voulais juste prendre
    de vos nouvelles — pas vous vendre Premium à nouveau.
  </p>

  <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
    Si vous avez 30 secondes, j'aimerais comprendre <strong>pourquoi</strong> vous
    avez résilié. Ça m'aide vraiment à améliorer le produit. Vous pouvez juste
    répondre à cet email — un mot, une phrase, ce que vous voulez.
  </p>

  <p style="font-size:15px;color:#374151;margin:0 0 20px 0;line-height:1.7">
    Si l'une de ces raisons est la vôtre, un numéro suffit :
  </p>

  <ul style="color:#4b5563;padding-left:20px;line-height:1.9;font-size:14px;margin:0 0 24px 0">
    <li>Le prix (${prixMensuel}, c'est trop pour mon usage)</li>
    <li>Pas le temps de loguer mes mois</li>
    <li>Il manque une fonctionnalité spécifique</li>
    <li>J'ai juste oublié — l'essai s'est transformé sans que je m'en rende compte</li>
    <li>Autre chose</li>
  </ul>

  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px;margin:24px 0">
    <p style="margin:0;font-size:14px;color:#15803d;line-height:1.7">
      <strong>À noter :</strong> vos données (stratégie sauvegardée, historique mensuel)
      sont conservées. Si vous réactivez un jour, tout est retrouvé à l'identique.
    </p>
  </div>

  <p style="font-size:14px;color:#6b7280;margin-top:24px;line-height:1.6">
    Le plan Gratuit reste complet (simulateur, guides, comparateur ETF) — pas de
    pression. Bon DCA dans tous les cas.
  </p>
  <p style="font-size:14px;color:#6b7280;margin-top:14px;line-height:1.6">
    Maël<br/>
    <a href="${SITE_URL}" style="color:#2563eb">dcatracker.fr</a>
  </p>

  <p style="margin-top:32px;color:#9ca3af;font-size:11px;line-height:1.6">
    Cet email s'arrête là. Vous en recevrez un dernier dans 3 semaines avec les
    nouveautés du produit, puis plus rien sauf si vous réactivez.
  </p>
</body>
</html>`,
  });
}

/** J+30 — Soft pitch : nouveautés depuis le départ + offre soft */
export async function sendWinBackJ30(email: string, firstName: string) {
  const SITE_URL = "https://dcatracker.fr";
  await sendEmail({
    to: email,
    subject: "Premium aujourd'hui — et vos données, toujours là",
    html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="color:#6b7280;margin-bottom:4px;font-size:14px">Récap produit · 1 mois après annulation</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 20px 0;line-height:1.3">
    ${firstName}, 1 mois plus tard
  </h1>

  <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
    Si vous êtes parti à cause d'une fonctionnalité manquante, voici ce que
    Premium comprend aujourd'hui. Pas de pitch, juste la liste.
  </p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:20px 0">
    <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em">
      Dans Premium
    </p>
    <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
      <li>Suivi mensuel de votre stratégie, avec emails personnalisés</li>
      <li>Récap fiscal annuel (cases 2042 et 2074 pré-calculées)</li>
      <li>Backtest sur les vrais cours, sur la période de votre choix</li>
      <li>Comparaison A vs B de deux stratégies côte à côte</li>
      <li>Simulations sauvegardées (jusqu'à 10)</li>
    </ul>
  </div>

  <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
    Vos données (stratégie + historique) sont toujours là, intactes. Si vous
    réactivez, vous retrouvez tout en un clic.
  </p>

  <p style="font-size:15px;color:#374151;margin:0 0 24px 0;line-height:1.7">
    <strong>Et si le prix bloque :</strong> l'annuel à ${prixAnnuel} (au lieu de ${prixMensuel}
    en mensuel) revient à ${prixAnnuelParMois} — ${economieAnnuellePct} d'économie.
  </p>

  <a href="${SITE_URL}/tarifs"
     style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
    Réactiver Premium →
  </a>

  <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
    Si Premium n'est toujours pas pour vous, aucun souci — c'est mon dernier
    email de cette série. Le plan Gratuit reste complet. Bon DCA.
  </p>

  <p style="margin-top:14px;font-size:13px;color:#64748b;line-height:1.6">
    Maël<br/>
    <a href="${SITE_URL}" style="color:#2563eb">dcatracker.fr</a>
  </p>
</body>
</html>`,
  });
}

export async function sendWelcome(email: string, firstName: string) {
  await sendEmail({
    to: email,
    subject: "Bienvenue sur DCA Tracker 👋",
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Bienvenue, ${firstName} 👋</h1>
  <p>Votre compte DCA Tracker est prêt. Commencez à simuler votre stratégie d'investissement progressif en ETF — gratuit, sans engagement.</p>
  <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Démarrer la simulation →</a>
  <p style="margin-top:32px;color:#9ca3af;font-size:12px">DCA Tracker · outil éducatif, pas de conseil en investissement</p>
</body>
</html>`,
  });
}

// ─── Onboarding sequence (D+0, D+3, D+7, D+14) ────────────────────────────────

function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
              <a href="https://dcatracker.fr" style="text-decoration:none">
                <span style="font-size:16px;font-weight:700;color:#1d4ed8">DCA</span><span style="font-size:16px;color:#6b7280">Tracker</span>
              </a>
            </td>
          </tr>
          <tr><td style="padding:36px 32px 28px">${body}</td></tr>
          <tr>
            <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6">
                DCA Tracker · outil éducatif, pas de conseil en investissement.<br/>
                <a href="https://dcatracker.fr/account" style="color:#9ca3af">Gérer mon compte</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** D+0 — Welcome + valeur immédiate (sauvegarde de stratégie, le reflexe
 * que peu de débutants connaissent). On n'explique PAS comment utiliser
 * le simulateur (ils le savent déjà), on pousse l'étape "save" qui
 * débloque le suivi mensuel. */
export async function sendOnboardingWelcome(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      Bienvenue ${firstName} 👋
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Vous venez de créer votre compte DCA Tracker. Je vais vous envoyer
      <strong>3 emails sur les 2 prochaines semaines</strong> pour vous
      faire découvrir des fonctionnalités peu connues qui peuvent vraiment
      changer votre DCA.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      Mais d&apos;abord, un truc que la plupart des gens ratent : la
      <strong>sauvegarde de stratégie</strong>.
    </p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;margin:20px 0">
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em">
        Pourquoi sauvegarder ?
      </p>
      <p style="margin:0 0 12px 0;color:#1e3a8a;font-size:14px;line-height:1.7">
        Une simulation seule, c&apos;est une projection théorique. Une
        stratégie sauvegardée, c&apos;est un <strong>plan de référence</strong>
        contre lequel vous comparez votre portefeuille réel chaque mois.
        Vous voyez si vous êtes en avance, en retard, ou pile dans le plan.
      </p>
      <p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.7">
        C&apos;est ce qui transforme un calculateur ponctuel en
        <strong>vrai outil de pilotage</strong>.
      </p>
    </div>

    <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 8px 0">
      <strong>3 étapes :</strong>
    </p>
    <ol style="font-size:14px;color:#475569;line-height:1.9;padding-left:20px;margin:0 0 22px 0">
      <li>Lancez une simulation avec vos paramètres réels</li>
      <li>Cliquez sur <strong>"Sauvegarder ma stratégie"</strong> en bas du simulateur</li>
      <li>Chaque mois, entrez votre vraie valeur de portefeuille → écart automatique calculé</li>
    </ol>

    <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Sauvegarder ma stratégie →
    </a>

    <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
      Note : la sauvegarde est une fonction Premium. Vous avez ${ESSAI_JOURS} jours
      gratuits pour tester — annulation en 1 clic.
    </p>

    <p style="margin-top:20px;font-size:13px;color:#64748b;line-height:1.6">
      Des questions ? Répondez simplement à cet email — c&apos;est moi qui le lis.
    </p>
  `;
  await sendEmail({
    to: email,
    subject: "Bienvenue — la fonctionnalité que la plupart des gens ratent",
    html: emailShell(body),
  });
}

/**
 * Le scénario de l'email D+3 — celui du simulateur ouvert sans paramètre.
 *
 * Réécrit le 28/09/2026. L'email posait « 200 €/mois pendant 20 ans, à 7 %/an
 * net » puis « capital final ~102 000 € » : ni le moteur sans frais
 * (≈ 104 200 €) ni le simulateur avec ses frais par défaut (97 753 €) ne
 * donnent ce chiffre. Le lecteur qui cliquait vers le calculateur y trouvait
 * un autre résultat que celui de l'email. Tout vient maintenant du moteur,
 * avec les hypothèses par défaut du simulateur, et des taux de fiscal/pea-cto.
 */
function scenarioDay3() {
  const input = paramsFromSearch(new URLSearchParams()).input;
  const { finalValue, totalInvested } = runSimulation(input).base;
  const gain = finalValue - totalInvested;
  const pct = (v: number) => v.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const netPEA = finalValue - gain * SOCIAL_CHARGES_RATE;
  const netCTO = finalValue - gain * PFU_RATE;
  return {
    input,
    finalValue,
    totalInvested,
    gain,
    pct,
    gainNetEnPlus: Math.round(((netPEA - netCTO) / netCTO) * 100),
  };
}

/** D+3 — PEA vs CTO : combien d'impôt vous coûte un mauvais choix
 * d'enveloppe. Pousse vers le calculateur fiscal public. */
export async function sendOnboardingDay3(email: string, firstName: string) {
  const { input, finalValue, totalInvested, gain, pct, gainNetEnPlus } = scenarioDay3();
  const ecart = ecartFiscal(gain);
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      ${firstName}, PEA ou CTO : la décision à ${ecart} €
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Voici le calcul qui surprend tout le monde. Prenons le scénario par
      défaut du simulateur : <strong>${formatEur(input.monthlyAmount)} par mois
      pendant ${input.durationYears} ans</strong>, à ${pct(input.annualReturnPct)} %/an
      avant frais, avec ${pct(input.annualFeesPct)} % de frais annuels.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Capital versé : ${formatEur(totalInvested)}. Capital estimé :
      ${formatEur(finalValue)} — le chiffre que vous verrez dans le simulateur.
      Soit <strong>${formatEur(gain)} de plus-values</strong>.
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:20px 0">
      <p style="margin:0 0 8px 0;font-size:14px;color:#0f172a">
        <strong>En PEA</strong> (≥ 5 ans) : prélèvements sociaux de
        ${pct(SOCIAL_CHARGES_RATE * 100)} % → <strong>${impotPEA(gain)} €</strong>
        d&apos;impôt → net ${netApresPEA(finalValue, gain)} €
      </p>
      <p style="margin:0 0 8px 0;font-size:14px;color:#0f172a">
        <strong>En CTO</strong> : flat tax de ${pct(PFU_RATE * 100)} % →
        <strong>${impotCTO(gain)} €</strong> d&apos;impôt → net ${netApresCTO(finalValue, gain)} €
      </p>
      <p style="margin:12px 0 0 0;padding-top:10px;border-top:1px solid #e2e8f0;font-size:14px;color:#1e40af;font-weight:700">
        Différence : <span style="color:#15803d">+${ecart} €</span>
        (+ ${gainNetEnPlus} % de net) — juste en choisissant l&apos;enveloppe
      </p>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Le piège : tous les ETF ne sont pas éligibles au PEA, et le nom ne
      suffit pas à le savoir. Le <strong>500</strong> (S&amp;P 500),
      l&apos;<strong>ANX</strong> (Nasdaq-100) et l&apos;<strong>AEEM</strong>
      (émergents) sont des ETF Amundi… dont aucun n&apos;est éligible. Leurs
      équivalents PEA : PSP5 ou SPEA, PUST, PAEEM. Avant de passer un ordre,
      c&apos;est l&apos;ISIN qu&apos;il faut vérifier.
    </p>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      Le calculateur fait la même chose avec <strong>vos</strong> chiffres —
      règle des 5 ans incluse, plafond de versements de 150 000 € géré.
    </p>

    <a href="https://dcatracker.fr/calculateur-fiscal-pea-cto" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Calculer ma fiscalité PEA vs CTO →
    </a>

    <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
      Bonus : la version Premium calcule chaque année les montants à
      reporter dans vos cases 2042 et 2074 quand vous ferez votre
      déclaration.
    </p>
  `;
  await sendEmail({
    to: email,
    subject: "PEA ou CTO : combien ça change vraiment (le calcul)",
    html: emailShell(body),
  });
}

/** D+7 — Allocation : ce qu'un MSCI World seul contient, et ce qui lui
 * manque. Pousse vers /allocation-portefeuille.
 *
 * Réécrit le 28/09/2026. L'ancien email s'intitulait « le piège du 100 % MSCI
 * World » — l'inverse de la ligne du site (« un seul ETF suffit ») — et
 * reposait sur trois chiffres sans source : « 0,5 à 1 point de rendement
 * annuel laissé sur la table », un mix 70/20/10 qui « rapporte historiquement
 * ~7 % vs 6,8 % », « ~3 000 € de plus ». Émergents et petites capitalisations
 * ont fait, selon les périodes, mieux ou nettement moins bien que le MSCI
 * World : promettre un surplus de rendement était faux. */
export async function sendOnboardingDay7(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      ${firstName}, un seul ETF suffit-il ?
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Pour démarrer, oui. Un ETF MSCI World éligible au PEA — WPEA ou DCAM
      à 0,20 % de frais, CW8 à 0,38 % — couvre plus d&apos;un millier de
      grandes et moyennes entreprises de 23 pays développés. On peut
      s&apos;en tenir là pendant des années sans rien rater d&apos;essentiel.
    </p>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Ce qu&apos;il ne contient pas, en revanche :
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:20px 0">
      <p style="margin:0 0 10px 0;font-size:14px;color:#0f172a">
        <strong>1. Les marchés émergents</strong>
      </p>
      <p style="margin:0 0 16px 0;font-size:14px;color:#475569;line-height:1.7">
        Chine, Inde, Taïwan, Brésil… environ 10 % de la capitalisation
        boursière mondiale. Dans un PEA : PAEEM (Amundi, 0,30 %).
      </p>
      <p style="margin:0 0 10px 0;font-size:14px;color:#0f172a">
        <strong>2. Les petites capitalisations</strong>
      </p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
        Le MSCI World ne retient que les grandes et moyennes entreprises.
        Dans un PEA : RS2K (Russell 2000, petites entreprises américaines,
        0,35 %).
      </p>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Les ajouter élargit la diversification. Ça ne promet aucun rendement
      de plus : selon les périodes, émergents et petites capitalisations ont
      fait mieux ou nettement moins bien que le MSCI World. Et chaque ligne
      ajoutée est une ligne de plus à rééquilibrer.
    </p>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      L&apos;outil d&apos;allocation vous laisse composer votre mix — ou
      partir d&apos;un des quatre exemples, du MSCI World seul au 70/20/10 —
      et voir son TER pondéré à côté d&apos;un MSCI World seul.
    </p>

    <a href="https://dcatracker.fr/allocation-portefeuille" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Composer mon allocation →
    </a>

    <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
      Tout n&apos;est pas éligible au PEA : l&apos;outil le signale pour
      chaque ETF.
    </p>
  `;
  await sendEmail({
    to: email,
    subject: "Un seul ETF suffit-il ? Ce qui manque au MSCI World",
    html: emailShell(body),
  });
}

/** D+14 — Récap fiscal annuel + Monte Carlo : ce que Premium débloque
 * vraiment (les 2 fonctionnalités à plus haute valeur). */
export async function sendOnboardingDay14(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      ${firstName}, les 2 fonctions Premium qui changent vraiment vos décisions
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      C&apos;est mon dernier email de cette série. Je voulais finir sur
      les 2 outils Premium qui valent vraiment ${prixMensuel} — pas Monte
      Carlo qui est joli mais ponctuel, mais ceux qui vous suivent
      <strong>année après année</strong>.
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em">
        1. Suivi mensuel + emails automatiques
      </p>
      <p style="margin:0 0 12px 0;font-size:14px;color:#0f172a;line-height:1.7">
        Chaque mois, vous entrez la valeur réelle de votre portefeuille
        broker. L&apos;outil calcule l&apos;écart vs votre projection,
        envoie un récap par email avec un insight ("vous êtes en avance
        de +133 €", "vous avez tenu votre cap 6 mois consécutifs", etc.).
      </p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
        C&apos;est ce qui fait la différence entre <strong>simuler une
        fois</strong> et <strong>piloter sur 20 ans</strong>.
      </p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em">
        2. Récap fiscal annuel
      </p>
      <p style="margin:0 0 12px 0;font-size:14px;color:#0f172a;line-height:1.7">
        Chaque année en mai, votre déclaration. La synthèse Premium calcule
        les montants exacts à reporter dans <strong>les cases 2042 et
        2074</strong> selon votre situation (PEA &lt; 5 ans, PEA ≥ 5 ans,
        ou CTO).
      </p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
        Pas besoin de réfléchir aux taux applicables ou au formulaire
        à utiliser — tout est pré-calculé, exportable en PDF.
      </p>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      <strong>${prixMensuel}</strong> en mensuel, ou <strong>${prixAnnuel}</strong>
      (${economieAnnuellePct} d&apos;économie). Rapporté à un portefeuille de
      100 000 €, l&apos;abonnement annuel pèse
      ${((PREMIUM_ANNUEL_EUR / 100_000) * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %
      par an.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      <strong>${ESSAI_JOURS} jours d&apos;essai gratuit</strong> — vous testez tout,
      vous annulez en 1 clic si ça ne vous convient pas.
    </p>

    <a href="https://dcatracker.fr/tarifs" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Essayer Premium ${ESSAI_JOURS} jours →
    </a>

    <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
      Si Premium n&apos;est pas pour vous, aucun souci — le simulateur,
      le calculateur fiscal et l&apos;allocation portefeuille restent
      gratuits pour toujours. Aucun spam après cet email.
    </p>
    <p style="margin-top:14px;font-size:13px;color:#64748b;line-height:1.6">
      Bon DCA,<br/>
      <strong>L&apos;équipe DCA Tracker</strong>
    </p>
  `;
  await sendEmail({
    to: email,
    subject: `Les 2 fonctions Premium qui valent vraiment ${prixMensuel}`,
    html: emailShell(body),
  });
}

export type AnnualPushMilestone = "month-3" | "month-6" | "month-12";

export async function sendAnnualPush({
  email,
  firstName,
  milestone,
}: {
  email: string;
  firstName: string;
  milestone: AnnualPushMilestone;
}) {
  const SITE_URL = "https://dcatracker.fr";

  const prices = { monthly: 4.9, annual: 49, monthlyTotal: 58.8, savings: 9.8 };
  const planLabel = "Premium";

  const content: Record<AnnualPushMilestone, { subject: string; headline: string; body: string; ctaLabel: string }> = {
    "month-3": {
      subject: `Vous économisez ${prices.savings.toFixed(2)} € en passant à l'annuel`,
      headline: `3 mois de DCA validés. Et maintenant ?`,
      body: `
        <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
          Ça fait <strong>3 mois</strong> que vous suivez votre DCA avec DCA Tracker
          ${planLabel}.
        </p>
        <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
          À ce stade, ça vaut le coup de sécuriser les 12 prochains mois d'un seul coup —
          et d'économiser au passage :
        </p>
      `,
      ctaLabel: "Passer à l'annuel →",
    },
    "month-6": {
      subject: "Vos 6 mois de tracking valent plus cher que vous ne croyez",
      headline: "6 mois de suivi. Vos données ont maintenant une valeur réelle.",
      body: `
        <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
          Vos 6 mois de tracking ne peuvent pas être reproduits. Quelqu'un qui
          s'inscrit aujourd'hui devra attendre 6 mois pour avoir le même historique.
        </p>
        <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
          Sécurisez les 12 prochains mois d'un coup — et économisez 2 mois au passage :
        </p>
      `,
      ctaLabel: "Sécuriser mes 12 prochains mois →",
    },
    "month-12": {
      subject: `🏆 1 an complet · bloquez votre tarif ${planLabel} à vie`,
      headline: "Un an avec DCA Tracker. Offre exclusive.",
      body: `
        <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
          Vous venez de passer <strong>1 an complet</strong> avec DCA Tracker ${planLabel}.
          C'est rare — et ça débloque la comparaison année-sur-année dans votre dashboard.
        </p>
        <p style="font-size:15px;color:#374151;margin:0 0 12px 0;line-height:1.7">
          <strong>Offre exclusive anniversaire :</strong> en passant à l'annuel maintenant,
          votre tarif actuel est <strong>bloqué à vie</strong>. Si nos prix augmentent,
          vous gardez le vôtre. Pour toujours.
        </p>
      `,
      ctaLabel: "Bloquer mon tarif à vie →",
    },
  };

  const m = content[milestone];

  await sendEmail({
    to: email,
    subject: m.subject,
    html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="color:#6b7280;margin-bottom:4px;font-size:14px">${planLabel} · Offre annuelle</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 20px 0;line-height:1.3">
    ${firstName}, ${m.headline}
  </h1>

  ${m.body}

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 28px 0;border-collapse:separate">
    <tr>
      <td style="padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px 0 0 10px;border-right:0">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em">Mensuel × 12</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#64748b;text-decoration:line-through;text-decoration-color:#cbd5e1">${prices.monthlyTotal.toFixed(2).replace(".", ",")} €</p>
      </td>
      <td style="padding:16px 20px;background:#eff6ff;border:1px solid #2563eb;border-radius:0 10px 10px 0;text-align:right">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em">Annuel</p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#1e40af">${prices.annual} €</p>
        <p style="margin:2px 0 0 0;font-size:11px;color:#2563eb">Économie : ${prices.savings.toFixed(2).replace(".", ",")} €</p>
      </td>
    </tr>
  </table>

  <a href="${SITE_URL}/tarifs" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
    ${m.ctaLabel}
  </a>

  <p style="margin-top:24px;font-size:12px;color:#9ca3af;line-height:1.6">
    Pas d'engagement supplémentaire — l'annuel est juste un paiement unique.
    Annulation possible à tout moment, remboursement prorata.
  </p>

  <p style="margin-top:24px;color:#9ca3af;font-size:11px;line-height:1.6">
    DCA Tracker · outil éducatif, pas de conseil en investissement.<br/>
    <a href="${SITE_URL}/account" style="color:#9ca3af">Gérer mon abonnement</a>
  </p>
</body>
</html>`,
  });
}

export async function sendMissedMonth({
  email,
  firstName,
  prevMonth,
  streak,
}: {
  email: string;
  firstName: string;
  prevMonth: string; // "YYYY-MM"
  streak: number;
}) {
  const SITE_URL = "https://dcatracker.fr";
  const [y, m] = prevMonth.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const subject =
    streak >= 3
      ? `🔥 Votre série de ${streak} mois est en danger`
      : streak > 0
      ? "Ne cassez pas votre série de suivi DCA"
      : `Un mois manquant dans votre suivi : ${monthLabel}`;

  const hook =
    streak >= 3
      ? `Vous avez loggé <strong>${streak} mois consécutifs</strong>. Le mois de ${monthLabel} manque — et sans enregistrement, votre série casse.`
      : streak > 0
      ? `Vous avez commencé votre suivi DCA. Le mois de ${monthLabel} n'a pas encore été enregistré.`
      : `Vous avez sauvegardé votre stratégie DCA mais n'avez pas encore commencé à logger vos mois. ${monthLabel} serait un bon moment pour démarrer.`;

  const streakLine =
    streak >= 3
      ? `<p style="margin:0 0 20px 0;font-size:14px;color:#ea580c;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;line-height:1.6">
          <strong>🔥 Série actuelle : ${streak} mois</strong><br/>
          <span style="color:#9a3412">Elle sera réinitialisée si ${monthLabel} reste vide.</span>
        </p>`
      : "";

  await sendEmail({
    to: email,
    subject,
    html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="color:#6b7280;margin-bottom:4px;font-size:14px">Rappel mensuel</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 20px 0">Bonjour ${firstName} 👋</h1>

  <p style="font-size:15px;color:#374151;margin:0 0 20px 0;line-height:1.7">
    ${hook}
  </p>

  ${streakLine}

  <p style="font-size:14px;color:#6b7280;margin:0 0 24px 0;line-height:1.6">
    Loguer votre mois prend 10 secondes : votre montant versé + la valeur actuelle
    affichée dans votre courtier. C&rsquo;est tout.
  </p>

  <a href="${SITE_URL}/account" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
    Enregistrer maintenant →
  </a>

  <p style="margin-top:32px;color:#9ca3af;font-size:11px;line-height:1.6">
    DCA Tracker · outil éducatif, pas de conseil en investissement.<br/>
    <a href="${SITE_URL}/account" style="color:#9ca3af">Gérer mon compte</a>
  </p>
</body>
</html>`,
    text: `Bonjour ${firstName},

${streak >= 3 ? `Vous avez loggé ${streak} mois consécutifs. Le mois de ${monthLabel} manque — et sans enregistrement, votre série casse.\n\n🔥 Série actuelle : ${streak} mois\nElle sera réinitialisée si ${monthLabel} reste vide.\n\n` : streak > 0 ? `Vous avez commencé votre suivi DCA. Le mois de ${monthLabel} n'a pas encore été enregistré.\n\n` : `Vous avez sauvegardé votre stratégie DCA mais n'avez pas encore commencé à logger vos mois.\n\n`}Loguer votre mois prend 10 secondes : votre montant versé + la valeur actuelle affichée dans votre courtier.

Enregistrer maintenant : ${SITE_URL}/account

---
DCA Tracker · outil éducatif, pas de conseil en investissement.`,
  });
}

/** Données réellement saisies par l'abonné, quand il y en a. */
export interface MonthlyRealData {
  /** Valeur du portefeuille telle qu'il l'a renseignée. */
  portfolioValue: number;
  totalInvested: number;
  totalGain: number;
  /** portefeuille réel − projection. Négatif = en retard sur le plan. */
  delta: number;
  monthsLogged: number;
  /** 0-100 : part des mois écoulés qui ont été saisis. */
  disciplineScore: number;
}

export async function sendMonthlyUpdate({
  email,
  firstName,
  monthNumber,
  theoreticalValue,
  monthlyAmount,
  insight,
  real,
}: {
  email: string;
  firstName: string;
  monthNumber: number;
  theoreticalValue: number;
  monthlyAmount: number;
  insight: string;
  /**
   * Absent tant que l'abonné n'a rien saisi. Dans ce cas l'email retombe sur la
   * projection — en l'annonçant comme telle, jamais en la faisant passer pour
   * un suivi.
   */
  real?: MonthlyRealData | null;
}) {
  const SITE_URL = "https://dcatracker.fr";

  const ahead = real ? real.delta >= 0 : false;
  const deltaColor = ahead ? "#047857" : "#b45309";
  const deltaBg = ahead ? "#ecfdf5" : "#fffbeb";
  const deltaBorder = ahead ? "#a7f3d0" : "#fde68a";

  // Bloc principal : le RÉEL quand il existe, la projection sinon.
  const headline = real
    ? `
  <div style="background:${deltaBg};border:1px solid ${deltaBorder};border-radius:12px;padding:20px;margin-bottom:16px">
    <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:${deltaColor};text-transform:uppercase;letter-spacing:0.06em">
      Votre portefeuille
    </p>
    <p style="margin:0;font-size:32px;font-weight:800;color:${deltaColor};line-height:1.1">
      ${formatEur(real.portfolioValue)}
    </p>
    <p style="margin:8px 0 0 0;font-size:13px;color:${deltaColor}">
      ${formatEur(real.totalInvested)} versés · ${real.totalGain >= 0 ? "+" : ""}${formatEur(real.totalGain)} de gains
    </p>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
    <tr>
      <td width="50%" style="padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
        <p style="margin:0 0 2px 0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Projection</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1f2937">${formatEur(theoreticalValue)}</p>
      </td>
      <td width="8"></td>
      <td width="50%" style="padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
        <p style="margin:0 0 2px 0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Écart</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:${deltaColor}">${real.delta >= 0 ? "+" : ""}${formatEur(real.delta)}</p>
      </td>
    </tr>
  </table>

  <p style="font-size:13px;color:#6b7280;margin:0 0 24px 0;line-height:1.6">
    ${real.monthsLogged} mois enregistrés sur ${monthNumber} · régularité ${real.disciplineScore} %
  </p>`
    : `
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px">
    <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em">
      Projection à ce mois
    </p>
    <p style="margin:0;font-size:32px;font-weight:800;color:#1e40af;line-height:1.1">
      ${formatEur(theoreticalValue)}
    </p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#3b82f6">
      Basé sur ${formatEur(monthlyAmount)}/mois à votre rendement cible — pas sur vos versements réels.
    </p>
  </div>`;

  await sendEmail({
    to: email,
    subject: real
      ? `Mois ${monthNumber} : ${formatEur(real.portfolioValue)}, ${real.delta >= 0 ? "+" : ""}${formatEur(real.delta)} vs projection`
      : `Mois ${monthNumber} de votre stratégie DCA`,
    html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="color:#6b7280;margin-bottom:4px;font-size:14px">Mois ${monthNumber} de votre stratégie</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 24px 0">Bonjour ${firstName} 👋</h1>
${headline}
  <p style="font-size:15px;color:#374151;margin-bottom:24px;line-height:1.6">
    ${insight}
  </p>

  <a href="${SITE_URL}/account" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
    ${real ? "Enregistrer ce mois" : "Enregistrer mon premier versement"} →
  </a>
</body>
</html>`,
  });
}

// ─── Trial-ending reminder (sent ~2 days before trial ends) ───────────────────
//
// Triggered by Stripe webhook `customer.subscription.trial_will_end`. Stripe
// fires this event 3 days before the trial converts to a paid subscription.
//
// Goals:
// - Avoid surprise charges (regulatory risk: Stripe disputes + bad reviews)
// - Anchor on what the user has used during the trial (engagement → retention)
// - Make cancellation visible and easy (paradoxically improves trust + conversion)

export interface TrialEndingFeatures {
  hasSavedStrategy: boolean;
  monthsLogged: number;
  hasUsedMonteCarlo: boolean;
  hasImportedCsv: boolean;
}

export async function sendTrialEndingSoon({
  email,
  firstName,
  trialEndDate,
  amountCents,
  currency,
  interval,
  manageUrl,
  features,
}: {
  email: string;
  firstName: string;
  trialEndDate: Date;
  amountCents: number;
  currency: string;
  interval: "month" | "year";
  /** Stripe billing portal URL where the user can cancel before charge. */
  manageUrl: string;
  features: TrialEndingFeatures;
}) {
  const SITE_URL = "https://dcatracker.fr";

  const dateLabel = trialEndDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const amountLabel = (amountCents / 100)
    .toFixed(2)
    .replace(".", ",") + " " + (currency.toUpperCase() === "EUR" ? "€" : currency.toUpperCase());
  const intervalLabel = interval === "year" ? "an" : "mois";

  // Engagement bullets — we celebrate what they've actually used during trial.
  // If they've used nothing, we still nudge gently (no shaming).
  const used: string[] = [];
  if (features.hasSavedStrategy) {
    used.push("Vous avez sauvegardé votre stratégie DCA — le suivi mensuel automatique est activé.");
  }
  if (features.monthsLogged > 0) {
    const plural = features.monthsLogged > 1 ? "s" : "";
    used.push(`Vous avez enregistré <strong>${features.monthsLogged} mois</strong> de suivi.`);
  }
  if (features.hasUsedMonteCarlo) {
    used.push("Vous avez exploré l'analyse Monte Carlo (1 000 scénarios).");
  }
  if (features.hasImportedCsv) {
    used.push("Vous avez importé l'historique de votre courtier.");
  }

  const usedHtml = used.length > 0
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 20px;margin:20px 0">
        <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.06em">
          Pendant votre essai, vous avez :
        </p>
        <ul style="margin:0;padding-left:20px;color:#14532d;font-size:14px;line-height:1.8">
          ${used.map((u) => `<li>${u}</li>`).join("")}
        </ul>
      </div>`
    : `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:18px 20px;margin:20px 0">
        <p style="margin:0;font-size:14px;color:#854d0e;line-height:1.7">
          Vous n&apos;avez pas encore eu le temps d&apos;explorer Premium ?
          C&apos;est le bon moment pour <a href="${SITE_URL}/account" style="color:#b45309;font-weight:700">sauvegarder votre première stratégie</a>{" "}
          — c&apos;est ce qui active le suivi mensuel automatique.
        </p>
      </div>`;

  const subject = `Plus que 2 jours d'essai — prélèvement de ${amountLabel} le ${dateLabel}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">

          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
              <a href="${SITE_URL}" style="text-decoration:none">
                <span style="font-size:16px;font-weight:700;color:#1d4ed8">DCA</span><span style="font-size:16px;color:#6b7280">Tracker</span>
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px 16px">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em">
                Rappel essai gratuit
              </p>
              <h1 style="margin:0 0 14px 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3">
                ${firstName}, votre essai se termine dans 2 jours
              </h1>
              <p style="margin:0 0 14px 0;font-size:15px;color:#475569;line-height:1.7">
                Petit rappel pour que rien ne vous surprenne. Votre essai gratuit
                de 7 jours sur DCA Tracker Premium se termine le
                <strong>${dateLabel}</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 16px">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px">
                <tr>
                  <td style="padding:18px 22px">
                    <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em">
                      À cette date sera prélevé
                    </p>
                    <p style="margin:0;font-size:28px;font-weight:800;color:#1e40af;line-height:1.1">
                      ${amountLabel}
                    </p>
                    <p style="margin:6px 0 0 0;font-size:13px;color:#3b82f6">
                      Pour 1 ${intervalLabel} d&apos;abonnement Premium, renouvelable.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px">
              ${usedHtml}
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 16px">
              <p style="margin:0 0 14px 0;font-size:14px;color:#0f172a;line-height:1.6;font-weight:700">
                Vous avez 2 options :
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 12px" align="left">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#2563eb">
                    <a href="${SITE_URL}/account"
                       style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;line-height:1">
                      ✓ Continuer mon abonnement
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0 0;font-size:12px;color:#64748b">
                Aucune action nécessaire — le prélèvement est automatique.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 32px" align="left">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#ffffff;border:1px solid #cbd5e1">
                    <a href="${manageUrl}"
                       style="display:inline-block;padding:12px 22px;color:#475569;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;line-height:1">
                      Annuler avant prélèvement
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0 0;font-size:12px;color:#64748b">
                Annulation en 1 clic via le portail Stripe — sans frais ni justification.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6">
                Vous recevez cet email parce que votre essai gratuit Premium se
                termine bientôt. DCA Tracker · outil éducatif, pas de conseil
                en investissement.<br/>
                <a href="${SITE_URL}/account" style="color:#9ca3af">Gérer mon compte</a>
                ·
                <a href="${SITE_URL}/cgv" style="color:#9ca3af">CGV</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    kind: "transactional",
    to: email,
    subject,
    html,
  });
}

// ─── Livraison des produits digitaux (paiement unique) ────────────────────────
// Déclenché par le webhook checkout.session.completed (mode "payment").
// Les liens de téléchargement sont signés HMAC et expirent (7 j) — l'email
// invite à répondre pour régénérer un lien expiré.

export async function sendProductDelivery(
  email: string,
  productName: string,
  links: { label: string; url: string }[],
) {
  const linksHtml = links
    .map(
      (l) => `
        <a href="${l.url}" style="display:block;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin-bottom:10px;text-decoration:none">
          <span style="font-size:14px;font-weight:600;color:#1d4ed8">⬇️&nbsp; ${l.label}</span>
        </a>`,
    )
    .join("");

  await sendEmail({
    kind: "transactional",
    to: email,
    subject: `Votre achat : ${productName} — liens de téléchargement`,
    html: emailShell(`
      <h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0f172a">Merci pour votre achat 🎉</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7">
        Voici vos liens pour <strong>${productName}</strong> :
      </p>
      ${linksHtml}
      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;line-height:1.7">
        Les liens de téléchargement sont valables 7 jours. Lien expiré ou
        problème de fichier&nbsp;? Répondez simplement à cet email — nous vous
        renvoyons un lien immédiatement. Votre facture vous est envoyée
        séparément par Stripe.
      </p>
    `),
  });
}
