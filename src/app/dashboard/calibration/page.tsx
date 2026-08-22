import { CalibrationCenter } from "@/components/dashboard/calibration-center";
import { UpgradeGate } from "@/components/dashboard/upgrade-gate";
import { getBusiness, getCalibrationRequests, getRecurringIssues, getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { hasGrowthAccess } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/get-locale";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export default async function CalibrationPage({
  searchParams,
}: {
  searchParams: Promise<{ issueId?: string }>;
}) {
  const { issueId } = await searchParams;
  const businessId = await requireBusinessId();
  const [business, dict] = await Promise.all([getBusiness(businessId), getDictionary()]);
  const t = dict.dashboard.calibration;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      {hasGrowthAccess(business.plan) ? (
        <CalibrationCenterLoader businessId={businessId} issueId={issueId} dict={t} />
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

async function CalibrationCenterLoader({
  businessId,
  issueId,
  dict,
}: {
  businessId: string;
  issueId?: string;
  dict: Dictionary["dashboard"]["calibration"];
}) {
  const [issues, reviews, requests] = await Promise.all([
    getRecurringIssues(businessId),
    getReviews(businessId),
    getCalibrationRequests(businessId),
  ]);

  return (
    <CalibrationCenter
      businessId={businessId}
      issues={issues}
      reviews={reviews}
      initialRequests={requests}
      focusIssueId={issueId}
      dict={dict}
    />
  );
}
