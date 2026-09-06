"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiScoreCard } from "@/components/review/ai-score-card";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function StarPicker({
  label,
  value,
  onChange,
  starAriaLabel,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  starAriaLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n === value ? 0 : n)}
            className="p-1"
            aria-label={starAriaLabel.replace("{n}", String(n))}
          >
            <Star
              size={22}
              className={cn(
                "transition-colors",
                n <= value ? "fill-amber text-amber" : "text-border hover:text-amber/60",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({
  businessId,
  thanksMessage,
  dict,
  prefillName,
  prefillEmail,
  productName,
  onSubmitted,
}: {
  businessId: string;
  thanksMessage?: string | null;
  dict: Dictionary["publicReview"];
  // Below: only set by the embeddable review widget (see EmbedReviewShell),
  // which already knows this from the order that triggered it — every other
  // caller (the /review link page) leaves these undefined and gets the exact
  // same form as before.
  prefillName?: string;
  prefillEmail?: string;
  productName?: string;
  onSubmitted?: () => void;
}) {
  const [status, setStatus] = useState<"form" | "submitting" | "done" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [productRating, setProductRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [review, setReview] = useState<Review | null>(null);
  const [startedAt] = useState(() => Date.now());
  // Below this, a review clears the hard minimum but is usually too thin to
  // help the next buyer (e.g. "llegó raro") — nudge once for more detail
  // instead of silently accepting it. Never blocks; one click sends it anyway.
  const NUDGE_THRESHOLD = 30;
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  async function submitReview(formData: FormData) {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          customer_name: formData.get("customer_name"),
          customer_email: formData.get("customer_email"),
          review_text: formData.get("review_text"),
          customer_product_rating: productRating || undefined,
          customer_service_rating: serviceRating || undefined,
          customer_delivery_rating: deliveryRating || undefined,
          website: formData.get("website") || "",
          started_at: startedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.unexpectedError);

      setReview(data.review);
      setStatus("done");
      onSubmitted?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : dict.unexpectedError);
      setStatus("error");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = String(formData.get("review_text") || "").trim();

    if (text.length < NUDGE_THRESHOLD) {
      setPendingFormData(formData);
      return;
    }

    submitReview(formData);
  }

  if (status === "done" && review) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        {thanksMessage && <p className="text-sm text-foreground/90">{thanksMessage}</p>}
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

      {productName && (
        <p className="-mb-1 text-sm font-medium text-cobalt">
          {dict.aboutProductLabel.replace("{product}", productName)}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer_name" className="text-sm font-medium">
          {dict.nameLabel}
        </label>
        <input
          id="customer_name"
          name="customer_name"
          required
          maxLength={120}
          defaultValue={prefillName}
          placeholder={dict.namePlaceholder}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
        {prefillName && <p className="text-xs text-cobalt">{dict.prefillNote}</p>}
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
          defaultValue={prefillEmail}
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
          onChange={() => setPendingFormData(null)}
          className="resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
        />
        {pendingFormData && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-cobalt/30 bg-cobalt/[0.06] px-4 py-3 text-sm">
            <p className="text-foreground/90">{dict.nudgeMessage}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingFormData(null);
                  document.getElementById("review_text")?.focus();
                }}
                className="rounded-lg bg-cobalt px-3 py-1.5 text-xs font-medium text-white hover:bg-cobalt-dim"
              >
                {dict.nudgeAddDetail}
              </button>
              <button
                type="button"
                onClick={() => submitReview(pendingFormData)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
              >
                {dict.nudgeSubmitAnyway}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
        <span className="text-sm font-medium">
          {dict.categoryRatingLabel} <span className="text-muted">{dict.categoryRatingOptional}</span>
        </span>
        <StarPicker
          label={dict.categoryProductLabel}
          value={productRating}
          onChange={setProductRating}
          starAriaLabel={dict.starAriaLabel}
        />
        <StarPicker
          label={dict.categoryServiceLabel}
          value={serviceRating}
          onChange={setServiceRating}
          starAriaLabel={dict.starAriaLabel}
        />
        <StarPicker
          label={dict.categoryDeliveryLabel}
          value={deliveryRating}
          onChange={setDeliveryRating}
          starAriaLabel={dict.starAriaLabel}
        />
        <p className="text-xs text-muted">{dict.categoryRatingHint}</p>
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
