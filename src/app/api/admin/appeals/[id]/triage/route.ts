import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/data";
import { triageAppeal } from "@/lib/ai/appeal-triage";
import type { BusinessCategory } from "@/lib/types";

interface AppealWithContext {
  reason: string;
  evidence_urls: string[];
  business: { category: BusinessCategory | null } | null;
  review: {
    review_text: string;
    overall_ai_rating: number;
    product_score: number | null;
    service_score: number | null;
    delivery_score: number | null;
  } | null;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "No disponible en modo demo." }, { status: 404 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("appeals")
    .select(
      "reason, evidence_urls, business:businesses(category), review:reviews(review_text, overall_ai_rating, product_score, service_score, delivery_score)",
    )
    .eq("id", id)
    .maybeSingle();

  const appeal = data as AppealWithContext | null;
  if (!appeal || !appeal.review) {
    return NextResponse.json({ error: "Apelación no encontrada." }, { status: 404 });
  }

  try {
    const result = await triageAppeal({
      appealReason: appeal.reason,
      evidenceCount: appeal.evidence_urls.length,
      review: {
        reviewText: appeal.review.review_text,
        overallRating: appeal.review.overall_ai_rating,
        productScore: appeal.review.product_score,
        serviceScore: appeal.review.service_score,
        deliveryScore: appeal.review.delivery_score,
      },
      businessCategory: appeal.business?.category ?? null,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "No se pudo generar la sugerencia." }, { status: 500 });
  }
}
