import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { uuidSchema } from "@/lib/validation";

const BodySchema = z.object({
  business_id: uuidSchema,
  theme_mode: z.enum(["light", "dark"]),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  border_radius: z.enum(["none", "sm", "md", "lg", "full"]),
  font_family: z.string().min(1).max(60),
  layout: z.enum(["carousel", "badge", "grid"]),
  show_breakdown: z.boolean(),
});

export async function PUT(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Configuración inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demo: true, config: parsed.data });
  }

  const admin = createAdminClient();
  const { business_id, ...config } = parsed.data;
  const { data, error } = await admin
    .from("widget_configs")
    .upsert({ business_id, ...config, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar la configuración." }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
