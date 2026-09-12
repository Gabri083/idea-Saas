import type { SupabaseClient } from "@supabase/supabase-js";
import type { Editor, PaymentStatus, VideoStatus, VideoWithEditor } from "@/lib/types";
import { currentMonthRange } from "@/lib/utils";

export function effectivePrice(video: VideoWithEditor) {
  return video.price ?? video.editor?.rate_per_video ?? 0;
}

export async function fetchEditors(supabase: SupabaseClient): Promise<Editor[]> {
  const { data, error } = await supabase
    .from("editors")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchEditorByToken(
  supabase: SupabaseClient,
  token: string
): Promise<Editor | null> {
  const { data, error } = await supabase
    .from("editors")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export type VideoFilters = {
  editorId?: string;
  status?: VideoStatus;
  paymentStatus?: PaymentStatus;
  month?: string;
  search?: string;
};

export async function fetchVideos(
  supabase: SupabaseClient,
  filters: VideoFilters = {}
): Promise<VideoWithEditor[]> {
  let query = supabase
    .from("videos")
    .select("*, editor:editors(id, name, rate_per_video)")
    .order("created_at", { ascending: false });

  if (filters.editorId) query = query.eq("editor_id", filters.editorId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);
  if (filters.month) {
    const { start, end } = currentMonthRange(filters.month);
    query = query.gte("created_at", start).lt("created_at", end);
  }
  if (filters.search) {
    query = query.or(
      `reference.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as VideoWithEditor[];
}

export function editorTotals(editor: Editor, videos: VideoWithEditor[]) {
  const editorVideos = videos.filter((v) => v.editor_id === editor.id);
  const owed = editorVideos.filter((v) => v.payment_status !== "pagado");
  const paid = editorVideos.filter((v) => v.payment_status === "pagado");

  return {
    totalVideos: editorVideos.length,
    completedVideos: editorVideos.filter((v) =>
      ["aprobado", "publicado"].includes(v.status)
    ).length,
    amountOwed: owed.reduce((sum, v) => sum + effectivePrice(v), 0),
    videosOwedCount: owed.length,
    amountPaid: paid.reduce((sum, v) => sum + effectivePrice(v), 0),
  };
}

export async function fetchDashboardSummary(supabase: SupabaseClient) {
  const { start, end } = currentMonthRange();

  const [{ data: monthVideos, error: monthError }, { data: pendingPay, error: pendingError }, { data: paidThisMonth, error: paidError }] =
    await Promise.all([
      supabase
        .from("videos")
        .select("*, editor:editors(id, name, rate_per_video)")
        .gte("created_at", start)
        .lt("created_at", end),
      supabase
        .from("videos")
        .select("*, editor:editors(id, name, rate_per_video)")
        .in("payment_status", ["no_pagado", "pendiente"]),
      supabase
        .from("payments")
        .select("amount")
        .gte("paid_at", start.slice(0, 10))
        .lt("paid_at", end.slice(0, 10)),
    ]);

  if (monthError) throw new Error(monthError.message);
  if (pendingError) throw new Error(pendingError.message);
  if (paidError) throw new Error(paidError.message);

  const videos = (monthVideos ?? []) as unknown as VideoWithEditor[];
  const pending = (pendingPay ?? []) as unknown as VideoWithEditor[];

  return {
    reelsThisMonth: videos.length,
    completedThisMonth: videos.filter((v) =>
      ["aprobado", "publicado"].includes(v.status)
    ).length,
    amountOwed: pending.reduce((sum, v) => sum + effectivePrice(v), 0),
    videosOwedCount: pending.length,
    paidThisMonth: (paidThisMonth ?? []).reduce((sum, p) => sum + Number(p.amount), 0),
  };
}
