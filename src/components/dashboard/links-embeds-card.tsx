"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CopyableLink } from "@/components/dashboard/copyable-link";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const EMBED_STYLES = ["inline", "modal", "lanzador"] as const;
type EmbedStyle = (typeof EMBED_STYLES)[number];

// "Inline" needs enough room — and the full width — to show real form
// fields; "modal"/"lanzador" only show a small trigger button/bubble by
// default (nothing is open yet), so a box the same size as inline's just
// reads as broken empty space around one small button. Narrower AND
// shorter for those two (see the wrapper's max-w-[280px] below).
const PREVIEW_HEIGHT: Record<EmbedStyle, string> = {
  inline: "h-[300px]",
  modal: "h-[160px]",
  lanzador: "h-[160px]",
};

// Every "how a customer reaches a review" link/snippet in one compact card
// instead of three separate ones — same content as before, just fewer
// repeated card paddings and long subtitles eating vertical space.
export function LinksEmbedsCard({
  businessId,
  businessName,
  dict,
}: {
  businessId: string;
  businessName: string;
  dict: Dictionary["dashboard"]["widget"];
}) {
  const [embedStyle, setEmbedStyle] = useState<EmbedStyle>("inline");
  const [autoOpenEnabled, setAutoOpenEnabled] = useState(false);
  const [autoOpenSeconds, setAutoOpenSeconds] = useState(4);
  const embedStyleLabels: Record<EmbedStyle, string> = {
    inline: dict.embedStyleInline,
    modal: dict.embedStyleModal,
    lanzador: dict.embedStyleLauncher,
  };
  // "Inline" already shows the form with nothing to open — auto-open only
  // means anything for the two styles that start closed.
  const supportsAutoOpen = embedStyle !== "inline";
  const autoOpenActive = supportsAutoOpen && autoOpenEnabled;
  const embedSnippet =
    `<script src="${SITE_URL}/widget-submit.js" data-business-id="${businessId}" data-style="${embedStyle}"` +
    (autoOpenActive ? ` data-auto-open-after="${autoOpenSeconds}"` : "") +
    `></script>`;
  const previewSrc = `/embed/preview-submit/${businessId}?style=${embedStyle}${autoOpenActive ? `&autoOpenAfter=${autoOpenSeconds}` : ""}`;
  // Cosmetic only — same "this is your actual site" framing as the display
  // widget's live preview, not a real domain lookup.
  const previewDomain =
    businessName
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "") + ".com";

  return (
    <Card className="p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{dict.publicLinkTitle}</span>
          <CopyableLink path={`/review/${businessId}`} copyAria={dict.copyLinkAria} />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{dict.publicPageTitle}</span>
          <CopyableLink path={`/resenas/${businessId}`} copyAria={dict.copyLinkAria} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted">{dict.embedFormTitle}</span>
          <select
            value={embedStyle}
            onChange={(e) => setEmbedStyle(e.target.value as EmbedStyle)}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs outline-none ring-cobalt/40 focus:ring-2"
          >
            {EMBED_STYLES.map((s) => (
              <option key={s} value={s}>
                {embedStyleLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <CopyableLink value={embedSnippet} copyAria={dict.embedCopyAria} />
        <p className="text-[11px] text-muted">{dict.embedPrefillHint}</p>

        {supportsAutoOpen && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
            <label className="flex items-center gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={autoOpenEnabled}
                onChange={(e) => setAutoOpenEnabled(e.target.checked)}
              />
              {dict.autoOpenLabel}
            </label>
            {autoOpenEnabled && (
              <div className="flex items-center gap-2 pl-6">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={autoOpenSeconds}
                  onChange={(e) => setAutoOpenSeconds(Math.max(0, Number(e.target.value)))}
                  className="w-16 rounded-lg border border-border bg-surface px-2 py-1 text-xs outline-none ring-cobalt/40 focus:ring-2"
                />
                <span className="text-xs text-muted">{dict.autoOpenSecondsSuffix}</span>
              </div>
            )}
            <p className="pl-6 text-[11px] text-muted">{dict.autoOpenHint}</p>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">{dict.embedPreviewTitle}</span>
          {/* Same "fake browser" framing as the display widget's live preview
              (dots + domain chip) instead of a bare edge-to-edge iframe —
              and a size tailored per style (see PREVIEW_SIZE) so "modal"/
              "lanzador", which only show a small trigger by default, don't
              sit in a sea of empty space the way a one-size-fits-all box did. */}
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-[#e2e4ea] shadow-[0_20px_45px_-30px_rgba(20,30,70,.4)]",
              embedStyle !== "inline" && "mx-auto max-w-[280px]",
            )}
          >
            <div className="flex items-center gap-1.5 border-b border-[#e5e7ec] bg-white px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[#dcdee4]" />
              <span className="h-2 w-2 rounded-full bg-[#dcdee4]" />
              <span className="h-2 w-2 rounded-full bg-[#dcdee4]" />
              <span className="ml-2 truncate rounded-md bg-[#f2f3f6] px-2.5 py-1 font-mono text-[10.5px] text-[#6b6e78]">
                {previewDomain}
              </span>
            </div>
            <iframe
              key={previewSrc}
              src={previewSrc}
              title={dict.embedPreviewTitle}
              className={cn("w-full bg-white", PREVIEW_HEIGHT[embedStyle])}
            />
          </div>
          <p className="text-[11px] text-muted">{dict.embedPreviewHint}</p>
        </div>
      </div>
    </Card>
  );
}
