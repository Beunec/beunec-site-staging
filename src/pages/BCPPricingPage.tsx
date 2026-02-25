"use client";

import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { PricingHero } from "@/sections/pricing/PricingHero";
import { PricingCards } from "@/sections/pricing/PricingCards";
import { FeatureComparison } from "@/sections/pricing/FeatureComparison";
import { PricingCalculator } from "@/sections/pricing/PricingCalculator";
import { PricingFAQ } from "@/sections/pricing/PricingFAQ";
import { PricingCTA } from "@/sections/pricing/PricingCTA";

export function BCPPricingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-beunec-blue origin-left z-[100]"
        style={{ scaleX }}
      />
      
      <Header />
      
      <main className="overflow-hidden">
        <PricingHero />
        <PricingCards />
        <FeatureComparison />
        <PricingCalculator />
        <PricingFAQ />
        <PricingCTA />
      </main>
      
      <Footer />
    </div>
  );
}

export default BCPPricingPage;
