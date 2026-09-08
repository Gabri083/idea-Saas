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
 */
export function SubmitWidgetMount({ businessId, style }: { businessId: string; style: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  // A fixed preview height guesses wrong for every style at once: "inline"
  // needs room for the whole form, "modal"/"lanzador" only need a small
  // trigger until clicked open. Reporting the real height to whoever embeds
  // this in an <iframe> (see links-embeds-card.tsx) beats guessing.
  useEffect(() => {
    function measure() {
      // getBoundingClientRect on OUR OWN wrapper div, never
      // document.documentElement — the root html/body element is defined to
      // never report shorter than the current viewport, so measuring it
      // would report "at least however tall the iframe already is," and the
      // parent growing the iframe in response only inflates that floor
      // further: a runaway feedback loop that only stops at the max cap.
      // A plain div has no such rule; it sizes to its actual content.
      // +24 for box-shadow bleed on the form's submit button and similar —
      // shadows don't count toward layout size, so without this the very
      // edge of one can end up clipped by the parent's iframe height.
      let height = (wrapperRef.current?.getBoundingClientRect().height ?? 0) + 24;

      // The modal/launcher's dialog and panel are position:fixed, so they
      // don't even factor into the wrapper's own height above — measure
      // them directly, whenever they exist and aren't hidden. Measuring
      // their inner body div (not the dialog/panel element itself, which
      // has its own overflow-y:auto + max-height) sidesteps the same
      // floor-at-current-size risk those scrollable containers could have.
      const dialogBody = document.querySelector<HTMLElement>(".kelsira-submit-dialog-body");
      if (dialogBody && getComputedStyle(dialogBody.closest(".kelsira-submit-overlay") ?? dialogBody).display !== "none") {
        height = Math.max(height, dialogBody.getBoundingClientRect().height + 90);
      }
      const panelBody = document.querySelector<HTMLElement>(".kelsira-submit-panel-body");
      if (panelBody && getComputedStyle(panelBody.closest(".kelsira-submit-panel") ?? panelBody).display !== "none") {
        height = Math.max(height, panelBody.getBoundingClientRect().height + 120);
      }

      return Math.ceil(height);
    }

    // Debounced: several observed mutations can land in the same instant
    // (the inner /embed/review iframe growing in its own couple of resize
    // steps as it settles) — coalesce them into one measurement instead of
    // reporting each intermediate, not-yet-settled number.
    let timer: ReturnType<typeof setTimeout> | null = null;
    function scheduleReport() {
      if (timer != null) clearTimeout(timer);
      timer = setTimeout(() => {
        window.parent.postMessage({ source: "kelsira-preview", type: "resize", height: measure() }, "*");
      }, 120);
    }

    scheduleReport();
    const resizeObserver = new ResizeObserver(scheduleReport);
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

    // Catches the modal/launcher open/close toggle itself (a style.display
    // flip on a position:fixed element, invisible to the ResizeObserver
    // above since it's scoped to the wrapper) and the moment their inner
    // iframe actually mounts.
    const mutationObserver = new MutationObserver(scheduleReport);
    mutationObserver.observe(document.body, { attributes: true, childList: true, subtree: true });

    return () => {
      if (timer != null) clearTimeout(timer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [style]);

  return (
    <div ref={wrapperRef} className="min-h-[70px] bg-[#f4f4f5] p-4 text-[#18181b]">
      <div ref={containerRef} />
    </div>
  );
}
