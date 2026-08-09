import { WidgetConfigurator } from "@/components/dashboard/widget-configurator";
import { getReviews, getWidgetConfig } from "@/lib/data";
import { requireBusinessId } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { CopyableLink } from "@/components/dashboard/copyable-link";

export default async function WidgetPage() {
  const businessId = await requireBusinessId();
  const [config, reviews] = await Promise.all([
    getWidgetConfig(businessId),
    getReviews(businessId),
  ]);

  const publicReviews = reviews.filter((r) => r.status === "published" || r.status === "resolved");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Widget embebible</h1>
        <p className="mt-1 text-sm text-muted">
          Configura el estilo, previsualízalo en vivo y copia el código para tu e-commerce.
        </p>
      </div>

      <Card className="p-5">
        <p className="text-sm font-medium">Tu link público para recibir reseñas</p>
        <p className="mt-1 text-xs text-muted">
          Compártelo con tus clientes (por email, WhatsApp, etc.) para que dejen su reseña.
        </p>
        <div className="mt-3">
          <CopyableLink path={`/review/${businessId}`} />
        </div>
      </Card>

      <WidgetConfigurator
        businessId={businessId}
        initialConfig={config}
        reviews={publicReviews}
      />
    </div>
  );
}
