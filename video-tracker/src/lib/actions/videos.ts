"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus, VideoStatus } from "@/lib/types";

function revalidateVideoPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard/editors");
}

export async function createVideo(formData: FormData) {
  const supabase = await createClient();

  const reference = String(formData.get("reference") ?? "").trim();
  if (!reference) throw new Error("La referencia es obligatoria");

  const editorId = String(formData.get("editor_id") ?? "") || null;
  const priceRaw = String(formData.get("price") ?? "").trim();

  const { error } = await supabase.from("videos").insert({
    reference,
    client_name: String(formData.get("client_name") ?? "").trim() || null,
    platform: String(formData.get("platform") ?? "").trim() || null,
    editor_id: editorId,
    price: priceRaw ? Number(priceRaw) : null,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    due_date: String(formData.get("due_date") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) throw new Error(error.message);

  revalidateVideoPaths();
}

export async function updateVideo(id: string, formData: FormData) {
  const supabase = await createClient();

  const reference = String(formData.get("reference") ?? "").trim();
  if (!reference) throw new Error("La referencia es obligatoria");

  const editorId = String(formData.get("editor_id") ?? "") || null;
  const priceRaw = String(formData.get("price") ?? "").trim();

  const { error } = await supabase
    .from("videos")
    .update({
      reference,
      client_name: String(formData.get("client_name") ?? "").trim() || null,
      platform: String(formData.get("platform") ?? "").trim() || null,
      editor_id: editorId,
      price: priceRaw ? Number(priceRaw) : null,
      video_url: String(formData.get("video_url") ?? "").trim() || null,
      due_date: String(formData.get("due_date") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidateVideoPaths();
}

export async function deleteVideo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateVideoPaths();
}

export async function updateVideoStatus(id: string, status: VideoStatus) {
  const supabase = await createClient();

  const patch: Record<string, unknown> = { status };
  if (status === "en_revision" || status === "aprobado" || status === "publicado") {
    patch.delivered_at = new Date().toISOString();
  }
  if (status === "aprobado" || status === "publicado") {
    patch.approved_at = new Date().toISOString();
  }

  const { error } = await supabase.from("videos").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidateVideoPaths();
}

export async function updateVideoPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus
) {
  const supabase = await createClient();

  const patch: Record<string, unknown> =
    paymentStatus === "pagado"
      ? { payment_status: paymentStatus }
      : { payment_status: paymentStatus, payment_id: null };

  const { error } = await supabase.from("videos").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidateVideoPaths();
}
