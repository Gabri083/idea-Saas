"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
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
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-bold text-cobalt">{dict.label}</p>
        <h2 className="text-balance mt-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.title}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{dict.body}</p>
      </div>

      <Card className="mt-10 overflow-hidden p-8 sm:p-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{dict.sliderLabel}</span>
              <span className="text-xl font-bold">{unfairReviews}</span>
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

            <p className="mt-8 text-xs leading-relaxed text-muted">
              {dict.assumption
                .replace("{total}", String(TOTAL_MONTHLY_REVIEWS))
                .replace("{avg}", HAPPY_CUSTOMER_AVERAGE.toFixed(1))}
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4">
              <p className="text-[13px] text-muted">{dict.currentAvgLabel}</p>
              <p className="text-xl font-bold text-rose">{averageWithout.toFixed(2)}★</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4">
              <p className="text-[13px] text-muted">{dict.kelsiraAvgLabel}</p>
              <p className="text-xl font-bold text-emerald">{averageWith.toFixed(2)}★</p>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-cobalt/[0.08] px-5 py-3.5 text-[13.5px]">
              <Sparkles size={16} className="shrink-0 text-cobalt" />
              <p>
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
