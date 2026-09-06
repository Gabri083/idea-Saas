"use client";

import { useEffect, useRef } from "react";
import { ReviewForm } from "@/components/review/review-form";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Wraps the real ReviewForm for use inside the /embed/review iframe. The host
 * page (an arbitrary merchant domain) has no way to know this iframe's
 * content height up front — the form grows and shrinks (the nudge banner,
 * the "done" state) — so this posts the measured height to the parent on
 * every change, and widget-submit.js resizes the <iframe> to match. Also
 * posts once the review is actually saved, so a modal/launcher shell can
 * react (e.g. auto-close) without needing to poll the iframe's DOM, which
 * cross-origin script can't read anyway.
 */
export function EmbedReviewShell({
  businessId,
  thanksMessage,
  dict,
  prefillName,
  prefillEmail,
  productName,
}: {
  businessId: string;
  thanksMessage?: string | null;
  dict: Dictionary["publicReview"];
  prefillName?: string;
  prefillEmail?: string;
  productName?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    function postHeight() {
      if (!el) return;
      window.parent.postMessage({ source: "kelsira-embed", type: "resize", height: el.scrollHeight }, "*");
    }

    const observer = new ResizeObserver(postHeight);
    observer.observe(el);
    postHeight();
    return () => observer.disconnect();
  }, []);

  function handleSubmitted() {
    window.parent.postMessage({ source: "kelsira-embed", type: "submitted" }, "*");
  }

  return (
    <div ref={rootRef}>
      <ReviewForm
        businessId={businessId}
        thanksMessage={thanksMessage}
        dict={dict}
        prefillName={prefillName}
        prefillEmail={prefillEmail}
        productName={productName}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}
