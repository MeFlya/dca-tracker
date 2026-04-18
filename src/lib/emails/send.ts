import { resend } from "@/lib/resend-client";
import type { PlanId } from "@/lib/plans";

const FROM = process.env.RESEND_FROM_EMAIL ?? "DCA Tracker <bonjour@dcatracker.fr>";

export async function sendSubscriptionConfirmed(
  email: string,
  firstName: string,
  plan: PlanId
) {
  const planLabel = plan === "pro" ? "Pro" : "Premium";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Votre plan ${planLabel} est actif — commencez par le Monte Carlo 🎉`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Votre abonnement ${planLabel} est actif ✅</h1>
  <p style="color:#6b7280;margin-bottom:16px">Bonjour ${firstName},</p>
  <p>Merci pour votre confiance. Votre plan <strong>${planLabel}</strong> est actif sur <a href="https://dcatracker.fr" style="color:#2563eb">dcatracker.fr</a>.</p>

  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:24px 0">
    <p style="margin:0 0 12px 0;font-weight:700;color:#1e40af;font-size:15px">🎯 Votre fonctionnalité phare : le Monte Carlo</p>
    <p style="margin:0 0 12px 0;color:#1e3a8a;font-size:14px;line-height:1.5">
      Simulez <strong>1 000 scénarios de marché</strong> pour voir la distribution réelle de vos résultats possibles — pas juste une ligne optimiste.
    </p>
    <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Lancer l'analyse Monte Carlo →</a>
  </div>

  <p style="font-weight:600;color:#374151;margin-bottom:8px">Vous avez aussi accès à :</p>
  <ul style="color:#4b5563;padding-left:20px;line-height:1.8;font-size:14px">
    <li>Export PDF professionnel sans filigrane</li>
    ${plan === "pro" ? "<li>Simulations illimitées sauvegardées</li><li>Accès anticipé aux nouvelles fonctions</li><li>Support prioritaire</li>" : "<li>Simulations sauvegardées (10 slots) — bientôt</li><li>Données de marché temps réel — bientôt</li>"}
  </ul>

  <p style="margin-top:32px;color:#9ca3af;font-size:12px">Gérez votre abonnement depuis <a href="https://dcatracker.fr/account" style="color:#6b7280">votre espace compte</a>. Pas d'engagement, annulation à tout moment.</p>
</body>
</html>`,
  });
}

export async function sendOnboardingDay1(
  email: string,
  firstName: string,
  plan: PlanId
) {
  const planLabel = plan === "pro" ? "Pro" : "Premium";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Avez-vous essayé le Monte Carlo ? (guide rapide)",
    // Resend supports scheduled_at as ISO 8601 — fire 24h after subscription
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:20px;font-weight:700;margin-bottom:8px">Bonjour ${firstName}, avez-vous essayé le Monte Carlo ?</h1>
  <p style="color:#6b7280;font-size:14px">
    C'est la fonctionnalité ${planLabel} la plus puissante — voici comment en tirer le maximum en 2 minutes.
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
      <strong>💡 Astuce :</strong> comparez le pire cas (10e percentile) avec votre capital investi. Si le pire cas reste positif sur 20 ans, c'est un signal fort de résilience de votre stratégie.
    </p>
  </div>

  <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
    Ouvrir le simulateur →
  </a>

  <p style="margin-top:32px;color:#9ca3af;font-size:12px">
    Vous recevez cet email car vous êtes abonné à DCA Tracker ${planLabel}.<br>
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
