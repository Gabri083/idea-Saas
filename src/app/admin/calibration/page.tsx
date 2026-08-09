import { AdminCalibrationList } from "@/components/admin/admin-calibration-list";
import { getAllCalibrationRequests } from "@/lib/admin-data";

export default async function AdminCalibrationPage() {
  const requests = await getAllCalibrationRequests();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Solicitudes de calibración</h1>
        <p className="mt-1 text-sm text-muted">
          Al aprobar, el problema recurrente queda marcado como resuelto y deja de penalizar
          nuevas reseñas.
        </p>
      </div>

      <AdminCalibrationList requests={requests} />
    </div>
  );
}
