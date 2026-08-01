import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service role key. Bypasses RLS — never import
 * this from a Client Component or expose the key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
