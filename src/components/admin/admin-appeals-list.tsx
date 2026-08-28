"use client";

import { useState } from "react";
import { Check, X, Loader2, Paperclip, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils";
import type { AdminAppealRow } from "@/lib/admin-data";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { AppealTriageResult } from "@/lib/ai/appeal-triage";

type AdminDict = Dictionary["admin"];

const triageTone = { archive: "rose", reject: "neutral", uncertain: "amber" } as const;

const statusTone = { pending: "amber", approved: "emerald", rejected: "rose" } as const;

function AppealCard({ appeal, dict }: { appeal: AdminAppealRow; dict: AdminDict }) {
  const t = dict.appeals;
  const [status, setStatus] = useState(appeal.status);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<"approved" | "rejected" | null>(null);
  const [triage, setTriage] = useState<AppealTriageResult | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageError, setTriageError] = useState(false);

  async function runTriage() {
    setTriageLoading(true);
    setTriageError(false);
    try {
      const res = await fetch(`/api/admin/appeals/${appeal.id}/triage`, { method: "POST" });
      if (!res.ok) throw new Error();
      setTriage(await res.json());
    } catch {
      setTriageError(true);
    } finally {
      setTriageLoading(false);
    }
  }

  async function resolve(nextStatus: "approved" | "rejected") {
    setPending(nextStatus);
    try {
      const res = await fetch(`/api/admin/appeals/${appeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          resolution_notes: notes || undefined,
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
          <p className="text-sm font-medium">{appeal.business?.name ?? t.businessFallback}</p>
          <p className="text-xs text-muted">{formatDate(appeal.created_at)}</p>
        </div>
        <Badge tone={statusTone[status]}>{dict.status[status]}</Badge>
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
        <span className="font-medium">{t.reasonLabel}</span>
        {appeal.reason}
      </p>

      {appeal.evidence_links.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">{t.evidenceLabel}</span>
          {appeal.evidence_links.map((link, i) =>
            link.url ? (
              <a
                key={link.path}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-cobalt/30 bg-cobalt/10 px-2 py-1 text-xs text-cobalt hover:bg-cobalt/20"
              >
                <Paperclip size={11} /> {t.fileLabel} {i + 1}
              </a>
            ) : (
              <span key={link.path} className="text-xs text-rose">
                {t.linkUnavailable}
              </span>
            ),
          )}
        </div>
      )}

      {status === "pending" ? (
        <div className="mt-4 flex flex-col gap-3">
          {triage ? (
            <div className="rounded-lg border border-cobalt/30 bg-cobalt/[0.05] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={triageTone[triage.recommendation]}>
                  <Sparkles size={11} /> {t.triageRecommendation[triage.recommendation]}
                </Badge>
                <span className="text-xs text-muted">{t.triageConfidence[triage.confidence]}</span>
              </div>
              <p className="mt-2 text-xs text-foreground/80">
                {t.triageReasoningLabel}
                {triage.reasoning}
              </p>
              <p className="mt-1 text-[11px] italic text-muted">{t.triageDisclaimer}</p>
            </div>
          ) : (
            <button
              onClick={runTriage}
              disabled={triageLoading}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-cobalt/30 bg-cobalt/10 px-3 py-1.5 text-xs font-medium text-cobalt transition-colors hover:bg-cobalt/20 disabled:opacity-50"
            >
              {triageLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {triageLoading ? t.triageLoading : t.triageButton}
            </button>
          )}
          {triageError && <p className="text-xs text-rose">{t.triageError}</p>}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            rows={2}
            className="resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => resolve("approved")}
              disabled={pending !== null}
              className={
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 " +
                (triage?.recommendation === "archive"
                  ? "border-rose bg-rose/20 text-rose ring-2 ring-rose/40"
                  : "border-rose/30 bg-rose/10 text-rose hover:bg-rose/20")
              }
            >
              {pending === "approved" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {t.approveFalse}
            </button>
            <button
              onClick={() => resolve("rejected")}
              disabled={pending !== null}
              className={
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 " +
                (triage?.recommendation === "reject"
                  ? "border-foreground/40 bg-surface-2 text-foreground ring-2 ring-foreground/20"
                  : "border-border text-muted hover:bg-surface-2")
              }
            >
              {pending === "rejected" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              {t.reject}
            </button>
          </div>
        </div>
      ) : (
        appeal.resolution_notes && (
          <p className="mt-3 text-xs text-muted">
            {t.noteLabel}
            {appeal.resolution_notes}
          </p>
        )
      )}
    </Card>
  );
}

export function AdminAppealsList({ appeals, dict }: { appeals: AdminAppealRow[]; dict: AdminDict }) {
  if (appeals.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted">{dict.appeals.empty}</Card>;
  }

  return (
    <div className="flex flex-col gap-4">
      {appeals.map((appeal) => (
        <AppealCard key={appeal.id} appeal={appeal} dict={dict} />
      ))}
    </div>
  );
}
