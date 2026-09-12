"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const PORTAL_STATUS_MAP = {
  sin_empezar: "pendiente",
  en_proceso: "en_edicion",
  terminado: "en_revision",
} as const;

export type PortalStatus = keyof typeof PORTAL_STATUS_MAP;

export async function updateOwnVideo(
  token: string,
  videoId: string,
  formData: FormData
) {
  const portalStatus = String(formData.get("status") ?? "") as PortalStatus;
  const mappedStatus = PORTAL_STATUS_MAP[portalStatus];
  if (!mappedStatus) throw new Error("Estado inválido");

  const videoUrl = String(formData.get("video_url") ?? "").trim();
  if (mappedStatus === "en_revision" && !videoUrl) {
    throw new Error("Agrega el link del video antes de marcarlo como terminado");
  }

  const supabase = createAdminClient();

  const { data: editor, error: editorError } = await supabase
    .from("editors")
    .select("id")
    .eq("access_token", token)
    .maybeSingle();

  if (editorError) throw new Error(editorError.message);
  if (!editor) throw new Error("Link inválido");

  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("id, editor_id, status")
    .eq("id", videoId)
    .maybeSingle();

  if (videoError) throw new Error(videoError.message);
  if (!video || video.editor_id !== editor.id) {
    throw new Error("No tienes acceso a este reel");
  }
  if (video.status === "aprobado" || video.status === "publicado") {
    throw new Error("Este reel ya fue aprobado y no se puede modificar");
  }

  const patch: Record<string, unknown> = {
    status: mappedStatus,
    video_url: videoUrl || null,
  };
  if (mappedStatus === "en_revision") {
    patch.delivered_at = new Date().toISOString();
  }

  const { error } = await supabase.from("videos").update(patch).eq("id", videoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/e/${token}`);
  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard");
}
