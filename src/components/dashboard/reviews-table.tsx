"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate, cn } from "@/lib/utils";
import type { Review, ReviewStatus } from "@/lib/types";

const tabs: { key: "all" | ReviewStatus; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "published", label: "Publicadas" },
  { key: "in_appeal", label: "En apelación" },
  { key: "resolved", label: "Resueltas" },
];

const statusTone: Record<ReviewStatus, "neutral" | "emerald" | "amber" | "cobalt"> = {
  published: "cobalt",
  in_appeal: "amber",
  resolved: "emerald",
  archived: "neutral",
};

const statusLabel: Record<ReviewStatus, string> = {
  published: "Publicada",
  in_appeal: "En apelación",
  resolved: "Resuelta",
  archived: "Archivada",
};

export function ReviewsTable({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [tab, setTab] = useState<"all" | ReviewStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (tab === "all" ? reviews : reviews.filter((r) => r.status === tab)),
    [reviews, tab],
  );

  async function updateStatus(id: string, status: ReviewStatus) {
    setPendingId(id);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm transition-colors",
              tab === t.key ? "bg-cobalt/15 text-cobalt" : "text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
            No hay reseñas en esta categoría.
          </p>
        )}

        {filtered.map((review) => {
          const expanded = expandedId === review.id;
          return (
            <div key={review.id} className="rounded-xl border border-border bg-surface">
              <button
                onClick={() => setExpandedId(expanded ? null : review.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{review.customer_name}</p>
                    <span className="text-xs text-muted">{formatDate(review.created_at)}</span>
                    <Badge tone={statusTone[review.status]}>{statusLabel[review.status]}</Badge>
                    {review.penalty_applied > 0 && (
                      <Badge tone="amber">Penalización -{review.penalty_applied}</Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">{review.review_text}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <StarRating value={review.overall_ai_rating} size={14} />
                    <p className="text-sm font-semibold">{review.overall_ai_rating.toFixed(1)}</p>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
                </div>
              </button>

              {expanded && (
                <div className="border-t border-border px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm text-foreground/90">{review.review_text}</p>

                  {review.detected_issues.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.detected_issues.map((issue) => (
                        <Badge key={issue} tone="amber">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/appeals?reviewId=${review.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2"
                    >
                      <ShieldQuestion size={14} /> Apelar reseña
                    </Link>
                    {review.status !== "resolved" && (
                      <button
                        disabled={pendingId === review.id}
                        onClick={() => updateStatus(review.id, "resolved")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald transition-colors hover:bg-emerald/20 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Marcar como resuelto
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
