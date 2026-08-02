import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { uuidSchema } from "@/lib/validation";

const BodySchema = z.object({
  business_id: uuidSchema,
  recurring_issue_id: uuidSchema,
  affected_review_ids: z.array(uuidSchema).default([]),
  evidence: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      demo: true,
      calibration_request: {
        id: crypto.randomUUID(),
        ...parsed.data,
        status: "pending",
        requested_at: new Date().toISOString(),
        resolved_at: null,
      },
    });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("calibration_requests")
    .insert(parsed.data)
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
