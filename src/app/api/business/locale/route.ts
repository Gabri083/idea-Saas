import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";
import { LOCALES } from "@/lib/i18n/config";

const BodySchema = z.object({ locale: z.enum(LOCALES) });

/**
 * Persists the dashboard owner's language choice on the business record so
 * transactional emails sent to them (appeal results, recurring-issue alerts,
 * plan-cap notices) can match it — those are triggered by requests the owner
 * isn't making (a customer submitting a review, an admin resolving an
 * appeal), so there's no request-scoped locale cookie to read at send time.
 */
export async function PATCH(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true });
  }

  const admin = createAdminClient();
  await admin.from("businesses").update({ locale: parsed.data.locale }).eq("id", businessId);

  return NextResponse.json({ ok: true });
}
