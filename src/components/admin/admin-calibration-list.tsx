"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { AdminCalibrationRow } from "@/lib/admin-data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type AdminDict = Dictionary["admin"];

const statusTone = { pending: "amber", approved: "emerald", rejected: "rose" } as const;

function CalibrationCard({ request, dict }: { request: AdminCalibrationRow; dict: AdminDict }) {
  const t = dict.calibration;
  const [status, setStatus] = useState(request.status);
  const [pending, setPending] = useState<"approved" | "rejected" | null>(null);

  async function resolve(nextStatus: "approved" | "rejected") {
    setPending(nextStatus);
    try {
      const res = await fetch(`/api/admin/calibration-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
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
          <p className="text-sm font-medium">{request.business?.name ?? t.businessFallback}</p>
          <p className="text-xs text-muted">{formatDate(request.requested_at)}</p>
        </div>
        <Badge tone={statusTone[status]}>{dict.status[status]}</Badge>
      </div>

      {request.recurring_issue && (
        <p className="mt-2 text-sm">
          <span className="font-medium">{t.issueLabel}</span>
          {request.recurring_issue.issue_label} {t.occurrencesLabel(request.recurring_issue.occurrences)}
        </p>
      )}

      <p className="mt-2 text-sm">
        <span className="font-medium">{t.evidenceLabel}</span>
        {request.evidence}
      </p>

      <p className="mt-1 text-xs text-muted">{t.affectedReviews(request.affected_review_ids.length)}</p>

      {status === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => resolve("approved")}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald transition-colors hover:bg-emerald/20 disabled:opacity-50"
          >
            {pending === "approved" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {t.approve}
          </button>
          <button
            onClick={() => resolve("rejected")}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose/30 bg-rose/10 px-3 py-1.5 text-xs font-medium text-rose transition-colors hover:bg-rose/20 disabled:opacity-50"
          >
            {pending === "rejected" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            {t.reject}
          </button>
        </div>
      )}
    </Card>
  );
}

export function AdminCalibrationList({ requests, dict }: { requests: AdminCalibrationRow[]; dict: AdminDict }) {
  if (requests.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted">{dict.calibration.empty}</Card>;
  }

  return (
    <div className="flex flex-col gap-4">
      {requests.map((request) => (
        <CalibrationCard key={request.id} request={request} dict={dict} />
      ))}
    </div>
  );
}
