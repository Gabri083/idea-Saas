import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { editorTotals, fetchEditors, fetchVideos } from "@/lib/data";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { VideosTable } from "@/components/videos/videos-table";
import { PortalLink } from "@/components/editors/portal-link";
import { formatCurrency } from "@/lib/utils";

export default async function EditorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [editors, videos] = await Promise.all([
    fetchEditors(supabase),
    fetchVideos(supabase, { editorId: id }),
  ]);

  const editor = editors.find((e) => e.id === id);
  if (!editor) notFound();

  const totals = editorTotals(editor, videos);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/editors" className="text-sm text-slate-500 hover:text-slate-900">
          ← Editores
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{editor.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {editor.email || "Sin email"} · {editor.phone || "Sin teléfono"} · Tarifa{" "}
              {formatCurrency(editor.rate_per_video)} · {editor.payment_method || "Sin método de pago"}
            </p>
            <div className="mt-2">
              <PortalLink
                editorId={editor.id}
                accessToken={editor.access_token}
                showRegenerate
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Reels totales" value={String(totals.totalVideos)} />
        <SummaryCard label="Completados" value={String(totals.completedVideos)} />
        <SummaryCard
          label="Por pagar"
          value={formatCurrency(totals.amountOwed)}
          hint={`${totals.videosOwedCount} video(s)`}
        />
        <SummaryCard label="Pagado" value={formatCurrency(totals.amountPaid)} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">Reels de {editor.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Selecciona reels y usa &quot;Marcar como pagado&quot; para registrar un pago.
        </p>
        <div className="mt-4">
          <VideosTable videos={videos} editors={editors} />
        </div>
      </div>
    </div>
  );
}
