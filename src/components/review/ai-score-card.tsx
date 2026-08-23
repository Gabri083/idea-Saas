"use client";

import { useState } from "react";
import { ChevronDown, PackageSearch, Headset, Truck, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AiScoreCard({ review, dict }: { review: Review; dict: Dictionary["publicReview"] }) {
  const [open, setOpen] = useState(false);

  const dimensionMeta = [
    { key: "product_score", label: dict.dimensionProduct, icon: PackageSearch },
    { key: "service_score", label: dict.dimensionService, icon: Headset },
    { key: "delivery_score", label: dict.dimensionDelivery, icon: Truck },
  ] as const;

  return (
    <div className="rounded-2xl border border-cobalt/30 bg-cobalt/[0.04] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cobalt">
          <ShieldCheck size={16} />
          <span className="text-xs font-semibold uppercase tracking-wide">{dict.scoreBadge}</span>
        </div>
        {review.penalty_applied > 0 && (
          <Badge tone="amber">{dict.penaltyBadge.replace("{n}", String(review.penalty_applied))}</Badge>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-4xl font-semibold tracking-tight">
          {review.overall_ai_rating.toFixed(1)}
        </span>
        <div>
          <StarRating value={review.overall_ai_rating} size={20} />
          <p className="mt-1 text-xs text-muted">{dict.outOfFive}</p>
        </div>
      </div>

      {review.ai_summary && (
        <p className="mt-4 text-sm text-foreground/80">{review.ai_summary}</p>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-5 flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-2"
      >
        {dict.toggleBreakdown}
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-col gap-3">
              {dimensionMeta.map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg bg-surface px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Icon size={16} className="text-muted" />
                    {label}
                  </div>
                  <StarRating value={review[key]} size={14} />
                </div>
              ))}

              {review.detected_issues.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {review.detected_issues.map((issue) => (
                    <Badge key={issue} tone="amber">
                      {issue}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
