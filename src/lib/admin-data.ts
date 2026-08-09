import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";

export interface AdminAppealRow {
  id: string;
  review_id: string;
  business_id: string;
  reason: string;
  evidence_urls: string[];
  status: "pending" | "approved" | "rejected";
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  business: { name: string } | null;
  review: {
    customer_name: string;
    review_text: string;
    overall_ai_rating: number;
    product_score: number;
    service_score: number;
    delivery_score: number;
  } | null;
}

export interface AdminCalibrationRow {
  id: string;
  business_id: string;
  recurring_issue_id: string;
  affected_review_ids: string[];
  evidence: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  resolved_at: string | null;
  business: { name: string } | null;
  recurring_issue: { issue_label: string; occurrences: number } | null;
}

export async function getAllAppeals(): Promise<AdminAppealRow[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("appeals")
    .select(
      "*, business:businesses(name), review:reviews(customer_name, review_text, overall_ai_rating, product_score, service_score, delivery_score)",
    )
    .order("created_at", { ascending: false });
  return (data as AdminAppealRow[]) ?? [];
}

export async function getAllCalibrationRequests(): Promise<AdminCalibrationRow[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("calibration_requests")
    .select(
      "*, business:businesses(name), recurring_issue:recurring_issues(issue_label, occurrences)",
    )
    .order("requested_at", { ascending: false });
  return (data as AdminCalibrationRow[]) ?? [];
}
