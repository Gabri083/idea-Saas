import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { LogoMark } from "@/components/brand/logo-mark";
import { getDictionary } from "@/lib/i18n/get-locale";

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary();
  const links = dict.footer.columns.legal.links;
  return (
    <>
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <LogoMark size={32} />
            Kelsira
          </Link>
          <nav className="hidden gap-6 text-sm text-muted sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-grid">
        <div className="mx-auto max-w-3xl px-6 py-16">{children}</div>
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
