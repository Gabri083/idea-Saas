import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeReviewText, clampRating, computeWeightedRating } from "@/lib/ai/scoring";
import { syncRecurringIssuesAndGetPenalty } from "@/lib/ai/recurring-issues";

const RequestSchema = z.object({
  business_id: z.string().uuid(),
  customer_name: z.string().min(1).max(120),
  customer_email: z.string().email(),
  review_text: z.string().min(10).max(4000),
  customer_star_rating: z.number().int().min(1).max(5).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { business_id, customer_name, customer_email, review_text, customer_star_rating } =
    parsed.data;

  const admin = createAdminClient();

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select("id")
    .eq("id", business_id)
    .maybeSingle();

  if (businessError || !business) {
    return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
  }

  // Step 1 — structured, deterministic fact-based analysis via OpenAI JSON mode.
  let analysis;
  try {
    analysis = await analyzeReviewText(review_text);
  } catch (err) {
    console.error("AI analysis failed", err);
    return NextResponse.json(
      { error: "No se pudo analizar la reseña en este momento." },
      { status: 502 },
    );
  }

  // Step 2 — 40/30/30 weighted rating.
  const weighted = computeWeightedRating(analysis);

  // Step 3 — inaction penalty: subtract penalty_factor for any detected issue
  // that matches an `open` recurring_issues row past its 30-day deadline.
  const { penalty, penalizedIssueLabels } = await syncRecurringIssuesAndGetPenalty(
    admin,
    business_id,
    analysis.detected_issues,
  );

  const overallAiRating = clampRating(weighted - penalty);

  const { data: review, error: insertError } = await admin
    .from("reviews")
    .insert({
      business_id,
      customer_name,
      customer_email,
      review_text,
      customer_star_rating: customer_star_rating ?? null,
      product_score: analysis.product_score,
      service_score: analysis.service_score,
      delivery_score: analysis.delivery_score,
      detected_issues: analysis.detected_issues,
      ai_summary: analysis.summary,
      ai_raw_response: analysis,
      overall_ai_rating: overallAiRating,
      penalty_applied: penalty,
      status: "published",
    })
    .select()
    .single();

  if (insertError || !review) {
    console.error("Failed to persist review", insertError);
    return NextResponse.json({ error: "No se pudo guardar la reseña." }, { status: 500 });
  }

  return NextResponse.json({
    review,
    penalty_context:
      penalty > 0
        ? {
            penalty_applied: penalty,
            reason: `Penalización por inacción operativa sobre: ${penalizedIssueLabels.join(", ")}`,
          }
        : null,
  });
}
