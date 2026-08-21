import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const BodySchema = z
  .object({
    status: z.enum(["published", "in_appeal", "resolved", "archived"]).optional(),
    business_reply: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((d) => d.status !== undefined || d.business_reply !== undefined, {
    message: "Nada que actualizar.",
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.business_reply !== undefined) {
    const reply = parsed.data.business_reply || null;
    updates.business_reply = reply;
    updates.business_reply_at = reply ? new Date().toISOString() : null;
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, id, ...updates });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .update(updates)
    .eq("id", id)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar la reseña." }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}
