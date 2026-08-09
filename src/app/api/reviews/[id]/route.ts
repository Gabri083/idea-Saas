import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const BodySchema = z.object({
  status: z.enum(["published", "in_appeal", "resolved", "archived"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, id, status: parsed.data.status });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar la reseña." }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}
