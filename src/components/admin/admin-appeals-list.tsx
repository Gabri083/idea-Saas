"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils";
import type { AdminAppealRow } from "@/lib/admin-data";

const statusTone = { pending: "amber", approved: "emerald", rejected: "rose" } as const;
const statusLabel = { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada" } as const;

function AppealCard({ appeal }: { appeal: AdminAppealRow }) {
  const [status, setStatus] = useState(appeal.status);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<"approved" | "rejected" | null>(null);

  async function resolve(nextStatus: "approved" | "rejected") {
    setPending(nextStatus);
    try {
      const res = await fetch(`/api/admin/appeals/${appeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, resolution_notes: notes || undefined }),
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
        <div className="mt-4 flex flex-col gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nota de resolución (opcional)"
            rows={2}
            className="resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => resolve("approved")}
              disabled={pending !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald transition-colors hover:bg-emerald/20 disabled:opacity-50"
            >
              {pending === "approved" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Aprobar (archiva la reseña)
            </button>
            <button
              onClick={() => resolve("rejected")}
              disabled={pending !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose/30 bg-rose/10 px-3 py-1.5 text-xs font-medium text-rose transition-colors hover:bg-rose/20 disabled:opacity-50"
            >
              {pending === "rejected" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Rechazar (la reseña sigue publicada)
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
