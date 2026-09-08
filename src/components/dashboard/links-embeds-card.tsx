"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CopyableLink } from "@/components/dashboard/copyable-link";
import { SITE_URL } from "@/lib/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const EMBED_STYLES = ["inline", "modal", "lanzador"] as const;
type EmbedStyle = (typeof EMBED_STYLES)[number];

const PREVIEW_MIN_HEIGHT = 120;
const PREVIEW_MAX_HEIGHT = 860;

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
  const [previewHeight, setPreviewHeight] = useState(PREVIEW_MIN_HEIGHT);
  const embedStyleLabels: Record<EmbedStyle, string> = {
    inline: dict.embedStyleInline,
    modal: dict.embedStyleModal,
    lanzador: dict.embedStyleLauncher,
  };
  const embedSnippet = `<script src="${SITE_URL}/widget-submit.js" data-business-id="${businessId}" data-style="${embedStyle}"></script>`;

  // The preview page (embed/preview-submit) reports its real, current
  // document height on load and whenever it changes (a modal/launcher
  // opening, a long custom message) — no fixed guess can be right for
  // "inline" (needs the whole form) and "modal"/"lanzador" (just a small
  // trigger until clicked) at the same time.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || e.data.source !== "kelsira-preview" || e.data.type !== "resize") return;
      const height = Math.min(PREVIEW_MAX_HEIGHT, Math.max(PREVIEW_MIN_HEIGHT, Math.ceil(e.data.height)));
      setPreviewHeight(height);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <Card className="p-5">
      <p className="text-sm font-medium">{dict.linksCardTitle}</p>
      <p className="mt-1 text-xs text-muted">{dict.linksCardSubtitle}</p>

      <div className="mt-4 flex flex-col gap-1">
        <span className="text-xs font-medium text-muted">{dict.publicLinkTitle}</span>
        <CopyableLink path={`/review/${businessId}`} copyAria={dict.copyLinkAria} />
      </div>

      <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
        <span className="text-xs font-medium text-muted">{dict.publicPageTitle}</span>
        <CopyableLink path={`/resenas/${businessId}`} copyAria={dict.copyLinkAria} />
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted">{dict.embedFormTitle}</span>
          <select
            value={embedStyle}
            onChange={(e) => {
              setEmbedStyle(e.target.value as EmbedStyle);
              setPreviewHeight(PREVIEW_MIN_HEIGHT);
            }}
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

        <div className="mt-2 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">{dict.embedPreviewTitle}</span>
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              key={embedStyle}
              src={`/embed/preview-submit/${businessId}?style=${embedStyle}`}
              title={dict.embedPreviewTitle}
              style={{ height: previewHeight }}
              className="w-full transition-[height]"
            />
          </div>
          <p className="text-[11px] text-muted">{dict.embedPreviewHint}</p>
        </div>
      </div>
    </Card>
  );
}
