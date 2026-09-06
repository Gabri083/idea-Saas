import { Fragment } from "react";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { hasGrowthAccess, type Plan } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function WidgetPlanAvailability({
  plan,
  dict,
  upgradeLabel,
  planLabel,
}: {
  plan: Plan;
  dict: Dictionary["dashboard"]["guides"]["availability"];
  upgradeLabel: string;
  planLabel: string;
}) {
  const unlocked = hasGrowthAccess(plan);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{dict.title}</p>
          <p className="mt-1 text-xs text-muted">{dict.subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">
          {dict.currentPlanPrefix} <span className="font-medium text-foreground">{planLabel}</span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
        <p className="pb-1 text-[11px] font-medium uppercase tracking-wide text-muted/70">{dict.tierBasic}</p>
        <p className="pb-1 text-[11px] font-medium uppercase tracking-wide text-muted/70 max-sm:hidden">
          {dict.tierGrowth}
        </p>
        {dict.rows.map((row, i) => (
          <Fragment key={i}>
            <div className="flex items-start gap-2 py-1 text-sm">
              {row.growthOnly ? (
                <X size={15} className="mt-0.5 shrink-0 text-muted/50" />
              ) : (
                <Check size={15} className="mt-0.5 shrink-0 text-emerald" />
              )}
              <span className={row.growthOnly ? "text-muted" : "text-foreground/90"}>{row.label}</span>
            </div>
            <div className="flex items-start gap-2 py-1 text-sm max-sm:hidden">
              <Check size={15} className="mt-0.5 shrink-0 text-emerald" />
              <span className="text-foreground/90">{row.label}</span>
            </div>
          </Fragment>
        ))}
      </div>

      {!unlocked && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cobalt/30 bg-cobalt/10 px-4 py-3">
          <p className="text-xs text-cobalt">{dict.lockedNote}</p>
          <LinkButton href="/dashboard/settings" size="sm" className="shrink-0">
            {upgradeLabel}
          </LinkButton>
        </div>
      )}
    </Card>
  );
}
