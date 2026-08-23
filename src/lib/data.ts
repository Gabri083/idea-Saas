import { createAdminClient } from "@/lib/supabase/admin";
import {
  mockAppeals,
  mockBusiness,
  mockCalibrationRequests,
  mockRecurringIssues,
  mockReviews,
  mockTeamMembers,
  mockWidgetConfig,
} from "@/lib/mock-data";
import type {
  Appeal,
  Business,
  BusinessCategory,
  CalibrationRequest,
  RecurringIssue,
  Review,
  TeamMember,
  WidgetConfig,
} from "@/lib/types";
import { recencyWeightedAverage } from "@/lib/utils";

/** True once real Supabase credentials are wired up; until then every getter
 * below falls back to the demo dataset in lib/mock-data.ts so the dashboard
 * is fully explorable out of the box. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getBusiness(businessId: string): Promise<Business> {
  if (!isSupabaseConfigured()) return mockBusiness;

  const admin = createAdminClient();
  const { data } = await admin.from("businesses").select("*").eq("id", businessId).maybeSingle();
  return (data as Business) ?? mockBusiness;
}

export async function getReviews(businessId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) return mockReviews;

  const admin = createAdminClient();
  const { data } = await admin
    .from("reviews")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  return (data as Review[]) ?? [];
}

export async function getRecurringIssues(businessId: string): Promise<RecurringIssue[]> {
  if (!isSupabaseConfigured()) return mockRecurringIssues;

  const admin = createAdminClient();
  const { data } = await admin
    .from("recurring_issues")
    .select("*")
    .eq("business_id", businessId)
    .order("first_detected_at", { ascending: false });
  return (data as RecurringIssue[]) ?? [];
}

export async function getAppeals(businessId: string): Promise<Appeal[]> {
  if (!isSupabaseConfigured()) return mockAppeals;

  const admin = createAdminClient();
  const { data } = await admin
    .from("appeals")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  return (data as Appeal[]) ?? [];
}

export async function getCalibrationRequests(businessId: string): Promise<CalibrationRequest[]> {
  if (!isSupabaseConfigured()) return mockCalibrationRequests;

  const admin = createAdminClient();
  const { data } = await admin
    .from("calibration_requests")
    .select("*")
    .eq("business_id", businessId)
    .order("requested_at", { ascending: false });
  return (data as CalibrationRequest[]) ?? [];
}

export async function getTeamMembers(businessId: string): Promise<TeamMember[]> {
  if (!isSupabaseConfigured()) return mockTeamMembers;

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (!profiles) return [];

  const members = await Promise.all(
    profiles.map(async (p) => {
      const { data } = await admin.auth.admin.getUserById(p.id);
      return {
        id: p.id,
        full_name: p.full_name,
        role: p.role,
        email: data.user?.email ?? "—",
        created_at: p.created_at,
      } as TeamMember;
    }),
  );

  return members;
}

export type CategoryBenchmark =
  | { available: false }
  | { available: true; average: number; businessCount: number };

/** Below this many qualifying peer businesses, an "industry average" would
 * really just be naming one or two specific competitors — not a benchmark. */
const MIN_PEER_BUSINESSES = 3;
/** A business with only a couple of reviews shouldn't be able to swing the
 * category average as much as one with a real track record. */
const MIN_REVIEWS_PER_PEER = 5;

/**
 * Compares a business against others in the same category, using each peer's
 * own recency-weighted AI average (never raw stars — that would be comparing
 * apples to oranges across businesses with different moderation policies).
 * Every peer counts equally regardless of review volume, so one very active
 * competitor can't dominate the category number.
 */
export async function getCategoryBenchmark(
  category: BusinessCategory | null,
  excludeBusinessId: string,
): Promise<CategoryBenchmark> {
  if (!category || !isSupabaseConfigured()) return { available: false };

  const admin = createAdminClient();
  const { data: peers } = await admin
    .from("businesses")
    .select("id")
    .eq("category", category)
    .neq("id", excludeBusinessId);

  if (!peers || peers.length < MIN_PEER_BUSINESSES) return { available: false };

  const averages: number[] = [];
  for (const peer of peers) {
    const { data: reviews } = await admin
      .from("reviews")
      .select("overall_ai_rating, created_at")
      .eq("business_id", peer.id)
      .in("status", ["published", "resolved"]);
    if (!reviews || reviews.length < MIN_REVIEWS_PER_PEER) continue;
    averages.push(
      recencyWeightedAverage(reviews as { overall_ai_rating: number; created_at: string }[], (r) => r.overall_ai_rating),
    );
  }

  if (averages.length < MIN_PEER_BUSINESSES) return { available: false };

  const average = averages.reduce((sum, a) => sum + a, 0) / averages.length;
  return { available: true, average, businessCount: averages.length };
}

export async function getWidgetConfig(businessId: string): Promise<WidgetConfig> {
  if (!isSupabaseConfigured()) return mockWidgetConfig;

  const admin = createAdminClient();
  const { data } = await admin
    .from("widget_configs")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();
  return (data as WidgetConfig) ?? mockWidgetConfig;
}

/** Hard cap for the "Founding Member" launch offer — 30% off for 6 months. */
export const FOUNDER_CAP = 40;

export interface FounderStatus {
  cap: number;
  taken: number;
  remaining: number;
  soldOut: boolean;
}

/** A real, verifiable count — never an invented "hurry, almost gone" number. */
export async function getFounderStatus(): Promise<FounderStatus> {
  if (!isSupabaseConfigured()) {
    return { cap: FOUNDER_CAP, taken: 0, remaining: FOUNDER_CAP, soldOut: false };
  }

  const admin = createAdminClient();
  const { count } = await admin.from("founder_waitlist").select("id", { count: "exact", head: true });
  const taken = count ?? 0;
  const remaining = Math.max(0, FOUNDER_CAP - taken);
  return { cap: FOUNDER_CAP, taken, remaining, soldOut: remaining <= 0 };
}
