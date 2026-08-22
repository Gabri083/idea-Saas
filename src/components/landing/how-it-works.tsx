import { MessageSquareText, BarChart3, BadgeCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const icons = [MessageSquareText, BarChart3, BadgeCheck];

export function HowItWorks({ dict }: { dict: Dictionary["howItWorks"] }) {
  return (
    <section id="como-funciona" className="border-y border-border/60 bg-surface/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{dict.title}</h2>
          <p className="mt-4 text-muted">{dict.subtitle}</p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-border md:block" />
          {dict.steps.map(({ title, description }, i) => {
            const Icon = icons[i];
            return (
              <div key={title} className="relative flex flex-col items-start">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-background text-cobalt">
                  <Icon size={28} />
                </div>
                <span className="mt-5 text-xs font-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm text-muted">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
