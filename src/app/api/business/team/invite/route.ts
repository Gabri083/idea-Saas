import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const BodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Invitar miembros requiere Supabase configurado." },
      { status: 503 },
    );
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const origin = request.nextUrl.origin;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error || !data.user) {
    const alreadyExists = error?.message?.toLowerCase().includes("regist");
    return NextResponse.json(
      { error: alreadyExists ? "Ese correo ya tiene una cuenta." : "No se pudo enviar la invitación." },
      { status: 400 },
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    business_id: businessId,
    role: "staff",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    console.error("team invite: profile insert failed", profileError);
    return NextResponse.json({ error: "No se pudo agregar al equipo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
