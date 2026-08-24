import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFounderStatus, isSupabaseConfigured } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";
import { PLAN_REVIEW_CAP } from "@/lib/types";
import { createCheckout, isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";
import { slugify } from "@/lib/utils";

const RequestSchema = z.object({
  business_name: z.string().min(2).max(120),
  full_name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  category: z.enum(["restaurante", "moda_calzado", "belleza", "electronica", "hogar", "salud", "otro"]),
  store_domain: z.string().min(3).max(200),
  platform: z.enum(["shopify", "woocommerce", "other"]),
  plan: z.enum(["starter", "growth", "enterprise"]),
  // anti-spam signals, invisible to real users — same pattern as the review form.
  website: z.string().max(0).optional().or(z.literal("")),
  started_at: z.number().optional(),
});

const MIN_FILL_TIME_MS = 1500;
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** "https://www.MyStore.com/path" -> "mystore.com" — so the same business
 * can't claim several founding spots by reusing its store URL with a
 * different casing, protocol, or trailing path. */
function normalizeDomain(input: string): string | null {
  const stripped = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];
  return DOMAIN_RE.test(stripped) ? stripped : null;
}

/**
 * Creates a real account and sends it straight to a Lemon Squeezy checkout
 * with the Founding Member discount pre-applied — the whole point of this
 * route is "reserve = pay now", not a lead captured for later follow-up.
 */
export async function POST(request: NextRequest) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.founders;

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: t.apiInvalidRequest }, { status: 400 });
  }

  const { business_name, full_name, email, password, category, store_domain, platform, plan, website, started_at } =
    parsed.data;

  if (website) {
    return NextResponse.json({ error: t.apiInvalidRequest }, { status: 400 });
  }
  if (started_at && Date.now() - started_at < MIN_FILL_TIME_MS) {
    return NextResponse.json({ error: t.apiTooFast }, { status: 400 });
  }

  const domain = normalizeDomain(store_domain);
  if (!domain) {
    return NextResponse.json({ error: t.apiInvalidStoreUrl }, { status: 400 });
  }

  const status = await getFounderStatus();
  if (status.soldOut) {
    return NextResponse.json({ error: t.soldOutTitle }, { status: 409 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: t.apiNotConfigured }, { status: 503 });
  }
  if (!isLemonSqueezyConfigured()) {
    return NextResponse.json({ error: t.apiPaymentsNotReady }, { status: 503 });
  }

  const admin = createAdminClient();

  const { data: existingDomain } = await admin
    .from("businesses")
    .select("id")
    .eq("is_founder", true)
    .eq("store_domain", domain)
    .maybeSingle();
  if (existingDomain) {
    return NextResponse.json({ error: t.apiDuplicate }, { status: 409 });
  }

  const { data: created, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createUserError || !created.user) {
    const isDuplicate = createUserError?.message?.toLowerCase().includes("regist");
    return NextResponse.json(
      { error: isDuplicate ? t.apiDuplicate : t.apiSaveFailed },
      { status: isDuplicate ? 409 : 400 },
    );
  }

  const userId = created.user.id;

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      name: business_name,
      slug: slugify(business_name),
      contact_email: email,
      plan: "free",
      monthly_review_cap: PLAN_REVIEW_CAP.free,
      category,
      locale,
      is_founder: true,
      store_domain: domain,
    })
    .select()
    .single();

  if (businessError || !business) {
    console.error("founders/purchase: business insert failed", businessError);
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: t.apiSaveFailed }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    business_id: business.id,
    full_name,
    role: "owner",
  });

  if (profileError) {
    console.error("founders/purchase: profile insert failed", profileError);
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: t.apiSaveFailed }, { status: 500 });
  }

  await admin.from("widget_configs").insert({ business_id: business.id });

  try {
    const checkoutUrl = await createCheckout({
      plan,
      businessId: business.id,
      email,
      redirectUrl: `${request.nextUrl.origin}/dashboard/settings?checkout=success`,
      discountCode: process.env.LEMONSQUEEZY_FOUNDER_DISCOUNT_CODE,
    });
    return NextResponse.json({ ok: true, checkout_url: checkoutUrl });
  } catch (err) {
    // The account exists either way — they can log in and upgrade manually
    // from settings if checkout creation itself is what failed.
    console.error("founders/purchase: createCheckout failed", err, { platform });
    return NextResponse.json({ error: t.apiCheckoutFailed }, { status: 502 });
  }
}
