import Link from "next/link";
import { ShieldAlert, ShieldQuestion, History } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const dict = await getDictionary();
  const t = dict.admin;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-amber/30 bg-amber/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber" />
          <span className="text-sm font-semibold">{t.badge}</span>
          <span className="text-xs text-muted">{t.notVisible}</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/appeals" className="flex items-center gap-1.5 text-muted hover:text-foreground">
            <ShieldQuestion size={14} /> {t.navAppeals}
          </Link>
          <Link href="/admin/calibration" className="flex items-center gap-1.5 text-muted hover:text-foreground">
            <History size={14} /> {t.navCalibration}
          </Link>
        </nav>
      </header>
      <main className="flex-1 bg-background px-6 py-8">{children}</main>
    </div>
  );
}
