"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiScoreCard } from "@/components/review/ai-score-card";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ReviewForm({ businessId, dict }: { businessId: string; dict: Dictionary["publicReview"] }) {
  const [status, setStatus] = useState<"form" | "submitting" | "done" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [gutRating, setGutRating] = useState(0);
  const [review, setReview] = useState<Review | null>(null);
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          customer_name: formData.get("customer_name"),
          customer_email: formData.get("customer_email"),
          review_text: formData.get("review_text"),
          customer_star_rating: gutRating || undefined,
          website: formData.get("website") || "",
          started_at: startedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.unexpectedError);

      setReview(data.review);
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : dict.unexpectedError);
      setStatus("error");
    }
  }

  if (status === "done" && review) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs text-muted">{dict.publishedAsWritten}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
            {review.review_text}
          </p>
          <p className="mt-3 text-xs text-muted">— {review.customer_name}</p>
        </div>

        <AiScoreCard review={review} dict={dict} />
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Honeypot: hidden from real users, bots tend to fill every field. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">{dict.honeypotLabel}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer_name" className="text-sm font-medium">
          {dict.nameLabel}
        </label>
        <input
          id="customer_name"
          name="customer_name"
          required
          maxLength={120}
          placeholder={dict.namePlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer_email" className="text-sm font-medium">
          {dict.emailLabel}
        </label>
        <input
          id="customer_email"
          name="customer_email"
          type="email"
          required
          placeholder={dict.emailPlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
        <p className="text-xs text-muted">{dict.emailHint}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review_text" className="text-sm font-medium">
          {dict.textLabel}
        </label>
        <textarea
          id="review_text"
          name="review_text"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          placeholder={dict.textPlaceholder}
          className="resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          {dict.gutRatingLabel} <span className="text-muted">{dict.gutRatingOptional}</span>
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setGutRating(n === gutRating ? 0 : n)}
              className="p-1"
              aria-label={dict.starAriaLabel.replace("{n}", String(n))}
            >
              <Star
                size={26}
                className={cn(
                  "transition-colors",
                  n <= gutRating ? "fill-amber text-amber" : "text-border hover:text-amber/60",
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">{dict.gutRatingHint}</p>
      </div>

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {errorMessage}
        </div>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> {dict.submitting}
          </>
        ) : (
          <>
            <ShieldCheck size={18} /> {dict.submit}
          </>
        )}
      </Button>
    </form>
  );
}
