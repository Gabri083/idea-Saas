import { z } from "zod";
import { getClient } from "@/lib/ai/scoring";
import type { BusinessCategory } from "@/lib/types";

const TriageSchema = z.object({
  recommendation: z.enum(["archive", "reject", "uncertain"]),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
});

export type AppealTriageResult = z.infer<typeof TriageSchema>;

export interface AppealTriageInput {
  appealReason: string;
  evidenceCount: number;
  review: {
    reviewText: string;
    overallRating: number;
    productScore: number | null;
    serviceScore: number | null;
    deliveryScore: number | null;
  };
  businessCategory: BusinessCategory | null;
}

const TRIAGE_SYSTEM_PROMPT = `Eres un asistente de moderación interno de Kelsira. Ayudas a un
revisor humano a decidir apelaciones que los negocios presentan contra reseñas de sus
clientes. NUNCA tomas la decisión final — solo entregas una recomendación con tu
razonamiento, para que el revisor confirme rápido los casos claros y dedique su atención a
los ambiguos.

No puedes ver los archivos de evidencia adjuntos (fotos, capturas, etc.), solo su cantidad
— tenlo en cuenta y no asumas su contenido.

Importante: una apelación aprobada elimina la reseña por completo — Kelsira nunca corrige o
reescribe el puntaje de una reseña que se queda publicada, solo decide si se queda tal cual
o se elimina. Que un puntaje parezca "duro" o no coincidir del todo con el tono del texto NO
es, por sí solo, motivo de eliminación — eso es una diferencia de opinión sobre el puntaje,
no una infracción.

Evalúa señales textuales:
- ¿El texto de la reseña describe hechos específicos y verificables (fechas, nombres de
  productos, detalles concretos), o es vago/genérico/tipo plantilla? Un texto genérico sin
  ningún detalle concreto es una señal (no una prueba) de reseña posiblemente falsa.
- ¿El motivo de la apelación del negocio es consistente con lo que dice el texto de la
  reseña, o el negocio está negando algo que el cliente describe con detalle?
- ¿Hay señales de una infracción real (reseña falsa, sin relación con una compra real, datos
  personales, lenguaje de odio o abuso, spam) más allá de un simple desacuerdo con el
  puntaje?

Responde con un JSON:
{
  "recommendation": "archive" | "reject" | "uncertain",
  "confidence": "high" | "medium" | "low",
  "reasoning": string (máximo 3 oraciones, en español, explicando tu recomendación)
}

Usa "archive" cuando el texto de la reseña no describe ningún hecho concreto verificable
(vacío de contenido real), contradice frontalmente algo objetivo mencionado en el motivo de
la apelación, o muestra una señal clara de infracción (dato personal, odio/abuso, spam). Usa
"reject" cuando el texto de la reseña es específico, coherente y consistente con una
experiencia real — incluyendo los casos donde el negocio solo está en desacuerdo con el
puntaje, ya que eso no es una infracción. Usa "uncertain" cuando la evidencia textual es
insuficiente o contradictoria y de verdad se necesita juicio humano cuidadoso (ej. depende
del contenido de la evidencia adjunta, que no puedes ver).

Sé conservador: ante la duda, usa "uncertain" con confidence "low" en vez de forzar una
recomendación fuerte.`;

/**
 * Pre-analyzes an appeal from text signals alone (never the attached evidence
 * files) and returns a recommendation for the human reviewer to confirm or
 * override — it never resolves the appeal itself.
 */
export async function triageAppeal(input: AppealTriageInput): Promise<AppealTriageResult> {
  const fmt = (n: number | null) => (n == null ? "no evaluado" : n.toFixed(1));

  const completion = await getClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: TRIAGE_SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Rubro del negocio: ${input.businessCategory ?? "no especificado"}\n` +
          `Motivo de la apelación (dado por el negocio): "${input.appealReason}"\n` +
          `Archivos de evidencia adjuntos: ${input.evidenceCount}\n\n` +
          `Texto original de la reseña del cliente:\n"""${input.review.reviewText}"""\n\n` +
          `Puntajes actuales — Producto: ${fmt(input.review.productScore)}, ` +
          `Atención: ${fmt(input.review.serviceScore)}, ` +
          `Envío: ${fmt(input.review.deliveryScore)}, ` +
          `Puntaje Objetivo IA: ${input.review.overallRating.toFixed(1)}.\n\n` +
          `Analiza y responde con el JSON solicitado.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("El modelo no devolvió contenido.");
  return TriageSchema.parse(JSON.parse(raw));
}
