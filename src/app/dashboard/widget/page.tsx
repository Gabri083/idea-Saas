import { WidgetConfigurator } from "@/components/dashboard/widget-configurator";
import { getReviews, getWidgetConfig } from "@/lib/data";
import { DEMO_BUSINESS_ID } from "@/lib/demo";

export default async function WidgetPage() {
  const [config, reviews] = await Promise.all([
    getWidgetConfig(DEMO_BUSINESS_ID),
    getReviews(DEMO_BUSINESS_ID),
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

      <WidgetConfigurator
        businessId={DEMO_BUSINESS_ID}
        initialConfig={config}
        reviews={publicReviews}
      />
    </div>
  );
}
