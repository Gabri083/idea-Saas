import { createAdminClient } from "@/lib/supabase/admin";
import {
  mockAppeals,
  mockBusiness,
  mockCalibrationRequests,
  mockRecurringIssues,
  mockReviews,
  mockWidgetConfig,
} from "@/lib/mock-data";
import type {
  Appeal,
  Business,
  CalibrationRequest,
  RecurringIssue,
  Review,
  WidgetConfig,
} from "@/lib/types";

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
