// Email mensuel — déclenché le 1er de chaque mois par Vercel Cron.
// Protégé par CRON_SECRET (fail-closed, cf. lib/cron-auth.ts).
//
// ─── Ce que ce cron faisait, et pourquoi c'était le problème ────────────────
//
// Les entrées de l'utilisateur étaient récupérées puis JAMAIS utilisées. Le
// chiffre mis en avant était la « valeur théorique », c'est-à-dire la
// projection. Conséquence : un abonné ayant saisi douze mois recevait
// exactement le même email qu'un abonné n'ayant rien saisi.
//
// C'est la première ligne du comparatif /tarifs et ce qui justifie de payer
// chaque année. Le moteur nécessaire — computeInsights() — existait déjà et
// alimentait le tableau de bord ; il n'était simplement pas importé ici.
// Ce n'était pas une capacité manquante, c'était un câblage oublié.

import { NextResponse } from "next/server";
import { denyUnlessCron } from "@/lib/cron-auth";
import { clerkClient } from "@clerk/nextjs/server";
import {
  getStrategyData,
  theoreticalValueAtMonth,
  monthsElapsed,
} from "@/lib/user-strategy";
import { computeInsights } from "@/lib/strategy-insights";
import { sendMonthlyUpdate } from "@/lib/emails/send";
import { isOptedOutFromMetadata } from "@/lib/email-preferences";

export const dynamic = "force-dynamic";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Phrase du mois. Quand des versements sont enregistrés, elle parle de ce que
 * l'utilisateur a RÉELLEMENT fait ; sinon elle retombe sur la projection, en
 * l'annonçant explicitement comme telle.
 */
function buildInsight(
  monthNumber: number,
  theoreticalValue: number,
  monthlyAmount: number,
  real: {
    delta: number;
    monthsLogged: number;
    disciplineScore: number;
  } | null,
): string {
  if (real) {
    const { delta, monthsLogged, disciplineScore } = real;
    if (Math.abs(delta) < theoreticalValue * 0.02) {
      return `Vous êtes sur votre trajectoire, à ${eur(Math.abs(delta))} près. C'est exactement ce qu'on cherche : la régularité, pas le timing.`;
    }
    if (delta > 0) {
      return `Vous avez ${eur(delta)} d'avance sur votre projection. À ne pas sur-interpréter : sur un mois, c'est le marché qui parle, pas votre méthode.`;
    }
    if (disciplineScore >= 80) {
      return `Vous êtes à ${eur(-delta)} sous votre projection, mais vous avez tenu ${monthsLogged} mois sur ${monthNumber}. C'est le marché qui est en retard, pas vous — et c'est dans ces mois-là que le DCA achète le plus de parts.`;
    }
    return `Vous êtes à ${eur(-delta)} sous votre projection. Une partie vient du marché, une partie des mois non saisis : ${monthsLogged} sur ${monthNumber}.`;
  }

  // Aucun versement enregistré — on le dit, plutôt que de faire passer une
  // projection pour un suivi.
  if (monthNumber <= 1) {
    return "Vous venez de démarrer. Enregistrez votre premier versement pour que ce message compare le réel à la projection dès le mois prochain.";
  }
  const gains = theoreticalValue - monthlyAmount * monthNumber;
  const projection =
    gains > 0
      ? `Sur ${monthNumber} mois, votre plan prévoit environ ${eur(gains)} d'intérêts en plus de vos versements.`
      : `Votre plan porte sur ${monthNumber} mois de versements.`;
  return `${projection} Ce chiffre reste une projection : enregistrez vos versements pour que je puisse le confronter à votre portefeuille réel.`;
}

export async function GET(req: Request) {
  const denied = denyUnlessCron(req);
  if (denied) return denied;

  // ─── Envoi ciblé, pour vérifier le rendu avant l'envoi de masse ───────────
  //
  // Ce gabarit part le 1er du mois, à tous les abonnés, en une seule fois et
  // sans reprise possible. Le livrer sans jamais l'avoir vu rendu dans une
  // vraie boîte mail, c'est parier — les clients mail rendent le HTML
  // différemment, et Gmail découpe les messages trop longs.
  //
  //   curl -H "Authorization: Bearer $CRON_SECRET" \
  //     "https://dcatracker.fr/api/cron/monthly-update?only=vous@exemple.fr"
  //
  // Reste derrière CRON_SECRET : ce n'est pas une porte ouverte, c'est un
  // interrupteur pour l'opérateur du cron.
  const only = new URL(req.url).searchParams.get("only")?.toLowerCase() ?? null;

  const clerk = await clerkClient();
  let sent = 0;
  let errors = 0;
  let skippedOptOut = 0;
  let withRealData = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data: users } = await clerk.users.getUserList({ limit, offset });
    if (!users.length) break;

    for (const user of users) {
      const plan = (user.publicMetadata?.plan as string) ?? "free";
      if (plan === "free") continue;

      // Désinscription lue depuis l'objet utilisateur déjà chargé : aucun appel
      // réseau supplémentaire dans la boucle.
      if (isOptedOutFromMetadata(user.privateMetadata)) {
        skippedOptOut++;
        continue;
      }

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;
      if (only && email.toLowerCase() !== only) continue;

      try {
        const { strategy, entries } = await getStrategyData(user.id);
        if (!strategy) continue;

        const elapsed = monthsElapsed(strategy.startMonth);
        const monthNumber = Math.max(elapsed, 1);
        const theoretical = theoreticalValueAtMonth(strategy.input, monthNumber);

        // Le cœur du correctif : les entrées servent enfin à quelque chose.
        const insights = computeInsights(
          strategy.input,
          strategy.startMonth,
          entries,
        );

        const real = insights
          ? {
              portfolioValue: insights.currentPortfolioValue,
              totalInvested: insights.totalInvested,
              totalGain: insights.totalGain,
              delta: insights.currentPortfolioValue - theoretical,
              monthsLogged: insights.monthsLogged,
              disciplineScore: insights.disciplineScore,
            }
          : null;

        if (real) withRealData++;

        await sendMonthlyUpdate({
          email,
          firstName: user.firstName ?? "Investisseur",
          monthNumber,
          theoreticalValue: theoretical,
          monthlyAmount: strategy.input.monthlyAmount,
          insight: buildInsight(
            monthNumber,
            theoretical,
            strategy.input.monthlyAmount,
            real,
          ),
          real,
        });

        sent++;
      } catch (err) {
        console.error(`[cron] Failed for user ${user.id}:`, err);
        errors++;
      }
    }

    if (users.length < limit) break;
    offset += limit;
  }

  console.log(
    `[cron/monthly-update] sent=${sent} avecDonneesReelles=${withRealData} desinscrits=${skippedOptOut} errors=${errors}`,
  );
  return NextResponse.json({ sent, withRealData, skippedOptOut, errors });
}
