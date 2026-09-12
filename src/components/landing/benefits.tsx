import { Check, Layers, ShieldCheck, Timer } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const icons = [ShieldCheck, Check, Layers, Timer];

export function Benefits({ dict }: { dict: Dictionary["benefits"] }) {
  return (
    <section id="problema-solucion" className="border-y border-border bg-surface/40 py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold text-cobalt">{dict.eyebrow}</p>
          <h2 className="text-balance mt-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.title}</h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-muted">{dict.subtitle}</p>
        </div>

        <div>
          {dict.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={item.title} className="flex gap-4 border-t border-border py-5 last:border-b">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-cobalt/10 text-cobalt">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
