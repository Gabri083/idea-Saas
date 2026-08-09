import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const BodySchema = z.object({
  plan: z.enum(["starter", "growth", "enterprise"]),
});

const REVIEW_CAP: Record<string, number | null> = {
  starter: 200,
  growth: null,
  enterprise: null,
};

export async function PATCH(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { plan } = parsed.data;
  const monthly_review_cap = REVIEW_CAP[plan];

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, business: { id: businessId, plan, monthly_review_cap } });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("businesses")
    .update({ plan, monthly_review_cap })
    .eq("id", businessId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo cambiar el plan." }, { status: 500 });
  }

  return NextResponse.json({ business: data });
}
