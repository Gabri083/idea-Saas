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
  const embedStyleLabels: Record<EmbedStyle, string> = {
    inline: dict.embedStyleInline,
    modal: dict.embedStyleModal,
    lanzador: dict.embedStyleLauncher,
  };
  const embedSnippet = `<script src="${SITE_URL}/widget-submit.js" data-business-id="${businessId}" data-style="${embedStyle}"></script>`;

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
      </div>
    </Card>
  );
}
