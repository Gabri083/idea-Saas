import OpenAI from "openai";
import { z } from "zod";
import type { AiReviewAnalysis } from "@/lib/types";

const AiAnalysisSchema = z.object({
  product_score: z.number().int().min(1).max(5),
  service_score: z.number().int().min(1).max(5),
  delivery_score: z.number().int().min(1).max(5),
  detected_issues: z.array(z.string()),
  summary: z.string(),
});

const SYSTEM_PROMPT = `Eres un analista de reseñas imparcial para un e-commerce. Tu única
tarea es leer el texto de una reseña de un cliente, escrito libremente y sin
censura, y extraer una evaluación objetiva de los HECHOS que describe —
ignorando por completo el tono emocional, los insultos o el entusiasmo del
autor. No modificas ni resumes el texto original del cliente en ningún otro
lugar del sistema; tu única salida es la puntuación estructurada.

Evalúa tres dimensiones de forma independiente, cada una de 1 a 5:
- product_score: calidad, estado y correspondencia del producto o servicio en sí.
- service_score: calidad de la atención/soporte recibido (trato, rapidez, resolución).
- delivery_score: cumplimiento de los tiempos y condiciones de envío/entrega.

Si el texto no menciona una dimensión en absoluto, asume un desempeño neutral
(3) para esa dimensión — nunca la penalices por ausencia de información.

detected_issues: lista corta (0 a 5) de problemas operativos concretos
mencionados, en minúsculas y normalizados en español (ej. "packaging roto",
"demora en envío", "atención lenta"). Vacío si no hay problemas.

summary: una frase objetiva (máx. 25 palabras) que resuma los hechos, sin
adjetivos emocionales.

Responde ÚNICAMENTE con el JSON estructurado solicitado.`;

let client: OpenAI | null = null;
function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * Sends the raw, uncensored review text to the model and returns a
 * deterministic, structured fact-based analysis (JSON mode).
 */
export async function analyzeReviewText(
  reviewText: string,
): Promise<AiReviewAnalysis> {
  const completion = await getClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analiza esta reseña y responde con el JSON estructurado:\n\n"""${reviewText}"""`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("El modelo no devolvió contenido.");

  const parsed = AiAnalysisSchema.parse(JSON.parse(raw));
  return parsed;
}

/** 40% producto, 30% atención, 30% envíos — ponderación del puntaje final. */
export function computeWeightedRating(analysis: {
  product_score: number;
  service_score: number;
  delivery_score: number;
}): number {
  const raw =
    analysis.product_score * 0.4 +
    analysis.service_score * 0.3 +
    analysis.delivery_score * 0.3;
  return Math.round(raw * 10) / 10;
}

/** Clamp the final published rating to the valid 1.0–5.0 range. */
export function clampRating(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value * 10) / 10));
}
