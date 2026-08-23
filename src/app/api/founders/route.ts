import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { FOUNDER_CAP, getFounderStatus, isSupabaseConfigured } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

const RequestSchema = z.object({
  business_name: z.string().min(2).max(120),
  email: z.string().email(),
  // only required while founding spots remain — see the soldOut branch below.
  store_domain: z.string().min(3).max(200).optional(),
  platform: z.enum(["shopify", "woocommerce", "other"]),
  // anti-spam signals, invisible to real users — same pattern as the review form.
  website: z.string().max(0).optional().or(z.literal("")),
  started_at: z.number().optional(),
});

const MIN_FILL_TIME_MS = 1500;
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** "https://www.MyStore.com/path" -> "mystore.com" — so the same business
 * can't grab several founding spots by reusing its store URL with a
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

export async function POST(request: NextRequest) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.founders;

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: t.apiInvalidRequest }, { status: 400 });
  }

  const { business_name, email, platform, website, started_at } = parsed.data;

  if (website) {
    return NextResponse.json({ error: t.apiInvalidRequest }, { status: 400 });
  }
  if (started_at && Date.now() - started_at < MIN_FILL_TIME_MS) {
    return NextResponse.json({ error: t.apiTooFast }, { status: 400 });
  }

  // Past the cap, signups still get recorded (and still see honest copy on
  // the page about which list they're joining) — only the discount
  // eligibility depends on being one of the first 40, never whether the
  // form accepts them at all.
  const status = await getFounderStatus();

  // One of the 40 real spots requires a real, verifiable store domain — a
  // one-line email/name is trivially repeatable. Past the cap this is just
  // a general-interest list, so we don't demand it there.
  let store_domain: string | null = null;
  if (!status.soldOut) {
    store_domain = parsed.data.store_domain ? normalizeDomain(parsed.data.store_domain) : null;
    if (!store_domain) {
      return NextResponse.json({ error: t.apiInvalidStoreUrl }, { status: 400 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, demo: true, sold_out: status.soldOut, remaining: FOUNDER_CAP - 1 });
  }

  const admin = createAdminClient();

  const { data: existingEmail } = await admin
    .from("founder_waitlist")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingEmail) {
    return NextResponse.json({ error: t.apiDuplicate }, { status: 409 });
  }

  if (store_domain) {
    const { data: existingDomain } = await admin
      .from("founder_waitlist")
      .select("id")
      .eq("store_domain", store_domain)
      .maybeSingle();
    if (existingDomain) {
      return NextResponse.json({ error: t.apiDuplicate }, { status: 409 });
    }
  }

  const { error } = await admin
    .from("founder_waitlist")
    .insert({ business_name, email, store_domain, platform, locale });

  if (error) {
    console.error("founder_waitlist insert failed", error);
    return NextResponse.json({ error: t.apiSaveFailed }, { status: 500 });
  }

  const updated = await getFounderStatus();
  return NextResponse.json({ ok: true, sold_out: status.soldOut, remaining: updated.remaining });
}
