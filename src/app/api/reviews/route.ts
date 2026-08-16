import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeReviewText, clampRating, computeWeightedRating } from "@/lib/ai/scoring";
import { syncRecurringIssuesAndGetPenalty } from "@/lib/ai/recurring-issues";
import { uuidSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import {
  recurringIssueAlertEmail,
  reviewCapReachedEmail,
  reviewConfirmationEmail,
} from "@/lib/email-templates";

const RequestSchema = z.object({
  business_id: uuidSchema,
  customer_name: z.string().min(1).max(120),
  customer_email: z.string().email(),
  review_text: z.string().min(10).max(4000),
  customer_star_rating: z.number().int().min(1).max(5).optional(),
  // anti-spam signals, invisible to real users — see ReviewForm
  website: z.string().max(0).optional().or(z.literal("")),
  started_at: z.number().optional(),
});

const MIN_FILL_TIME_MS = 2000;
const DUPLICATE_WINDOW_MINUTES = 60;

export async function POST(request: NextRequest) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    business_id,
    customer_name,
    customer_email,
    review_text,
    customer_star_rating,
    website,
    started_at,
  } = parsed.data;

  // Honeypot: real users never see or fill this field.
  if (website) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  // A form submitted faster than a human could plausibly type it out.
  if (started_at && Date.now() - started_at < MIN_FILL_TIME_MS) {
    return NextResponse.json(
      { error: "Tu reseña se envió demasiado rápido, intenta de nuevo." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select(
      "id, name, contact_email, category, business_description, monthly_review_cap, cap_alert_sent_month",
    )
    .eq("id", business_id)
    .maybeSingle();

  if (businessError || !business) {
    return NextResponse.json({ error: "Negocio no encontrado." }, { status: 404 });
  }

  if (business.monthly_review_cap != null) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const currentMonth = startOfMonth.toISOString().slice(0, 7); // "YYYY-MM"

    const { count } = await admin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business_id)
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= business.monthly_review_cap) {
      // Fire at most once per calendar month, no matter how many submissions
      // are rejected after the cap is reached (e.g. a bot retrying the form).
      if (business.cap_alert_sent_month !== currentMonth) {
        await admin.from("businesses").update({ cap_alert_sent_month: currentMonth }).eq("id", business_id);
        await sendEmail({
          to: business.contact_email,
          ...reviewCapReachedEmail({ businessName: business.name, cap: business.monthly_review_cap }),
        });
      }
      return NextResponse.json(
        { error: "Este negocio alcanzó su límite de reseñas del mes en su plan actual." },
        { status: 403 },
      );
    }
  }

  const { data: recentDuplicate } = await admin
    .from("reviews")
    .select("id")
    .eq("business_id", business_id)
    .eq("customer_email", customer_email)
    .gte("created_at", new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60_000).toISOString())
    .maybeSingle();

  if (recentDuplicate) {
    return NextResponse.json(
      { error: "Ya enviaste una reseña recientemente para este negocio. Intenta más tarde." },
      { status: 429 },
    );
  }

  // Step 1 — structured, deterministic fact-based analysis via OpenAI JSON mode,
  // calibrated to this business' rubro (restaurant vs. shoe store, etc.).
  let analysis;
  try {
    analysis = await analyzeReviewText(review_text, {
      category: business.category,
      business_description: business.business_description,
    });
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
  const { penalty, penalizedIssueLabels, newIssues } = await syncRecurringIssuesAndGetPenalty(
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

  await sendEmail({
    to: customer_email,
    ...reviewConfirmationEmail({
      customerName: customer_name,
      businessName: business.name,
      overallRating: overallAiRating,
    }),
  });

  for (const issue of newIssues) {
    await sendEmail({
      to: business.contact_email,
      ...recurringIssueAlertEmail({
        businessName: business.name,
        issueLabel: issue.label,
        deadline: issue.deadline,
      }),
    });
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
