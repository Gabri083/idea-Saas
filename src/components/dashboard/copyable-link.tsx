"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export function CopyableLink({
  path,
  value,
  copyAria,
}: {
  path?: string;
  // Raw text to copy/show as-is (e.g. an embed <script> tag) instead of the
  // usual ${SITE_URL}${path} link — set exactly one of path/value.
  value?: string;
  copyAria: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = value ?? `${SITE_URL}${path}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2">
      <code suppressHydrationWarning className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-xs text-foreground/90">
        {url}
      </code>
      <button
        onClick={copy}
        className="shrink-0 rounded-md border border-border p-1.5 transition-colors hover:bg-surface-2"
        aria-label={copyAria}
      >
        {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
