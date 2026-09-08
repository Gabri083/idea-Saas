"use client";

import { useEffect, useRef } from "react";

/**
 * Loads widget-submit.js the same way a merchant's own page would — a real
 * <script src> element, appended after hydration into a div React otherwise
 * never touches. Two things that go wrong with the more obvious approaches:
 * a raw <script> tag in server-rendered JSX crashes on hydration (the script
 * inserts DOM nodes React never rendered, so React's reconciliation throws
 * away the mismatch); next/script's afterInteractive strategy dodges that
 * crash but appends to the end of <body> regardless of where in the tree
 * the component sits, landing the widget wherever body happens to be tall
 * that render — nowhere near this container. Building the <script> element
 * by hand and appending it directly into this ref'd div keeps both the
 * correct mount point and document.currentScript (which widget-submit.js
 * relies on) working exactly like a real embed.
 *
 * Deliberately does NOT resize its own <iframe> to match content height —
 * that was tried and made "Inline" (and an open modal/launcher) balloon to
 * the full ~700px height of the real form, dominating the whole dashboard
 * page. This stays a small, fixed-size preview box on purpose; the form
 * itself scrolls internally (see widget-submit.js's dialog/panel
 * max-height + overflow-y:auto) when it doesn't fit.
 */
export function SubmitWidgetMount({ businessId, style }: { businessId: string; style: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "/widget-submit.js";
    script.setAttribute("data-business-id", businessId);
    script.setAttribute("data-style", style);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [businessId, style]);

  return (
    // h-screen + overflow-hidden, not min-h-screen — this page's own content
    // (the trigger button/bubble) never needs to scroll, so this guarantees
    // it never accidentally does (a 1px rounding overflow would otherwise
    // give the iframe its OWN scrollbar right next to the dialog/panel's
    // intentional one, two scrollbars where only one is meant to exist).
    <div className="h-screen overflow-hidden bg-[#f4f4f5] p-4 text-[#18181b]">
      <div ref={containerRef} />
    </div>
  );
}
