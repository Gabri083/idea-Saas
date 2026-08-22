import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export function UpgradeGate({
  title,
  description,
  viewPlansLabel,
}: {
  title: string;
  description: string;
  viewPlansLabel: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cobalt/15 text-cobalt">
        <Sparkles size={20} />
      </span>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="max-w-md text-sm text-muted">{description}</p>
      <LinkButton href="/dashboard/settings" className="mt-2">
        {viewPlansLabel}
      </LinkButton>
    </Card>
  );
}
