import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/data";
import { generateMonthlyReportInsights, type MonthlyReportStats } from "@/lib/ai/monthly-report";
import { monthlyReportEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import type { BusinessCategory } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

// Enterprise businesses are few for now, and this makes one sequential
// OpenAI call per business — no batching/queue infrastructure needed yet
// (same reasoning as the CSV importer's 25-row chunking), but a longer
// function timeout keeps a slightly larger run from getting cut off.
export const maxDuration = 300;

interface EnterpriseBusinessRow {
  id: string;
  name: string;
  contact_email: string;
  category: BusinessCategory | null;
  business_description: string | null;
  locale: Locale;
  monthly_report_sent_month: string | null;
}

const avg = (nums: number[]): number | null => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);
const round1 = (n: number | null): number | null => (n == null ? null : Math.round(n * 10) / 10);

// Same "a full star or more" threshold as OVERALL_CONFIRM_EPSILON in
// lib/utils.ts's isConfirmed() — the one already used to decide whether a
// review gets the "!" fairness note. Kept as its own constant here since
// that one isn't exported, but it's the same definition of "the AI
// meaningfully corrected the customer's own pick."
const UNFAIR_SAVE_THRESHOLD = 1;

function currentYearMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

/**
 * Vercel Cron fires this on the 1st of every month (see vercel.json) to send
 * Enterprise businesses an AI-written monthly report — what's going well,
 * what's failing, what to do about it — built from data the rest of the app
 * already computes (reviews, recurring issues), not a new scoring pass.
 * Protected the same way Vercel's own docs recommend: it sends
 * `Authorization: Bearer $CRON_SECRET` automatically when that env var is
 * set, so anyone else calling this URL without the secret gets a 401.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ skipped: "Supabase not configured" });
  }

  const admin = createAdminClient();
  const month = currentYearMonth();

  const { data: businesses } = await admin
    .from("businesses")
    .select("id, name, contact_email, category, business_description, locale, monthly_report_sent_month")
    .eq("plan", "enterprise");

  // .neq() on a nullable column excludes NULL rows in Postgres, which would
  // wrongly skip every business that has never received a report yet — so
  // the "already sent this month" check happens here instead.
  const pending = ((businesses ?? []) as EnterpriseBusinessRow[]).filter(
    (b) => b.monthly_report_sent_month !== month,
  );

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30);
  const periodStartIso = periodStart.toISOString();

  const results: { businessId: string; sent: boolean }[] = [];

  for (const business of pending) {
    const { data: reviewRows } = await admin
      .from("reviews")
      .select("overall_ai_rating, customer_star_rating, product_score, service_score, delivery_score, ai_summary")
      .eq("business_id", business.id)
      .in("status", ["published", "resolved"])
      .gte("created_at", periodStartIso);

    const reviews = reviewRows ?? [];

    if (reviews.length === 0) {
      await admin.from("businesses").update({ monthly_report_sent_month: month }).eq("id", business.id);
      results.push({ businessId: business.id, sent: false });
      continue;
    }

    const { data: issueRows } = await admin
      .from("recurring_issues")
      .select("issue_label, occurrences")
      .eq("business_id", business.id)
      .neq("status", "resolved")
      .order("occurrences", { ascending: false })
      .limit(5);

    const openIssues = (issueRows ?? []).map((i) => ({ label: i.issue_label, occurrences: i.occurrences }));
    const savedFromUnfairCount = reviews.filter(
      (r) => r.customer_star_rating != null && r.overall_ai_rating - r.customer_star_rating >= UNFAIR_SAVE_THRESHOLD,
    ).length;

    const stats: MonthlyReportStats = {
      reviewCount: reviews.length,
      avgAiRating: round1(avg(reviews.map((r) => r.overall_ai_rating))) ?? 0,
      avgCustomerRating: round1(
        avg(reviews.map((r) => r.customer_star_rating).filter((v): v is number => v != null)),
      ),
      dimensionAverages: {
        product: round1(avg(reviews.map((r) => r.product_score).filter((v): v is number => v != null))),
        service: round1(avg(reviews.map((r) => r.service_score).filter((v): v is number => v != null))),
        delivery: round1(avg(reviews.map((r) => r.delivery_score).filter((v): v is number => v != null))),
      },
      openIssues,
      topIssue: openIssues[0] ?? null,
      savedFromUnfairCount,
      summarySample: reviews
        .map((r) => r.ai_summary)
        .filter((s): s is string => Boolean(s))
        .slice(0, 200),
    };

    const insights = await generateMonthlyReportInsights(
      business.locale,
      business.category,
      business.business_description,
      stats,
    );

    const period = new Date().toLocaleDateString(business.locale === "en" ? "en-US" : "es", {
      month: "long",
      year: "numeric",
    });

    const { subject, html } = monthlyReportEmail({
      locale: business.locale,
      businessName: business.name,
      period,
      reviewCount: stats.reviewCount,
      avgAiRating: stats.avgAiRating,
      savedFromUnfairCount: stats.savedFromUnfairCount,
      topIssue: stats.topIssue,
      insights,
    });

    await sendEmail({ to: business.contact_email, subject, html });
    await admin.from("businesses").update({ monthly_report_sent_month: month }).eq("id", business.id);
    results.push({ businessId: business.id, sent: true });
  }

  return NextResponse.json({ month, processed: results.length, results });
}
