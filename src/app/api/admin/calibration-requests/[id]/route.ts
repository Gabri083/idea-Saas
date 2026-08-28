import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { reinviteToReReviewEmail } from "@/lib/email-templates";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";

const BodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
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

  const { data: calibrationRequest } = await admin
    .from("calibration_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!calibrationRequest) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }

  const { status } = parsed.data;

  await admin
    .from("calibration_requests")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (status === "approved") {
    const { data: issue } = await admin
      .from("recurring_issues")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_evidence: calibrationRequest.evidence,
        updated_at: new Date().toISOString(),
      })
      .eq("id", calibrationRequest.recurring_issue_id)
      .select("issue_label")
      .single();

    await sendReinviteEmails(admin, calibrationRequest, issue?.issue_label ?? calibrationRequest.evidence);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Approving a calibration request is the proof point that a business fixed
 * an issue its own customers flagged — invite exactly those customers back,
 * once, so a stale request re-approved (or retried) can't double-send.
 */
async function sendReinviteEmails(
  admin: ReturnType<typeof createAdminClient>,
  calibrationRequest: { id: string; business_id: string; affected_review_ids: string[]; discount_code: string | null; reinvite_sent_at: string | null },
  issueLabel: string,
) {
  if (calibrationRequest.reinvite_sent_at) return;
  if (calibrationRequest.affected_review_ids.length === 0) return;

  const { data: business } = await admin
    .from("businesses")
    .select("name, locale")
    .eq("id", calibrationRequest.business_id)
    .maybeSingle();
  if (!business) return;

  const { data: reviews } = await admin
    .from("reviews")
    .select("customer_name, customer_email")
    .in("id", calibrationRequest.affected_review_ids);
  if (!reviews || reviews.length === 0) return;

  const locale = (business.locale as Locale) ?? "es";
  const reviewUrl = `${SITE_URL}/review/${calibrationRequest.business_id}`;

  const seenEmails = new Set<string>();
  for (const review of reviews) {
    const email = review.customer_email.toLowerCase();
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);

    await sendEmail({
      to: review.customer_email,
      ...reinviteToReReviewEmail({
        locale,
        customerName: review.customer_name,
        businessName: business.name,
        issueLabel,
        discountCode: calibrationRequest.discount_code,
        reviewUrl,
      }),
    });
  }

  await admin
    .from("calibration_requests")
    .update({ reinvite_sent_at: new Date().toISOString() })
    .eq("id", calibrationRequest.id);
}
