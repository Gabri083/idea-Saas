import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Turns a business name into a URL-safe, unique slug (e.g. "Aurora Studio" -> "aurora-studio-a1b2c3"). */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base || "tienda"}-${suffix}`;
}

export function formatDate(iso: string, locale: "es" | "en" = "es"): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function isPastDeadline(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

/** ~6 months: old enough that a review from last year barely moves the
 * needle, without needing a hard cutoff that makes the score jump. */
const RATING_HALF_LIFE_DAYS = 180;

/**
 * Weights each review by how recent it is (exponential decay) so the
 * headline rating reflects how a business is doing lately rather than
 * treating a review from years ago the same as one from yesterday. No
 * review is ever hidden, penalized in isolation, or deleted for this —
 * the full history stays public; only this aggregate number decays.
 */
export function recencyWeightedAverage<T extends { created_at: string }>(
  items: T[],
  getValue: (item: T) => number,
): number {
  if (items.length === 0) return 0;
  const now = Date.now();
  let weightedSum = 0;
  let totalWeight = 0;
  for (const item of items) {
    const ageDays = (now - new Date(item.created_at).getTime()) / 86_400_000;
    const weight = Math.pow(0.5, ageDays / RATING_HALF_LIFE_DAYS);
    weightedSum += getValue(item) * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/** Below this gap between the customer's own star pick and the AI score, the
 * two are treated as "the same" — the AI confirmed the customer's take
 * rather than correcting it, so copy should never read like a correction.
 * Kept wide (half a star) so ordinary decimal rounding never reads as a
 * disagreement — only a real, meaningful gap does. Mirrored in
 * public/widget.js, which can't import this module. */
const CONFIRM_EPSILON = 0.5;

export function isConfirmed(review: { customer_star_rating: number | null; overall_ai_rating: number }): boolean {
  return (
    review.customer_star_rating == null ||
    Math.abs(review.customer_star_rating - review.overall_ai_rating) < CONFIRM_EPSILON
  );
}
