"use client";

import { useState } from "react";
import { Paperclip, Loader2, ShieldQuestion, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/types";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

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
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} archivos.`);
      return;
    }
    const tooBig = picked.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      setError(`"${tooBig.name}" supera los 10MB.`);
      return;
    }
    const badType = picked.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (badType) {
      setError(`"${badType.name}" debe ser imagen o PDF.`);
      return;
    }
    setError("");
    setFiles(picked);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewId) return;
    setError("");

    try {
      let evidence_urls: string[] = [];

      if (files.length > 0) {
        setStatus("uploading");
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const uploadRes = await fetch("/api/appeals/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "No se pudo subir la evidencia.");
        evidence_urls = uploadData.paths;
      }

      setStatus("submitting");
      const res = await fetch("/api/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          review_id: reviewId,
          reason,
          evidence_urls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la apelación.");

      setStatus("done");
      onCreated({ reviewId, reason });
      setReason("");
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
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
        {files.length > 0 ? files.map((f) => f.name).join(", ") : "Adjuntar evidencia (imágenes o PDF, máx. 10MB c/u)"}
        <input type="file" multiple accept={ALLOWED_TYPES.join(",")} className="hidden" onChange={handleFileChange} />
      </label>

      {status === "done" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald/30 bg-emerald/[0.06] px-4 py-3 text-sm text-emerald">
          <CheckCircle2 size={16} /> Apelación enviada. La reseña quedó marcada como &ldquo;en apelación&rdquo;.
        </div>
      )}
      {error && <p className="text-sm text-rose">{error}</p>}

      <Button
        type="submit"
        disabled={status === "submitting" || status === "uploading" || !reviewId}
        className="w-fit"
      >
        {status === "uploading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Subiendo evidencia…
          </>
        ) : status === "submitting" ? (
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
