"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createEditor, updateEditor } from "@/lib/actions/editors";
import type { Editor } from "@/lib/types";

export function EditorFormModal({
  editor,
  onClose,
}: {
  editor: Editor | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(editor);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (editor) {
          await updateEditor(editor.id, formData);
        } else {
          await createEditor(formData);
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold text-slate-900">
          {isEdit ? "Editar editor" : "Nuevo editor"}
        </h2>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <form action={handleSubmit} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" name="name" required defaultValue={editor?.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={editor?.email ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={editor?.phone ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rate_per_video">Tarifa por reel</Label>
              <Input
                id="rate_per_video"
                name="rate_per_video"
                type="number"
                step="0.01"
                min="0"
                defaultValue={editor?.rate_per_video ?? 0}
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Método de pago</Label>
              <Input
                id="payment_method"
                name="payment_method"
                defaultValue={editor?.payment_method ?? ""}
                placeholder="Transferencia, PayPal..."
              />
            </div>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="active"
                defaultChecked={editor?.active ?? true}
              />
              Editor activo
            </label>
          )}

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={editor?.notes ?? ""} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear editor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
