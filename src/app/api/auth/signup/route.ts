import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";

const BodySchema = z.object({
  business_name: z.string().min(2).max(120),
  full_name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base || "tienda"}-${suffix}`;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "El registro todavía no está disponible: falta configurar Supabase." },
      { status: 503 },
    );
  }

  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa los datos del formulario.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { business_name, full_name, email, password } = parsed.data;
  const admin = createAdminClient();

  const { data: created, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createUserError || !created.user) {
    console.error("signup: createUser failed", createUserError);
    const isDuplicate = createUserError?.message?.toLowerCase().includes("regist");
    const message = isDuplicate
      ? "Ese correo ya tiene una cuenta. Intenta iniciar sesión."
      : `No se pudo crear la cuenta: ${createUserError?.message ?? "error desconocido"}`;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = created.user.id;

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      name: business_name,
      slug: slugify(business_name),
      contact_email: email,
      plan: "starter",
    })
    .select()
    .single();

  if (businessError || !business) {
    console.error("signup: business insert failed", businessError);
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "No se pudo crear tu negocio." }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    business_id: business.id,
    full_name,
    role: "owner",
  });

  if (profileError) {
    console.error("signup: profile insert failed", profileError);
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "No se pudo completar tu registro." }, { status: 500 });
  }

  await admin.from("widget_configs").insert({ business_id: business.id });

  return NextResponse.json({ ok: true, business_id: business.id });
}
