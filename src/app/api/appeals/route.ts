import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";

const BodySchema = z.object({
  review_id: uuidSchema,
  reason: z.string().min(10).max(2000),
  evidence_urls: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { review_id, reason, evidence_urls } = parsed.data;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      appeal: {
        id: crypto.randomUUID(),
        business_id: businessId,
        review_id,
        reason,
        evidence_urls,
        status: "pending",
        created_at: new Date().toISOString(),
        resolved_at: null,
      },
    });
  }

  const admin = createAdminClient();

  const { data: review } = await admin
    .from("reviews")
    .select("id")
    .eq("id", review_id)
    .eq("business_id", businessId)
    .maybeSingle();

  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 });
  }

  const { data: appeal, error } = await admin
    .from("appeals")
    .insert({ business_id: businessId, review_id, reason, evidence_urls })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo registrar la apelación." }, { status: 500 });
  }

  await admin.from("reviews").update({ status: "in_appeal" }).eq("id", review_id);

  return NextResponse.json({ appeal });
}
