import { ConsultantPanel } from "@/components/dashboard/consultant-panel";
import { UpgradeGate } from "@/components/dashboard/upgrade-gate";
import { getBusiness, getRecurringIssues } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { hasGrowthAccess } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function ConsultantPage() {
  const businessId = await requireBusinessId();
  const [business, dict] = await Promise.all([getBusiness(businessId), getDictionary()]);
  const t = dict.dashboard.consultant;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      {hasGrowthAccess(business.plan) ? (
        <ConsultantPanel issues={await getRecurringIssues(businessId)} dict={t} />
      ) : (
        <UpgradeGate
          title={t.gateTitle}
          description={t.gateDescription}
          viewPlansLabel={dict.dashboard.upgradeGate.viewPlans}
        />
      )}
    </div>
  );
}
