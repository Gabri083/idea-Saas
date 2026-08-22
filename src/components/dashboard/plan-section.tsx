"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function PlanSection({
  currentPlan,
  subscriptionStatus,
  customerPortalUrl,
  dict,
}: {
  currentPlan: Plan;
  subscriptionStatus: string | null;
  customerPortalUrl: string | null;
  dict: Dictionary["dashboard"]["planSection"];
}) {
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const plans: { id: Plan; name: string; price: string; trialNote: string; features: string[] }[] = [
    { id: "free", ...dict.plans.free },
    { id: "starter", ...dict.plans.starter },
    { id: "growth", ...dict.plans.growth },
    { id: "enterprise", ...dict.plans.enterprise },
  ];

  async function subscribe(plan: Plan) {
    setPendingPlan(plan);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || dict.checkoutError);
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.genericError);
      setPendingPlan(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-medium">{dict.title}</h2>
        {subscriptionStatus && (
          <Badge tone={subscriptionStatus === "active" || subscriptionStatus === "on_trial" ? "emerald" : "amber"}>
            {dict.statusLabels[subscriptionStatus as keyof typeof dict.statusLabels] ?? subscriptionStatus}
          </Badge>
        )}
        {customerPortalUrl && (
          <a
            href={customerPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-cobalt hover:underline"
          >
            {dict.manageSubscription} <ExternalLink size={13} />
          </a>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-rose">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const isCurrent = p.id === currentPlan;
          return (
            <Card key={p.id} className={cn("flex flex-col p-5", isCurrent && "border-cobalt/50 bg-cobalt/[0.04]")}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{p.name}</p>
                {isCurrent && <Badge tone="cobalt">{dict.current}</Badge>}
              </div>
              <p className="mt-1 text-2xl font-semibold">{p.price}</p>
              <p className="mt-1 text-xs text-muted">{p.trialNote}</p>
              <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-muted">
                    <Check size={13} className="mt-0.5 shrink-0 text-emerald" />
                    {f}
                  </li>
                ))}
              </ul>
              {p.id === "free" ? (
                <div className="mt-4 flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-muted">
                  {isCurrent ? dict.currentPlanCta : dict.freePlanCta}
                </div>
              ) : (
                <button
                  onClick={() => subscribe(p.id)}
                  disabled={isCurrent || pendingPlan !== null}
                  className={cn(
                    "mt-4 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50",
                    isCurrent
                      ? "border-border text-muted"
                      : "border-cobalt/40 text-cobalt hover:bg-cobalt/10",
                  )}
                >
                  {pendingPlan === p.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {dict.redirecting}
                    </>
                  ) : isCurrent ? (
                    dict.currentPlanCta
                  ) : (
                    dict.subscribeTo.replace("{name}", p.name)
                  )}
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
