import Link from "next/link";
import { Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PlanUsageCard({ used, cap }: { used: number; cap: number | null }) {
  if (cap == null) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
          <Gauge size={17} />
        </span>
        <div>
          <p className="text-sm font-medium">Reseñas ilimitadas este mes</p>
          <p className="text-xs text-muted">Tu plan no tiene límite mensual.</p>
        </div>
      </Card>
    );
  }

  const pct = Math.min(100, Math.round((used / cap) * 100));
  const atCap = used >= cap;
  const nearCap = pct >= 80;
  const barTone = atCap ? "bg-rose" : nearCap ? "bg-amber" : "bg-cobalt";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge size={16} className={cn(atCap ? "text-rose" : nearCap ? "text-amber" : "text-cobalt")} />
          <p className="text-sm font-medium">Uso de tu plan este mes</p>
        </div>
        <span className="text-sm text-muted">
          {used} de {cap} reseñas
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full transition-all", barTone)} style={{ width: `${pct}%` }} />
      </div>
      {atCap ? (
        <p className="mt-2 text-xs text-rose">
          Alcanzaste el límite de tu plan — las nuevas reseñas no se recibirán hasta el próximo mes.{" "}
          <Link href="/dashboard/settings" className="underline">
            Actualizar plan
          </Link>
        </p>
      ) : nearCap ? (
        <p className="mt-2 text-xs text-amber">
          Te estás acercando al límite de tu plan.{" "}
          <Link href="/dashboard/settings" className="underline">
            Ver planes
          </Link>
        </p>
      ) : null}
    </Card>
  );
}
