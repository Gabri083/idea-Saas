import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { editorTotals, fetchEditorByToken, fetchVideos } from "@/lib/data";
import { EditorVideoCard } from "@/components/editor-portal/editor-video-card";
import { formatCurrency } from "@/lib/utils";

export default async function EditorPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const editor = await fetchEditorByToken(supabase, token);
  if (!editor) notFound();

  const videos = await fetchVideos(supabase, { editorId: editor.id });
  const totals = editorTotals(editor, videos);

  const active = videos.filter((v) => v.status !== "aprobado" && v.status !== "publicado");
  const finished = videos.filter((v) => v.status === "aprobado" || v.status === "publicado");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm text-slate-500">Hola,</p>
          <h1 className="text-xl font-semibold text-slate-900">{editor.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totals.totalVideos} reel(s) asignados · {formatCurrency(totals.amountOwed)} por
            cobrar
          </p>
        </div>

        <div className="space-y-3">
          {videos.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-400">
              Todavía no tienes reels asignados.
            </p>
          )}
          {active.map((video) => (
            <EditorVideoCard key={video.id} token={token} video={video} />
          ))}
        </div>

        {finished.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500">Aprobados</h2>
            <div className="mt-3 space-y-3">
              {finished.map((video) => (
                <EditorVideoCard key={video.id} token={token} video={video} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
