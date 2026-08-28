import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";

const BodySchema = z.object({
  recurring_issue_id: uuidSchema,
  affected_review_ids: z.array(uuidSchema).default([]),
  evidence: z.string().min(10).max(2000),
  discount_code: z.string().trim().max(60).optional().or(z.literal("")),
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

  const payload = {
    ...parsed.data,
    discount_code: parsed.data.discount_code || null,
    business_id: businessId,
  };

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      calibration_request: {
        id: crypto.randomUUID(),
        ...payload,
        reinvite_sent_at: null,
        status: "pending",
        requested_at: new Date().toISOString(),
        resolved_at: null,
      },
    });
  }

  const admin = createAdminClient();

  const { data: issue } = await admin
    .from("recurring_issues")
    .select("id")
    .eq("id", payload.recurring_issue_id)
    .eq("business_id", businessId)
    .maybeSingle();

  if (!issue) {
    return NextResponse.json({ error: "Problema recurrente no encontrado." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("calibration_requests")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud de calibración." },
      { status: 500 },
    );
  }

  return NextResponse.json({ calibration_request: data });
}
