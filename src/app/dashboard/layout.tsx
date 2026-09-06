import { cookies } from "next/headers";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { getBusiness, isSupabaseConfigured } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-locale";
import { THEME_COOKIE, DEFAULT_DASHBOARD_THEME, isDashboardTheme, dashboardThemeStyle } from "@/lib/theme";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const businessId = await requireBusinessId();
  const [business, dict, cookieStore] = await Promise.all([getBusiness(businessId), getDictionary(), cookies()]);
  const themeValue = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isDashboardTheme(themeValue) ? themeValue : DEFAULT_DASHBOARD_THEME;

  return (
    <div
      className="flex min-w-0 flex-1 overflow-x-hidden bg-background text-foreground"
      style={dashboardThemeStyle(theme)}
    >
      <Sidebar plan={business.plan} dict={{ nav: dict.dashboard.nav, backToSite: dict.dashboard.backToSite }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar business={business} demoMode={!isSupabaseConfigured()} dict={dict.dashboard} />
        <MobileNav plan={business.plan} dict={{ nav: dict.dashboard.nav }} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
