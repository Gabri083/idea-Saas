import { z } from "zod";
import { getClient } from "@/lib/ai/scoring";
import type { BusinessCategory } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

const MonthlyReportSchema = z.object({
  wins: z.array(z.string()).max(5),
  issues: z.array(z.string()).max(5),
  recommendations: z.array(z.string()).max(5),
});

export type MonthlyReportInsights = z.infer<typeof MonthlyReportSchema>;

export interface MonthlyReportStats {
  reviewCount: number;
  avgAiRating: number;
  avgCustomerRating: number | null;
  dimensionAverages: { product: number | null; service: number | null; delivery: number | null };
  openIssues: { label: string; occurrences: number }[];
  /** Recent ai_summary strings (already a distilled, factual one-liner per
   * review from the per-review scoring pass) — gives the model qualitative
   * texture without re-processing raw review text or letting a huge period
   * blow up the prompt. */
  summarySample: string[];
}

const SYSTEM_PROMPT_ES = `Eres un consultor operativo que analiza el desempeño mensual de un negocio de \
e-commerce a partir de datos YA CALCULADOS sobre sus reseñas de clientes (promedios, dimensiones, \
problemas recurrentes abiertos, resúmenes de reseñas recientes). No inventes cifras ni hechos que no \
estén en los datos entregados — solo interprétalos. Responde ÚNICAMENTE con un JSON con esta forma: \
{"wins": string[], "issues": string[], "recommendations": string[]}, cada arreglo con máximo 5 puntos \
cortos (una frase cada uno), en español, específicos y basados en los datos — nunca genéricos ni \
motivacionales vacíos. "wins" son cosas que van bien y vale la pena mantener; "issues" son problemas \
reales o sin resolver este período; "recommendations" son acciones concretas y accionables.`;

const SYSTEM_PROMPT_EN = `You are an operations consultant analyzing an e-commerce business's monthly \
performance from ALREADY-COMPUTED data about its customer reviews (averages, per-dimension scores, \
open recurring issues, recent review summaries). Never invent figures or facts not present in the data \
given — only interpret it. Respond ONLY with a JSON object shaped like: {"wins": string[], "issues": \
string[], "recommendations": string[]}, each array with at most 5 short points (one sentence each), in \
English, specific and data-grounded — never generic or empty motivational language. "wins" are things \
going well worth keeping; "issues" are real or unresolved problems this period; "recommendations" are \
concrete, actionable steps.`;

/**
 * Turns one period's worth of pre-computed review stats into a short,
 * specific narrative (what's working, what's failing, what to do about it) —
 * the part a bare stats digest can't do on its own. Reuses the same OpenAI
 * client as per-review scoring; this call only ever reads/interprets numbers
 * and summaries computed elsewhere, never re-scores anything.
 */
export async function generateMonthlyReportInsights(
  locale: Locale,
  category: BusinessCategory | null,
  businessDescription: string | null,
  stats: MonthlyReportStats,
): Promise<MonthlyReportInsights> {
  const system = locale === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES;

  const userContent = JSON.stringify({
    category: category ?? "otro",
    business_description: businessDescription,
    review_count_this_period: stats.reviewCount,
    avg_ai_rating: stats.avgAiRating,
    avg_customer_rating: stats.avgCustomerRating,
    dimension_averages: stats.dimensionAverages,
    open_recurring_issues: stats.openIssues,
    sample_review_summaries: stats.summarySample,
  });

  const completion = await getClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("The model returned no content.");
  return MonthlyReportSchema.parse(JSON.parse(raw));
}
