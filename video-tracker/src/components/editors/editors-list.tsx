"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditorFormModal } from "@/components/editors/editor-form-modal";
import { PortalLink } from "@/components/editors/portal-link";
import { formatCurrency } from "@/lib/utils";
import type { Editor } from "@/lib/types";

type Totals = {
  totalVideos: number;
  completedVideos: number;
  amountOwed: number;
  videosOwedCount: number;
  amountPaid: number;
};

export function EditorsList({
  editors,
  totals,
}: {
  editors: Editor[];
  totals: Record<string, Totals>;
}) {
  const [formState, setFormState] = useState<
    { mode: "create" } | { mode: "edit"; editor: Editor } | null
  >(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{editors.length} editor(es)</p>
        <Button onClick={() => setFormState({ mode: "create" })}>Nuevo editor</Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Editor</th>
              <th className="px-4 py-3 font-medium">Tarifa</th>
              <th className="px-4 py-3 font-medium">Reels</th>
              <th className="px-4 py-3 font-medium">Completados</th>
              <th className="px-4 py-3 font-medium">Por pagar</th>
              <th className="px-4 py-3 font-medium">Pagado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editors.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Aún no has agregado editores.
                </td>
              </tr>
            )}
            {editors.map((editor) => {
              const t = totals[editor.id];
              return (
                <tr key={editor.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/editors/${editor.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {editor.name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-slate-500">{editor.email}</span>
                      {!editor.active && (
                        <Badge className="bg-slate-100 text-slate-500">Inactivo</Badge>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <PortalLink editorId={editor.id} accessToken={editor.access_token} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(editor.rate_per_video)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.totalVideos}</td>
                  <td className="px-4 py-3 text-slate-600">{t.completedVideos}</td>
                  <td className="px-4 py-3">
                    <span className={t.amountOwed > 0 ? "font-medium text-rose-600" : "text-slate-400"}>
                      {formatCurrency(t.amountOwed)}
                    </span>
                    {t.videosOwedCount > 0 && (
                      <span className="ml-1 text-xs text-slate-400">
                        ({t.videosOwedCount})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-emerald-600">
                    {formatCurrency(t.amountPaid)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      className="px-2 py-1 text-xs"
                      onClick={() => setFormState({ mode: "edit", editor })}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formState && (
        <EditorFormModal
          editor={formState.mode === "edit" ? formState.editor : null}
          onClose={() => setFormState(null)}
        />
      )}
    </div>
  );
}
