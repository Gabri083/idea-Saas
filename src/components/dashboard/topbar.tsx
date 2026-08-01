import { Badge } from "@/components/ui/badge";
import type { Business } from "@/lib/types";

const planLabel: Record<Business["plan"], string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

export function Topbar({
  business,
  demoMode,
}: {
  business: Business;
  demoMode: boolean;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background/60 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium">{business.name}</p>
        <p className="text-xs text-muted">{business.contact_email}</p>
      </div>
      <div className="flex items-center gap-2">
        {demoMode && <Badge tone="amber">Modo demo — datos de ejemplo</Badge>}
        <Badge tone="cobalt">Plan {planLabel[business.plan]}</Badge>
      </div>
    </header>
  );
}
