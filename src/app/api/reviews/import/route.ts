import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  analyzeReviewText,
  clampRating,
  computeWeightedRating,
  reconcileDimensionScore,
} from "@/lib/ai/scoring";
import { syncRecurringIssues } from "@/lib/ai/recurring-issues";
import { getSessionBusinessId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-locale";

const MAX_ROWS_PER_REQUEST = 25;

const RowSchema = z.object({
  name: z.string().min(1).max(120),
  text: z.string().min(10).max(4000),
  date: z.string().optional(),
  // The rating the source platform gave — kept only as a reference value on
  // the row result, never written to the review. See the plan: passing it
  // through would let reconcileDimensionScore silently overrule the AI's
  // read with a number that was never a real per-dimension customer pick.
  rating: z.number().min(1).max(5).optional(),
});

const RequestSchema = z.object({
  platform: z.string().min(1).max(40),
  rows: z.array(RowSchema).min(1).max(MAX_ROWS_PER_REQUEST),
});

export async function POST(request: NextRequest) {
  const businessId = await getSessionBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const dict = await getDictionary();
  const t = dict.dashboard.reviews.import;

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: t.parseError }, { status: 400 });
  }
  const { platform, rows } = parsed.data;

  const admin = createAdminClient();

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select("id, category, business_description, monthly_review_cap")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError || !business) {
    return NextResponse.json({ error: t.parseError }, { status: 404 });
  }

  // Same cost/abuse control as the public submit endpoint — an import call
  // is still one OpenAI scoring call per row, so it counts against the same
  // monthly cap instead of being a free side door around it.
  let rowsToProcess = rows;
  let capReached = false;
  if (business.monthly_review_cap != null) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const { count } = await admin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", startOfMonth.toISOString());

    const remaining = Math.max(0, business.monthly_review_cap - (count ?? 0));
    if (rows.length > remaining) {
      rowsToProcess = rows.slice(0, remaining);
      capReached = true;
    }
  }

  const errors: { index: number; reason: string }[] = [];
  let imported = 0;

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i];
    try {
      const analysis = await analyzeReviewText(row.text, {
        category: business.category,
        business_description: business.business_description,
      });

      if (!analysis.is_valid_review) {
        errors.push({ index: i, reason: analysis.rejection_reason ?? t.parseError });
        continue;
      }

      const productScore = reconcileDimensionScore(analysis.product_score, null);
      const serviceScore = reconcileDimensionScore(analysis.service_score, null);
      const deliveryScore = reconcileDimensionScore(analysis.delivery_score, null);
      const weighted =
        computeWeightedRating({ product_score: productScore, service_score: serviceScore, delivery_score: deliveryScore }) ??
        3.0;
      const overallAiRating = clampRating(weighted);

      const { newIssues } = await syncRecurringIssues(admin, businessId, analysis.detected_issues);
      void newIssues; // no alert email for a bulk historical import

      const parsedDate = row.date ? new Date(row.date) : new Date();
      const createdAt = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      const { error: insertError } = await admin.from("reviews").insert({
        business_id: businessId,
        customer_name: row.name,
        customer_email: `imported+${crypto.randomUUID()}@kelsira.import`,
        review_text: row.text,
        customer_product_rating: null,
        customer_service_rating: null,
        customer_delivery_rating: null,
        customer_star_rating: null,
        product_score: productScore,
        service_score: serviceScore,
        delivery_score: deliveryScore,
        detected_issues: analysis.detected_issues,
        ai_summary: analysis.summary,
        ai_raw_response: analysis,
        overall_ai_rating: overallAiRating,
        penalty_applied: 0,
        status: "published",
        source: "imported",
        source_platform: platform,
        created_at: createdAt.toISOString(),
      });

      if (insertError) {
        errors.push({ index: i, reason: t.parseError });
        continue;
      }

      imported++;
    } catch (err) {
      console.error("review import row failed", err);
      errors.push({ index: i, reason: t.parseError });
    }
  }

  return NextResponse.json({ imported, total: rows.length, capReached, errors });
}
