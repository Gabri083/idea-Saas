import Link from "next/link";
import { ArrowDown, ArrowUp, Minus, Sparkles, Star, MessagesSquare, AlertTriangle, ArrowUpRight } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PlanUsageCard } from "@/components/dashboard/plan-usage-card";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getBusiness, getCategoryBenchmark, getRecurringIssues, getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { formatDate, isPastDeadline, recencyWeightedAverage } from "@/lib/utils";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";
import { getCategoryLabels, hasGrowthAccess } from "@/lib/types";

export default async function DashboardOverviewPage() {
  const businessId = await requireBusinessId();
  const [business, reviews, recurringIssues, dict, locale] = await Promise.all([
    getBusiness(businessId),
    getReviews(businessId),
    getRecurringIssues(businessId),
    getDictionary(),
    getLocale(),
  ]);
  const t = dict.dashboard.overview;
  const benchmark = hasGrowthAccess(business.plan)
    ? await getCategoryBenchmark(business.category, businessId)
    : { available: false as const };

  // UTC to match the cap enforcement in /api/reviews.
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const usedThisMonth = reviews.filter((r) => new Date(r.created_at) >= startOfMonth).length;

  const avgAi = recencyWeightedAverage(reviews, (r) => r.overall_ai_rating);
  const customerRated = reviews.filter((r) => r.customer_star_rating != null);
  const avgCustomer = recencyWeightedAverage(customerRated, (r) => r.customer_star_rating!);
  const openAlerts = recurringIssues.filter(
    (i) => i.status === "open" && isPastDeadline(i.resolution_deadline),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Sparkles}
          tone="cobalt"
          label={t.aiAvgLabel}
          value={`${avgAi.toFixed(1)}★`}
          hint={t.aiAvgHint}
        />
        <MetricCard
          icon={Star}
          tone="amber"
          label={t.customerAvgLabel}
          value={customerRated.length ? `${avgCustomer.toFixed(1)}★` : "—"}
          hint={t.customerAvgHint}
        />
        <MetricCard
          icon={MessagesSquare}
          label={t.totalReviewsLabel}
          value={String(reviews.length)}
          hint={t.totalReviewsHint}
        />
        <MetricCard
          icon={AlertTriangle}
          tone={openAlerts.length > 0 ? "amber" : "emerald"}
          label={t.alertsLabel}
          value={String(openAlerts.length)}
          hint={t.alertsHint}
        />
      </div>

      <PlanUsageCard used={usedThisMonth} cap={business.monthly_review_cap} dict={dict.dashboard.planUsage} />

      {benchmark.available && business.category && (
        <Card className="p-5">
          <p className="text-sm font-medium">{t.benchmarkTitle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-muted">{t.yourAverage}</p>
              <p className="text-2xl font-semibold tracking-tight">{avgAi.toFixed(1)}★</p>
            </div>
            <div>
              <p className="text-xs text-muted">{t.categoryAverage}</p>
              <p className="text-2xl font-semibold tracking-tight text-muted">{benchmark.average.toFixed(1)}★</p>
            </div>
            {(() => {
              const delta = avgAi - benchmark.average;
              const toneClass = delta > 0.05 ? "text-emerald" : delta < -0.05 ? "text-rose" : "text-muted";
              const Icon = delta > 0.05 ? ArrowUp : delta < -0.05 ? ArrowDown : Minus;
              const label = delta > 0.05 ? t.aboveAverage : delta < -0.05 ? t.belowAverage : t.onAverage;
              return (
                <div className={`flex items-center gap-1.5 text-sm ${toneClass}`}>
                  <Icon size={15} />
                  {Math.abs(delta) >= 0.05 && <span className="font-semibold">{Math.abs(delta).toFixed(1)}</span>}
                  {label}
                </div>
              );
            })()}
          </div>
          <p className="mt-3 text-xs text-muted">
            {t.benchmarkSample
              .replace("{n}", String(benchmark.businessCount))
              .replace("{category}", getCategoryLabels(locale)[business.category].toLowerCase())}
          </p>
        </Card>
      )}

      {openAlerts.length > 0 && (
        <Card className="border-amber/30 bg-amber/[0.05] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t.alertBanner(openAlerts.length)}</p>
              <p className="mt-1 text-sm text-muted">
                {openAlerts.map((i) => i.issue_label).join(" · ")}
              </p>
            </div>
            <Link
              href="/dashboard/consultant"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber hover:underline"
            >
              {t.viewConsultant} <ArrowUpRight size={14} />
            </Link>
          </div>
        </Card>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">{t.recentReviews}</h2>
          <Link href="/dashboard/reviews" className="text-sm text-cobalt hover:underline">
            {t.viewAll}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {reviews.slice(0, 4).map((review) => (
            <Card key={review.id} className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{review.customer_name}</p>
                  <span className="text-xs text-muted">{formatDate(review.created_at)}</span>
                  {review.status === "in_appeal" && <Badge tone="amber">{t.inAppeal}</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{review.review_text}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StarRating value={review.overall_ai_rating} size={14} />
                <span className="text-sm font-semibold">{review.overall_ai_rating.toFixed(1)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
