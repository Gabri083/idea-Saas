"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createVideo, updateVideo } from "@/lib/actions/videos";
import type { Editor, VideoWithEditor } from "@/lib/types";

export function VideoFormModal({
  editors,
  video,
  onClose,
}: {
  editors: Editor[];
  video: VideoWithEditor | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(video);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (video) {
          await updateVideo(video.id, formData);
        } else {
          await createVideo(formData);
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold text-slate-900">
          {isEdit ? "Editar reel" : "Nuevo reel"}
        </h2>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <form action={handleSubmit} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="reference">Referencia *</Label>
            <Input
              id="reference"
              name="reference"
              required
              defaultValue={video?.reference}
              placeholder="Reel #045"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="client_name">Cliente / proyecto</Label>
              <Input
                id="client_name"
                name="client_name"
                defaultValue={video?.client_name ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <Input
                id="platform"
                name="platform"
                defaultValue={video?.platform ?? ""}
                placeholder="instagram, tiktok..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="editor_id">Editor asignado</Label>
              <Select id="editor_id" name="editor_id" defaultValue={video?.editor_id ?? ""}>
                <option value="">Sin asignar</option>
                {editors.map((editor) => (
                  <option key={editor.id} value={editor.id}>
                    {editor.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Precio (deja vacío = tarifa del editor)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={video?.price ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="due_date">Fecha límite</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                defaultValue={video?.due_date ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="video_url">Link del video</Label>
              <Input
                id="video_url"
                name="video_url"
                type="url"
                defaultValue={video?.video_url ?? ""}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={video?.notes ?? ""}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear reel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
