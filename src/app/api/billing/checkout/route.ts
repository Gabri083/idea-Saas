import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";
import { createCheckout, isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";

const BodySchema = z.object({
  plan: z.enum(["starter", "growth", "enterprise"]),
});

export async function POST(request: NextRequest) {
  if (!isLemonSqueezyConfigured()) {
    return NextResponse.json(
      { error: "Los pagos todavía no están configurados." },
      { status: 503 },
    );
  }

  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Los pagos requieren Supabase configurado." },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("contact_email")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
  }

  // Founding Member discount: applied automatically when the account's own
  // email matches a founder_waitlist signup — no code to copy or remember.
  let discountCode: string | undefined;
  if (process.env.LEMONSQUEEZY_FOUNDER_DISCOUNT_CODE) {
    const { data: founderEntry } = await admin
      .from("founder_waitlist")
      .select("id")
      .eq("email", business.contact_email)
      .maybeSingle();
    if (founderEntry) discountCode = process.env.LEMONSQUEEZY_FOUNDER_DISCOUNT_CODE;
  }

  try {
    const url = await createCheckout({
      plan: parsed.data.plan,
      businessId,
      email: business.contact_email,
      redirectUrl: `${request.nextUrl.origin}/dashboard/settings?checkout=success`,
      discountCode,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("checkout: createCheckout failed", err);
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 502 });
  }
}
