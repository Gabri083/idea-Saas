import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ImpactCalculator } from "@/components/landing/impact-calculator";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const t = dict.home;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function Home() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Kelsira",
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Kelsira",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: locale,
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar dict={dict.nav} locale={locale} />
      <main className="flex-1">
        <Hero dict={dict.hero} />
        <ProblemSolution dict={dict.problemSolution} />
        <HowItWorks dict={dict.howItWorks} />
        <ImpactCalculator dict={dict.impactCalculator} />
        <Pricing dict={dict.pricing} />
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
