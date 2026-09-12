import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLAN_PRICES } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Pricing({ dict }: { dict: Dictionary["pricing"] }) {
  const plans = [
    { ...dict.plans.free, price: "$0", suffix: "", highlighted: false },
    { ...dict.plans.starter, price: `$${PLAN_PRICES.starter}`, suffix: dict.perMonth, highlighted: false },
    { ...dict.plans.growth, price: `$${PLAN_PRICES.growth}`, suffix: dict.perMonth, highlighted: true },
    { ...dict.plans.enterprise, price: `$${PLAN_PRICES.enterprise}`, suffix: dict.perMonth, highlighted: false },
  ];

  return (
    <section id="precios" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{dict.title}</h2>
        <p className="mt-3 text-[15.5px] text-muted">{dict.subtitle}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn("flex flex-col p-7", plan.highlighted && "border-cobalt ring-1 ring-cobalt")}
          >
            {plan.highlighted && (
              <span className="mb-3.5 inline-flex w-fit items-center rounded-full bg-cobalt px-2.5 py-1 text-[11px] font-bold text-white">
                {dict.mostPopular}
              </span>
            )}
            <h3 className="text-[17px] font-bold">{plan.name}</h3>
            <p className="mt-1.5 min-h-[32px] text-[12.5px] text-muted">{plan.description}</p>
            <p className="mt-5 text-[30px] font-extrabold tracking-tight">
              {plan.price}
              <span className="text-[13px] font-medium text-muted">{plan.suffix}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">{plan.trialNote}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[13px]">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <LinkButton
              href="/signup"
              variant={plan.highlighted ? "primary" : "outline"}
              className="mt-6 w-full rounded-full"
            >
              {plan.name === dict.plans.free.name ? dict.ctaFree : dict.ctaPaid(plan.name)}
            </LinkButton>
          </Card>
        ))}
      </div>
    </section>
  );
}
