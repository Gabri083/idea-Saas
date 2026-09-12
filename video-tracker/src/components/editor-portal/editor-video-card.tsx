"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { updateOwnVideo, type PortalStatus } from "@/lib/actions/editor-portal";
import { effectivePrice } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { VideoWithEditor } from "@/lib/types";

const PORTAL_STATUSES: { value: PortalStatus; label: string }[] = [
  { value: "sin_empezar", label: "Sin empezar" },
  { value: "en_proceso", label: "En proceso" },
  { value: "terminado", label: "Terminado" },
];

function toPortalStatus(status: VideoWithEditor["status"]): PortalStatus {
  if (status === "pendiente") return "sin_empezar";
  if (status === "en_edicion") return "en_proceso";
  return "terminado";
}

export function EditorVideoCard({
  token,
  video,
}: {
  token: string;
  video: VideoWithEditor;
}) {
  const isFinalized = video.status === "aprobado" || video.status === "publicado";
  const [status, setStatus] = useState<PortalStatus>(toPortalStatus(video.status));
  const [videoUrl, setVideoUrl] = useState(video.video_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateOwnVideo(token, video.id, formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-medium text-slate-900">{video.reference}</p>
      <p className="mt-0.5 text-xs text-slate-500">
        {video.client_name ?? "Sin cliente"} · {formatCurrency(effectivePrice(video))}
        {video.due_date && <> · Entrega: {formatDate(video.due_date)}</>}
      </p>

      {isFinalized ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Aprobado{video.status === "publicado" ? " y publicado" : ""}.
          {video.video_url && (
            <>
              {" "}
              <a href={video.video_url} target="_blank" rel="noreferrer" className="underline">
                Ver video
              </a>
            </>
          )}
        </p>
      ) : (
        <form action={handleSubmit} className="mt-3 space-y-2">
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Select
              name="status"
              aria-label="Estado del reel"
              value={status}
              onChange={(e) => setStatus(e.target.value as PortalStatus)}
              className="w-36"
            >
              {PORTAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Input
              name="video_url"
              type="url"
              placeholder="Link del video (Drive, WeTransfer...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required={status === "terminado"}
              className="min-w-[200px] flex-1"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : saved ? "Guardado ✓" : "Guardar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
