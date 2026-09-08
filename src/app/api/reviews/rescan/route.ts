import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  analyzeReviewText,
  clampRating,
  computeWeightedRating,
  reconcileDimensionScore,
} from "@/lib/ai/scoring";
import { getSessionBusinessId } from "@/lib/auth";

const MAX_IDS_PER_REQUEST = 25;

const RequestSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(MAX_IDS_PER_REQUEST),
});

/**
 * Re-runs today's scoring pipeline against a review's already-stored text and
 * customer picks, without re-collecting anything from the customer. Exists
 * because the AI prompt and reconciliation rules keep improving, but a
 * review scored under an older version of either one just keeps its
 * original numbers forever unless something explicitly re-scores it — this
 * is that something. Recurring-issue occurrence counts are deliberately left
 * untouched here: those reviews already contributed to the count once when
 * they were first scored, and re-running them would double it.
 */
export async function POST(request: NextRequest) {
  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const { ids } = parsed.data;

  const admin = createAdminClient();

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select("id, category, business_description")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError || !business) {
    return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
  }

  const { data: reviewRows, error: reviewsError } = await admin
    .from("reviews")
    .select("id, review_text, customer_product_rating, customer_service_rating, customer_delivery_rating")
    .eq("business_id", businessId)
    .in("id", ids);

  if (reviewsError || !reviewRows) {
    return NextResponse.json({ error: "No se pudieron leer las reseñas." }, { status: 500 });
  }

  let rescored = 0;
  const errors: { id: string; reason: string }[] = [];

  for (const row of reviewRows) {
    try {
      const analysis = await analyzeReviewText(row.review_text, {
        category: business.category,
        business_description: business.business_description,
      });

      const productScore = reconcileDimensionScore(analysis.product_score, row.customer_product_rating);
      const serviceScore = reconcileDimensionScore(analysis.service_score, row.customer_service_rating);
      const deliveryScore = reconcileDimensionScore(analysis.delivery_score, row.customer_delivery_rating);
      const weighted =
        computeWeightedRating({ product_score: productScore, service_score: serviceScore, delivery_score: deliveryScore }) ??
        3.0;
      const overallAiRating = clampRating(weighted);

      const { error: updateError } = await admin
        .from("reviews")
        .update({
          product_score: productScore,
          service_score: serviceScore,
          delivery_score: deliveryScore,
          detected_issues: analysis.detected_issues,
          ai_summary: analysis.summary,
          ai_raw_response: analysis,
          overall_ai_rating: overallAiRating,
        })
        .eq("id", row.id)
        .eq("business_id", businessId);

      if (updateError) {
        errors.push({ id: row.id, reason: "No se pudo guardar." });
        continue;
      }

      rescored++;
    } catch (err) {
      console.error("review rescan failed", err);
      errors.push({ id: row.id, reason: "Fallo al re-evaluar." });
    }
  }

  return NextResponse.json({ rescored, total: ids.length, errors });
}
