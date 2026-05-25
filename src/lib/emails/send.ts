import { resend } from "@/lib/resend-client";
import { formatEur } from "@/lib/simulator";

const FROM = process.env.RESEND_FROM_EMAIL ?? "DCA Tracker <hello@dcatracker.fr>";

export async function sendSubscriptionConfirmed(
  email: string,
  firstName: string,
) {
  await resend.emails.send({
    from: FROM,
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
  await resend.emails.send({
    from: FROM,
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
  } as Parameters<typeof resend.emails.send>[0]);
}

export async function sendSubscriptionCancelled(
  email: string,
  firstName: string
) {
  await resend.emails.send({
    from: FROM,
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
  await resend.emails.send({
    from: FROM,
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
    Les raisons les plus fréquentes que j'entends :
  </p>

  <ul style="color:#4b5563;padding-left:20px;line-height:1.9;font-size:14px;margin:0 0 24px 0">
    <li>Le prix (4,90 €/mois reste trop pour mon usage)</li>
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
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Ce qui a changé sur DCA Tracker depuis votre départ",
    html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="color:#6b7280;margin-bottom:4px;font-size:14px">Récap produit · 1 mois après annulation</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 20px 0;line-height:1.3">
    ${firstName}, 1 mois plus tard
  </h1>

  <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
    Si vous êtes parti à cause d'une fonctionnalité manquante, voici ce qui a
    été ajouté depuis. Pas de pitch, juste les faits.
  </p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:20px 0">
    <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em">
      Ajouté récemment
    </p>
    <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px">
      <li>Récap fiscal annuel (cases 2042 et 2074 pré-calculées)</li>
      <li>Allocation portefeuille multi-ETF avec pondérations</li>
      <li>Comparaison A vs B de deux stratégies côte à côte</li>
      <li>Simulations sauvegardées (jusqu'à 10 slots)</li>
    </ul>
  </div>

  <p style="font-size:15px;color:#374151;margin:0 0 16px 0;line-height:1.7">
    Vos données (stratégie + historique) sont toujours là, intactes. Si vous
    réactivez, vous retrouvez tout en un clic.
  </p>

  <p style="font-size:15px;color:#374151;margin:0 0 24px 0;line-height:1.7">
    <strong>Et si le prix bloque :</strong> l'annuel à 49 €/an (au lieu de 4,90 €/mois
    en mensuel) revient à 4,08 €/mois — économie de 17 %, et c'est le bon moment
    pour bloquer le tarif actuel.
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
  await resend.emails.send({
    from: FROM,
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
      Note : la sauvegarde est une fonction Premium. Vous avez 7 jours
      gratuits pour tester — annulation en 1 clic.
    </p>

    <p style="margin-top:20px;font-size:13px;color:#64748b;line-height:1.6">
      Des questions ? Répondez simplement à cet email — c&apos;est moi qui le lis.
    </p>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenue — la fonctionnalité que la plupart des gens ratent",
    html: emailShell(body),
  });
}

/** D+3 — PEA vs CTO : combien d'impôt vous coûte un mauvais choix
 * d'enveloppe. Pousse vers le calculateur fiscal public. */
export async function sendOnboardingDay3(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      ${firstName}, PEA ou CTO : la décision à 6 900 €
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Voici le calcul qui surprend tout le monde. Prenons une stratégie
      simple : <strong>200 €/mois pendant 20 ans</strong>, à 7 %/an net.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Capital investi : 48 000 €. Capital final : ~102 000 €. Soit
      <strong>54 000 € de plus-values</strong>.
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:20px 0">
      <p style="margin:0 0 8px 0;font-size:14px;color:#0f172a">
        <strong>En PEA</strong> (≥ 5 ans) : 54 000 € × 17,2 % =
        <strong>9 288 €</strong> d&apos;impôt → net 92 712 €
      </p>
      <p style="margin:0 0 8px 0;font-size:14px;color:#0f172a">
        <strong>En CTO</strong> : 54 000 € × 30 % =
        <strong>16 200 €</strong> d&apos;impôt → net 85 800 €
      </p>
      <p style="margin:12px 0 0 0;padding-top:10px;border-top:1px solid #e2e8f0;font-size:14px;color:#1e40af;font-weight:700">
        Différence : <span style="color:#15803d">+6 912 €</span>
        (+ 8 % de net) — juste en choisissant le bon support fiscal
      </p>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Le piège : tous les ETF ne sont pas éligibles PEA. <strong>VWCE</strong>
      par exemple n&apos;y va pas — il doit être logé en CTO. Tandis que
      <strong>CW8</strong> fonctionne dans les deux.
    </p>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      J&apos;ai mis en ligne un calculateur qui fait le calcul pour
      <strong>vos</strong> chiffres en 5 secondes — règle des 5 ans
      incluse, plafond 150 000 € géré.
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
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "PEA ou CTO : combien ça change vraiment (le calcul)",
    html: emailShell(body),
  });
}

/** D+7 — Allocation multi-ETF : pourquoi 100 % MSCI World n'est pas
 * forcément optimal. Pousse vers /allocation-portefeuille. */
export async function sendOnboardingDay7(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      ${firstName}, le piège du "100 % MSCI World"
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Le MSCI World, c&apos;est l&apos;ETF que tout le monde recommande
      aux débutants. Et c&apos;est légitime : 1 500 entreprises, 23 pays
      développés, frais bas, éligible PEA. Difficile de faire mieux pour
      démarrer.
    </p>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Mais sur le long terme (15-20 ans), il a deux <strong>angles
      morts</strong> :
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:20px 0">
      <p style="margin:0 0 10px 0;font-size:14px;color:#0f172a">
        <strong>1. Pas de marchés émergents</strong>
      </p>
      <p style="margin:0 0 16px 0;font-size:14px;color:#475569;line-height:1.7">
        Chine, Inde, Brésil, Taïwan : ~10 % du capital mondial absent.
        Sur 30 ans, c&apos;est 0,5 à 1 point de rendement annuel laissé
        sur la table.
      </p>
      <p style="margin:0 0 10px 0;font-size:14px;color:#0f172a">
        <strong>2. Pas de small caps</strong>
      </p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
        Le MSCI World ne contient que des grandes capitalisations. Le
        "premium small-cap" historique (excès de rendement) est documenté
        depuis 50 ans — 10 % d&apos;allocation suffit pour le capter.
      </p>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Concrètement, un mix <strong>70 % MSCI World + 20 % Émergents +
      10 % Small Caps</strong> rapporte historiquement ~7 % vs 6,8 % pour
      le World seul. Sur 200 €/mois × 20 ans, c&apos;est ~3 000 € de plus.
    </p>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      J&apos;ai créé un outil qui vous laisse construire votre allocation
      en 30 secondes, voir le rendement pondéré, le TER moyen, et comparer
      à un mono-MSCI World. Avec 4 presets éducatifs.
    </p>

    <a href="https://dcatracker.fr/allocation-portefeuille" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Construire mon allocation →
    </a>

    <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
      Note : tout n&apos;est pas éligible PEA — l&apos;outil le signale
      automatiquement pour chaque ETF.
    </p>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Le piège du \"100 % MSCI World\" (et comment le contourner)",
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
      les 2 outils Premium qui valent vraiment 4,90 €/mois — pas Monte
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
      <strong>4,90 €/mois</strong> en mensuel, ou <strong>49 €/an</strong>
      (économisez 17 %). Sur un portefeuille de 100 000 € à 20 ans,
      c&apos;est 0,01 % de votre capital final.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      <strong>7 jours d&apos;essai gratuit</strong> — vous testez tout,
      vous annulez en 1 clic si ça ne vous convient pas.
    </p>

    <a href="https://dcatracker.fr/tarifs" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Essayer Premium 7 jours →
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
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Les 2 fonctions Premium qui valent vraiment 4,90 €/mois",
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
          ${planLabel}. 60 % des gens abandonnent avant ce cap. Vous l'avez passé.
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

  await resend.emails.send({
    from: FROM,
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

  await resend.emails.send({
    from: FROM,
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

export async function sendMonthlyUpdate({
  email,
  firstName,
  monthNumber,
  theoreticalValue,
  monthlyAmount,
  insight,
}: {
  email: string;
  firstName: string;
  monthNumber: number;
  theoreticalValue: number;
  monthlyAmount: number;
  insight: string;
}) {
  const SITE_URL = "https://dcatracker.fr";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Mois ${monthNumber} de ta stratégie DCA`,
    html: `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="color:#6b7280;margin-bottom:4px;font-size:14px">Mois ${monthNumber} de ta stratégie</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 24px 0">Bonjour ${firstName} 👋</h1>

  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px">
    <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em">
      Valeur théorique ce mois
    </p>
    <p style="margin:0;font-size:32px;font-weight:800;color:#1e40af;line-height:1.1">
      ${formatEur(theoreticalValue)}
    </p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#3b82f6">
      Basé sur ${formatEur(monthlyAmount)}/mois à ton rendement cible.
    </p>
  </div>

  <p style="font-size:15px;color:#374151;margin-bottom:24px;line-height:1.6">
    ${insight}
  </p>

  <a href="${SITE_URL}/account" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
    Mettre à jour mon mois →
  </a>

  <p style="margin-top:32px;color:#9ca3af;font-size:11px;line-height:1.6">
    DCA Tracker · outil éducatif, pas de conseil en investissement.<br/>
    <a href="${SITE_URL}/account" style="color:#9ca3af">Gérer mon compte</a>
  </p>
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

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html,
  });
}
