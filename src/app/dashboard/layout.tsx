import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { getBusiness, isSupabaseConfigured } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const businessId = await requireBusinessId();
  const business = await getBusiness(businessId);

  return (
    <div className="flex min-w-0 flex-1 overflow-x-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar business={business} demoMode={!isSupabaseConfigured()} />
        <MobileNav />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
