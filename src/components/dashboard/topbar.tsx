import { Badge } from "@/components/ui/badge";
import type { Business } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Plan and "log out" used to live here too — both moved to Settings
// (PlanSection already shows the current plan in full, and the account
// section there now carries the logout button), so this stays just the
// business identity plus the demo-mode notice.
export function Topbar({
  business,
  demoMode,
  dict,
}: {
  business: Business;
  demoMode: boolean;
  dict: Dictionary["dashboard"];
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background/60 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium">{business.name}</p>
        <p className="text-xs text-muted">{business.contact_email}</p>
      </div>
      {demoMode && <Badge tone="amber">{dict.demoModeBadge}</Badge>}
    </header>
  );
}
