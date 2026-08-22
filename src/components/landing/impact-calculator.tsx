"use client";

import { useMemo, useState } from "react";
import { Calculator, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const TOTAL_MONTHLY_REVIEWS = 100;
const HAPPY_CUSTOMER_AVERAGE = 4.6; // baseline rating for the rest of your reviews
const UNFAIR_REVIEW_TRADITIONAL_SCORE = 1.0; // what an angry 1-star actually posts today
const UNFAIR_REVIEW_AI_SCORE = 3.7; // what the same review scores once weighted by facts

export function ImpactCalculator({ dict }: { dict: Dictionary["impactCalculator"] }) {
  const [unfairReviews, setUnfairReviews] = useState(12);

  const { averageWithout, averageWith, recovered } = useMemo(() => {
    const fair = TOTAL_MONTHLY_REVIEWS - unfairReviews;
    const without =
      (fair * HAPPY_CUSTOMER_AVERAGE + unfairReviews * UNFAIR_REVIEW_TRADITIONAL_SCORE) /
      TOTAL_MONTHLY_REVIEWS;
    const withAi =
      (fair * HAPPY_CUSTOMER_AVERAGE + unfairReviews * UNFAIR_REVIEW_AI_SCORE) /
      TOTAL_MONTHLY_REVIEWS;

    return {
      averageWithout: without,
      averageWith: withAi,
      recovered: withAi - without,
    };
  }, [unfairReviews]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <Card className="overflow-hidden p-8 sm:p-10">
        <div className="flex items-center gap-2 text-cobalt">
          <Calculator size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">{dict.label}</span>
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{dict.title}</h2>
        <p className="mt-2 max-w-xl text-muted">{dict.body}</p>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{dict.sliderLabel}</span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-foreground">
                {unfairReviews}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={unfairReviews}
              onChange={(e) => setUnfairReviews(Number(e.target.value))}
              className="mt-4 w-full accent-cobalt"
              aria-label={dict.sliderAria}
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>0</span>
              <span>50</span>
            </div>

            <p className="mt-8 text-xs text-muted">
              {dict.assumption
                .replace("{total}", String(TOTAL_MONTHLY_REVIEWS))
                .replace("{avg}", HAPPY_CUSTOMER_AVERAGE.toFixed(1))}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs text-muted">{dict.currentAvgLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-rose">{averageWithout.toFixed(2)}★</p>
              <p className="mt-1 text-xs text-muted">{dict.currentAvgSub}</p>
            </div>
            <div className="rounded-xl border border-emerald/30 bg-emerald/[0.06] p-5">
              <p className="text-xs text-muted">{dict.kelsiraAvgLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-emerald">{averageWith.toFixed(2)}★</p>
              <p className="mt-1 text-xs text-muted">{dict.kelsiraAvgSub}</p>
            </div>
            <div className="col-span-full flex items-center gap-3 rounded-xl border border-cobalt/30 bg-cobalt/[0.06] p-5">
              <Sparkles size={20} className="shrink-0 text-cobalt" />
              <p className="text-sm">
                {dict.recoveredPrefix}{" "}
                <span className="font-semibold text-cobalt">
                  {dict.recoveredHighlight.replace("{n}", recovered.toFixed(2))}
                </span>{" "}
                {dict.recoveredSuffix}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
