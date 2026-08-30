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
 * Only used as a fallback for reviews submitted before per-category ratings
 * existed, where there's nothing more specific to compare. Same value as
 * CATEGORY_CONFIRM_EPSILON below, for the same reason: a full star is a real
 * gap, half a star is ordinary rounding noise, not a correction worth
 * flagging. Mirrored in public/widget.js, which can't import this module. */
const OVERALL_CONFIRM_EPSILON = 1;

/** Same idea, but per category — a full star of disagreement on one specific
 * aspect (product/service/delivery) is a real, meaningful gap; anything
 * under that is ordinary rounding between a coarse 1-5 tap and the AI's own
 * decimal read of the same aspect. */
const CATEGORY_CONFIRM_EPSILON = 1;

/**
 * Is the AI's read effectively the same as what the customer picked? Compares
 * category by category (product/service/delivery) when the customer rated at
 * least one — the fair comparison, since both sides are judging the same
 * specific thing — and falls back to the single overall composite only for
 * older reviews that predate per-category ratings.
 */
export function isConfirmed(review: {
  customer_star_rating: number | null;
  overall_ai_rating: number;
  customer_product_rating?: number | null;
  customer_service_rating?: number | null;
  customer_delivery_rating?: number | null;
  product_score?: number | null;
  service_score?: number | null;
  delivery_score?: number | null;
}): boolean {
  if (review.customer_star_rating == null) return true;

  const categoryPairs: Array<[number | null | undefined, number | null | undefined]> = [
    [review.customer_product_rating, review.product_score],
    [review.customer_service_rating, review.service_score],
    [review.customer_delivery_rating, review.delivery_score],
  ];
  const ratedCategories = categoryPairs.filter(
    (pair): pair is [number, number] => pair[0] != null && pair[1] != null,
  );

  if (ratedCategories.length > 0) {
    return ratedCategories.every(
      ([customerPick, aiScore]) => Math.abs(customerPick - aiScore) < CATEGORY_CONFIRM_EPSILON,
    );
  }

  return Math.abs(review.customer_star_rating - review.overall_ai_rating) < OVERALL_CONFIRM_EPSILON;
}

/** 5 evenly-spaced quality bands, dark-green to red — the same "at a glance"
 * color language most review platforms use, not anything proprietary. Only
 * used on /resenas (the public reviews page); the embeddable widget keeps
 * using the business's own chosen accent color for its stars instead. */
export const RATING_TIER_COLORS = {
  5: "#16a34a",
  4: "#84cc16",
  3: "#eab308",
  2: "#f97316",
  1: "#ef4444",
} as const;

/** Which of the 5 quality bands a rating falls into, for coloring stars and
 * the ratings-distribution bars on /resenas. */
export function ratingTierColor(value: number): string {
  if (value >= 4.5) return RATING_TIER_COLORS[5];
  if (value >= 3.5) return RATING_TIER_COLORS[4];
  if (value >= 2.5) return RATING_TIER_COLORS[3];
  if (value >= 1.5) return RATING_TIER_COLORS[2];
  return RATING_TIER_COLORS[1];
}
