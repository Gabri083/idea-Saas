import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/data";
import { DEMO_BUSINESS_ID } from "@/lib/demo";

/**
 * Resolves the business_id for the currently signed-in user via their
 * `profiles` row. Falls back to the fixed demo business when Supabase isn't
 * configured yet, so the dashboard keeps working out of the box.
 * Returns null when Supabase is configured but no one is signed in.
 */
export async function getSessionBusinessId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return DEMO_BUSINESS_ID;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.business_id ?? null;
}

/** Same as getSessionBusinessId, but redirects to /login instead of returning null. */
export async function requireBusinessId(): Promise<string> {
  const businessId = await getSessionBusinessId();
  if (!businessId) redirect("/login");
  return businessId;
}
