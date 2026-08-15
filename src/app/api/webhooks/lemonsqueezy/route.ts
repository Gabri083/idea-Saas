import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { verifyWebhookSignature, planForVariantId } from "@/lib/lemonsqueezy";
import { PLAN_REVIEW_CAP } from "@/lib/types";

/**
 * Lemon Squeezy webhook — keeps `businesses.plan` / `subscription_status` in
 * sync with what was actually paid for. Register this URL (…/api/webhooks/
 * lemonsqueezy) in Lemon Squeezy → Settings → Webhooks, subscribed to the
 * subscription_* events, and put its signing secret in
 * LEMONSQUEEZY_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName: string = payload?.meta?.event_name ?? "";
  const businessId: string | undefined = payload?.meta?.custom_data?.business_id;

  if (!eventName.startsWith("subscription_") || !businessId) {
    // Not something we track (e.g. order_created) — acknowledge and ignore.
    return NextResponse.json({ ok: true });
  }

  const attrs = payload?.data?.attributes ?? {};
  const plan = planForVariantId(attrs.variant_id);

  const update: Record<string, unknown> = {
    lemonsqueezy_customer_id: attrs.customer_id != null ? String(attrs.customer_id) : null,
    lemonsqueezy_subscription_id: payload?.data?.id != null ? String(payload.data.id) : null,
    subscription_status: attrs.status ?? null,
    customer_portal_url: attrs.urls?.customer_portal ?? null,
  };

  if (plan) {
    update.plan = plan;
    update.monthly_review_cap = PLAN_REVIEW_CAP[plan];
  }

  const admin = createAdminClient();
  const { error } = await admin.from("businesses").update(update).eq("id", businessId);

  if (error) {
    console.error("lemonsqueezy webhook: failed to update business", error);
    return NextResponse.json({ error: "No se pudo actualizar la suscripción." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
