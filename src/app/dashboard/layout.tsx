import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { getBusiness, isSupabaseConfigured } from "@/lib/data";
import { DEMO_BUSINESS_ID } from "@/lib/demo";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await getBusiness(DEMO_BUSINESS_ID);

  return (
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar business={business} demoMode={!isSupabaseConfigured()} />
        <main className="flex-1 overflow-y-auto bg-background px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
