import Link from "next/link";
import { ShieldAlert, ShieldQuestion, History } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-amber/30 bg-amber/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber" />
          <span className="text-sm font-semibold">Panel interno de Veris</span>
          <span className="text-xs text-muted">— no visible para los negocios</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/appeals" className="flex items-center gap-1.5 text-muted hover:text-foreground">
            <ShieldQuestion size={14} /> Apelaciones
          </Link>
          <Link href="/admin/calibration" className="flex items-center gap-1.5 text-muted hover:text-foreground">
            <History size={14} /> Calibración
          </Link>
        </nav>
      </header>
      <main className="flex-1 bg-background px-6 py-8">{children}</main>
    </div>
  );
}
