"use client";

import { useState } from "react";
import { AppealForm } from "@/components/dashboard/appeal-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Appeal, AppealStatus, Review } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const statusTone: Record<AppealStatus, "amber" | "emerald" | "rose"> = {
  pending: "amber",
  approved: "emerald",
  rejected: "rose",
};

export function AppealsManager({
  businessId,
  reviews,
  initialAppeals,
  defaultReviewId,
  dict,
}: {
  businessId: string;
  reviews: Review[];
  initialAppeals: Appeal[];
  defaultReviewId?: string;
  dict: Dictionary["dashboard"]["appeals"];
}) {
  const [appeals, setAppeals] = useState(initialAppeals);

  const reviewById = new Map(reviews.map((r) => [r.id, r]));
  const appealableReviews = reviews.filter((r) => r.status !== "resolved" && r.status !== "archived");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-lg font-medium">{dict.newAppealTitle}</h2>
        <p className="mt-1 text-sm text-muted">{dict.newAppealSubtitle}</p>
        <div className="mt-5">
          <AppealForm
            businessId={businessId}
            reviews={appealableReviews}
            defaultReviewId={defaultReviewId}
            dict={dict.form}
            onCreated={({ reviewId, reason }) =>
              setAppeals((prev) => [
                {
                  id: crypto.randomUUID(),
                  business_id: businessId,
                  review_id: reviewId,
                  reason,
                  evidence_urls: [],
                  status: "pending",
                  resolution_notes: null,
                  created_at: new Date().toISOString(),
                  resolved_at: null,
                },
                ...prev,
              ])
            }
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{dict.sentTitle}</h2>
        {appeals.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted">{dict.noneSent}</Card>
        )}
        {appeals.map((appeal) => {
          const review = reviewById.get(appeal.review_id);
          return (
            <Card key={appeal.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {review ? review.customer_name : dict.genericReviewFallback}{" "}
                    <span className="text-xs font-normal text-muted">
                      {formatDate(appeal.created_at)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted">{appeal.reason}</p>
                </div>
                <Badge tone={statusTone[appeal.status]}>{dict.statusLabels[appeal.status]}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
