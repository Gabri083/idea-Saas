import { CalibrationCenter } from "@/components/dashboard/calibration-center";
import { getCalibrationRequests, getRecurringIssues, getReviews } from "@/lib/data";
import { DEMO_BUSINESS_ID } from "@/lib/demo";

export default async function CalibrationPage({
  searchParams,
}: {
  searchParams: Promise<{ issueId?: string }>;
}) {
  const { issueId } = await searchParams;
  const [issues, reviews, requests] = await Promise.all([
    getRecurringIssues(DEMO_BUSINESS_ID),
    getReviews(DEMO_BUSINESS_ID),
    getCalibrationRequests(DEMO_BUSINESS_ID),
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
        businessId={DEMO_BUSINESS_ID}
        issues={issues}
        reviews={reviews}
        initialRequests={requests}
        focusIssueId={issueId}
      />
    </div>
  );
}
