import { createClient } from "@/lib/supabase/server";
import { editorTotals, fetchEditors, fetchVideos } from "@/lib/data";
import { EditorsList } from "@/components/editors/editors-list";

export default async function EditorsPage() {
  const supabase = await createClient();
  const [editors, videos] = await Promise.all([
    fetchEditors(supabase),
    fetchVideos(supabase),
  ]);

  const totals = Object.fromEntries(
    editors.map((editor) => [editor.id, editorTotals(editor, videos)])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Editores</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quiénes editan tus reels, cuánto cobran y cuánto les debes.
        </p>
      </div>

      <EditorsList editors={editors} totals={totals} />
    </div>
  );
}
