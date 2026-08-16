import { ConsultantPanel } from "@/components/dashboard/consultant-panel";
import { UpgradeGate } from "@/components/dashboard/upgrade-gate";
import { getBusiness, getRecurringIssues } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { hasGrowthAccess } from "@/lib/types";

export default async function ConsultantPage() {
  const businessId = await requireBusinessId();
  const business = await getBusiness(businessId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Consultor IA de Mejora Operativa</h1>
        <p className="mt-1 text-sm text-muted">
          Fallas recurrentes agrupadas automáticamente a partir de tus reseñas, con un plazo de
          30 días antes de que penalicen tu puntaje.
        </p>
      </div>

      {hasGrowthAccess(business.plan) ? (
        <ConsultantPanel issues={await getRecurringIssues(businessId)} />
      ) : (
        <UpgradeGate
          feature="El Consultor IA"
          description="Agrupa automáticamente las fallas operativas recurrentes detectadas en tus reseñas y te avisa antes de que penalicen tu puntaje. Disponible en los planes Growth y Enterprise."
        />
      )}
    </div>
  );
}
