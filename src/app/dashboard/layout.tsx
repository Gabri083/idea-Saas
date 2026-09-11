import { cookies } from "next/headers";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { getBusiness, getReviews, isSupabaseConfigured } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { countReviewsThisMonth } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/get-locale";
import { THEME_COOKIE, DEFAULT_DASHBOARD_THEME, isDashboardTheme, dashboardThemeStyle } from "@/lib/theme";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const businessId = await requireBusinessId();
  const [business, reviews, dict, cookieStore] = await Promise.all([
    getBusiness(businessId),
    getReviews(businessId),
    getDictionary(),
    cookies(),
  ]);
  const themeValue = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isDashboardTheme(themeValue) ? themeValue : DEFAULT_DASHBOARD_THEME;

  return (
    // h-screen + overflow-hidden here, instead of letting the document
    // itself grow and scroll: without a bounded height, `main`'s own
    // overflow-y-auto below never actually engages (a flex item with no
    // min-height cap just grows to fit its content instead of scrolling),
    // so the whole page — including the sidebar — scrolled together as one
    // long document. Bounding the shell to the viewport and giving every
    // flex link down to `main` a min-h-0 makes `main` the one thing that
    // scrolls, so the sidebar and topbar now stay in place on every page.
    <div
      className="flex h-screen min-w-0 overflow-hidden bg-background text-foreground"
      style={dashboardThemeStyle(theme)}
    >
      <Sidebar
        plan={business.plan}
        usage={{ used: countReviewsThisMonth(reviews), cap: business.monthly_review_cap }}
        dict={{
          nav: dict.dashboard.nav,
          backToSite: dict.dashboard.backToSite,
          planUsage: dict.dashboard.planUsage,
          planLabels: dict.dashboard.planLabels,
          viewPlans: dict.dashboard.upgradeGate.viewPlans,
        }}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar business={business} demoMode={!isSupabaseConfigured()} dict={dict.dashboard} />
        <MobileNav plan={business.plan} dict={{ nav: dict.dashboard.nav }} />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
