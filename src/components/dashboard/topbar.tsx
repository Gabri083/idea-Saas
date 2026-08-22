import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/dashboard/logout-button";
import type { Business } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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
      <div className="flex items-center gap-2">
        {demoMode && <Badge tone="amber">{dict.demoModeBadge}</Badge>}
        <Badge tone="cobalt">
          {dict.planPrefix} {dict.planLabels[business.plan]}
        </Badge>
        {!demoMode && <LogoutButton label={dict.logout} />}
      </div>
    </header>
  );
}
