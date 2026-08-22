import { AppealsManager } from "@/components/dashboard/appeals-manager";
import { getAppeals, getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function AppealsPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewId?: string }>;
}) {
  const { reviewId } = await searchParams;
  const businessId = await requireBusinessId();
  const [reviews, appeals, dict] = await Promise.all([
    getReviews(businessId),
    getAppeals(businessId),
    getDictionary(),
  ]);
  const t = dict.dashboard.appeals;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      <AppealsManager
        businessId={businessId}
        reviews={reviews}
        initialAppeals={appeals}
        defaultReviewId={reviewId}
        dict={t}
      />
    </div>
  );
}
