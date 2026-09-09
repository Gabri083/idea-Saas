"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, History, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { normalizeIssueKey } from "@/lib/ai/recurring-issues";
import { formatDate } from "@/lib/utils";
import type { CalibrationRequest, RecurringIssue, Review } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function IssueCalibrationCard({
  businessId,
  issue,
  matchedReviews,
  onSubmitted,
  dict,
}: {
  businessId: string;
  issue: RecurringIssue;
  matchedReviews: Review[];
  onSubmitted: (req: CalibrationRequest) => void;
  dict: Dictionary["dashboard"]["calibration"];
}) {
  const [evidence, setEvidence] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/calibration-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          recurring_issue_id: issue.id,
          affected_review_ids: matchedReviews.map((r) => r.id),
          evidence,
          discount_code: discountCode,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onSubmitted(data.calibration_request);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{issue.issue_label}</p>
        <Badge tone="neutral">{dict.associatedReviews.replace("{n}", String(matchedReviews.length))}</Badge>
      </div>

      {status === "done" ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald/30 bg-emerald/[0.06] px-4 py-3 text-sm text-emerald">
          <CheckCircle2 size={16} /> {dict.requestSent}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            required
            minLength={10}
            rows={3}
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder={dict.evidencePlaceholder}
            className="resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />
          <div>
            <input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              maxLength={60}
              placeholder={dict.discountCodePlaceholder}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
            />
            <p className="mt-1.5 text-xs text-muted">{dict.discountCodeHint}</p>
          </div>
          <Button type="submit" size="sm" variant="secondary" className="w-fit" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <>
                <Loader2 size={14} className="animate-spin" /> {dict.submitting}
              </>
            ) : (
              <>
                <History size={14} /> {dict.requestRecalibration}
              </>
            )}
          </Button>
          {status === "error" && <p className="text-xs text-rose">{dict.submitError}</p>}
        </form>
      )}
    </Card>
  );
}

const PAGE_SIZE = 10;

function Pager({
  page,
  totalPages,
  onPrev,
  onNext,
  dict,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  dict: Dictionary["dashboard"]["calibration"];
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-2 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={14} /> {dict.prevPage}
      </button>
      <p className="text-xs text-muted">
        {dict.pageOf.replace("{page}", String(page)).replace("{totalPages}", String(totalPages))}
      </p>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        {dict.nextPage} <ChevronRight size={14} />
      </button>
    </div>
  );
}

export function CalibrationCenter({
  businessId,
  issues,
  reviews,
  initialRequests,
  focusIssueId,
  dict,
}: {
  businessId: string;
  issues: RecurringIssue[];
  reviews: Review[];
  initialRequests: CalibrationRequest[];
  focusIssueId?: string;
  dict: Dictionary["dashboard"]["calibration"];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [issuePage, setIssuePage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const [prevFocusIssueId, setPrevFocusIssueId] = useState(focusIssueId);

  const matchedByIssue = useMemo(() => {
    const map = new Map<string, Review[]>();
    for (const issue of issues) {
      map.set(
        issue.id,
        reviews.filter((r) => r.detected_issues.some((i) => normalizeIssueKey(i) === issue.issue_key)),
      );
    }
    return map;
  }, [issues, reviews]);

  const sortedIssues = focusIssueId
    ? [...issues].sort((a, b) => (a.id === focusIssueId ? -1 : b.id === focusIssueId ? 1 : 0))
    : issues;

  // A focused issue (arrived via ?issueId=) always sorts to the front, so it
  // always lands on page 1 — jump back there whenever the target changes.
  // Adjusted during render (the React-recommended way to reset state when a
  // prop changes), not in an effect, which would cost an extra render pass.
  if (focusIssueId !== prevFocusIssueId) {
    setPrevFocusIssueId(focusIssueId);
    setIssuePage(1);
  }

  const totalIssuePages = Math.max(1, Math.ceil(sortedIssues.length / PAGE_SIZE));
  const paginatedIssues = sortedIssues.slice((issuePage - 1) * PAGE_SIZE, issuePage * PAGE_SIZE);

  const totalRequestPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const paginatedRequests = requests.slice((requestPage - 1) * PAGE_SIZE, requestPage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-4 text-lg font-medium">{dict.historicalIssuesTitle}</h2>
        <div className="flex flex-col gap-4">
          {paginatedIssues.map((issue) => (
            <IssueCalibrationCard
              key={issue.id}
              businessId={businessId}
              issue={issue}
              matchedReviews={matchedByIssue.get(issue.id) ?? []}
              onSubmitted={(req) => setRequests((prev) => [req, ...prev])}
              dict={dict}
            />
          ))}
          {sortedIssues.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted">{dict.noIssues}</Card>
          )}
        </div>
        <Pager
          page={issuePage}
          totalPages={totalIssuePages}
          onPrev={() => setIssuePage((p) => Math.max(1, p - 1))}
          onNext={() => setIssuePage((p) => Math.min(totalIssuePages, p + 1))}
          dict={dict}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">{dict.requestHistoryTitle}</h2>
        <div className="flex flex-col gap-3">
          {requests.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted">{dict.noRequests}</Card>
          )}
          {paginatedRequests.map((req) => (
            <Card key={req.id} className="flex items-start justify-between gap-3 p-5">
              <div>
                <p className="text-sm text-foreground/90">{req.evidence}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(req.requested_at)}</p>
              </div>
              <Badge tone={req.status === "approved" ? "emerald" : req.status === "rejected" ? "rose" : "amber"}>
                {dict.requestStatusLabels[req.status]}
              </Badge>
            </Card>
          ))}
        </div>
        <Pager
          page={requestPage}
          totalPages={totalRequestPages}
          onPrev={() => setRequestPage((p) => Math.max(1, p - 1))}
          onNext={() => setRequestPage((p) => Math.min(totalRequestPages, p + 1))}
          dict={dict}
        />
      </div>
    </div>
  );
}
