import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { PlanSection } from "@/components/dashboard/plan-section";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getBusiness } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export default async function SettingsPage() {
  const businessId = await requireBusinessId();
  const [business, dict, locale] = await Promise.all([
    getBusiness(businessId),
    getDictionary(),
    getLocale(),
  ]);
  const t = dict.dashboard.settings;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      <Card className="max-w-xl p-6">
        <h2 className="mb-4 text-lg font-medium">{t.businessInfoTitle}</h2>
        <SettingsForm business={business} dict={t.form} locale={locale} />
      </Card>

      <Card className="max-w-xl p-6">
        <h2 className="text-lg font-medium">{t.languageTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.languageSubtitle}</p>
        <div className="mt-4">
          <LanguageSwitcher locale={locale} />
        </div>
      </Card>

      <PlanSection
        currentPlan={business.plan}
        subscriptionStatus={business.subscription_status}
        hasSubscription={business.lemonsqueezy_subscription_id != null}
        dict={dict.dashboard.planSection}
      />
    </div>
  );
}
