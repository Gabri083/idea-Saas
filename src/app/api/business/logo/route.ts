import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

// Kept small on purpose — this loads on every /review and /resenas visit, so
// a heavy logo would undo the point of keeping those pages fast.
const MAX_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

/** Uploads to the public `business-logos` bucket at a fixed `${business_id}/logo`
 * key (no extension) so re-uploading overwrites in place — the public URL
 * never changes, and there's nothing orphaned to clean up. */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "La subida de logo requiere Supabase configurado." },
      { status: 503 },
    );
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "El logo no puede superar 1MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Usa una imagen PNG, JPG o WEBP." }, { status: 400 });
  }

  const admin = createAdminClient();
  const path = `${businessId}/logo`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("business-logos")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: "No se pudo subir el logo." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("business-logos").getPublicUrl(path);
  // Cache-bust the stable URL so the new logo shows immediately instead of
  // waiting out any CDN/browser cache from the previous upload at this path.
  const logoUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await admin
    .from("businesses")
    .update({ logo_url: logoUrl })
    .eq("id", businessId);

  if (updateError) {
    return NextResponse.json({ error: "El logo se subió pero no se pudo guardar." }, { status: 500 });
  }

  return NextResponse.json({ logo_url: logoUrl });
}
