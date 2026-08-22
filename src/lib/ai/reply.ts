import { getClient } from "@/lib/ai/scoring";
import type { Business, Review } from "@/lib/types";

const REPLY_SYSTEM_PROMPT = `Eres un asistente que ayuda al dueño de un negocio a responder
públicamente a una reseña de un cliente. La respuesta la va a publicar el dueño, no tú —
escribe un borrador que él pueda editar antes de enviarlo.

Reglas:
- Tono profesional y cercano, en primera persona plural ("nosotros"), como si fueras el
  negocio respondiendo.
- Máximo 60 palabras.
- Reconoce lo que el cliente vivió sin inventar disculpas ni admitir culpas que el texto no
  respalda.
- Si la reseña señala un problema concreto, menciona brevemente que se está atendiendo —
  pero NUNCA inventes compensaciones, plazos, reembolsos o promesas específicas que no
  estén en el texto original de la reseña.
- Si la reseña es positiva, agradece de forma específica (menciona qué le gustó), sin
  frases genéricas vacías.
- Responde SOLO con el texto de la respuesta pública, sin comillas, sin explicaciones, sin
  encabezados.`;

/**
 * Drafts a suggested public reply from the review's own text — the business
 * owner always reviews and edits it before it's ever published (see
 * ReviewsTable: this only fills the reply textarea, it never auto-submits).
 */
export async function suggestReply(
  review: Pick<Review, "customer_name" | "review_text" | "overall_ai_rating">,
  business: Pick<Business, "name" | "category">,
): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.6,
    messages: [
      { role: "system", content: REPLY_SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Negocio: ${business.name}\n` +
          `Reseña de ${review.customer_name} (puntaje objetivo IA: ${review.overall_ai_rating.toFixed(1)}/5):\n` +
          `"""${review.review_text}"""\n\n` +
          `Escribe el borrador de la respuesta pública.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("El modelo no devolvió contenido.");
  return raw.trim();
}
