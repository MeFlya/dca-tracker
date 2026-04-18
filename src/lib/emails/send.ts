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
    subject: `Bienvenue sur DCA Tracker ${planLabel} 🎉`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#1f2937;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Votre abonnement ${planLabel} est actif ✅</h1>
  <p style="color:#6b7280">Bonjour ${firstName},</p>
  <p>Merci pour votre confiance. Votre plan <strong>${planLabel}</strong> est maintenant actif sur <a href="https://dcatracker.fr" style="color:#2563eb">dcatracker.fr</a>.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0">
    <p style="margin:0;font-weight:600;color:#15803d">Vous avez maintenant accès à :</p>
    <ul style="color:#166534;margin:8px 0 0 0;padding-left:20px">
      ${plan === "premium" || plan === "pro" ? "<li>Export PDF sans filigrane</li>" : ""}
      ${plan === "pro" ? "<li>Simulations illimitées sauvegardées</li><li>Accès anticipé aux nouvelles fonctions</li><li>Support prioritaire</li>" : "<li>Simulations sauvegardées (10 slots)</li>"}
    </ul>
  </div>
  <a href="https://dcatracker.fr/simulateur" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Démarrer le simulateur →</a>
  <p style="margin-top:32px;color:#9ca3af;font-size:12px">Gérez votre abonnement depuis <a href="https://dcatracker.fr/account" style="color:#6b7280">votre espace compte</a>. Pas d'engagement, annulation à tout moment.</p>
</body>
</html>`,
  });
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
