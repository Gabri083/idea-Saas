import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ImpactCalculator } from "@/components/landing/impact-calculator";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";

export default async function Home() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <>
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
