import { WidgetConfigurator } from "@/components/dashboard/widget-configurator";
import { LinksEmbedsCard } from "@/components/dashboard/links-embeds-card";
import { getBusiness, getCategoryBenchmark, getReviews, getWidgetConfig } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getCategoryLabels, hasGrowthAccess } from "@/lib/types";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

// Two clearly separated tools live on this page — showing existing reviews
// and collecting new ones — so each gets its own numbered header instead of
// blurring together into one long, undifferentiated scroll.
function SectionHeader({ index, title, subtitle }: { index: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cobalt/15 text-xs font-bold text-cobalt">
        {index}
      </span>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export default async function WidgetPage() {
  const businessId = await requireBusinessId();
  const [business, config, reviews, dict, locale] = await Promise.all([
    getBusiness(businessId),
    getWidgetConfig(businessId),
    getReviews(businessId),
    getDictionary(),
    getLocale(),
  ]);
  const t = dict.dashboard.widget;
  const benchmark = await getCategoryBenchmark(business.category, businessId);
  const categoryLabel = business.category ? getCategoryLabels(locale)[business.category] : t.comparatorSampleCategory;

  const publicReviews = reviews.filter((r) => r.status === "published" || r.status === "resolved");
  const canCustomize = hasGrowthAccess(business.plan);
  // Mirror the public widget API's rule: free/starter always show the Kelsira badge,
  // no matter what was saved while the business was previously on a higher plan.
  const effectiveConfig = canCustomize ? config : { ...config, show_branding: true };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader index={1} title={t.section1Title} subtitle={t.section1Subtitle} />
        <WidgetConfigurator
          businessId={businessId}
          businessName={business.name}
          initialConfig={effectiveConfig}
          reviews={publicReviews}
          canCustomize={canCustomize}
          benchmark={benchmark}
          categoryLabel={categoryLabel}
          logoUrl={business.logo_url}
          dict={t}
        />
      </section>

      <hr className="border-dashed border-border" />

      <section className="flex flex-col gap-4">
        <SectionHeader index={2} title={t.linksCardTitle} subtitle={t.linksCardSubtitle} />
        <LinksEmbedsCard businessId={businessId} dict={t} />
      </section>
    </div>
  );
}
