import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusiness, isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";
import { hasGrowthAccess } from "@/lib/types";

const BodySchema = z.object({
  theme_mode: z.enum(["light", "dark"]),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  border_radius: z.enum(["none", "sm", "md", "lg", "full"]),
  font_family: z.string().min(1).max(60),
  layout: z.enum([
    "carousel",
    "badge",
    "grid",
    "wall",
    "spotlight",
    "sello",
    "mosaico",
    "cinta",
    "lanzador",
    "barra",
    "fila",
    "notificacion",
    "comparador",
    "franja",
    "cierre",
  ]),
  card_style: z.enum(["recibo", "medidor"]),
  show_breakdown: z.boolean(),
  show_branding: z.boolean(),
});

export async function PUT(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Configuración inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const business = await getBusiness(businessId);
  if (!hasGrowthAccess(business.plan)) {
    return NextResponse.json(
      { error: "Personalizar el widget requiere el plan Growth o superior." },
      { status: 403 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, config: { ...parsed.data, business_id: businessId } });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("widget_configs")
    .upsert({ business_id: businessId, ...parsed.data, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar la configuración." }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
