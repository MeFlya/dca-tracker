// Centre de notifications — signaux DÉRIVÉS de l'état de l'utilisateur.
//
// Choix d'archi : pas de table de notifications en base. On CALCULE les
// notifications pertinentes à partir de l'état courant (entries loggées,
// badges, niveau, date) à chaque requête. C'est stateless côté serveur,
// toujours à jour, et ça reflète "ce qu'il faut faire / ce qui est nouveau"
// plutôt qu'un journal d'events figé.
//
// L'état "lu/non-lu" est géré côté client (localStorage, par device) — chaque
// notification a un id stable (incluant le mois/année pour les signaux
// périodiques, qui se réinitialisent donc naturellement).
//
// Pure / client-safe : aucun import serveur.

import { currentMonth, computeStreak } from "./strategy-math";

/** Année et mois dans le fuseau de l'audience (cf. strategy-math). */
function anneeEtMois(): { y: number; m: number } {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  return {
    y: Number(p.find((x) => x.type === "year")!.value),
    m: Number(p.find((x) => x.type === "month")!.value),
  };
}
import {
  computeEarnedBadges,
  BADGE_BY_ID,
  getInvestorLevel,
  maxPortfolioValueEver,
} from "./badges";

export type NotificationCategory = "action" | "achievement";
export type NotificationTone = "warning" | "success" | "info" | "default";

export type AppNotification = {
  /** Id stable et unique. Inclut mois/année pour les signaux périodiques. */
  id: string;
  category: NotificationCategory;
  /** Emoji affiché. */
  icon: string;
  title: string;
  body: string;
  /** Destination au clic. */
  href?: string;
  tone: NotificationTone;
};

export type NotificationContext = {
  plan: string;
  hasStrategy: boolean;
  entries: { month: string; portfolioValue: number; invested: number }[];
  /** Injectable pour les tests ; défaut = maintenant. */
  now?: Date;
};

const VALUE_MILESTONES = [10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export function computeNotifications(ctx: NotificationContext): AppNotification[] {
  const { plan, hasStrategy, entries } = ctx;
  const now = ctx.now ?? new Date();
  const isPremium = plan === "premium";
  const out: AppNotification[] = [];

  const months = entries.map((e) => e.month);
  const cur = currentMonth();
  const loggedThisMonth = months.includes(cur);

  // ── Actions (Premium + stratégie active) ─────────────────────────────────
  if (isPremium && hasStrategy && entries.length > 0) {
    const streak = computeStreak(months);

    if (streak > 0 && !loggedThisMonth) {
      out.push({
        id: `streak_risk:${cur}`,
        category: "action",
        icon: "🔥",
        title: `Série de ${streak} mois en danger`,
        body: "Enregistrez votre portefeuille ce mois-ci pour ne pas perdre votre série.",
        href: "/account",
        tone: "warning",
      });
    } else if (!loggedThisMonth) {
      out.push({
        id: `month_due:${cur}`,
        category: "action",
        icon: "📝",
        title: "Votre mois n'est pas encore enregistré",
        body: "Mettez à jour la valeur de votre portefeuille pour ce mois.",
        href: "/account",
        tone: "info",
      });
    }

    // Palier de valeur proche (à moins de 10 %).
    const maxVal = maxPortfolioValueEver(entries);
    const nextMilestone = VALUE_MILESTONES.find((m) => maxVal < m);
    if (nextMilestone && maxVal >= nextMilestone * 0.9) {
      const remaining = Math.round(nextMilestone - maxVal);
      out.push({
        id: `milestone_near:${nextMilestone}`,
        category: "action",
        icon: "🎯",
        title: `Bientôt ${nextMilestone.toLocaleString("fr-FR")} €`,
        body: `Plus que ${remaining.toLocaleString("fr-FR")} € avant de franchir ce palier.`,
        href: "/account",
        tone: "info",
      });
    }
  }

  // ── Saison fiscale (avril-mai), pour les Premium ──────────────────────────
  // Fuseau de l'audience : ces notifications sont calées sur le calendrier
  // fiscal français, et `tax:${année}` sert d'IDENTIFIANT — une année fausse
  // crée un doublon ou fait sauter la notification.
  const month0 = anneeEtMois().m - 1; // 0 = janvier
  if (isPremium && (month0 === 3 || month0 === 4)) {
    out.push({
      id: `tax:${anneeEtMois().y}`,
      category: "action",
      icon: "🧾",
      title: "Saison des impôts",
      body: "Votre récap fiscal annuel est prêt — cases 2042 et 2074 calculées.",
      href: "/account/recap-fiscal",
      tone: "info",
    });
  }

  // ── Achievements (badges + niveau) ───────────────────────────────────────
  // Émis pour TOUT ce qui est débloqué ; côté client, seuls ceux non-lus
  // restent affichés (les autres vivent en permanence dans l'onglet Insights).
  if (entries.length > 0) {
    const earned = computeEarnedBadges(entries);
    for (const id of earned) {
      const b = BADGE_BY_ID[id];
      out.push({
        id: `badge:${id}`,
        category: "achievement",
        icon: b.icon,
        title: `Badge débloqué : ${b.label}`,
        body: b.desc,
        href: "/account",
        tone: "success",
      });
    }

    const level = getInvestorLevel(entries);
    if (level.tier > 0) {
      out.push({
        id: `level:${level.name}`,
        category: "achievement",
        icon: level.icon,
        title: `Niveau ${level.name} atteint`,
        body: `${level.monthsLogged} mois de suivi — continuez pour monter d'un niveau.`,
        href: "/account",
        tone: "success",
      });
    }
  }

  return out;
}
