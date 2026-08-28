import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeReviewText, clampRating, computeCustomerWeightedRating, computeWeightedRating } from "@/lib/ai/scoring";
import { syncRecurringIssuesAndGetPenalty } from "@/lib/ai/recurring-issues";
import { uuidSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import {
  recurringIssueAlertEmail,
  reviewCapReachedEmail,
  reviewConfirmationEmail,
} from "@/lib/email-templates";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

const RequestSchema = z.object({
  business_id: uuidSchema,
  customer_name: z.string().min(1).max(120),
  customer_email: z.string().email(),
  review_text: z.string().min(10).max(4000),
  customer_product_rating: z.number().int().min(1).max(5).optional(),
  customer_service_rating: z.number().int().min(1).max(5).optional(),
  customer_delivery_rating: z.number().int().min(1).max(5).optional(),
  // anti-spam signals, invisible to real users — see ReviewForm
  website: z.string().max(0).optional().or(z.literal("")),
  started_at: z.number().optional(),
});

const MIN_FILL_TIME_MS = 2000;
const DUPLICATE_WINDOW_MINUTES = 60;

export async function POST(request: NextRequest) {
  const [visitorLocale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.publicReview;

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.apiInvalidRequest, details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    business_id,
    customer_name,
    customer_email,
    review_text,
    customer_product_rating,
    customer_service_rating,
    customer_delivery_rating,
    website,
    started_at,
  } = parsed.data;

  // Honeypot: real users never see or fill this field.
  if (website) {
    return NextResponse.json({ error: t.apiInvalidRequest }, { status: 400 });
  }
  // A form submitted faster than a human could plausibly type it out.
  if (started_at && Date.now() - started_at < MIN_FILL_TIME_MS) {
    return NextResponse.json({ error: t.apiTooFast }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select(
      "id, name, contact_email, category, business_description, locale, monthly_review_cap, cap_alert_sent_month",
    )
    .eq("id", business_id)
    .maybeSingle();

  if (businessError || !business) {
    return NextResponse.json({ error: t.apiBusinessNotFound }, { status: 404 });
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
          ...reviewCapReachedEmail({
            locale: business.locale,
            businessName: business.name,
            cap: business.monthly_review_cap,
          }),
        });
      }
      return NextResponse.json({ error: t.apiCapReached }, { status: 403 });
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
    return NextResponse.json({ error: t.apiDuplicate }, { status: 429 });
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
    return NextResponse.json({ error: t.apiAnalysisFailed }, { status: 502 });
  }

  if (!analysis.is_valid_review) {
    return NextResponse.json(
      { error: analysis.rejection_reason ?? t.apiDefaultRejection },
      { status: 422 },
    );
  }

  // Step 2 — 40/30/30 weighted rating over whichever dimensions the AI
  // actually found grounded in the text. Null only in the rare case a valid
  // review says nothing that maps to product/service/delivery at all — a
  // neutral 3.0 is the only honest fallback left when there's truly no
  // dimension to weight.
  const weighted = computeWeightedRating(analysis) ?? 3.0;

  // Step 3 — inaction penalty: subtract penalty_factor for any detected issue
  // that matches an `open` recurring_issues row past its 30-day deadline.
  const { penalty, penalizedIssueLabels, newIssues } = await syncRecurringIssuesAndGetPenalty(
    admin,
    business_id,
    analysis.detected_issues,
  );

  const overallAiRating = clampRating(weighted - penalty);

  // The customer's own composite, same 40/30/30 weighting as the AI's —
  // renormalized over whichever categories they actually rated, so a fair,
  // like-for-like number to compare against overall_ai_rating.
  const customerStarRating = computeCustomerWeightedRating({
    product: customer_product_rating ?? null,
    service: customer_service_rating ?? null,
    delivery: customer_delivery_rating ?? null,
  });

  const { data: review, error: insertError } = await admin
    .from("reviews")
    .insert({
      business_id,
      customer_name,
      customer_email,
      review_text,
      customer_product_rating: customer_product_rating ?? null,
      customer_service_rating: customer_service_rating ?? null,
      customer_delivery_rating: customer_delivery_rating ?? null,
      customer_star_rating: customerStarRating,
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
    return NextResponse.json({ error: t.apiSaveFailed }, { status: 500 });
  }

  await sendEmail({
    to: customer_email,
    ...reviewConfirmationEmail({
      locale: visitorLocale,
      customerName: customer_name,
      businessName: business.name,
      overallRating: overallAiRating,
    }),
  });

  for (const issue of newIssues) {
    await sendEmail({
      to: business.contact_email,
      ...recurringIssueAlertEmail({
        locale: business.locale,
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
