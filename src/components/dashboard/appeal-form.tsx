"use client";

import { useState } from "react";
import { Paperclip, Loader2, ShieldQuestion, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/types";

export function AppealForm({
  businessId,
  reviews,
  defaultReviewId,
  onCreated,
}: {
  businessId: string;
  reviews: Review[];
  defaultReviewId?: string;
  onCreated: (payload: { reviewId: string; reason: string }) => void;
}) {
  const [reviewId, setReviewId] = useState(defaultReviewId ?? reviews[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewId) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          review_id: reviewId,
          reason,
          evidence_urls: fileNames,
        }),
      });
      if (!res.ok) throw new Error();

      setStatus("done");
      onCreated({ reviewId, reason });
      setReason("");
      setFileNames([]);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Reseña a apelar</label>
        <select
          value={reviewId}
          onChange={(e) => setReviewId(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
        >
          {reviews.map((r) => (
            <option key={r.id} value={r.id}>
              {r.customer_name} — {r.overall_ai_rating.toFixed(1)}★ · {r.review_text.slice(0, 40)}…
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Motivo y evidencia</label>
        <textarea
          required
          minLength={10}
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explica por qué esta reseña es injusta, falsa o difamatoria. Referencia la evidencia adjunta (comprobante de envío, número de seguimiento, chats)."
          className="resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted transition-colors hover:bg-surface-2">
        <Paperclip size={16} />
        {fileNames.length > 0 ? fileNames.join(", ") : "Adjuntar evidencia (comprobantes, capturas de chat)"}
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
        />
      </label>

      {status === "done" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald/30 bg-emerald/[0.06] px-4 py-3 text-sm text-emerald">
          <CheckCircle2 size={16} /> Apelación enviada. La reseña quedó marcada como &ldquo;en apelación&rdquo;.
        </div>
      )}
      {status === "error" && (
        <p className="text-sm text-rose">No se pudo enviar la apelación. Intenta nuevamente.</p>
      )}

      <Button type="submit" disabled={status === "submitting" || !reviewId} className="w-fit">
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Enviando…
          </>
        ) : (
          <>
            <ShieldQuestion size={16} /> Enviar apelación
          </>
        )}
      </Button>
    </form>
  );
}
