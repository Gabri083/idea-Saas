"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyableLink } from "@/components/dashboard/copyable-link";
import { PlatformFlow } from "@/components/dashboard/platform-flow";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { WIDGET_LAYOUT_ORDER, WIDGET_PLACEMENT, type WidgetPlacement } from "@/lib/widget-layouts";
import type { WidgetLayout } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const CATEGORY_ORDER: WidgetPlacement[] = ["page", "product", "sitewide"];
const CATEGORY_TONE: Record<WidgetPlacement, "cobalt" | "amber" | "emerald"> = {
  page: "cobalt",
  product: "amber",
  sitewide: "emerald",
};
const PLATFORMS = ["shopify", "wordpress", "other"] as const;
type Platform = (typeof PLATFORMS)[number];

export function WidgetGuides({
  businessId,
  layoutNames,
  dict,
}: {
  businessId: string;
  layoutNames: Dictionary["dashboard"]["widget"]["layoutOptions"];
  dict: Dictionary["dashboard"]["guides"];
}) {
  const [layout, setLayout] = useState<WidgetLayout>("carousel");
  const [platform, setPlatform] = useState<Platform>("shopify");

  const category = WIDGET_PLACEMENT[layout];
  const snippet = `<script src="${SITE_URL}/widget.js" data-business-id="${businessId}" data-layout="${layout}"></script>`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit p-3">
        <p className="px-2 py-1 text-xs font-medium text-muted">{dict.widgetListTitle}</p>
        <div className="mt-1 flex flex-col gap-4">
          {CATEGORY_ORDER.map((cat) => (
            <div key={cat}>
              <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted/70">
                {dict.categoryLabels[cat]}
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {WIDGET_LAYOUT_ORDER.filter((id) => WIDGET_PLACEMENT[id] === cat).map((id) => (
                  <button
                    key={id}
                    onClick={() => setLayout(id)}
                    className={cn(
                      "rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      layout === id
                        ? "bg-cobalt/10 text-cobalt"
                        : "text-foreground/80 hover:bg-surface-2",
                    )}
                  >
                    {layoutNames[id]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <Card className="min-w-0 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold">{layoutNames[layout]}</p>
            <Badge tone={CATEGORY_TONE[category]}>{dict.categoryLabels[category]}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{dict.widgets[layout]}</p>
          <p className="mt-3 text-xs text-muted">{dict.categoryHint[category]}</p>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted">{dict.snippetHint}</p>
            <CopyableLink value={snippet} copyAria={dict.copyAria} />
          </div>
        </Card>

        <Card className="min-w-0 p-6">
          <div className="flex gap-1.5 rounded-lg border border-border bg-surface p-1">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  platform === p ? "bg-cobalt/15 text-cobalt" : "text-muted hover:text-foreground",
                )}
              >
                {dict.platformTabs[p]}
              </button>
            ))}
          </div>

          {(platform === "shopify" || platform === "wordpress") && (
            <div className="mt-4 flex justify-center rounded-lg border border-border bg-surface p-4">
              <PlatformFlow steps={dict.flow[platform] as [string[], string[], string[], string[]]} />
            </div>
          )}

          <ol className="mt-4 flex flex-col gap-2.5">
            {dict.steps[category][platform].map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cobalt/10 text-[11px] font-medium text-cobalt">
                  {i + 1}
                </span>
                <span className="text-foreground/90">{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
            {dict.notes[category][platform]}
          </p>
        </Card>
      </div>
    </div>
  );
}
