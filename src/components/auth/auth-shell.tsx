import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="site-light flex flex-1 flex-col items-center bg-background px-4 py-16 text-foreground sm:py-24">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 text-sm font-extrabold tracking-tight">
          <LogoMark size={28} />
          Kelsira
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>

          <div className="mt-6">{children}</div>

          {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
        </div>
      </div>
    </main>
  );
}
