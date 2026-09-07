"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const CHUNK_SIZE = 25;

export function RescanReviewsButton({
  reviewIds,
  dict,
}: {
  reviewIds: string[];
  dict: Dictionary["dashboard"]["reviews"]["rescan"];
}) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{ rescored: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!window.confirm(dict.confirm)) return;
    setRunning(true);
    setError(null);
    setResult(null);
    setProgress({ done: 0, total: reviewIds.length });

    let rescored = 0;
    try {
      for (let i = 0; i < reviewIds.length; i += CHUNK_SIZE) {
        const chunk = reviewIds.slice(i, i + CHUNK_SIZE);
        const res = await fetch("/api/reviews/rescan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: chunk }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || dict.error);
        rescored += data.rescored ?? 0;
        setProgress({ done: Math.min(i + CHUNK_SIZE, reviewIds.length), total: reviewIds.length });
      }
      setResult({ rescored, total: reviewIds.length });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.error);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={running || reviewIds.length === 0}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        {running ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        {dict.button}
      </button>
      {running && (
        <p className="text-xs text-muted">{dict.progress.replace("{done}", String(progress.done)).replace("{total}", String(progress.total))}</p>
      )}
      {result && !running && (
        <p className="text-xs text-emerald">{dict.result.replace("{rescored}", String(result.rescored)).replace("{total}", String(result.total))}</p>
      )}
      {error && <p className="text-xs text-rose">{error}</p>}
    </div>
  );
}
