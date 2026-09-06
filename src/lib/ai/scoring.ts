import OpenAI from "openai";
import { z } from "zod";
import type { AiReviewAnalysis, BusinessCategory } from "@/lib/types";

const AiAnalysisSchema = z.object({
  is_valid_review: z.boolean(),
  rejection_reason: z.string().nullable(),
  product_score: z.number().min(1).max(5).nullable(),
  service_score: z.number().min(1).max(5).nullable(),
  delivery_score: z.number().min(1).max(5).nullable(),
  detected_issues: z.array(z.string()),
  summary: z.string(),
});

const round1 = (n: number | null) => (n == null ? null : Math.round(n * 10) / 10);

const CATEGORY_DIMENSION_HINTS: Record<BusinessCategory, string> = {
  restaurante:
    "Este negocio es un restaurante/local de comida. Interpreta product_score como la " +
    "calidad de los platillos/bebidas; service_score como la atención de meseros/personal " +
    "y el ambiente del local; delivery_score como el tiempo de espera para ser atendido o " +
    "de entrega si fue delivery/takeout.",
  moda_calzado:
    "Este negocio vende moda y calzado. Interpreta product_score como calidad, talla y " +
    "materiales de la prenda/calzado; service_score como la atención al cliente/soporte; " +
    "delivery_score como los tiempos de envío.",
  belleza:
    "Este negocio es de belleza y cuidado personal. Interpreta product_score como el " +
    "resultado del producto o servicio recibido (ej. corte, tratamiento); service_score " +
    "como el trato del personal; delivery_score como los tiempos de espera/citas o de envío.",
  electronica:
    "Este negocio vende electrónica/tecnología. Interpreta product_score como el " +
    "funcionamiento y calidad del producto; service_score como el soporte técnico/atención; " +
    "delivery_score como los tiempos de envío.",
  hogar:
    "Este negocio vende artículos para el hogar. Interpreta product_score como calidad del " +
    "producto; service_score como la atención al cliente; delivery_score como los tiempos " +
    "de envío o instalación.",
  salud:
    "Este negocio es de salud y bienestar. Interpreta product_score como la calidad del " +
    "servicio/tratamiento recibido; service_score como el trato del personal; delivery_score " +
    "como los tiempos de espera o de citas.",
  otro:
    "Interpreta product_score como la calidad del producto o servicio principal; " +
    "service_score como la atención/soporte recibido; delivery_score como el cumplimiento " +
    "de tiempos de entrega o espera.",
};

