import { ConsultantPanel } from "@/components/dashboard/consultant-panel";
import { getRecurringIssues } from "@/lib/data";
import { DEMO_BUSINESS_ID } from "@/lib/demo";

export default async function ConsultantPage() {
  const issues = await getRecurringIssues(DEMO_BUSINESS_ID);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Consultor IA de Mejora Operativa</h1>
        <p className="mt-1 text-sm text-muted">
          Fallas recurrentes agrupadas automáticamente a partir de tus reseñas, con un plazo de
          30 días antes de que penalicen tu puntaje.
        </p>
      </div>

      <ConsultantPanel issues={issues} />
    </div>
  );
}
