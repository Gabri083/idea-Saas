import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "emerald" | "amber" | "cobalt" | "rose";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  emerald: "bg-emerald/10 text-emerald border-emerald/30",
  amber: "bg-amber/10 text-amber border-amber/30",
  cobalt: "bg-cobalt/10 text-cobalt border-cobalt/30",
  rose: "bg-rose/10 text-rose border-rose/30",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