const SYSTEM_PROMPT = `Eres un analista de reseñas imparcial para un e-commerce. Tu única
tarea es leer el texto de una reseña de un cliente, escrito libremente y sin
censura, y extraer una evaluación objetiva de los HECHOS que describe —
ignorando por completo el tono emocional, los insultos o el entusiasmo del
autor. No modificas ni resumes el texto original del cliente en ningún otro
lugar del sistema; tu única salida es la puntuación estructurada.

IDIOMA: todo texto que generes (rejection_reason, detected_issues, summary)
debe estar en el MISMO idioma en que está escrita la reseña del cliente —
si escribe en inglés, responde en inglés; si escribe en español, responde
en español; y así con cualquier otro idioma. Nunca traduzcas ni mezcles
idiomas entre el texto generado y el texto original de la reseña.

PRIMER PASO — validez del contenido:
Determina is_valid_review. Debe ser false SOLO cuando el texto no contiene
ninguna información real y verificable sobre una experiencia con el negocio
— es decir, cuando no hay NADA que un dueño de negocio pueda usar para
entender qué pasó. Ejemplos de texto inválido: "lol", "jaja", "asdasd",
teclado aleatorio, una sola palabra sin contexto ("malo", "pésimo", "bien"),
insultos sin ningún hecho concreto, o texto que claramente no describe una
experiencia de compra/servicio real. Si es inválido, pon rejection_reason
con una frase breve, en el mismo idioma de la reseña, explicando por qué
(ej. en español: "El texto no describe ninguna experiencia concreta con el
negocio"; en inglés: "The text doesn't describe any concrete experience
with the business"), y devuelve product_score,
service_score y delivery_score como 3.0, detected_issues como [] y summary
como "".
Si el texto SÍ describe algo real, aunque sea breve o esté mal escrito (ej.
"la pizza llegó fría pero el repartidor fue amable"), is_valid_review debe
ser true y rejection_reason debe ser null — un texto corto pero con
contenido verificable NUNCA se rechaza. La brevedad, la mala ortografía o el
enojo del cliente NO son motivo de rechazo por sí solos.

Si is_valid_review es true, continúa con la evaluación normal descrita abajo.

Evalúa tres dimensiones — product_score, service_score, delivery_score —
independientemente, cada una siguiendo EXACTAMENTE este procedimiento de 3
pasos, en orden, sin saltarte ninguno. Filosofía general: la respuesta por
defecto es NO INTERFERIR — cada paso existe para decidir si hay una razón
concreta para apartarse del 5.0, nunca para "buscarle un matiz" a un texto
que no lo pide.

El mensaje del usuario te indica el rubro del negocio y cómo interpretar cada
dimensión para ese rubro específico — dos negocios distintos (ej. un
restaurante y una tienda de zapatos) deben juzgarse con criterios distintos
aunque la estructura de 3 dimensiones sea la misma.

PASO 1 — ¿hay información? ¿El texto dice algo sobre esta dimensión, directo
("llegó rápido") o claramente implícito ("todo perfecto, tal cual lo pedí"
implica que el envío también estuvo bien)? Un cliente que solo comenta el
servicio no dijo nada sobre el envío, y "no dijo nada" nunca significa "fue
más o menos" ni "fue bueno" — significa que no hay datos. Ante la duda entre
"hay una implicación real" y "estoy adivinando", elige que NO hay
información.
  → Si NO hay información sobre esta dimensión: es null. No sigas a los
    pasos 2 y 3 — no la completes con el tono de las otras dimensiones, no
    la promedies, no la dejes en un valor neutral "por si acaso".

PASO 2 — ¿hay un problema concreto? (Solo si el paso 1 dio información.)
¿El texto describe un HECHO puntual y verificable que salió mal en ESTA
dimensión — "vino con un rayón", "tardó 3 días más de lo prometido", "nadie
respondió el reclamo"? El tono, la brevedad, o que el cliente escriba
"bueno" en vez de "excelente" NUNCA cuentan como problema — son estilo de
redacción, no información.
  → Si NO hay un problema concreto: esta dimensión es 5.0. Así de simple,
    sin excepciones. "Buen producto" y "producto excelente" describen la
    MISMA ausencia de problemas y valen exactamente lo mismo — no existe una
    categoría intermedia de "bien pero no perfecto" sin un hecho que la
    respalde, y el cliente no tiene por qué escribir un ensayo entusiasta
    para merecer el puntaje completo.

PASO 3 — calificar el problema. (Solo si el paso 2 encontró un problema
concreto.) Puntúa esta dimensión entre 1.0 y 4.9 según la gravedad de ESE
problema específico, tal como el propio cliente lo describe — nunca según tu
propio criterio de "qué tan grave debería ser" ese tipo de problema. Si el
cliente ya se justificó con un hecho concreto, confía en su relato en vez de
suavizarlo. Usa un decimal de precisión (ej. 4.7, 3.2, 2.8) cuando el texto
realmente da pie a matizar cuán grave fue el problema; usa un número más
redondo (ej. 2.0) cuando el problema es tajante y no da lugar a matices.

CONFÍA EN UNA QUEJA BIEN JUSTIFICADA: cuando el cliente da un puntaje bajo
Y explica un motivo concreto y específico para esa dimensión (un hecho
verificable, no solo un adjetivo — "llegó tarde", "vino con un rayón",
"nadie respondió"), esa dimensión debe quedar cerca de lo que el cliente
describe, no de lo que a ti te parezca "razonable" para ese problema. No
subas el puntaje de una dimensión solo porque, a tu criterio, el problema
descrito "no era tan grave" — qué tan grave fue una mala experiencia para
ESE cliente es su call, no el tuyo, siempre que haya un hecho concreto
detrás. Reservar una corrección real para cuando el texto NO respalda el
puntaje (reseña sin quejas concretas pero con nota baja, o al revés) — no
para cuando el cliente ya se justificó.

detected_issues: lista corta (0 a 5) de problemas operativos concretos
mencionados, en minúsculas y normalizados en el mismo idioma en que está
escrita la reseña (ej. en español: "packaging roto", "demora en envío",
"atención lenta"; en inglés: "broken packaging", "shipping delay", "slow
support"). Vacío si no hay problemas.

summary: una frase objetiva (máx. 25 palabras), en el mismo idioma de la
reseña, que resuma los hechos, sin adjetivos emocionales.

Responde ÚNICAMENTE con el JSON estructurado solicitado.`;

