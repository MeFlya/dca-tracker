import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency = "EUR",
  locale = "fr-FR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits).replace(".", ",")} %`;
}

/**
 * Valeur absolue d'une variation, sans signe — à côté d'une flèche ▲/▼ qui
 * porte déjà le sens. formatPercent(Math.abs(x)) affichait « ▼ +1.18 % » :
 * une baisse annoncée avec un plus (relevé le 28/09/2026 sur /etf/JPNK).
 */
export function formatPercentSansSigne(value: number, digits = 2): string {
  return `${Math.abs(value).toFixed(digits).replace(".", ",")} %`;
}

/**
 * Frais annuels d'un ETF : 0.2 → « 0,20 % », 0.0945 → « 0,0945 % ».
 *
 * Deux décimales au moins, comme les émetteurs les publient ; jusqu'à quatre
 * pour les frais qui en ont (SPY). Avant le 28/09/2026, les fiches ETF,
 * /comparer-etf et /meilleurs-etf-debutants affichaient « TER 0.2 % » —
 * point anglais et zéro manquant — sur les mêmes pages que « 0,43 % » pour
 * une variation de cours.
 */
export function formatTer(ter: number): string {
  return `${ter.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })} %`;
}

export function formatDate(isoString: string, locale = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}
