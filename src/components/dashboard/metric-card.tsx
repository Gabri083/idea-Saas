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
  const toneClasses = {
    neutral: "text-foreground bg-surface-2",
    emerald: "text-emerald bg-emerald/10",
    amber: "text-amber bg-amber/10",
    cobalt: "text-cobalt bg-cobalt/10",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneClasses)}>
          <Icon size={17} />
        </span>
        <p className="text-sm text-muted">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
