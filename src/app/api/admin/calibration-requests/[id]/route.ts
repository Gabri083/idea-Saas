import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/auth";

const BodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: calibrationRequest } = await admin
    .from("calibration_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!calibrationRequest) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }

  const { status } = parsed.data;

  await admin
    .from("calibration_requests")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (status === "approved") {
    await admin
      .from("recurring_issues")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_evidence: calibrationRequest.evidence,
        updated_at: new Date().toISOString(),
      })
      .eq("id", calibrationRequest.recurring_issue_id);
  }

  return NextResponse.json({ ok: true });
}
