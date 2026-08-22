import { AdminAppealsList } from "@/components/admin/admin-appeals-list";
import { getAllAppeals } from "@/lib/admin-data";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function AdminAppealsPage() {
  const [appeals, dict] = await Promise.all([getAllAppeals(), getDictionary()]);
  const t = dict.admin;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.appeals.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted">{t.appeals.pageSubtitle}</p>
      </div>

      <AdminAppealsList appeals={appeals} dict={t} />
    </div>
  );
}
