"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { registerPayment } from "@/lib/actions/editors";
import { formatCurrency } from "@/lib/utils";
import type { VideoWithEditor } from "@/lib/types";
import { effectivePrice } from "@/lib/data";

export function BulkPayModal({
  videos,
  onClose,
  onDone,
}: {
  videos: VideoWithEditor[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [method, setMethod] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const withEditor = videos.filter((v) => v.editor_id);
  const withoutEditor = videos.length - withEditor.length;

  const groups = new Map<string, { name: string; videos: VideoWithEditor[]; amount: number }>();
  for (const video of withEditor) {
    const key = video.editor_id as string;
    const group = groups.get(key) ?? {
      name: video.editor?.name ?? "Editor",
      videos: [],
      amount: 0,
    };
    group.videos.push(video);
    group.amount += effectivePrice(video);
    groups.set(key, group);
  }

  const total = Array.from(groups.values()).reduce((sum, g) => sum + g.amount, 0);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        for (const [editorId, group] of groups) {
          await registerPayment(
            editorId,
            group.videos.map((v) => v.id),
            group.amount,
            method || null
          );
        }
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold text-slate-900">
          Registrar pago
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Se creará un pago por editor con los reels seleccionados.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {withoutEditor > 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {withoutEditor} reel(s) sin editor asignado no se incluirán.
          </p>
        )}

        <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {Array.from(groups.values()).map((group) => (
            <li key={group.name} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-slate-700">
                {group.name} · {group.videos.length} reel(s)
              </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(group.amount)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <div className="mt-4">
          <Label htmlFor="method">Método de pago (opcional)</Label>
          <Input
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Transferencia, PayPal..."
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || groups.size === 0}
          >
            {isPending ? "Guardando..." : "Confirmar pago"}
          </Button>
        </div>
      </div>
    </div>
  );
}
