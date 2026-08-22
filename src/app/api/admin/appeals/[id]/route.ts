import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/auth";
import { computeWeightedRating } from "@/lib/ai/scoring";
import { sendEmail } from "@/lib/email";
import { appealResolvedEmail } from "@/lib/email-templates";

const ScoreSchema = z.object({
  product_score: z.number().min(1).max(5),
  service_score: z.number().min(1).max(5),
  delivery_score: z.number().min(1).max(5),
});

const BodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
  resolution_notes: z.string().max(2000).optional(),
  // Present only when the review is legitimate but was scored unfairly —
  // corrects the facts instead of taking the review down.
  corrected_scores: ScoreSchema.optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: appeal } = await admin.from("appeals").select("*").eq("id", id).maybeSingle();
  if (!appeal) {
    return NextResponse.json({ error: "Apelación no encontrada." }, { status: 404 });
  }

  const { status, resolution_notes, corrected_scores } = parsed.data;

  await admin
    .from("appeals")
    .update({
      status,
      resolution_notes: resolution_notes ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (status === "rejected") {
    // The review stands as originally published.
    await admin.from("reviews").update({ status: "published" }).eq("id", appeal.review_id);
  } else if (corrected_scores) {
    // Legitimate review, but the facts/score were wrong — fix the score,
    // keep the review (and the customer's original text) published.
    const overall_ai_rating = computeWeightedRating(corrected_scores);
    await admin
      .from("reviews")
      .update({ ...corrected_scores, overall_ai_rating, status: "published" })
      .eq("id", appeal.review_id);
  } else {
    // No corrected score given — the review itself was false/defamatory, take it down.
    await admin.from("reviews").update({ status: "archived" }).eq("id", appeal.review_id);
  }

  const { data: business } = await admin
    .from("businesses")
    .select("name, contact_email, locale")
    .eq("id", appeal.business_id)
    .maybeSingle();

  if (business) {
    await sendEmail({
      to: business.contact_email,
      ...appealResolvedEmail({
        locale: business.locale,
        businessName: business.name,
        status,
        resolutionNotes: resolution_notes ?? null,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
