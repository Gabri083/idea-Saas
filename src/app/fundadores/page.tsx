import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { FoundersForm } from "@/components/founders/founders-form";
import { getFounderStatus } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.founders.metaTitle, description: dict.founders.metaDescription };
}

export default async function FundadoresPage() {
  const [dict, locale, status] = await Promise.all([getDictionary(), getLocale(), getFounderStatus()]);
  const t = dict.founders;
  const isFew = !status.soldOut && status.remaining <= 10;

  return (
    <>
      <Navbar dict={dict.nav} locale={locale} />
      <main className="flex-1 bg-grid">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
          <span className="inline-flex items-center rounded-full border border-cobalt/30 bg-cobalt/10 px-3 py-1 text-xs font-medium text-cobalt">
            {t.badge}
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t.subtitle}</p>

          <div className="mx-auto mt-10 grid max-w-md grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-surface/70 backdrop-blur">
            <div className="px-3 py-5">
              <p className="text-2xl font-semibold tracking-tight text-cobalt">30%</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{t.statDiscount}</p>
            </div>
            <div className="px-3 py-5">
              <p className="text-2xl font-semibold tracking-tight text-cobalt">6</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{t.statMonths}</p>
            </div>
            <div className="px-3 py-5">
              <p className="text-2xl font-semibold tracking-tight text-cobalt">40</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{t.statCap}</p>
            </div>
          </div>

          {!status.soldOut && (
            <p className={"mt-5 text-sm font-medium " + (isFew ? "text-amber" : "text-muted")}>
              {isFew ? t.spotsFew + " " : ""}
              {t.spotsRemaining.replace("{n}", String(status.remaining)).replace("{cap}", String(status.cap))}
            </p>
          )}

          <div className="mx-auto mt-8 max-w-lg text-left">
            <FoundersForm dict={t} soldOut={status.soldOut} locale={locale} />
          </div>
        </section>
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
