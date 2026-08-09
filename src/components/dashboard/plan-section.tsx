"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/types";

const plans: { id: Plan; name: string; price: string; features: string[] }[] = [
  { id: "starter", name: "Starter", price: "$29/mes", features: ["Hasta 200 reseñas/mes", "Widget estándar"] },
  {
    id: "growth",
    name: "Growth",
    price: "$79/mes",
    features: ["Reseñas ilimitadas", "Consultor de Mejora Operativa IA", "Apelaciones prioritarias"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199/mes",
    features: ["Soporte multi-tienda", "API custom", "Gestor de cuenta dedicado"],
  },
];

export function PlanSection({ currentPlan }: { currentPlan: Plan }) {
  const [plan, setPlan] = useState(currentPlan);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  async function changePlan(newPlan: Plan) {
    setPendingPlan(newPlan);
    try {
      const res = await fetch("/api/business/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!res.ok) throw new Error();
      setPlan(newPlan);
    } finally {
      setPendingPlan(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-medium">Tu plan</h2>
        <Badge tone="amber">Sin cobro real todavía — cambia libremente para probar</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.id === plan;
          return (
            <Card key={p.id} className={cn("flex flex-col p-5", isCurrent && "border-cobalt/50 bg-cobalt/[0.04]")}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{p.name}</p>
                {isCurrent && <Badge tone="cobalt">Actual</Badge>}
              </div>
              <p className="mt-1 text-2xl font-semibold">{p.price}</p>
              <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-muted">
                    <Check size={13} className="mt-0.5 shrink-0 text-emerald" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => changePlan(p.id)}
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
                    <Loader2 size={14} className="animate-spin" /> Cambiando…
                  </>
                ) : isCurrent ? (
                  "Plan actual"
                ) : (
                  `Cambiar a ${p.name}`
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
