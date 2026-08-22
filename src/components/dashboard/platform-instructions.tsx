"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Platform = "shopify" | "wordpress" | "other";

export function PlatformInstructions({ dict }: { dict: Dictionary["dashboard"]["widget"]["platform"] }) {
  const [platform, setPlatform] = useState<Platform>("shopify");
  const tabs: { id: Platform; label: string }[] = [
    { id: "shopify", label: dict.tabs.shopify },
    { id: "wordpress", label: dict.tabs.wordpress },
    { id: "other", label: dict.tabs.other },
  ];

  return (
    <div>
      <div className="flex gap-1.5 rounded-lg border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPlatform(tab.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              platform === tab.id
                ? "bg-cobalt/15 text-cobalt"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ol className="mt-4 flex flex-col gap-2.5">
        {dict.steps[platform].map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cobalt/10 text-[11px] font-medium text-cobalt">
              {i + 1}
            </span>
            <span className="text-foreground/90">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">{dict.notes[platform]}</p>
    </div>
  );
}
