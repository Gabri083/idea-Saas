import OpenAI from "openai";
import { z } from "zod";
import type { AiReviewAnalysis, BusinessCategory } from "@/lib/types";

const AiAnalysisSchema = z.object({
  is_valid_review: z.boolean(),
  rejection_reason: z.string().nullable(),
  product_score: z.number().min(1).max(5),
  service_score: z.number().min(1).max(5),
  delivery_score: z.number().min(1).max(5),
  detected_issues: z.array(z.string()),
  summary: z.string(),
});

const round1 = (n: number) => Math.round(n * 10) / 10;

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

Evalúa tres dimensiones de forma independiente, cada una de 1.0 a 5.0 CON UN
DECIMAL de precisión (ej. 4.7, 3.2, 2.8) — evita en lo posible números
redondos como 4 o 5 en punto; los clientes reales rara vez viven una
experiencia perfectamente pareja, así que usa el decimal para reflejar
matices (ej. el producto fue excelente pero no absolutamente perfecto → 4.8,
no 5.0):
- product_score
- service_score
- delivery_score

El mensaje del usuario te indica el rubro del negocio y cómo interpretar cada
dimensión para ese rubro específico — dos negocios distintos (ej. un
restaurante y una tienda de zapatos) deben juzgarse con criterios distintos
aunque la estructura de 3 dimensiones sea la misma.

Si el texto no menciona una dimensión explícitamente, INFIÉRELA a partir del
tono general de la experiencia, no la dejes en un valor neutral por defecto:
- Si la experiencia general es positiva y el cliente no señala ningún
  problema en absoluto, asume que esa dimensión no mencionada también fue
  buena (alrededor de 4.3–4.6) — un cliente satisfecho normalmente lo
  habría dicho si algo hubiera fallado.
- Si el cliente sí señala un problema concreto en una dimensión específica,
  esa dimensión debe reflejar ese problema puntual, sin arrastrar a la baja
  las demás dimensiones que no tienen quejas asociadas.
- Usa un valor neutral (alrededor de 3.0) solo cuando el tono general sea
  genuinamente mixto o ambiguo y no puedas inferir razonablemente si esa
  dimensión fue buena o mala.

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
