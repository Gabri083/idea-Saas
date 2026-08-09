import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const BodySchema = z.object({
  name: z.string().min(2).max(120),
  contact_email: z.string().email(),
  category: z.enum(["restaurante", "moda_calzado", "belleza", "electronica", "hogar", "salud", "otro"]),
  business_description: z.string().max(300).optional(),
});

export async function PATCH(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa los datos del formulario.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const payload = {
    ...parsed.data,
    business_description: parsed.data.business_description || null,
  };

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, business: { id: businessId, ...payload } });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("businesses")
    .update(payload)
    .eq("id", businessId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar los cambios." }, { status: 500 });
  }

  return NextResponse.json({ business: data });
}
