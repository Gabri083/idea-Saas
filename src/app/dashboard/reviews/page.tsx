import { Download } from "lucide-react";
import { ReviewsTable } from "@/components/dashboard/reviews-table";
import { getBusiness, getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-locale";
import { hasGrowthAccess } from "@/lib/types";

export default async function ReviewsPage() {
  const businessId = await requireBusinessId();
  const [reviews, business, dict] = await Promise.all([
    getReviews(businessId),
    getBusiness(businessId),
    getDictionary(),
  ]);
  const t = dict.dashboard.reviews;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
          <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page navigation */}
        <a
          href="/api/reviews/export"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <Download size={14} /> {t.exportCsv}
        </a>
      </div>

      <ReviewsTable initialReviews={reviews} dict={t} canSuggestReply={hasGrowthAccess(business.plan)} />
    </div>
  );
}
