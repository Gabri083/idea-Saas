"use client";

import { useMemo, useState } from "react";
import { Calculator, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const TOTAL_MONTHLY_REVIEWS = 100;
const HAPPY_CUSTOMER_AVERAGE = 4.6; // baseline rating for the rest of your reviews
const UNFAIR_REVIEW_TRADITIONAL_SCORE = 1.0; // what an angry 1-star actually posts today
const UNFAIR_REVIEW_AI_SCORE = 3.7; // what the same review scores once weighted by facts

export function ImpactCalculator() {
  const [unfairReviews, setUnfairReviews] = useState(12);

  const { averageWithout, averageWith, recovered } = useMemo(() => {
    const fair = TOTAL_MONTHLY_REVIEWS - unfairReviews;
    const without =
      (fair * HAPPY_CUSTOMER_AVERAGE + unfairReviews * UNFAIR_REVIEW_TRADITIONAL_SCORE) /
      TOTAL_MONTHLY_REVIEWS;
    const withAi =
      (fair * HAPPY_CUSTOMER_AVERAGE + unfairReviews * UNFAIR_REVIEW_AI_SCORE) /
      TOTAL_MONTHLY_REVIEWS;

    return {
      averageWithout: without,
      averageWith: withAi,
      recovered: withAi - without,
    };
  }, [unfairReviews]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <Card className="overflow-hidden p-8 sm:p-10">
        <div className="flex items-center gap-2 text-cobalt">
          <Calculator size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Calculadora de impacto
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          ¿Cuánto promedio estás perdiendo por reseñas injustas?
        </h2>
        <p className="mt-2 max-w-xl text-muted">
          Ajusta cuántas reseñas de 1 estrella &ldquo;injustas&rdquo; recibe tu
          tienda al mes (buen producto, mala experiencia logística puntual) y
          mira cuánto promedio recuperarías con Veris.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Reseñas de 1★ injustas / mes</span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-foreground">
                {unfairReviews}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={unfairReviews}
              onChange={(e) => setUnfairReviews(Number(e.target.value))}
              className="mt-4 w-full accent-cobalt"
              aria-label="Reseñas de 1 estrella injustas al mes"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>0</span>
              <span>50</span>
            </div>

            <p className="mt-8 text-xs text-muted">
              Supuesto: sobre una base de {TOTAL_MONTHLY_REVIEWS} reseñas/mes,
              el resto de tus clientes satisfechos promedia {HAPPY_CUSTOMER_AVERAGE.toFixed(1)}★.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs text-muted">Promedio actual</p>
              <p className="mt-2 text-3xl font-semibold text-rose">
                {averageWithout.toFixed(2)}★
              </p>
              <p className="mt-1 text-xs text-muted">Con calificación tradicional</p>
            </div>
            <div className="rounded-xl border border-emerald/30 bg-emerald/[0.06] p-5">
              <p className="text-xs text-muted">Promedio con Veris</p>
              <p className="mt-2 text-3xl font-semibold text-emerald">
                {averageWith.toFixed(2)}★
              </p>
              <p className="mt-1 text-xs text-muted">Con puntaje objetivo IA</p>
            </div>
            <div className="col-span-full flex items-center gap-3 rounded-xl border border-cobalt/30 bg-cobalt/[0.06] p-5">
              <Sparkles size={20} className="shrink-0 text-cobalt" />
              <p className="text-sm">
                Recuperarías{" "}
                <span className="font-semibold text-cobalt">
                  +{recovered.toFixed(2)} estrellas
                </span>{" "}
                de promedio global cada mes.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
