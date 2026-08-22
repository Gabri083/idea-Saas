import Link from "next/link";
import { Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function PlanUsageCard({
  used,
  cap,
  dict,
}: {
  used: number;
  cap: number | null;
  dict: Dictionary["dashboard"]["planUsage"];
}) {
  if (cap == null) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
          <Gauge size={17} />
        </span>
        <div>
          <p className="text-sm font-medium">{dict.unlimitedTitle}</p>
          <p className="text-xs text-muted">{dict.unlimitedSub}</p>
        </div>
      </Card>
    );
  }

  const pct = Math.min(100, Math.round((used / cap) * 100));
  const atCap = used >= cap;
  const nearCap = pct >= 80;
  const barTone = atCap ? "bg-rose" : nearCap ? "bg-amber" : "bg-cobalt";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge size={16} className={cn(atCap ? "text-rose" : nearCap ? "text-amber" : "text-cobalt")} />
          <p className="text-sm font-medium">{dict.usageTitle}</p>
        </div>
        <span className="text-sm text-muted">
          {dict.usageOf.replace("{used}", String(used)).replace("{cap}", String(cap))}
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full transition-all", barTone)} style={{ width: `${pct}%` }} />
      </div>
      {atCap ? (
        <p className="mt-2 text-xs text-rose">
          {dict.atCapText}{" "}
          <Link href="/dashboard/settings" className="underline">
            {dict.atCapCta}
          </Link>
        </p>
      ) : nearCap ? (
        <p className="mt-2 text-xs text-amber">
          {dict.nearCapText}{" "}
          <Link href="/dashboard/settings" className="underline">
            {dict.nearCapCta}
          </Link>
        </p>
      ) : null}
    </Card>
  );
}
