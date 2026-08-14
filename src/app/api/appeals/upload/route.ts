import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { getSessionBusinessId } from "@/lib/auth";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

/** Uploads appeal evidence to the private `appeal-evidence` Storage bucket,
 * under `${business_id}/...` so the existing storage RLS policies apply. */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "La subida de archivos requiere Supabase configurado." },
      { status: 503 },
    );
  }

  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No se recibieron archivos." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Máximo ${MAX_FILES} archivos.` }, { status: 400 });
  }

  const admin = createAdminClient();
  const paths: string[] = [];

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `"${file.name}" supera los 10MB permitidos.` }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `"${file.name}" no es un tipo de archivo permitido (usa imagen o PDF).` },
        { status: 400 },
      );
    }

    // Build the storage key from a fresh random name + the original
    // extension only — never the raw filename, which can contain spaces,
    // parentheses, accents, etc. that break upload on some storage backends.
    const dotIndex = file.name.lastIndexOf(".");
    const rawExt = dotIndex >= 0 ? file.name.slice(dotIndex) : "";
    const safeExt = rawExt.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
    const path = `${businessId}/${crypto.randomUUID()}${safeExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage
      .from("appeal-evidence")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("appeal evidence upload failed", error);
      return NextResponse.json(
        { error: `No se pudo subir "${file.name}": ${error.message}` },
        { status: 500 },
      );
    }

    paths.push(path);
  }

  return NextResponse.json({ paths });
}
