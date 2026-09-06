import { WidgetGuides } from "@/components/dashboard/widget-guides";
import { requireBusinessId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function GuidesPage() {
  const businessId = await requireBusinessId();
  const dict = await getDictionary();
  const t = dict.dashboard.guides;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.pageSubtitle}</p>
      </div>

      <WidgetGuides businessId={businessId} layoutNames={dict.dashboard.widget.layoutOptions} dict={t} />
    </div>
  );
}
