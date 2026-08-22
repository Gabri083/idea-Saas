"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Loader2, MessageSquareReply, ShieldQuestion, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate, cn } from "@/lib/utils";
import type { Review, ReviewStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const statusTone: Record<ReviewStatus, "neutral" | "emerald" | "amber" | "cobalt"> = {
  published: "cobalt",
  in_appeal: "amber",
  resolved: "emerald",
  archived: "neutral",
};

export function ReviewsTable({
  initialReviews,
  dict,
  canSuggestReply,
}: {
  initialReviews: Review[];
  dict: Dictionary["dashboard"]["reviews"];
  canSuggestReply: boolean;
}) {
  const tabs: { key: "all" | ReviewStatus; label: string }[] = [
    { key: "all", label: dict.tabs.all },
    { key: "published", label: dict.tabs.published },
    { key: "in_appeal", label: dict.tabs.in_appeal },
    { key: "resolved", label: dict.tabs.resolved },
  ];
  const [reviews, setReviews] = useState(initialReviews);
  const [tab, setTab] = useState<"all" | ReviewStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyEditingId, setReplyEditingId] = useState<string | null>(null);
  const [replySavingId, setReplySavingId] = useState<string | null>(null);
  const [suggestingId, setSuggestingId] = useState<string | null>(null);
  const [suggestErrors, setSuggestErrors] = useState<Record<string, string>>({});

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

  async function submitReply(id: string) {
    const text = (replyDrafts[id] ?? "").trim();
    if (!text) return;
    setReplySavingId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_reply: text }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, business_reply: text, business_reply_at: new Date().toISOString() } : r,
          ),
        );
        setReplyEditingId(null);
      }
    } finally {
      setReplySavingId(null);
    }
  }

  async function suggestReply(id: string) {
    setSuggestingId(id);
    setSuggestErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(`/api/reviews/${id}/suggest-reply`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.suggestError);
      setReplyDrafts((prev) => ({ ...prev, [id]: data.reply }));
    } catch (err) {
      setSuggestErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : dict.suggestError,
      }));
    } finally {
      setSuggestingId(null);
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
            {dict.emptyState}
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
                    <Badge tone={statusTone[review.status]}>{dict.statusLabels[review.status]}</Badge>
                    {review.penalty_applied > 0 && (
                      <Badge tone="amber">{dict.penalty.replace("{n}", String(review.penalty_applied))}</Badge>
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
                      <ShieldQuestion size={14} /> {dict.appealReview}
                    </Link>
                    {review.status !== "resolved" && (
                      <button
                        disabled={pendingId === review.id}
                        onClick={() => updateStatus(review.id, "resolved")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald transition-colors hover:bg-emerald/20 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> {dict.markResolved}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    {review.business_reply && replyEditingId !== review.id ? (
                      <div className="rounded-lg bg-surface-2 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold text-muted">{dict.yourReply}</p>
                          <button
                            onClick={() => {
                              setReplyDrafts((prev) => ({ ...prev, [review.id]: review.business_reply ?? "" }));
                              setReplyEditingId(review.id);
                            }}
                            className="text-xs font-medium text-cobalt hover:underline"
                          >
                            {dict.edit}
                          </button>
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">
                          {review.business_reply}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                            <MessageSquareReply size={14} /> {dict.replyPublicly}
                          </p>
                          {canSuggestReply && (
                            <button
                              type="button"
                              disabled={suggestingId === review.id}
                              onClick={() => suggestReply(review.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-cobalt/30 bg-cobalt/10 px-2.5 py-1 text-xs font-medium text-cobalt transition-colors hover:bg-cobalt/20 disabled:opacity-50"
                            >
                              {suggestingId === review.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Sparkles size={12} />
                              )}
                              {suggestingId === review.id ? dict.suggesting : dict.suggestReply}
                            </button>
                          )}
                        </div>
                        {suggestErrors[review.id] && (
                          <p className="mb-2 text-xs text-rose">{suggestErrors[review.id]}</p>
                        )}
                        <textarea
                          value={replyDrafts[review.id] ?? ""}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                          }
                          maxLength={1000}
                          rows={3}
                          placeholder={dict.replyPlaceholder}
                          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-cobalt/50"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          {review.business_reply && (
                            <button
                              onClick={() => setReplyEditingId(null)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                            >
                              {dict.cancel}
                            </button>
                          )}
                          <button
                            disabled={replySavingId === review.id || !(replyDrafts[review.id] ?? "").trim()}
                            onClick={() => submitReply(review.id)}
                            className="rounded-lg bg-cobalt px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            {dict.postReply}
                          </button>
                        </div>
                      </div>
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