let client: OpenAI | null = null;
export function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export interface BusinessContext {
  category: BusinessCategory | null;
  business_description: string | null;
}

/**
 * Sends the raw, uncensored review text to the model and returns a
 * deterministic, structured fact-based analysis (JSON mode). `business`
 * gives the model the rubro/context it needs to judge a restaurant
 * differently from a shoe store, for example.
 */
export async function analyzeReviewText(
  reviewText: string,
  business?: BusinessContext,
): Promise<AiReviewAnalysis> {
  const category = business?.category ?? "otro";
  const contextLines = [
    CATEGORY_DIMENSION_HINTS[category],
    business?.business_description
      ? `Descripción del negocio (dada por el propio dueño): "${business.business_description}"`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await getClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${contextLines}\n\nAnaliza esta reseña y responde con el JSON estructurado:\n\n"""${reviewText}"""`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("El modelo no devolvió contenido.");

  const parsed = AiAnalysisSchema.parse(JSON.parse(raw));
  return {
    ...parsed,
    product_score: round1(parsed.product_score),
    service_score: round1(parsed.service_score),
    delivery_score: round1(parsed.delivery_score),
  };
}

/** 40% producto, 30% atención, 30% envíos — ponderación del puntaje final,
 * usada tanto para el puntaje de la IA como para el compuesto del cliente. */
const CATEGORY_WEIGHTS = { product: 0.4, service: 0.3, delivery: 0.3 };

/**
 * Weighted average over whichever of the three categories actually have a
 * value, renormalizing the weights instead of forcing all three — a review
 * (from the AI or the customer) that only speaks to one or two dimensions
 * shouldn't have a missing one silently dragging the result toward some
 * assumed number. Returns null only when none of the three are present.
 */
function weightedAverage(scores: {
  product: number | null;
  service: number | null;
  delivery: number | null;
}): number | null {
  const parts: Array<[number, number]> = [];
  if (scores.product != null) parts.push([scores.product, CATEGORY_WEIGHTS.product]);
  if (scores.service != null) parts.push([scores.service, CATEGORY_WEIGHTS.service]);
  if (scores.delivery != null) parts.push([scores.delivery, CATEGORY_WEIGHTS.delivery]);
  if (parts.length === 0) return null;

  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  const weightedSum = parts.reduce((sum, [value, weight]) => sum + value * weight, 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/** The AI's own composite — null only in the rare case its analysis found
 * nothing concrete about any of the three dimensions (the text is still a
 * valid review, just not one that maps cleanly onto product/service/delivery). */
export function computeWeightedRating(analysis: {
  product_score: number | null;
  service_score: number | null;
  delivery_score: number | null;
}): number | null {
  return weightedAverage({
    product: analysis.product_score,
    service: analysis.service_score,
    delivery: analysis.delivery_score,
  });
}

/** Same weighting, for the customer's own per-category picks. Returns null
 * if they rated none, so the review is treated the same as if they'd
 * skipped rating entirely (no composite to compare against the AI's). */
export function computeCustomerWeightedRating(picks: {
  product: number | null;
  service: number | null;
  delivery: number | null;
}): number | null {
  return weightedAverage(picks);
}

/** Clamp the final published rating to the valid 1.0–5.0 range. */
export function clampRating(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value * 10) / 10));
}
