import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ImpactCalculator } from "@/components/landing/impact-calculator";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSolution />
        <HowItWorks />
        <ImpactCalculator />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
