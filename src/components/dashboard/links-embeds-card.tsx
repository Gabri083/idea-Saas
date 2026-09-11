"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CopyableLink } from "@/components/dashboard/copyable-link";
import { SITE_URL } from "@/lib/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const EMBED_STYLES = ["inline", "modal", "lanzador"] as const;
type EmbedStyle = (typeof EMBED_STYLES)[number];

// Every "how a customer reaches a review" link/snippet in one compact card
// instead of three separate ones — same content as before, just fewer
// repeated card paddings and long subtitles eating vertical space.
export function LinksEmbedsCard({
  businessId,
  dict,
}: {
  businessId: string;
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
          <div className="overflow-hidden rounded-lg border border-border">
            {/* A fixed, modest size on purpose — not tall enough to show the
                whole form at once, but that's fine: this is a preview of the
                embed STYLE, not a full render of the form, and the form
                scrolls internally (natively for "inline", via widget-submit.js's
                own overflow-y:auto for the modal/launcher) when it doesn't fit. */}
            <iframe
              key={previewSrc}
              src={previewSrc}
              title={dict.embedPreviewTitle}
              className="h-[420px] w-full"
            />
          </div>
          <p className="text-[11px] text-muted">{dict.embedPreviewHint}</p>
        </div>
      </div>
    </Card>
  );
}
