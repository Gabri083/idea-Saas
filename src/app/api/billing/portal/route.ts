import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";
import { getFreshCustomerPortalUrl, isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";

/**
 * Redirects to a freshly-generated Lemon Squeezy customer portal link.
 * Never links to a stored customer_portal_url directly — those are
 * short-lived signed URLs that expire, which is exactly why "Manage
 * subscription" 404s once enough time has passed since the last webhook.
 */
export async function GET(request: NextRequest) {
  const settingsUrl = new URL("/dashboard/settings", request.nextUrl.origin);

  if (!isLemonSqueezyConfigured()) {
    settingsUrl.searchParams.set("portal_error", "not_configured");
    return NextResponse.redirect(settingsUrl);
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  if (!isSupabaseConfigured()) {
    settingsUrl.searchParams.set("portal_error", "not_configured");
    return NextResponse.redirect(settingsUrl);
  }

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("lemonsqueezy_subscription_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business?.lemonsqueezy_subscription_id) {
    settingsUrl.searchParams.set("portal_error", "no_subscription");
    return NextResponse.redirect(settingsUrl);
  }

  const portalUrl = await getFreshCustomerPortalUrl(business.lemonsqueezy_subscription_id);
  if (!portalUrl) {
    settingsUrl.searchParams.set("portal_error", "unavailable");
    return NextResponse.redirect(settingsUrl);
  }

  return NextResponse.redirect(portalUrl);
}
