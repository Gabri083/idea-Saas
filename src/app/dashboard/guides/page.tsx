import { redirect } from "next/navigation";
import { WidgetGuides } from "@/components/dashboard/widget-guides";
import { WidgetPlanAvailability } from "@/components/dashboard/widget-plan-availability";
import { getBusiness } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-locale";

// Unlinked from the dashboard nav (see nav-items.ts) until this page has real
// recorded install demos instead of just written steps — this redirect is the
// other half of that: it also blocks reaching it by typing the URL directly.
// Remove both once the videos are ready.
export default async function GuidesPage() {
  redirect("/dashboard/widget");

  const businessId = await requireBusinessId();
  const [business, dict] = await Promise.all([getBusiness(businessId), getDictionary()]);
  const t = dict.dashboard.guides;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      <WidgetPlanAvailability
        plan={business.plan}
        dict={t.availability}
        planLabel={dict.dashboard.planLabels[business.plan]}
        upgradeLabel={dict.dashboard.upgradeGate.viewPlans}
      />

      <WidgetGuides businessId={businessId} layoutNames={dict.dashboard.widget.layoutOptions} dict={t} />
    </div>
  );
}
