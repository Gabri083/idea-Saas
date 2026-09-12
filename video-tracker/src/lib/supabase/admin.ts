import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses Row Level Security. Only use this on the server, and only for
// flows that do their own authorization check in code — such as the
// editor self-service portal, which authenticates via a secret token
// instead of a Supabase Auth session.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
