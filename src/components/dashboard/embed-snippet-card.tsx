"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SITE_URL } from "@/lib/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const STYLES = ["inline", "modal", "lanzador"] as const;
type EmbedStyle = (typeof STYLES)[number];

export function EmbedSnippetCard({
  businessId,
  dict,
}: {
  businessId: string;
  dict: Dictionary["dashboard"]["widget"];
}) {
  const [style, setStyle] = useState<EmbedStyle>("inline");
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="${SITE_URL}/widget-submit.js" data-business-id="${businessId}" data-style="${style}"></script>`;

  const styleLabels: Record<EmbedStyle, string> = {
    inline: dict.embedStyleInline,
    modal: dict.embedStyleModal,
    lanzador: dict.embedStyleLauncher,
  };

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-medium">{dict.embedFormTitle}</p>
      <p className="mt-1 text-xs text-muted">{dict.embedFormSubtitle}</p>

      <div className="mt-3 flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted">{dict.embedStyleLabel}</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as EmbedStyle)}
          className="w-fit rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ring-cobalt/40 focus:ring-2"
        >
          {STYLES.map((s) => (
            <option key={s} value={s}>
              {styleLabels[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
        <code suppressHydrationWarning className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-xs text-foreground/90">
          {snippet}
        </code>
        <button
          onClick={copy}
          className="shrink-0 rounded-lg border border-border p-2 transition-colors hover:bg-surface-2"
          aria-label={dict.embedCopyAria}
        >
          {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
        </button>
      </div>

      <p className="mt-2 text-xs text-muted">{dict.embedPrefillHint}</p>
    </Card>
  );
}
