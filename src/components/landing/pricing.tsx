import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    suffix: "",
    trialNote: "Sin tarjeta de crédito.",
    description: "Para probar Kelsira en serio antes de decidir.",
    features: ["Hasta 20 reseñas/mes", "Widget estándar", "Puntaje objetivo IA"],
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    suffix: "/mes",
    trialNote: "14 días de prueba gratis, requiere tarjeta.",
    description: "Para marcas independientes que están empezando.",
    features: ["Hasta 200 reseñas/mes", "Widget estándar", "Puntaje objetivo IA", "Soporte por email"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$79",
    suffix: "/mes",
    trialNote: "14 días de prueba gratis, requiere tarjeta.",
    description: "Para e-commerce en crecimiento activo.",
    features: [
      "Reseñas ilimitadas",
      "Consultor de Mejora Operativa IA",
      "Apelaciones prioritarias",
      "Widget personalizable",
      "Centro de Calibración e Histórico",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    suffix: "/mes",
    trialNote: "14 días de prueba gratis, requiere tarjeta.",
    description: "Para operaciones multi-tienda a gran escala.",
    features: [
      "Soporte multi-tienda",
      "API custom",
      "Gestor de cuenta dedicado",
      "SLA de apelaciones",
      "Todo lo del plan Growth",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="precios" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Planes simples y transparentes</h2>
        <p className="mt-4 text-muted">Sin permanencia. Cancela cuando quieras.</p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col p-8",
              plan.highlighted && "border-cobalt/50 bg-cobalt/[0.04] ring-1 ring-cobalt/30",
            )}
          >
            {plan.highlighted && (
              <span className="mb-4 inline-flex w-fit items-center rounded-full bg-cobalt/15 px-3 py-1 text-xs font-medium text-cobalt">
                Más popular
              </span>
            )}
            <h3 className="text-lg font-medium">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted">{plan.description}</p>
            <p className="mt-6 text-4xl font-semibold tracking-tight">
              {plan.price}
              <span className="text-base font-normal text-muted">{plan.suffix}</span>
            </p>
            <p className="mt-1 text-xs text-muted">{plan.trialNote}</p>

            <ul className="mt-8 flex flex-1 flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald" />
                  <span className="text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>

            <LinkButton
              href="/signup"
              variant={plan.highlighted ? "primary" : "secondary"}
              className="mt-8 w-full"
            >
              {plan.name === "Gratis" ? "Empezar gratis" : `Elegir ${plan.name}`}
            </LinkButton>
          </Card>
        ))}
      </div>
    </section>
  );
}
