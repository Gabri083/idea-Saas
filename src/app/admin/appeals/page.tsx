import { AdminAppealsList } from "@/components/admin/admin-appeals-list";
import { getAllAppeals } from "@/lib/admin-data";

export default async function AdminAppealsPage() {
  const appeals = await getAllAppeals();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Apelaciones</h1>
        <p className="mt-1 text-sm text-muted">
          Revisa la evidencia y decide si la reseña se archiva o sigue publicada.
        </p>
      </div>

      <AdminAppealsList appeals={appeals} />
    </div>
  );
}
