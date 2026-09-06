import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecurringIssue, Review } from "@/lib/types";

export function normalizeIssueKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // strip accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export interface NewRecurringIssue {
  label: string;
  deadline: string;
}

/**
 * For each issue detected by the AI in a new review, look up (or create) the
 * matching recurring_issues row for this business, bumping its occurrence
 * count. No score penalty is computed here anymore — an unresolved pattern
 * shows up as a public "Sin resolver" tag instead (see getReviewIssueTags),
 * never as a silent number change the business only finds out about later.
 */
export async function syncRecurringIssues(
  admin: SupabaseClient,
  businessId: string,
  detectedIssues: string[],
): Promise<{ newIssues: NewRecurringIssue[] }> {
  if (detectedIssues.length === 0) return { newIssues: [] };

  const { data: existing } = await admin
    .from("recurring_issues")
    .select("id, issue_key, occurrences")
    .eq("business_id", businessId);

  const existingByKey = new Map<string, { id: string; occurrences: number }>(
    (existing ?? []).map((row) => [row.issue_key, row]),
  );

  const newIssues: NewRecurringIssue[] = [];

  for (const rawIssue of detectedIssues) {
    const issueKey = normalizeIssueKey(rawIssue);
    if (!issueKey) continue;

    const match = existingByKey.get(issueKey);

    if (!match) {
      const { data: inserted } = await admin
        .from("recurring_issues")
        .insert({
          business_id: businessId,
          issue_key: issueKey,
          issue_label: rawIssue,
          occurrences: 1,
        })
        .select("resolution_deadline")
        .single();

      if (inserted) newIssues.push({ label: rawIssue, deadline: inserted.resolution_deadline });
      continue;
    }

    await admin
      .from("recurring_issues")
      .update({ occurrences: match.occurrences + 1, updated_at: new Date().toISOString() })
      .eq("id", match.id);
  }

  return { newIssues };
}

/** Below this many reports of the same issue, a review stays untagged — a
 * single customer's complaint isn't yet a pattern worth flagging in public. */
export const RECURRING_ISSUE_TAG_THRESHOLD = 3;

export interface ReviewIssueTag {
  label: string;
  status: "unresolved" | "resolved";
  resolvedAt: string | null;
}

/**
 * Maps each review to the recurring-issue tag(s) it should show, if any —
 * one entry per detected issue that (a) this review actually mentions and
 * (b) has been reported by at least RECURRING_ISSUE_TAG_THRESHOLD reviews for
 * this business. Below that count: no tag, regardless of status. At or above
 * it: "unresolved" while the business hasn't fixed it yet, "resolved" once it
 * has (via the Calibration Center) — same badge, just a different state, so
 * a fixed problem never leaves a permanent pile of separate markers behind.
 */
export function getReviewIssueTags(
  reviews: Review[],
  recurringIssues: RecurringIssue[],
): Map<string, ReviewIssueTag[]> {
  const byKey = new Map(recurringIssues.map((issue) => [issue.issue_key, issue]));
  const tagsByReview = new Map<string, ReviewIssueTag[]>();

  for (const review of reviews) {
    const tags: ReviewIssueTag[] = [];
    for (const rawIssue of review.detected_issues) {
      const match = byKey.get(normalizeIssueKey(rawIssue));
      if (!match || match.occurrences < RECURRING_ISSUE_TAG_THRESHOLD) continue;
      tags.push({
        label: match.issue_label,
        status: match.status === "resolved" ? "resolved" : "unresolved",
        resolvedAt: match.resolved_at,
      });
    }
    if (tags.length > 0) tagsByReview.set(review.id, tags);
  }

  return tagsByReview;
}
