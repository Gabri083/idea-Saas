import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { appealResolvedEmail, reviewRemovedEmail } from "@/lib/email-templates";

const BodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
  resolution_notes: z.string().max(2000).optional(),
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

  const { status, resolution_notes } = parsed.data;

  await admin
    .from("appeals")
    .update({
      status,
      resolution_notes: resolution_notes ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Binary outcome, same as Trustpilot/Google: the review either stands
  // exactly as published (rejected), or gets removed entirely for violating
  // guidelines (approved). Kelsira's AI never re-scores or edits a review
  // that stays up — there's no "corrected score" path, on purpose: a number
  // nobody can see the reasoning for isn't something anyone should trust.
  await admin
    .from("reviews")
    .update({ status: status === "approved" ? "archived" : "published" })
    .eq("id", appeal.review_id);

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

    if (status === "approved") {
      const { data: review } = await admin
        .from("reviews")
        .select("customer_name, customer_email")
        .eq("id", appeal.review_id)
        .maybeSingle();

      if (review) {
        await sendEmail({
          to: review.customer_email,
          ...reviewRemovedEmail({
            locale: business.locale,
            customerName: review.customer_name,
            businessName: business.name,
          }),
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
