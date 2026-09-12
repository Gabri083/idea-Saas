import { createClient } from "@/lib/supabase/server";
import { fetchEditors, fetchVideos } from "@/lib/data";
import { VideosFilters } from "@/components/videos/videos-filters";
import { VideosTable } from "@/components/videos/videos-table";
import type { PaymentStatus, VideoStatus } from "@/lib/types";

type SearchParams = {
  editorId?: string;
  status?: string;
  paymentStatus?: string;
  month?: string;
  search?: string;
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [editors, videos] = await Promise.all([
    fetchEditors(supabase),
    fetchVideos(supabase, {
      editorId: params.editorId || undefined,
      status: (params.status as VideoStatus) || undefined,
      paymentStatus: (params.paymentStatus as PaymentStatus) || undefined,
      month: params.month || undefined,
      search: params.search || undefined,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reels</h1>
        <p className="mt-1 text-sm text-slate-500">
          Todos los videos en producción, quién los edita y su estado de pago.
        </p>
      </div>

      <VideosFilters editors={editors} />
      <VideosTable videos={videos} editors={editors} />
    </div>
  );
}
