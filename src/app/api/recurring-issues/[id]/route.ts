import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const BodySchema = z.object({
  status: z.enum(["open", "acknowledged", "resolved"]),
  resolution_evidence: z.string().max(2000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, id, ...parsed.data });
  }

  const admin = createAdminClient();
  const update: Record<string, unknown> = {
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.resolution_evidence) update.resolution_evidence = parsed.data.resolution_evidence;
  if (parsed.data.status === "resolved") update.resolved_at = new Date().toISOString();

  const { data, error } = await admin
    .from("recurring_issues")
    .update(update)
    .eq("id", id)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el problema." }, { status: 500 });
  }

  return NextResponse.json({ recurring_issue: data });
}
