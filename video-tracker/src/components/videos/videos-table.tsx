"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { StatusBadge, PaymentBadge } from "@/components/videos/status-badges";
import { VideoFormModal } from "@/components/videos/video-form-modal";
import { BulkPayModal } from "@/components/videos/bulk-pay-modal";
import { deleteVideo, updateVideoPaymentStatus, updateVideoStatus } from "@/lib/actions/videos";
import { effectivePrice } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUSES, VIDEO_STATUSES } from "@/lib/types";
import type { Editor, PaymentStatus, VideoStatus, VideoWithEditor } from "@/lib/types";

export function VideosTable({
  videos,
  editors,
}: {
  videos: VideoWithEditor[];
  editors: Editor[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formState, setFormState] = useState<
    { mode: "create" } | { mode: "edit"; video: VideoWithEditor } | null
  >(null);
  const [showBulkPay, setShowBulkPay] = useState(false);
  const [, startTransition] = useTransition();

  const allSelected = videos.length > 0 && selected.size === videos.length;

  const selectedVideos = useMemo(
    () => videos.filter((v) => selected.has(v.id)),
    [videos, selected]
  );

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(videos.map((v) => v.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleStatusChange(id: string, status: VideoStatus) {
    startTransition(() => updateVideoStatus(id, status));
  }

  function handlePaymentChange(id: string, status: PaymentStatus) {
    startTransition(() => updateVideoPaymentStatus(id, status));
  }

  function handleDelete(id: string, reference: string) {
    if (!window.confirm(`¿Eliminar "${reference}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    startTransition(() => deleteVideo(id));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {videos.length} reel(s)
          {selected.size > 0 && ` · ${selected.size} seleccionado(s)`}
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="secondary" onClick={() => setShowBulkPay(true)}>
              Marcar como pagado ({selected.size})
            </Button>
          )}
          <Button onClick={() => setFormState({ mode: "create" })}>
            Nuevo reel
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3 font-medium">Referencia</th>
              <th className="px-4 py-3 font-medium">Editor</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Entrega</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {videos.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  No hay reels que coincidan con los filtros.
                </td>
              </tr>
            )}
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(video.id)}
                    onChange={() => toggleOne(video.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{video.reference}</p>
                  <p className="text-xs text-slate-500">
                    {video.client_name ?? "—"}
                    {video.video_url && (
                      <>
                        {" · "}
                        <Link
                          href={video.video_url}
                          target="_blank"
                          className="text-slate-600 underline"
                        >
                          ver video
                        </Link>
                      </>
                    )}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {video.editor?.name ?? "Sin asignar"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={video.status} />
                    <Select
                      aria-label="Cambiar estado"
                      className="w-auto py-1 text-xs"
                      value={video.status}
                      onChange={(e) =>
                        handleStatusChange(video.id, e.target.value as VideoStatus)
                      }
                    >
                      {VIDEO_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PaymentBadge status={video.payment_status} />
                    <Select
                      aria-label="Cambiar estado de pago"
                      className="w-auto py-1 text-xs"
                      value={video.payment_status}
                      onChange={(e) =>
                        handlePaymentChange(video.id, e.target.value as PaymentStatus)
                      }
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatCurrency(effectivePrice(video))}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(video.due_date)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      className="px-2 py-1 text-xs"
                      onClick={() => setFormState({ mode: "edit", video })}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(video.id, video.reference)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formState && (
        <VideoFormModal
          editors={editors}
          video={formState.mode === "edit" ? formState.video : null}
          onClose={() => setFormState(null)}
        />
      )}

      {showBulkPay && (
        <BulkPayModal
          videos={selectedVideos}
          onClose={() => setShowBulkPay(false)}
          onDone={() => {
            setShowBulkPay(false);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
}
