import type { SupabaseClient } from "@supabase/supabase-js";

export function normalizeIssueKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

interface RecurringIssueRow {
  id: string;
  issue_key: string;
  status: "open" | "acknowledged" | "resolved";
  resolution_deadline: string;
  occurrences: number;
  penalty_factor: number;
}

/**
 * For each issue detected by the AI in a new review, look up (or create) the
 * matching recurring_issues row for this business. If a matched issue is
 * `open` and past its 30-day resolution_deadline, its penalty_factor is added
 * to the total inaction penalty subtracted from the review's final rating.
 */
export async function syncRecurringIssuesAndGetPenalty(
  admin: SupabaseClient,
  businessId: string,
  detectedIssues: string[],
): Promise<{ penalty: number; penalizedIssueLabels: string[] }> {
  if (detectedIssues.length === 0) return { penalty: 0, penalizedIssueLabels: [] };

  const { data: existing } = await admin
    .from("recurring_issues")
    .select("id, issue_key, status, resolution_deadline, occurrences, penalty_factor")
    .eq("business_id", businessId);

  const existingByKey = new Map<string, RecurringIssueRow>(
    (existing ?? []).map((row) => [row.issue_key, row as RecurringIssueRow]),
  );

  let penalty = 0;
  const penalizedIssueLabels: string[] = [];
  const now = Date.now();

  for (const rawIssue of detectedIssues) {
    const issueKey = normalizeIssueKey(rawIssue);
    if (!issueKey) continue;

    const match = existingByKey.get(issueKey);

    if (!match) {
      await admin.from("recurring_issues").insert({
        business_id: businessId,
        issue_key: issueKey,
        issue_label: rawIssue,
        occurrences: 1,
      });
      continue;
    }

    await admin
      .from("recurring_issues")
      .update({ occurrences: match.occurrences + 1, updated_at: new Date().toISOString() })
      .eq("id", match.id);

    const isPastDeadline = new Date(match.resolution_deadline).getTime() < now;
    if (match.status === "open" && isPastDeadline) {
      penalty += match.penalty_factor;
      penalizedIssueLabels.push(rawIssue);
    }
  }

  return { penalty: Math.round(penalty * 10) / 10, penalizedIssueLabels };
}
