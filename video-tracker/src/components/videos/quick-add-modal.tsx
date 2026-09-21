"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { createVideosFromLinks } from "@/lib/actions/videos";
import type { Editor } from "@/lib/types";

export function QuickAddModal({
  editors,
  onClose,
}: {
  editors: Editor[];
  onClose: () => void;
}) {
  const [linksText, setLinksText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const linkCount = linksText
    .split(/[\n,]/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\//i.test(l)).length;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createVideosFromLinks(formData);
        if (created === 0) {
          setError("No se detectó ningún link válido (debe empezar con http:// o https://)");
          return;
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
        <h2 className="text-base font-semibold text-slate-900">Agregar por link</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pega uno o varios links de Drive (uno por línea). Se crea un reel por
          cada link, con referencia automática — después completas cliente,
          tipo, precio, etc.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <form action={handleSubmit} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="links">Links de Drive</Label>
            <Textarea
              id="links"
              name="links"
              rows={6}
              required
              placeholder={"https://drive.google.com/...\nhttps://drive.google.com/..."}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              {linkCount} link{linkCount === 1 ? "" : "s"} detectado
              {linkCount === 1 ? "" : "s"}
            </p>
          </div>

          <div>
            <Label htmlFor="editor_id">Asignar a (opcional)</Label>
            <Select id="editor_id" name="editor_id" defaultValue="">
              <option value="">Sin asignar</option>
              {editors.map((editor) => (
                <option key={editor.id} value={editor.id}>
                  {editor.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || linkCount === 0}>
              {isPending
                ? "Creando..."
                : `Crear ${linkCount || ""} reel${linkCount === 1 ? "" : "s"}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
