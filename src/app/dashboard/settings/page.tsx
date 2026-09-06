import { cookies } from "next/headers";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { PlanSection } from "@/components/dashboard/plan-section";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { getBusiness } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";
import { THEME_COOKIE, DEFAULT_DASHBOARD_THEME, isDashboardTheme } from "@/lib/theme";

const PORTAL_ERROR_KEYS = {
  not_configured: "portalErrorNotConfigured",
  no_subscription: "portalErrorNoSubscription",
  unavailable: "portalErrorUnavailable",
} as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ portal_error?: string; portal_error_detail?: string }>;
}) {
  const businessId = await requireBusinessId();
  const [business, dict, locale, cookieStore, { portal_error, portal_error_detail }] = await Promise.all([
    getBusiness(businessId),
    getDictionary(),
    getLocale(),
    cookies(),
    searchParams,
  ]);
  const t = dict.dashboard.settings;
  const themeValue = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isDashboardTheme(themeValue) ? themeValue : DEFAULT_DASHBOARD_THEME;
  const portalErrorKey =
    portal_error && portal_error in PORTAL_ERROR_KEYS
      ? PORTAL_ERROR_KEYS[portal_error as keyof typeof PORTAL_ERROR_KEYS]
      : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      {portalErrorKey && (
        <div className="rounded-xl border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-amber">
          <p>{dict.dashboard.planSection[portalErrorKey]}</p>
          {portal_error_detail && (
            <p className="mt-1 break-words font-mono text-xs opacity-80">{portal_error_detail}</p>
          )}
        </div>
      )}

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

      <Card className="max-w-xl p-6">
        <h2 className="text-lg font-medium">{t.appearanceTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.appearanceSubtitle}</p>
        <div className="mt-4">
          <ThemeToggle theme={theme} lightLabel={t.themeLight} darkLabel={t.themeDark} />
        </div>
      </Card>

      <PlanSection
        currentPlan={business.plan}
        subscriptionStatus={business.subscription_status}
        hasSubscription={business.lemonsqueezy_subscription_id != null}
        dict={dict.dashboard.planSection}
      />

      <Card className="max-w-xl p-6">
        <h2 className="text-lg font-medium">{t.accountTitle}</h2>
        <div className="mt-4">
          <LogoutButton label={dict.dashboard.logout} />
        </div>
      </Card>
    </div>
  );
}
