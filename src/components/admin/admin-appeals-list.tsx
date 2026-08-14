"use client";

import { useState } from "react";
import { Check, X, Loader2, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils";
import type { AdminAppealRow } from "@/lib/admin-data";

const statusTone = { pending: "amber", approved: "emerald", rejected: "rose" } as const;
const statusLabel = { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada" } as const;

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      {label}
      <input
        type="number"
        min={1}
        max={5}
        step={0.1}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.min(5, Math.max(1, Math.round(n * 10) / 10)));
        }}
        className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none ring-cobalt/40 focus:ring-2"
      />
    </label>
  );
}

function AppealCard({ appeal }: { appeal: AdminAppealRow }) {
  const [status, setStatus] = useState(appeal.status);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<"approved" | "rejected" | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [scores, setScores] = useState({
    product_score: appeal.review?.product_score ?? 3,
    service_score: appeal.review?.service_score ?? 3,
    delivery_score: appeal.review?.delivery_score ?? 3,
  });

  async function resolve(nextStatus: "approved" | "rejected", withCorrection = false) {
    setPending(nextStatus);
    try {
      const res = await fetch(`/api/admin/appeals/${appeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          resolution_notes: notes || undefined,
          corrected_scores: withCorrection ? scores : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus(nextStatus);
    } finally {
      setPending(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{appeal.business?.name ?? "Negocio"}</p>
          <p className="text-xs text-muted">{formatDate(appeal.created_at)}</p>
        </div>
        <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
      </div>

      {appeal.review && (
        <div className="mt-3 rounded-lg bg-surface p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium">{appeal.review.customer_name}</p>
            <StarRating value={appeal.review.overall_ai_rating} size={12} />
            <span className="text-xs text-muted">{appeal.review.overall_ai_rating.toFixed(1)}</span>
          </div>
          <p className="mt-1 text-sm text-foreground/80">{appeal.review.review_text}</p>
        </div>
      )}

      <p className="mt-3 text-sm">
        <span className="font-medium">Motivo de la apelación: </span>
        {appeal.reason}
      </p>

      {appeal.evidence_urls.length > 0 && (
        <p className="mt-1 text-xs text-muted">Evidencia: {appeal.evidence_urls.join(", ")}</p>
      )}

      {status === "pending" ? (
        <div className="mt-4 flex flex-col gap-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nota de resolución (opcional)"
            rows={2}
            className="resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />

          {correcting && (
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-cobalt/30 bg-cobalt/[0.05] p-3">
              <ScoreInput
                label="Producto"
                value={scores.product_score}
                onChange={(v) => setScores((s) => ({ ...s, product_score: v }))}
              />
              <ScoreInput
                label="Atención"
                value={scores.service_score}
                onChange={(v) => setScores((s) => ({ ...s, service_score: v }))}
              />
              <ScoreInput
                label="Envío"
                value={scores.delivery_score}
                onChange={(v) => setScores((s) => ({ ...s, delivery_score: v }))}
              />
              <button
                onClick={() => resolve("approved", true)}
                disabled={pending !== null}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald transition-colors hover:bg-emerald/20 disabled:opacity-50"
              >
                {pending === "approved" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Confirmar puntaje corregido
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => resolve("approved", false)}
              disabled={pending !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose/30 bg-rose/10 px-3 py-1.5 text-xs font-medium text-rose transition-colors hover:bg-rose/20 disabled:opacity-50"
            >
              {pending === "approved" && !correcting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Aprobar: reseña falsa (archivar)
            </button>
            <button
              onClick={() => setCorrecting((v) => !v)}
              disabled={pending !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cobalt/30 bg-cobalt/10 px-3 py-1.5 text-xs font-medium text-cobalt transition-colors hover:bg-cobalt/20 disabled:opacity-50"
            >
              <SlidersHorizontal size={14} />
              Aprobar: reseña real, mal evaluada
            </button>
            <button
              onClick={() => resolve("rejected")}
              disabled={pending !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              {pending === "rejected" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Rechazar apelación
            </button>
          </div>
        </div>
      ) : (
        appeal.resolution_notes && (
          <p className="mt-3 text-xs text-muted">Nota: {appeal.resolution_notes}</p>
        )
      )}
    </Card>
  );
}

export function AdminAppealsList({ appeals }: { appeals: AdminAppealRow[] }) {
  if (appeals.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted">No hay apelaciones todavía.</Card>;
  }

  return (
    <div className="flex flex-col gap-4">
      {appeals.map((appeal) => (
        <AppealCard key={appeal.id} appeal={appeal} />
      ))}
    </div>
  );
}
