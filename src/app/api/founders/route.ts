import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { FOUNDER_CAP, getFounderStatus, isSupabaseConfigured } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

const RequestSchema = z.object({
  business_name: z.string().min(2).max(120),
  email: z.string().email(),
  platform: z.enum(["shopify", "woocommerce", "other"]),
  // anti-spam signals, invisible to real users — same pattern as the review form.
  website: z.string().max(0).optional().or(z.literal("")),
  started_at: z.number().optional(),
});

const MIN_FILL_TIME_MS = 1500;

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

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, demo: true, sold_out: status.soldOut, remaining: FOUNDER_CAP - 1 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("founder_waitlist")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: t.apiDuplicate }, { status: 409 });
  }

  const { error } = await admin
    .from("founder_waitlist")
    .insert({ business_name, email, platform, locale });

  if (error) {
    console.error("founder_waitlist insert failed", error);
    return NextResponse.json({ error: t.apiSaveFailed }, { status: 500 });
  }

  const updated = await getFounderStatus();
  return NextResponse.json({ ok: true, sold_out: status.soldOut, remaining: updated.remaining });
}
