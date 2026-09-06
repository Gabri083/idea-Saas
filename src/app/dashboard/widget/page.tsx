import { WidgetConfigurator } from "@/components/dashboard/widget-configurator";
import { LinksEmbedsCard } from "@/components/dashboard/links-embeds-card";
import { LogoUploader } from "@/components/dashboard/logo-uploader";
import { getBusiness, getCategoryBenchmark, getReviews, getWidgetConfig } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getCategoryLabels, hasGrowthAccess } from "@/lib/types";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      <LogoUploader initialLogoUrl={business.logo_url} canCustomize={canCustomize} dict={t} />

      <WidgetConfigurator
        businessId={businessId}
        businessName={business.name}
        initialConfig={effectiveConfig}
        reviews={publicReviews}
        canCustomize={canCustomize}
        benchmark={benchmark}
        categoryLabel={categoryLabel}
        dict={t}
      />

      <LinksEmbedsCard businessId={businessId} dict={t} />
    </div>
  );
}
