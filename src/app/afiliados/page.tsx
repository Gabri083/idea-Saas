import type { Metadata } from "next";
import { Users, Wallet, Rocket, Mail } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.affiliates.metaTitle, description: dict.affiliates.metaDescription };
}

const stepIcons = [Rocket, Users, Wallet];

export default async function AfiliadosPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.affiliates;
  const mailtoHref =
    `mailto:hola@kelsira.app?subject=${encodeURIComponent(t.mailtoSubject)}` +
    `&body=${encodeURIComponent(t.mailtoBody)}`;

  return (
    <>
      <Navbar dict={dict.nav} locale={locale} />
      <main className="flex-1 bg-grid">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-cobalt/30 bg-cobalt/10 px-3 py-1 text-xs font-medium text-cobalt">
            {t.badge}
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{t.heroTitle}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{t.heroSubtitle}</p>
          <a
            href={mailtoHref}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cobalt px-6 py-3.5 text-base font-medium text-white shadow-[0_0_0_1px_rgba(79,124,255,0.4),0_8px_24px_-8px_rgba(79,124,255,0.5)] transition-all hover:bg-cobalt-dim"
          >
            <Mail size={17} />
            {t.applyCta}
          </a>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {t.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <Card key={step.title} className="p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 font-medium">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.body}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-8">
            <h2 className="text-lg font-medium">{t.faqTitle}</h2>
            <div className="mt-6 flex flex-col gap-6">
              {t.faq.map((item) => (
                <div key={item.q}>
                  <p className="font-medium">{item.q}</p>
                  <p className="mt-1 text-sm text-muted">{item.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
