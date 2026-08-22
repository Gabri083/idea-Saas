import { Frown, PackageCheck, ScanSearch, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ProblemSolution({ dict }: { dict: Dictionary["problemSolution"] }) {
  return (
    <section id="problema-solucion" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{dict.title}</h2>
        <p className="mt-4 text-muted">{dict.subtitle}</p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-rose/20 bg-rose/[0.03] p-8">
          <div className="flex items-center gap-2 text-rose">
            <TrendingDown size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">{dict.problemLabel}</span>
          </div>
          <h3 className="mt-4 text-xl font-medium">{dict.problemTitle}</h3>
          <p className="mt-3 text-muted">{dict.problemBody}</p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <Frown className="shrink-0 text-rose" size={28} />
            <div>
              <p className="text-sm font-medium">{dict.problemExampleQuote}</p>
              <p className="text-xs text-muted">{dict.problemExampleSub}</p>
            </div>
          </div>
        </Card>

        <Card className="border-emerald/20 bg-emerald/[0.03] p-8">
          <div className="flex items-center gap-2 text-emerald">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">{dict.solutionLabel}</span>
          </div>
          <h3 className="mt-4 text-xl font-medium">{dict.solutionTitle}</h3>
          <p className="mt-3 text-muted">{dict.solutionBody}</p>
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <PackageCheck className="shrink-0 text-emerald" size={28} />
            <div>
              <p className="text-sm font-medium">{dict.solutionExampleQuote}</p>
              <p className="text-xs text-muted">{dict.solutionExampleSub}</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 md:col-span-2">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="flex items-center gap-3 text-cobalt">
              <Scale size={20} />
              <span className="font-medium">{dict.weightingLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-foreground">40%</span>
              <span className="text-sm text-muted">{dict.weightProduct}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-foreground">30%</span>
              <span className="text-sm text-muted">{dict.weightService}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
            <ScanSearch size={20} className="shrink-0 text-cobalt" />
            <p className="text-sm text-muted">{dict.weightFootnote}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
