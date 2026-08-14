import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

/** Removes a staff member's access to this business. Never removes the owner. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "No configurado." }, { status: 503 });
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", id)
    .eq("business_id", businessId)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Miembro no encontrado." }, { status: 404 });
  }
  if (profile.role === "owner") {
    return NextResponse.json({ error: "No puedes quitar al dueño del negocio." }, { status: 400 });
  }

  const { error } = await admin.from("profiles").delete().eq("id", id).eq("business_id", businessId);
  if (error) {
    return NextResponse.json({ error: "No se pudo quitar al miembro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
