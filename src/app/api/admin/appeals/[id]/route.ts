import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/auth";

const BodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
  resolution_notes: z.string().max(2000).optional(),
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

  const { data: appeal } = await admin.from("appeals").select("*").eq("id", id).maybeSingle();
  if (!appeal) {
    return NextResponse.json({ error: "Apelación no encontrada." }, { status: 404 });
  }

  const { status, resolution_notes } = parsed.data;

  await admin
    .from("appeals")
    .update({
      status,
      resolution_notes: resolution_notes ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Approved: the review was false/unfair, take it down. Rejected: it stands.
  await admin
    .from("reviews")
    .update({ status: status === "approved" ? "archived" : "published" })
    .eq("id", appeal.review_id);

  return NextResponse.json({ ok: true });
}
