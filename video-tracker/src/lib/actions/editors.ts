"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createEditor(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const { error } = await supabase.from("editors").insert({
    name,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    rate_per_video: Number(formData.get("rate_per_video") ?? 0) || 0,
    payment_method: String(formData.get("payment_method") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/editors");
  revalidatePath("/dashboard/videos");
}

export async function updateEditor(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const { error } = await supabase
    .from("editors")
    .update({
      name,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      rate_per_video: Number(formData.get("rate_per_video") ?? 0) || 0,
      payment_method: String(formData.get("payment_method") ?? "").trim() || null,
      active: formData.get("active") === "on",
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/editors");
  revalidatePath(`/dashboard/editors/${id}`);
  revalidatePath("/dashboard/videos");
}

export async function regenerateEditorToken(id: string) {
  const supabase = await createClient();
  const newToken = crypto.randomUUID();

  const { error } = await supabase
    .from("editors")
    .update({ access_token: newToken })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/editors");
  revalidatePath(`/dashboard/editors/${id}`);

  return newToken;
}

export async function registerPayment(
  editorId: string,
  videoIds: string[],
  amount: number,
  method: string | null
) {
  if (videoIds.length === 0) throw new Error("Selecciona al menos un video");

  const supabase = await createClient();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({ editor_id: editorId, amount, method })
    .select("id")
    .single();

  if (paymentError) throw new Error(paymentError.message);

  const { error: videosError } = await supabase
    .from("videos")
    .update({ payment_status: "pagado", payment_id: payment.id })
    .in("id", videoIds);

  if (videosError) throw new Error(videosError.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/videos");
  revalidatePath("/dashboard/editors");
  revalidatePath(`/dashboard/editors/${editorId}`);
}
