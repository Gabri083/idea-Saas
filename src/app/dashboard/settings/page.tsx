import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { PlanSection } from "@/components/dashboard/plan-section";
import { TeamSection } from "@/components/dashboard/team-section";
import { getBusiness, getTeamMembers } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";

export default async function SettingsPage() {
  const businessId = await requireBusinessId();
  const [business, teamMembers] = await Promise.all([
    getBusiness(businessId),
    getTeamMembers(businessId),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted">
          Datos de tu negocio, el contexto que usa la IA, tu equipo, y tu plan.
        </p>
      </div>

      <Card className="max-w-xl p-6">
        <h2 className="mb-4 text-lg font-medium">Información del negocio</h2>
        <SettingsForm business={business} />
      </Card>

      <TeamSection initialMembers={teamMembers} />

      <PlanSection
        currentPlan={business.plan}
        subscriptionStatus={business.subscription_status}
        customerPortalUrl={business.customer_portal_url}
      />
    </div>
  );
}
