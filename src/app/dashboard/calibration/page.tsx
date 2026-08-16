import { CalibrationCenter } from "@/components/dashboard/calibration-center";
import { UpgradeGate } from "@/components/dashboard/upgrade-gate";
import { getBusiness, getCalibrationRequests, getRecurringIssues, getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { hasGrowthAccess } from "@/lib/types";

export default async function CalibrationPage({
  searchParams,
}: {
  searchParams: Promise<{ issueId?: string }>;
}) {
  const { issueId } = await searchParams;
  const businessId = await requireBusinessId();
  const business = await getBusiness(businessId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Centro de calibración e histórico</h1>
        <p className="mt-1 text-sm text-muted">
          Si corregiste un problema operativo (ej. cambiaste de transportista), solicita aquí que
          las reseñas históricas asociadas se recalibren o archiven.
        </p>
      </div>

      {hasGrowthAccess(business.plan) ? (
        <CalibrationCenterLoader businessId={businessId} issueId={issueId} />
      ) : (
        <UpgradeGate
          feature="El Centro de Calibración"
          description="Solicita que las reseñas históricas asociadas a un problema ya resuelto se recalibren o archiven, con evidencia. Disponible en los planes Growth y Enterprise."
        />
      )}
    </div>
  );
}

async function CalibrationCenterLoader({
  businessId,
  issueId,
}: {
  businessId: string;
  issueId?: string;
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
    />
  );
}
