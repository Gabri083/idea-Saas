import { AlertTriangle, BarChart3, MessageSquareText, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const icons = [BarChart3, MessageSquareText, AlertTriangle, SlidersHorizontal];
// Each mock chip's tag is illustrative sample data, styled per-feature to
// echo where it'd sit in the real dashboard (a score, an "unedited" stamp,
// a report count, a review count) — not meant to read as live figures.
const tagTones = [
  "bg-cobalt/10 text-cobalt",
  "bg-rose/10 text-rose",
  "bg-amber/10 text-amber",
  "bg-cobalt/10 text-cobalt",
];

export function Features({ dict }: { dict: Dictionary["features"] }) {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-bold text-cobalt">{dict.eyebrow}</p>
        <h2 className="text-balance mt-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.title}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{dict.subtitle}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2">
        {dict.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Card key={item.title} className="p-8">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-border bg-background text-cobalt">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted">{item.body}</p>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-foreground px-4 py-3.5">
                <span className="text-[12px] text-background/85">{item.mockLabel}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${tagTones[i]}`}>
                  {item.mockTag}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
