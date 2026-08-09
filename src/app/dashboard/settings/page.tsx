import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { PlanSection } from "@/components/dashboard/plan-section";
import { getBusiness } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";

export default async function SettingsPage() {
  const businessId = await requireBusinessId();
  const business = await getBusiness(businessId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted">
          Datos de tu negocio, el contexto que usa la IA, y tu plan.
        </p>
      </div>

      <Card className="max-w-xl p-6">
        <h2 className="mb-4 text-lg font-medium">Información del negocio</h2>
        <SettingsForm business={business} />
      </Card>

      <PlanSection currentPlan={business.plan} />
    </div>
  );
}
