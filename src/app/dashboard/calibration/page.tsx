import { CalibrationCenter } from "@/components/dashboard/calibration-center";
import { getCalibrationRequests, getRecurringIssues, getReviews } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";

export default async function CalibrationPage({
  searchParams,
}: {
  searchParams: Promise<{ issueId?: string }>;
}) {
  const { issueId } = await searchParams;
  const businessId = await requireBusinessId();
  const [issues, reviews, requests] = await Promise.all([
    getRecurringIssues(businessId),
    getReviews(businessId),
    getCalibrationRequests(businessId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Centro de calibración e histórico</h1>
        <p className="mt-1 text-sm text-muted">
          Si corregiste un problema operativo (ej. cambiaste de transportista), solicita aquí que
          las reseñas históricas asociadas se recalibren o archiven.
        </p>
      </div>

      <CalibrationCenter
        businessId={businessId}
        issues={issues}
        reviews={reviews}
        initialRequests={requests}
        focusIssueId={issueId}
      />
    </div>
  );
}
