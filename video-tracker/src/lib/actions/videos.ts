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

export async function createVideosFromLinks(formData: FormData): Promise<number> {
  const raw = String(formData.get("links") ?? "");
  const editorId = String(formData.get("editor_id") ?? "") || null;

  const links = Array.from(
    new Set(
      raw
        .split(/[\n,]/)
        .map((link) => link.trim())
        .filter((link) => /^https?:\/\//i.test(link))
    )
  );

  if (links.length === 0) return 0;

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true });

  if (countError) throw new Error(countError.message);

  const start = (count ?? 0) + 1;
  const rows = links.map((video_url, i) => ({
    reference: `Video #${String(start + i).padStart(3, "0")}`,
    video_url,
    editor_id: editorId,
  }));

  const { error } = await supabase.from("videos").insert(rows);
  if (error) throw new Error(error.message);

  revalidateVideoPaths();
  return links.length;
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
