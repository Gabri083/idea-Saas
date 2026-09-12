import { LogoMark } from "@/components/brand/logo-mark";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber">
      {"★".repeat(count)}
      <span className="text-border">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export function HowItWorks({ dict }: { dict: Dictionary["howItWorks"] }) {
  return (
    <section id="como-funciona" className="border-y border-border bg-surface/40 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-bold text-cobalt">{dict.title}</p>
          <h2 className="text-balance mt-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.subtitle}</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-7">
            {dict.steps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-foreground text-[13.5px] font-bold text-background">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15.5px] font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_60px_-30px_rgba(20,21,26,0.2)]">
            <div className="flex items-center gap-1.5 border-b border-border bg-surface px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="ml-2 rounded-md border border-border bg-background px-2.5 py-1 text-[10.5px] text-muted">
                yourstore.com
              </span>
              <span className="ml-auto text-[10.5px] text-muted">{dict.showcaseTag}</span>
            </div>

            <div className="p-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-border py-1.5 pl-1.5 pr-4">
                <LogoMark size={26} />
                <div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold">
                    <Stars count={5} /> {dict.showcaseBadgeScore}
                  </div>
                  <span className="text-[10.5px] text-muted">{dict.showcaseBadgeReviews}</span>
                </div>
              </div>

              <div className="mt-7 text-center">
                <blockquote className="text-[16px] font-medium leading-relaxed">{dict.showcaseQuote}</blockquote>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-cobalt text-[11px] font-bold text-white">
                    {dict.showcaseQuoteName[0]}
                  </span>
                  <span className="text-[12.5px] font-semibold">{dict.showcaseQuoteName}</span>
                  <Stars count={4} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {dict.showcaseCards.map((card) => (
                  <div key={card.name} className="rounded-xl border border-border bg-surface p-3.5">
                    <Stars count={5} />
                    <p className="mt-1.5 text-xs leading-relaxed">{card.quote}</p>
                    <span className="mt-2 block text-[10.5px] text-muted">— {card.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
