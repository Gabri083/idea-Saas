import crypto from "node:crypto";
import type { Plan } from "@/lib/types";

const API_BASE = "https://api.lemonsqueezy.com/v1";

const VARIANT_BY_PLAN: Record<Plan, string | undefined> = {
  starter: process.env.LEMONSQUEEZY_VARIANT_STARTER,
  growth: process.env.LEMONSQUEEZY_VARIANT_GROWTH,
  enterprise: process.env.LEMONSQUEEZY_VARIANT_ENTERPRISE,
};

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_STORE_ID &&
      process.env.LEMONSQUEEZY_VARIANT_STARTER &&
      process.env.LEMONSQUEEZY_VARIANT_GROWTH &&
      process.env.LEMONSQUEEZY_VARIANT_ENTERPRISE,
  );
}

/** Reverse-lookup: which of our plans a Lemon Squeezy variant_id belongs to. */
export function planForVariantId(variantId: string | number): Plan | null {
  const id = String(variantId);
  for (const [plan, variant] of Object.entries(VARIANT_BY_PLAN)) {
    if (variant === id) return plan as Plan;
  }
  return null;
}

/**
 * Creates a Lemon Squeezy hosted checkout for the given plan, tagged with
 * our business_id as custom data so the webhook can tie the purchase back
 * to the right account. Returns the checkout URL to redirect the user to.
 */
export async function createCheckout(params: {
  plan: Plan;
  businessId: string;
  email: string;
  redirectUrl: string;
}): Promise<string> {
  const variantId = VARIANT_BY_PLAN[params.plan];
  if (!variantId) throw new Error(`No hay variant_id configurado para el plan ${params.plan}.`);

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: params.email,
            custom: { business_id: params.businessId },
          },
          product_options: {
            redirect_url: params.redirectUrl,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lemon Squeezy checkout failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy no devolvió una URL de checkout.");
  return url as string;
}

/** Verifies the X-Signature header against the raw request body (HMAC SHA-256). */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signatureHeader, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
