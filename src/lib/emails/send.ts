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

/** D+0 — Immediate welcome with quick-start guide. */
export async function sendOnboardingWelcome(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      Bienvenue ${firstName}, voici comment démarrer
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px 0">
      Vous avez accès à tout le simulateur DCA gratuitement. En 60 secondes,
      vous saurez ce que peut devenir votre épargne sur 20 ans.
    </p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px 20px;margin:20px 0">
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.06em">
        3 étapes
      </p>
      <ol style="margin:0;padding-left:20px;color:#1e3a8a;font-size:14px;line-height:1.9">
        <li>Entrez votre montant mensuel (ex : 200 €)</li>
        <li>Choisissez une durée (ex : 20 ans)</li>
        <li>Voyez la projection avec les intérêts composés</li>
      </ol>
    </div>

    <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Lancer ma première simulation →
    </a>

    <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
      Des questions ? Répondez simplement à cet email — c'est moi qui le lis.
    </p>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenue sur DCA Tracker — voici comment démarrer",
    html: emailShell(body),
  });
}

/** D+3 — Nudge for users who haven't run a simulation yet. */
export async function sendOnboardingDay3(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      ${firstName}, une simulation prend 60 secondes
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      La plupart des gens pensent qu&apos;une projection DCA, c&apos;est
      complexe. En fait, c&apos;est 3 nombres :
    </p>
    <ul style="font-size:15px;color:#475569;line-height:1.9;padding-left:20px;margin:0 0 20px 0">
      <li><strong>Montant mensuel</strong> — ce que vous pouvez épargner sans stress</li>
      <li><strong>Durée</strong> — 10, 20, 30 ans selon votre horizon</li>
      <li><strong>Rendement cible</strong> — 7 %/an est réaliste pour un ETF MSCI World</li>
    </ul>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      Avec ces 3 entrées, vous verrez exactement ce que peut valoir votre
      épargne dans 20 ans — et combien vient des intérêts composés.
    </p>

    <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Ouvrir le simulateur →
    </a>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Votre simulation DCA prend 60 secondes",
    html: emailShell(body),
    scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  } as Parameters<typeof resend.emails.send>[0]);
}

/** D+7 — Introduce the tracking value prop (Premium teaser). */
export async function sendOnboardingDay7(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      Simuler, c'est bien. Suivre, c'est autre chose.
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      ${firstName}, le simulateur vous montre votre projection. Mais dans
      6 mois, dans 1 an, comment savez-vous si vous êtes en avance ou en
      retard ?
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:20px 0">
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#0f172a">
        Avec un suivi mensuel, vous voyez :
      </p>
      <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.9">
        <li>Votre avance ou retard en € chaque mois</li>
        <li>Ce que les intérêts composés ont généré sans effort</li>
        <li>Votre série de mois consécutifs de suivi</li>
        <li>Des emails mensuels avec vos chiffres réels</li>
      </ul>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      Premium ajoute le tracking au simulateur. <strong>7 jours gratuits</strong>,
      annulation en 1 clic.
    </p>

    <a href="https://dcatracker.fr/tarifs" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Essayer Premium 7 jours →
    </a>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Simuler, c'est bien. Suivre, c'est autre chose.",
    html: emailShell(body),
    scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  } as Parameters<typeof resend.emails.send>[0]);
}

/** D+14 — Final conversion nudge. */
export async function sendOnboardingDay14(email: string, firstName: string) {
  const body = `
    <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px 0;line-height:1.3">
      Une dernière idée, ${firstName}
    </h1>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Vous suivez DCA Tracker depuis 2 semaines. Si vous n&apos;avez pas encore
      activé Premium, voici ce que vous ratez — concrètement.
    </p>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px 20px;margin:20px 0">
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#92400e">
        Pour 4,90 €/mois :
      </p>
      <ul style="margin:0;padding-left:20px;color:#78350f;font-size:14px;line-height:1.9">
        <li>Monte Carlo : 1 000 scénarios de marché simulés</li>
        <li>Suivi mensuel de votre stratégie vs projection</li>
        <li>Comparaison A/B de deux stratégies côte à côte</li>
        <li>Export PDF propre, sans filigrane</li>
        <li>Emails mensuels personnalisés</li>
      </ul>
    </div>

    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 14px 0">
      Moins d&apos;un café par mois. Sur 20 ans, c&apos;est 0,01 % de votre
      portefeuille final. Pour un suivi qui change vos décisions.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 22px 0">
      <strong>7 jours gratuits pour tester.</strong> Vous pouvez annuler en
      1 clic avant la fin de l&apos;essai.
    </p>

    <a href="https://dcatracker.fr/tarifs" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Essayer Premium 7 jours →
    </a>

    <p style="margin-top:28px;font-size:13px;color:#64748b;line-height:1.6">
      Si Premium n&apos;est pas pour vous, aucun problème — le simulateur
      reste gratuit pour toujours. Aucun spam après cet email.
    </p>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Une dernière idée avant que je ne vous écrive plus",
    html: emailShell(body),
    scheduled_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  } as Parameters<typeof resend.emails.send>[0]);
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
