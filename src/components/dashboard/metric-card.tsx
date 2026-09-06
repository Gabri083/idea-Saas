import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "emerald" | "amber" | "cobalt";
}) {
  // Plain, flat icon — no tinted background chip. Color is reserved for
  // actually signaling something (an open alert, a good/bad delta), not
  // decorating every card the same way regardless of what it says.
  const toneClasses = {
    neutral: "text-muted",
    emerald: "text-emerald",
    amber: "text-amber",
    cobalt: "text-cobalt",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Icon size={15} className={cn(toneClasses)} />
        <p className="text-sm text-muted">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
