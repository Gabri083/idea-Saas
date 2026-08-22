import { AdminCalibrationList } from "@/components/admin/admin-calibration-list";
import { getAllCalibrationRequests } from "@/lib/admin-data";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function AdminCalibrationPage() {
  const [requests, dict] = await Promise.all([getAllCalibrationRequests(), getDictionary()]);
  const t = dict.admin;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.calibration.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.calibration.pageSubtitle}</p>
      </div>

      <AdminCalibrationList requests={requests} dict={t} />
    </div>
  );
}
